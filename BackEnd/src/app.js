const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const subjectRouter = require("./routes/subject.routes");
const articleRouter = require("./routes/article.routes");
const imageRouter = require("./routes/image.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/user", userRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/article", articleRouter);
app.use("/api/image", imageRouter);

module.exports = app;
