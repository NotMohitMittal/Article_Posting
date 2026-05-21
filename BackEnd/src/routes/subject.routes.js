const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const subjectController = require("../controllers/subject.controller");

const router = express.Router();

router.post(
  "/add-subject",
  authMiddleware.validateLogin,
  subjectController.addSubject,
);
router.delete(
  "/delete/:subjectId",
  authMiddleware.validateLogin,
  subjectController.deleteSubject,
);

router.get(
  "/subjectList",
  authMiddleware.validateLogin,
  subjectController.getSubjectList,
);

module.exports = router;
