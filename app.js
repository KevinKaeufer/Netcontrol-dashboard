const defaultServers = [
    {
        id: "node-101",
        name: "Database-Primary",
        ip: "192.168.1.50",
        type: "Database",
        status: "online",
        cpu: 32,
        ram: 68,
        latency: 12
    },
    {
        id: "node-102",
        name: "Webserver-01",
        ip: "192.168.1.20",
        type: "Webserver",
        status: "critical",
        cpu: 94,
        ram: 72,
        latency: 103
    },
    {
        id: "node-103",
        name: "Backup-Server",
        ip: "192.168.1.80",
        type: "Backup",
        status: "maintenance",
        cpu: 15,
        ram: 40,
        latency: 25
    }
];

let servers = loadServers();
let editingServerId = null;


// LocalStorage

function loadServers() {
    const savedServers = localStorage.getItem("servers");

    if (savedServers) {
        return JSON.parse(savedServers);
    }

    return defaultServers;
}

function saveServers() {
    localStorage.setItem("servers", JSON.stringify(servers));
}


// HTML-Elemente holen

const serverGrid = document.getElementById("server-grid");

const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("status-filter");

const totalCount = document.getElementById("total-count");
const onlineCount = document.getElementById("online-count");
const criticalCount = document.getElementById("critical-count");
const maintenanceCount = document.getElementById("maintenance-count");

const addBtn = document.getElementById("add-btn");
const addServerSection = document.getElementById("add-server-section");

const serverForm = document.getElementById("server-form");

const serverNameInput = document.getElementById("server-name");
const serverIpInput = document.getElementById("server-ip");
const serverTypeInput = document.getElementById("server-type");
const serverStatusInput = document.getElementById("server-status");

const nameError = document.getElementById("name-error");
const ipError = document.getElementById("ip-error");
const typeError = document.getElementById("type-error");


// Status-Text

function getStatusText(status) {
    if (status === "online") {
        return "Online";
    }

    if (status === "critical") {
        return "Kritisch";
    }

    if (status === "maintenance") {
        return "Wartung";
    }

    return status;
}


// KPIs aktualisieren

function updateKpis() {
    totalCount.textContent = servers.length;

    onlineCount.textContent = servers.filter(
        server => server.status === "online"
    ).length;

    criticalCount.textContent = servers.filter(
        server => server.status === "critical"
    ).length;

    maintenanceCount.textContent = servers.filter(
        server => server.status === "maintenance"
    ).length;
}


// Server rendern

function renderServers() {
    serverGrid.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredServers = servers.filter(server => {
        const matchesSearch =
            server.name.toLowerCase().includes(searchText) ||
            server.ip.includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            server.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    filteredServers.forEach(server => {
        const article = document.createElement("article");

        article.className = "server-card";

        article.innerHTML = `
            <h3>${server.name}</h3>

            <p class="status ${server.status}">
                ${getStatusText(server.status)}
            </p>

            <p>IP-Adresse: ${server.ip}</p>
            <p>Typ: ${server.type}</p>
            <p>CPU: ${server.cpu} %</p>
            <p>RAM: ${server.ram} %</p>
            <p>Latenz: ${server.latency} ms</p>

            <button
                type="button"
                class="edit-btn"
                data-id="${server.id}"
            >
                Bearbeiten
            </button>

            <button
                type="button"
                class="delete-btn"
                data-id="${server.id}"
            >
                Löschen
            </button>
        `;

        serverGrid.appendChild(article);

        const editButton = article.querySelector(".edit-btn");

        editButton.addEventListener("click", () => {
            editServer(server.id);
        });

        const deleteButton = article.querySelector(".delete-btn");

        deleteButton.addEventListener("click", () => {
            deleteServer(server.id);
        });
    });
}


// Server löschen

function deleteServer(id) {
    servers = servers.filter(server => server.id !== id);

    saveServers();
    renderServers();
    updateKpis();
}


// Fehleranzeigen zurücksetzen

function clearFormErrors() {
    nameError.textContent = "";
    ipError.textContent = "";
    typeError.textContent = "";

    serverNameInput.classList.remove("input-error");
    serverIpInput.classList.remove("input-error");
    serverTypeInput.classList.remove("input-error");
}


// Server bearbeiten

function editServer(id) {
    const serverToEdit = servers.find(server => server.id === id);

    if (!serverToEdit) {
        return;
    }

    editingServerId = id;

    serverNameInput.value = serverToEdit.name;
    serverIpInput.value = serverToEdit.ip;
    serverTypeInput.value = serverToEdit.type;
    serverStatusInput.value = serverToEdit.status;

    clearFormErrors();

    addServerSection.classList.remove("hidden");
}


// IPv4 prüfen

function isValidIPv4(ip) {
    const ipv4Regex =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

    return ipv4Regex.test(ip);
}


// Server hinzufügen oder bearbeiten

function addServer() {
    const name = serverNameInput.value.trim();
    const ip = serverIpInput.value.trim();
    const type = serverTypeInput.value.trim();
    const status = serverStatusInput.value;

    let hasError = false;

    clearFormErrors();

    if (name === "") {
        nameError.textContent = "Bitte gib einen Servernamen ein.";
        serverNameInput.classList.add("input-error");
        hasError = true;
    }

    if (!isValidIPv4(ip)) {
        ipError.textContent = "Bitte gib eine gültige IPv4-Adresse ein.";
        serverIpInput.classList.add("input-error");
        hasError = true;
    }

    if (type === "") {
        typeError.textContent = "Bitte gib einen Servertyp ein.";
        serverTypeInput.classList.add("input-error");
        hasError = true;
    }

    if (hasError) {
        return;
    }

    if (editingServerId) {
        const server = servers.find(
            server => server.id === editingServerId
        );

        if (server) {
            server.name = name;
            server.ip = ip;
            server.type = type;
            server.status = status;
        }

        editingServerId = null;
    } else {
        const newServer = {
            id: "node-" + Date.now(),
            name: name,
            ip: ip,
            type: type,
            status: status,
            cpu: 0,
            ram: 0,
            latency: 0
        };

        servers.push(newServer);
    }

    saveServers();
    renderServers();
    updateKpis();

    serverForm.reset();
    clearFormErrors();

    addServerSection.classList.add("hidden");
}


// Simulation

function simulateServerValues() {
    servers.forEach(server => {
        const cpuChange = Math.floor(Math.random() * 11) - 5;
        const latencyChange = Math.floor(Math.random() * 21) - 10;

        server.cpu += cpuChange;
        server.latency += latencyChange;

        if (server.cpu < 0) {
            server.cpu = 0;
        }

        if (server.cpu > 100) {
            server.cpu = 100;
        }

        if (server.latency < 1) {
            server.latency = 1;
        }

        if (server.cpu > 90) {
            server.status = "critical";
        } else if (server.status !== "maintenance") {
            server.status = "online";
        }
    });

    saveServers();
    renderServers();
    updateKpis();
}


// Events

serverForm.addEventListener("submit", event => {
    event.preventDefault();

    addServer();
});

addBtn.addEventListener("click", () => {
    const isHidden = addServerSection.classList.contains("hidden");

    if (isHidden) {
        editingServerId = null;
        serverForm.reset();
        clearFormErrors();
    }

    addServerSection.classList.toggle("hidden");
});

searchInput.addEventListener("input", () => {
    renderServers();
});

statusFilter.addEventListener("change", () => {
    renderServers();
});


// Start

renderServers();
updateKpis();

setInterval(simulateServerValues, 5000);