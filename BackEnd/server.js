require("dotenv").config();
const path = require("path");
const express = require("express");

const app = require("./src/app");
const connectDB = require("./src/DB/db");

connectDB();

if (process.env.ENVIRONMENT === "production") {
  // Use ".." to step out of the BackEnd folder and into the FrontEnd folder
  const frontendPath = path.join(__dirname, "..", "FrontEnd", "dist");

  app.use(express.static(frontendPath));

  app.get((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
