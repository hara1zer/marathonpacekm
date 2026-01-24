/* MarathonPaceKM - app.js
   Compatible with homepage markup IDs:
   h, m, s, dist, calcBtn, resetBtn, results, chartTable
*/

/* ---------- helpers ---------- */
function pad2(n) { return String(n).padStart(2, "0"); }

function clampInt(val, min, max, fallback = 0) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return Math.min(max, Math.max(min, i));
}

function secondsToPace(secPerKm) {
  // Round to nearest second, avoid 5:60 edge-case by using mod
  const total = Math.round(secPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad2(s)} min/km`;
}

function secondsToHMS(totalSeconds) {
  const t = Math.round(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}:${pad2(m)}:${pad2(s)}`;
}

function getEl(id) { return document.getElementById(id); }

function isMarathonDistance(distKm) {
  return Math.abs(distKm - 42.195) < 0.001;
}

function labelForKm(km) {
  if (Math.abs(km - 21.0975) < 0.001) return "Half (21.1)";
  // Keep integers clean; allow 42.195 finish label elsewhere
  return Number.isInteger(km) ? `${km} km` : `${km} km`;
}

function buildTable(rowsHtml, col1, col2) {
  return `
    <table>
      <thead><tr><th>${col1}</th><th>${col2}</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function buildCheckpointRows(checkpoints, secPerKm) {
  let rows = "";
  for (const k of checkpoints) {
    rows += `<tr><td>${labelForKm(k)}</td><td>${secondsToHMS(secPerKm * k)}</td></tr>`;
  }
  return rows;
}

/* ---------- chart ---------- */
function buildChart() {
  // “Common finish times” chart for marathon: 2:30 to 6:00, 5-min steps
  const chartEl = getEl("chartTable");
  if (!chartEl) return;

  const startMin = 150; // 2:30
  const endMin = 360;   // 6:00
  const stepMin = 5;

  let html = `
    <table>
      <thead>
        <tr>
          <th>Finish time</th>
          <th>Avg pace (min/km)</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let min = startMin; min <= endMin; min += stepMin) {
    const totalSec = min * 60;
    const pace = totalSec / 42.195;
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    html += `
      <tr>
        <td>${hh}:${pad2(mm)}:00</td>
        <td>${secondsToPace(pace)}</td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  chartEl.innerHTML = html;
}

/* ---------- calculation ---------- */
function calc() {
  const hEl = getEl("h");
  const mEl = getEl("m");
  const sEl = getEl("s");
  const distEl = getEl("dist");
  const resultsEl = getEl("results");

  if (!hEl || !mEl || !sEl || !distEl || !resultsEl) return;

  // sanitize input
  const h = clampInt(hEl.value, 0, 99, 0);
  const m = clampInt(mEl.value, 0, 59, 0);
  const s = clampInt(sEl.value, 0, 59, 0);

  // write back sanitized values (prevents weird inputs)
  hEl.value = h;
  mEl.value = m;
  sEl.value = s;

  const dist = Number(distEl.value);
  const totalSec = h * 3600 + m * 60 + s;

  if (!Number.isFinite(dist) || dist <= 0) {
    resultsEl.innerHTML = `<p class="muted">Distance is invalid. Please select a distance.</p>`;
    return;
  }

  if (totalSec <= 0) {
    resultsEl.innerHTML = `<p class="muted">Enter a finish time above 0.</p>`;
    return;
  }

  const secPerKm = totalSec / dist;

  // Summary
  const paceStr = secondsToPace(secPerKm);
  const timeStr = secondsToHMS(totalSec);

  // --- NEW: Race-day checkpoints (small, high value) ---
  // Always include Finish; include core checkpoints only if within distance
  const raceCheckpointsCore = [5, 10, 21.0975, 30, 40].filter(k => k < dist);
  const raceRows = buildCheckpointRows(raceCheckpointsCore, secPerKm);
  const finishLabel = isMarathonDistance(dist) ? "Finish (42.2)" : `Finish (${dist} km)`;
  const raceTable = buildTable(
    (raceRows || `<tr><td colspan="2" class="muted">No checkpoints for this distance.</td></tr>`) +
      `<tr><td><b>${finishLabel}</b></td><td><b>${timeStr}</b></td></tr>`,
    "Checkpoint",
    "Cumulative time"
  );

  // --- Key markers (more detail, collapsible) ---
  const markersAll = [5, 10, 15, 20, 21.0975, 25, 30, 35, 40].filter(k => k < dist);
  const markerRows = buildCheckpointRows(markersAll, secPerKm);
  const markerTable = buildTable(
    markerRows || `<tr><td colspan="2" class="muted">No markers for this distance.</td></tr>`,
    "Marker",
    "Time"
  );

  // Per-km splits: 1 km through floor(dist), then finish row at exact distance
  const wholeKm = Math.floor(dist);
  let splitRows = "";

  for (let km = 1; km <= wholeKm; km++) {
    splitRows += `<tr><td>${km}</td><td>${secondsToHMS(secPerKm * km)}</td></tr>`;
  }

  // Finish row
  const finishSplitLabel =
    isMarathonDistance(dist) ? "42.2 (Finish)" : `${dist} (Finish)`;
  splitRows += `<tr><td><b>${finishSplitLabel}</b></td><td><b>${timeStr}</b></td></tr>`;

  resultsEl.innerHTML = `
    <p><b>Average pace:</b> ${paceStr}</p>
    <p class="muted"><b>Finish time:</b> ${timeStr} &nbsp;|&nbsp; <b>Distance:</b> ${dist} km</p>

    <h3>Race-day checkpoints</h3>
    <p class="muted">The most useful splits for staying on target (5k/10k/half/30k/40k + finish).</p>
    ${raceTable}

    <details style="margin-top:10px;">
      <summary><b>More key markers (15k/20k/25k/35k)</b></summary>
      <div style="margin-top:8px;">
        ${markerTable}
      </div>
    </details>

    <h3 style="margin-top:14px;">Per-kilometre splits</h3>
    <table>
      <thead><tr><th>KM</th><th>Cumulative time</th></tr></thead>
      <tbody>${splitRows}</tbody>
    </table>
  `;
}

function resetForm() {
  // On goal pages, reset back to that page’s goal time + (optional) locked distance
  if (window.GOAL_PAGE) {
    applyGoalPageDefaults();
    return;
  }

  const hEl = getEl("h");
  const mEl = getEl("m");
  const sEl = getEl("s");
  const distEl = getEl("dist");
  const resultsEl = getEl("results");

  if (hEl) hEl.value = 4;
  if (mEl) mEl.value = 0;
  if (sEl) sEl.value = 0;
  if (distEl) distEl.value = "42.195";
  if (resultsEl) resultsEl.innerHTML = "";
}

/* ---------- goal pages ---------- */
/*
  On goal landing pages, define before loading app.js:

  <script>
    window.GOAL_PAGE = { goalSeconds: 13800, lockDistanceKm: 42.195 };
  </script>
  <script src="/assets/app.js"></script>

  goalSeconds examples:
    3:00:00 = 10800
    3:15:00 = 11700
    3:30:00 = 12600
    3:45:00 = 13500
    3:50:00 = 13800
    4:00:00 = 14400
*/
function applyGoalPageDefaults() {
  if (!window.GOAL_PAGE) return;

  const { goalSeconds, lockDistanceKm } = window.GOAL_PAGE;
  if (!Number.isFinite(goalSeconds) || goalSeconds <= 0) return;

  const hEl = getEl("h");
  const mEl = getEl("m");
  const sEl = getEl("s");
  const distEl = getEl("dist");

  // 1) set time inputs
  const hours = Math.floor(goalSeconds / 3600);
  const mins = Math.floor((goalSeconds % 3600) / 60);
  const secs = Math.floor(goalSeconds % 60);

  if (hEl) hEl.value = hours;
  if (mEl) mEl.value = mins;
  if (sEl) sEl.value = secs;

  // 2) lock distance + hide selector wrapper (optional)
  if (distEl && lockDistanceKm) {
    distEl.value = String(lockDistanceKm);

    // Hide only the field wrapper that contains the <label>Distance</label> + <select>
    const wrapper = distEl.parentElement; // <div> that wraps label+select in your homepage grid
    if (wrapper) wrapper.style.display = "none";
  }

  // 3) run calc immediately
  calc();
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildChart();

  const calcBtn = getEl("calcBtn");
  const resetBtn = getEl("resetBtn");

  if (calcBtn) calcBtn.addEventListener("click", calc);
  if (resetBtn) resetBtn.addEventListener("click", resetForm);

  // If this is a goal page, auto-apply and auto-calc
  applyGoalPageDefaults();
});
