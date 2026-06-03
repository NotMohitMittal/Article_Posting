const mongoose = require("mongoose");

const articleSchema = mongoose.Schema(
  {
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

    // ── ImageKit stored images ──────────────────────────────────────────────
    // Cover / hero image for the article (optional)
    cover_image: {
      url: { type: String, default: null }, // ImageKit delivery URL
      fileId: { type: String, default: null }, // ImageKit fileId (for deletion)
      filePath: { type: String, default: null }, // path inside ImageKit (e.g. /articles/...)
    },
    // Inline images embedded in article_content are stored as ImageKit URLs
    // directly inside the HTML — no separate array needed. The fileIds are
    // stored here so we can bulk-delete them when the article is removed.
    inline_image_ids: [
      {
        type: String, // ImageKit fileId
      },
    ],

    is_published: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

articleSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Article", articleSchema);
