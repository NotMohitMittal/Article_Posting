/**
 * src/controllers/image.controller.js
 */
const imagekit = require("../utils/imagekit.server");

const uploadImage = async (req, res) => {
  try {
    let fileData;
    let fileName;
    let folder = req.body.folder || "/articles/inline";

    if (req.file) {
      fileData = req.file.buffer;
      fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;
    } else if (req.body.base64 && req.body.fileName) {
      fileData = req.body.base64; 
      fileName = `${Date.now()}-${req.body.fileName}`;
    } else {
      return res.status(400).json({ message: "No image data provided" });
    }

    const response = await imagekit.upload({
      file: fileData,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: false, 
      tags: ["studyhub", "article"],
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      url: response.url,
      fileId: response.fileId,
      filePath: response.filePath,
      name: response.name,
      width: response.width,
      height: response.height,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

const deleteImage = async (req, res) => {
  const { fileId } = req.params;
  if (!fileId) return res.status(400).json({ message: "fileId is required" });

  try {
    await imagekit.deleteFile(fileId);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("ImageKit delete error:", error);
    res.status(500).json({ message: "Image deletion failed", error: error.message });
  }
};

const getAuthParams = (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json(authParams);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res.status(500).json({ message: "Failed to generate auth params" });
  }
};

module.exports = { uploadImage, deleteImage, getAuthParams };