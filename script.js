const API_URL = "https://script.google.com/macros/s/AKfycbx53ydPhicHlX3o3jMbgm0z1HozvgkeJGA0MFmoIZqxeAzIdntHevNZ0JFqa7DTV5OoXw/exec";

let DATA = null;
let currentRange = 52;
const charts = {sox:null,vix:null,rates:null,credit:null};

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  document.querySelectorAll("#rangeControls button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#rangeControls button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = Number(btn.dataset.range);
      if (DATA) renderCharts(DATA.marketHistory || []);
    });
  });
});

async function loadDashboard() {
  setStatus("Loading live data…", false);
  try {
    const r = await fetch(API_URL, {cache:"no-store"});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "API returned ok=false");
    DATA = data;

    renderOverview(data);
    renderIndicators(data);
    renderCharts(data.marketHistory || []);
    renderTokenGpuTable(data.tokenGpu || []);
    renderCompanies(data.aiDemand || []);

    setStatus("Live data", true);
    const generated = new Date(data.generatedAt);
    setText("lastUpdated", `API generated: ${generated.toLocaleString("nb-NO")}`);
  } catch (err) {
    console.error(err);
    setStatus(`Data error: ${err.message}`, false);
  }
}

function renderOverview(data) {
  const latest = data.canary?.latest || {};
  const market = data.latestMarket || {};
  const tg = data.latestTokenGpu || {};

  const score = Number(latest.canaryScore);
  if (Number.isFinite(score)) {
    setText("canaryScore", Math.round(score));
    document.getElementById("scoreGauge").style.setProperty("--score-deg", `${Math.max(0,Math.min(100,score))*3.6}deg`);
  }

  const status = latest.status || "—";
  setText("canaryStatus", status);
  setText("hedgeRead", `Hedge Read: ${latest.hedgeRead || "—"}`);

  marketMetric(market.sox,"soxValue","soxDate",0,"");
  marketMetric(market.vix,"vixValue","vixDate",2,"");
  marketMetric(market.us10y,"us10yValue","us10yDate",2,"%");
  marketMetric(market.real10y,"real10yValue","real10yDate",2,"%");
  marketMetric(market.igOas,"igOasValue","igOasDate",2,"%");
  marketMetric(market.hyOas,"hyOasValue","hyOasDate",2,"%");

  const token = tg.TOKEN_SD;
  const h100sd = tg.H100_SD;
  const h100ccir = tg.H100_CCIR;

  if (token) {
    setText("tokenValue", formatNumber(token.value,2));
    setText("tokenChange", `${formatPercent(token["7dChange"])} · ${token.date || "—"}`);
  }
  if (h100sd) {
    setText("h100SdValue", `$${formatNumber(h100sd.value,2)}`);
    setText("h100SdChange", `${formatPercent(h100sd["7dChange"])} · ${h100sd.date || "—"}`);
  }
  if (h100ccir) {
    setText("h100CcirValue", `$${formatNumber(h100ccir.value,2)}`);
    setText("h100CcirDate", h100ccir.date || "—");
  }
}

function renderIndicators(data) {
  const x = data.canary?.latest || {};
  const items = [
    ["Token Economics",x.tokenScore],["AI Demand",x.demandScore],["Compute Supply",x.computeScore],
    ["Semiconductor Market",x.semisScore],["CAPEX Investment",x.capexScore],["Commitment Overhang",x.commitmentScore],
    ["Financing Conditions",x.financingScore],["Macro & Risk",x.macroScore]
  ];
  const el = document.getElementById("indicatorStrip");
  el.innerHTML = items.map(([name,score]) => {
    const n = Number(score), status = scoreStatus(n), tone = statusTone(status);
    return `<div class="indicator"><div class="indicator-name">${escapeHtml(name)}</div><div class="indicator-score ${tone}">${Number.isFinite(n)?Math.round(n):"—"}</div><div class="indicator-status ${tone}">${status}</div></div>`;
  }).join("");
}

function renderCharts(history) {
  if (!history.length || typeof Chart === "undefined") return;
  const rows = currentRange >= 9999 ? history : history.slice(-currentRange);
  const labels = rows.map(r => r.weekEnding);

  makeChart("sox","soxChart",labels,[dataset("SOX",rows.map(r=>r.sox))]);
  makeChart("vix","vixChart",labels,[dataset("VIX",rows.map(r=>r.vix))]);
  makeChart("rates","ratesChart",labels,[dataset("US 10Y",rows.map(r=>r.us10y)),dataset("Real 10Y",rows.map(r=>r.real10y))]);
  makeChart("credit","creditChart",labels,[dataset("IG OAS",rows.map(r=>r.igOas)),dataset("HY OAS",rows.map(r=>r.hyOas))]);

  const last = history[history.length-1] || {};
  setText("soxLatestMini", formatNumber(last.sox,0));
  setText("vixLatestMini", formatNumber(last.vix,2));
  setText("ratesLatestMini", `${formatNumber(last.us10y,2)}% / ${formatNumber(last.real10y,2)}%`);
  setText("creditLatestMini", `${formatNumber(last.igOas,2)}% / ${formatNumber(last.hyOas,2)}%`);
}

function dataset(label,data) {
  return {label,data,borderWidth:2,pointRadius:0,tension:.18,spanGaps:true};
}

function makeChart(key,id,labels,datasets) {
  if (charts[key]) charts[key].destroy();
  charts[key] = new Chart(document.getElementById(id), {
    type:"line",
    data:{labels,datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{mode:"index",intersect:false},
      plugins:{
        legend:{labels:{color:"#9CB3C8",usePointStyle:true,boxWidth:7,boxHeight:7}},
        tooltip:{backgroundColor:"#071826",borderColor:"rgba(137,181,214,.22)",borderWidth:1,titleColor:"#F5F8FC",bodyColor:"#DDE9F2"}
      },
      scales:{
        x:{grid:{display:false},ticks:{color:"#7895AA",maxTicksLimit:7}},
        y:{grid:{color:"rgba(137,181,214,.08)"},ticks:{color:"#7895AA"}}
      }
    }
  });
}

function renderTokenGpuTable(rows) {
  const sorted = [...rows].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12);
  document.getElementById("tokenGpuTable").innerHTML = sorted.map(r => `
    <tr>
      <td>${escapeHtml(r.date || "—")}</td>
      <td>${escapeHtml(r.metric || "—")}</td>
      <td>${formatTokenGpuValue(r)}</td>
      <td>${formatPercent(r["7dChange"])}</td>
      <td>${escapeHtml(r.provider || "—")}</td>
      <td>${escapeHtml(r.verificationStatus || "—")}</td>
    </tr>`).join("");
}

function renderCompanies(rows) {
  const groups = new Map();
  rows.forEach(r => {
    const c = r.company || "Unknown";
    if (!groups.has(c)) groups.set(c,[]);
    groups.get(c).push(r);
  });

  const html = [];
  groups.forEach((companyRows,company) => {
    const periods = companyRows.map(r=>r.period).filter(Boolean).sort();
    const latestPeriod = periods[periods.length-1] || "—";
    const metrics = companyRows.filter(r=>r.period===latestPeriod).map(r => `
      <div class="company-metric">
        <div class="company-metric-label">${escapeHtml(r.metric || "—")}</div>
        <div class="company-metric-value">${formatDemandValue(r)}</div>
        <div class="company-metric-change">${formatDemandChange(r)}</div>
      </div>`).join("");

    html.push(`<article class="card company-card"><div class="company-name">${escapeHtml(company)}</div><div class="company-period">${escapeHtml(latestPeriod)}</div><div class="company-metrics">${metrics}</div></article>`);
  });
  document.getElementById("companyCards").innerHTML = html.join("");
}

function formatDemandValue(r) {
  if (r.unit === "%") return formatPercent(r.value);
  if (r.unit === "$bn") return `$${formatNumber(r.value, Number(r.value)<10?2:1)}bn`;
  return `${formatNumber(r.value,2)} ${r.unit || ""}`.trim();
}

function formatDemandChange(r) {
  if (r.yoyChange === null || r.yoyChange === undefined || r.yoyChange === "") return "";
  return `YoY ${formatPercent(r.yoyChange)}`;
}

function formatTokenGpuValue(r) {
  if (r.unit === "$/GPU-hour") return `$${formatNumber(r.value,2)}`;
  return formatNumber(r.value,2);
}

function marketMetric(item,valueId,dateId,decimals,suffix) {
  if (!item) return;
  setText(valueId, `${formatNumber(item.value,decimals)}${suffix}`);
  setText(dateId, item.date || "—");
}

function scoreStatus(score) {
  if (!Number.isFinite(score)) return "N/A";
  if (score<=25) return "HEALTHY";
  if (score<=50) return "WATCH";
  if (score<=75) return "WARNING";
  return "DANGER";
}

function statusTone(status) {
  if (status==="HEALTHY") return "good";
  if (status==="WARNING") return "warning";
  if (status==="DANGER") return "danger";
  return "watch";
}

function setStatus(text,ok) {
  const el=document.getElementById("dataStatus");
  el.textContent=text;
  el.style.color=ok?"#4BD18B":"#F8D84B";
}

function setText(id,text) {
  const el=document.getElementById(id);
  if (el) el.textContent=text ?? "—";
}

function formatNumber(value,decimals=2) {
  const n=Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("nb-NO",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n);
}

function formatPercent(value) {
  if (value===null || value===undefined || value==="") return "—";
  const n=Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("nb-NO",{style:"percent",minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
