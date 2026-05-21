const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const subjectRouter = require("./routes/subject.routes");
const articleRouter = require("./routes/article.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/article", articleRouter);

module.exports = app;
