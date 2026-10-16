const API = "/api";

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    const user = localStorage.getItem("user");

    return user
        ? JSON.parse(user)
        : null;
}

async function apiRequest(url, options = {}) {

    const token = getToken();

    if (!token) {
        window.location.href = "/";
        return;
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };

    const response = await fetch(
        API + url,
        {
            ...options,
            headers
        }
    );

    const data = await response.json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Something went wrong."
        );
    }

    return data;
}


/* =========================
   AUTH PAGE
========================= */

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");

const loginMessage =
    document.getElementById("loginMessage");

const registerMessage =
    document.getElementById("registerMessage");


if (showRegister) {

    showRegister.addEventListener(
        "click",
        () => {

            document
                .getElementById("loginSection")
                .classList.add("hidden");

            document
                .getElementById("registerSection")
                .classList.remove("hidden");

        }
    );
}


if (showLogin) {

    showLogin.addEventListener(
        "click",
        () => {

            document
                .getElementById("registerSection")
                .classList.add("hidden");

            document
                .getElementById("loginSection")
                .classList.remove("hidden");

        }
    );
}


/* REGISTER */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const username =
                document
                    .getElementById("registerUsername")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            registerMessage.textContent =
                "Creating account...";

            try {

                const data =
                    await apiRequest(
                        "/auth/register",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                username,
                                email,
                                password
                            })
                        }
                    );

                registerMessage.textContent =
                    data.message ||
                    "Registration successful.";

                registerForm.reset();

                setTimeout(
                    () => {

                        document
                            .getElementById(
                                "registerSection"
                            )
                            .classList.add("hidden");

                        document
                            .getElementById(
                                "loginSection"
                            )
                            .classList.remove("hidden");

                        registerMessage.textContent =
                            "";

                    },
                    1000
                );

            } catch (error) {

                registerMessage.textContent =
                    error.message;

            }
        }
    );
}


/* LOGIN */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            loginMessage.textContent =
                "Logging in...";

            try {

                const data =
                    await apiRequest(
                        "/auth/login",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                loginMessage.textContent =
                    "Login successful.";

                setTimeout(
                    () => {

                        window.location.href =
                            "/dashboard.html";

                    },
                    500
                );

            } catch (error) {

                loginMessage.textContent =
                    error.message;

            }
        }
    );
}


/* =========================
   DASHBOARD
========================= */

const welcomeUser =
    document.getElementById("welcomeUser");

const projectCount =
    document.getElementById("projectCount");

const projectsContainer =
    document.getElementById(
        "projectsContainer"
    );

const createProjectBtn =
    document.getElementById(
        "createProjectBtn"
    );

const createProjectModal =
    document.getElementById(
        "createProjectModal"
    );

const closeProjectModal =
    document.getElementById(
        "closeProjectModal"
    );

const cancelProjectBtn =
    document.getElementById(
        "cancelProjectBtn"
    );

const projectForm =
    document.getElementById(
        "projectForm"
    );

const projectMessage =
    document.getElementById(
        "projectMessage"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* USER */

const user = getUser();

if (welcomeUser && user) {

    welcomeUser.textContent =
        "Hi, " + user.username;

}


/* OPEN MODAL */

if (createProjectBtn) {

    createProjectBtn.addEventListener(
        "click",
        () => {

            createProjectModal
                .classList
                .remove("hidden");

        }
    );
}


/* CLOSE MODAL */

function closeProjectModalFunction() {

    if (createProjectModal) {

        createProjectModal
            .classList
            .add("hidden");

    }
}


if (closeProjectModal) {

    closeProjectModal.addEventListener(
        "click",
        closeProjectModalFunction
    );

}


if (cancelProjectBtn) {

    cancelProjectBtn.addEventListener(
        "click",
        closeProjectModalFunction
    );

}


/* CREATE PROJECT */

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const name =
                document
                    .getElementById("projectName")
                    .value
                    .trim();

            const description =
                document
                    .getElementById(
                        "projectDescription"
                    )
                    .value
                    .trim();

            projectMessage.textContent =
                "Creating project...";

            try {

                const data =
                    await apiRequest(
                        "/projects",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                name,
                                description
                            })
                        }
                    );

                projectMessage.textContent =
                    data.message ||
                    "Project created successfully.";

                projectForm.reset();

                await loadProjects();

                setTimeout(
                    () => {

                        closeProjectModalFunction();

                        projectMessage.textContent =
                            "";

                    },
                    700
                );

            } catch (error) {

                projectMessage.textContent =
                    error.message;

            }
        }
    );
}


/* LOAD PROJECTS */

async function loadProjects() {

    if (!projectsContainer) {
        return;
    }

    try {

        const data =
            await apiRequest(
                "/projects"
            );

        const projects =
            data.projects || [];

        if (projectCount) {

            projectCount.textContent =
                projects.length;

        }

        renderProjects(projects);

    } catch (error) {

        console.error(
            "LOAD PROJECTS ERROR:",
            error
        );

        projectsContainer.innerHTML = `
            <p>
                ${escapeHtml(error.message)}
            </p>
        `;

    }
}


/* RENDER PROJECTS */

function renderProjects(projects) {

    if (!projectsContainer) {
        return;
    }

    projectsContainer.innerHTML = "";

    if (projects.length === 0) {

        projectsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No projects yet
                </h3>

                <p>
                    Create your first project to get started.
                </p>

            </div>
        `;

        return;
    }


    projects.forEach(
        project => {

            const card =
                document.createElement("div");

            card.className =
                "project-card";


            /* CLICK PROJECT */

            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/project.html?id=" +
                        project._id;

                }
            );


            card.innerHTML = `

                <div class="project-card-icon">
                    📁
                </div>

                <div class="project-card-content">

                    <h3>
                        ${escapeHtml(
                            project.name
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            project.description ||
                            "No description"
                        )}
                    </p>

                    <div class="project-card-meta">

                        <span>
                            👥
                            ${
                                project.members
                                    ? project.members.length
                                    : 0
                            }
                            Members
                        </span>

                        <span>
                            👤
                            ${
                                project.owner
                                    ? project.owner.username
                                    : "Owner"
                            }
                        </span>

                    </div>

                </div>

            `;

            projectsContainer.appendChild(
                card
            );

        }
    );
}


/* LOGOUT */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "/";

        }
    );

}


/* ESCAPE HTML */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


/* =========================
   DASHBOARD START
========================= */

if (
    window.location.pathname.includes(
        "dashboard.html"
    )
) {

    if (!getToken()) {

        window.location.href = "/";

    } else {

        loadProjects();

    }

}