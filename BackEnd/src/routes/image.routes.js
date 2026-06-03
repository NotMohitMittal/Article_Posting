const express = require("express");
const multer = require("multer");
const imageController = require("../controllers/image.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Store file in memory so we can pass the buffer directly to ImageKit
const upload = multer({ storage: multer.memoryStorage() });

// Upload an image (accepts multipart/form-data key: "image")
router.post(
  "/upload",
  authMiddleware.validateLogin,
  upload.single("image"),
  imageController.uploadImage,
);

// Delete an image if the user removes it from the editor before publishing
router.delete(
  "/delete/:fileId",
  authMiddleware.validateLogin,
  imageController.deleteImage,
);

module.exports = router;
