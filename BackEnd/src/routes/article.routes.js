const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const articleController = require("../controllers/article.controller");

const router = express.Router();

router.post(
  "/create-article",
  authMiddleware.validateLogin,
  [
    body("article_title").notEmpty().withMessage("Article title is required"),
    body("article_content")
      .notEmpty()
      .withMessage("Article content is required"),
    body("article_subject")
      .notEmpty()
      .withMessage("Article subject is required"),
    body("article_tags")
      .isArray({ min: 1 })
      .withMessage("At least one tag is required"),
  ],
  authMiddleware.validateUserInput,
  articleController.createArticle,
);

router.delete(
  "/delete/:articleId",
  authMiddleware.validateLogin,
  articleController.deleteArticle,
);

router.get(
  "/articles",
  authMiddleware.validateLogin,
  articleController.getArticles,
);

router.get(
  "/subject-wise/article/:subjectSlug",
  authMiddleware.validateLogin,
  articleController.getArticlesSubjectWise,
);

router.get(
  "/read-article/:articleId",
  authMiddleware.validateLogin,
  articleController.readArticle,
);

module.exports = router;
