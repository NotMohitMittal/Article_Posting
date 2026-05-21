const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  article_title: {
    type: String,
    required: true,
    trim: true,
  },
  article_content: {
    type: String,
    required: true,
  },
  article_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  article_author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  article_tags: [
    {
      type: String,
    },
  ],
  article_slug: {
    type: String,
    unique: true,
  },
  is_published: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps : true,
});



articleSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret; 
  },
});



module.exports = mongoose.model("Article", articleSchema);
