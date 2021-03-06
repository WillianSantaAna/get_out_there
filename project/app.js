const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/usersRoutes");
const countriesRouter = require("./routes/countriesRoutes");
const teamsRouter = require("./routes/teamsRoutes");
const circuitsRouter = require("./routes/circuitsRoutes");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/circuits", circuitsRouter);

module.exports = app;
