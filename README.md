# CodeAlpha Project Management Tool

A full-stack Project Management Tool developed as part of the CodeAlpha Full Stack Development Internship.

## Features

- User Registration
- User Login
- JWT Authentication
- Create Projects
- View Projects
- Project Members
- Create Tasks
- Assign Tasks
- Task Status
- Task Priority
- Due Dates
- Task Comments
- Delete Comments
- Delete Tasks
- Delete Projects
- MongoDB Database
- Socket.IO Real-Time Communication Support
- Responsive Dashboard

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcryptjs

### Real-Time
- Socket.IO

## Project Structure

```text
CodeAlpha_ProjectManagementTool
│
├── models
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── Comment.js
│
├── routes
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   └── comments.js
│
├── middleware
│   └── auth.js
│
├── public
│   ├── index.html
│   ├── dashboard.html
│   ├── style.css
│   └── app.js
│
├── app.js
├── .env
├── package.json
└── README.md