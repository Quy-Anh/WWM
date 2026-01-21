function pct(v) {
  return Math.max(0, v) / 100;
}

const canvas = document.getElementById("rateChart");
const ctx = canvas.getContext("2d");

function drawRateChart(rates) {
  const total = rates.reduce((s, r) => s + r.value, 0);
  if (total <= 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2; // 30
  const cy = canvas.height / 2; // 30
  const radius = 24;            // ⬅️ was ~70

  let startAngle = -Math.PI / 2;

  for (const { value, color } of rates) {
    const angle = (value / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    startAngle += angle;
  }

  // Optional center hole (ring)
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const tooltip = document.getElementById("chartTooltip");

canvas.addEventListener("mouseenter", () => {
  tooltip.style.opacity = "1";
});

canvas.addEventListener("mouseleave", () => {
  tooltip.style.opacity = "0";
});

function calculate() {
  const minAtk = +minAtkEl.value;
  const maxAtk = +maxAtkEl.value;
  const avgAtk = (minAtk + maxAtk) / 2;

  const P = pct(precisionEl.value);
  const C = pct(critEl.value) + pct(directCritEl.value);
  const A = pct(affinityEl.value) + pct(directAffinityEl.value);
  const R = pct(abrasionConvEl.value);

  const critMul = 1 + pct(critBonusEl.value);
  const affinityMul = 1 + pct(affinityBonusEl.value);

  // --- Rates ---
  const critRate = P * C;
  const affinityRate =
    P * (1 - C) * A +
    (1 - P) * A;

  const normalRate =
    P * (1 - C) * (1 - A) +
    (1 - P) * (1 - A) * R;

  const abrasionRate =
    (1 - P) * (1 - A) * (1 - R);

  // --- Expected damage ---
  const expected =
    normalRate * avgAtk +
    critRate * avgAtk * critMul +
    affinityRate * maxAtk * affinityMul +
    abrasionRate * minAtk;

  dmgHitEl.innerHTML = `${Math.round(expected)}`;
  
    drawRateChart([
        { value: abrasionRate, color: "#a5a5a5" },
        { value: normalRate, color: "#ffffff" },
        { value: critRate, color: "#f5c542" },
        { value: affinityRate, color: "#e48a2a" }
    ]);

}

// Elements
const minAtkEl = document.getElementById("minAtk");
const maxAtkEl = document.getElementById("maxAtk");
const precisionEl = document.getElementById("precision");
const critEl = document.getElementById("crit");
const affinityEl = document.getElementById("affinity");
const abrasionConvEl = document.getElementById("abrasionConv");
const directCritEl = document.getElementById("directCrit");
const directAffinityEl = document.getElementById("directAffinity");
const critBonusEl = document.getElementById("critBonus");
const affinityBonusEl = document.getElementById("affinityBonus");
const dmgHitEl = document.getElementById("dmgHitEl");
const outputEl = document.getElementById("output");

// 🔑 Live updates
[
  minAtkEl,
  maxAtkEl,
  precisionEl,
  critEl,
  affinityEl,
  abrasionConvEl,
  directCritEl,
  directAffinityEl,
  critBonusEl,
  affinityBonusEl
].forEach(el => el.addEventListener("input", calculate));

// Initial render
calculate();

const mobileQuery = window.matchMedia("(max-width: 768px)");

function handleMobileChange(e) {
  if (e.matches) {
    setTimeout(() => {
      document.querySelector("body").style.opacity = "100%";
    }, 50);
    document.querySelector(".content").innerHTML = "<p style='text-align: center'>Mobile function not yet implemented.<br>Use desktop instead.</p>";
  } else {
    setTimeout(() => {
      document.querySelector("body").style.opacity = "100%";
    }, 50);

    setTimeout(() => {
      document.body.style.setProperty("--blur-amount", "0px");
      document.querySelector(".grid").style.opacity = "100%";
      document.querySelector(".grid").style.transform = "translateY(0%)";
    }, 150);
  }
}

// Run once on load
handleMobileChange(mobileQuery);