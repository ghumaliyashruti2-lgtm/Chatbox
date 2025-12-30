
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

// -------------------------
// 🌟 MENU TOGGLE
// -------------------------
function toggleMenu() {
    let menu = document.getElementById("dotsMenu");
    menu.classList.toggle("show");
}

function toggleSubmenu(event) {
    event.stopPropagation();
    let submenu = document.getElementById("submenu");
    submenu.classList.toggle("show");
}

// -------------------------
// 🌟 OPEN POPUP
// -------------------------
function openCleanPopup(range) {
    document.getElementById("cleanPopup").style.display = "flex";
    document.getElementById("cleanRange").value = range;
}

// -------------------------
// 🌟 CLOSE POPUP
// -------------------------
function closeCleanPopup() {
    document.getElementById("cleanPopup").style.display = "none";
}

// -------------------------
// 🌟 CONFIRM CLEAN HISTORY
// -------------------------
function confirmCleanHistory() {
    const range = document.getElementById("cleanRange").value;

    fetch("/clean-history/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ range: range })
    })
    .then(res => res.json())
    .then(() => {
        closeCleanPopup();
        location.reload();
    })
    .catch(err => console.error("Error cleaning history:", err));
}

// -------------------------
// 🌟 SORT HISTORY
// -------------------------
function sortHistory() {
    let sort = document.getElementById("sortSelect").value;
    window.location.href = "?sort=" + sort;
}

// -------------------------
// 🌟 CLOSE MENU ON OUTSIDE CLICK
// -------------------------
document.addEventListener("click", function(event) {
    let menu = document.getElementById("dotsMenu");
    let dots = document.querySelector(".dots");

    if (!dots.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.remove("show");
        document.getElementById("submenu").classList.remove("show");
    }
});

console.log("History Page Script Loaded Successfully");

// -------------------------
// 🌟 SEARCH + HIGHLIGHT
// -------------------------
function searchHistory() {
    let input = document.getElementById("searchInput").value.trim().toLowerCase();
    let rows = document.querySelectorAll(".history-wrapper");

    rows.forEach(row => {
        let blocks = row.querySelectorAll(".history-msg");
        let matchFound = false;

        blocks.forEach(block => {
            let original = block.getAttribute("data-original");

            if (!original) {
                block.setAttribute("data-original", block.innerHTML);
                original = block.innerHTML;
            }

            if (input === "") {
                block.innerHTML = original;
                matchFound = true;
                return;
            }

            let lower = original.toLowerCase();
            if (lower.includes(input)) matchFound = true;

            let regex = new RegExp(`(${input})`, "gi");
            block.innerHTML = original.replace(regex, `<mark>$1</mark>`);
        });

        row.style.display = matchFound ? "flex" : "none";
    });
}


function deleteHistory(id) {
    if (confirm("Are you sure you want to delete this message?")) {
        window.location.href = "/delete-history/" + id + "/";
    }
}