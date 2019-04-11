const db = require("../models");
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = app => {
  // Load signup page
  app.get("/", isAuthenticated, (req, res) => res.redirect("/users/stories"));

  // Load login page
  app.get("/login", (req, res) => res.render("users/login"));

    // Load login page
    app.get("/signup", (req, res) => res.render("users/signup"));

  // Load profile page
  app.get("/profile", isAuthenticated, (req, res) => {
    db.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(dbUser => {
      res.render("users/home", { user: dbUser });
    });
  });


  // Load story page
  app.get("/story/:storyId", isAuthenticated, (req, res) => {
    //first we need to see if this user is authorized to see this story.  If not, then send them back to their list of stories.
    db.Contributor.findOne({
      where: {
        userId: req.user.id,
        storyId: req.params.storyId
      }
    })
      .then(data => {
        if (data) {

          db.Paragraph.findAll({
            where: {
              storyId: req.params.storyId
            },
            include: [db.User],
            order: [['createdAt', 'ASC']]
          }).then(data => {

            data = data.map(a => a.get({ plain: true }));
            var paragraphs = data;
            var storyId = data[0].storyId;
            db.Story.findOne({
              where: {
                id: storyId
              }
            }).then(async data => {
              var story = data;

              var colors = [
                "bg-dark",
                "bg-primary",
                "bg-secondary",
                "bg-success",
                "bg-danger",
                "bg-warning",
                "bg-info"
              ];
              //figure whose turn it is
              var turnUser = await getTurn(storyId);
              var userOrderNumber = turnUser.userOrderNum;
              var turnsLeft = story.totalTurns - turnUser.numEntries;

              if (userOrderNumber === 0) {  //person hasn't been assigned an order yet.  Give them the next order.
                var updateTurn = await setTurn(storyId, req.user.id);
              }

              turnUser.turnsLeft = turnsLeft;

              if (turnUser.userId === req.user.id) {
                turnUser.isTurn = true;
              } else {
                turnUser.isTurn = false;
              }

              var x = 0;
              paragraphs.forEach(function (value, key) {
                // var randomColor = Math.floor(Math.random() * colors.length)

                if (x === colors.length) { x = 0 }
                paragraphs[key].color = colors[key];
                x++;

              })

              const hbsObject = {
                paragraphs: paragraphs,
                story: story,
                turn: turnUser,
                user: req.user
              };

              console.log(hbsObject);
              res.render("users/story", hbsObject);
            });
          });

        } else {
          res.redirect(307, "/profile");
        }

      })
  });


  //Load story page
  app.get("/users/stories", isAuthenticated, (req, res) => {
    db.sequelize.query(`SELECT 
                          a.storyId,
                            a.userId,
                            a.userEmail,
                            a.userOrderNum,
                            b.title,
                            b.storyCompleted,
                            b.totalTurns,
                            b.totalCharacters,
                            b.creatorId,
                            c.email,
                            c.firstName,
                            b.createdAt
                        FROM 
                          Contributors as a
                            left join
                          Stories as b
                            on
                            a.storyId = b.id
                                left join
                          Users as c
                            on
                                b.creatorId = c.id
                        where
                            a.userId = ${req.user.id}
                        order by
                            b.createdAt DESC`, { type: db.sequelize.QueryTypes.SELECT })
            .then(data => {
              var hbsOject;

              if(data) {
                hbsObject = {
                  stories: data,
                  header: data[0],
                  user: req.user
                };
                console.log(hbsObject);
              } else {
                hbsObject = {
                  stories: [],
                  header: "",
                  user: req.user
                }
              }
              res.render("users/stories", hbsObject);
            })
  });



  // Load profile page
  app.get("/create", isAuthenticated, (req, res) => {
    db.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(data => {
      // console.log(data);
      res.render("users/create", { user: data });
    });
  });

  // // Load example page and pass in an example by id
  // app.get("/example/:id", isAuthenticated, (req, res) => {
  //   db.Example.findOne({ where: { id: req.params.id } }).then(dbExample => {
  //     res.render("example", {
  //       example: dbExample
  //     });
  //   });
  // });

  // Render 404 page for any unmatched routes
  app.get("*", (req, res) => res.render("404"));
};

function setTurn(storyId, userId) {
  return new Promise(async function (resolve, reject) {
    //get max turn number
    db.sequelize.query(`select max(userOrderNum) as maxOrderNum from Contributors
                        where storyId = ${storyId}`, { type: db.sequelize.QueryTypes.SELECT })
      .then(data => {
        data = data[0];
        var nextOrder = data.maxOrderNum + 1;

        db.Contributor.update({
          userOrderNum: nextOrder
        },
          {
            where: {
              storyId: storyId,
              userId: userId
            }
          })
          .then(data => resolve(true))
      })
  })
}




function getTurn(storyId) {
  return new Promise(async function (resolve, reject) {
    db.sequelize.query(`SELECT
                      a.storyId,
                      a.userId,
                        a.userEmail,
                        a.userOrderNum,
                        b.firstName,
                      ifnull(numEntries,0) as numEntries
                    FROM 
                      Contributors as a
                        left join
                      (select
                          b.storyId,
                          c.email,
                                c.firstName,
                          count(*) as numEntries
                        from
                          Paragraphs as b
                            left join
                          Users as c
                            on
                            b.userId = c.id
                        where
                          b.storyId = ${storyId}
                        group by
                          b.storyId,
                          c.email,
                                c.firstName) as b
                        on
                        a.storyId = b.storyId
                        and a.userEmail = b.email
                    where
                      a.storyId = ${storyId}
                    order by
                      ifnull(numEntries,0),
                        userOrderNum
                    limit 1`, { type: db.sequelize.QueryTypes.SELECT })
      .then(data => {
        data = data[0];
        console.log(data);
        resolve(data);
      })
  });
}