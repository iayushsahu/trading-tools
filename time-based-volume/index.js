let checklistState = JSON.parse(
        localStorage.getItem("tbv_checklistState")
      ) || {
        checks: [false, false, false, false, false],
      };

      function loadChecklistState() {
        const allCheckboxes = document.querySelectorAll(".checkbox-custom");

        allCheckboxes.forEach((cb) => {
          const index = parseInt(cb.getAttribute("data-index"));
          if (!isNaN(index) && checklistState.checks[index]) {
            cb.checked = true;
          }
        });

        updatePieChart();
      }

      function handleSweepSelection(optionIndex) {
        const sweepOptions = document.querySelectorAll(".sweep-option");
        const currentCheckbox = sweepOptions[optionIndex];
        const otherCheckbox = sweepOptions[optionIndex === 0 ? 1 : 0];

        if (currentCheckbox.checked) {
          otherCheckbox.checked = false;
          checklistState.checks[2] = true;
        } else {
          checklistState.checks[2] = false;
        }

        localStorage.setItem("tbv_checklistState", JSON.stringify(checklistState));
        updatePieChart();
      }

      function updateChecklist() {
        const regularChecks = document.querySelectorAll(".regular-check");

        regularChecks.forEach((cb) => {
          const index = parseInt(cb.getAttribute("data-index"));
          if (!isNaN(index)) {
            checklistState.checks[index] = cb.checked;
          }
        });

        localStorage.setItem("tbv_checklistState", JSON.stringify(checklistState));
        updatePieChart();
      }

      function resetChecklist() {
        Swal.fire({
          title: 'Reset Checklist?',
          text: "Are you sure you want to reset the checklist?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#20bf6b',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Yes, reset it!',
          background: 'rgba(13, 17, 23, 0.95)',
          color: '#fff'
        }).then((result) => {
          if (result.isConfirmed) {
            checklistState = { checks: [false, false, false, false, false] };
            localStorage.setItem("tbv_checklistState", JSON.stringify(checklistState));

            const allCheckboxes = document.querySelectorAll(".checkbox-custom");
            allCheckboxes.forEach((cb) => (cb.checked = false));

            updatePieChart();

            Swal.fire({
              title: 'Reset!',
              text: 'Your checklist has been reset.',
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

      function updatePieChart() {
        const canvas = document.getElementById("pieChart");
        const ctx = canvas.getContext("2d");
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 110;

        const checkedCount = checklistState.checks.filter((c) => c).length;
        const totalCount = 5;
        const percentage = checkedCount / totalCount;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(48, 54, 61, 0.3)";
        ctx.fill();
        ctx.strokeStyle = "rgba(48, 54, 61, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (checkedCount > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(
            centerX,
            centerY,
            radius,
            -0.5 * Math.PI,
            (-0.5 + 2 * percentage) * Math.PI
          );
          ctx.closePath();

          const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius
          );
          gradient.addColorStop(0, "#20bf6b");
          gradient.addColorStop(1, "#1a9957");
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.strokeStyle = "#20bf6b";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(13, 17, 23, 0.9)";
        ctx.fill();

        ctx.font = "bold 36px Arial";
        ctx.fillStyle = "#20bf6b";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(percentage * 100) + "%", centerX, centerY);

        document.getElementById("progressText").textContent = `${checkedCount}/${totalCount}`;
        document.getElementById("progressPercent").textContent = Math.round(percentage * 100) + "%";
        document.getElementById("progressBar").style.width = (percentage * 100) + "%";

        // Update status badge
        const statusBadge = document.getElementById("statusBadge");
        if (checkedCount === 0) {
          statusBadge.textContent = "Not Started";
          statusBadge.className = "inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gray-700 text-gray-300";
        } else if (checkedCount < totalCount) {
          statusBadge.textContent = "In Progress";
          statusBadge.className = "inline-block px-4 py-2 rounded-full text-sm font-semibold bg-yellow-600 text-white";
        } else {
          statusBadge.textContent = "Complete ✓";
          statusBadge.className = "inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-600 text-white";
        }
      }

      loadChecklistState();