const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// ========================================
// REGISTER
// ========================================

router.post("/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        if (!username || !email || !password) {

            return res.status(400).json({
                message:
                    "Username, email and password are required."
            });

        }


        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Username or email already exists."
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = await User.create({

            username: username,

            email: email,

            password: hashedPassword

        });


        res.status(201).json({

            message:
                "Registration successful.",

            user: {

                id: user._id,

                username: user.username,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Registration failed.",

            error: error.message

        });

    }

});


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required."

            });

        }


        const user = await User.findOne({

            email: email

        });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid email or password."

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(400).json({

                message:
                    "Invalid email or password."

            });

        }


        const token = jwt.sign(

            {
                id: user._id.toString(),
                username: user.username
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        res.json({

            message:
                "Login successful.",

            token: token,

            user: {

                id: user._id,

                username: user.username,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Login failed.",

            error: error.message

        });

    }

});


module.exports = router;