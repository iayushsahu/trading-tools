// State variables
      let withdrawalEnabled = false;
      let consistencyEnabled = false;

      // Element references
      const refs = {
        accountSize: document.getElementById("accountSize"),
        payoutPercent: document.getElementById("payoutPercent"),
        payoutPercentValue: document.getElementById("payoutPercentValue"),
        withdrawalToggle: document.getElementById("withdrawalToggle"),
        withdrawalStatus: document.getElementById("withdrawalStatus"),
        consistencyToggle: document.getElementById("consistencyToggle"),
        consistencyStatus: document.getElementById("consistencyStatus"),
        consistencyPercent: document.getElementById("consistencyPercent"),
        consistencyPercentValue: document.getElementById("consistencyPercentValue"),
        consistencySliderContainer: document.getElementById("consistencySliderContainer"),
        rewardSplit: document.getElementById("rewardSplit"),
        rewardSplitValue: document.getElementById("rewardSplitValue"),
        warningBanner: document.getElementById("warningBanner"),
        warningMessage: document.getElementById("warningMessage"),
        results: document.getElementById("results"),
        placeholder: document.getElementById("placeholder"),
        payoutAmount: document.getElementById("payoutAmount"),
        payoutPercent: document.getElementById("payoutPercent"),
        bestDayCard: document.getElementById("bestDayCard"),
        bestDayProfit: document.getElementById("bestDayProfit"),
        bestDayPercent: document.getElementById("bestDayPercent"),
        calculationSteps: document.getElementById("calculationSteps"),
        summaryContent: document.getElementById("summaryContent"),
      };

      // Event listeners
      refs.accountSize.addEventListener("input", updateCalculations);
      refs.payoutPercent.addEventListener("input", (e) => {
        refs.payoutPercentValue.textContent = parseFloat(e.target.value).toFixed(2);
        updateCalculations();
      });
      refs.consistencyPercent.addEventListener("input", (e) => {
        refs.consistencyPercentValue.textContent = e.target.value;
        updateCalculations();
      });
      refs.rewardSplit.addEventListener("input", (e) => {
        refs.rewardSplitValue.textContent = e.target.value;
        updateCalculations();
      });

      function toggleWithdrawal() {
        withdrawalEnabled = !withdrawalEnabled;
        refs.withdrawalToggle.classList.toggle("active");
        refs.withdrawalStatus.textContent = withdrawalEnabled ? "Enabled" : "Disabled";
        refs.withdrawalStatus.className = withdrawalEnabled 
          ? "text-green-400 text-sm font-semibold" 
          : "text-gray-400 text-sm";
        updateCalculations();
      }

      function toggleConsistency() {
        consistencyEnabled = !consistencyEnabled;
        refs.consistencyToggle.classList.toggle("active");
        refs.consistencyStatus.textContent = consistencyEnabled ? "Enabled" : "Disabled";
        refs.consistencyStatus.className = consistencyEnabled 
          ? "text-green-400 text-sm font-semibold" 
          : "text-gray-400 text-sm";
        refs.consistencySliderContainer.style.display = consistencyEnabled ? "block" : "none";
        updateCalculations();
      }

      function updateCalculations() {
        // Get values
        const accountSize = parseFloat(refs.accountSize.value);
        const payoutPercent = parseFloat(refs.payoutPercent.value);
        const consistencyPercent = parseInt(refs.consistencyPercent.value);
        const rewardSplit = parseInt(refs.rewardSplit.value);

        // Validation
        if (isNaN(accountSize) || accountSize < 5000 || isNaN(payoutPercent) || payoutPercent <= 0) {
          refs.results.classList.add("hidden");
          refs.placeholder.style.display = "";
          refs.warningBanner.classList.add("hidden");
          return;
        }

        // Hide placeholder
        refs.placeholder.style.display = "none";
        refs.warningBanner.classList.add("hidden");

        // Calculate target profit
        const targetProfit = (accountSize * payoutPercent) / 100;
        let calculatedPayout = targetProfit;
        let steps = [];

        // Step 1: Initial calculation
        steps.push(`<div class="formula-box">
          <div class="text-green-400 font-semibold mb-1">Step 1: Calculate Target Profit</div>
          <div>Account Size × Payout % = Target Profit</div>
          <div>$${accountSize.toLocaleString()} × ${payoutPercent}% = $${targetProfit.toFixed(2)}</div>
        </div>`);

        // Step 2: Apply 50% withdrawal if enabled
        if (withdrawalEnabled) {
          calculatedPayout = calculatedPayout / 2;
          steps.push(`<div class="formula-box">
            <div class="text-green-400 font-semibold mb-1">Step 2: Apply 50% Withdrawal Rule</div>
            <div>Target Profit ÷ 2 = Adjusted Profit</div>
            <div>$${targetProfit.toFixed(2)} ÷ 2 = $${calculatedPayout.toFixed(2)}</div>
          </div>`);
        }

        // Step 3: Apply reward split
        const beforeSplit = calculatedPayout;
        calculatedPayout = (calculatedPayout * rewardSplit) / 100;
        const stepNum = withdrawalEnabled ? 3 : 2;
        steps.push(`<div class="formula-box">
          <div class="text-green-400 font-semibold mb-1">Step ${stepNum}: Apply Reward Split</div>
          <div>${withdrawalEnabled ? 'Adjusted' : 'Target'} Profit × ${rewardSplit}% = Final Payout</div>
          <div>$${beforeSplit.toFixed(2)} × ${rewardSplit}% = $${calculatedPayout.toFixed(2)}</div>
        </div>`);

        // Calculate best day profit if consistency is enabled
        let bestDayProfit = 0;
        if (consistencyEnabled) {
          bestDayProfit = (targetProfit * consistencyPercent) / 100;
          const stepNum2 = withdrawalEnabled ? 4 : 3;
          steps.push(`<div class="formula-box">
            <div class="text-blue-400 font-semibold mb-1">Step ${stepNum2}: Calculate Best Day Limit</div>
            <div>Target Profit × Consistency % = Max Day Profit</div>
            <div>$${targetProfit.toFixed(2)} × ${consistencyPercent}% = $${bestDayProfit.toFixed(2)}</div>
          </div>`);
        }

        // Check for warnings
        if (consistencyEnabled && calculatedPayout > bestDayProfit) {
          refs.warningMessage.innerHTML = `
            <strong>Payout exceeds consistency rule limit!</strong><br><br>
            <div class="space-y-2">
              <div>📊 <strong>Current Situation:</strong></div>
              <div class="ml-4">
                • Your Payout: <strong>$${calculatedPayout.toFixed(2)}</strong><br>
                • Best Day Limit: <strong>$${bestDayProfit.toFixed(2)}</strong> (${consistencyPercent}% rule)<br>
                • Difference: <strong>$${(calculatedPayout - bestDayProfit).toFixed(2)}</strong> over limit
              </div>
              <div class="mt-3">💡 <strong>Recommendations:</strong></div>
              <div class="ml-4">
                1. Increase Consistency % to <strong>${Math.ceil((calculatedPayout / targetProfit) * 100)}%+</strong><br>
                2. Enable 50% Withdrawal Rule to reduce payout<br>
                3. Lower your Desired Payout % to <strong>${((bestDayProfit / accountSize) * 100).toFixed(2)}%</strong> or less<br>
                4. Distribute profit across multiple trading days
              </div>
            </div>
          `;
          refs.warningBanner.classList.remove("hidden");
        }

        // Update results
        refs.payoutAmount.textContent = `$${calculatedPayout.toFixed(2)}`;
        refs.payoutPercent.textContent = `${rewardSplit}% of ${withdrawalEnabled ? 'adjusted ' : ''}profit`;

        if (consistencyEnabled) {
          refs.bestDayCard.style.display = "";
          refs.bestDayProfit.textContent = `$${bestDayProfit.toFixed(2)}`;
          refs.bestDayPercent.textContent = `${consistencyPercent}% limit`;
        } else {
          refs.bestDayCard.style.display = "none";
        }

        // Update calculation steps
        refs.calculationSteps.innerHTML = steps.join("");

        // Update summary
        const accountPercent = ((calculatedPayout / accountSize) * 100).toFixed(3);
        let summaryHTML = `
          <div class="flex justify-between"><span>Account Size:</span><span class="font-semibold">$${accountSize.toLocaleString()}</span></div>
          <div class="flex justify-between"><span>Target Profit:</span><span class="font-semibold">$${targetProfit.toFixed(2)} (${payoutPercent}%)</span></div>
        `;
        
        if (withdrawalEnabled) {
          summaryHTML += `<div class="flex justify-between"><span>50% Withdrawal:</span><span class="font-semibold text-yellow-400">✓ Applied</span></div>`;
        }
        
        summaryHTML += `<div class="flex justify-between"><span>Reward Split:</span><span class="font-semibold">${rewardSplit}%</span></div>`;
        
        if (consistencyEnabled) {
          summaryHTML += `<div class="flex justify-between"><span>Consistency Rule:</span><span class="font-semibold text-blue-400">✓ ${consistencyPercent}%</span></div>`;
          summaryHTML += `<div class="flex justify-between"><span>Best Day Limit:</span><span class="font-semibold">$${bestDayProfit.toFixed(2)}</span></div>`;
        }
        
        summaryHTML += `
          <div class="border-t border-gray-700 mt-2 pt-2"></div>
          <div class="flex justify-between"><span class="text-green-400 font-semibold">Final Payout:</span><span class="font-bold text-green-400">$${calculatedPayout.toFixed(2)}</span></div>
          <div class="flex justify-between text-xs text-gray-400"><span>Payout % of Account:</span><span>${accountPercent}%</span></div>
        `;

        refs.summaryContent.innerHTML = summaryHTML;

        // Show results
        refs.results.classList.remove("hidden");
      }

      // Initial calculation
      updateCalculations();