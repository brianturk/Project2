const db = require("../models");
const passport = require("../config/passport");
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = app => {
  // Get all examples
  app.get("/api/examples", isAuthenticated, (req, res) => {
    db.Example.findAll({
      where: {
        UserId: req.user.id
      }
    }).then(dbExamples => {
      res.json(dbExamples);
    });
  });

  // Create a new example
  app.post("/api/examples", isAuthenticated, (req, res) => {
    db.Example.create({
      UserId: req.user.id,
      text: req.body.text,
      description: req.body.description
    }).then(dbExample => {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", isAuthenticated, (req, res) => {
    db.Example.destroy({ where: { id: req.params.id } }).then(dbExample => {
      res.json(dbExample);
    });
  });

  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/profile");
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    console.log(req.body);
    db.User.create({
      firstName: req.body.firstName,
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(422).json(err.errors[0].message);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });


  app.post("/api/createStory", isAuthenticated, (req, res) => {
    var friends = JSON.parse(req.body.friends);
    db.Story.create({
      title: req.body.title,
      creatorId: req.user.id,
      nextUserId: 0,
      totalCharacters: req.body.totalChar,
      totalTurns: req.body.totalTurn,
      storyCompleted: false
    })
      .then(data => {
        var storyId = data.id;
        db.Paragraph.create({
          storyId: storyId,
          userId: req.user.id,
          content: req.body.firstParagraph
        }).then(data => {
          friends.forEach(async function (value) {
            var userId = await getUser(value);
            var finished = await addUser(userId, value, storyId);
          })
          res.redirect(307, "/api/stories");
        })
      })
      .catch(err => {
        console.log(err);
        // res.status(422).json(err.errors[0].message);
      });
  });
};

function getUser(email) {
  return new Promise(async function (resolve, reject) {
    db.User.findOne({
      where: {
        email: email
      }
    }).then(data => {
      console.log(data);
      if (data) {
        resolve(data.id);
      } else {
        resolve(0);
      }
    });
  })
}

function addUser(id, email, storyId) {
  return new Promise(async function (resolve, reject) {
    if (id === 0) {
      var hasSignedUp = false;
    } else {
      var hasSignedUp = true;
    }
    db.Contributor.create({
      storyId: storyId,
      userId: id,
      userEmail: email,
      hasSignedUp: hasSignedUp,
      userOrderNum: 0,
      left: false,
      archived: false
    })
      .then(data => {
        resolve(true);
      })
      .catch((err) => {
        console.log(err);
        resolve(true)
      })
  });
}

