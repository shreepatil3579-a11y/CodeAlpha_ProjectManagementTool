const express = require("express");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


// ========================================
// CREATE PROJECT
// ========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const { name, description } = req.body;

        if (!name || name.trim() === "") {

            return res.status(400).json({
                message: "Project name is required."
            });

        }

        const project = await Project.create({

            name: name.trim(),

            description: description
                ? description.trim()
                : "",

            owner: req.user.id,

            members: [req.user.id]

        });

        res.status(201).json({

            message: "Project created successfully.",

            project: project

        });

    } catch (error) {

        console.error(
            "CREATE PROJECT ERROR:",
            error.message
        );

        res.status(500).json({

            message: "Failed to create project.",

            error: error.message

        });

    }

});


// ========================================
// GET MY PROJECTS
// ========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const projects = await Project.find({

            members: req.user.id

        })
        .populate(
            "owner",
            "username email"
        )
        .populate(
            "members",
            "username email"
        )
        .sort({
            createdAt: -1
        });


        res.json({

            projects: projects

        });

    } catch (error) {

        console.error(
            "GET PROJECTS ERROR:",
            error.message
        );

        res.status(500).json({

            message: "Failed to fetch projects.",

            error: error.message

        });

    }

});


// ========================================
// GET SINGLE PROJECT
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {

    try {

        const project = await Project.findById(
            req.params.id
        )
        .populate(
            "owner",
            "username email"
        )
        .populate(
            "members",
            "username email"
        );


        if (!project) {

            return res.status(404).json({

                message: "Project not found."

            });

        }


        const isMember = project.members.some(

            member =>
                member._id.toString() ===
                req.user.id.toString()

        );


        if (!isMember) {

            return res.status(403).json({

                message:
                    "You are not a member of this project."

            });

        }


        res.json({

            project: project

        });

    } catch (error) {

        console.error(
            "GET SINGLE PROJECT ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                "Failed to fetch project.",

            error: error.message

        });

    }

});


// ========================================
// DELETE PROJECT
// ========================================

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const project = await Project.findById(
            req.params.id
        );


        if (!project) {

            return res.status(404).json({

                message: "Project not found."

            });

        }


        if (
            project.owner.toString() !==
            req.user.id.toString()
        ) {

            return res.status(403).json({

                message:
                    "Only project owner can delete this project."

            });

        }


        await Project.findByIdAndDelete(
            req.params.id
        );


        res.json({

            message:
                "Project deleted successfully."

        });

    } catch (error) {

        console.error(
            "DELETE PROJECT ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                "Failed to delete project.",

            error: error.message

        });

    }

});


module.exports = router;