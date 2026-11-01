
// ===================================
// SMART PARKING MANAGEMENT SYSTEM
// ===================================

// Initial data
let vehicles = JSON.parse(localStorage.getItem("parkingVehicles")) || [];
let revenue = Number(localStorage.getItem("parkingRevenue")) || 0;

const TOTAL_SLOTS = 10;

// ===================================
// DARK MODE
// ===================================

function applyTheme() {
    const theme = localStorage.getItem("parkingTheme") || "light";
    document.body.classList.toggle("dark", theme === "dark");
}

function toggleTheme() {
    const dark = document.body.classList.toggle("dark");

    localStorage.setItem("parkingTheme", dark ? "dark" : "light");

    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
}

applyTheme();

// ===================================
// LOGIN AND SIGNUP
// ===================================

function showAuth(type) {
    document.getElementById("loginForm").classList.toggle("hidden", type !== "login");
    document.getElementById("signupForm").classList.toggle("hidden", type !== "signup");

    document.getElementById("loginTab").classList.toggle("active", type === "login");
    document.getElementById("signupTab").classList.toggle("active", type === "signup");
}

// Signup
document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    const message = document.getElementById("signupMessage");

    if (password !== confirm) {
        message.textContent = "Passwords do not match!";
        return;
    }

    let users = JSON.parse(localStorage.getItem("parkingUsers")) || [];

    if (users.some(user => user.email === email)) {
        message.textContent = "Account already exists!";
        return;
    }

    users.push({ name, email, password });

    localStorage.setItem("parkingUsers", JSON.stringify(users));

    message.textContent = "Account created successfully! Please login.";

    document.getElementById("signupForm").reset();

    setTimeout(() => {
        message.textContent = "";
        showAuth("login");
        document.getElementById("loginEmail").value = email;
    }, 1200);
});

// Login
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("parkingUsers")) || [];

    const user = users.find(u =>
        u.email === email && u.password === password
    );

    const message = document.getElementById("loginMessage");

    if (!user) {
        message.textContent = "Invalid email or password!";
        return;
    }

    localStorage.setItem("parkingLoggedIn", JSON.stringify({
        name: user.name,
        email: user.email
    }));

    openDashboard();
});

// ===================================
// OPEN DASHBOARD
// ===================================

function openDashboard() {
    const user = JSON.parse(localStorage.getItem("parkingLoggedIn"));

    if (!user) return;

    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");

    document.getElementById("welcomeUser").textContent =
        "Welcome, " + user.name;

    updateDashboard();
}

function logout() {
    localStorage.removeItem("parkingLoggedIn");

    document.getElementById("appContainer").classList.add("hidden");
    document.getElementById("authContainer").classList.remove("hidden");

    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").textContent = "";

    showAuth("login");
}

// Check existing session
if (localStorage.getItem("parkingLoggedIn")) {
    openDashboard();
}

// ===================================
// NAVIGATION
// ===================================

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "slots") {
        displaySlots("allSlots");
    }
}

// ===================================
// SAVE PARKING DATA
// ===================================

function saveData() {
    localStorage.setItem("parkingVehicles", JSON.stringify(vehicles));
    localStorage.setItem("parkingRevenue", revenue);
}

// ===================================
// PARK VEHICLE
// ===================================

function parkVehicle() {
    const number = document.getElementById("vehicleNumber")
        .value.trim().toUpperCase();

    const type = document.getElementById("vehicleType").value;
    const message = document.getElementById("parkMessage");

    if (!number) {
        message.textContent = "Please enter vehicle number!";
        return;
    }

    if (!/^[A-Z0-9-]{4,15}$/.test(number)) {
        message.textContent = "Enter a valid vehicle number!";
        return;
    }

    if (vehicles.some(v => v.number === number)) {
        message.textContent = "Vehicle is already parked!";
        return;
    }

    if (vehicles.length >= TOTAL_SLOTS) {
        message.textContent = "Sorry! Parking is full.";
        return;
    }

    const slot = Array.from(
        { length: TOTAL_SLOTS },
        (_, i) => i + 1
    ).find(s => !vehicles.some(v => v.slot === s));

    vehicles.push({
        number: number,
        type: type,
        slot: slot,
        entryTime: new Date().toLocaleString()
    });

    saveData();

    message.textContent =
        "Vehicle parked successfully! Assigned Slot: " + slot;

    document.getElementById("vehicleNumber").value = "";

    updateDashboard();
}

// ===================================
// REMOVE VEHICLE
// ===================================

function removeVehicle() {
    const number = document.getElementById("removeNumber")
        .value.trim().toUpperCase();

    const hours = Number(document.getElementById("hours").value);
    const message = document.getElementById("removeMessage");

    if (!number || !Number.isFinite(hours) || hours <= 0) {
        message.textContent = "Enter vehicle number and valid parking hours!";
        return;
    }

    const index = vehicles.findIndex(v => v.number === number);

    if (index === -1) {
        message.textContent = "Vehicle not found!";
        return;
    }

    const vehicle = vehicles[index];

    // Parking charges
    const rate = vehicle.type === "Car" ? 50 : 30;
    const amount = Math.ceil(hours) * rate;

    revenue += amount;

    vehicles.splice(index, 1);

    saveData();

    message.textContent =
        `Vehicle removed! Slot: ${vehicle.slot} | Parking Fee: ₹${amount}`;

    document.getElementById("removeNumber").value = "";
    document.getElementById("hours").value = "";

    updateDashboard();
}

// ===================================
// SEARCH VEHICLE
// ===================================

function searchVehicle() {
    const number = document.getElementById("searchNumber")
        .value.trim().toUpperCase();

    const result = document.getElementById("searchResult");

    if (!number) {
        result.textContent = "Please enter vehicle number!";
        return;
    }

    const vehicle = vehicles.find(v => v.number === number);

    if (vehicle) {
        result.innerHTML = `
            <h3>Vehicle Found! ✅</h3>
            <p><b>Vehicle Number:</b> ${vehicle.number}</p>
            <p><b>Vehicle Type:</b> ${vehicle.type}</p>
            <p><b>Parking Slot:</b> ${vehicle.slot}</p>
            <p><b>Entry Time:</b> ${vehicle.entryTime}</p>
        `;
    } else {
        result.textContent = "Vehicle not found!";
    }
}

// ===================================
// DISPLAY PARKING SLOTS
// ===================================

function displaySlots(containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    for (let i = 1; i <= TOTAL_SLOTS; i++) {

        const vehicle = vehicles.find(v => v.slot === i);

        const slot = document.createElement("div");

        slot.className = vehicle ? "slot occupied" : "slot";

        const heading = document.createElement("strong");
        heading.textContent = "Slot " + i;

        const status = document.createElement("small");
        status.textContent = vehicle
            ? "Occupied - " + vehicle.number
            : "Available";

        slot.appendChild(heading);
        slot.appendChild(status);

        container.appendChild(slot);
    }
}

// ===================================
// UPDATE DASHBOARD
// ===================================

function updateDashboard() {
    const occupied = vehicles.length;
    const available = TOTAL_SLOTS - occupied;

    document.getElementById("totalSlots").textContent = TOTAL_SLOTS;
    document.getElementById("occupiedSlots").textContent = occupied;
    document.getElementById("availableSlots").textContent = available;
    document.getElementById("revenue").textContent = revenue;

    displaySlots("slotContainer");
    displaySlots("allSlots");
}

// Initial dashboard update
updateDashboard();
