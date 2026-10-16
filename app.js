const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const commentRoutes = require("./routes/comments");

dotenv.config();

const app = express();

const server = http.createServer(app);


// ========================================
// SOCKET.IO
// ========================================

const io = new Server(server, {

    cors: {
        origin: "*"
    }

});


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());

app.use(express.static("public"));


// ========================================
// API ROUTES
// ========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/projects",
    projectRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);

app.use(
    "/api/comments",
    commentRoutes
);


// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {

    res.json({

        message:
            "CodeAlpha Project Management API running"

    });

});


// ========================================
// SOCKET CONNECTION
// ========================================

io.on("connection", (socket) => {

    console.log(
        "User connected:",
        socket.id
    );


    socket.on(
        "disconnect",
        () => {

            console.log(
                "User disconnected:",
                socket.id
            );

        }
    );

});


// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected"
        );


        server.listen(
            process.env.PORT,
            () => {

                console.log(
                    "Server running on http://localhost:" +
                    process.env.PORT
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection error:",
            error.message
        );

    });