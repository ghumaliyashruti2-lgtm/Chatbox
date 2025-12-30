// ----------------------
// GET CSRF TOKEN
// ----------------------
function getCookie(name) {
    let cookieArr = document.cookie.split(";");

    for (let cookie of cookieArr) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}


// ----------------------
// SHOW COURSE BUTTONS
// ----------------------
function showCourseButtons() {
    setTimeout(() => {
        let chatBody = document.getElementById("chatBody");
        const courses = ["Python", "Java", "Full Stack", "Web Development", "More"];

        let box = document.createElement("div");
        box.classList.add("course-options-box");

        courses.forEach(course => {
            let btn = document.createElement("button");
            btn.classList.add("smart-option-btn");
            btn.innerText = course;

            btn.addEventListener("click", () => {
                document.getElementById("userInput").value = course;
                sendMessage();
            });

            box.appendChild(btn);
        });

        chatBody.appendChild(box);
        setTimeout(autoScroll, 50);
    }, 400);
}


// ----------------------
// ajax Send Message
// ----------------------
let isProcessing = false;  // Global flag

async function sendMessage(event) {
    if (event) event.preventDefault();

    if (isProcessing) return; // block multiple clicks

    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBody = document.getElementById("chatBody");
    const typingIndicator = document.getElementById("typingIndicator");

    const message = input.value.trim();
    if (!message) return;

    // ---- Lock ----
    isProcessing = true;
    input.disabled = true;

    // Don't change button text, only appearance
    sendBtn.style.opacity = "0.6";
    sendBtn.style.cursor = "not-allowed";
    sendBtn.title = "Please wait, bot is replying...";

    // Append user message
    chatBody.innerHTML += `<div class="message user">${message}</div>`;
    setTimeout(autoScroll, 50);

    input.value = "";

    typingIndicator.style.display = "flex";

    const csrfToken = getCookie("csrftoken");

    try {
        const response = await fetch("/index/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        typingIndicator.style.display = "none";

        chatBody.innerHTML += `<div class="message bot">${data.reply.replace(/\n/g, "<br>")}</div>`;
        setTimeout(autoScroll, 50);

        if (data.show_courses) {
            showCourseButtons();
        }

    } catch (error) {
        console.error("Error:", error);
    }

    // ---- Unlock ----
    isProcessing = false;
    input.disabled = false;

    sendBtn.style.opacity = "1";
    sendBtn.style.cursor = "pointer";
    sendBtn.title = "";

    input.focus();
}



// ----------------------
// Quick Reply Buttons Support
// ----------------------
function sendQuick(text) {
    document.getElementById("userInput").value = text;
    sendMessage();
}


// ----------------------
// Auto-scroll on page load
// ----------------------
window.addEventListener("DOMContentLoaded", () => {
    let chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
});


function autoScroll() {
    const chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
}

/* future code 
function loadHistory() {
    const url = document.getElementById("history-url").value;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById("right-content").innerHTML = data;
        })
        .catch(error => console.error("Error loading history:", error));
}


function loadProfile() {
    fetch("/my-profile/")   // URL of profile page
        .then(response => response.text())
        .then(html => {
            document.getElementById("right-content").innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading profile:", error);
        });
}*/
