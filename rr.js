let chart;

// Load history on page load
window.onload = function() {
    showHistory();
}

function savePlayerData() {
    const name = document.getElementById("playerName").value.trim();
    const years = document.getElementById("yearsInput").value.split(",");
    const runs = document.getElementById("runsInput").value.split(",").map(Number);
    const highest = document.getElementById("highestInput").value.split(",").map(Number);

    if (!name || years.length === 0) { alert("Please fill all fields"); return; }
    if (years.length !== runs.length || runs.length !== highest.length) { alert("Years, Runs, and Highest Score must have the same count"); return; }
    if (runs.some(isNaN) || highest.some(isNaN)) { alert("Runs and Highest Score must be numeric"); return; }

    // Load existing data
    let players = JSON.parse(localStorage.getItem("players")) || {};
    let history = JSON.parse(localStorage.getItem("history")) || [];

    // Save/update player
    players[name] = { years: years, runs: runs, highest: highest };
    localStorage.setItem("players", JSON.stringify(players));

    // Add to search history (only once)
    if (!history.includes(name)) {
        history.push(name);
        localStorage.setItem("history", JSON.stringify(history));
    }

    showHistory();
    generateGraph(name, years, runs, highest);
}

// Generate chart
function generateGraph(name, years, runs, highest) {
    if (chart) chart.destroy();
    const ctx = document.getElementById("statsChart");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [
                { label: "Total Runs", data: runs, borderWidth: 3, tension: 0.3, fill: false },
                { label: "Highest Score", data: highest, borderWidth: 3, tension: 0.3, fill: false }
            ]
        },
        options: { responsive: true, plugins: { title: { display: true, text: name.toUpperCase() + " – Career History" } } }
    });
}

// Show history in professional table
function showHistory() {
    const tableBody = document.getElementById("historyTableBody");
    tableBody.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const players = JSON.parse(localStorage.getItem("players")) || {};

    history.forEach(name => {
        const data = players[name];
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${name}</td>
            <td>${data.years.join(", ")}</td>
            <td>${data.runs.join(", ")}</td>
            <td>${data.highest.join(", ")}</td>
        `;

        // Click row → load data into inputs and generate graph
        tr.onclick = function() {
            document.getElementById("playerName").value = name;
            document.getElementById("yearsInput").value = data.years.join(",");
            document.getElementById("runsInput").value = data.runs.join(",");
            document.getElementById("highestInput").value = data.highest.join(",");
            generateGraph(name, data.years, data.runs, data.highest);
        };

        tableBody.appendChild(tr);
    });
}
