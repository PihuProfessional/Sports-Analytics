let athletes = [];
let charts = {};
let selectedAthletes = new Set();
let currentViewMode = 'all'; // 'all' or 'compare'
let filteredAthletes = []; // Store filtered/sorted results

// Initialize with sample data
function initializeSampleData() {
    const sampleAthletes = [
        { name: "Alex Johnson", endurance: 85, strength: 78, trainingLoad: 25, speed: 11.2 },
        { name: "Sarah Chen", endurance: 92, strength: 65, trainingLoad: 30, speed: 10.8 }
    ];
    
    sampleAthletes.forEach(athlete => {
        addAthleteData(athlete.name, athlete.endurance, athlete.strength, athlete.trainingLoad, athlete.speed);
    });
}

// Calculate Performance Score using Weighted Linear Model
function calculatePerformanceScore(endurance, strength, trainingLoad, speed) {
    // Convert speed to positive factor (lower time = better performance)
    const speedFactor = (20 - speed) * 5;
    
    // Weighted linear combination
    const weights = {
        endurance: 0.30,
        strength: 0.25,
        trainingLoad: 0.20,
        speed: 0.25
    };
    
    const performanceScore = 
        (endurance * weights.endurance) + 
        (strength * weights.strength) + 
        (trainingLoad * weights.trainingLoad) + 
        (speedFactor * weights.speed);
    
    return Math.round(performanceScore * 100) / 100; // Round to 2 decimal places
}

// Add athlete data
function addAthleteData(name, endurance, strength, trainingLoad, speed) {
    const performanceScore = calculatePerformanceScore(endurance, strength, trainingLoad, speed);
    
    const athlete = {
        id: Date.now() + Math.random(),
        name,
        endurance: parseFloat(endurance),
        strength: parseFloat(strength),
        trainingLoad: parseFloat(trainingLoad),
        speed: parseFloat(speed),
        performanceScore
    };
    
    athletes.push(athlete);
    updateDisplay();
    return athlete;
}

// Add athlete from form
function addAthlete() {
    const name = document.getElementById('athleteName').value.trim();
    const endurance = parseFloat(document.getElementById('endurance').value);
    const strength = parseFloat(document.getElementById('strength').value);
    const trainingLoad = parseFloat(document.getElementById('trainingLoad').value);
    const speed = parseFloat(document.getElementById('speed').value);
    
    // Validation
    if (!name) {
        alert('Please enter athlete name');
        return;
    }
    
    if (isNaN(endurance) || endurance < 1 || endurance > 100) {
        alert('Please enter valid endurance (1-100)');
        return;
    }
    
    if (isNaN(strength) || strength < 1 || strength > 100) {
        alert('Please enter valid strength (1-100)');
        return;
    }
    
    if (isNaN(trainingLoad) || trainingLoad < 1 || trainingLoad > 50) {
        alert('Please enter valid training load (1-50 hours)');
        return;
    }
    
    if (isNaN(speed) || speed < 8 || speed > 20) {
        alert('Please enter valid speed (8-20 seconds for 100m)');
        return;
    }
    
    addAthleteData(name, endurance, strength, trainingLoad, speed);
    
    // Clear form
    document.getElementById('athleteName').value = '';
    document.getElementById('endurance').value = '';
    document.getElementById('strength').value = '';
    document.getElementById('trainingLoad').value = '';
    document.getElementById('speed').value = '';
}

// Remove athlete
function removeAthlete(id) {
    athletes = athletes.filter(athlete => athlete.id !== id);
    updateDisplay();
}

// Update all displays
function updateDisplay() {
    updateTable();
    updateStatistics();
    updateCharts();
    updateInterpretation();
    updateComparisonSection();
}

// Update athlete table
function updateTable() {
    const tbody = document.getElementById('athleteTableBody');
    tbody.innerHTML = '';
    
    const displayAthletes = currentViewMode === 'compare' && selectedAthletes.size > 0 
        ? athletes.filter(a => selectedAthletes.has(a.id))
        : athletes;
    
    displayAthletes.forEach(athlete => {
        const row = tbody.insertRow();
        const isSelected = selectedAthletes.has(athlete.id);
        row.innerHTML = `
            <td class="px-4 py-2 border text-center">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleAthleteSelection(${athlete.id})" class="w-4 h-4">
            </td>
            <td class="px-4 py-2 border font-semibold">${athlete.name}</td>
            <td class="px-4 py-2 border">${athlete.endurance}</td>
            <td class="px-4 py-2 border">${athlete.strength}</td>
            <td class="px-4 py-2 border">${athlete.trainingLoad}</td>
            <td class="px-4 py-2 border">${athlete.speed}s</td>
            <td class="px-4 py-2 border font-semibold text-blue-600">${athlete.performanceScore}</td>
            <td class="px-4 py-2 border">
                <button onclick="removeAthlete(${athlete.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                    Remove
                </button>
            </td>
        `;
    });
}

// Toggle athlete selection for comparison
function toggleAthleteSelection(athleteId) {
    if (selectedAthletes.has(athleteId)) {
        selectedAthletes.delete(athleteId);
    } else {
        selectedAthletes.add(athleteId);
    }
    updateComparisonSection();
}

// Set view mode
function setViewMode(mode) {
    currentViewMode = mode;
    
    // Update button styles
    const viewAllBtn = document.getElementById('viewAllBtn');
    const compareBtn = document.getElementById('compareBtn');
    
    if (mode === 'all') {
        viewAllBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition';
        compareBtn.className = 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition';
        document.getElementById('comparisonSection').style.display = 'none';
    } else {
        viewAllBtn.className = 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition';
        compareBtn.className = 'bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition';
        // Always update comparison section when switching to compare mode
        updateComparisonSection();
    }
    
    updateTable();
    updateCharts();
}

// Clear selection
function clearSelection() {
    selectedAthletes.clear();
    document.getElementById('comparisonSection').style.display = 'none';
    setViewMode('all');
}

// Update comparison section
function updateComparisonSection() {
    const comparisonSection = document.getElementById('comparisonSection');
    const comparisonContent = document.getElementById('comparisonContent');
    
    // Debug: Log current state
    console.log('updateComparisonSection called:', {
        selectedCount: selectedAthletes.size,
        viewMode: currentViewMode,
        athletesCount: athletes.length
    });
    
    if (selectedAthletes.size === 0) {
        comparisonSection.style.display = 'none';
        return;
    }
    
    if (currentViewMode === 'compare') {
        comparisonSection.style.display = 'block';
        const selectedAthleteData = athletes.filter(a => selectedAthletes.has(a.id));
        
        console.log('Selected athletes for comparison:', selectedAthleteData.map(a => a.name));
        
        let comparisonHTML = '';
        
        if (selectedAthleteData.length === 1) {
            // Single athlete detailed view
            const athlete = selectedAthleteData[0];
            comparisonHTML = `
                <h4 class="font-semibold text-lg mb-4 text-blue-800">📊 Detailed Analysis: ${athlete.name}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-blue-800">Performance Score</h5>
                        <p class="text-2xl font-bold text-blue-600">${athlete.performanceScore}</p>
                        <p class="text-sm text-gray-600">Overall Rating</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-green-800">Endurance</h5>
                        <p class="text-2xl font-bold text-green-600">${athlete.endurance}/100</p>
                        <p class="text-sm text-gray-600">Stamina Level</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-purple-800">Strength</h5>
                        <p class="text-2xl font-bold text-purple-600">${athlete.strength}/100</p>
                        <p class="text-sm text-gray-600">Power Level</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-yellow-800">Training Load</h5>
                        <p class="text-2xl font-bold text-yellow-600">${athlete.trainingLoad} hrs</p>
                        <p class="text-sm text-gray-600">Weekly Training</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-red-800">Speed</h5>
                        <p class="text-2xl font-bold text-red-600">${athlete.speed}s</p>
                        <p class="text-sm text-gray-600">100m Time</p>
                    </div>
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h5 class="font-semibold text-indigo-800">Rank</h5>
                        <p class="text-2xl font-bold text-indigo-600">#${athletes.sort((a,b) => b.performanceScore - a.performanceScore).findIndex(a => a.id === athlete.id) + 1}</p>
                        <p class="text-sm text-gray-600">Among All Athletes</p>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 class="font-semibold text-gray-800 mb-2">Performance Assessment:</h5>
                    <p class="text-gray-700">${generateAthleteAssessment(athlete)}</p>
                </div>
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h5 class="font-semibold text-blue-800 mb-2">🎯 Key Conclusions & Recommendations:</h5>
                    <div class="text-gray-700">${generateAthleteConclusions(athlete)}</div>
                </div>
            `;
        } else {
            // Multiple athletes comparison
            comparisonHTML = `
                <h4 class="font-semibold text-lg mb-4 text-green-800">⚖️ Comparing ${selectedAthleteData.length} Athletes</h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 border text-left">Athlete</th>
                                <th class="px-4 py-2 border text-center">Performance Score</th>
                                <th class="px-4 py-2 border text-center">Endurance</th>
                                <th class="px-4 py-2 border text-center">Strength</th>
                                <th class="px-4 py-2 border text-center">Training Load</th>
                                <th class="px-4 py-2 border text-center">Speed</th>
                                <th class="px-4 py-2 border text-center">Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedAthleteData.sort((a,b) => b.performanceScore - a.performanceScore).map((athlete, index) => `
                                <tr class="${index === 0 ? 'bg-green-50' : ''}">
                                    <td class="px-4 py-2 border font-semibold">${athlete.name}</td>
                                    <td class="px-4 py-2 border text-center font-bold text-blue-600">${athlete.performanceScore}</td>
                                    <td class="px-4 py-2 border text-center">${athlete.endurance}</td>
                                    <td class="px-4 py-2 border text-center">${athlete.strength}</td>
                                    <td class="px-4 py-2 border text-center">${athlete.trainingLoad}</td>
                                    <td class="px-4 py-2 border text-center">${athlete.speed}s</td>
                                    <td class="px-4 py-2 border text-center">
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">#${index + 1}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 class="font-semibold text-gray-800 mb-2">Comparison Summary:</h5>
                    <p class="text-gray-700">${generateComparisonSummary(selectedAthleteData)}</p>
                </div>
                <div class="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h5 class="font-semibold text-green-800 mb-2">🏆 Comparative Analysis & Strategic Insights:</h5>
                    <div class="text-gray-700">${generateComparisonConclusions(selectedAthleteData)}</div>
                </div>
            `;
        }
        
        console.log('Setting comparison HTML...');
        comparisonContent.innerHTML = comparisonHTML;
    } else {
        comparisonSection.style.display = 'none';
    }
}

// Generate athlete assessment
function generateAthleteAssessment(athlete) {
    const assessments = [];
    
    if (athlete.performanceScore >= 70) {
        assessments.push("Excellent overall performance with exceptional capabilities");
    } else if (athlete.performanceScore >= 50) {
        assessments.push("Good performance with solid athletic abilities");
    } else {
        assessments.push("Developing performance with room for improvement");
    }
    
    if (athlete.endurance >= 85) {
        assessments.push("Outstanding endurance levels");
    } else if (athlete.endurance >= 70) {
        assessments.push("Good stamina foundation");
    }
    
    if (athlete.strength >= 85) {
        assessments.push("Exceptional strength capabilities");
    } else if (athlete.strength >= 70) {
        assessments.push("Solid strength base");
    }
    
    if (athlete.trainingLoad >= 25) {
        assessments.push("High training commitment");
    } else if (athlete.trainingLoad >= 15) {
        assessments.push("Moderate training regimen");
    }
    
    if (athlete.speed <= 11) {
        assessments.push("Excellent speed capabilities");
    } else if (athlete.speed <= 12) {
        assessments.push("Good speed performance");
    }
    
    return assessments.join(". ") + ".";
}

// Generate detailed conclusions for individual athlete
function generateAthleteConclusions(athlete) {
    const conclusions = [];
    const rank = athletes.sort((a,b) => b.performanceScore - a.performanceScore).findIndex(a => a.id === athlete.id) + 1;
    
    // Performance Level Conclusion
    if (athlete.performanceScore >= 80) {
        conclusions.push(`<strong>Elite Performance:</strong> ${athlete.name} demonstrates exceptional athletic capabilities with a performance score of ${athlete.performanceScore.toFixed(1)}, placing them in top tier of athletes.`);
    } else if (athlete.performanceScore >= 60) {
        conclusions.push(`<strong>Strong Performance:</strong> ${athlete.name} shows solid athletic abilities with a performance score of ${athlete.performanceScore.toFixed(1)}, indicating competitive potential.`);
    } else {
        conclusions.push(`<strong>Development Potential:</strong> ${athlete.name} has a performance score of ${athlete.performanceScore.toFixed(1)}, showing room for growth and improvement.`);
    }
    
    // Strengths Analysis
    const strengths = [];
    if (athlete.endurance >= 85) strengths.push("exceptional endurance");
    if (athlete.strength >= 85) strengths.push("superior strength");
    if (athlete.speed <= 11) strengths.push("outstanding speed");
    if (athlete.trainingLoad >= 25) strengths.push("excellent training commitment");
    
    if (strengths.length > 0) {
        conclusions.push(`<strong>Key Strengths:</strong> This athlete exhibits ${strengths.join(", ")}, which are significant competitive advantages.`);
    }
    
    // Areas for Improvement
    const improvements = [];
    if (athlete.endurance < 70) improvements.push("endurance development");
    if (athlete.strength < 70) improvements.push("strength training");
    if (athlete.speed > 12) improvements.push("speed enhancement");
    if (athlete.trainingLoad < 15) improvements.push("increased training volume");
    
    if (improvements.length > 0) {
        conclusions.push(`<strong>Development Areas:</strong> Focus on ${improvements.join(", ")} could significantly enhance overall performance.`);
    }
    
    // Training Recommendations
    if (athlete.endurance < athlete.strength && athlete.endurance < 80) {
        conclusions.push(`<strong>Training Recommendation:</strong> Prioritize cardiovascular conditioning and endurance training to balance athletic profile.`);
    } else if (athlete.strength < athlete.endurance && athlete.strength < 80) {
        conclusions.push(`<strong>Training Recommendation:</strong> Incorporate more strength and power training to complement existing endurance base.`);
    }
    
    if (athlete.trainingLoad < 20 && athlete.performanceScore < 60) {
        conclusions.push(`<strong>Training Load Adjustment:</strong> Consider increasing weekly training volume to 20-25 hours to stimulate performance improvements.`);
    } else if (athlete.trainingLoad > 30 && athlete.performanceScore < 70) {
        conclusions.push(`<strong>Training Optimization:</strong> Current training load is high but performance suggests need for better periodization and recovery strategies.`);
    }
    
    // Competitive Positioning
    if (rank <= 2) {
        conclusions.push(`<strong>Competitive Edge:</strong> Ranked #${rank} among all athletes, this performer is ready for elite competition and should maintain current training focus.`);
    } else if (rank <= athletes.length * 0.5) {
        conclusions.push(`<strong>Competitive Position:</strong> Ranked #${rank}, this athlete has solid competitive standing and potential for advancement with targeted improvements.`);
    } else {
        conclusions.push(`<strong>Growth Opportunity:</strong> Currently ranked #${rank}, this athlete shows promise and could benefit from a comprehensive development program.`);
    }
    
    return conclusions.map(c => `<div class="mb-2">${c}</div>`).join('');
}

// Generate comparison summary
function generateComparisonSummary(athletes) {
    const sorted = athletes.sort((a,b) => b.performanceScore - a.performanceScore);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const avgScore = athletes.reduce((sum, a) => sum + a.performanceScore, 0) / athletes.length;
    
    let summary = `Top performer is ${top.name} with a score of ${top.performanceScore.toFixed(2)}. `;
    
    if (athletes.length > 2) {
        summary += `The performance range spans ${(top.performanceScore - bottom.performanceScore).toFixed(2)} points. `;
    }
    
    summary += `Average performance among selected athletes is ${avgScore.toFixed(2)}. `;
    
    // Find strongest areas
    const avgEndurance = athletes.reduce((sum, a) => sum + a.endurance, 0) / athletes.length;
    const avgStrength = athletes.reduce((sum, a) => sum + a.strength, 0) / athletes.length;
    const avgTrainingLoad = athletes.reduce((sum, a) => sum + a.trainingLoad, 0) / athletes.length;
    const avgSpeed = athletes.reduce((sum, a) => sum + a.speed, 0) / athletes.length;
    
    if (avgEndurance > avgStrength && avgEndurance > avgTrainingLoad && avgEndurance > (20 - avgSpeed) * 5) {
        summary += "This group shows particularly strong endurance capabilities.";
    } else if (avgStrength > avgEndurance && avgStrength > avgTrainingLoad && avgStrength > (20 - avgSpeed) * 5) {
        summary += "This group demonstrates exceptional strength levels.";
    } else if (avgTrainingLoad > 20) {
        summary += "This group maintains high training loads consistently.";
    } else {
        summary += "This group shows balanced athletic abilities across all areas.";
    }
    
    return summary;
}

// Generate detailed conclusions for athlete comparisons
function generateComparisonConclusions(athletes) {
    const conclusions = [];
    const sorted = athletes.sort((a,b) => b.performanceScore - a.performanceScore);
    const top = sorted[0];
    const second = sorted[1];
    
    if (athletes.length >= 2) {
        conclusions.push(`<strong>Performance Gap:</strong> There's a ${(top.performanceScore - second.performanceScore).toFixed(1)} point difference between the top performer (${top.name}) and the second-ranked athlete (${second.name}).`);
        
        if (top.performanceScore - second.performanceScore > 15) {
            conclusions.push(`<strong>Competitive Analysis:</strong> ${top.name} has a significant competitive advantage and may need to train with higher-level partners to maintain challenge.`);
        } else if (top.performanceScore - second.performanceScore < 5) {
            conclusions.push(`<strong>Tight Competition:</strong> The performance gap between ${top.name} and ${second.name} is minimal, indicating closely matched abilities and potential for leadership changes.`);
        }
    }
    
    // Training Load Analysis
    const avgTrainingLoad = athletes.reduce((sum, a) => sum + a.trainingLoad, 0) / athletes.length;
    const highLoadAthletes = athletes.filter(a => a.trainingLoad > 30);
    const lowLoadAthletes = athletes.filter(a => a.trainingLoad < 20);
    
    if (highLoadAthletes.length > 0) {
        conclusions.push(`<strong>Training Intensity:</strong> ${highLoadAthletes.map(a => a.name).join(", ")} show high training commitment (>30 hrs/week), which requires careful periodization to prevent burnout.`);
    }
    
    if (lowLoadAthletes.length > 0) {
        conclusions.push(`<strong>Training Potential:</strong> ${lowLoadAthletes.map(a => a.name).join(", ")} have room to increase training volume (<20 hrs/week) for potential performance gains.`);
    }
    
    // Speed Analysis
    const fastAthletes = athletes.filter(a => a.speed <= 11);
    const slowAthletes = athletes.filter(a => a.speed > 12);
    
    if (fastAthletes.length > 0) {
        conclusions.push(`<strong>Speed Advantage:</strong> ${fastAthletes.map(a => a.name).join(", ")} possess elite speed capabilities (≤11s 100m), providing significant competitive edge in explosive sports.`);
    }
    
    if (slowAthletes.length > 0) {
        conclusions.push(`<strong>Speed Development:</strong> ${slowAthletes.map(a => a.name).join(", ")} could benefit from focused speed and acceleration training to improve overall performance.`);
    }
    
    // Balanced Athletes
    const balancedAthletes = athletes.filter(a => 
        Math.abs(a.endurance - a.strength) < 15 && 
        a.trainingLoad >= 20 && a.trainingLoad <= 30 &&
        a.speed >= 10 && a.speed <= 12
    );
    
    if (balancedAthletes.length > 0) {
        conclusions.push(`<strong>Well-Rounded Performers:</strong> ${balancedAthletes.map(a => a.name).join(", ")} demonstrate balanced athletic profiles with consistent performance across all metrics.`);
    }
    
    return conclusions.map(c => `<div class="mb-2">${c}</div>`).join('');
}

// Update statistics
function updateStatistics() {
    if (athletes.length === 0) {
        document.getElementById('meanPerformance').textContent = '-';
        document.getElementById('maxPerformance').textContent = '-';
        document.getElementById('minPerformance').textContent = '-';
        document.getElementById('totalAthletes').textContent = '0';
        return;
    }
    
    const scores = athletes.map(a => a.performanceScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    document.getElementById('meanPerformance').textContent = mean.toFixed(2);
    document.getElementById('maxPerformance').textContent = max.toFixed(2);
    document.getElementById('minPerformance').textContent = min.toFixed(2);
    document.getElementById('totalAthletes').textContent = athletes.length;
}

// Update charts
function updateCharts() {
    updateBarChart();
    updateLineChart();
    updateRadarChart();
    updateScatterChart();
}

// Update Bar Chart
function updateBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (charts.bar) {
        charts.bar.destroy();
    }
    
    const displayAthletes = currentViewMode === 'compare' && selectedAthletes.size > 0 
        ? athletes.filter(a => selectedAthletes.has(a.id))
        : athletes;
    
    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayAthletes.map(a => a.name),
            datasets: [{
                label: 'Performance Score',
                data: displayAthletes.map(a => a.performanceScore),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(244, 63, 94, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(251, 146, 60, 1)',
                    'rgba(244, 63, 94, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Performance Score',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update Line Chart
function updateLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (charts.line) {
        charts.line.destroy();
    }
    
    const displayAthletes = currentViewMode === 'compare' && selectedAthletes.size > 0 
        ? athletes.filter(a => selectedAthletes.has(a.id))
        : athletes;
    
    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: displayAthletes.map(a => a.name),
            datasets: [{
                label: 'Endurance',
                data: displayAthletes.map(a => a.endurance),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }, {
                label: 'Training Load',
                data: displayAthletes.map(a => a.trainingLoad * 3.33), // Scale to 0-100 range
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label === 'Training Load') {
                                return `${label}: ${(context.parsed.y / 3.33).toFixed(1)} hrs`;
                            }
                            return `${label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

// Update Radar Chart (replacing Pie Chart)
function updateRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    if (charts.radar) {
        charts.radar.destroy();
    }
    
    const displayAthletes = currentViewMode === 'compare' && selectedAthletes.size > 0 
        ? athletes.filter(a => selectedAthletes.has(a.id))
        : athletes;
    
    // Limit to top 5 athletes for better visibility
    const topAthletes = displayAthletes
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 5);
    
    charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Endurance', 'Strength', 'Training Load', 'Speed'],
            datasets: topAthletes.map((athlete, index) => ({
                label: athlete.name,
                data: [
                    athlete.endurance,
                    athlete.strength,
                    athlete.trainingLoad * 2, // Scale training load for better visibility
                    (20 - athlete.speed) * 5 // Convert speed to positive factor
                ],
                backgroundColor: `rgba(${59 + index * 40}, ${130 - index * 20}, 246, 0.2)`,
                borderColor: `rgba(${59 + index * 40}, ${130 - index * 20}, 246, 1)`,
                borderWidth: 2,
                pointBackgroundColor: `rgba(${59 + index * 40}, ${130 - index * 20}, 246, 1)`,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: `rgba(${59 + index * 40}, ${130 - index * 20}, 246, 1)`
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            let value = context.parsed.r;
                            
                            if (label === 'Training Load') {
                                value = value / 2; // Unscale for display
                                return `${label}: ${value.toFixed(1)} hrs`;
                            } else if (label === 'Speed') {
                                const speed = 20 - (value / 5);
                                return `${label}: ${speed.toFixed(1)}s (100m)`;
                            }
                            return `${label}: ${value.toFixed(1)}`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'transparent'
                    },
                    pointLabels: {
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#374151'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update Scatter Chart
function updateScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    
    if (charts.scatter) {
        charts.scatter.destroy();
    }
    
    const displayAthletes = currentViewMode === 'compare' && selectedAthletes.size > 0 
        ? athletes.filter(a => selectedAthletes.has(a.id))
        : athletes;
    
    charts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Athletes',
                data: displayAthletes.map(a => ({ x: a.endurance, y: a.performanceScore })),
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const athlete = displayAthletes[context.dataIndex];
                            return [
                                `Athlete: ${athlete.name}`,
                                `Endurance: ${context.parsed.x}`,
                                `Performance: ${context.parsed.y.toFixed(1)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Endurance',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Performance Score',
                        color: '#374151',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update interpretation
function updateInterpretation() {
    const findingsDiv = document.getElementById('keyFindings');
    
    if (athletes.length === 0) {
        findingsDiv.innerHTML = '<li>Add athlete data to see statistical analysis</li>';
        return;
    }
    
    const findings = [];
    
    // Calculate statistics
    const scores = athletes.map(a => a.performanceScore);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const bestAthlete = athletes.find(a => a.performanceScore === maxScore);
    
    // Find most influential factor
    const avgEndurance = athletes.reduce((sum, a) => sum + a.endurance, 0) / athletes.length;
    const avgStrength = athletes.reduce((sum, a) => sum + a.strength, 0) / athletes.length;
    const avgTrainingLoad = athletes.reduce((sum, a) => sum + a.trainingLoad, 0) / athletes.length;
    const avgSpeed = athletes.reduce((sum, a) => sum + a.speed, 0) / athletes.length;
    
    // Correlation analysis (simplified)
    const enduranceCorrelation = calculateCorrelation(athletes.map(a => a.endurance), scores);
    const strengthCorrelation = calculateCorrelation(athletes.map(a => a.strength), scores);
    
    findings.push(`<strong>Top Performer:</strong> ${bestAthlete.name} with a score of ${maxScore.toFixed(2)}`);
    findings.push(`<strong>Average Performance:</strong> ${meanScore.toFixed(2)} indicates ${meanScore > 50 ? 'above average' : 'below average'} overall performance level`);
    findings.push(`<strong>Performance Range:</strong> ${minScore.toFixed(2)} to ${maxScore.toFixed(2)} shows ${(maxScore - minScore).toFixed(2)} point variation`);
    
    if (Math.abs(enduranceCorrelation) > Math.abs(strengthCorrelation)) {
        findings.push(`<strong>Most Influential Factor:</strong> Endurance shows strongest correlation with performance (${enduranceCorrelation.toFixed(3)})`);
    } else {
        findings.push(`<strong>Most Influential Factor:</strong> Strength shows strongest correlation with performance (${strengthCorrelation.toFixed(3)})`);
    }
    
    findings.push(`<strong>Training Load Analysis:</strong> Average of ${avgTrainingLoad.toFixed(1)} hours/week suggests ${avgTrainingLoad > 25 ? 'intensive' : 'moderate'} training regimen`);
    findings.push(`<strong>Speed Performance:</strong> Average 100m time of ${avgSpeed.toFixed(1)}s indicates ${avgSpeed < 11 ? 'excellent' : 'good'} speed capabilities`);
    
    findingsDiv.innerHTML = findings.map(f => `<li>${f}</li>`).join('');
}

// Calculate correlation coefficient (Pearson)
function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

// Export data function
function exportData() {
    if (athletes.length === 0) {
        alert('No data to export');
        return;
    }
    
    let csv = 'Name,Endurance,Strength,Training Load,Speed,Performance Score\n';
    athletes.forEach(athlete => {
        csv += `${athlete.name},${athlete.endurance},${athlete.strength},${athlete.trainingLoad},${athlete.speed},${athlete.performanceScore}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'athlete_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});
