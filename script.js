function filterPlayers() {
    // 1. Get the text from the search bar and make it lowercase
    let input = document.getElementById('playerSearch').value.toLowerCase();
    
    // 2. Select all sections that represent players
    let sections = document.querySelectorAll('.player-section');

    sections.forEach(section => {
        // 3. Look at the name inside the 'data-name' attribute
        let playerName = section.getAttribute('data-name');
        
        if (playerName) {
            let nameLower = playerName.toLowerCase();
            
            // 4. If the search text is found within the name, show it
            if (nameLower.includes(input)) {
                section.style.display = "flex"; // Show
            } else {
                section.style.display = "none"; // Hide
            }
        }
    });
}
// PART 1: The Data Bank (Quantitative Variables)
const playerRegistry = {
    "Rohit Sharma": { labels: ['Intl Runs', 'Intl Tons', 'T20I SR', 'Total Matches'], data: [20109, 50, 140,508], color: '#3498db' },
    "Smriti Mandhana": { labels: ['Intl Runs', 'Intl Tons', 'WT20I SR', 'Total Matches'], data: [10053, 17,122.4,281], color: '#e74c3c' },
    "Harmanpreet Kaur": { labels: ['Intl Runs', 'Intl Tons', 'WT20I SR', 'Total Matches'], data: [8278, 9, 110.5, 350], color: '#2ecc71' },
    "Virat Kohli": { labels: ['Intl Runs', 'Intl Tons', 'Strike Rate', 'Total Matches'], data: [27000, 85, 137.04, 311], color: '#f1c40f' },
    "Sachin Tendulkar": { labels: ['Intl Runs', 'Intl Tons', 'ODI SR', 'Total Matches'], data: [34357, 100,86.2,664], color: '#9b59b6' },
    "MS Dhoni": { labels: ['Intl Runs', 'Intl Tons', 'T20I SR', 'Total Matches'], data: [17266, 16, 126.7, 538], color: '#e67e22' }
};
function analyzePerformance(playerName, canvasId) {
    const canvas = document.getElementById(canvasId);
    
    // Safety Check: Is the canvas actually there?
    if (!canvas) {
        console.error("Canvas not found: " + canvasId);
        return;
    }

    const ctx = canvas.getContext('2d');

    // If a chart already exists on this canvas, destroy it first
    if (window[canvasId + 'Chart']) {
        window[canvasId + 'Chart'].destroy();
    }

    // Create the new chart
    window[canvasId + 'Chart'] = new Chart(ctx, {
        type: 'bar', // Or 'radar' as per your footer
        data: {
            labels: playerRegistry[playerName].labels,
            datasets: [{
                label: playerName + ' Stats',
                data: playerRegistry[playerName].data,
                backgroundColor: 'rgba(0, 74, 173, 0.6)', // Your new theme blue
                borderColor: '#004aad',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
function runComparison() {
    const p1Name = document.getElementById('player1').value;
    const p2Name = document.getElementById('player2').value;
    const resultDiv = document.getElementById('comparison-result');
    const canvas = document.getElementById('comparisonChart');

    // 1. Safety check for Registry
    if (!playerRegistry[p1Name] || !playerRegistry[p2Name]) {
        console.error("One of the selected players is missing in the Registry!");
        return;
    }

    const p1Data = playerRegistry[p1Name];
    const p2Data = playerRegistry[p2Name];

    // 2. Winner Text Logic
    let winnerMessage = "";
    if (p1Data.data[0] > p2Data.data[0]) {
        winnerMessage = `<div class="winner-badge">🏆 ${p1Name} has the higher career total!</div>`;
    } else if (p2Data.data[0] > p1Data.data[0]) {
        winnerMessage = `<div class="winner-badge">🏆 ${p2Name} has the higher career total!</div>`;
    } else {
        winnerMessage = `<div class="winner-badge">It's a Statistical Deadlock!</div>`;
    }
    resultDiv.innerHTML = winnerMessage;

    // 3. Chart Context
    const ctx = canvas.getContext('2d');
    if (window.comparisonChartInstance) {
        window.comparisonChartInstance.destroy();
    }

    // 4. Create the Multi-Bar Chart
    window.comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Runs', 'Total Tons', 'Strikke Rate', 'Total Matches'],
            datasets: [
                {
                    label: p1Name,
                    data: p1Data.data,
                    backgroundColor: '#004aad', // Navy
                    borderRadius: 5
                },
                {
                    label: p2Name,
                    data: p2Data.data,
                    backgroundColor: '#3498db', // Sky Blue
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
// Optional: Ensure search works even if user pastes text
document.getElementById('playerSearch').addEventListener('input', filterPlayers);