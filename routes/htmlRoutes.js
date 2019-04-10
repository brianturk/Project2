const db = require("../models");
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = app => {
  // Load signup page
  app.get("/", (req, res) => res.render("users/signup"));

  // Load login page
  app.get("/login", (req, res) => res.render("users/login"));

  // Load profile page
  app.get("/profile", isAuthenticated, (req, res) => {
    db.User.findOne({
      where: {
        id: req.user.id
      },
      include: [db.Example]
    }).then(dbUser => {
      res.render("users/profile", { user: dbUser });
    });
  });

  // Load story page
  app.get("/story/:storyId", isAuthenticated, (req, res) => {
    db.Paragraph.findAll({
      where: {
        storyId: req.params.storyId
      },
      include: [db.User]
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
        var turnsLeft = story.totalTurns - turnUser.numEntries;

        turnUser.turnsLeft = turnsLeft;

        if (turnUser.userId === req.user.id) {
          turnUser.isTurn = true;
        } else {
          turnUser.isTurn = false;
        }

        var x = 0;
        paragraphs.forEach(function(value, key) {
          // var randomColor = Math.floor(Math.random() * colors.length)

          if (x === colors.length) { x = 0}
          paragraphs[key].color = colors[key];
          x++;

        })

        const hbsObject = {
          paragraphs: paragraphs,
          story: story,
          turn: turnUser
        };

        console.log(hbsObject);
        res.render("users/story", hbsObject);
      });
    });
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

  // Load example page and pass in an example by id
  app.get("/example/:id", isAuthenticated, (req, res) => {
    db.Example.findOne({ where: { id: req.params.id } }).then(dbExample => {
      res.render("example", {
        example: dbExample
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", (req, res) => res.render("404"));
};


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
                      storyPassdb.Contributors as a
                        left join
                      (select
                          b.storyId,
                          c.email,
                                c.firstName,
                          count(*) as numEntries
                        from
                          storyPassdb.Paragraphs as b
                            left join
                          storyPassdb.Users as c
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
        resolve(data);
      })
  });
}