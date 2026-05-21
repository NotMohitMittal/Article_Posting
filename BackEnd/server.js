require("dotenv").config();
const path = require("path");
const express = require("express");

const app = require("./src/app");
const connectDB = require("./src/DB/db");

connectDB();

if (process.env.ENVIRONMENT === "production") {
  app.use(express.static(path.join(__dirname, "FrontEnd", "dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "FrontEnd", "dist", "index.html"));
  });
}
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
