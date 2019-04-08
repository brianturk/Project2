require("dotenv").config();
const express = require("express");
const session = require("express-session");
const exphandlebars = require("express-handlebars");
const path = require("path");

const db = require("./models");

const app = express();
const PORT = process.env.PORT || 8080;
const morgan = require("morgan");

// Requiring passport as we've configured it
const passport = require("./config/passport");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Morgan will any HTTP request to the terminal
app.use(morgan("dev"));

// We need to use sessions to keep track of our user's login status
app.use(
  session({
    secret: process.env.SERVER_SECRET,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Handlebars
const handlebars = exphandlebars.create({
  extname: "handlebars",
  layoutsDir: path.join(__dirname, "views/layouts"),
  defaultLayout: "main",
  helpers: path.join(__dirname, "/helpers"),
  partialsDir: path.join(__dirname, "views/partials")
});

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");


// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

const syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = false;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(() => {
  app.listen(PORT, () => {
    console.log(
      `App is running on PORT: ${PORT}. Go to http://localhost:${PORT}`
    );
  });
});

module.exports = app;
