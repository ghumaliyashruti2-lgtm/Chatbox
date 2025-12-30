// ======================
// CSRF TOKEN
// ======================
function getCookie(name) {
    let cookieValue = null;
    let cookies = document.cookie ? document.cookie.split(';') : [];

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();

        if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
        }
    }
    return cookieValue;
}

// ======================
// SAFE AUTO SCROLL
// ======================
function autoScroll() {
    const chatBody = document.getElementById("chatBody");
    if (!chatBody) return;
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ======================
// COURSE BUTTONS
// ======================
function showCourseButtons() {
    setTimeout(() => {
        const chatBody = document.getElementById("chatBody");
        if (!chatBody) return;

        const courses = ["Python", "Java", "Full Stack", "Web Development", "More"];
        const box = document.createElement("div");
        box.classList.add("course-options-box");

        courses.forEach(course => {
            const btn = document.createElement("button");
            btn.classList.add("smart-option-btn");
            btn.innerText = course;
            btn.onclick = () => {
                const input = document.getElementById("userInput");
                if (input) {
                    input.value = course;
                    sendMessage();
                }
            };
            box.appendChild(btn);
        });

        chatBody.appendChild(box);
        autoScroll();
    }, 400);
}

// ======================
// CHATBOT CONFIG
// ======================
const MAX_MESSAGES = 10;
let isProcessing = false;


// ======================
// COUNT USER MESSAGES
// ======================
function getUserMessageCount() {
    return document.querySelectorAll(".chat-message.user-message").length;
}


// ======================
// FORCE NEW CHAT
// ======================
function forceNewChat() {
    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBody = document.getElementById("chatBody");

    if (!input || !sendBtn || !chatBody) return;

    input.disabled = true;
    sendBtn.disabled = true;

    sendBtn.style.opacity = "0.5";
    sendBtn.style.cursor = "not-allowed";

    // Prevent duplicate warning
    if (!document.getElementById("limitMessage")) {
        const warning = document.createElement("div");
        warning.id = "limitMessage";
        warning.className = "message system-message";
        warning.innerHTML = "⚠ Chat limit reached (10 messages /24 housrs). Please start a new chat.";

        chatBody.appendChild(warning);
        autoScroll();
    }
}


// ======================
// SEND MESSAGE
// ======================
async function sendMessage(event) {

    if (event) event.preventDefault();
    if (isProcessing) return;

    // 🔒 MESSAGE LIMIT CHECK
    const userMessageCount = getUserMessageCount();
    if (userMessageCount >= MAX_MESSAGES) {
        forceNewChat();
        return;
    }

    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatBody = document.getElementById("chatBody");
    const typingIndicator = document.getElementById("typingIndicator");

    if (!input || !sendBtn || !chatBody || !typingIndicator) return;

    const message = input.value.trim();
    if (!message) return;

    isProcessing = true;
    input.disabled = true;

    sendBtn.style.opacity = "0.6";
    sendBtn.style.cursor = "not-allowed";

    // 👤 USER MESSAGE
    chatBody.innerHTML += `
        <div class="chat-message user-message">
            <div class="message user">${message}</div>
        </div>
    `;
    autoScroll();

    input.value = "";

    // ⏳ TYPING INDICATOR
    typingIndicator.style.display = "flex";
    chatBody.appendChild(typingIndicator);
    autoScroll();

    try {
       const response = await fetch("/chatbot/chatbot/", {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({ message })
        });

        // 🔒 BACKEND LIMIT CHECK (OPTIONAL BUT SAFE)
        if (response.status === 403) {
            typingIndicator.style.display = "none";
            forceNewChat();
            return;
        }

        if (!response.ok) {
            const text = await response.text();
            console.error("Server error:", text);
            typingIndicator.style.display = "none";
            return;
        }
        
        const data = await response.json();
        typingIndicator.style.display = "none";

        // 🤖 BOT MESSAGE
        chatBody.innerHTML += `
            <div class="chat-message bot-message">
                <div class="message bot">
                    ${data.reply.replace(/\n/g, "<br>")}
                </div>
            </div>
        `;
        autoScroll();

        if (data.show_courses) showCourseButtons();

    } catch (err) {
        console.error(err);
    }

    isProcessing = false;
    input.disabled = false;
    sendBtn.style.opacity = "1";
    sendBtn.style.cursor = "pointer";
    input.focus();
}


// ======================
// AUTO SCROLL
// ======================

function autoScroll() {
    const chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ======================
// PAGE LOAD SCROLL
// ======================
document.addEventListener("DOMContentLoaded", () => {
    autoScroll();

    // Focus user input safely
    const input = document.getElementById("userInput");
    if (input) {
        input.focus();
        const val = input.value;
        input.value = "";
        input.value = val;
    }

    // Emoji Picker
    const emojiBtn = document.getElementById("emojiBtn");
    const picker = document.getElementById("emojiPicker");
    if (emojiBtn && picker) {
        emojiBtn.addEventListener("click", e => e.stopPropagation());
        picker.addEventListener("click", e => e.stopPropagation());

        document.addEventListener("click", () => {
            picker.style.display = "none";
        });
    }
});

// ======================
// POPUPS
// ======================
function openeditPopup(url) {
    const overlay = document.getElementById("popupOverlay");
    const frame = document.getElementById("popupFrame");
    if (!overlay || !frame) return;

    frame.src = url;
    overlay.classList.add("active");
}

function opendeletePopup(url) {
    openeditPopup(url);
}

window.addEventListener("message", function (event) {
    if (event.data !== "closeProfilePopup") return;

    const overlay = document.getElementById("popupOverlay");
    const frame = document.getElementById("popupFrame");
    if (!overlay || !frame) return;

    overlay.classList.remove("active");
    frame.src = "";

    location.reload();
});

function closePopup() {
    window.parent.postMessage("closeProfilePopup", "*");
}

function previewImage(event) {
    const img = document.getElementById("previewImg");
    if (!img) return;
    img.src = URL.createObjectURL(event.target.files[0]);
}

// ======================
// AUDIO RECORDING
// ======================
let mediaRecorder;
let audioChunks = [];

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                uploadAudio(audioBlob);
            };

            setTimeout(() => mediaRecorder.stop(), 5000);
        })
        .catch(err => console.error("Mic error:", err));
}

function uploadAudio(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    fetch("/upload-audio/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log("Audio uploaded:", data);
        alert("Audio uploaded successfully");
    })
    .catch(err => console.error(err));
}

// ======================
// VOICE INPUT
// ======================
let recognition;

function startSpeechToText() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("Speech recognition not supported");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = function (event) {
        document.getElementById("userInput").value =
            event.results[0][0].transcript;
    };

    recognition.onerror = function (event) {
        console.error("Speech error:", event.error);
    };

    recognition.start();
}

// ======================
// FILE UPLOAD
// ======================
function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const userInput = document.getElementById("userInput");

    if (!fileInput || !fileInput.files.length) return;

    const file = fileInput.files[0];

    // 👇 SHOW FILE NAME IN INPUT FIELD
    userInput.value = "📎 " + file.name;

    // Optional: auto-upload immediately
    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload-file/", {
        method: "POST",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: formData
    })
    .then(res => res.json())
    .then(() => console.log("File uploaded"))
    .catch(err => console.error(err));
}


// ======================
// EMOJI ATTACH 
// ======================


let emojiPickerLoaded = false;

function toggleEmojiPicker() {
    const pickerDiv = document.getElementById("emojiPicker");

    if (!emojiPickerLoaded) {
        const picker = new window.EmojiMart.Picker({
            onEmojiSelect: (emoji) => {
                document.getElementById("userInput").value += emoji.native;
                
            }
        });

        pickerDiv.appendChild(picker);
        emojiPickerLoaded = true;
    }

    pickerDiv.style.display =
        pickerDiv.style.display === "block" ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
    const emojiBtn = document.getElementById("emojiBtn");
    const picker = document.getElementById("emojiPicker");

    if (!emojiBtn || !picker) return;

    emojiBtn.addEventListener("click", e => e.stopPropagation());
    picker.addEventListener("click", e => e.stopPropagation());

    document.addEventListener("click", () => {
        picker.style.display = "none";
    });
});



// ======================
// MOBILE NAV
// ======================
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-navbar');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener("click", () => mobileNav.classList.toggle("active"));
        mobileLinks.forEach(link => link.addEventListener("click", () => mobileNav.classList.remove("active")));
    }
});

// ======================
// 3 DOT MENU & SUBMENU
// ======================
function toggleMenu() {
    const menu = document.getElementById("dotsMenu");
    if (!menu) return;
    menu.classList.toggle("show");
}

function toggleSubmenu(event) {
    event.stopPropagation();
    const submenu = document.getElementById("submenu");
    if (!submenu) return;
    submenu.classList.toggle("show");
}

document.addEventListener("click", function(event) {
    const menu = document.getElementById("dotsMenu");
    const dots = document.querySelector(".dots");
    const submenu = document.getElementById("submenu");

    if (!menu || !dots) return;
    if (!menu.contains(event.target) && !dots.contains(event.target)) {
        menu.classList.remove("show");
        submenu?.classList.remove("show");
    }
});

// ======================
// HISTORY PAGE DELETE LOGIC
// ======================

function openCleanPopup(value) {
    const popup = document.getElementById("cleanPopup");
    const input = document.getElementById("cleanRange");

    if (!popup || !input) return;

    popup.style.display = "flex";
    input.value = value;   // can be chat_id OR day/week/month/all
}

function closeCleanPopup() {
    document.getElementById("cleanPopup").style.display = "none";
    document.getElementById("cleanRange").value = "";
}

function confirmCleanHistory() {
    const value = document.getElementById("cleanRange").value;
    const csrftoken = getCookie("csrftoken");

    if (!value) return;

    // 🔹 RANGE DELETE
    if (["day", "week", "month", "all"].includes(value)) {
        fetch("/clean-history/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({ range: value })
        })
        .then(() => location.reload());
    }
    // 🔹 SINGLE CHAT DELETE
    else {
        fetch(`/delete-history/${value}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrftoken
            }
        })
        .then(() => location.reload());
    }
}

// ======================
// SEARCH & HIGHLIGHT
// ======================
function searchHistory() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const val = input.value.trim().toLowerCase();
    const rows = document.querySelectorAll(".history-wrapper");

    rows.forEach(row => {
        const blocks = row.querySelectorAll(".history-msg");
        let matchFound = false;

        blocks.forEach(block => {
            let original = block.getAttribute("data-original");
            if (!original) {
                block.setAttribute("data-original", block.innerHTML);
                original = block.innerHTML;
            }

            if (val === "") {
                block.innerHTML = original;
                matchFound = true;
                return;
            }

            if (original.toLowerCase().includes(val)) matchFound = true;

            const regex = new RegExp(`(${val})`, "gi");
            block.innerHTML = original.replace(regex, `<mark>$1</mark>`);
        });

        row.style.display = matchFound ? "flex" : "none";
    });
}

// ======================
// COPY BUTTON
// ======================
document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("copy-btn")) return;

    const message = e.target.closest(".message");
    if (!message) return;

    const text = message.cloneNode(true);
    text.querySelector(".message-actions")?.remove();

    const content = text.innerText.trim();
    navigator.clipboard.writeText(content).then(() => {
        e.target.classList.replace("fa-copy", "fa-check");
        setTimeout(() => e.target.classList.replace("fa-check", "fa-copy"), 1000);
    });
});

console.log("Modified script.js loaded successfully ✅");  