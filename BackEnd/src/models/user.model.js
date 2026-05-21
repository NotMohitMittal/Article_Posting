const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_password: {
      type: String,
      required: true,
      select: false,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("user_password")) {
    return;
  }
  this.user_password = await bcrypt.hash(this.user_password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.user_password);
};

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.user_password;
    delete ret.__v;
    return ret; 
  },
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
