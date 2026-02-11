<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Player Efficiency - Statistical Normalization</title>

<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Oswald:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
  /* --- DARK THEME CORE --- */
  body { background-color: #050505; color: white; font-family: 'Montserrat', sans-serif; margin: 0; padding: 0; overflow-x: hidden; }
  .cyan { color: #00cccc; }

  /* --- DASHBOARD --- */
  .dashboard-container { max-width: 1300px; margin: 50px auto; padding: 30px; background: rgba(17, 17, 17, 0.95); border: 1px solid #333; border-top: 4px solid #00cccc; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
  .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00cccc; padding-bottom: 20px; margin-bottom: 30px; }
  .page-header h1 { font-family: 'Oswald', sans-serif; font-size: 40px; margin: 0; text-transform: uppercase; }
  .page-header p { color: #888; font-size: 14px; margin-top: 5px; }
  
  .btn-back { background: transparent; border: 1px solid #444; color: #aaa; padding: 8px 15px; cursor: pointer; font-size: 12px; text-transform: uppercase; }
  .btn-back:hover { border-color: #00cccc; color: #00cccc; }

  /* --- LAYOUT --- */
  .main-grid { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }

  /* --- INPUT PANEL --- */
  .input-panel { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 25px; }
  .input-panel h3 { color: #00cccc; font-family: 'Oswald', sans-serif; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px; }
  
  .form-group { margin-bottom: 15px; }
  .form-group label { display: block; color: #aaa; font-size: 12px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
  input { width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: white; font-family: 'Montserrat', sans-serif; border-radius: 4px; outline: none; transition: 0.3s; box-sizing: border-box; }
  input:focus { border-color: #00cccc; box-shadow: 0 0 10px rgba(0, 204, 204, 0.2); }

  /* --- BUTTONS --- */
  .action-buttons { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .btn-action { padding: 12px; font-family: 'Oswald', sans-serif; text-transform: uppercase; font-weight: bold; border: none; cursor: pointer; transition: 0.3s; width: 100%; border-radius: 4px; }
  .btn-add { background: #00cccc; color: black; }
  .btn-add:hover { background: white; box-shadow: 0 0 15px rgba(0, 204, 204, 0.6); }
  .btn-delete { background: transparent; color: #ff4444; border: 1px solid #ff4444; }
  .btn-delete:hover { background: #ff4444; color: white; }

  /* --- MATH BOX --- */
  .math-box { background: rgba(0, 204, 204, 0.05); border-left: 3px solid #00cccc; padding: 15px; margin-top: 25px; font-family: 'Courier New', monospace; font-size: 11px; color: #ccc; line-height: 1.6; }
  .math-box strong { color: white; font-family: 'Montserrat', sans-serif; font-size: 12px; }

  /* --- TABLE --- */
  .data-panel { background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a1a; color: #00cccc; padding: 15px; font-family: 'Oswald', sans-serif; text-transform: uppercase; font-size: 12px; border-bottom: 2px solid #333; text-align: left; }
  td { padding: 12px 15px; border-bottom: 1px solid #222; color: #ddd; font-size: 13px; cursor: pointer; transition: 0.2s; }
  tr:hover td { background: rgba(255,255,255,0.05); }
  tr.selected td { background: rgba(0, 204, 204, 0.1); border-left: 3px solid #00cccc; }

  .z-positive { color: #00ff88; font-weight: bold; }
  .z-negative { color: #ff4444; }

  /* --- CHART --- */
  .chart-box { background: #0a0a0a; padding: 20px; border: 1px solid #333; border-radius: 8px; height: 350px; width: 100%; margin-top: 25px; box-sizing: border-box; }
</style>
</head>

<body>

<div class="dashboard-container" id="dashboard">
    <div class="page-header">
        <div>
            <h1>EFFICIENCY <span class="cyan">NORMALIZATION</span></h1>
            <p>Composite Efficiency Index (η) & Statistical Z-Score (Z)</p>
        </div>
        <button class="btn-back" onclick="window.location.href='index.html'">Back to Home</button>
    </div>

    <div class="main-grid">
        
        <div class="left-col">
            <div class="input-panel">
                <h3><i class="fas fa-database"></i> Data Entry</h3>
                
                <div class="form-group">
                    <label>Variable Identifier (Name)</label>
                    <input type="text" id="playerName" placeholder="e.g. V. Kohli">
                </div>
                <div class="form-group">
                    <label>Matches (n)</label>
                    <input type="number" id="matches" placeholder="Total matches">
                </div>
                <div class="form-group">
                    <label>Total Runs (Σr)</label>
                    <input type="number" id="runs" placeholder="Total runs">
                </div>

                <div class="action-buttons">
                    <button class="btn-action btn-add" onclick="addPlayer()">Calculate & Insert</button>
                    <button class="btn-action btn-delete" onclick="deletePlayer()">Remove Selected Vector</button>
                </div>

                <div class="math-box">
                    <strong>1. Composite Index (η)</strong><br>
                    η = (0.4 * μ) + (0.3 * S) + (0.3 * R/n)<br><br>
                    
                    <strong>2. Standard Deviation (σ)</strong><br>
                    σ = √ [ Σ(η - η̄)² / N ]<br><br>
                    
                    <strong>3. Z-Score (Z)</strong><br>
                    Z = (η - η̄) / σ<br>
                    <em>Measures how many standard deviations a player is from the dataset mean. Z > 0 is above average.</em>
                </div>
            </div>
        </div>

        <div class="right-col">
            <div class="data-panel" style="overflow-x:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Player (x)</th>
                            <th>Matches (n)</th>
                            <th>Runs (Σr)</th>
                            <th>Mean (μ)</th>
                            <th>Strike (S)</th>
                            <th>Index (η)</th>
                            <th>Z-Score (Z)</th>
                        </tr>
                    </thead>
                    <tbody id="playerTable">
                        </tbody>
                </table>
            </div>

            <div class="chart-box">
                <canvas id="zScoreChart"></canvas>
            </div>
        </div>

    </div>
</div>

<script>
// --- CONFIGURATION ---
let selectedIndex = -1;
let chartInstance = null;

// Initial Data Matrix
let players = [
    { name: "V. Kohli", matches: 280, runs: 12500 },
    { name: "R. Sharma", matches: 240, runs: 10000 },
    { name: "S. Gill", matches: 50, runs: 2500 },
    { name: "K. Rahul", matches: 150, runs: 5500 }
];

// --- 1. MATHEMATICAL LOGIC ---
function computeBaseMetrics() {
    // Pass 1: Calculate raw formulas for each player
    players.forEach(p => {
        p.average = p.matches > 0 ? (p.runs / (p.matches * 0.8)) : 0; 
        
        let estBalls = p.matches * 40; 
        p.strikeRate = estBalls > 0 ? (p.runs / estBalls) * 100 : 0;
        
        p.runsPerMatch = p.matches > 0 ? p.runs / p.matches : 0;
        
        // Composite Index (η)
        p.efficiency = (p.average * 0.4) + (p.strikeRate * 0.3) + (p.runsPerMatch * 0.3);
    });

    // Pass 2: Calculate Z-Scores (Requires population mean and standard dev)
    if(players.length === 0) return;

    // Calculate Mean (η̄)
    let totalEta = players.reduce((sum, p) => sum + p.efficiency, 0);
    let meanEta = totalEta / players.length;

    // Calculate Variance & Standard Deviation (σ)
    let varianceSum = players.reduce((sum, p) => sum + Math.pow(p.efficiency - meanEta, 2), 0);
    let standardDeviation = Math.sqrt(varianceSum / players.length);

    // Calculate Z-Score for each player: Z = (x - μ) / σ
    players.forEach(p => {
        if (standardDeviation === 0) {
            p.zScore = 0; // Prevent divide by zero if all players are identical
        } else {
            p.zScore = (p.efficiency - meanEta) / standardDeviation;
        }
    });
}

// --- 2. CRUD FUNCTIONS ---
function addPlayer() {
    const name = document.getElementById("playerName").value;
    const matches = Number(document.getElementById("matches").value);
    const runs = Number(document.getElementById("runs").value);

    if (!name || matches <= 0) return alert("Mathematical Error: Invalid variables.");

    players.push({ name, matches, runs });
    
    document.getElementById("playerName").value = "";
    document.getElementById("matches").value = "";
    document.getElementById("runs").value = "";
    
    computeAndRender();
}

function deletePlayer() {
    if (selectedIndex === -1) return alert("Select a vector row to remove.");
    
    players.splice(selectedIndex, 1);
    selectedIndex = -1;
    computeAndRender();
}

function computeAndRender() {
    computeBaseMetrics();
    renderTable();
}

// --- 3. UI RENDERING ---
function renderTable() {
    const tbody = document.getElementById("playerTable");
    tbody.innerHTML = "";

    players.forEach((p, index) => {
        let row = document.createElement("tr");
        if(index === selectedIndex) row.classList.add("selected");
        
        let zClass = p.zScore >= 0 ? "z-positive" : "z-negative";
        let zSign = p.zScore > 0 ? "+" : "";

        row.innerHTML = `
            <td style="font-weight:bold; color:white;">${p.name}</td>
            <td>${p.matches}</td>
            <td>${p.runs}</td>
            <td>${p.average.toFixed(1)}</td>
            <td>${p.strikeRate.toFixed(1)}</td>
            <td style="color:#00cccc; font-weight:bold;">${p.efficiency.toFixed(1)}</td>
            <td class="${zClass}">${zSign}${p.zScore.toFixed(2)}</td>
        `;
        
        row.onclick = () => {
            selectedIndex = index;
            renderTable(); // Re-render to show selection styling
        };

        tbody.appendChild(row);
    });

    drawChart();
}

// --- 4. DATA VISUALIZATION (Z-SCORE DISTRIBUTION) ---
function drawChart() {
    const ctx = document.getElementById("zScoreChart").getContext("2d");

    if (chartInstance) { chartInstance.destroy(); }

    // Plot Z-Scores
    let labels = players.map(p => p.name);
    let zData = players.map(p => p.zScore);
    
    // Color code based on standard deviation
    let bgColors = zData.map(z => z >= 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 68, 68, 0.6)');
    let borderColors = zData.map(z => z >= 0 ? '#00ff88' : '#ff4444');

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Z-Score (Standard Deviations from Mean)",
                data: zData,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } },
                tooltip: { callbacks: { label: function(context) { return 'Z-Score: ' + context.raw.toFixed(2); } } }
            },
            scales: {
                y: {
                    grid: { color: "#333", zeroLineColor: "#fff" },
                    ticks: { color: "#888" },
                    title: { display: true, text: 'Z-Score (Z)', color: '#00cccc' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#fff" }
                }
            }
        }
    });
}

// Initialize
computeAndRender();

</script>

</body>
</html>
