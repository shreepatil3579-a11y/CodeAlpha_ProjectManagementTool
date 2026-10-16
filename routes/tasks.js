const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


// ========================================
// CREATE TASK
// ========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const {
            title,
            description,
            project,
            assignedTo,
            status,
            priority,
            dueDate
        } = req.body;


        if (!title || !project) {

            return res.status(400).json({

                message:
                    "Task title and project are required."

            });

        }


        const projectData =
            await Project.findById(project);


        if (!projectData) {

            return res.status(404).json({

                message:
                    "Project not found."

            });

        }


        const isMember =
            projectData.members.some(

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


        const task = await Task.create({

            title: title.trim(),

            description:
                description
                    ? description.trim()
                    : "",

            project: project,

            assignedTo:
                assignedTo || null,

            status:
                status || "Todo",

            priority:
                priority || "Medium",

            dueDate:
                dueDate || null,

            createdBy:
                req.user.id

        });


        const populatedTask =
            await Task.findById(task._id)

                .populate(
                    "assignedTo",
                    "username email"
                )

                .populate(
                    "createdBy",
                    "username email"
                );


        res.status(201).json({

            message:
                "Task created successfully.",

            task:
                populatedTask

        });


    } catch (error) {

        console.error(
            "CREATE TASK ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                "Failed to create task.",

            error:
                error.message

        });

    }

});


// ========================================
// GET PROJECT TASKS
// ========================================

router.get(
    "/project/:projectId",
    authMiddleware,
    async (req, res) => {

        try {

            const project =
                await Project.findById(
                    req.params.projectId
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


            const tasks =
                await Task.find({

                    project:
                        req.params.projectId

                })

                .populate(
                    "assignedTo",
                    "username email"
                )

                .populate(
                    "createdBy",
                    "username email"
                )

                .sort({
                    createdAt: -1
                });


            res.json({

                tasks:
                    tasks

            });


        } catch (error) {

            console.error(
                "GET TASKS ERROR:",
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to fetch tasks.",

                error:
                    error.message

            });

        }

    }
);


// ========================================
// UPDATE TASK
// ========================================

router.put(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.id
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


            const {
                title,
                description,
                assignedTo,
                status,
                priority,
                dueDate
            } = req.body;


            if (title !== undefined) {
                task.title = title.trim();
            }

            if (description !== undefined) {
                task.description =
                    description.trim();
            }

            if (assignedTo !== undefined) {
                task.assignedTo =
                    assignedTo || null;
            }

            if (status !== undefined) {
                task.status = status;
            }

            if (priority !== undefined) {
                task.priority = priority;
            }

            if (dueDate !== undefined) {
                task.dueDate =
                    dueDate || null;
            }


            await task.save();


            const updatedTask =
                await Task.findById(task._id)

                .populate(
                    "assignedTo",
                    "username email"
                )

                .populate(
                    "createdBy",
                    "username email"
                );


            res.json({

                message:
                    "Task updated successfully.",

                task:
                    updatedTask

            });


        } catch (error) {

            console.error(
                "UPDATE TASK ERROR:",
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to update task.",

                error:
                    error.message

            });

        }

    }
);


// ========================================
// DELETE TASK
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.id
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


            await Task.findByIdAndDelete(
                req.params.id
            );


            res.json({

                message:
                    "Task deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE TASK ERROR:",
                error.message
            );

            res.status(500).json({

                message:
                    "Failed to delete task.",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;