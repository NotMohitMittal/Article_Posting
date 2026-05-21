const slugify = require("slugify");
const mongoose = require("mongoose");

const articleModel = require("../models/article.model");
const subjectModel = require("../models/subject.model");

const createArticle = async (req, res) => {
  const { article_title, article_content, article_subject, article_tags } =
    req.body;

  try {
    const subject = await subjectModel.findById(article_subject);

    if (!subject) {
      return res.status(404).json({
        message: "Subject name not found",
      });
    }

    let article_slug = slugify(article_title, {
      lower: true,
      strict: true,
    });

    const existing_slug = await articleModel.findOne({ article_slug });

    if (existing_slug) {
      article_slug = `${article_slug}-${Date.now()}`;
    }

    const article = await articleModel.create({
      article_title,
      article_content,
      article_subject,
      article_author: req.user.id,
      article_tags,
      article_slug,
    });

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const deleteArticle = async (req, res) => {
  const { articleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return res.status(400).json({
      message: "Invalid article ID",
    });
  }

  try {
    const article = await articleModel.findById(articleId);

    if (!article) {
      return res.status(404).json({
        message: "Article wasn't found",
      });
    }

    if (article.article_author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized to delete the article",
      });
    }

    await article.deleteOne();

    res.status(200).json({
      message: "Article deleted successfully",
      article,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const getArticles = async (req, res) => {
  try {
    const articleList = await articleModel
      .find()
      .populate("article_author", "user_name user_email")
      .populate("article_subject", "subject_name subject_slug")
      .sort({ createdAt: -1 });

    if (articleList.length === 0) {
      return res.status(404).json({
        message: "Articles not found",
      });
    }

    res.status(200).json({
      message: "Articles fetched",
      count: articleList.length,
      articleList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const getArticlesSubjectWise = async (req, res) => {
  const { subjectSlug } = req.params;

  try {
    const subject = await subjectModel.findOne({ subject_slug: subjectSlug });

    if (!subject) {
      return res.status(404).json({
        message: "Invalid subject name",
      });
    }

    const articles = await articleModel
      .find({ article_subject: subject._id })
      .populate("article_author", "user_name")
      .populate("article_subject", "subject_name subject_slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Articles fetched",
      articles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "database error",
    });
  }
};

const readArticle = async (req, res) => {
  const { articleId } = req.params;

  try {
    const article = await articleModel.findById(articleId);

    if (!article) {
      return res.status(404).json({
        message: "Invalid article ID",
      });
    }

    res.status(200).json({
      message: "Article fetched",
      article,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

module.exports = {
  createArticle,
  deleteArticle,
  getArticles,
  readArticle,
  getArticlesSubjectWise,
};
