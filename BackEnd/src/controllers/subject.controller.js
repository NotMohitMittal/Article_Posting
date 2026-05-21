const subjectModel = require("../models/subject.model");
const slugify = require("slugify");

const addSubject = async (req, res) => {
  const { subject_name, subject_description } = req.body;

  try {
    const existingSubject = await subjectModel.findOne({ subject_name });

    if (existingSubject) {
      return res.status(409).json({
        message: "Subject already exists",
      });
    }

    const subject_slug = slugify(subject_name, {
      lower: true,
      strict: true,
    });

    const subject = await subjectModel.create({
      subject_name,
      subject_description,
      subject_slug,
    });

    res.status(201).json({
      message: "Subject create successfully",
      subject,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const deleteSubject = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const subject = await subjectModel.findByIdAndDelete(subjectId);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
      subject,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const getSubjectList = async (req, res) => {
  try {
    const subjects = await subjectModel.find().sort({ subject_name: 1 }); // sort the data alphabetically

    if (subjects.length === 0) {
      return res.status(404).json({
        message: "No subjects found",
      });
    }

    res.status(200).json({
      message: "Subjects fetched successfully",
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

module.exports = { addSubject, deleteSubject, getSubjectList };
