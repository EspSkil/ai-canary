const API_URL = "https://script.google.com/macros/s/AKfycbx53ydPhicHlX3o3jMbgm0z1HozvgkeJGA0MFmoIZqxeAzIdntHevNZ0JFqa7DTV5OoXw/exec";

let DATA = null;
let currentRange = 52;
const charts = {};

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  setupInfoButtons();
  setupIndicatorDetails();

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
  ,tokenEconomics: {title:"Token Economics",text:"Tracks AI usage economics and effective token expenditure. It helps test whether end-user activity and monetization are keeping pace with infrastructure investment."}
  ,aiDemandIndicator: {title:"AI Demand",text:"Tracks company-level AI and cloud demand signals such as revenue growth, backlog/RPO and related operating metrics. Strong, broad demand offsets supply-side cycle risk."}
  ,computeSupply: {title:"Compute Supply",text:"Tracks whether AI compute supply is tightening or becoming abundant. H100 rental pricing is live today; direct GPU utilization is a planned input and is not yet included in the current score."}
  ,semiconductorMarket: {title:"Semiconductor Market",text:"Tracks market confirmation from semiconductors and chip-linked indicators. Weakness can signal falling expectations for the AI infrastructure cycle before reported fundamentals turn."}
  ,capexInvestment: {title:"CAPEX Investment",text:"Tracks the scale and momentum of AI-related capital spending by major hyperscalers and infrastructure providers. High CAPEX is not automatically risky; the Canary cares when investment outruns monetization and financing capacity."}
  ,commitmentOverhangIndicator: {title:"Commitment Overhang",text:"Measures the scale, momentum and binding nature of future AI-related obligations. The current score is generated dynamically from the Google Sheet commitment model."}
  ,financingConditionsIndicator: {title:"Financing Conditions",text:"Combines broad credit conditions, AI-specific credit stress and company financing burden. The current score is generated dynamically from the Google Sheet financing model."}
  ,macroRisk: {title:"Macro & Risk",text:"Tracks the external environment around the AI cycle: rates, volatility, credit spreads and other macro/liquidity signals that can amplify or cushion company-specific stress."}
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
    {name:"Token Economics",score:x.tokenScore,icon:"🪙",detail:"token",info:"tokenEconomics",subtitle:"Usage & monetization economics"},
    {name:"AI Demand",score:x.demandScore,icon:"☁️",detail:"demand",info:"aiDemandIndicator",subtitle:"Revenue, cloud growth & backlog"},
    {name:"Compute Supply",score:x.computeScore,icon:"🖥️",detail:"compute",info:"computeSupply",subtitle:"GPU pricing, supply & utilization"},
    {name:"Semiconductor Market",score:x.semisScore,icon:"💾",detail:"semis",info:"semiconductorMarket",subtitle:"Chip-cycle market confirmation"},
    {name:"CAPEX Investment",score:x.capexScore,icon:"🏗️",detail:"capex",info:"capexInvestment",subtitle:"AI infrastructure spending"},
    {name:"Commitment Overhang",score:dynCommit.score,icon:"📜",detail:"commitment",info:"commitmentOverhangIndicator",subtitle:"Future obligations & momentum"},
    {name:"Financing Conditions",score:dynFin.score,icon:"🏦",detail:"financing",info:"financingConditionsIndicator",subtitle:"Credit, rates & financing burden"},
    {name:"Macro & Risk",score:x.macroScore,icon:"🌐",detail:"macro",info:"macroRisk",subtitle:"Rates, volatility & broad risk"}
  ];

  let html = `<div class="indicator-row header"><div>Indicator</div><div>Score</div><div>Trend</div><div>Status</div></div>`;
  html += items.map(item => {
    const n = Number(item.score);
    const status = scoreStatus(n);
    const tone = statusTone(status);
    return `<div class="indicator-row indicator-row-clickable" role="button" tabindex="0" data-detail="${item.detail}" aria-label="Open ${escapeHtml(item.name)} deep dive">
      <div class="indicator-name-wrap"><span class="indicator-icon icon-${tone}">${item.icon}</span><div><div class="indicator-name">${escapeHtml(item.name)} <button class="info-btn indicator-info" data-info="${item.info}" aria-label="About ${escapeHtml(item.name)}">i</button><span class="indicator-chevron">›</span></div><span class="indicator-subtitle">${escapeHtml(item.subtitle)}</span></div></div>
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
    return `<div class="company-risk-item detail-inline-trigger" role="button" tabindex="0" data-detail="commitment" style="--tone:${colors[tone]}">
      <div class="company-risk-name">${escapeHtml(r.company)}</div>
      <div class="company-risk-score ${tone}">${formatNumber(score,1)}</div>
      <div class="company-risk-sub">${escapeHtml(status)} · ${Number.isFinite(change)?`${change>0?"↑":change<0?"↓":"→"} ${formatSignedPercent(change)}`:"—"}</div>
    </div>`;
  }).join("");
  const el=document.getElementById("commitmentCompanyGrid"); if(el) el.innerHTML=html || '<div class="muted">No commitment momentum data.</div>';
}

function renderCreditStress(rows) {
  const valid = rows.filter(r=>r.signalGroup==="AI_CREDIT_STRESS" && Number.isFinite(toNum(r.compositeRisk)));
  const html = valid.map(r=>{
    const score=toNum(r.compositeRisk), status=r.status || scoreStatus(score), tone=statusTone(status);
    const cur=toNum(r.currentValue), ch=toNum(r.change);
    return `<div class="credit-item detail-inline-trigger" role="button" tabindex="0" data-detail="financing">
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


// ===== v3.6 Universal Canary Deep Dive =====
const DETAIL_META = {
  token:{icon:"◈",kicker:"CANARY DEEP DIVE · MONETIZATION",title:"Token Economics",subtitle:"Is AI usage and monetization keeping pace with the investment cycle?"},
  demand:{icon:"↗",kicker:"CANARY DEEP DIVE · DEMAND",title:"AI Demand",subtitle:"Are customers and cloud workloads absorbing the expanding AI capacity?"},
  compute:{icon:"▦",kicker:"CANARY DEEP DIVE · COMPUTE",title:"Compute Supply",subtitle:"Is AI compute capacity scarce, balanced or moving toward oversupply?"},
  semis:{icon:"◇",kicker:"CANARY DEEP DIVE · SEMICONDUCTORS",title:"Semiconductor Market",subtitle:"Does the chip market confirm or challenge the AI investment narrative?"},
  capex:{icon:"$",kicker:"CANARY DEEP DIVE · INVESTMENT",title:"CAPEX Investment",subtitle:"How quickly is infrastructure spending expanding, and who is carrying it?"},
  commitment:{icon:"∞",kicker:"CANARY DEEP DIVE · COMMITMENTS",title:"Commitment Overhang",subtitle:"How large, fast-growing and binding are future AI-related obligations?"},
  financing:{icon:"≈",kicker:"CANARY DEEP DIVE · FINANCING",title:"Financing Conditions",subtitle:"Is funding pressure emerging inside AI before the broad market?"},
  macro:{icon:"△",kicker:"CANARY DEEP DIVE · MACRO",title:"Macro & Risk",subtitle:"Is the external market environment amplifying or cushioning AI-cycle risk?"},
  divergence:{icon:"⇄",kicker:"CANARY DEEP DIVE · CREDIT DIVERGENCE",title:"Canary Divergence",subtitle:"AI-specific credit stress versus broad financing conditions."},
  "money-financing":{icon:"◎",kicker:"AI MONEY CIRCLE · 1",title:"Capital & Financing",subtitle:"Funding, commitments and credit conditions feeding the AI cycle."},
  "money-hyperscalers":{icon:"☁",kicker:"AI MONEY CIRCLE · 2",title:"Hyperscalers & Neocloud",subtitle:"CAPEX, commitments and demand across the largest AI infrastructure buyers."},
  "money-semis":{icon:"◇",kicker:"AI MONEY CIRCLE · 3",title:"Semis & Hardware",subtitle:"Chips, hardware demand and market confirmation."},
  "money-compute":{icon:"▦",kicker:"AI MONEY CIRCLE · 4",title:"Compute & AI Models",subtitle:"GPU economics, supply, token activity and model-layer demand."},
  "money-monetization":{icon:"↗",kicker:"AI MONEY CIRCLE · 5",title:"End Users & Monetization",subtitle:"The part of the loop that must ultimately justify the infrastructure buildout."}
};

function setupIndicatorDetails() {
  document.addEventListener("click", e => {
    if (e.target.closest(".info-btn")) return;
    const trigger = e.target.closest("[data-detail]");
    if (trigger) {
      openDetail(trigger.dataset.detail);
      return;
    }
    if (e.target.id === "detailClose" || e.target.id === "detailBackdrop") closeDetail();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDetail();
    if (e.target.closest?.(".info-btn")) return;
    const trigger = e.target.closest?.("[data-detail]");
    if (trigger && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openDetail(trigger.dataset.detail);
    }
  });
}

function openDetail(key) {
  const drawer = document.getElementById("detailDrawer");
  const backdrop = document.getElementById("detailBackdrop");
  if (!drawer || !backdrop || !DETAIL_META[key]) return;
  populateDetail(key);
  backdrop.hidden = false;
  document.body.classList.add("detail-open");
  requestAnimationFrame(() => {
    backdrop.classList.add("is-visible");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden","false");
  });
}

function closeDetail() {
  const drawer = document.getElementById("detailDrawer");
  const backdrop = document.getElementById("detailBackdrop");
  if (!drawer || !backdrop || !drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-visible");
  drawer.setAttribute("aria-hidden","true");
  document.body.classList.remove("detail-open");
  window.setTimeout(() => { backdrop.hidden = true; }, 220);
}

function populateDetail(key) {
  if (!DATA) return;
  const meta = DETAIL_META[key];
  setText("detailIcon",meta.icon);
  setText("detailKicker",meta.kicker);
  setText("detailTitle",meta.title);
  setText("detailSubtitle",meta.subtitle);

  const scoreInfo = detailScoreInfo(key);
  const scoreEl = document.getElementById("detailScore");
  const denomEl = document.getElementById("detailScoreDenom");
  const statusEl = document.getElementById("detailStatus");
  const hero = document.getElementById("detailHero");
  if (Number.isFinite(scoreInfo.score)) {
    setText("detailScoreLabel",scoreInfo.label || "CANARY SCORE");
    setText("detailScore",Math.round(scoreInfo.score));
    setText("detailScoreDenom","/100");
    setText("detailStatus",scoreInfo.status);
    setText("detailMeta",scoreInfo.meta || "Live Canary component");
    if (denomEl) denomEl.hidden=false;
    if (statusEl) statusEl.className=`drawer-status ${statusTone(scoreInfo.status)}`;
    if (hero) hero.classList.remove("theme-hero");
  } else {
    setText("detailScoreLabel","THEME VIEW");
    setText("detailScore","LIVE");
    setText("detailScoreDenom","");
    setText("detailStatus","MULTI-SIGNAL");
    setText("detailMeta","Uses existing Canary components; no new node score");
    if (denomEl) denomEl.hidden=true;
    if (statusEl) statusEl.className="drawer-status watch";
    if (hero) hero.classList.add("theme-hero");
  }

  const body=document.getElementById("detailBody");
  if (body) body.innerHTML=buildDetailBody(key);
}

function detailScoreInfo(key) {
  const x=DATA?.canary?.latest || {};
  const commit=dynamicScore(DATA,"commitmentOverhang",x.commitmentScore);
  const fin=dynamicScore(DATA,"financingConditions",x.financingScore);
  const map={
    token:{score:toNum(x.tokenScore),label:"TOKEN ECONOMICS SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    demand:{score:toNum(x.demandScore),label:"AI DEMAND SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    compute:{score:toNum(x.computeScore),label:"COMPUTE SUPPLY SCORE",meta:"Locked v3 baseline · GPU utilization not yet included"},
    semis:{score:toNum(x.semisScore),label:"SEMICONDUCTOR MARKET SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    capex:{score:toNum(x.capexScore),label:"CAPEX INVESTMENT SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    commitment:{score:toNum(commit.score),status:commit.status,label:"COMMITMENT OVERHANG SCORE",meta:"Dynamic Google Sheet model"},
    financing:{score:toNum(fin.score),status:fin.status,label:"FINANCING CONDITIONS SCORE",meta:"Dynamic Google Sheet model"},
    macro:{score:toNum(x.macroScore),label:"MACRO & RISK SCORE",meta:"Locked v3 baseline · dynamic macro model pending"}
  };
  const item=map[key];
  if (!item) return {score:NaN};
  return {...item,status:item.status || scoreStatus(item.score)};
}

function buildDetailBody(key) {
  switch(key) {
    case "commitment": return commitmentDetailHtml();
    case "financing": return financingDetailHtml();
    case "divergence": return divergenceDetailHtml();
    case "compute": return computeDetailHtml();
    case "token": return tokenDetailHtml();
    case "demand": return demandDetailHtml();
    case "semis": return semisDetailHtml();
    case "capex": return capexDetailHtml();
    case "macro": return macroDetailHtml();
    case "money-financing": return moneyFinancingHtml();
    case "money-hyperscalers": return moneyHyperscalersHtml();
    case "money-semis": return moneySemisHtml();
    case "money-compute": return moneyComputeHtml();
    case "money-monetization": return moneyMonetizationHtml();
    default: return sectionHtml("DETAIL","More detail will be added as this Canary component is connected to the common evidence model.");
  }
}

function sectionHtml(label,text,inner="") {
  return `<section class="drawer-section"><div class="drawer-section-label">${escapeHtml(label)}</div>${text?`<p>${escapeHtml(text)}</p>`:""}${inner}</section>`;
}
function metricCards(cards) {
  return `<div class="connected-grid detail-metric-grid">${cards.map(c=>{
    const risk=toNum(c.riskScore);
    const tone=Number.isFinite(risk)?statusTone(scoreStatus(risk)):(c.trendTone||"neutral");
    const scoreBadge=Number.isFinite(risk)?`<span class="metric-risk-badge ${tone}">${Math.round(risk)} · ${scoreStatus(risk)}</span>`:"";
    const trend=c.trend?`<span class="metric-trend ${c.trendTone||"neutral"}">${escapeHtml(c.trend)}</span>`:"";
    const locked=c.locked?`<span class="metric-lock">LOCKED BASELINE</span>`:"";
    return `<div class="connected-card metric-tone-${tone}"><div class="metric-card-top"><span>${escapeHtml(c.label)}</span>${scoreBadge}</div><strong>${escapeHtml(c.value ?? "—")}</strong><div class="metric-card-foot"><small>${escapeHtml(c.note || "")}</small>${trend}${locked}</div></div>`;
  }).join("")}</div>`;
}

function riskTrendForRows(rows) {
  const vals=rows.map(r=>toNum(r.change)).filter(Number.isFinite);
  if (!vals.length) return {text:"→ no comparable trend",tone:"neutral"};
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  if (avg > 0.015) return {text:"↑ risk trend",tone:"danger"};
  if (avg < -0.015) return {text:"↓ risk trend",tone:"good"};
  return {text:"→ broadly flat",tone:"neutral"};
}

function marketMonthChange(key, mode="pct") {
  const rows=(DATA?.marketHistory||[]).filter(r=>Number.isFinite(toNum(r[key])));
  if (rows.length < 2) return {text:"—",tone:"neutral"};
  const latest=toNum(rows[rows.length-1][key]);
  const prev=toNum(rows[Math.max(0,rows.length-5)][key]);
  if (!Number.isFinite(latest)||!Number.isFinite(prev)) return {text:"—",tone:"neutral"};
  const diff=latest-prev;
  let text;
  if (mode==="bps") text=`${diff>0?"↑":diff<0?"↓":"→"} ${Math.abs(diff*100).toFixed(0)} bps · 1M`;
  else { const pct=prev!==0?diff/prev:NaN; text=Number.isFinite(pct)?`${pct>0?"↑":pct<0?"↓":"→"} ${formatPercent(Math.abs(pct))} · 1M`:"—"; }
  const tone=diff>0?"danger":diff<0?"good":"neutral";
  return {text,tone};
}

function evidenceTable(rows) {
  if (!rows.length) return `<div class="detail-empty">No connected evidence rows yet.</div>`;
  return `<div class="detail-table-wrap"><table class="detail-table"><thead><tr><th>Signal</th><th>Latest</th><th>Change / context</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.value)}</td><td>${escapeHtml(r.context || "")}</td></tr>`).join("")}</tbody></table></div>`;
}
function sourceNote(text) {
  return `<div class="source-note"><strong>DATA STATUS</strong><span>${escapeHtml(text)}</span></div>`;
}

function commitmentDetailHtml() {
  const s=DATA.commitmentMomentum?.summary || {};
  const rows=(DATA.commitmentMomentum?.rows || []).filter(r=>r.company && Number.isFinite(toNum(r.compositeRisk)));
  const avg=summaryValue(s,"averageCompanyRisk"), breadth=summaryValue(s,"breadth"), elevated=summaryValue(s,"companiesAbove50"), total=summaryValue(s,"totalCompanies");
  const cards=metricCards([
    {label:"Average company risk",value:Number.isFinite(avg)?formatNumber(avg,1):"—",note:"Across modeled companies",riskScore:avg,trend:riskTrendForRows(rows).text,trendTone:riskTrendForRows(rows).tone},
    {label:"Breadth",value:Number.isFinite(breadth)?formatPercent(breadth):"—",note:"Share with elevated risk"},
    {label:"Elevated",value:Number.isFinite(elevated)&&Number.isFinite(total)?`${elevated}/${total}`:"—",note:"Composite risk above 50"}
  ]);
  const table=evidenceTable(rows.map(r=>({label:r.company,value:`${formatNumber(toNum(r.compositeRisk),1)} · ${r.status || scoreStatus(toNum(r.compositeRisk))}`,context:`Commitment ${formatNumber(toNum(r.currentValue),2)} ${r.unit||""} · ${Number.isFinite(toNum(r.change))?formatSignedPercent(toNum(r.change)):"—"}`})));
  return sectionHtml("WHY IT MATTERS","Large and binding obligations become more dangerous when they grow faster than the revenue base and appear across many companies.",cards)
    + sectionHtml("COMPANY RISK MAP","The score uses the existing Commitment_Momentum model; company rows below are read from the live API.",table)
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">High commitment pressure is already visible.</div><p>The important question is whether demand and monetization keep strengthening fast enough to absorb these obligations without creating financing stress.</p></section>`
    + sectionHtml("HOW WE SCORE IT","Scale, momentum and binding character feed company Composite Risk; breadth then contributes to the overall Commitment Overhang score.")
    + sectionHtml("DATA & EVIDENCE","Commitments and Commitment_Momentum are sourced from the Google Sheet/API. Raw obligations remain separate from RPO/backlog so cost commitments are not confused with demand indicators.",sourceNote("Live API-connected · dynamic score"));
}

function financingDetailHtml() {
  const s=DATA.financingMomentum?.summary || {};
  const rows=DATA.financingMomentum?.rows || [];
  const general=summaryValue(s,"generalFinancingScore"), ai=summaryValue(s,"aiCreditStressScore"), burden=summaryValue(s,"companyFinancingBurden");
  const generalRows=rows.filter(r=>r.signalGroup==="GENERAL_FINANCING");
  const aiRows=rows.filter(r=>r.signalGroup==="AI_CREDIT_STRESS");
  const burdenRows=rows.filter(r=>r.signalGroup==="COMPANY_FINANCING");
  const gt=riskTrendForRows(generalRows), at=riskTrendForRows(aiRows), bt=riskTrendForRows(burdenRows);
  const cards=metricCards([
    {label:"General financing",value:fmtScore(general),note:"Rates + broad credit",riskScore:general,trend:gt.text,trendTone:gt.tone},
    {label:"AI credit stress",value:fmtScore(ai),note:"AI-linked CDS",riskScore:ai,trend:at.text,trendTone:at.tone},
    {label:"Company burden",value:fmtScore(burden),note:"Interest burden",riskScore:burden,trend:bt.text,trendTone:bt.tone}
  ]);
  const breakdown=evidenceTable(generalRows.map(r=>({label:r.metric||r.entityMarket||"General financing",value:`risk ${formatNumber(toNum(r.compositeRisk),0)}`,context:`Level ${formatNumber(toNum(r.levelScore),0)} · Momentum ${formatNumber(toNum(r.momentumScore),0)} · ${Number.isFinite(toNum(r.change))?formatSignedPercent(toNum(r.change)):"—"}`})));
  const credit=aiRows.map(r=>({label:`${r.entityMarket||"AI credit"} · 5Y CDS`,value:`${formatNumber(toNum(r.currentValue),0)} ${r.unit||"bp"}`,context:`${Number.isFinite(toNum(r.change))?formatSignedPercent(toNum(r.change)):"—"} · risk ${formatNumber(toNum(r.compositeRisk),0)}`}));
  return sectionHtml("WHY IT MATTERS","Financing can break an investment cycle before end demand disappears. Canary separates broad-market funding conditions from AI-specific stress.",cards)
    + sectionHtml("GENERAL FINANCING · SCORE BREAKDOWN","The 33 score is generated from the live General Financing rows — not entered manually. Level, momentum and breadth/burden logic feed the Financing_Momentum model.",breakdown)
    + sectionHtml("AI CREDIT STRESS","5Y CDS spreads are shown as market stress indicators, not precise default probabilities.",evidenceTable(credit))
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">The divergence matters more than the broad market alone.</div><p>AI-linked credit can deteriorate while IG/HY spreads remain calm. That is exactly the kind of localized stress the Canary is designed to surface early.</p></section>`
    + sectionHtml("HOW WE SCORE IT","General financing, AI credit stress and company financing burden are combined in the dynamic Financing_Momentum model. The arrows above show current risk direction in the underlying rows, not a fabricated weekly score history.")
    + sectionHtml("DATA & EVIDENCE","Market rates/spreads come from MarketHistory; AI credit and company financing inputs come from Financing and Company_Financials.",sourceNote("Live API-connected · dynamic score"));
}

function divergenceDetailHtml() {
  const s=DATA.financingMomentum?.summary || {};
  const general=summaryValue(s,"generalFinancingScore"), ai=summaryValue(s,"aiCreditStressScore");
  const gap=(Number.isFinite(general)&&Number.isFinite(ai))?ai-general:NaN;
  return sectionHtml("WHAT IT SHOWS","Compares the broad financing environment with AI-specific credit stress.",metricCards([
    {label:"General financing",value:fmtScore(general),note:"Broad conditions",riskScore:general},
    {label:"AI credit stress",value:fmtScore(ai),note:"AI-linked credit",riskScore:ai},
    {label:"Divergence",value:Number.isFinite(gap)?formatNumber(gap,1):"—",note:"AI minus general"}
  ]))+`<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">Localized stress can lead the broader market.</div><p>A positive gap is not a crisis signal by itself. It tells us that financing pressure is appearing inside the AI ecosystem before broad corporate credit confirms it.</p></section>`;
}

function computeDetailHtml() {
  const x=DATA.canary?.latest || {}, tg=DATA.latestTokenGpu || {};
  const h=tg.H100_SD || {}, c=tg.H100_CCIR || {};
  return sectionHtml("WHY IT MATTERS","Compute Supply asks whether expanding AI accelerator capacity is still being absorbed. Oversupply risk rises when capacity expands while utilization/pricing weaken.",metricCards([
    {label:"H100 rental",value:Number.isFinite(toNum(h.value))?`$${formatNumber(h.value,2)}`:"—",note:Number.isFinite(toNum(h["7dChange"]))?`7D ${formatSignedPercent(toNum(h["7dChange"]))}`:"Silicon Data"},
    {label:"Neocloud reference",value:Number.isFinite(toNum(c.value))?`$${formatNumber(c.value,2)}`:"—",note:"CCIR · separate methodology"},
    {label:"Semis score",value:fmtScore(x.semisScore),note:"Connected confirmation signal",riskScore:toNum(x.semisScore),locked:true}
  ]))
  + sectionHtml("NEXT DATA UPGRADE · GPU UTILIZATION","Direct GPU utilization is not connected to the score yet. It should be added as an underlying input only after a stable source and comparable history are selected.",`<div class="utilization-empty compact-empty"><div class="empty-grid"></div><div class="empty-content"><strong>GPU utilization series not connected</strong><span>Target: 12–24 months, weekly / best available. Until then, do not interpret Compute Supply 35 as a GPU-utilization score.</span></div></div>`)
  + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">Current score is Compute Supply — not GPU Utilization.</div><p>The deep dive deliberately separates connected market data from planned utilization data so the methodology stays transparent.</p></section>`
  + sectionHtml("DATA & EVIDENCE","Current connected evidence comes from Token_GPU and the existing Compute Supply component. GPU utilization remains marked as not included.",sourceNote("Partly connected · utilization source still to be selected"));
}

function tokenDetailHtml() {
  const tg=DATA.latestTokenGpu || {}, t=tg.TOKEN_SD || {}, h=tg.H100_SD || {};
  return sectionHtml("WHY IT MATTERS","Token economics tests whether AI usage and effective expenditure are strengthening. Monetization must eventually support the infrastructure buildout.",metricCards([
    {label:"Token index",value:Number.isFinite(toNum(t.value))?formatNumber(t.value,2):"—",note:Number.isFinite(toNum(t["7dChange"]))?`7D ${formatSignedPercent(toNum(t["7dChange"]))}`:"Silicon Data"},
    {label:"H100 rental",value:Number.isFinite(toNum(h.value))?`$${formatNumber(h.value,2)}`:"—",note:"Compute economics context"},
    {label:"History",value:`${seriesRows(DATA.tokenGpu||[],"TOKEN_SD").length} obs`,note:"Available comparable series"}
  ]))+sectionHtml("CANARY INTERPRETATION","Rising usage economics is supportive. Weakening token economics while CAPEX and commitments remain elevated would be a more important warning than either signal alone.")
  +sectionHtml("DATA & EVIDENCE","Current Token Index values come from the Token_GPU dataset and preserve the selected comparable Silicon Data series.",sourceNote("Live API-connected"));
}

function demandDetailHtml() {
  const rows=DATA.aiDemand || [];
  const latestByCompany={};
  rows.forEach(r=>{ if(!r.company) return; const d=String(r.observationDate||r.period||""); if(!latestByCompany[r.company] || d>String(latestByCompany[r.company].observationDate||latestByCompany[r.company].period||"")) latestByCompany[r.company]=r; });
  const companies=[...new Set(rows.map(r=>r.company).filter(Boolean))];
  const recent=rows.slice(-8).map(r=>({label:`${r.company||"—"} · ${r.metric||"Metric"}`,value:formatDemandValue(r),context:r.yoyChange!==undefined&&r.yoyChange!==null?formatDemandChange(r):r.period||""}));
  return sectionHtml("WHY IT MATTERS","Demand is the bridge between infrastructure investment and monetization. Canary follows growth, backlog/RPO and operating signals across major AI/cloud companies.",metricCards([
    {label:"Companies tracked",value:String(companies.length),note:"Current AI_Demand dataset"},
    {label:"Demand score",value:fmtScore(DATA.canary?.latest?.demandScore),note:"Current Canary component",riskScore:toNum(DATA.canary?.latest?.demandScore),locked:true},
    {label:"Evidence rows",value:String(rows.length),note:"API-connected observations"}
  ]))+sectionHtml("RECENT COMPANY SIGNALS","Selected live rows from AI_Demand.",evidenceTable(recent))+sectionHtml("DATA & EVIDENCE","Company demand rows come from the AI_Demand Google Sheet tab with source, observation date and verification fields retained in the API.",sourceNote("Live API-connected"));
}

function semisDetailHtml() {
  const m=DATA.latestMarket || {}, x=DATA.canary?.latest||{};
  const sox=m.sox||{};
  return sectionHtml("WHY IT MATTERS","Semiconductors are a market-sensitive checkpoint on AI infrastructure expectations. Persistent chip weakness can challenge otherwise strong reported fundamentals.",metricCards([
    {label:"SOX",value:Number.isFinite(toNum(sox.value))?formatNumber(sox.value,0):"—",note:sox.date||"Latest market observation"},
    {label:"Semis score",value:fmtScore(x.semisScore),note:"Current Canary component",riskScore:toNum(x.semisScore),locked:true},
    {label:"Compute score",value:fmtScore(x.computeScore),note:"Connected cycle signal",riskScore:toNum(x.computeScore),locked:true}
  ]))+sectionHtml("DATA & EVIDENCE","SOX history is supplied through MarketHistory. The current Semiconductor Market score remains the existing Canary component.",sourceNote("Market history connected"));
}

function capexDetailHtml() {
  const rows=DATA.capex || [];
  const latestByCompany={};
  rows.forEach(r=>{ const c=r.company; if(!c) return; const d=String(r.observationDate||r.publicationDate||r.period||""); if(!latestByCompany[c] || d>String(latestByCompany[c].observationDate||latestByCompany[c].publicationDate||latestByCompany[c].period||"")) latestByCompany[c]=r; });
  const latest=Object.values(latestByCompany).slice(0,8).map(r=>({label:`${r.company} · ${r.metric||"CAPEX"}`,value:Number.isFinite(toNum(r.value))?`${formatNumber(toNum(r.value),1)} ${r.unit||""}`:(Number.isFinite(toNum(r.low))&&Number.isFinite(toNum(r.high))?`${formatNumber(toNum(r.low),0)}–${formatNumber(toNum(r.high),0)} ${r.unit||""}`:"—"),context:r.period||r.dataType||""}));
  return sectionHtml("WHY IT MATTERS","CAPEX is the physical investment pulse of the AI cycle. The risk comes from the relationship between spending, demand, commitments and financing — not from a high CAPEX number alone.",metricCards([
    {label:"CAPEX score",value:fmtScore(DATA.canary?.latest?.capexScore),note:"Current Canary component",riskScore:toNum(DATA.canary?.latest?.capexScore),locked:true},
    {label:"Raw rows",value:String(rows.length),note:"CAPEX API dataset"},
    {label:"Companies",value:String(new Set(rows.map(r=>r.company).filter(Boolean)).size),note:"Tracked issuers"}
  ]))+sectionHtml("LATEST COMPANY OBSERVATIONS","Latest available row per company from the connected CAPEX dataset.",evidenceTable(latest))+sectionHtml("DATA & EVIDENCE","CAPEX keeps reported actuals and guidance as separate data types so changes in accounting classification do not silently become economic changes.",sourceNote("Live API-connected"));
}

function macroDetailHtml() {
  const m=DATA.latestMarket || {};
  const v=marketMonthChange("vix","pct"), n=marketMonthChange("us10y","bps"), rr=marketMonthChange("real10y","bps"), hy=marketMonthChange("hyOas","bps"), ig=marketMonthChange("igOas","bps");
  return sectionHtml("WHY IT MATTERS","Macro conditions influence discount rates, funding costs, risk appetite and the ability of capital-intensive AI projects to refinance through a downturn.",metricCards([
    {label:"VIX",value:m.vix?formatNumber(m.vix.value,2):"—",note:m.vix?.date||"",trend:v.text,trendTone:v.tone},
    {label:"US 10Y",value:m.us10y?`${formatNumber(m.us10y.value,2)}%`:"—",note:"Nominal yield",trend:n.text,trendTone:n.tone},
    {label:"Real 10Y",value:m.real10y?`${formatNumber(m.real10y.value,2)}%`:"—",note:"Real discount rate",trend:rr.text,trendTone:rr.tone},
    {label:"HY OAS",value:m.hyOas?`${formatNumber(m.hyOas.value,2)}%`:"—",note:"Broad credit stress",trend:hy.text,trendTone:hy.tone},
    {label:"IG OAS",value:m.igOas?`${formatNumber(m.igOas.value,2)}%`:"—",note:"Investment grade credit",trend:ig.text,trendTone:ig.tone}
  ]))+sectionHtml("HOW THE 45 SCORE IS TREATED","Macro & Risk 45 is still the locked v3 baseline. The live market values and 1M arrows above are evidence around that score, but they do not yet recalculate it. A dynamic Macro_Momentum model is a later upgrade.",sourceNote("Score locked · live evidence connected"))+sectionHtml("DATA & EVIDENCE","MarketHistory provides weekly end-of-period / last-available observations. 1M change compares the latest valid weekly observation with roughly four weeks earlier.",sourceNote("Live market-history connection"));
}

function moneyFinancingHtml(){ return sectionHtml("WHAT SITS HERE","This node combines existing Financing Conditions and Commitment Overhang signals. Its color is the worst mapped risk category; the node itself has no invented 0–100 score.",metricCards([{label:"Financing",value:fmtScore(dynamicScore(DATA,"financingConditions",DATA.canary?.latest?.financingScore).score),note:"Dynamic",riskScore:toNum(dynamicScore(DATA,"financingConditions",DATA.canary?.latest?.financingScore).score)},{label:"Commitments",value:fmtScore(dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore).score),note:"Dynamic",riskScore:toNum(dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore).score)},{label:"HY OAS",value:DATA.latestMarket?.hyOas?`${formatNumber(DATA.latestMarket.hyOas.value,2)}%`:"—",note:"Broad credit"}]))+sourceNote("Click the dedicated Commitment or Financing indicator for full scoring detail."); }
function moneyHyperscalersHtml(){ return sectionHtml("WHAT SITS HERE","Hyperscalers and neocloud providers convert financing into AI infrastructure. Canary connects CAPEX, commitments and demand rather than assigning this node a new score.",metricCards([{label:"CAPEX score",value:fmtScore(DATA.canary?.latest?.capexScore),note:"Existing component",riskScore:toNum(DATA.canary?.latest?.capexScore),locked:true},{label:"Commitments",value:fmtScore(dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore).score),note:"Dynamic",riskScore:toNum(dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore).score)},{label:"Demand",value:fmtScore(DATA.canary?.latest?.demandScore),note:"Existing component",riskScore:toNum(DATA.canary?.latest?.demandScore),locked:true}]))+sourceNote("Use CAPEX, Commitment Overhang and AI Demand deep dives for underlying rows."); }
function moneySemisHtml(){ return sectionHtml("WHAT SITS HERE","Semis & Hardware links chip-market confirmation to compute supply.",metricCards([{label:"Semis score",value:fmtScore(DATA.canary?.latest?.semisScore),note:"Existing component",riskScore:toNum(DATA.canary?.latest?.semisScore),locked:true},{label:"Compute",value:fmtScore(DATA.canary?.latest?.computeScore),note:"Existing component",riskScore:toNum(DATA.canary?.latest?.computeScore),locked:true},{label:"SOX",value:DATA.latestMarket?.sox?formatNumber(DATA.latestMarket.sox.value,0):"—",note:"Market signal"}]))+sourceNote("No separate Money Circle node score is created."); }
function moneyComputeHtml(){ const h=DATA.latestTokenGpu?.H100_SD||{}; return sectionHtml("WHAT SITS HERE","Compute & AI Models links supply conditions, GPU pricing and token activity.",metricCards([{label:"Compute score",value:fmtScore(DATA.canary?.latest?.computeScore),note:"Existing component",riskScore:toNum(DATA.canary?.latest?.computeScore),locked:true},{label:"H100 rental",value:Number.isFinite(toNum(h.value))?`$${formatNumber(h.value,2)}`:"—",note:"Silicon Data"},{label:"Token score",value:fmtScore(DATA.canary?.latest?.tokenScore),note:"Monetization context",riskScore:toNum(DATA.canary?.latest?.tokenScore),locked:true}]))+sourceNote("GPU utilization remains a planned, not yet connected, input."); }
function moneyMonetizationHtml(){ const t=DATA.latestTokenGpu?.TOKEN_SD||{}; return sectionHtml("WHAT SITS HERE","End Users & Monetization is where the AI cycle ultimately has to pay for itself.",metricCards([{label:"Demand score",value:fmtScore(DATA.canary?.latest?.demandScore),note:"Company demand"},{label:"Token score",value:fmtScore(DATA.canary?.latest?.tokenScore),note:"Usage economics"},{label:"Token index",value:Number.isFinite(toNum(t.value))?formatNumber(t.value,2):"—",note:"Silicon Data"}]))+sourceNote("Future enterprise-adoption data such as Ramp can strengthen this node once a stable series is integrated."); }
