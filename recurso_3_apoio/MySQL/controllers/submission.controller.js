const db = require("../models/db.js");
const Project = db.project;
const Submission = db.submission;

exports.getAll = async (req, res, next) => {
    try {
        const userId = req.loggedUserId; console.log(userId)
        const projectId = req.params.id; console.log(projectId)
        const condition = { project: projectId }
        let submissions = await Submission.findAll({where: condition}); //console.log(projects)
        res.status(200).json({ success: true, data: submissions });
    }
    catch (err) {
        next(err)
    };
};

exports.postSubmission =  async (req, res, next) => {
    try {
        const userId = req.loggedUserId; //console.log(userId)
        const projectId = req.params.id; //console.log(projectId)

        let condition = { id: projectId }
        let project = await Project.findAll({where: condition}); //console.log(projects)

        condition = { project: projectId }
        let submissions = await Submission.findAndCountAll({where: condition}); console.log(submissions)

        let newSubmission = await Submission.create({
            project: projectId,
            submittedBy: userId,
            status: project.status
        }); //console.log(newSubmission)

        let dataResponse = [
            newSubmission,
            submissions
        ]

        //res.status(201).json({ success: true, data: dataResponse});
    }
    catch (err) {
        next(err)
    }
}