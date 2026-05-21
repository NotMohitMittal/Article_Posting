require("dotenv").config();
const path = require("path");
const express = require("express");

const server = require("./src/app");
const connectDB = require("./src/DB/db");

const __dirname = path.resolve();

connectDB();

if (process.env.ENVIRONMENT === "production") {
  app.use(express.static(path.join(__dirname, "/FrontEnd/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "FrontEnd", "dist", "index.html"));
  });
}

server.listen(process.env.PORT, () => {
  console.log("Server running ");
});
