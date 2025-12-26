# -------------------------------
# Player Efficiency Analysis
# -------------------------------

# 1. Create vectors for player data
player <- c("Player A", "Player B", "Player C", "Player D")

matches <- c(20, 18, 22, 19)

runs <- c(850, 720, 910, 780)

average <- c(42.5, 40.0, 45.5, 41.0)

strike_rate <- c(135, 128, 140, 130)


# 2. Combine all vectors into a data frame
data <- data.frame(player, matches, runs, average, strike_rate)

# Display the dataset
print("Original Player Data:")
print(data)


# 3. Calculate Runs per Match
data$runs_per_match <- data$runs / data$matches


# 4. Calculate Player Efficiency using weighted method
# Efficiency = 40% Batting Average + 30% Strike Rate + 30% Runs per Match
data$efficiency <- (data$average * 0.4) +
  (data$strike_rate * 0.3) +
  (data$runs_per_match * 0.3)


# Display updated data with efficiency
print("Player Data with Efficiency Score:")
print(data)


# 5. Sort players based on efficiency (highest first)
data_sorted <- data[order(-data$efficiency), ]

print("Players Ranked by Efficiency:")
print(data_sorted)


# 6. Create a bar plot to compare player efficiency
barplot(data_sorted$efficiency,
        names.arg = data_sorted$player,
        main = "Player Efficiency Comparison",
        xlab = "Players",
        ylab = "Efficiency Score",
        col = "skyblue",
        space = 0.6)
