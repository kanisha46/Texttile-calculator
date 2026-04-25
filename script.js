// ------- helpers -------
const factorOptions = () =>
  Array.from({ length: 11 }, (_, i) => 100 + i)
    .map(v => `<option value="${v}" ${v === 110 ? "selected" : ""}>${v}</option>`)
    .join("");
function entryTemplate(type) {
  if (type === "warp") {
    return `
      <div class="entry" data-type="warp">
        <div class="row">
          <div class="field">
            <label>Warp Denier</label>
            <input type="number" inputmode="decimal" placeholder="Enter warp denier" class="denier">
          </div>
          <div class="field">
            <label>Taar (threads)</label>
            <input type="number" inputmode="decimal" placeholder="Enter taar" class="taar">
          </div>
          <div class="field">
            <label>Select Factor (100–110)</label>
            <select class="factor">${factorOptions()}</select>
          </div>
          <div class="field">
            <label>Warp Yarn Rate (₹ per kg)</label>
            <input type="number" inputmode="decimal" placeholder="Enter warp rate" class="warp-rate">
          </div>
        </div>
        <div class="entry-actions">
          <button class="btn btn-danger remove">− Remove Warp</button>
        </div>
      </div>`;
  }

// weft
return `
  <div class="entry" data-type="weft">
    <div class="row">
      <div class="field">
        <label>Weft Denier</label>
        <input type="number" inputmode="decimal" placeholder="Enter weft denier" class="denier">
      </div>
      <div class="field">
        <label>Peek</label>
        <input type="number" inputmode="decimal" placeholder="Enter peek" class="peek">
      </div>
      <div class="field">
        <label>Panna</label>
        <input type="number" inputmode="decimal" placeholder="Enter panna" class="panna">
      </div>
      <div class="field">
        <label>Select Factor (100–110)</label>
        <select class="factor">${factorOptions()}</select>
      </div>
      <div class="field">
        <label>Weft Yarn Rate (₹ per kg)</label>
        <input type="number" inputmode="decimal" placeholder="Enter weft rate" class="weft-rate">
      </div>
    </div>
    <div class="entry-actions">
      <button class="btn btn-danger remove">− Remove Weft</button>
    </div>
  </div>`;
}

// ------- init -------
const warpContainer = document.getElementById("warp-container");
const weftContainer = document.getElementById("weft-container");

function addWarp() {
  warpContainer.insertAdjacentHTML("beforeend", entryTemplate("warp"));
  updateRemoveState();
}
function addWeft() {
  weftContainer.insertAdjacentHTML("beforeend", entryTemplate("weft"));
  updateRemoveState();
}

function updateRemoveState() {
  const warpEntries = warpContainer.querySelectorAll(".entry");
  const weftEntries = weftContainer.querySelectorAll(".entry");

  warpEntries.forEach(entry => {
    const btn = entry.querySelector(".remove");
    btn.disabled = warpEntries.length === 1;
    btn.classList.toggle("disabled", btn.disabled);
  });

  weftEntries.forEach(entry => {
    const btn = entry.querySelector(".remove");
    btn.disabled = weftEntries.length === 1;
    btn.classList.toggle("disabled", btn.disabled);
  });
}

// default 1 + 1 on load
addWarp();
addWeft();

// ------- events -------
document.getElementById("add-warp").addEventListener("click", addWarp);
document.getElementById("add-weft").addEventListener("click", addWeft);

// Remove entry (event delegation)
document.addEventListener("click", (e) => {
  if (e.target.matches(".remove")) {
    e.target.closest(".entry")?.remove();
    updateRemoveState();
  }
});

// Calculate
// Calculate
document.getElementById("calc").addEventListener("click", () => {
  const lines = [];
  let warpTotalKg = 0, warpTotalCost = 0;
  let weftTotalKg = 0, weftTotalCost = 0;

  // Warp calculations
  warpContainer.querySelectorAll(".entry").forEach((entry, idx) => {
    const den = parseFloat(entry.querySelector(".denier").value || "0");
    const taar = parseFloat(entry.querySelector(".taar").value || "0");
    const factor = parseFloat(entry.querySelector(".factor").value || "110");
    const warpRate = parseFloat(entry.querySelector(".warp-rate").value || "0"); 

    const kg = (den * taar * factor) / 9_000_000; 
    const cost = kg * warpRate;

    warpTotalKg += kg;
    warpTotalCost += cost;

    lines.push(
      `<div class="line"><strong>Warp ${idx + 1}</strong> — ${kg.toFixed(4)} kg | Cost ₹${cost.toFixed(2)}</div>`
    );
  });

  // Weft calculations
  weftContainer.querySelectorAll(".entry").forEach((entry, idx) => {
    const den = parseFloat(entry.querySelector(".denier").value || "0");
    const peek = parseFloat(entry.querySelector(".peek").value || "0");
    const panna = parseFloat(entry.querySelector(".panna").value || "0");
    const factor = parseFloat(entry.querySelector(".factor").value || "110");
    const weftRate = parseFloat(entry.querySelector(".weft-rate").value || "0"); 

    const kg = (den * peek * panna * factor) / 9_000_000;
    const cost = kg * weftRate;

    weftTotalKg += kg;
    weftTotalCost += cost;

    lines.push(
      `<div class="line"><strong>Weft ${idx + 1}</strong> — ${kg.toFixed(4)} kg | Cost ₹${cost.toFixed(2)}</div>`
    );
  });

  // Render results
const results = document.getElementById("results");
const grandTotalKg = warpTotalKg + weftTotalKg;
const grandTotalCost = warpTotalCost + weftTotalCost;

// प्रतिशत calculation
const warpPercent = grandTotalKg ? (warpTotalKg / grandTotalKg) * 100 : 0;
const weftPercent = grandTotalKg ? (weftTotalKg / grandTotalKg) * 100 : 0;

results.innerHTML = `
  <h3>Results</h3>
  ${lines.join("") || '<div class="muted">No inputs.</div>'}
  <div class="line"></div>

  <div class="line">
    <strong>Warp Subtotal</strong><br>
    Weight: ${warpTotalKg.toFixed(4)} kg 
    (${warpTotalKg.toFixed(4)} / ${grandTotalKg.toFixed(4)} = ${warpPercent.toFixed(2)}%)<br>
    Cost: ₹${warpTotalCost.toFixed(2)}
  </div>

  <div class="line">
    <strong>Weft Subtotal</strong><br>
    Weight: ${weftTotalKg.toFixed(4)} kg 
    (${weftTotalKg.toFixed(4)} / ${grandTotalKg.toFixed(4)} = ${weftPercent.toFixed(2)}%)<br>
    Cost: ₹${weftTotalCost.toFixed(2)}
  </div>

  <div class="line">
    <strong>Grand Total</strong><br>
    Weight: ${grandTotalKg.toFixed(4)} kg<br>
    Cost: ₹${grandTotalCost.toFixed(2)}
  </div>
`;
  results.classList.add("show");
});
