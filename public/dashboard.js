const API_URL = "/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// ========================================
// ELEMENTS
// ========================================

const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

const openProjectModal = document.getElementById("openProjectModal");
const emptyCreateBtn = document.getElementById("emptyCreateBtn");

const projectModal = document.getElementById("projectModal");
const closeProjectModal = document.getElementById("closeProjectModal");
const cancelProjectBtn = document.getElementById("cancelProjectBtn");

const projectForm = document.getElementById("projectForm");
const projectName = document.getElementById("projectName");
const projectDescription = document.getElementById("projectDescription");
const projectMessage = document.getElementById("projectMessage");

const projectsContainer = document.getElementById("projectsContainer");
const emptyProjects = document.getElementById("emptyProjects");

const projectCount = document.getElementById("projectCount");
const taskCount = document.getElementById("taskCount");
const memberCount = document.getElementById("memberCount");
const commentCount = document.getElementById("commentCount");


// ========================================
// SHOW USER
// ========================================

function showUser() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        welcomeUser.textContent = "Welcome";
        return;
    }

    try {

        const user = JSON.parse(userData);

        welcomeUser.textContent =
            "Welcome, " + user.username;

    } catch (error) {

        console.error("USER DATA ERROR:", error);

        welcomeUser.textContent = "Welcome";
    }
}


// ========================================
// OPEN PROJECT MODAL
// ========================================

function openModal() {

    projectModal.classList.remove("hidden");

    projectMessage.textContent = "";

    projectForm.reset();
}


// ========================================
// CLOSE PROJECT MODAL
// ========================================

function closeModal() {

    projectModal.classList.add("hidden");

    projectMessage.textContent = "";

    projectForm.reset();
}


// ========================================
// BUTTON EVENTS
// ========================================

openProjectModal.addEventListener(
    "click",
    openModal
);

emptyCreateBtn.addEventListener(
    "click",
    openModal
);

closeProjectModal.addEventListener(
    "click",
    closeModal
);

cancelProjectBtn.addEventListener(
    "click",
    closeModal
);


// ========================================
// CLOSE MODAL OUTSIDE
// ========================================

projectModal.addEventListener(
    "click",
    function (event) {

        if (event.target === projectModal) {
            closeModal();
        }

    }
);


// ========================================
// CREATE PROJECT
// ========================================

projectForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name = projectName.value.trim();

        const description =
            projectDescription.value.trim();


        if (!name) {

            projectMessage.textContent =
                "Please enter project name.";

            return;
        }


        projectMessage.textContent =
            "Creating project...";


        try {

            const response = await fetch(
                `${API_URL}/projects`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: name,
                        description: description
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                projectMessage.textContent =
                    data.message ||
                    "Failed to create project.";

                return;
            }


            projectMessage.textContent =
                "Project created successfully!";


            setTimeout(function () {

                closeModal();

                loadProjects();

            }, 500);


        } catch (error) {

            console.error(
                "CREATE PROJECT ERROR:",
                error
            );

            projectMessage.textContent =
                "Server error. Please try again.";
        }

    }
);


// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

    try {

        const response = await fetch(
            `${API_URL}/projects`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            console.error(
                data.message
            );

            return;
        }


        const projects =
            data.projects || [];


        projectCount.textContent =
            projects.length;


        renderProjects(projects);


        // Get task/member/comment statistics
        await loadDashboardStats(projects);


    } catch (error) {

        console.error(
            "LOAD PROJECTS ERROR:",
            error
        );
    }
}


// ========================================
// LOAD DASHBOARD STATS
// ========================================

async function loadDashboardStats(projects) {

    let totalTasks = 0;
    let totalMembers = 0;
    let totalComments = 0;

    const uniqueMembers = new Set();


    for (const project of projects) {

        if (project.members) {

            project.members.forEach(member => {

                if (member._id) {
                    uniqueMembers.add(
                        member._id.toString()
                    );
                }

            });

        }


        try {

            const response = await fetch(
                `${API_URL}/tasks/project/${project._id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();

            if (response.ok && data.tasks) {

                totalTasks += data.tasks.length;


                for (const task of data.tasks) {

                    try {

                        const commentResponse =
                            await fetch(
                                `${API_URL}/comments/task/${task._id}`,
                                {
                                    headers: {
                                        "Authorization":
                                            `Bearer ${token}`
                                    }
                                }
                            );


                        const commentData =
                            await commentResponse.json();


                        if (
                            commentResponse.ok &&
                            commentData.comments
                        ) {

                            totalComments +=
                                commentData.comments.length;

                        }

                    } catch (error) {

                        console.error(
                            "COMMENT COUNT ERROR:",
                            error
                        );

                    }

                }

            }

        } catch (error) {

            console.error(
                "TASK COUNT ERROR:",
                error
            );

        }

    }


    totalMembers = uniqueMembers.size;


    taskCount.textContent =
        totalTasks;

    memberCount.textContent =
        totalMembers;

    commentCount.textContent =
        totalComments;
}


// ========================================
// RENDER PROJECTS
// ========================================

function renderProjects(projects) {

    projectsContainer.innerHTML = "";


    if (projects.length === 0) {

        emptyProjects.classList.remove(
            "hidden"
        );

        return;
    }


    emptyProjects.classList.add(
        "hidden"
    );


    projects.forEach(function (project) {

        const card =
            document.createElement("div");


        card.className =
            "project-card";


        card.innerHTML = `

            <h3>
                ${escapeHTML(project.name)}
            </h3>

            <p>
                ${
                    escapeHTML(
                        project.description ||
                        "No description"
                    )
                }
            </p>

            <div class="project-meta">

                <span>
                    👥 ${
                        project.members
                            ? project.members.length
                            : 0
                    } Members
                </span>

                <span>
                    📅 ${
                        formatDate(
                            project.createdAt
                        )
                    }
                </span>

            </div>

        `;


        card.addEventListener(
            "click",
            function () {

                window.location.href =
                    `project.html?id=${project._id}`;

            }
        );


        projectsContainer.appendChild(card);

    });
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }

    const d =
        new Date(date);

    return d.toLocaleDateString(
        "en-IN"
    );
}


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "index.html";

    }
);


// ========================================
// INITIAL LOAD
// ========================================

showUser();

loadProjects();