let trades = JSON.parse(localStorage.getItem("journal_trades")) || [];

      document.getElementById("tradeDate").valueAsDate = new Date();

      document.getElementById("journalForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const trade = {
          id: Date.now(),
          date: document.getElementById("tradeDate").value,
          direction: document.getElementById("direction").value,
          symbol: document.getElementById("symbol").value.toUpperCase(),
          qty: parseFloat(document.getElementById("qty").value),
          entry: parseFloat(document.getElementById("entry").value),
          stoploss: parseFloat(document.getElementById("stoploss").value),
          target: parseFloat(document.getElementById("target").value),
          exit: parseFloat(document.getElementById("exit").value),
          profitLoss: document.getElementById("profitLoss").value,
        };

        trades.push(trade);
        localStorage.setItem("journal_trades", JSON.stringify(trades));

        this.reset();
        document.getElementById("tradeDate").valueAsDate = new Date();

        renderTrades();

        Swal.fire({
          title: 'Trade Added!',
          text: 'Your trade has been recorded successfully.',
          icon: 'success',
          confirmButtonColor: '#20bf6b',
          background: 'rgba(13, 17, 23, 0.95)',
          color: '#fff',
          timer: 2000,
          timerProgressBar: true
        });
      });

      function renderTrades() {
        const tradesList = document.getElementById("tradesList");

        if (trades.length === 0) {
          tradesList.innerHTML =
            '<div class="text-center text-gray-500 py-8">No trades recorded yet</div>';
          return;
        }

        const sortedTrades = [...trades].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const groupedTrades = {};
        sortedTrades.forEach((trade) => {
          if (!groupedTrades[trade.date]) {
            groupedTrades[trade.date] = [];
          }
          groupedTrades[trade.date].push(trade);
        });

        let html = "";
        Object.keys(groupedTrades).forEach((date) => {
          const dateObj = new Date(date + "T00:00:00");
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          html += `<div class="date-divider">${formattedDate}</div>`;

          groupedTrades[date].forEach((trade) => {
            const rowClass = trade.profitLoss === "Profit" ? "profit-row" : "loss-row";
            const arrow = trade.direction === "Long" ? "↑" : "↓";
            const pnl = (trade.exit - trade.entry) * (trade.direction === "Long" ? 1 : -1);
            const totalPnl = pnl * trade.qty;
            const riskReward = Math.abs((trade.target - trade.entry) / (trade.entry - trade.stoploss)).toFixed(2);

            html += `
              <div class="glass-light rounded-lg p-4 mb-3 ${rowClass} transition-all hover:scale-[1.01]">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">${arrow}</span>
                    <span class="text-xl font-bold text-gray-200">${trade.symbol}</span>
                    <span class="text-sm text-gray-400">${trade.direction}</span>
                    <span class="text-xs bg-gray-700 px-2 py-1 rounded">Qty: ${trade.qty}</span>
                  </div>
                  <button onclick="deleteTrade(${trade.id})" class="text-red-400 hover:text-red-300 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-400">Entry:</span>
                    <span class="text-gray-200 font-semibold ml-2">${trade.entry}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Exit:</span>
                    <span class="text-gray-200 font-semibold ml-2">${trade.exit}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Stop Loss:</span>
                    <span class="text-gray-200 font-semibold ml-2">${trade.stoploss}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Target:</span>
                    <span class="text-gray-200 font-semibold ml-2">${trade.target}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">P&L per unit:</span>
                    <span class="${trade.profitLoss === "Profit" ? "text-green-400" : "text-red-400"} font-bold ml-2">
                      ${pnl.toFixed(7)}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Total P&L:</span>
                    <span class="${trade.profitLoss === "Profit" ? "text-green-400" : "text-red-400"} font-bold ml-2">
                      ${totalPnl.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">R:R:</span>
                    <span class="text-gray-200 font-semibold ml-2">1:${riskReward}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Status:</span>
                    <span class="${trade.profitLoss === "Profit" ? "text-green-400" : "text-red-400"} font-bold ml-2">
                      ${trade.profitLoss}
                    </span>
                  </div>
                </div>
              </div>
            `;
          });
        });

        tradesList.innerHTML = html;
      }

      function deleteTrade(id) {
        Swal.fire({
          title: 'Delete Trade?',
          text: "This action cannot be undone!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#30363d',
          confirmButtonText: 'Yes, delete it!',
          background: 'rgba(13, 17, 23, 0.95)',
          color: '#fff'
        }).then((result) => {
          if (result.isConfirmed) {
            trades = trades.filter((t) => t.id !== id);
            localStorage.setItem("journal_trades", JSON.stringify(trades));
            renderTrades();

            Swal.fire({
              title: 'Deleted!',
              text: 'Trade has been deleted.',
              icon: 'success',
              confirmButtonColor: '#20bf6b',
              background: 'rgba(13, 17, 23, 0.95)',
              color: '#fff',
              timer: 2000,
              timerProgressBar: true
            });
          }
        });
      }

      function resetJournal() {
        Swal.fire({
          title: 'Reset Journal?',
          text: "This will delete all trades. This cannot be undone!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#30363d',
          confirmButtonText: 'Yes, reset it!',
          background: 'rgba(13, 17, 23, 0.95)',
          color: '#fff'
        }).then((result) => {
          if (result.isConfirmed) {
            trades = [];
            localStorage.setItem("journal_trades", JSON.stringify(trades));
            renderTrades();

            Swal.fire({
              title: 'Reset!',
              text: 'All trades have been deleted.',
              icon: 'success',
              confirmButtonColor: '#20bf6b',
              background: 'rgba(13, 17, 23, 0.95)',
              color: '#fff'
            });
          }
        });
      }

      function downloadJournal() {
        if (trades.length === 0) {
          Swal.fire({
            title: 'No Trades',
            text: 'There are no trades to download!',
            icon: 'info',
            confirmButtonColor: '#20bf6b',
            background: 'rgba(13, 17, 23, 0.95)',
            color: '#fff'
          });
          return;
        }

        const dataStr = JSON.stringify(trades, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `trading-journal-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
          title: 'Downloaded!',
          text: 'Your trading journal has been downloaded as JSON.',
          icon: 'success',
          confirmButtonColor: '#20bf6b',
          background: 'rgba(13, 17, 23, 0.95)',
          color: '#fff',
          timer: 3000,
          timerProgressBar: true
        });
      }

      renderTrades();