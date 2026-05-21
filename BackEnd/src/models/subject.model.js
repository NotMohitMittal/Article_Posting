const mongoose = require("mongoose");

const subjectSchema = mongoose.Schema(
  {
    subject_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject_description: {
      type: String,
    },
    subject_slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);



subjectSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret; 
  },
});


module.exports = mongoose.model("Subject", subjectSchema);
