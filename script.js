const API_URL = "https://script.google.com/macros/s/AKfycbx53ydPhicHlX3o3jMbgm0z1HozvgkeJGA0MFmoIZqxeAzIdntHevNZ0JFqa7DTV5OoXw/exec";

let DATA = null;
let currentRange = 52;
const charts = {};

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  setupInfoButtons();

  document.querySelectorAll("#rangeControls button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#rangeControls button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = Number(btn.dataset.range);
      if (DATA) renderMarketCharts(DATA.marketHistory || []);
    });
  });
});


const INFO = {
  sox: {
    title:"SOX · Semiconductor Index",
    text:"The PHLX Semiconductor Index tracks major semiconductor companies. AI infrastructure depends heavily on chips, so sustained semiconductor weakness can be an early market signal of softer expectations for the AI investment cycle."
  },
  vix: {
    title:"VIX · Equity Volatility",
    text:"The VIX reflects option-implied volatility in the S&P 500. A rising VIX normally signals increasing market stress and also makes index hedges more expensive."
  },
  us10y: {
    title:"US 10Y · Treasury Yield",
    text:"The 10-year US Treasury yield is a key global discount rate. Higher yields raise financing costs and can pressure long-duration technology valuations and capital-intensive AI projects."
  },
  hyoas: {
    title:"HY OAS · High Yield Credit Spread",
    text:"The option-adjusted spread on US high-yield corporate bonds measures the extra yield investors demand over Treasuries. Widening spreads indicate tighter credit conditions and rising financing risk."
  },
  token: {
    title:"Token Index · AI Token Expenditure",
    text:"Silicon Data's LLM Token Expenditure Index tracks the effective expenditure associated with AI token usage. It helps monitor whether monetization and usage economics are strengthening or weakening."
  },
  h100: {
    title:"H100 Rental · GPU Rental Price",
    text:"The Silicon Data H100 Rental Price Index tracks rental pricing for Nvidia H100 compute. Falling prices can signal improving supply, weaker scarcity or softer compute demand; interpretation therefore depends on the broader AI cycle."
  }
  ,moneycircle: {title:"AI Money Circle",text:"Maps the AI economic loop from capital and financing through hyperscalers, semiconductors, compute and end-user monetization. Node status uses the highest risk category among existing mapped Canary indicators; it is not a separate invented score."}
  ,indicators: {title:"Canary Indicators",text:"The eight core 0–100 risk components behind the dashboard. 0–25 is Healthy, 26–50 Watch, 51–75 Warning and 76–100 Danger. Commitment and Financing now use the live calculation models."}
  ,commitment: {title:"Commitment Overhang",text:"Measures the scale, momentum and binding nature of future AI-related obligations across companies, normalized where useful against company revenue. Breadth matters because simultaneous elevated commitments across many firms can increase cycle vulnerability."}
  ,financing: {title:"Financing Conditions",text:"Combines broad financing conditions, AI-specific credit stress and company financing burden. It is designed to distinguish a broad credit tightening from stress that is still concentrated inside the AI investment ecosystem."}
  ,divergence: {title:"Canary Divergence",text:"Compares broad financing conditions with AI-specific credit stress. A large positive gap can be an early-warning signal when AI credit deteriorates before general corporate credit markets do."}
  ,commitmentMomentum: {title:"Commitment Momentum",text:"Shows company-level Composite Risk from commitment scale, recent change and how binding the obligation is. Current and previous values are pulled dynamically from the Commitments data table."}
  ,creditStress: {title:"AI Credit Stress · 5Y CDS",text:"Shows five-year credit-default-swap spreads for selected AI-linked companies. CDS is the annualized spread paid for default protection, quoted in basis points. Higher and rapidly rising spreads indicate greater credit stress, but thin CDS liquidity means the signal should not be treated as a precise default probability."}
};

function setupInfoButtons() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".info-btn");
    if (btn) {
      const info = INFO[btn.dataset.info];
      if (!info) return;
      setText("infoTitle", info.title);
      setText("infoText", info.text);
      document.getElementById("infoPopover").hidden = false;
      return;
    }
    if (e.target.id === "infoClose") document.getElementById("infoPopover").hidden = true;
  });
}

async function loadDashboard() {
  setStatus("Loading live data…", false);

  try {
    const response = await fetch(API_URL, { cache:"no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "API returned ok=false");

    DATA = data;

    renderOverview(data);
    renderTakeaways(data);
    renderIndicators(data);
    renderMoneyCircle(data);
    renderFinancialRisk(data);
    renderMarketCharts(data.marketHistory || []);
    renderEconomics(data);
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
  const history = data.marketHistory || [];

  const score = Number(latest.canaryScore);
  if (Number.isFinite(score)) {
    setText("canaryScore", Math.round(score));
    const gauge = document.getElementById("scoreGauge");
    const marker = gauge?.querySelector(".score-marker");
    if (marker) {
      const bounded = Math.max(0,Math.min(100,score));
      const theta = Math.PI - (bounded/100)*Math.PI;
      const x = 50 + 40.6*Math.cos(theta);
      const y = 78.9 - 70.5*Math.sin(theta);
      marker.style.left = `calc(${x}% - 7px)`;
      marker.style.top = `calc(${y}% - 7px)`;
    }
  }

  setText("canaryStatus", latest.status || "—");
  setText("hedgeRead", `Hedge Read: ${latest.hedgeRead || "—"}`);
  setText("snapshotDate", latest.week ? `Snapshot ${latest.week}` : "Weekly snapshot");

  marketSignal("SOX", market.sox, "soxValue","soxMove","soxRisk",
    Number(latest.soxChange), latest.soxPeriod || "1W", "pct", "inverse");

  marketSignal("VIX", market.vix, "vixValue","vixMove","vixRisk",
    Number(latest.vixChange), latest.vixPeriod || "1D", "pct", "direct");

  marketSignal("US10Y", market.us10y, "us10yValue","us10yMove","us10yRisk",
    Number(latest.us10yChangeBps), latest.us10yPeriod || "1W", "bps", "direct", "%");

  const hyChange = weeklyDelta(history, "hyOas");
  marketSignal("HY OAS", market.hyOas, "hyOasValue","hyOasMove","hyOasRisk",
    hyChange, "1W", "bpsFromPct", "direct", "%");

  const token = tg.TOKEN_SD;
  const h100sd = tg.H100_SD;

  if (token) {
    setText("tokenValue", formatNumber(token.value,2));
    renderMoveAndRisk("tokenMove","tokenRisk", Number(token["7dChange"]), "7D", "pct", "inverse");
  }
  if (h100sd) {
    setText("h100SdValue", `$${formatNumber(h100sd.value,2)}`);
    renderMoveAndRisk("h100SdMove","h100SdRisk", Number(h100sd["7dChange"]), "7D", "pct", "inverse");
  }

  renderOverviewSparklines(data);
}

function marketSignal(name,item,valueId,moveId,riskId,change,period,mode,riskMode,suffix="") {
  if (!item) return;
  setText(valueId, `${formatNumber(item.value,name==="SOX"?0:2)}${suffix}`);
  renderMoveAndRisk(moveId,riskId,change,period,mode,riskMode);
}

function renderMoveAndRisk(moveId,riskId,change,period,mode,riskMode) {
  if (!Number.isFinite(change)) {
    setText(moveId,"—");
    setRiskChip(riskId,"→ Risk","flat");
    return;
  }

  const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
  const moveClass = change > 0 ? "up" : change < 0 ? "down" : "flat";
  let text = "—";

  if (mode === "bps") text = `${arrow} ${Math.abs(change).toFixed(0)} bps · ${period}`;
  else if (mode === "bpsFromPct") text = `${arrow} ${Math.abs(change*100).toFixed(0)} bps · ${period}`;
  else text = `${arrow} ${formatPercent(Math.abs(change))} · ${period}`;

  const el = document.getElementById(moveId);
  if (el) {
    el.textContent = text;
    el.className = `move-line move-${moveClass}`;
  }

  let riskDir = "flat";
  if (change !== 0) {
    if (riskMode === "direct") riskDir = change > 0 ? "up" : "down";
    if (riskMode === "inverse") riskDir = change > 0 ? "down" : "up";
  }
  setRiskChip(riskId, riskDir==="up"?"↑ Risk":riskDir==="down"?"↓ Risk":"→ Risk", riskDir);
}

function setRiskChip(id,text,dir) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `risk-chip risk-${dir}`;
}

function weeklyDelta(history,key) {
  const valid = history.filter(r => Number.isFinite(Number(r[key])));
  if (valid.length < 2) return NaN;
  return Number(valid[valid.length-1][key]) - Number(valid[valid.length-2][key]);
}

function renderOverviewSparklines(data) {
  const history = data.marketHistory || [];
  spark("soxSpark", history.slice(-52).map(r=>r.sox));
  spark("vixSpark", history.slice(-52).map(r=>r.vix));
  spark("us10ySpark", history.slice(-52).map(r=>r.us10y));
  spark("hyOasSpark", history.slice(-52).map(r=>r.hyOas));

  const tokenSeries = seriesRows(data.tokenGpu || [], "TOKEN_SD");
  const h100Series = seriesRows(data.tokenGpu || [], "H100_SD");
  setText("tokenPeriod", `${tokenSeries.length} OBS · AVAILABLE HISTORY`);
  setText("h100Period", `${h100Series.length} OBS · AVAILABLE HISTORY`);
  spark("tokenSpark", tokenSeries.map(r=>r.value));
  spark("h100Spark", h100Series.map(r=>r.value));
}

function renderTakeaways(data) {
  const latest = data.canary?.latest || {};
  const tg = data.latestTokenGpu || {};
  const history = data.marketHistory || [];
  const items = [];

  if (Number.isFinite(Number(latest.soxChange))) {
    items.push({
      good:Number(latest.soxChange) > 0,
      text:`SOX ${Number(latest.soxChange)>0?"strengthened":"weakened"} ${formatPercent(Math.abs(Number(latest.soxChange)))}`
    });
  }

  const token = tg.TOKEN_SD;
  if (token && Number.isFinite(Number(token["7dChange"]))) {
    items.push({
      good:Number(token["7dChange"]) > 0,
      text:`Token economics ${Number(token["7dChange"])>0?"improved":"weakened"} ${formatPercent(Math.abs(Number(token["7dChange"])))} over 7D`
    });
  }

  const hy = weeklyDelta(history,"hyOas");
  if (Number.isFinite(hy)) {
    items.push({
      good:hy < 0,
      text:`HY credit spreads ${hy>0?"widened":"tightened"} ${Math.abs(hy*100).toFixed(0)} bps`
    });
  }

  const dynCommit = dynamicScore(data,"commitmentOverhang",latest.commitmentScore);
  const dynFin = dynamicScore(data,"financingConditions",latest.financingScore);
  items.push({
    good:Number(dynCommit.score) <= 25,
    text:`Commitment Overhang ${fmtScore(dynCommit.score)} · ${dynCommit.status}`
  });

  items.push({
    good:Number(dynFin.score) <= 25,
    text:`Financing Conditions ${fmtScore(dynFin.score)} · ${dynFin.status}`
  });

  document.getElementById("takeaways").innerHTML = items.slice(0,5).map(x => `
    <div class="takeaway">
      <div class="takeaway-dot ${x.good?"dot-good":"dot-warn"}">${x.good?"↑":"!"}</div>
      <div>${escapeHtml(x.text)}</div>
    </div>`).join("");
}


function renderMoneyCircle(data) {
  const x = data.canary?.latest || {};
  const market = data.latestMarket || {};
  const tg = data.latestTokenGpu || {};

  const token = tg.TOKEN_SD || {};
  const h100 = tg.H100_SD || {};
  const dynCommit = dynamicScore(data,"commitmentOverhang",x.commitmentScore);
  const dynFin = dynamicScore(data,"financingConditions",x.financingScore);

  const nodes = [
    {
      id:"moneyNode1",
      scores:[toNum(dynFin.score),toNum(dynCommit.score)],
      badges:[
        `Financing ${fmtScore(dynFin.score)}`,
        `Commitments ${fmtScore(dynCommit.score)}`,
        market.hyOas ? `HY OAS ${formatNumber(market.hyOas.value,2)}%` : null
      ]
    },
    {
      id:"moneyNode2",
      scores:[toNum(x.capexScore),toNum(dynCommit.score)],
      badges:[
        `CAPEX ${fmtScore(x.capexScore)}`,
        `Commitments ${fmtScore(dynCommit.score)}`
      ]
    },
    {
      id:"moneyNode3",
      scores:[toNum(x.semisScore),toNum(x.computeScore)],
      badges:[
        `Semis ${fmtScore(x.semisScore)}`,
        `Compute ${fmtScore(x.computeScore)}`,
        market.sox ? `SOX ${formatNumber(market.sox.value,0)}` : null
      ]
    },
    {
      id:"moneyNode4",
      scores:[toNum(x.computeScore),toNum(x.tokenScore)],
      badges:[
        `Compute ${fmtScore(x.computeScore)}`,
        Number.isFinite(toNum(h100.value)) ? `H100 $${formatNumber(h100.value,2)}` : null,
        `Token score ${fmtScore(x.tokenScore)}`
      ]
    },
    {
      id:"moneyNode5",
      scores:[toNum(x.demandScore),toNum(x.tokenScore)],
      badges:[
        `Demand ${fmtScore(x.demandScore)}`,
        Number.isFinite(toNum(token.value)) ? `Token ${formatNumber(token.value,2)}` : null
      ]
    }
  ];

  nodes.forEach(node => {
    const el = document.getElementById(node.id);
    if (!el) return;

    // Node status is NOT a new score. It uses the highest risk category
    // among the existing Canary indicators mapped to this node.
    const valid = node.scores.filter(Number.isFinite);
    const worstScore = valid.length ? Math.max(...valid) : NaN;
    const status = scoreStatus(worstScore);
    const tone = statusTone(status);

    el.classList.remove("node-healthy","node-watch","node-warning","node-danger");
    el.classList.add(`node-${tone}`);

    const statusEl = el.querySelector(".money-node-status");
    statusEl.textContent = status;
    statusEl.className = `money-node-status ${tone}`;

    const badgeEl = el.querySelector(".money-node-badges");
    badgeEl.innerHTML = node.badges
      .filter(Boolean)
      .map(b => `<span class="money-badge">${escapeHtml(b)}</span>`)
      .join("");
  });
}

function fmtScore(value) {
  const n = toNum(value);
  return Number.isFinite(n) ? Math.round(n) : "—";
}

function toNum(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (value === null || value === undefined || value === "") return NaN;

  let s = String(value).trim().replace(/\s/g,"");
  if (!s) return NaN;

  // Supports both 16.6 and locale text such as 16,6.
  if (s.includes(",") && !s.includes(".")) s = s.replace(",",".");
  else if (s.includes(",") && s.includes(".")) s = s.replace(/,/g,"");

  const n = Number(s.replace(/%$/,""));
  return Number.isFinite(n) ? n : NaN;
}

function renderIndicators(data) {
  const x = data.canary?.latest || {};
  const dynCommit = dynamicScore(data,"commitmentOverhang",x.commitmentScore);
  const dynFin = dynamicScore(data,"financingConditions",x.financingScore);
  const items = [
    ["Token Economics",x.tokenScore],
    ["AI Demand",x.demandScore],
    ["Compute Supply",x.computeScore],
    ["Semiconductor Market",x.semisScore],
    ["CAPEX Investment",x.capexScore],
    ["Commitment Overhang",dynCommit.score],
    ["Financing Conditions",dynFin.score],
    ["Macro & Risk",x.macroScore]
  ];

  let html = `<div class="indicator-row header"><div>Indicator</div><div>Score</div><div>Trend</div><div>Status</div></div>`;
  html += items.map(([name,score]) => {
    const n = Number(score);
    const status = scoreStatus(n);
    const tone = statusTone(status);
    return `<div class="indicator-row">
      <div class="indicator-name">${escapeHtml(name)}</div>
      <div class="indicator-score ${tone}">${Number.isFinite(n)?Math.round(n):"—"}</div>
      <div class="trend">—</div>
      <div class="${tone}">${status}</div>
    </div>`;
  }).join("");

  document.getElementById("indicatorTable").innerHTML = html;
}


function dynamicScore(data,key,fallback) {
  const item = data?.dynamicScores?.[key] || {};
  const n = toNum(item.score);
  const fb = toNum(fallback);
  const score = Number.isFinite(n) ? n : fb;
  return { score, status: item.status || scoreStatus(score) };
}

function summaryValue(summary,key) {
  const item = summary?.byMetric?.[key];
  return item ? toNum(item.value) : NaN;
}

function setRiskCard(cardId,score,status,barId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const n = toNum(score);
  const tone = statusTone(status || scoreStatus(n));
  const colors = {good:"#4ad18a",watch:"#f7d94c",warning:"#f59f40",danger:"#f6535b"};
  card.style.setProperty("--risk-accent",colors[tone] || colors.watch);
  const bar = document.getElementById(barId);
  if (bar && Number.isFinite(n)) bar.style.width = `${Math.max(0,Math.min(100,n))}%`;
}

function renderFinancialRisk(data) {
  const commit = dynamicScore(data,"commitmentOverhang",data.canary?.latest?.commitmentScore);
  const fin = dynamicScore(data,"financingConditions",data.canary?.latest?.financingScore);
  const cSummary = data.commitmentMomentum?.summary || {};
  const fSummary = data.financingMomentum?.summary || {};

  setText("commitmentScore",fmtScore(commit.score));
  setText("commitmentStatus",commit.status);
  setText("financingScore",fmtScore(fin.score));
  setText("financingStatus",fin.status);
  setRiskCard("commitmentRiskCard",commit.score,commit.status,"commitmentBar");
  setRiskCard("financingRiskCard",fin.score,fin.status,"financingBar");

  const cAvg = summaryValue(cSummary,"averageCompanyRisk");
  const cBreadth = summaryValue(cSummary,"breadth");
  const cElev = summaryValue(cSummary,"companiesAbove50");
  const cTotal = summaryValue(cSummary,"totalCompanies");
  setText("commitmentAvg",Number.isFinite(cAvg)?formatNumber(cAvg,1):"—");
  setText("commitmentBreadth",Number.isFinite(cBreadth)?formatPercent(cBreadth):"—");
  setText("commitmentElevated",Number.isFinite(cElev)&&Number.isFinite(cTotal)?`${cElev}/${cTotal}`:"—");

  const general = summaryValue(fSummary,"generalFinancingScore");
  const aiCredit = summaryValue(fSummary,"aiCreditStressScore");
  const burden = summaryValue(fSummary,"companyFinancingBurden");
  setText("generalFinancingScore",fmtScore(general));
  setText("aiCreditScore",fmtScore(aiCredit));
  setText("companyBurdenScore",fmtScore(burden));
  setText("generalFinancingMini",fmtScore(general));
  setText("aiCreditMini",fmtScore(aiCredit));
  const gb = document.getElementById("generalFinancingBar");
  const ab = document.getElementById("aiCreditBar");
  if (gb && Number.isFinite(general)) gb.style.width=`${Math.max(0,Math.min(100,general))}%`;
  if (ab && Number.isFinite(aiCredit)) ab.style.width=`${Math.max(0,Math.min(100,aiCredit))}%`;
  if (Number.isFinite(general) && Number.isFinite(aiCredit)) {
    const gap = aiCredit-general;
    setText("divergenceText",`AI-specific credit stress is ${formatNumber(Math.abs(gap),1)} points ${gap>=0?"above":"below"} broad financing conditions. This divergence is a Canary early-warning feature, not a broad-market crisis signal.`);
  }

  renderCommitmentCompanies(data.commitmentMomentum?.rows || []);
  renderCreditStress(data.financingMomentum?.rows || []);
}

function renderCommitmentCompanies(rows) {
  const valid = rows.filter(r=>r.company && Number.isFinite(toNum(r.compositeRisk)));
  const html = valid.map(r=>{
    const score=toNum(r.compositeRisk), status=r.status || scoreStatus(score), tone=statusTone(status);
    const colors={good:"#4ad18a",watch:"#f7d94c",warning:"#f59f40",danger:"#f6535b"};
    const change=toNum(r.change);
    return `<div class="company-risk-item" style="--tone:${colors[tone]}">
      <div class="company-risk-name">${escapeHtml(r.company)}</div>
      <div class="company-risk-score ${tone}">${formatNumber(score,1)}</div>
      <div class="company-risk-sub">${escapeHtml(status)} · ${Number.isFinite(change)?formatSignedPercent(change):"—"}</div>
    </div>`;
  }).join("");
  const el=document.getElementById("commitmentCompanyGrid"); if(el) el.innerHTML=html || '<div class="muted">No commitment momentum data.</div>';
}

function renderCreditStress(rows) {
  const valid = rows.filter(r=>r.signalGroup==="AI_CREDIT_STRESS" && Number.isFinite(toNum(r.compositeRisk)));
  const html = valid.map(r=>{
    const score=toNum(r.compositeRisk), status=r.status || scoreStatus(score), tone=statusTone(status);
    const cur=toNum(r.currentValue), ch=toNum(r.change);
    return `<div class="credit-item">
      <div><div class="credit-name">${escapeHtml(r.entityMarket || "AI credit")} · 5Y CDS <button class="info-btn" data-info="creditStress" aria-label="About 5Y CDS">i</button></div><div class="credit-meta">CDS spread ${Number.isFinite(cur)?formatNumber(cur,0):"—"} ${escapeHtml(r.unit||"")} · ${Number.isFinite(ch)?formatSignedPercent(ch):"—"}</div></div>
      <div><div class="credit-score ${tone}">${formatNumber(score,0)}</div><div class="credit-status ${tone}">${escapeHtml(status)}</div></div>
    </div>`;
  }).join("");
  const el=document.getElementById("creditStressGrid"); if(el) el.innerHTML=html || '<div class="muted">No AI credit stress data.</div>';
}

function renderMarketCharts(history) {
  if (!history.length || typeof Chart === "undefined") return;

  const rows = currentRange >= 9999 ? history : history.slice(-currentRange);
  const labels = rows.map(r => r.weekEnding);

  lineChart("sox","soxChart",labels,[dataset("SOX",rows.map(r=>r.sox))]);
  lineChart("vix","vixChart",labels,[dataset("VIX",rows.map(r=>r.vix))]);
  lineChart("rates","ratesChart",labels,[dataset("US 10Y",rows.map(r=>r.us10y)),dataset("Real 10Y",rows.map(r=>r.real10y))]);
  lineChart("credit","creditChart",labels,[dataset("IG OAS",rows.map(r=>r.igOas)),dataset("HY OAS",rows.map(r=>r.hyOas))]);

  const last = history[history.length-1] || {};
  setText("soxLatestMini", formatNumber(last.sox,0));
  setText("vixLatestMini", formatNumber(last.vix,2));
  setText("ratesLatestMini", `${formatNumber(last.us10y,2)}% / ${formatNumber(last.real10y,2)}%`);
  setText("creditLatestMini", `${formatNumber(last.igOas,2)}% / ${formatNumber(last.hyOas,2)}%`);
}

function renderEconomics(data) {
  const tg = data.latestTokenGpu || {};
  const token = tg.TOKEN_SD;
  const h100 = tg.H100_SD;
  const ccir = tg.H100_CCIR;

  if (token) {
    setText("tokenHeroValue", formatNumber(token.value,2));
    setText("tokenHeroChange", `7D ${formatSignedPercent(token["7dChange"])}`);
  }
  if (h100) {
    setText("h100HeroValue", `$${formatNumber(h100.value,2)}`);
    setText("h100HeroChange", `7D ${formatSignedPercent(h100["7dChange"])}`);
  }
  if (ccir) {
    setText("ccirHeroValue", `$${formatNumber(ccir.value,2)}`);
    setText("ccirHeroDate", ccir.date || "—");
  }

  const tokenRows = seriesRows(data.tokenGpu || [], "TOKEN_SD");
  const h100Rows = seriesRows(data.tokenGpu || [], "H100_SD");

  lineChart("token","tokenChart",tokenRows.map(r=>r.date),[shortAwareDataset("Token Index",tokenRows.map(r=>r.value))]);
  lineChart("h100","h100Chart",h100Rows.map(r=>r.date),[shortAwareDataset("H100 Rental",h100Rows.map(r=>r.value))]);

  if (h100Rows.length <= 3) {
    setText("h100HeroChange", `${h100Rows.length} observations · 7D ${formatSignedPercent(h100?.["7dChange"])}`);
  }
}

function seriesRows(rows,seriesId) {
  return rows
    .filter(r => r.comparableSeriesId === seriesId && Number.isFinite(Number(r.value)))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

function renderTokenGpuTable(rows) {
  const sorted = [...rows].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,14);
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
    const currentRows = companyRows.filter(r=>r.period===latestPeriod);

    let missingCount = 0;

    const metrics = currentRows.map(r => {
      const display = formatDemandValue(r);
      if (display.includes("—")) missingCount++;

      return `
        <div class="company-metric">
          <div class="company-metric-label">${escapeHtml(r.metric || "—")}</div>
          <div class="company-metric-value">${display}</div>
          <div class="company-metric-change">${formatDemandChange(r)}</div>
        </div>`;
    }).join("");

    html.push(`<article class="panel company-card ${missingCount ? "has-data-warning" : ""}">
      <div class="company-name">${escapeHtml(company)}</div>
      <div class="company-period">${escapeHtml(latestPeriod)}</div>
      <div class="company-metrics">${metrics}</div>
      ${missingCount ? `<div class="company-data-note">${missingCount} value${missingCount>1?"s":""} need checking in AI_Demand.</div>` : ""}
    </article>`);
  });

  document.getElementById("companyCards").innerHTML = html.join("");
}
function dataset(label,data) {
  return {label,data,borderWidth:2,pointRadius:0,tension:.18,spanGaps:true};
}

function shortAwareDataset(label,data) {
  const short = data.length <= 3;
  return {label,data,borderWidth:2,pointRadius:short?4:0,pointHoverRadius:short?5:3,tension:short?0:.18,spanGaps:true};
}

function lineChart(key,id,labels,datasets) {
  if (charts[key]) charts[key].destroy();

  charts[key] = new Chart(document.getElementById(id), {
    type:"line",
    data:{labels,datasets},
    options:{
      responsive:true,
      maintainAspectRatio:false,
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

function spark(id,data) {
  if (typeof Chart === "undefined") return;
  const values = data.filter(v => Number.isFinite(Number(v))).map(Number);
  if (!values.length) return;
  const key = `spark-${id}`;
  if (charts[key]) charts[key].destroy();
  charts[key] = new Chart(document.getElementById(id), {
    type:"line",
    data:{labels:values.map((_,i)=>i),datasets:[{data:values,borderWidth:2,pointRadius:values.length<=3?4:0,pointHoverRadius:values.length<=3?5:3,tension:values.length<=3?0:.2,fill:false}]}, 
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{x:{display:false},y:{display:false}},
      elements:{line:{borderColor:"#45d7ff"}}
    }
  });
}

function formatDemandValue(r) {
  let n = toNum(r.value);

  // If API sends a percent as 43 rather than 0.43, normalize for display.
  if (r.unit === "%" && Number.isFinite(n) && Math.abs(n) > 1) n = n / 100;

  if (r.unit === "%") return formatPercent(n);
  if (r.unit === "$bn") return Number.isFinite(n) ? `$${formatNumber(n, n<10?2:1)}bn` : "$—bn";
  return Number.isFinite(n) ? `${formatNumber(n,2)} ${r.unit || ""}`.trim() : `— ${r.unit || ""}`.trim();
}

function formatDemandChange(r) {
  if (r.yoyChange === null || r.yoyChange === undefined || r.yoyChange === "") return "";
  let n = toNum(r.yoyChange);
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) > 1) n = n / 100;
  return `YoY ${formatPercent(n)}`;
}

function formatTokenGpuValue(r) {
  if (r.unit === "$/GPU-hour") return `$${formatNumber(r.value,2)}`;
  return formatNumber(r.value,2);
}

function scoreStatus(score) {
  if (!Number.isFinite(score)) return "N/A";
  if (score <= 25) return "HEALTHY";
  if (score <= 50) return "WATCH";
  if (score <= 75) return "WARNING";
  return "DANGER";
}

function statusTone(status) {
  if (status === "HEALTHY") return "good";
  if (status === "WARNING") return "warning";
  if (status === "DANGER") return "danger";
  return "watch";
}

function setStatus(text,ok) {
  const el = document.getElementById("dataStatus");
  el.textContent = text;
  el.style.color = ok ? "#4AD18A" : "#F7D94C";
}

function setText(id,text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? "—";
}

function formatNumber(value,decimals=2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("nb-NO",{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n);
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("nb-NO",{style:"percent",minimumFractionDigits:1,maximumFractionDigits:1}).format(n);
}

function formatSignedPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n>0?"+":""}${formatPercent(n)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
