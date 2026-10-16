const API = "/api";


// ========================================
// GET LOGIN DATA
// ========================================

const token = localStorage.getItem("token");

let user = null;

try {
    user = JSON.parse(
        localStorage.getItem("user")
    );
} catch (error) {
    user = null;
}


// ========================================
// PROJECT ID
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const projectId =
    params.get("id");


// ========================================
// AUTH CHECK
// ========================================

if (!token || !user) {

    window.location.href =
        "/index.html";

}


// ========================================
// ELEMENTS
// ========================================

const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );

const projectTitle =
    document.getElementById(
        "projectTitle"
    );

const projectDescription =
    document.getElementById(
        "projectDescription"
    );

const memberCount =
    document.getElementById(
        "memberCount"
    );

const taskCount =
    document.getElementById(
        "taskCount"
    );

const todoCount =
    document.getElementById(
        "todoCount"
    );

const completedCount =
    document.getElementById(
        "completedCount"
    );

const todoColumnCount =
    document.getElementById(
        "todoColumnCount"
    );

const progressColumnCount =
    document.getElementById(
        "progressColumnCount"
    );

const completedColumnCount =
    document.getElementById(
        "completedColumnCount"
    );

const todoTasks =
    document.getElementById(
        "todoTasks"
    );

const progressTasks =
    document.getElementById(
        "progressTasks"
    );

const completedTasks =
    document.getElementById(
        "completedTasks"
    );

const taskModal =
    document.getElementById(
        "taskModal"
    );

const createTaskBtn =
    document.getElementById(
        "createTaskBtn"
    );

const closeTaskModal =
    document.getElementById(
        "closeTaskModal"
    );

const cancelTaskBtn =
    document.getElementById(
        "cancelTaskBtn"
    );

const taskForm =
    document.getElementById(
        "taskForm"
    );

const taskTitle =
    document.getElementById(
        "taskTitle"
    );

const taskDescription =
    document.getElementById(
        "taskDescription"
    );

const taskPriority =
    document.getElementById(
        "taskPriority"
    );

const taskStatus =
    document.getElementById(
        "taskStatus"
    );

const taskAssignedTo =
    document.getElementById(
        "taskAssignedTo"
    );

const taskDueDate =
    document.getElementById(
        "taskDueDate"
    );

const taskMessage =
    document.getElementById(
        "taskMessage"
    );

const createTaskSubmitBtn =
    document.getElementById(
        "createTaskSubmitBtn"
    );

const dashboardBtn =
    document.getElementById(
        "dashboardBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ========================================
// SHOW USER
// ========================================

if (user) {

    welcomeUser.textContent =
        "Welcome, " + user.username;

}


// ========================================
// LOAD PROJECT
// ========================================

async function loadProject() {

    try {

        const response =
            await fetch(
                `${API}/projects/${projectId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to load project."
            );

            return;

        }


        /*
         * IMPORTANT:
         * Backend returns:
         * { project: project }
         *
         * So we must use data.project
         */

        const project =
            data.project;


        if (!project) {

            alert(
                "Project data not found."
            );

            return;

        }


        projectTitle.textContent =
            project.name;


        projectDescription.textContent =
            project.description ||
            "No project description.";


        memberCount.textContent =
            project.members
                ? project.members.length
                : 0;


        populateAssignees(
            project.members || []
        );


    } catch (error) {

        console.error(
            "LOAD PROJECT ERROR:",
            error
        );

        alert(
            "Unable to load project."
        );

    }

}


// ========================================
// POPULATE ASSIGNEES
// ========================================

function populateAssignees(
    members
) {

    taskAssignedTo.innerHTML = `
        <option value="">
            Unassigned
        </option>
    `;


    members.forEach(
        function (member) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                member._id;


            option.textContent =
                member.username;


            taskAssignedTo.appendChild(
                option
            );

        }
    );

}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch(
                `${API}/tasks/project/${projectId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to load tasks."
            );

            return;

        }


        /*
         * Backend returns:
         * { tasks: tasks }
         */

        const tasks =
            data.tasks || [];


        renderTasks(tasks);


    } catch (error) {

        console.error(
            "LOAD TASKS ERROR:",
            error
        );

    }

}


// ========================================
// RENDER TASKS
// ========================================

function renderTasks(
    tasks
) {

    todoTasks.innerHTML = "";

    progressTasks.innerHTML = "";

    completedTasks.innerHTML = "";


    let todo = 0;

    let progress = 0;

    let completed = 0;


    if (tasks.length === 0) {

        todoTasks.innerHTML = `
            <div class="empty-state">
                <p>No tasks yet.</p>
            </div>
        `;

    }


    tasks.forEach(
        function (task) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "task-card";


            const assignedUser =
                task.assignedTo
                    ? task.assignedTo.username
                    : "Unassigned";


            card.innerHTML = `

                <h4>
                    ${escapeHtml(
                        task.title
                    )}
                </h4>


                <p class="task-description">
                    ${escapeHtml(
                        task.description ||
                        "No description"
                    )}
                </p>


                <p class="task-priority">

                    <strong>
                        Priority:
                    </strong>

                    ${escapeHtml(
                        task.priority ||
                        "Medium"
                    )}

                </p>


                <p class="task-assigned">

                    <strong>
                        👤 Assigned To:
                    </strong>

                    ${escapeHtml(
                        assignedUser
                    )}

                </p>


                ${
                    task.dueDate
                    ? `
                        <p class="task-due-date">

                            <strong>
                                📅 Due:
                            </strong>

                            ${new Date(
                                task.dueDate
                            ).toLocaleDateString(
                                "en-IN"
                            )}

                        </p>
                    `
                    : ""
                }


                <div class="task-actions">


                    <select
                        class="status-select"
                        data-task-id="${task._id}"
                    >

                        <option
                            value="Todo"
                            ${
                                task.status === "Todo"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Todo
                        </option>


                        <option
                            value="In Progress"
                            ${
                                task.status === "In Progress"
                                    ? "selected"
                                    : ""
                            }
                        >
                            In Progress
                        </option>


                        <option
                            value="Completed"
                            ${
                                task.status === "Completed"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Completed
                        </option>

                    </select>


                    <button
                        class="btn btn-danger delete-task-btn"
                        data-task-id="${task._id}"
                        type="button">
                        Delete
                    </button>


                </div>


                <!-- COMMENTS -->

                <div class="comments-section">

                    <h4>
                        💬 Comments
                    </h4>


                    <div
                        id="comments-${task._id}"
                        class="comments-list">
                        Loading comments...
                    </div>


                    <div class="comment-form">

                        <input
                            type="text"
                            id="commentInput-${task._id}"
                            placeholder="Write a comment..."
                        >


                        <button
                            class="btn btn-primary add-comment-btn"
                            data-task-id="${task._id}"
                            type="button">
                            Send
                        </button>

                    </div>

                </div>

            `;


            // ========================================
            // STATUS CHANGE
            // ========================================

            const statusSelect =
                card.querySelector(
                    ".status-select"
                );


            statusSelect.addEventListener(
                "change",
                function () {

                    updateTaskStatus(
                        task._id,
                        this.value
                    );

                }
            );


            // ========================================
            // DELETE TASK
            // ========================================

            const deleteBtn =
                card.querySelector(
                    ".delete-task-btn"
                );


            deleteBtn.addEventListener(
                "click",
                function () {

                    deleteTask(
                        task._id
                    );

                }
            );


            // ========================================
            // ADD COMMENT
            // ========================================

            const commentBtn =
                card.querySelector(
                    ".add-comment-btn"
                );


            commentBtn.addEventListener(
                "click",
                function () {

                    addComment(
                        task._id
                    );

                }
            );


            // ========================================
            // ADD CARD TO COLUMN
            // ========================================

            if (task.status === "Todo") {

                todoTasks.appendChild(
                    card
                );

                todo++;

            }

            else if (
                task.status === "In Progress"
            ) {

                progressTasks.appendChild(
                    card
                );

                progress++;

            }

            else if (
                task.status === "Completed"
            ) {

                completedTasks.appendChild(
                    card
                );

                completed++;

            }


            // Load comments

            loadComments(
                task._id
            );

        }
    );


    // ========================================
    // UPDATE COUNTS
    // ========================================

    taskCount.textContent =
        tasks.length;


    todoCount.textContent =
        todo;


    completedCount.textContent =
        completed;


    todoColumnCount.textContent =
        todo;


    progressColumnCount.textContent =
        progress;


    completedColumnCount.textContent =
        completed;

}


// ========================================
// OPEN CREATE TASK MODAL
// ========================================

createTaskBtn.addEventListener(
    "click",
    function () {

        taskForm.reset();

        taskPriority.value =
            "Medium";

        taskStatus.value =
            "Todo";

        taskAssignedTo.value =
            "";

        taskMessage.textContent =
            "";

        taskModal.classList.remove(
            "hidden"
        );

        taskModal.style.display =
            "flex";

    }
);


// ========================================
// CLOSE MODAL
// ========================================

function closeTaskModalFunction() {

    taskModal.classList.add(
        "hidden"
    );

    taskModal.style.display =
        "none";

    taskForm.reset();

    taskPriority.value =
        "Medium";

    taskStatus.value =
        "Todo";

    taskAssignedTo.value =
        "";

    taskMessage.textContent =
        "";

}


// ========================================
// CLOSE BUTTON
// ========================================

closeTaskModal.addEventListener(
    "click",
    closeTaskModalFunction
);


cancelTaskBtn.addEventListener(
    "click",
    closeTaskModalFunction
);


// ========================================
// CLOSE OUTSIDE MODAL
// ========================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target === taskModal
        ) {

            closeTaskModalFunction();

        }

    }
);


// ========================================
// CREATE TASK
// ========================================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            taskTitle.value.trim();


        const description =
            taskDescription.value.trim();


        const priority =
            taskPriority.value;


        const status =
            taskStatus.value;


        const assignedTo =
            taskAssignedTo.value;


        const dueDate =
            taskDueDate.value;


        if (!title) {

            taskMessage.textContent =
                "Task title is required.";

            return;

        }


        taskMessage.textContent =
            "Creating task...";


        createTaskSubmitBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `${API}/tasks`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            title:
                                title,

                            description:
                                description,

                            project:
                                projectId,

                            assignedTo:
                                assignedTo ||
                                null,

                            status:
                                status,

                            priority:
                                priority,

                            dueDate:
                                dueDate ||
                                null

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "CREATE TASK RESPONSE:",
                data
            );


            if (!response.ok) {

                taskMessage.textContent =
                    data.message ||
                    "Failed to create task.";

                return;

            }


            taskMessage.textContent =
                "Task created successfully!";


            // Close modal after successful creation

            setTimeout(
                function () {

                    closeTaskModalFunction();

                    loadTasks();

                },
                500
            );


        } catch (error) {

            console.error(
                "CREATE TASK ERROR:",
                error
            );


            taskMessage.textContent =
                "Server error. Please try again.";

        } finally {

            createTaskSubmitBtn.disabled =
                false;

        }

    }
);


// ========================================
// UPDATE TASK STATUS
// ========================================

async function updateTaskStatus(
    taskId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `${API}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        status:
                            newStatus

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update task."
            );

            return;

        }


        loadTasks();


    } catch (error) {

        console.error(
            "UPDATE TASK ERROR:",
            error
        );

    }

}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(
    taskId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/tasks/${taskId}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete task."
            );

            return;

        }


        loadTasks();


    } catch (error) {

        console.error(
            "DELETE TASK ERROR:",
            error
        );

    }

}


// ========================================
// LOAD COMMENTS
// ========================================

async function loadComments(
    taskId
) {

    const container =
        document.getElementById(
            `comments-${taskId}`
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/comments/task/${taskId}`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                "Unable to load comments.";

            return;

        }


        /*
         * Backend returns:
         * { comments: comments }
         */

        const comments =
            data.comments || [];


        if (comments.length === 0) {

            container.innerHTML = `
                <p class="no-comments">
                    No comments yet.
                </p>
            `;

            return;

        }


        container.innerHTML =
            comments.map(
                function (comment) {

                    const commentUser =
                        comment.user
                            ? comment.user.username
                            : "User";


                    const isMyComment =
                        comment.user &&
                        comment.user._id &&
                        comment.user._id.toString() ===
                        user.id.toString();


                    return `

                        <div class="comment-item">

                            <strong>
                                ${escapeHtml(
                                    commentUser
                                )}
                            </strong>


                            <p>
                                ${escapeHtml(
                                    comment.text
                                )}
                            </p>


                            ${
                                isMyComment
                                ? `
                                    <button
                                        class="delete-comment"
                                        data-comment-id="${comment._id}"
                                        type="button">
                                        Delete
                                    </button>
                                `
                                : ""
                            }

                        </div>

                    `;

                }
            ).join("");


        // ========================================
        // COMMENT DELETE EVENTS
        // ========================================

        const deleteCommentButtons =
            container.querySelectorAll(
                ".delete-comment"
            );


        deleteCommentButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteComment(
                            this.dataset.commentId
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "LOAD COMMENTS ERROR:",
            error
        );


        container.innerHTML =
            "Unable to load comments.";

    }

}


// ========================================
// ADD COMMENT
// ========================================

async function addComment(
    taskId
) {

    const input =
        document.getElementById(
            `commentInput-${taskId}`
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Please write a comment."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/comments`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        text:
                            text,

                        task:
                            taskId

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add comment."
            );

            return;

        }


        input.value = "";


        loadComments(
            taskId
        );


    } catch (error) {

        console.error(
            "ADD COMMENT ERROR:",
            error
        );

    }

}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(
    commentId
) {

    const confirmDelete =
        confirm(
            "Delete this comment?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/comments/${commentId}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete comment."
            );

            return;

        }


        loadTasks();


    } catch (error) {

        console.error(
            "DELETE COMMENT ERROR:",
            error
        );

    }

}


// ========================================
// DASHBOARD BUTTON
// ========================================

dashboardBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "/dashboard.html";

    }
);


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        window.location.href =
            "/index.html";

    }
);


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


// ========================================
// INITIAL LOAD
// ========================================

if (!projectId) {

    alert(
        "Project ID is missing."
    );


    window.location.href =
        "/dashboard.html";

} else {

    loadProject();

    loadTasks();

}