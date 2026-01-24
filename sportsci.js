class CricketDashboard {
    constructor() {
        this.players = [];this.charts = {};this.compareCharts = {};this.selectedAthletes = [];this.init();
    }

    init() {
        this.loadFromLocalStorage();this.setupEventListeners();this.updateDashboard();
    }
    setupEventListeners() {
        document.getElementById('addPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();this.addPlayer();
        });
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addPlayerModal');
            if (e.target === modal) {
                this.closeAddPlayerModal();
            }
        });
    }
    // Player Management
    addPlayer() {
        const formData = this.getFormData();const player = this.createPlayer(formData);
        this.players.push(player);this.saveToLocalStorage();this.updateDashboard();
        this.showSuccessMessage('Athlete added successfully!');
        document.getElementById('addPlayerForm').reset();
        this.closeAddPlayerModal();
    }

    getFormData() {
        return {
            playerName: document.getElementById('playerName').value,position: document.getElementById('position').value,stamina: parseInt(document.getElementById('stamina').value),
            battingPower: parseInt(document.getElementById('battingPower').value),bowlingSpeed: parseInt(document.getElementById('bowlingSpeed').value),trainingHours: parseInt(document.getElementById('trainingHours').value),fatigueLevel: parseInt(document.getElementById('fatigueLevel').value),recoveryHours: parseFloat(document.getElementById('recoveryHours').value),
            previousInjuries: parseInt(document.getElementById('previousInjuries').value),trainingPhase: document.getElementById('trainingPhase').value,trainingIntensity: document.getElementById('trainingIntensity').value
        };
    }
    createPlayer(data) {
        const performanceScore = this.calculatePerformanceScore(data);
        const fitnessLevel = this.calculateFitnessLevel(data);
        const injuryRisk = this.calculateInjuryRisk(data);
        const medicalStatus = this.getMedicalStatus(injuryRisk, fitnessLevel);
        const recoveryStatus = this.calculateRecoveryStatus(data);
        const performanceTrend = this.calculatePerformanceTrend(data);
        return {
            id: Date.now(),
            ...data,performanceScore,fitnessLevel,injuryRisk,medicalStatus,recoveryStatus,performanceTrend,addedDate: new Date().toISOString()
        };
    }
    // Calculations
    calculatePerformanceScore(data) {
        const weights = {
            stamina: 0.2,battingPower: 0.25,bowlingSpeed: 0.25,fitness: 0.15,recovery: 0.15
        };

        const fitness = (100 - data.fatigueLevel) * 0.7 + (data.recoveryHours / 24) * 100 * 0.3;
        const recovery = Math.min((data.recoveryHours / 8) * 100, 100);

        const score = (
            data.stamina * weights.stamina +data.battingPower * weights.battingPower +data.bowlingSpeed * weights.bowlingSpeed +fitness * weights.fitness +recovery * weights.recovery
        );
        return Math.round(score);
    }
    calculateFitnessLevel(data) {
        const baseFitness = (data.stamina + (100 - data.fatigueLevel)) / 2;
        const recoveryBonus = Math.min((data.recoveryHours / 8) * 20, 20);
        const injuryPenalty = data.previousInjuries * 5;
        return Math.max(0, Math.min(100, Math.round(baseFitness + recoveryBonus - injuryPenalty)));
    }

    calculateInjuryRisk(data) {
        let riskScore = 0; riskScore += data.fatigueLevel * 0.3;
        if (data.recoveryHours < 6) riskScore += 30;
        else if (data.recoveryHours < 8) riskScore += 15;
        riskScore += data.previousInjuries * 10;
        if (data.trainingIntensity === 'High') riskScore += 20;
        else if (data.trainingIntensity === 'Medium') riskScore += 10;
        if (data.trainingHours > 30) riskScore += 15;
        else if (data.trainingHours > 20) riskScore += 10;
        if (riskScore >= 70) return 'High';
        else if (riskScore >= 40) return 'Medium';
        else return 'Low';
    }

    getMedicalStatus(injuryRisk, fitnessLevel) {
        if (injuryRisk === 'High' || fitnessLevel < 50) return 'Needs Attention';
        else if (injuryRisk === 'Medium' || fitnessLevel < 70) return 'Monitor';
        else return 'Fit';
    }

    calculateRecoveryStatus(data) {
        const recoveryScore = (data.recoveryHours / 8) * 100; const fatigueScore = 100 - data.fatigueLevel; const overallRecovery = (recoveryScore + fatigueScore) / 2;
        if (overallRecovery >= 80) return 'Excellent';
        else if (overallRecovery >= 60) return 'Good';
        else if (overallRecovery >= 40) return 'Fair';
        else return 'Poor';
    }

    calculatePerformanceTrend(data) {
        const trainingEfficiency = data.trainingHours / 10;
        const recoveryFactor = data.recoveryHours / 8;
        const fatigueFactor = (100 - data.fatigueLevel) / 100;
        const trendScore = trainingEfficiency * recoveryFactor * fatigueFactor;
        if (trendScore >= 2.5) return 'Improving';
        else if (trendScore >= 1.5) return 'Stable';
        else return 'Declining';
    }
    // Dashboard Updates
    updateDashboard() {
        this.updateTeamOverview();this.updatePlayerTable();this.updateAthleteCards();this.updateTeamSummary();this.updateCharts();
    }

    updateTeamOverview() {
        const totalPlayers = this.players.length;
        const avgPerformance = totalPlayers > 0 
            ? Math.round(this.players.reduce((sum, p) => sum + p.performanceScore, 0) / totalPlayers)
            : 0;
        
        const trainingEfficiency = this.calculateTrainingEfficiency();
        const avgInjuryRisk = this.calculateAverageInjuryRisk();
        document.getElementById('totalPlayers').textContent = totalPlayers;
        document.getElementById('avgPerformance').textContent = avgPerformance;
        document.getElementById('trainingEfficiency').textContent = trainingEfficiency + '%';
        document.getElementById('avgInjuryRisk').textContent = avgInjuryRisk;
    }

    calculateTrainingEfficiency() {
        if (this.players.length === 0) return 0;
        const totalTraining = this.players.reduce((sum, p) => sum + p.trainingHours, 0);
        const totalPerformance = this.players.reduce((sum, p) => sum + p.performanceScore, 0);
        return Math.round((totalPerformance / (totalTraining * 10)) * 100);
    }

    calculateAverageInjuryRisk() {
        if (this.players.length === 0) return 'Low';
        const riskCounts = { High: 0, Medium: 0, Low: 0 };
        this.players.forEach(p => riskCounts[p.injuryRisk]++);
        const maxRisk = Object.entries(riskCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        return maxRisk;
    }

    updatePlayerTable() {
        const tbody = document.getElementById('playerTableBody');
        if (this.players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No players added yet</td></tr>';
            return;
        }

        tbody.innerHTML = this.players.map(player => `
            <tr>
                <td><strong>${player.playerName}</strong></td><td>${player.position}</td><td>${player.performanceScore}</td>
                <td>${player.fitnessLevel}%</td><td>${player.injuryRisk}</td><td>${player.medicalStatus}</td><td>${player.trainingPhase}</td>
                <td>
                    <button onclick="dashboard.deletePlayer(${player.id})" class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    updateMedicalCenter() {
        const medicalGrid = document.getElementById('medicalGrid');
        if (this.players.length === 0) {
            medicalGrid.innerHTML = '<div class="empty-state"><h3>No medical data available</h3><p>Add players to see medical information</p></div>';
            return;
        }

        medicalGrid.innerHTML = this.players.map(player => `
            <div class="player-card risk-${player.injuryRisk.toLowerCase()}">
                <h4>${player.playerName}</h4>
                <div class="player-metric">
                    <span class="metric-label">Injury Risk:</span>
                    <span class="metric-value status-${this.getRiskClass(player.injuryRisk)}">${player.injuryRisk}</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Medical Status:</span>
                    <span class="metric-value status-${this.getMedicalClass(player.medicalStatus)}">${player.medicalStatus}</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Recovery Status:</span>
                    <span class="metric-value">${player.recoveryStatus}</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Fatigue Level:</span>
                    <span class="metric-value">${player.fatigueLevel}%</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Recovery Hours:</span>
                    <span class="metric-value">${player.recoveryHours}h/day</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Previous Injuries:</span>
                    <span class="metric-value">${player.previousInjuries}</span>
                </div>
            </div>
        `).join('');
    }

    updatePerformanceLab() {
        const performanceGrid = document.getElementById('performanceGrid');
        if (this.players.length === 0) {
            performanceGrid.innerHTML = '<div class="empty-state"><h3>No performance data available</h3><p>Add players to see performance analysis</p></div>';
            return;
        }
        performanceGrid.innerHTML = this.players.map(player => `
            <div class="player-card performance-${this.getPerformanceClass(player.performanceScore)}">
                <h4>${player.playerName}</h4>
                <div class="player-metric">
                    <span class="metric-label">Performance Score:</span>
                    <span class="metric-value status-${this.getPerformanceClass(player.performanceScore)}">${player.performanceScore}/100</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Fitness Level:</span>
                    <span class="metric-value status-${this.getFitnessClass(player.fitnessLevel)}">${player.fitnessLevel}%</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Performance Trend:</span>
                    <span class="metric-value">${player.performanceTrend}</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Stamina:</span>
                    <span class="metric-value">${player.stamina}/100</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Batting Power:</span>
                    <span class="metric-value">${player.battingPower}/100</span>
                </div>
                <div class="player-metric">
                    <span class="metric-label">Bowling Speed:</span>
                    <span class="metric-value">${player.bowlingSpeed}/100</span>
                </div>
            </div>
        `).join('');
    }

    updateTrainingCenter() {
        const trainingGrid = document.getElementById('trainingGrid');
        if (this.players.length === 0) {
            trainingGrid.innerHTML = '<div class="empty-state"><h3>No training data available</h3><p>Add players to see training recommendations</p></div>';
            return;
        }

        trainingGrid.innerHTML = this.players.map(player => {
            const recommendations = this.getTrainingRecommendations(player);
            return `
                <div class="player-card">
                    <h4>${player.playerName}</h4>
                    <div class="player-metric">
                        <span class="metric-label">Training Phase:</span>
                        <span class="metric-value">${player.trainingPhase}</span>
                    </div>
                    <div class="player-metric">
                        <span class="metric-label">Training Intensity:</span>
                        <span class="metric-value">${player.trainingIntensity}</span>
                    </div>
                    <div class="player-metric">
                        <span class="metric-label">Training Hours/Week:</span>
                        <span class="metric-value">${player.trainingHours}h</span>
                    </div>
                    <div class="recommendation">
                        <h5>Training Recommendations:</h5>
                        <ul>
                            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTrainingRecommendations(player) {
        const recommendations = [];
        if (player.fatigueLevel > 70) {
            recommendations.push('Reduce training intensity and increase recovery time');
        }
        if (player.recoveryHours < 7) {
            recommendations.push('Increase daily recovery hours to at least 7-8 hours');
        }
        if (player.fitnessLevel < 60) {
            recommendations.push('Focus on cardiovascular fitness and endurance training');
        }
        if (player.injuryRisk === 'High') {
            recommendations.push('Consult medical staff before high-intensity training');
        }
        if (player.performanceScore < 50) {
            recommendations.push('Work on skill-specific drills and technique improvement');
        }
        if (player.trainingPhase === 'Recovery') {
            recommendations.push('Focus on light activities and rehabilitation exercises');
        } else if (player.trainingPhase === 'Pre-season') {
            recommendations.push('Build base fitness and work on strength conditioning');
        } else {
            recommendations.push('Maintain current fitness level and focus on match-specific skills');
        }
        if (recommendations.length === 0) {
            recommendations.push('Continue current training regimen and monitor performance');
        }
        return recommendations;
    }
    // Charts
    updateCharts() {
        this.createPerformanceHistogram();
        this.updateTrainingChart();
    }
    // Performance Histogram - Frequency Distribution
    createPerformanceHistogram() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        if (this.players.length === 0) {
            this.charts.performance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Performance Frequency',
                        data: [0],
                        backgroundColor: 'rgba(102, 126, 234, 0.5)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: false,
                            text: 'Performance Distribution (Histogram)',
                            font: {
                                size: 16,weight: 'bold'
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                afterLabel: function(context) {
                                    const percentage = ((context.parsed.y / performanceScores.length) * 100).toFixed(1);
                                    return `${percentage}% of team`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,text: 'Number of Athletes'
                            }
                        },
                        x: {
                            title: {
                                display: true,text: 'Performance Score Ranges'
                            }
                        }
                    }
                }
            });
            return;
        }

        // Create histogram bins (0-20, 20-40, 40-60, 60-80, 80-100)
        const performanceScores = this.players.map(p => p.performanceScore);
        const bins = this.createHistogramBins(performanceScores, 5);
        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bins.labels,
              datasets: [{
                    label: 'Number of Athletes',data: bins.counts,backgroundColor: 'rgba(102, 126, 234, 0.6)',borderColor: 'rgba(102, 126, 234, 1)',borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: false},
                    legend: {display: false},
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const percentage = ((context.parsed.y / performanceScores.length) * 100).toFixed(1);
                                return `${percentage}% of team`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,text: 'Number of Athletes (Frequency)',
                            font: { weight: 'bold'}
                        },
                        ticks: {stepSize: 1}
                    },
                    x: {
                        title: {
                            display: true,text: 'Performance Score Ranges (Bins)',
                            font: {weight: 'bold' }
                        }
                    }
                }
            }
        });
    }
    // Create histogram bins for frequency distribution
    createHistogramBins(data, numBins) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binWidth = (max - min) / numBins;
        const bins = {
            labels: [],counts: [],boundaries: []
        };
        for (let i = 0; i < numBins; i++) {
            const binStart = min + (i * binWidth);
            const binEnd = min + ((i + 1) * binWidth);
            bins.labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
            bins.boundaries.push({ min: binStart, max: binEnd });
            // Count data points in this bin
            const count = data.filter(value => 
                value >= binStart && (i === numBins - 1 ? value <= binEnd : value < binEnd)
            ).length;
            bins.counts.push(count);
        }
        return bins;
    }
    updatePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        if (this.charts.performance) {this.charts.performance.destroy(); }
        if (this.players.length === 0) {
            this.charts.performance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Performance Score',data: [0],backgroundColor: '#e2e8f0'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {beginAtZero: true,max: 100}
                    }
                }
            });
            return;
        }

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.players.map(p => p.playerName),
                datasets: [{
                    label: 'Performance Score',data: this.players.map(p => p.performanceScore),backgroundColor: this.players.map(p => this.getChartColor(p.performanceScore))
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {beginAtZero: true,max: 100}
                }
            }
        });
    }

    updateTrainingChart() {
        const ctx = document.getElementById('trainingChart').getContext('2d');
        if (this.charts.training) {
            this.charts.training.destroy();
        }
        if (this.players.length === 0) {
            this.charts.training = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Training Hours',data: [0],borderColor: '#e2e8f0',backgroundColor: '#e2e8f0'
                    }, {
                        label: 'Performance Score',data: [0],borderColor: '#e2e8f0',backgroundColor: '#e2e8f0'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {beginAtZero: true }
                    }
                }
            });
            return;
        }

        this.charts.training = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.players.map(p => p.playerName),
                datasets: [{
                    label: 'Training Hours/Week',data: this.players.map(p => p.trainingHours), borderColor: '#667eea',backgroundColor: 'rgba(102, 126, 234, 0.1)',tension: 0.4
                }, {
                    label: 'Performance Score',data: this.players.map(p => p.performanceScore),borderColor: '#48bb78',backgroundColor: 'rgba(72, 187, 120, 0.1)',tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {beginAtZero: true}
                }
            }
        });
    }
    // Utility Functions
    getPerformanceClass(score) {
        if (score >= 80) return 'good';
        else if (score >= 60) return 'warning';
        else return 'danger';
    }
    getFitnessLevelClass(level) {
        if (level >= 80) return 'good';
        else if (level >= 60) return 'warning';
        else return 'danger';
    }
    getRiskClass(risk) {
        if (risk === 'Low') return 'good';
        else if (risk === 'Medium') return 'warning';
        else return 'danger';
    }
    getMedicalClass(status) {
        if (status === 'Fit') return 'good';
        else if (status === 'Monitor') return 'warning';
        else return 'danger';
    }
    getChartColor(score) {
        if (score >= 80) return '#48bb78';
        else if (score >= 60) return '#ed8936';
        else return '#f56565';
    }
    getFitnessClass(level) {
        if (level >= 80) return 'good';
        else if (level >= 60) return 'warning';
        else return 'danger';
    }
    // CRUD Operations
    deletePlayer(playerId) {
        if (confirm('Are you sure you want to delete this player?')) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.showSuccessMessage('Player deleted successfully!');
        }
    }
    // Data Persistence
    saveToLocalStorage() {
        localStorage.setItem('cricketDashboardPlayers', JSON.stringify(this.players));
    }
    loadFromLocalStorage() {
        const saved = localStorage.getItem('cricketDashboardPlayers');
        if (saved) {this.players = JSON.parse(saved);}
    }
    // Utility Functions
    showSuccessMessage(message) {
        const existing = document.querySelector('.success-message');
        if (existing) {existing.remove();}
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        const firstSection = document.querySelector('.section');
        firstSection.parentNode.insertBefore(messageDiv, firstSection);
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    // Modal Functions
    openAddPlayerModal() {
        document.getElementById('addPlayerModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAddPlayerModal() {
        document.getElementById('addPlayerModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Comparison Functions
    openCompareModal() {
        this.selectedAthletes = [];
        this.updateAvailableAthletes();
        this.updateSelectedAthletes();
        document.getElementById('compareModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeCompareModal() {
        document.getElementById('compareModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.destroyCompareCharts();
    }
    updateAvailableAthletes() {
        const container = document.getElementById('availableAthletes');   
        if (this.players.length === 0) {
            container.innerHTML = '<div class="no-selection">No athletes available. Add athletes first to compare.</div>';
            return;
        }
        container.innerHTML = this.players.map(player => `
            <div class="athlete-checkbox ${this.selectedAthletes.includes(player.id) ? 'selected' : ''}" 
                 onclick="dashboard.toggleAthleteSelection(${player.id})">
                <input type="checkbox" 
                       ${this.selectedAthletes.includes(player.id) ? 'checked' : ''} 
                       onchange="dashboard.toggleAthleteSelection(${player.id})">
                <div>
                    <strong>${player.playerName}</strong><br>
                    <small>${player.position} - Score: ${player.performanceScore}</small>
                </div>
            </div>
        `).join('');
    }
    updateSelectedAthletes() {
        const container = document.getElementById('selectedAthletes');   
        if (this.selectedAthletes.length === 0) {
            container.innerHTML = '<div class="no-selection">Select 2 or more athletes to compare</div>';
            document.querySelector('.compare-btn')?.remove();
            return;
        }

        const selectedPlayers = this.players.filter(p => this.selectedAthletes.includes(p.id));
        container.innerHTML = selectedPlayers.map(player => `
            <div class="selected-athlete-tag">
                ${player.playerName}
                <span class="remove-athlete" onclick="dashboard.toggleAthleteSelection(${player.id})">×</span>
            </div>
        `).join('');
        // Add compare button if 2 or more selected
        if (this.selectedAthletes.length >= 2) {
            if (!document.querySelector('.compare-btn')) {
                const btn = document.createElement('button');
                btn.className = 'compare-btn';
                btn.textContent = 'Compare Selected Athletes';
                btn.onclick = () => this.performComparison();
                container.appendChild(btn);
            }
        } else {
            document.querySelector('.compare-btn')?.remove();
        }
    }

    toggleAthleteSelection(playerId) {
        const index = this.selectedAthletes.indexOf(playerId);
        if (index > -1) {
            this.selectedAthletes.splice(index, 1);
        } else {
            this.selectedAthletes.push(playerId);
        }
        this.updateAvailableAthletes();
        this.updateSelectedAthletes();
    }

    performComparison() {
        if (this.selectedAthletes.length < 2) {
            alert('Please select at least 2 athletes to compare');
            return;
        }
        const selectedPlayers = this.players.filter(p => this.selectedAthletes.includes(p.id));
        document.getElementById('comparisonResults').style.display = 'block';
        this.updateComparisonCharts(selectedPlayers);
        this.updateComparisonAnalysis(selectedPlayers);
        // Scroll to results
        document.getElementById('comparisonResults').scrollIntoView({ behavior: 'smooth' });
    }

    updateComparisonCharts(players) {
        this.updateComparePerformanceChart(players);
        this.updateCompareRadarChart(players);
        this.updateComparePerformanceMetricsChart(players);
        this.updateCompareHealthChart(players);
        this.updateCompareTrainingChart(players);
    }

    updateComparePerformanceChart(players) {
        const ctx = document.getElementById('comparePerformanceChart').getContext('2d');
        if (this.compareCharts.performance) {
            this.compareCharts.performance.destroy();
        }
        this.compareCharts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: players.map(p => p.playerName),
                datasets: [{
                    label: 'Performance Score', data: players.map(p => p.performanceScore),backgroundColor: players.map((p, i) => this.getChartColor(i))
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {beginAtZero: true,max: 100}
                }
            }
        });
    }

    updateCompareRadarChart(players) {
        const ctx = document.getElementById('compareRadarChart').getContext('2d');
        if (this.compareCharts.radar) {
            this.compareCharts.radar.destroy();
        }
        this.compareCharts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Stamina', 'Batting Power', 'Bowling Speed', 'Fitness Level', 'Recovery'],
                datasets: players.map((player, i) => ({
                    label: player.playerName,
                    data: [
                        player.stamina,player.battingPower,player.bowlingSpeed,player.fitnessLevel,
                        Math.min((player.recoveryHours / 8) * 100, 100)
                    ],
                    backgroundColor: this.getRadarColor(i, 0.2),borderColor: this.getRadarColor(i, 1),borderWidth: 2
                }))
            },
            options: {
                responsive: true,
                animation: {duration: 0 },
                scales: {
                    r: {
                        beginAtZero: true,max: 100
                    }
                }
            }
        });
    }

    updateComparePerformanceMetricsChart(players) {
        const ctx = document.getElementById('comparePerformanceMetricsChart').getContext('2d');
        if (this.compareCharts.performanceMetrics) {
            this.compareCharts.performanceMetrics.destroy();
        }

        this.compareCharts.performanceMetrics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: players.map(p => p.playerName),
                datasets: [
                    {label: 'Stamina',data: players.map(p => p.stamina),borderColor: '#667eea',backgroundColor: 'rgba(102, 126, 234, 0.1)'},
                    {label: 'Batting Power',data: players.map(p => p.battingPower),borderColor: '#48bb78', backgroundColor: 'rgba(72, 187, 120, 0.1)'},
                    {label: 'Bowling Speed',data: players.map(p => p.bowlingSpeed),borderColor: '#ed8936',backgroundColor: 'rgba(237, 137, 54, 0.1)'}
                ]
            },
            options: {
                responsive: true,
                animation: {duration: 0},
                scales: {
                    y: {beginAtZero: true,max: 100}
                }
            }
        });
    }

    updateCompareHealthChart(players) {
        const ctx = document.getElementById('compareHealthChart').getContext('2d');
        if (this.compareCharts.health) {
            this.compareCharts.health.destroy();
        }
        const riskScores = players.map(p => {
            if (p.injuryRisk === 'High') return 80;
            if (p.injuryRisk === 'Medium') return 50;
            return 20;
        });
        this.compareCharts.health = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: players.map(p => p.playerName),
                datasets: [
                    {label: 'Fitness Level',data: players.map(p => p.fitnessLevel),backgroundColor: '#48bb78'},
                    {label: 'Injury Risk (lower is better)',data: riskScores,backgroundColor: '#f56565'},
                    {label: 'Fatigue Level (lower is better)',data: players.map(p => 100 - p.fatigueLevel),backgroundColor: '#ed8936'}
                ]
            },
            options: {
                responsive: true,
                animation: {duration: 0},
                scales: {
                    y: {beginAtZero: true,max: 100}
                }
            }
        });
    }

    updateCompareTrainingChart(players) {
        const ctx = document.getElementById('compareTrainingChart').getContext('2d');
        if (this.compareCharts.training) {
            this.compareCharts.training.destroy();
        }
        this.compareCharts.training = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: players.map(p => p.playerName),
                datasets: [
                    {label: 'Training Hours/Week',data: players.map(p => p.trainingHours),backgroundColor: '#667eea'},
                    {label: 'Training Efficiency',data: players.map(p => this.calculateIndividualTrainingEfficiency(p)),backgroundColor: '#48bb78'}
                ]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 0
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    calculateIndividualTrainingEfficiency(player) {
        return Math.round((player.performanceScore / (player.trainingHours * 10)) * 100);
    }

    updateComparisonAnalysis(players) {
        this.updatePerformanceAnalysis(players);
        this.updateHealthAnalysis(players);
        this.updateTrainingAnalysis(players);
        this.updateRecommendations(players);
    }

    updatePerformanceAnalysis(players) {
        const container = document.getElementById('performanceAnalysis');
        const sortedByPerformance = [...players].sort((a, b) => b.performanceScore - a.performanceScore);
        const sortedByStamina = [...players].sort((a, b) => b.stamina - a.stamina);
        const sortedByBatting = [...players].sort((a, b) => b.battingPower - a.battingPower);

        container.innerHTML = `
            <div class="analysis-title">Performance Analysis</div>
            <div class="analysis-item strong">
                <div class="analysis-player">🏆 Best Overall Performance: ${sortedByPerformance[0].playerName}</div>
                <div class="analysis-metric">Score: <span class="analysis-value">${sortedByPerformance[0].performanceScore}</span></div>
            </div>
            <div class="analysis-item moderate">
                <div class="analysis-player">💪 Highest Stamina: ${sortedByStamina[0].playerName}</div>
                <div class="analysis-metric">Stamina: <span class="analysis-value">${sortedByStamina[0].stamina}</span></div>
            </div>
            <div class="analysis-item moderate">
                <div class="analysis-player">🏏 Best Batting Power: ${sortedByBatting[0].playerName}</div>
                <div class="analysis-metric">Batting: <span class="analysis-value">${sortedByBatting[0].battingPower}</span></div>
            </div>
            ${sortedByPerformance.length > 1 ? `
            <div class="analysis-item weak">
                <div class="analysis-player">📈 Performance Gap: ${sortedByPerformance[0].performanceScore - sortedByPerformance[sortedByPerformance.length-1].performanceScore} points</div>
                <div class="analysis-metric">Between best and lowest performer</div>
            </div>
            ` : ''}
        `;
    }

    updateHealthAnalysis(players) {
        const container = document.getElementById('healthAnalysis');
        const highRiskPlayers = players.filter(p => p.injuryRisk === 'High');
        const lowFitnessPlayers = players.filter(p => p.fitnessLevel < 60);
        const highFatiguePlayers = players.filter(p => p.fatigueLevel > 70);

        container.innerHTML = `
            <div class="analysis-title">Health & Medical Analysis</div>
            ${highRiskPlayers.length > 0 ? `
            <div class="analysis-item weak">
                <div class="analysis-player">⚠️ High Injury Risk Athletes:</div>
                <div class="analysis-metric">${highRiskPlayers.map(p => p.playerName).join(', ')}</div>
            </div>
            ` : ''}
            ${lowFitnessPlayers.length > 0 ? `
            <div class="analysis-item moderate">
                <div class="analysis-player">🏥 Low Fitness Level:</div>
                <div class="analysis-metric">${lowFitnessPlayers.map(p => `${p.playerName} (${p.fitnessLevel}%)`).join(', ')}</div>
            </div>
            ` : ''}
            ${highFatiguePlayers.length > 0 ? `
            <div class="analysis-item weak">
                <div class="analysis-player">😴 High Fatigue Levels:</div>
                <div class="analysis-metric">${highFatiguePlayers.map(p => `${p.playerName} (${p.fatigueLevel}%)`).join(', ')}</div>
            </div>
            ` : ''}
            ${highRiskPlayers.length === 0 && lowFitnessPlayers.length === 0 && highFatiguePlayers.length === 0 ? `
            <div class="analysis-item strong">
                <div class="analysis-player">✅ All athletes show good health indicators</div>
                <div class="analysis-metric">No immediate health concerns detected</div>
            </div>
            ` : ''}
        `;
    }

    updateTrainingAnalysis(players) {
        const container = document.getElementById('trainingAnalysis');
        const overtrained = players.filter(p => p.trainingHours > 30);
        const undertrained = players.filter(p => p.trainingHours < 15);
        const highIntensity = players.filter(p => p.trainingIntensity === 'High');

        container.innerHTML = `
            <div class="analysis-title">Training Analysis</div>
            ${overtrained.length > 0 ? `
            <div class="analysis-item moderate">
                <div class="analysis-player">🔥 Potential Overtraining:</div>
                <div class="analysis-metric">${overtrained.map(p => `${p.playerName} (${p.trainingHours}h/week)`).join(', ')}</div>
            </div>
            ` : ''}
            ${undertrained.length > 0 ? `
            <div class="analysis-item weak">
                <div class="analysis-player">📉 Undertrained:</div>
                <div class="analysis-metric">${undertrained.map(p => `${p.playerName} (${p.trainingHours}h/week)`).join(', ')}</div>
            </div>
            ` : ''}
            ${highIntensity.length > 0 ? `
            <div class="analysis-item moderate">
                <div class="analysis-player">⚡ High Intensity Training:</div>
                <div class="analysis-metric">${highIntensity.map(p => p.playerName).join(', ')}</div>
            </div>
            ` : ''}
            <div class="analysis-item strong">
                <div class="analysis-player">📊 Average Training Load: <span class="analysis-value">${Math.round(players.reduce((sum, p) => sum + p.trainingHours, 0) / players.length)}h/week</span></div>
                <div class="analysis-metric">Across all selected athletes</div>
            </div>
        `;
    }

    updateRecommendations(players) {
        const container = document.getElementById('recommendationsComparison');
        
        container.innerHTML = players.map(player => {
            const recommendations = this.getComparisonRecommendations(player, players);
            const priorityClass = this.getPriorityClass(recommendations);
            
            return `
                <div class="player-recommendations ${priorityClass}">
                    <h4>${player.playerName} - ${player.position}</h4>
                    <ul class="recommendation-list">
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }).join('');
    }

    getComparisonRecommendations(player, allPlayers) {
        const recommendations = [];
        const avgPerformance = allPlayers.reduce((sum, p) => sum + p.performanceScore, 0) / allPlayers.length;
        const avgTraining = allPlayers.reduce((sum, p) => sum + p.trainingHours, 0) / allPlayers.length;
        
        if (player.performanceScore < avgPerformance - 10) {
            recommendations.push('Focus on skill development and technique improvement');
        }
        
        if (player.fitnessLevel < 60) {
            recommendations.push('Increase cardiovascular fitness and endurance training');
        }
        
        if (player.injuryRisk === 'High') {
            recommendations.push('Consult medical staff - reduce training intensity immediately');
        }
        
        if (player.fatigueLevel > 70) {
            recommendations.push('Increase recovery time and reduce training load');
        }
        
        if (player.trainingHours < avgTraining - 5) {
            recommendations.push('Increase training volume to match team standards');
        }
        
        if (player.trainingHours > avgTraining + 10) {
            recommendations.push('Consider reducing training load to prevent burnout');
        }
        
        if (player.performanceScore > avgPerformance + 10) {
            recommendations.push('Maintain current training regimen - excellent performance');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Continue current training and recovery routine');
        }
        
        return recommendations;
    }

    getPriorityClass(recommendations) {
        const highPriorityKeywords = ['immediately', 'medical staff', 'reduce', 'prevent'];
        const mediumPriorityKeywords = ['increase', 'focus', 'consider'];
        
        const hasHigh = recommendations.some(rec => 
            highPriorityKeywords.some(keyword => rec.toLowerCase().includes(keyword))
        );
        
        const hasMedium = recommendations.some(rec => 
            mediumPriorityKeywords.some(keyword => rec.toLowerCase().includes(keyword))
        );
        
        if (hasHigh) return 'priority-high';
        if (hasMedium) return 'priority-medium';
        return 'priority-low';
    }

    getRadarColor(index, alpha) {
        const colors = [
            `rgba(102, 126, 234, ${alpha})`,`rgba(72, 187, 120, ${alpha})`,`rgba(237, 137, 54, ${alpha})`,`rgba(245, 101, 101, ${alpha})`,`rgba(66, 153, 225, ${alpha})`
        ];
        return colors[index % colors.length];
    }

    getChartColor(index) {
        const colors = ['#667eea', '#48bb78', '#ed8936', '#f56565', '#4299e1', '#9f7aea'];
        return colors[index % colors.length];
    }

    destroyCompareCharts() {
        Object.values(this.compareCharts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.compareCharts = {};
    }

    // Athlete Cards Update
    updateAthleteCards() {
        const container = document.getElementById('athleteCardsGrid');
        
        if (this.players.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No athletes available</h3><p>Add athletes to see their performance cards</p></div>';
            return;
        }
        container.innerHTML = this.players.map(player => this.createCompactAthleteCard(player)).join('');
    }

    createCompactAthleteCard(player) {
        const medicalData = this.getMedicalCardData(player);
        const statusColor = this.getStatusColor(player);
        return `
            <div class="compact-athlete-card" onclick="dashboard.showAthleteDetailModal(${player.id})">
                <div class="compact-header">
                    <div class="athlete-info">
                        <span class="athlete-name">${player.playerName}</span>
                        <span class="athlete-position">${player.position}</span>
                    </div>
                    <div class="overall-score" style="background: ${statusColor}">
                        ${player.performanceScore}
                    </div>
                </div>
                <div class="compact-metrics">
                    <div class="metric-row">
                        <span class="metric-label">Fitness</span>
                        <span class="metric-value">${player.fitnessLevel}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Risk</span>
                        <span class="metric-value ${this.getRiskClass(player.injuryRisk)}">${player.injuryRisk}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Trend</span>
                        <span class="metric-value ${this.getTrendClass(player.performanceTrend)}">${this.getTrendSymbol(player.performanceTrend)}</span>
                    </div>
                </div>
                <div class="compact-footer">
                    <span class="status-indicator ${this.getMedicalClass(player.medicalStatus)}">${player.medicalStatus}</span>
                    <span class="click-hint">Click for details →</span>
                </div>
            </div>
        `;
    }

    getStatusColor(player) {
        if (player.performanceScore >= 80) return 'linear-gradient(135deg, #38a169, #68d391)';
        if (player.performanceScore >= 60) return 'linear-gradient(135deg, #3182ce, #63b3ed)';
        if (player.performanceScore >= 40) return 'linear-gradient(135deg, #dd6b20, #f6ad55)';
        return 'linear-gradient(135deg, #e53e3e, #fc8181)';
    }

    showAthleteDetailModal(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const medicalData = this.getMedicalCardData(player);
        const performanceData = this.getPerformanceCardData(player);
        const analyticsData = this.getAnalyticsCardData(player);
        const trainingData = this.getTrainingCardData(player);
        const mentalData = this.getMentalCardData(player);
        const recoveryData = this.getRecoveryCardData(player);

        const modalHtml = `
            <div id="athleteDetailModal" class="modal">
                <div class="modal-content athlete-detail-modal">
                    <div class="modal-header">
                        <h2>${player.playerName} - Performance Details</h2>
                        <span class="close" onclick="dashboard.closeAthleteDetailModal()">&times;</span>
                    </div>
                    <div class="athlete-detail-content">
                        <!-- Medical Section -->
                        <div class="detail-section medical-section">
                            <h3>🏥 Medical Assessment</h3>
                            <div class="detail-metrics">
                                <div class="detail-metric">
                                    <span class="metric-label">Injury Risk</span>
                                    <span class="metric-value ${this.getRiskClass(player.injuryRisk)}">${player.injuryRisk}</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Injury Probability</span>
                                    <span class="metric-percentage">${medicalData.probability}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Medical Status</span>
                                    <span class="metric-value ${this.getMedicalClass(player.medicalStatus)}">${player.medicalStatus}</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Fatigue Level</span>
                                    <span class="metric-value">${player.fatigueLevel}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Previous Injuries</span>
                                    <span class="metric-value">${player.previousInjuries}</span>
                                </div>
                            </div>
                            <div class="detail-message">
                                ${medicalData.message}
                            </div>
                        </div>

                        <!-- Performance Section -->
                        <div class="detail-section performance-section">
                            <h3>💪 Performance Analysis</h3>
                            <div class="detail-metrics">
                                <div class="detail-metric">
                                    <span class="metric-label">Performance Score</span>
                                    <span class="metric-percentage">${player.performanceScore}/100</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Fitness Level</span>
                                    <span class="metric-percentage">${player.fitnessLevel}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Performance Potential</span>
                                    <span class="metric-percentage">${performanceData.potential}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Technique Score</span>
                                    <span class="metric-percentage">${performanceData.technique}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Performance Trend</span>
                                    <span class="metric-value ${this.getTrendClass(player.performanceTrend)}">${player.performanceTrend}</span>
                                </div>
                            </div>
                            <div class="detail-message">
                                ${performanceData.message}
                            </div>
                        </div>

                        <!-- Skills Section -->
                        <div class="detail-section skills-section">
                            <h3>🏏 Skills & Abilities</h3>
                            <div class="detail-metrics">
                                <div class="detail-metric">
                                    <span class="metric-label">Stamina</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${player.stamina}%"></div>
                                        <span class="progress-text">${player.stamina}%</span>
                                    </div>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Batting Power</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${player.battingPower}%"></div>
                                        <span class="progress-text">${player.battingPower}%</span>
                                    </div>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Bowling Speed</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${player.bowlingSpeed}%"></div>
                                        <span class="progress-text">${player.bowlingSpeed}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Training Section -->
                        <div class="detail-section training-section">
                            <h3>🎯 Training & Recovery</h3>
                            <div class="detail-metrics">
                                <div class="detail-metric">
                                    <span class="metric-label">Training Phase</span>
                                    <span class="metric-value">${player.trainingPhase}</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Training Intensity</span>
                                    <span class="metric-value">${player.trainingIntensity}</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Training Hours/Week</span>
                                    <span class="metric-value">${player.trainingHours}h</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Recovery Hours/Day</span>
                                    <span class="metric-value">${player.recoveryHours}h</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Training Efficiency</span>
                                    <span class="metric-percentage">${analyticsData.efficiency}%</span>
                                </div>
                            </div>
                            <div class="detail-message">
                                ${trainingData.message}
                            </div>
                        </div>

                        <!-- Mental & Recovery Section -->
                        <div class="detail-section mental-section">
                            <h3>🧠 Mental & Recovery</h3>
                            <div class="detail-metrics">
                                <div class="detail-metric">
                                    <span class="metric-label">Mental Toughness</span>
                                    <span class="metric-value">${mentalData.toughness}/10</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Concentration</span>
                                    <span class="metric-value">${mentalData.concentration}/10</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Decision Making</span>
                                    <span class="metric-value">${mentalData.decision}/10</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Recovery Score</span>
                                    <span class="metric-percentage">${recoveryData.score}%</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Sleep Quality</span>
                                    <span class="metric-value">${recoveryData.sleep}/10</span>
                                </div>
                                <div class="detail-metric">
                                    <span class="metric-label">Stress Level</span>
                                    <span class="metric-value">${recoveryData.stress}/10</span>
                                </div>
                            </div>
                            <div class="detail-message">
                                ${mentalData.message}
                            </div>
                        </div>

                        <!-- Overall Assessment -->
                        <div class="detail-section assessment-section">
                            <h3>📋 Overall Assessment</h3>
                            <div class="overall-assessment">
                                <div class="assessment-score">
                                    <span class="score-label">Overall Performance Score:</span>
                                    <span class="score-value">${player.performanceScore}/100</span>
                                </div>
                                <div class="assessment-text">
                                    ${this.getOverallMessage(player, medicalData, performanceData, analyticsData)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('athleteDetailModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAthleteDetailModal() {
        const modal = document.getElementById('athleteDetailModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    createAthleteCard(player) {
        const medicalData = this.getMedicalCardData(player);
        const performanceData = this.getPerformanceCardData(player);
        const analyticsData = this.getAnalyticsCardData(player);
        const trainingData = this.getTrainingCardData(player);
        const mentalData = this.getMentalCardData(player);
        const recoveryData = this.getRecoveryCardData(player);

        return `
            <div class="athlete-card consolidated-card">
                <div class="athlete-card-header">
                    <span class="athlete-name">${player.playerName}</span>
                    <span class="athlete-position">${player.position}</span>
                </div>
                <div class="athlete-card-body">
                    <!-- Medical Section -->
                    <div class="card-section">
                        <div class="section-title medical-title">🏥 Medical</div>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <span class="metric-label">Risk</span>
                                <span class="metric-value ${this.getRiskClass(player.injuryRisk)}">${player.injuryRisk}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Probability</span>
                                <span class="metric-percentage">${medicalData.probability}%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Status</span>
                                <span class="metric-value ${this.getMedicalClass(player.medicalStatus)}">${player.medicalStatus}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Section -->
                    <div class="card-section">
                        <div class="section-title performance-title">💪 Performance</div>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <span class="metric-label">Fitness</span>
                                <span class="metric-percentage">${player.fitnessLevel}%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Potential</span>
                                <span class="metric-percentage">${performanceData.potential}%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Technique</span>
                                <span class="metric-percentage">${performanceData.technique}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Analytics Section -->
                    <div class="card-section">
                        <div class="section-title analytics-title">📊 Analytics</div>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <span class="metric-label">Trend</span>
                                <span class="metric-value ${this.getTrendClass(player.performanceTrend)}">${this.getTrendSymbol(player.performanceTrend)} ${analyticsData.trend}%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Efficiency</span>
                                <span class="metric-percentage">${analyticsData.efficiency}%</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Recovery</span>
                                <span class="metric-value ${this.getRecoveryClass(player.recoveryStatus)}">${player.recoveryStatus}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Training Section -->
                    <div class="card-section">
                        <div class="section-title training-title">🎯 Training</div>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <span class="metric-label">Phase</span>
                                <span class="metric-value">${player.trainingPhase}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Intensity</span>
                                <span class="metric-value">${player.trainingIntensity}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Recovery Days</span>
                                <span class="metric-value">${trainingData.recoveryDays}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Mental & Recovery Section -->
                    <div class="card-section">
                        <div class="section-title mental-title">🧠 Mental & Recovery</div>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <span class="metric-label">Toughness</span>
                                <span class="metric-value">${mentalData.toughness}/10</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Sleep</span>
                                <span class="metric-value">${recoveryData.sleep}/10</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Stress</span>
                                <span class="metric-value">${recoveryData.stress}/10</span>
                            </div>
                        </div>
                    </div>

                    <!-- Overall Message -->
                    <div class="athlete-message consolidated-message">
                        <strong>Overall Assessment:</strong> ${this.getOverallMessage(player, medicalData, performanceData, analyticsData)}
                    </div>
                </div>
            </div>
        `;
    }

    getOverallMessage(player, medicalData, performanceData, analyticsData) {
        if (player.injuryRisk === 'High') {
            return "Medical attention required - reduce training intensity immediately";
        } else if (player.performanceScore >= 80 && player.fitnessLevel >= 80) {
            return "Excellent condition - maintain current training regimen";
        } else if (player.performanceTrend === 'Improving') {
            return "Positive progression - continue current approach";
        } else if (player.fatigueLevel > 70) {
            return "High fatigue detected - increase recovery time";
        } else if (player.performanceScore < 50) {
            return "Performance needs improvement - focus on skill development";
        } else {
            return "Good overall condition - minor adjustments recommended";
        }
    }

    getMedicalCardData(player) {
        let probability = 15;
        let message = "No medical concerns";
        if (player.injuryRisk === 'High') {
            probability = 65;
            message = "Immediate medical attention required";
        } else if (player.injuryRisk === 'Medium') {
            probability = 35;
            message = "Monitor health closely";
        } else if (player.fitnessLevel > 80 && player.fatigueLevel < 30) {
            probability = 5;
            message = "Excellent physical condition";
        }
        return { probability, message };
    }

    getPerformanceCardData(player) {
        const potential = Math.min(95, player.performanceScore + Math.floor(Math.random() * 10));
        const technique = Math.min(95, player.battingPower + Math.floor(Math.random() * 15));
        let message = "Good technical form";
        if (technique >= 90) {
            message = "Elite technical execution";
        } else if (technique >= 80) {
            message = "Excellent technical form";
        } else if (technique < 60) {
            message = "Technique needs improvement";
        }
        return { potential, technique, message };
    }

    getAnalyticsCardData(player) {
        const efficiency = this.calculateIndividualTrainingEfficiency(player);
        let trend = 0;
        let message = "Steady performance";
        if (player.performanceTrend === 'Improving') {
            trend = 12;
            message = "Positive progression detected";
        } else if (player.performanceTrend === 'Declining') {
            trend = -8;
            message = "Performance decline noted";
        } else {
            trend = 3;
            message = "Consistent performance level";
        }
        return { trend, efficiency, message };
    }

    getTrainingCardData(player) {
        let recoveryDays = 2;
        let message = "Focus on technique refinement";
        if (player.trainingPhase === 'Recovery') {
            recoveryDays = 5;
            message = "Prioritize rest and rehabilitation";
        } else if (player.trainingIntensity === 'High') {
            recoveryDays = 3;
            message = "Monitor fatigue levels closely";
        } else if (player.trainingIntensity === 'Low') {
            recoveryDays = 1;
            message = "Gradually increase training load";
        }
        return { recoveryDays, message };
    }

    getMentalCardData(player) {
        const baseMental = Math.floor(player.performanceScore / 10);
        const toughness = Math.min(10, baseMental + Math.floor(Math.random() * 3));
        const concentration = Math.min(10, baseMental + Math.floor(Math.random() * 2));
        const decision = Math.min(10, baseMental + Math.floor(Math.random() * 2));
        let message = "Good mental preparation";
        if (toughness >= 9 && concentration >= 9) {
            message = "Elite mental conditioning";
        } else if (toughness >= 7) {
            message = "Strong mental game";
        } else {
            message = "Mental skills development needed";
        }
        return { toughness, concentration, decision, message };
    }

    getRecoveryCardData(player) {
        const score = Math.min(95, Math.floor((player.recoveryHours / 8) * 100) + Math.floor(Math.random() * 10));
        const sleep = Math.min(10, Math.floor(player.recoveryHours / 1.5) + Math.floor(Math.random() * 2));
        const stress = Math.max(1, 10 - Math.floor(player.fatigueLevel / 10));
        let message = "Adequate recovery patterns";
        if (score >= 85 && sleep >= 8) {
            message = "Optimal recovery patterns";
        } else if (score < 60) {
            message = "Recovery needs attention";
        } else if (stress > 7) {
            message = "High stress levels detected";
        }
        return { score, sleep, stress, message };
    }

    getTrendClass(trend) {
        if (trend === 'Improving') return 'trend-up';
        if (trend === 'Declining') return 'trend-down';
        return 'trend-stable';
    }

    getTrendSymbol(trend) {
        if (trend === 'Improving') return '↑';
        if (trend === 'Declining') return '↓';
        return '→';
    }

    getRecoveryClass(recovery) {
        if (recovery === 'Excellent') return 'score-excellent';
        if (recovery === 'Good') return 'score-good';
        if (recovery === 'Fair') return 'score-fair';
        return 'score-poor';
    }
    // Team Summary & Conclusions
    updateTeamSummary() {
        const container = document.getElementById('summaryGrid');
        if (this.players.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No team data available</h3><p>Add athletes to see team summary and conclusions</p></div>';
            return;
        }

        const summary = this.generateTeamSummary();
        container.innerHTML = `
            <div class="summary-card overall-summary">
                <h3>🎯 Overall Team Assessment</h3>
                <div class="summary-content">
                    <div class="summary-metric">
                        <span class="metric-label">Team Performance Level:</span>
                        <span class="metric-value ${summary.performanceClass}">${summary.performanceLevel}</span>
                    </div>
                    <div class="summary-metric">
                        <span class="metric-label">Team Health Status:</span>
                        <span class="metric-value ${summary.healthClass}">${summary.healthStatus}</span>
                    </div>
                    <div class="summary-metric">
                        <span class="metric-label">Training Balance:</span>
                        <span class="metric-value ${summary.trainingClass}">${summary.trainingBalance}</span>
                    </div>
                    <div class="summary-conclusion">
                        <strong>Overall Conclusion:</strong> ${summary.overallConclusion}
                    </div>
                </div>
            </div>
            <div class="summary-card performance-summary">
                <h3>📊 Performance Analysis</h3>
                <div class="summary-content">
                    <div class="summary-insights">
                        <div class="insight-item">
                            <span class="insight-label">Top Performer:</span>
                            <span class="insight-value">${summary.topPerformer.name} (${summary.topPerformer.score})</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Performance Range:</span>
                            <span class="insight-value">${summary.performanceRange}</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Improving Athletes:</span>
                            <span class="insight-value">${summary.improvingCount} out of ${this.players.length}</span>
                        </div>
                    </div>
                    <div class="summary-conclusion">
                        <strong>Performance Conclusion:</strong> ${summary.performanceConclusion}
                    </div>
                </div>
            </div>
            <div class="summary-card medical-summary">
                <h3>🏥 Medical & Health Summary</h3>
                <div class="summary-content">
                    <div class="summary-insights">
                        <div class="insight-item">
                            <span class="insight-label">High Risk Athletes:</span>
                            <span class="insight-value ${summary.highRiskCount > 0 ? 'risk-high' : 'risk-low'}">${summary.highRiskCount}</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Average Fitness:</span>
                            <span class="insight-value">${summary.avgFitness}%</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Fatigue Concerns:</span>
                            <span class="insight-value ${summary.fatigueConcerns > 0 ? 'risk-medium' : 'risk-low'}">${summary.fatigueConcerns}</span>
                        </div>
                    </div>
                    <div class="summary-conclusion">
                        <strong>Health Conclusion:</strong> ${summary.healthConclusion}
                    </div>
                </div>
            </div>
            <div class="summary-card training-summary">
                <h3>🎯 Training & Recovery Summary</h3>
                <div class="summary-content">
                    <div class="summary-insights">
                        <div class="insight-item">
                            <span class="insight-label">Training Load:</span>
                            <span class="insight-value">${summary.avgTrainingHours}h/week average</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Training Efficiency:</span>
                            <span class="insight-value">${summary.avgEfficiency}%</span>
                        </div>
                        <div class="insight-item">
                            <span class="insight-label">Recovery Status:</span>
                            <span class="insight-value">${summary.recoveryStatus}</span>
                        </div>
                    </div>
                    <div class="summary-conclusion">
                        <strong>Training Conclusion:</strong> ${summary.trainingConclusion}
                    </div>
                </div>
            </div>

            <div class="summary-card recommendations-summary">
                <h3>💡 Key Recommendations</h3>
                <div class="summary-content">
                    <div class="recommendations-list">
                        ${summary.recommendations.map(rec => `
                            <div class="recommendation-item priority-${rec.priority}">
                                <span class="rec-priority">${rec.priority.toUpperCase()}</span>
                                <span class="rec-text">${rec.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="summary-card action-summary">
                <h3>⚡ Immediate Actions Required</h3>
                <div class="summary-content">
                    <div class="actions-list">
                        ${summary.immediateActions.map(action => `
                            <div class="action-item ${action.urgency}">
                                <span class="action-icon">${action.icon}</span>
                                <div class="action-content">
                                    <strong>${action.title}</strong>
                                    <p>${action.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    generateTeamSummary() {
        const totalPlayers = this.players.length;
        const avgPerformance = Math.round(this.players.reduce((sum, p) => sum + p.performanceScore, 0) / totalPlayers);
        const avgFitness = Math.round(this.players.reduce((sum, p) => sum + p.fitnessLevel, 0) / totalPlayers);
        const avgTrainingHours = Math.round(this.players.reduce((sum, p) => sum + p.trainingHours, 0) / totalPlayers);
        const avgEfficiency = this.calculateTrainingEfficiency();
        
        const highRiskPlayers = this.players.filter(p => p.injuryRisk === 'High');
        const improvingPlayers = this.players.filter(p => p.performanceTrend === 'Improving');
        const fatiguedPlayers = this.players.filter(p => p.fatigueLevel > 70);
        
        const topPerformer = this.players.reduce((best, player) => 
            player.performanceScore > best.performanceScore ? player : best
        );
        
        const performanceRange = `${Math.min(...this.players.map(p => p.performanceScore))} - ${Math.max(...this.players.map(p => p.performanceScore))}`;
        // Determine performance level
        let performanceLevel, performanceClass;
        if (avgPerformance >= 80) {
            performanceLevel = "Elite";performanceClass = "score-excellent";
        } else if (avgPerformance >= 65) {
            performanceLevel = "Strong";performanceClass = "score-good";
        } else if (avgPerformance >= 50) {
            performanceLevel = "Developing";performanceClass = "score-fair";
        } else {
            performanceLevel = "Needs Improvement";performanceClass = "score-poor";
        }
        // Determine health status
        let healthStatus, healthClass;
        if (highRiskPlayers.length === 0 && avgFitness >= 75) {
            healthStatus = "Excellent";healthClass = "score-excellent";
        } else if (highRiskPlayers.length <= 1 && avgFitness >= 60) {
            healthStatus = "Good";healthClass = "score-good";
        } else if (highRiskPlayers.length <= 2) {
            healthStatus = "Monitor";healthClass = "score-fair";
        } else {
            healthStatus = "Concern";healthClass = "score-poor";
        }

        // Determine training balance
        let trainingBalance, trainingClass;
        if (avgTrainingHours >= 20 && avgTrainingHours <= 30) {
            trainingBalance = "Optimal";trainingClass = "score-excellent";
        } else if (avgTrainingHours >= 15 && avgTrainingHours <= 35) {
            trainingBalance = "Good";trainingClass = "score-good";
        } else {
            trainingBalance = "Adjustment Needed";trainingClass = "score-fair";
        }
        // Generate conclusions
        const overallConclusion = this.generateOverallConclusion(avgPerformance, highRiskPlayers.length, avgTrainingHours);
        const performanceConclusion = this.generatePerformanceConclusion(avgPerformance, improvingPlayers.length, totalPlayers);
        const healthConclusion = this.generateHealthConclusion(highRiskPlayers.length, avgFitness, fatiguedPlayers.length);
        const trainingConclusion = this.generateTrainingConclusion(avgTrainingHours, avgEfficiency, fatiguedPlayers.length);
        // Generate recommendations
        const recommendations = this.generateRecommendations(highRiskPlayers, fatiguedPlayers, avgPerformance, avgTrainingHours);
        // Generate immediate actions
        const immediateActions = this.generateImmediateActions(highRiskPlayers, fatiguedPlayers, avgPerformance);

        return {
            performanceLevel,performanceClass,healthStatus,healthClass,
            trainingBalance,trainingClass,overallConclusion,
            topPerformer: {
                name: topPerformer.playerName,score: topPerformer.performanceScore
            },
            performanceRange,improvingCount: improvingPlayers.length,performanceConclusion,highRiskCount: highRiskPlayers.length,avgFitness,fatigueConcerns: fatiguedPlayers.length,healthConclusion,avgTrainingHours,avgEfficiency,recoveryStatus: this.getRecoveryStatus(),trainingConclusion,recommendations,immediateActions
        };
    }

    generateOverallConclusion(avgPerformance, highRiskCount, avgTraining) {
        if (avgPerformance >= 75 && highRiskCount === 0) {
            return "Team is performing at an elite level with excellent health indicators. Maintain current approach.";
        } else if (avgPerformance >= 60 && highRiskCount <= 1) {
            return "Team shows strong performance with minor health concerns. Focus on consistency and injury prevention.";
        } else if (highRiskCount >= 3) {
            return "Team has significant health concerns affecting performance. Immediate medical intervention required.";
        } else if (avgTraining > 35) {
            return "Team may be overtraining. Reduce training load and focus on recovery.";
        } else {
            return "Team needs balanced approach to training and performance development.";
        }
    }

    generatePerformanceConclusion(avgPerformance, improvingCount, totalPlayers) {
        const improvingPercentage = Math.round((improvingCount / totalPlayers) * 100);
        
        if (avgPerformance >= 75 && improvingPercentage >= 60) {
            return "Excellent team performance with positive trajectory across most athletes.";
        } else if (avgPerformance >= 60) {
            return `Good performance level with ${improvingPercentage}% of athletes showing improvement.`;
        } else if (improvingPercentage >= 70) {
            return "Team is developing well with positive trends, though overall performance needs improvement.";
        } else {
            return "Performance requires attention with focus on skill development and consistency.";
        }
    }

    generateHealthConclusion(highRiskCount, avgFitness, fatigueCount) {
        if (highRiskCount === 0 && avgFitness >= 75) {
            return "Team health is excellent with low injury risk and high fitness levels.";
        } else if (highRiskCount <= 1) {
            return "Overall team health is good with minor concerns for individual athletes.";
        } else if (fatigueCount >= 3) {
            return "High fatigue levels detected across team. Recovery protocols need immediate attention.";
        } else {
            return "Team health requires monitoring and intervention for high-risk athletes.";
        }
    }

    generateTrainingConclusion(avgTraining, avgEfficiency, fatigueCount) {
        if (avgTraining >= 20 && avgTraining <= 30 && avgEfficiency >= 70) {
            return "Training load is optimal with good efficiency. Continue current regimen.";
        } else if (avgTraining > 35) {
            return "Training load is excessive. Risk of overtraining and burnout is high.";
        } else if (avgTraining < 15) {
            return "Training volume is insufficient for optimal performance development.";
        } else if (avgEfficiency < 50) {
            return "Training efficiency is low. Review training methods and recovery protocols.";
        } else {
            return "Training program needs minor adjustments for optimal results.";
        }
    }

    generateRecommendations(highRiskPlayers, fatiguedPlayers, avgPerformance, avgTraining) {
        const recommendations = [];     
        if (highRiskPlayers.length > 0) {
            recommendations.push({
                priority: 'high',text: `Immediate medical review for ${highRiskPlayers.length} high-risk athletes`
            });
        }     
        if (fatiguedPlayers.length > 2) {
            recommendations.push({
                priority: 'high',text: 'Implement mandatory recovery protocols for fatigued athletes'
            });
        }     
        if (avgPerformance < 60) {
            recommendations.push({
                priority: 'medium',text: 'Focus on skill development and technique improvement across team'
            });
        }  
        if (avgTraining > 35) {
            recommendations.push({
                priority: 'medium',text: 'Reduce training load by 15-20% to prevent overtraining'
            });
        }    
        if (avgTraining < 15) {
            recommendations.push({
                priority: 'medium',text: 'Increase training volume to improve performance development'
            });
        }
        recommendations.push({
            priority: 'low',text: 'Schedule regular team health and performance assessments'
        });
        
        return recommendations;
    }

    generateImmediateActions(highRiskPlayers, fatiguedPlayers, avgPerformance) {
        const actions = [];  
        if (highRiskPlayers.length > 0) {
            actions.push({
                urgency: 'urgent',icon: '🚨',title: 'Medical Intervention Required',description: `${highRiskPlayers.length} athletes require immediate medical attention`
            });
        }
        
        if (fatiguedPlayers.length > 2) {
            actions.push({
                urgency: 'high',icon: '😴',title: 'Recovery Protocol Implementation',description: 'Mandatory recovery days for fatigued athletes'
            });
        }
        
        if (avgPerformance < 50) {
            actions.push({
                urgency: 'high',icon: '📈',title: 'Performance Development Plan',description: 'Create individual performance improvement plans'
            });
        }
        
        actions.push({
            urgency: 'medium',icon: '📊',title: 'Weekly Performance Review',description: 'Schedule team performance analysis meeting'
        });
        return actions;
    }

    getRecoveryStatus() {
        const goodRecovery = this.players.filter(p => p.recoveryStatus === 'Excellent' || p.recoveryStatus === 'Good').length;
        const percentage = Math.round((goodRecovery / this.players.length) * 100);
        if (percentage >= 80) return "Excellent";if (percentage >= 60) return "Good";if (percentage >= 40) return "Fair";
        return "Poor";
    }
}

// Global Functions
function openAddPlayerModal() {
    dashboard.openAddPlayerModal();
}
function closeAddPlayerModal() {
    dashboard.closeAddPlayerModal();
}
function openCompareModal() {
    dashboard.openCompareModal();
}
function closeCompareModal() {
    dashboard.closeCompareModal();
}
function showComparisonTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    // Add active class to clicked button
    event.target.classList.add('active');
}

function exportToCSV() {
    if (dashboard.players.length === 0) {
        alert('No data to export!');
        return;
    }

    const headers = [
        'Player Name', 'Position', 'Stamina', 'Batting Power', 'Bowling Speed','Training Hours', 'Fatigue Level', 'Recovery Hours', 'Previous Injuries','Training Phase', 'Training Intensity', 'Performance Score', 'Fitness Level','Injury Risk', 'Medical Status', 'Recovery Status', 'Performance Trend'
    ];

    const csvContent = [
        headers.join(','),
        ...dashboard.players.map(player => [
            player.playerName,player.position,player.stamina,player.battingPower,player.bowlingSpeed,player.trainingHours,player.fatigueLevel,player.recoveryHours,player.previousInjuries,player.trainingPhase,player.trainingIntensity,player.performanceScore,player.fitnessLevel,player.injuryRisk,player.medicalStatus,player.recoveryStatus,player.performanceTrend
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    dashboard.showSuccessMessage('Data exported successfully!');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        dashboard.players = [];
        dashboard.saveToLocalStorage();
        dashboard.updateDashboard();
        dashboard.showSuccessMessage('All data cleared successfully!');
    }
}

function loadSampleData() {
    const samplePlayers = [
        {
            playerName: 'Virat Kohli',position: 'Batsman',stamina: 85,battingPower: 95,bowlingSpeed: 30,trainingHours: 25,fatigueLevel: 35,recoveryHours: 8,previousInjuries: 2,trainingPhase: 'In-season',trainingIntensity: 'Medium'
        },
        {
            playerName: 'Jasprit Bumrah',position: 'Bowler',stamina: 80,battingPower: 40,bowlingSpeed: 95,trainingHours: 30,fatigueLevel: 45,recoveryHours: 7.5,previousInjuries: 3,trainingPhase: 'In-season',trainingIntensity: 'High'
        },
        {
            playerName: 'Ravindra Jadeja',position: 'All-rounder',stamina: 90,battingPower: 75,bowlingSpeed: 80,trainingHours: 28,fatigueLevel: 40,recoveryHours: 8,previousInjuries: 1,trainingPhase: 'In-season',trainingIntensity: 'Medium'
        },
        {
            playerName: 'Rohit Sharma',position: 'Batsman',stamina: 75,battingPower: 90,bowlingSpeed: 25,trainingHours: 22,fatigueLevel: 30,recoveryHours: 8.5,previousInjuries: 2,trainingPhase: 'In-season',trainingIntensity: 'Low'
        },
        {
            playerName: 'MS Dhoni',position: 'Wicket-keeper',stamina: 70,battingPower: 85,bowlingSpeed: 20,trainingHours: 20,fatigueLevel: 25,recoveryHours: 9,previousInjuries: 4,trainingPhase: 'Recovery',trainingIntensity: 'Low'
        }
    ];

    samplePlayers.forEach(data => {
        const player = dashboard.createPlayer(data);
        player.id = Date.now() + Math.random();
        dashboard.players.push(player);
    });

    dashboard.saveToLocalStorage();dashboard.updateDashboard();
    dashboard.showSuccessMessage('Sample data loaded successfully!');
}
// Initialize Dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new CricketDashboard();
});
