require("dotenv").config();
const path = require("path");
const express = require("express");

const app = require("./src/app");
const connectDB = require("./src/DB/db");

connectDB();

if (process.env.ENVIRONMENT === "production") {
<<<<<<< HEAD
  // Use ".." to step out of the BackEnd folder and into the FrontEnd folder
  const frontendPath = path.join(__dirname, "..", "FrontEnd", "dist");
  
  app.use(express.static(frontendPath));

  app.get((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
=======
  app.use(express.static(path.join(__dirname, "FrontEnd", "dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "FrontEnd", "dist", "index.html"));
>>>>>>> 12d0d7c8ef3817a4d8740256bccf0d7bdf1bb21c
  });
}
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> 12d0d7c8ef3817a4d8740256bccf0d7bdf1bb21c
