// UI/State
      let currentMode = "normal";

      // Element references
      const refs = {
        accountSize: document.getElementById("accountSize"),
        payoutAmount: document.getElementById("payoutAmount"),
        consistencyPercent: document.getElementById("consistencyPercent"),
        minTradingDays: document.getElementById("minTradingDays"),
        minDaysValue: document.getElementById("minDaysValue"),
        consistencyValue: document.getElementById("consistencyValue"),
        warningBanner: document.getElementById("warningBanner"),
        warningMessage: document.getElementById("warningMessage"),
        resultsCards: document.getElementById("resultsCards"),
        summaryContent: document.getElementById("summaryContent"),
        placeholder: document.getElementById("placeholder"),
        normalResults: document.getElementById("normalResults"),
        projectionChart: document.getElementById("projectionChart"),
        toggleSlider: document.getElementById("toggleSlider"),
        normalLabel: document.getElementById("normalLabel"),
        aggressiveLabel: document.getElementById("aggressiveLabel"),
      };

      // Attach real-time event listeners
      [
        refs.accountSize,
        refs.payoutAmount,
        refs.consistencyPercent,
        refs.minTradingDays,
      ].forEach((input) => input.addEventListener("input", updateAll));

      refs.consistencyPercent.addEventListener(
        "input",
        (e) => (refs.consistencyValue.textContent = e.target.value)
      );
      refs.minTradingDays.addEventListener(
        "input",
        (e) => (refs.minDaysValue.textContent = e.target.value)
      );

      function toggleMode() {
        if (currentMode === "normal") {
          currentMode = "aggressive";
          refs.toggleSlider.classList.add("aggressive");
          refs.normalLabel.classList.remove("active");
          refs.aggressiveLabel.classList.add("active");
        } else {
          currentMode = "normal";
          refs.toggleSlider.classList.remove("aggressive");
          refs.normalLabel.classList.add("active");
          refs.aggressiveLabel.classList.remove("active");
        }
        updateAll();
      }

      // Real-time calculation/update logic
      function updateAll() {
        // Get values
        const accountSize = parseFloat(refs.accountSize.value);
        const payoutAmount = parseFloat(refs.payoutAmount.value);
        const consistencyPercent = parseInt(refs.consistencyPercent.value);
        const minTradingDays = parseInt(refs.minTradingDays.value);

        // Basic validation
        if (
          isNaN(accountSize) ||
          isNaN(payoutAmount) ||
          isNaN(consistencyPercent) ||
          isNaN(minTradingDays) ||
          accountSize <= 0 ||
          payoutAmount <= 0 ||
          minTradingDays <= 0 ||
          payoutAmount > accountSize * 10
        ) {
          refs.normalResults.style.display = "none";
          refs.warningBanner.classList.add("hidden");
          refs.placeholder.style.display = "";
          return;
        }

        refs.placeholder.style.display = "none";

        if (currentMode === "normal")
          return showNormalResults(
            accountSize,
            payoutAmount,
            consistencyPercent,
            minTradingDays
          );
        else
          return showAggressiveResults(
            accountSize,
            payoutAmount,
            consistencyPercent,
            minTradingDays
          );
      }

      function showNormalResults(
        accountSize,
        payoutAmount,
        consistencyPercent,
        minTradingDays
      ) {
        const dailyTarget = payoutAmount / minTradingDays;
        const maxAllowed = payoutAmount * (consistencyPercent / 100);
        const dailyPercent = (dailyTarget / accountSize) * 100;
        refs.warningBanner.classList.add("hidden");

        // Consistency rule check
        if (dailyTarget > maxAllowed) {
          const minDaysNeeded = Math.ceil(payoutAmount / maxAllowed);
          const requiredConsistency = Math.ceil(
            (dailyTarget / payoutAmount) * 100
          );
          const maxPayoutPossible = (maxAllowed * minTradingDays).toFixed(2);

          refs.warningMessage.innerHTML = `
            <strong>Cannot achieve payout with current settings!</strong><br><br>
            <div class="space-y-2">
              <div>📊 <strong>Current Setup:</strong></div>
              <div class="ml-4">
                • Daily Target: <strong>$${dailyTarget.toFixed(2)}</strong> (${(
            (dailyTarget / payoutAmount) *
            100
          ).toFixed(1)}% of payout)<br>
                • Max Allowed: <strong>$${maxAllowed.toFixed(
                  2
                )}</strong> (${consistencyPercent}% consistency rule)<br>
                • Trading Days: <strong>${minTradingDays} days</strong>
              </div>
              <div class="mt-3">🎯 <strong>Minimum Trading Days Needed: ${minDaysNeeded} days</strong></div>
              <div class="mt-3">✅ <strong>Choose One Solution:</strong></div>
              <div class="ml-4">
                1. Increase Trading Days to <strong>${minDaysNeeded}+ days</strong><br>
                2. Increase Consistency % to <strong>${requiredConsistency}%+</strong><br>
                3. Switch to <strong>AGGRESSIVE</strong> mode<br>
                4. Reduce Payout Amount to <strong>$${maxPayoutPossible}</strong> or less
              </div>
            </div>
          `;
          refs.normalResults.style.display = "none";
          refs.warningBanner.classList.remove("hidden");
          return;
        }

        refs.warningBanner.classList.add("hidden");
        refs.normalResults.style.display = "";
        refs.resultsCards.innerHTML = `
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Trading Days</p>
              <p class="text-2xl font-bold text-green-400">${minTradingDays}</p>
              <p class="text-xs text-green-300 mt-1">100%</p>
            </div>
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Daily Target</p>
              <p class="text-2xl font-bold text-green-400">$${dailyTarget.toFixed(
                2
              )}</p>
              <p class="text-xs text-green-300 mt-1">${dailyPercent.toFixed(
                3
              )}% of account</p>
            </div>
        `;
        // Summary
        refs.summaryContent.innerHTML = `
            <div class="flex justify-between"><span>Mode:</span><span class="font-semibold text-green-400">Normal (Relaxed)</span></div>
            <div class="flex justify-between"><span>Total Days:</span><span class="font-semibold">${minTradingDays} days</span></div>
            <div class="flex justify-between"><span>Daily Target:</span><span class="font-semibold">$${dailyTarget.toFixed(
              2
            )}</span></div>
            <div class="flex justify-between"><span>Consistency Check:</span><span class="font-semibold text-green-400">✓ Pass (${consistencyPercent}%)</span></div>
            <div class="flex justify-between"><span>Total Payout:</span><span class="font-semibold text-green-400">$${payoutAmount.toFixed(
              2
            )}</span></div>
        `;
        drawPieChart(
          minTradingDays,
          dailyTarget,
          dailyTarget,
          accountSize,
          "NORMAL"
        );
      }

      function showAggressiveResults(
        accountSize,
        payoutAmount,
        consistencyPercent,
        minTradingDays
      ) {
        const maxAllowed = payoutAmount * (consistencyPercent / 100);
        const minDaysNeeded = Math.ceil(payoutAmount / maxAllowed);

        if (minTradingDays < minDaysNeeded) {
          const requiredConsistency = Math.ceil((1 / minTradingDays) * 100);
          const maxPayoutPossible = (maxAllowed * minTradingDays).toFixed(2);

          refs.warningMessage.innerHTML = `
            <strong>Cannot achieve payout in ${minTradingDays} day(s)!</strong><br><br>
            <div class="space-y-2">
              <div>📊 <strong>Current Setup:</strong></div>
              <div class="ml-4">
                • Payout Target: <strong>$${payoutAmount.toFixed(
                  2
                )}</strong><br>
                • Max per Day: <strong>$${maxAllowed.toFixed(
                  2
                )}</strong> (${consistencyPercent}% rule)<br>
                • Min Trading Days: <strong>${minTradingDays} days</strong>
              </div>
              <div class="mt-3">🎯 <strong>Minimum Trading Days Needed: ${minDaysNeeded} days</strong></div>
              <div class="mt-3">✅ <strong>Choose One Solution:</strong></div>
              <div class="ml-4">
                1. Increase Min Trading Days to <strong>${minDaysNeeded}+ days</strong><br>
                2. Increase Consistency % to <strong>${requiredConsistency}%+</strong><br>
                3. Reduce Payout Amount to <strong>$${maxPayoutPossible}</strong> or less<br>
                4. Switch to <strong>NORMAL</strong> mode
              </div>
            </div>
          `;
          refs.normalResults.style.display = "none";
          refs.warningBanner.classList.remove("hidden");
          return;
        }

        refs.warningBanner.classList.add("hidden");
        refs.normalResults.style.display = "";
        // Calculate distribution
        const bestDay = payoutAmount * (consistencyPercent / 100);
        const remainingProfit = payoutAmount - bestDay;
        const remainingDays = minTradingDays - 1;
        const otherDaysDaily =
          remainingDays > 0 ? remainingProfit / remainingDays : 0;
        const bestDayPercent = (bestDay / accountSize) * 100;
        const otherDaysPercent = (otherDaysDaily / accountSize) * 100;

        refs.resultsCards.innerHTML = `
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Best Day Profit</p>
              <p class="text-2xl font-bold text-blue-400">$${bestDay.toFixed(
                2
              )}</p>
              <p class="text-xs text-blue-300 mt-1">${bestDayPercent.toFixed(
                3
              )}% of account</p>
              <p class="text-xs text-gray-400 mt-1">${consistencyPercent}% of profit</p>
            </div>
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Other Days (each)</p>
              <p class="text-2xl font-bold text-blue-400">$${otherDaysDaily.toFixed(
                2
              )}</p>
              <p class="text-xs text-blue-300 mt-1">${otherDaysPercent.toFixed(
                3
              )}% of account</p>
              <p class="text-xs text-gray-400 mt-1">${
                100 - consistencyPercent
              }% of profit</p>
            </div>
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Trading Days</p>
              <p class="text-2xl font-bold text-blue-400">${minTradingDays}</p>
              <p class="text-xs text-blue-300 mt-1">100%</p>
            </div>
            <div class="glass-light rounded-lg p-4 result-card">
              <p class="text-xs text-gray-400 mb-1">Aggressive Payout</p>
              <p class="text-2xl font-bold text-blue-400">$${payoutAmount.toFixed(
                2
              )}</p>
              <p class="text-xs text-blue-300 mt-1"> </p>
            </div>
        `;
        // Summary
        refs.summaryContent.innerHTML = `
            <div class="flex justify-between"><span>Mode:</span><span class="font-semibold text-blue-400">Aggressive (Fast)</span></div>
            <div class="flex justify-between"><span>Best Day:</span><span class="font-semibold">$${bestDay.toFixed(
              2
            )}</span></div>
            <div class="flex justify-between"><span>Other ${remainingDays} Days:</span><span class="font-semibold">$${otherDaysDaily.toFixed(
          2
        )}/day</span></div>
            <div class="flex justify-between"><span>Complete In:</span><span class="font-semibold">${minTradingDays} days</span></div>
            <div class="flex justify-between"><span>Consistency Check:</span><span class="font-semibold text-green-400">✓ Pass (${consistencyPercent}%)</span></div>
            <div class="flex justify-between"><span>Total Payout:</span><span class="font-semibold text-green-400">$${payoutAmount.toFixed(
              2
            )}</span></div>
        `;
        drawPieChart(
          minTradingDays,
          bestDay,
          otherDaysDaily,
          accountSize,
          "AGGRESSIVE"
        );
      }

      // Minimal canvas pie chart for visual
      function drawPieChart(
        totalDays,
        firstDayValue,
        otherDaysValue,
        accountSize,
        mode
      ) {
        const canvas = refs.projectionChart;
        const ctx = canvas.getContext("2d"),
          centerX = canvas.width / 2,
          centerY = canvas.height / 2,
          outerRadius = 130,
          innerRadius = 80;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const firstDayColor = mode === "NORMAL" ? "#20bf6b" : "#20bf6b";
        const otherColors = [
          "#3498db",
          "#e67e3c",
          "#9b59b6",
          "#1abc9c",
          "#34495e",
          "#e67e22",
          "#2ecc71",
        ];
        const anglePerDay = (2 * Math.PI) / totalDays;
        let currentAngle = -0.5 * Math.PI;
        // First day
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          outerRadius,
          currentAngle,
          currentAngle + anglePerDay
        );
        ctx.closePath();
        ctx.fillStyle = firstDayColor;
        ctx.fill();
        ctx.strokeStyle = "#0a0a0a";
        ctx.lineWidth = 2;
        ctx.stroke();
        currentAngle += anglePerDay;
        // Other days
        for (let i = 1; i < totalDays; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(
            centerX,
            centerY,
            outerRadius,
            currentAngle,
            currentAngle + anglePerDay
          );
          ctx.closePath();
          ctx.fillStyle = otherColors[i % otherColors.length];
          ctx.fill();
          ctx.strokeStyle = "#0a0a0a";
          ctx.lineWidth = 2;
          ctx.stroke();
          currentAngle += anglePerDay;
        }
        // Inner Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(13,17,23,0.95)";
        ctx.fill();
        ctx.strokeStyle = "#30363d";
        ctx.lineWidth = 3;
        ctx.stroke();
        // Text
        ctx.fillStyle = "#20bf6b";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          "$" + (accountSize / 1000).toFixed(0) + "K",
          centerX,
          centerY - 15
        );
        ctx.fillStyle = mode === "NORMAL" ? "#20bf6b" : "#3498db";
        ctx.font = "bold 20px Arial";
        ctx.fillText(mode, centerX, centerY + 15);
      }

      // Set initial state
      refs.normalLabel.classList.add("active");

      // Initial call
      updateAll();