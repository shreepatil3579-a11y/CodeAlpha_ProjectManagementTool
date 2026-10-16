const express = require("express");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


// ========================================
// ADD COMMENT
// ========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            text,
            task
        } = req.body;


        if (!text || !task) {

            return res.status(400).json({

                message:
                    "Comment text and task are required."

            });

        }


        const taskData =
            await Task.findById(task);


        if (!taskData) {

            return res.status(404).json({

                message:
                    "Task not found."

            });

        }


        const project =
            await Project.findById(
                taskData.project
            );


        if (!project) {

            return res.status(404).json({

                message:
                    "Project not found."

            });

        }


        const isMember =
            project.members.some(

                member =>
                    member.toString() ===
                    req.user.id.toString()

            );


        if (!isMember) {

            return res.status(403).json({

                message:
                    "You are not a member of this project."

            });

        }


        const comment =
            await Comment.create({

                text: text.trim(),

                task: task,

                user: req.user.id

            });


        const populatedComment =
            await Comment.findById(
                comment._id
            )
            .populate(
                "user",
                "username email"
            );


        res.status(201).json({

            message:
                "Comment added successfully.",

            comment:
                populatedComment

        });


    } catch (error) {

        console.error(
            "ADD COMMENT ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                "Failed to add comment.",

            error:
                error.message

        });

    }

});


// ========================================
// GET TASK COMMENTS
// ========================================

router.get(
    "/task/:taskId",
    authMiddleware,
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.taskId
                );


            if (!task) {

                return res.status(404).json({

                    message:
                        "Task not found."

                });

            }


            const project =
                await Project.findById(
                    task.project
                );


            if (!project) {

                return res.status(404).json({

                    message:
                        "Project not found."

                });

            }


            const isMember =
                project.members.some(

                    member =>
                        member.toString() ===
                        req.user.id.toString()

                );


            if (!isMember) {

                return res.status(403).json({

                    message:
                        "You are not a member of this project."

                });

            }


            const comments =
                await Comment.find({

                    task:
                        req.params.taskId

                })
                .populate(
                    "user",
                    "username email"
                )
                .sort({
                    createdAt: 1
                });


            res.json({

                comments:
                    comments

            });


        } catch (error) {

            console.error(
                "GET COMMENTS ERROR:",
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to fetch comments.",

                error:
                    error.message

            });

        }

    }
);


// ========================================
// DELETE COMMENT
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const comment =
                await Comment.findById(
                    req.params.id
                );


            if (!comment) {

                return res.status(404).json({

                    message:
                        "Comment not found."

                });

            }


            if (
                comment.user.toString() !==
                req.user.id.toString()
            ) {

                return res.status(403).json({

                    message:
                        "You can only delete your own comment."

                });

            }


            await Comment.findByIdAndDelete(
                req.params.id
            );


            res.json({

                message:
                    "Comment deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE COMMENT ERROR:",
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to delete comment.",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;