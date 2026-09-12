const API_URL = "https://script.google.com/macros/s/AKfycbx53ydPhicHlX3o3jMbgm0z1HozvgkeJGA0MFmoIZqxeAzIdntHevNZ0JFqa7DTV5OoXw/exec";

let DATA = null;
let currentRange = 52;
const charts = {};

const LIVE_CACHE_KEY = "aiCanaryLiveDataV1";

// v4.19 — Fiasco Finance language layer.
// Indicator names, scores, statuses and financial terminology intentionally remain English.
// Only explanatory / help copy is localized.
const UI_LANG_KEY = "aiCanaryLanguageV1";
let UI_LANG = localStorage.getItem(UI_LANG_KEY) || "no";

const NO_TEXT = new Map(Object.entries({
  "Tracking the AI cycle. Spotting risks early.":"Vi følger AI-syklusen og leter etter tidlige faresignaler.",
  "Early warning for the AI investment cycle":"Tidlig varsling for AI-investeringssyklusen",
  "Tracks demand, compute, CAPEX, commitments, credit and markets to spot stress before it becomes broad.":"Vi følger demand, compute, CAPEX, commitments, credit og markedssignaler for å oppdage stress før det blir bredt synlig.",
  "Where risk sits in the loop":"Hvor ligger risikoen i AI-syklusen?",
  "Key signals":"Viktige signaler",
  "Risk components":"Risikokomponenter",
  "WHY IT MATTERS":"HVORFOR DETTE ER VIKTIG",
  "HOW THE SCORE IS BUILT":"SLIK BYGGES SCOREN",
  "HOW THE 76 IS BUILT":"SLIK BYGGES SCOREN",
  "MODEL LOGIC":"SLIK TENKER MODELLEN",
  "DATA & EVIDENCE":"DATA & DOKUMENTASJON",
  "WHAT THIS MODEL DOES NOT YET CAPTURE":"DETTE ER IKKE MED I MODELLEN ENNÅ",
  "LATEST COMPANY OBSERVATIONS":"SISTE SELSKAPSDATA",
  "WHY THE WEIGHTS DIFFER":"HVORFOR VEKTENE ER ULIKE",
  "PURPOSE":"HVA ER AI CANARY?",
  "HOW THE LOOP WORKS":"SLIK HENGER AI-SYKLUSEN SAMMEN",
  "HOW SCORES WORK":"SLIK FUNGERER SCORENE",
  "DATA MAP · WHAT WE FETCH":"DATA MAP · DETTE HENTER VI",
  "HOW TO USE IT":"SLIK BRUKER VI AI CANARY",
  "ROLE IN THE AI MONEY CIRCLE":"ROLLE I AI MONEY CIRCLE",
  "WHAT CANARY IS LOOKING FOR":"DETTE SER CANARY ETTER",
  "HOW TO READ THIS NODE":"SLIK LESER DU DETTE TEMAET",
  "WHAT SITS HERE":"HVA FØLGER VI HER?",
  "COMPANY RISK MAP":"RISIKOBILDE PER SELSKAP",
  "FINANCING RISK MAP":"FINANSIERINGSBILDET",

  "Is AI usage and monetization keeping pace with the investment cycle?":"Holder AI-bruk og monetization tritt med investeringstakten?",
  "Are customers and cloud workloads absorbing the expanding AI capacity?":"Er demand sterk nok til å absorbere den raskt voksende AI-kapasiteten?",
  "Is AI compute capacity scarce, balanced or moving toward oversupply?":"Er AI compute fortsatt knapp, i balanse eller på vei mot overkapasitet?",
  "Does the chip market confirm or challenge the AI investment narrative?":"Bekrefter chip-markedet AI-investeringshistorien, eller begynner det å sende varselsignaler?",
  "How quickly is infrastructure spending expanding, and who is carrying it?":"Hvor raskt vokser investeringene i AI-infrastruktur, og hvem bærer kostnaden?",
  "How large, fast-growing and binding are future AI-related obligations?":"Hvor store, raskt voksende og bindende er fremtidige AI-forpliktelser?",
  "Is funding pressure emerging inside AI before the broad market?":"Oppstår financing stress i AI-sektoren før det synes i det brede markedet?",
  "Is the external market environment amplifying or cushioning AI-cycle risk?":"Forsterker eller demper markedet rundt oss risikoen i AI-syklusen?",

  "Large and binding obligations become more dangerous when they grow faster than the revenue base and appear across many companies.":"Store og bindende forpliktelser blir mer risikable når de vokser raskere enn inntektene og samtidig øker hos mange selskaper.",
  "The headline Commitment Overhang score is calculated directly from the dynamic Google Sheet model — not entered manually.":"Commitment Overhang beregnes direkte fra vår dynamiske Google Sheet-modell. Scoren legges ikke inn manuelt.",
  "The exact Google Sheet transformation is shown below. Company Composite Risk uses 40% Scale + 35% Momentum + 25% Binding; the headline then combines average company risk and breadth.":"Under viser vi nøyaktig hvordan vår Google Sheet-modell regner. Company Composite Risk bruker 40% Scale + 35% Momentum + 25% Binding. Deretter kombineres gjennomsnittlig selskapsrisiko med breadth.",
  "High commitment pressure is broad, not just large in dollar terms.":"Commitment-presset er bredt – ikke bare stort målt i dollar.",
  "The current danger signal comes from both elevated company-level risk and breadth across the group. The key confirmation question is whether demand, utilization and monetization remain strong enough to absorb these fixed obligations without creating financing stress.":"Dagens faresignal skyldes både høy risiko i flere enkeltselskaper og stor breadth. Det avgjørende er om demand, utilization og monetization er sterke nok til å bære de faste forpliktelsene uten financing stress.",

  "Financing can break an investment cycle before end demand disappears. Canary separates broad funding conditions from AI-specific credit stress and company-level interest burden.":"Finansiering kan knekke en investeringssyklus før sluttetterspørselen forsvinner. Derfor skiller vår modell mellom brede funding conditions, AI-specific credit stress og selskapenes rentebelastning.",
  "The headline Financing Conditions score is calculated directly from the dynamic Google Sheet model — not entered manually.":"Financing Conditions beregnes direkte fra vår dynamiske Google Sheet-modell. Scoren legges ikke inn manuelt.",
  "The exact model has two layers: each underlying financing signal is scored first, then the three group scores are combined into the headline Financing Conditions score.":"Modellen har to nivåer: Først scores hvert underliggende finansieringssignal. Deretter kombineres de tre gruppescorene til Financing Conditions.",
  "AI-specific credit stress is doing most of the damage.":"AI-specific credit stress står nå for mesteparten av risikoen.",
  "Broad IG/HY credit remains relatively calm, while AI-linked CDS is much more stressed. That divergence is useful because localized financing pressure can appear before the broader corporate credit market deteriorates.":"IG/HY credit er fortsatt relativt rolig, mens AI-relatert CDS viser langt mer stress. Dette spriket er viktig fordi lokalt financing pressure kan oppstå før det brede corporate credit-markedet svekkes.",

  "The 52-week view provides context around the short 30D scoring window. It is evidence, not an additional scored input.":"52-ukersgrafen setter det korte 30D-vinduet i perspektiv. Grafen gir trendkontekst og er ikke et ekstra input i scoren.",
  "Semiconductor Market v1 is intentionally simple. A flat SOX trend maps near 50 risk. Strong positive 30D momentum pushes risk toward 0; strong negative momentum pushes risk toward 100. The mapping is linear and capped at both ends.":"Semiconductor Market v1 er bevisst enkel. Flat SOX-utvikling gir omtrent 50 i risiko. Sterk positiv 30D momentum trekker risiko mot 0, mens sterk negativ momentum trekker den mot 100. Skalaen er lineær og avgrenset i begge ender.",
  "SOX is a market-price signal, not a complete semiconductor-cycle model. We will only add fundamental inputs after selecting stable, comparable data sources.":"SOX er et markedssignal, ikke en komplett modell for semiconductor-syklusen. Vi legger først til fundamentale inputs når vi har stabile og sammenlignbare datakilder.",
  "SOX is currently broadly neutral rather than flashing a cycle warning.":"SOX er nå omtrent nøytral og gir foreløpig ikke et tydelig syklusvarsel.",

  "CAPEX is the physical investment pulse of the AI cycle. The risk comes from the relationship between spending, demand, commitments and financing — not from a high CAPEX number alone.":"CAPEX er den fysiske investeringspulsen i AI-syklusen. Risikoen ligger i forholdet mellom spending, demand, commitments og financing – ikke i et høyt CAPEX-tall alene.",
  "Latest available row per company from the connected CAPEX dataset.":"Siste tilgjengelige observasjon per selskap fra det tilkoblede CAPEX-datasettet.",
  "Macro conditions can amplify or cushion AI-cycle stress through volatility, discount rates, global funding and risk appetite.":"Macro-forhold kan forsterke eller dempe stress i AI-syklusen gjennom volatility, discount rates, global funding og risk appetite.",

  "AI Canary is an early-warning framework for the AI investment cycle. It looks for stress building across monetization, demand, compute, investment commitments, financing and broad markets before those signals necessarily appear together in headline indices.":"AI Canary er Fiasco Finance sin hjemmelagde early-warning modell for AI-investeringssyklusen. Vi samler signaler fra monetization, demand, compute, commitments, financing og markedene for å se om stress bygger seg opp før det blir tydelig i brede markedsindekser.",
  "The cycle is easiest to read from funding through monetization. Capital enables builders, builders buy hardware, hardware becomes compute, and compute must ultimately create end-user value. Weakness can then feed back into financing and the next investment round.":"Vi leser syklusen fra capital til monetization: Capital finansierer utbygging, hyperscalers og neocloud kjøper hardware, hardware blir til compute, og compute må til slutt skape verdi hos sluttbrukerne. Hvis verdiskapingen svikter, kan svakheten slå tilbake på financing og neste investeringsrunde.",
  "Each component uses its own economically relevant thresholds. Dynamic components are calculated in Google Sheets. The headline now uses the dynamic component score when one exists and the locked v3 score as a fallback for components not upgraded yet. This mixed headline is not backfilled into history.":"Hver komponent har terskler som er tilpasset signalet vi måler. Dynamiske komponenter beregnes i Google Sheets. Der en dynamisk score finnes bruker dashboardet denne; komponenter som ikke er oppgradert ennå bruker fortsatt låst v3-score. Den blandede headline-scoren fylles ikke bakover i historikken.",
  "The table below shows the intended source discipline. AUTO means the scheduled Apps Script fetches the data; SEMI_AUTO means quarterly source rows are verified/maintained around releases; MANUAL / ASSISTED is used where a stable public API is not available.":"Tabellen viser hvordan vi håndterer kildene. AUTO betyr at Apps Script henter data automatisk. SEMI_AUTO betyr at kvartalsdata kontrolleres og vedlikeholdes rundt rapportering. MANUAL / ASSISTED brukes når vi ikke har en stabil offentlig API.",
  "AI Canary is not an automatic buy/sell signal. Treat a change as a prompt to inspect the underlying evidence. The strongest warning is when independent fundamental, financing and market indicators confirm the same deterioration.":"AI Canary er ikke et automatisk kjøps- eller salgssignal. Vi bruker endringer som et varsel om å undersøke dataene nærmere. Det sterkeste signalet oppstår når uavhengige fundamental-, financing- og market-indikatorer peker i samme negative retning.",
  "Research framework · source-first · no invented data":"Fiasco Finance-modell · source-first · ingen oppdiktede data",

  "The node becomes more concerning when several independent signals deteriorate together.":"Temaet blir mer bekymringsfullt når flere uavhengige signaler svekkes samtidig.",
  "Each colored card is an existing 0–100 Canary indicator. Select a card to open its Deep Dive and see the underlying data, transformations, weights and score calculation.":"Hvert fargede kort er en eksisterende 0–100 Canary Indicator. Trykk på et kort for Deep Dive med underliggende data, transformasjoner, vekter og scoreberegning.",
  "The Money Circle node does not create a separate score. Its color reflects the highest risk category among the mapped Canary indicators.":"Money Circle-temaet lager ikke en egen score. Fargen viser høyeste risikokategori blant Canary Indicators som er koblet til temaet.",
  "Click the dedicated Commitment or Financing indicator for full scoring detail.":"Trykk på Commitment eller Financing for full scoreberegning.",
  "Use CAPEX, Commitment Overhang and AI Demand deep dives for underlying rows.":"Bruk Deep Dive for CAPEX, Commitment Overhang og AI Demand for å se underliggende data.",
  "No separate Money Circle node score is created.":"Money Circle lager ingen egen ekstra score for dette temaet.",

  "Maps the AI economic loop from capital and financing through hyperscalers, semiconductors, compute and end-user monetization. Node status uses the highest risk category among existing mapped Canary indicators; it is not a separate invented score.":"AI Money Circle viser hvordan kapital beveger seg gjennom AI-økonomien: fra financing via hyperscalers, semiconductors og compute til end-user monetization. Statusen bruker høyeste risikokategori blant eksisterende Canary Indicators – vi lager ikke en ekstra oppdiktet score.",
  "The eight core 0–100 risk components behind the dashboard. 0–25 is Healthy, 26–50 Watch, 51–75 Warning and 76–100 Danger. Token Economics, Compute Supply, Semiconductor Market, Commitment, Financing and Macro now use dynamic calculation models; Demand and CAPEX remain locked fallbacks until upgraded.":"Dette er de åtte 0–100 risikokomponentene i vår modell. 0–25 er Healthy, 26–50 Watch, 51–75 Warning og 76–100 Danger. Token Economics, Compute Supply, Semiconductor Market, Commitment, Financing og Macro beregnes dynamisk; Demand og CAPEX bruker foreløpig låste fallback-scorer.",
  "Tracks AI usage economics and effective token expenditure. It helps test whether end-user activity and monetization are keeping pace with infrastructure investment.":"Vi følger AI-bruk og effective token expenditure for å se om end-user activity og monetization holder tritt med investeringene i infrastrukturen.",
  "Tracks company-level AI and cloud demand signals such as revenue growth, backlog/RPO and related operating metrics. Strong, broad demand offsets supply-side cycle risk.":"Vi følger AI- og cloud demand gjennom blant annet revenue growth, backlog/RPO og relevante driftsmål. Sterk og bred demand reduserer risikoen for at ny kapasitet blir stående ubrukt.",
  "Tracks whether AI compute supply is tightening or becoming abundant. H100 rental pricing is live today; direct GPU utilization is a planned input and is not yet included in the current score.":"Vi følger om AI compute supply fortsatt er knapp eller blir stadig lettere tilgjengelig. H100 rental pricing er live; direkte GPU utilization er planlagt, men inngår ikke i dagens score.",
  "Tracks market confirmation from semiconductors and chip-linked indicators. Weakness can signal falling expectations for the AI infrastructure cycle before reported fundamentals turn.":"Vi bruker semiconductors og chip-relaterte markedssignaler som en tidlig bekreftelse eller advarsel. Svakhet kan vise fallende forventninger til AI-infrastruktur før det synes i rapporterte fundamentals.",
  "Tracks the scale and momentum of AI-related capital spending by major hyperscalers and infrastructure providers. High CAPEX is not automatically risky; the Canary cares when investment outruns monetization and financing capacity.":"Vi følger størrelse og momentum i AI-relatert CAPEX hos hyperscalers og infrastrukturleverandører. Høy CAPEX er ikke automatisk negativt; risikoen øker når investeringene løper foran monetization og financing capacity.",
  "Tracks the external environment around the AI cycle: rates, volatility, credit spreads and other macro/liquidity signals that can amplify or cushion company-specific stress.":"Vi følger omgivelsene rundt AI-syklusen: rates, volatility, credit spreads og andre macro/liquidity-signaler som kan forsterke eller dempe selskapsspesifikt stress."
}));

function setupLanguageToggle(){
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.lang===UI_LANG);
    btn.addEventListener("click",()=>{
      const next=btn.dataset.lang;
      if(!next || next===UI_LANG) return;
      localStorage.setItem(UI_LANG_KEY,next);
      location.reload();
    });
  });
}
function applyNorwegianCopy(root=document.body){
  if(UI_LANG!=="no" || !root) return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const raw=n.nodeValue, trimmed=raw.trim();
    if(!trimmed) return;
    const translated=NO_TEXT.get(trimmed);
    if(translated) n.nodeValue=raw.replace(trimmed,translated);
  });
  document.documentElement.lang="nb";
}

const LIVE_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let hasRenderedCachedData = false;
let initialTopResetPending = true;

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  forceDashboardTop();
  loadDashboard();
  setupInfoButtons();
  setupIndicatorDetails();
  setupLanguageToggle();
  applyNorwegianCopy();
  document.getElementById("liveLoadRetry")?.addEventListener("click", loadDashboard);

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
  ,indicators: {title:"Canary Indicators",text:"The eight core 0–100 risk components behind the dashboard. 0–25 is Healthy, 26–50 Watch, 51–75 Warning and 76–100 Danger. Token Economics, Compute Supply, Semiconductor Market, Commitment, Financing and Macro now use dynamic calculation models; Demand and CAPEX remain locked fallbacks until upgraded."}
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

let loadAttempt = 0;
let slowLoadTimer = null;

function setLoadStage(stage, message) {
  const overlay = document.getElementById("liveLoadOverlay");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.setAttribute("aria-busy", stage === 3 ? "false" : "true");
  const steps = [...overlay.querySelectorAll(".live-load-steps span")];
  steps.forEach((el,i)=>{ el.classList.toggle("active", i===stage); el.classList.toggle("done", i<stage); });
  if (message) setText("liveLoadText", message);
}

function showLoadError(message) {
  clearTimeout(slowLoadTimer);
  const overlay = document.getElementById("liveLoadOverlay");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.classList.add("is-error");
  setText("liveLoadTitle", hasRenderedCachedData ? "Showing saved data" : "Live data could not be loaded");
  setText("liveLoadText", message || (hasRenderedCachedData
    ? "The live database did not respond. The dashboard is still showing the latest saved data on this device."
    : "The Canary database did not respond. You can retry without reloading the page."));
  const retry = document.getElementById("liveLoadRetry");
  if (retry) retry.hidden = false;
}

function forceDashboardTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function hideLoadOverlay() {
  clearTimeout(slowLoadTimer);
  const overlay = document.getElementById("liveLoadOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-error");
  setLoadStage(3, "Ready");

  // Mobile browsers can restore an old scroll position while the dashboard is
  // rendering behind the loading overlay. On the first completed load, pin
  // the viewport back to the actual top before and after the overlay fades.
  if (initialTopResetPending) forceDashboardTop();

  setTimeout(()=>{
    overlay.classList.add("is-ready");
    setTimeout(()=>{
      overlay.hidden = true;
      overlay.classList.remove("is-ready");
      if (initialTopResetPending) {
        requestAnimationFrame(()=>requestAnimationFrame(forceDashboardTop));
        setTimeout(forceDashboardTop, 120);
        initialTopResetPending = false;
      }
    },280);
  },180);
}

function saveLiveCache(data) {
  try {
    localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify({savedAt:Date.now(), data}));
  } catch (err) {
    console.warn("AI Canary cache could not be saved", err);
  }
}

function readLiveCache() {
  try {
    const raw = localStorage.getItem(LIVE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.savedAt) return null;
    return { data: parsed.data, savedAt: Number(parsed.savedAt), ageMs: Date.now() - Number(parsed.savedAt) };
  } catch (err) {
    console.warn("AI Canary cache could not be read", err);
    return null;
  }
}

function renderAll(data) {
  DATA = data;
  renderOverview(data);
  renderTakeaways(data);
  renderIndicators(data);
  renderMobileDashboard(data);
  renderMoneyCircle(data);
  renderFinancialRisk(data);
  renderMarketCharts(data.marketHistory || []);
  renderEconomics(data);
  renderTokenGpuTable(data.tokenGpu || []);
  renderCompanies(data.aiDemand || []);
  applyNorwegianCopy();
}

function renderCachedDashboard(cache) {
  if (!cache?.data) return false;
  try {
    renderAll(cache.data);
    hasRenderedCachedData = true;
    const saved = new Date(cache.savedAt);
    const stale = cache.ageMs > LIVE_CACHE_MAX_AGE_MS;
    setStatus(stale ? "Saved data · updating…" : "Saved data · updating live…", false);
    setText("lastUpdated", `Saved on this device: ${saved.toLocaleString("nb-NO")}`);
    return true;
  } catch (err) {
    console.warn("Cached dashboard could not be rendered", err);
    return false;
  }
}

async function fetchLiveData(timeoutMs=35000) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try {
    const response = await fetch(API_URL, { cache:"no-store", signal:controller.signal, redirect:"follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "API returned ok=false");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function loadDashboard() {
  loadAttempt += 1;
  const retry = document.getElementById("liveLoadRetry");
  if (retry) retry.hidden = true;
  const overlay = document.getElementById("liveLoadOverlay");
  if (overlay) overlay.classList.remove("is-error");

  const cache = readLiveCache();
  if (!hasRenderedCachedData && cache) renderCachedDashboard(cache);

  setText("liveLoadTitle", hasRenderedCachedData ? "Updating live market data…" : "Loading live market data…");
  setLoadStage(0, hasRenderedCachedData
    ? "Showing saved dashboard while connecting to Canary database"
    : (loadAttempt > 1 ? `Reconnecting to Canary database · attempt ${loadAttempt}` : "Connecting to Canary database"));
  clearTimeout(slowLoadTimer);
  slowLoadTimer = setTimeout(()=>{
    setText("liveLoadTitle", hasRenderedCachedData ? "Still updating live data…" : "Still loading live data…");
    setText("liveLoadText", hasRenderedCachedData
      ? "The saved dashboard remains available while the live database responds."
      : "The live database can take longer on mobile, especially after an idle period.");
  },10000);

  try {
    setLoadStage(1, hasRenderedCachedData ? "Refreshing from Google Sheets" : "Loading live data from Google Sheets");
    let data;
    try {
      data = await fetchLiveData(35000);
    } catch (firstErr) {
      if (loadAttempt === 1 && navigator.onLine !== false) {
        setText("liveLoadText", hasRenderedCachedData
          ? "Live connection was slow · one automatic retry…"
          : "First connection was slow · one automatic retry…");
        await new Promise(r=>setTimeout(r,1500));
        data = await fetchLiveData(35000);
      } else {
        throw firstErr;
      }
    }

    setLoadStage(2, "Building dashboard");
    renderAll(data);
    saveLiveCache(data);
    hasRenderedCachedData = false;

    setStatus("Live data", true);
    const generated = new Date(data.generatedAt);
    setText("lastUpdated", `API generated: ${generated.toLocaleString("nb-NO")}`);
    hideLoadOverlay();
  } catch (err) {
    console.error(err);
    const msg = err?.name === "AbortError"
      ? (hasRenderedCachedData
          ? "Live refresh timed out. The latest saved dashboard is still shown; retry when the connection improves."
          : "The live API timed out. Retry when the connection improves.")
      : (hasRenderedCachedData
          ? `Live refresh failed (${err.message}). The latest saved dashboard is still shown.`
          : `Data error: ${err.message}`);
    setStatus(hasRenderedCachedData ? "Saved data · live refresh failed" : msg, false);
    showLoadError(msg);
  }
}

function renderOverview(data) {
  const latest = data.canary?.latest || {};
  const headline = data.dynamicHeadline?.available ? data.dynamicHeadline : null;
  const market = data.latestMarket || {};
  const tg = data.latestTokenGpu || {};
  const history = data.marketHistory || [];

  const score = Number(headline?.score ?? latest.canaryScore);
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
    const needle = document.getElementById("scoreNeedle");
    if (needle) needle.style.setProperty("--needle-angle", `${-90 + Math.max(0,Math.min(100,score))*1.8}deg`);
  }

  setText("canaryStatus", headline?.status || latest.status || "—");
  setText("hedgeRead", `Hedge Read: ${headline?.hedgeRead || latest.hedgeRead || "—"}`);
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
  const dynToken = dynamicScore(data,"tokenEconomics",x.tokenScore);
  const dynSemis = dynamicScore(data,"semiconductorMarket",x.semisScore);
  const dynCompute = dynamicScore(data,"computeSupply",x.computeScore);
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
      scores:[toNum(dynSemis.score),toNum(dynCompute.score)],
      badges:[
        `Semis ${fmtScore(dynSemis.score)}`,
        `Compute ${fmtScore(dynCompute.score)}`,
        market.sox ? `SOX ${formatNumber(market.sox.value,0)}` : null
      ]
    },
    {
      id:"moneyNode4",
      scores:[toNum(dynCompute.score),toNum(dynToken.score)],
      badges:[
        `Compute ${fmtScore(dynCompute.score)}`,
        Number.isFinite(toNum(h100.value)) ? `H100 $${formatNumber(h100.value,2)}` : null,
        `Token score ${fmtScore(dynToken.score)}`
      ]
    },
    {
      id:"moneyNode5",
      scores:[toNum(x.demandScore),toNum(dynToken.score)],
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

    el.classList.remove("node-good","node-healthy","node-watch","node-warning","node-danger");
    el.classList.add(`node-${tone}`);

    const statusEl = el.querySelector(".money-node-status");
    statusEl.textContent = status;
    statusEl.className = `money-node-status ${tone}`;

    const badgeEl = el.querySelector(".money-node-badges");
    badgeEl.innerHTML = node.badges
      .filter(Boolean)
      .map(b => {
        const match = String(b).match(/(-?\d+(?:[.,]\d+)?)(?!.*\d)/);
        const badgeScore = match ? toNum(match[1]) : NaN;
        const label = String(b).toLowerCase();
        const isScoreBadge = /financing|commitments|capex|demand|semis|compute|token score/.test(label);
        const badgeTone = isScoreBadge && Number.isFinite(badgeScore) ? statusTone(scoreStatus(badgeScore)) : "neutral";
        return `<span class="money-badge badge-${badgeTone}">${escapeHtml(b)}</span>`;
      })
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

function componentItems(data) {
  const x = data.canary?.latest || {};
  const token = dynamicScore(data,"tokenEconomics",x.tokenScore);
  const semis = dynamicScore(data,"semiconductorMarket",x.semisScore);
  const compute = dynamicScore(data,"computeSupply",x.computeScore);
  const commit = dynamicScore(data,"commitmentOverhang",x.commitmentScore);
  const fin = dynamicScore(data,"financingConditions",x.financingScore);
  const macro = dynamicScore(data,"macroRisk",x.macroScore);

  return [
    {name:"Token Economics",score:token.score,icon:"🪙",detail:"token",info:"tokenEconomics",subtitle:"Dynamic · volume × expenditure"},
    {name:"AI Demand",score:x.demandScore,icon:"☁️",detail:"demand",info:"aiDemandIndicator",subtitle:"Locked v3 · revenue, cloud growth & backlog"},
    {name:"Compute Supply",score:compute.score,icon:"🖥️",detail:"compute",info:"computeSupply",subtitle:"Dynamic · H100 pricing & scarcity premium"},
    {name:"Semiconductor Market",score:semis.score,icon:"💾",detail:"semis",info:"semiconductorMarket",subtitle:"Dynamic · 30D SOX momentum"},
    {name:"CAPEX Investment",score:x.capexScore,icon:"🏗️",detail:"capex",info:"capexInvestment",subtitle:"Locked v3 · AI infrastructure spending"},
    {name:"Commitment Overhang",score:commit.score,icon:"📜",detail:"commitment",info:"commitmentOverhangIndicator",subtitle:"Dynamic · future obligations & momentum"},
    {name:"Financing Conditions",score:fin.score,icon:"🏦",detail:"financing",info:"financingConditionsIndicator",subtitle:"Dynamic · credit, rates & financing burden"},
    {name:"Macro & Risk",score:macro.score,icon:"🌐",detail:"macro",info:"macroRisk",subtitle:"Dynamic · VIX, USDJPY & US 10Y"}
  ];
}

function renderIndicatorStrip(data) {
  const html = componentItems(data).map(item => {
    const n = toNum(item.score);
    const status = scoreStatus(n);
    const tone = statusTone(status);
    const riskColor = tone === "good" ? "#4ad18a" : tone === "watch" ? "#f7d94c" : tone === "warning" ? "#ff9d43" : "#ff5e6f";
    return `<button class="strip-item ${tone}" data-detail="${item.detail}" title="${escapeHtml(item.name)} · ${Number.isFinite(n)?formatNumber(n,1):"—"} · ${escapeHtml(status)}" aria-label="${escapeHtml(item.name)} ${escapeHtml(status)}">
      <span class="strip-icon">${item.icon}</span>
      <span class="strip-dot" style="background:${riskColor};color:${riskColor};box-shadow:0 0 12px ${riskColor}"></span>
    </button>`;
  }).join("");

  ["desktopIndicatorStrip","mobileIndicatorStrip"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

function renderIndicators(data) {
  const items = componentItems(data);

  let html = `<div class="indicator-row header"><div>Indicator</div><div>Score</div><div>Trend</div><div>Status</div></div>`;
  html += items.map(item => {
    const n = Number(item.score);
    const status = scoreStatus(n);
    const tone = statusTone(status);
    const dyn = data.dynamicScores?.[
      item.detail === "token" ? "tokenEconomics" :
      item.detail === "semis" ? "semiconductorMarket" :
      item.detail === "commitment" ? "commitmentOverhang" :
      item.detail === "financing" ? "financingConditions" :
      item.detail === "macro" ? "macroRisk" : ""
    ];
    const trend = dyn?.trend || "—";
    return `<div class="indicator-row indicator-row-clickable" role="button" tabindex="0" data-detail="${item.detail}" aria-label="Open ${escapeHtml(item.name)} deep dive">
      <div class="indicator-name-wrap"><span class="indicator-icon icon-${tone}">${item.icon}</span><div><div class="indicator-name">${escapeHtml(item.name)} <button class="info-btn indicator-info" data-info="${item.info}" aria-label="About ${escapeHtml(item.name)}">i</button><span class="indicator-chevron">›</span></div><span class="indicator-subtitle">${escapeHtml(item.subtitle)}</span></div></div>
      <div class="indicator-score ${tone}">${Number.isFinite(n)?formatNumber(n,1):"—"}</div>
      <div class="trend">${escapeHtml(trend)}</div>
      <div class="${tone}">${status}</div>
    </div>`;
  }).join("");

  document.getElementById("indicatorTable").innerHTML = html;
  renderIndicatorStrip(data);
}

function renderMobileDashboard(data) {
  const x=data.canary?.latest||{}, m=data.latestMarket||{}, tg=data.latestTokenGpu||{};
  const headline=data.dynamicHeadline?.available?data.dynamicHeadline:null;
  const score=toNum(headline?.score ?? x.canaryScore);
  setText("mobileCanaryScore",Number.isFinite(score)?Math.round(score):"—");
  setText("mobileCanaryStatus",headline?.status||x.status||scoreStatus(score));
  setText("mobileHedgeRead",`Hedge Read: ${headline?.hedgeRead||x.hedgeRead||"—"}`);
  setText("mobileSnapshotDate",x.week||"Latest");
  const needle=document.getElementById("mobileGaugeNeedle");
  if(needle&&Number.isFinite(score)) needle.style.setProperty("--needle-angle",`${-90+Math.max(0,Math.min(100,score))*1.8}deg`);
  const history=data.marketHistory||[];
  const hy=weeklyDelta(history,"hyOas");
  const signals=[
    ["SOX",m.sox?formatNumber(m.sox.value,0):"—",Number.isFinite(toNum(x.soxChange))?`${toNum(x.soxChange)>0?"↑":"↓"} ${formatPercent(Math.abs(toNum(x.soxChange)))}`:"—"],
    ["VIX",m.vix?formatNumber(m.vix.value,2):"—",Number.isFinite(toNum(x.vixChange))?`${toNum(x.vixChange)>0?"↑":"↓"} ${formatPercent(Math.abs(toNum(x.vixChange)))}`:"—"],
    ["US 10Y",m.us10y?`${formatNumber(m.us10y.value,2)}%`:"—",marketMonthChange("us10y","bps").text],
    ["HY OAS",m.hyOas?`${formatNumber(m.hyOas.value,2)}%`:"—",Number.isFinite(hy)?`${hy>0?"↑":"↓"} ${Math.abs(hy*100).toFixed(0)} bps · 1W`:"—"],
    ["H100",tg.H100_SD?`$${formatNumber(tg.H100_SD.value,2)}`:"—",tg.H100_SD&&Number.isFinite(toNum(tg.H100_SD["7dChange"]))?`${toNum(tg.H100_SD["7dChange"])>0?"↑":"↓"} ${formatPercent(Math.abs(toNum(tg.H100_SD["7dChange"])))}`:"—"],
    ["TOKEN",tg.TOKEN_SD?formatNumber(tg.TOKEN_SD.value,2):"—",tg.TOKEN_SD&&Number.isFinite(toNum(tg.TOKEN_SD["7dChange"]))?`${toNum(tg.TOKEN_SD["7dChange"])>0?"↑":"↓"} ${formatPercent(Math.abs(toNum(tg.TOKEN_SD["7dChange"])))}`:"—"]
  ];
  const sg=document.getElementById("mobileSignalGrid");
  if(sg) sg.innerHTML=signals.map(([label,value,change])=>`<div class="mobile-signal"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(change)}</small></div>`).join("");
  const items=componentItems(data).map(i=>[i.icon,i.name,i.score,i.detail]);
  const list=document.getElementById("mobileIndicatorList");
  if(list) list.innerHTML=items.map(([icon,name,val,key])=>{const n=toNum(val),st=scoreStatus(n),tone=statusTone(st);return `<button class="mobile-indicator ${tone}" data-detail="${key}"><span class="mobile-indicator-icon">${icon}</span><span class="mobile-indicator-name">${escapeHtml(name)}</span><strong>${Number.isFinite(n)?Math.round(n):"—"}</strong><small>${st}</small><b>›</b></button>`}).join("");
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
  "money-monetization":{icon:"↗",kicker:"AI MONEY CIRCLE · 5",title:"End Users & Monetization",subtitle:"The part of the loop that must ultimately justify the infrastructure buildout."},
  explain:{icon:"🐤",kicker:"AI CANARY · EXPLAIN",title:"How AI Canary works",subtitle:"Purpose, model logic, scoring and how to read the dashboard."}
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
  applyNorwegianCopy(drawer);
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
  const macro=dynamicScore(DATA,"macroRisk",x.macroScore);
  const compute=dynamicScore(DATA,"computeSupply",x.computeScore);
  const map={
    token:{score:toNum(dynamicScore(DATA,"tokenEconomics",x.tokenScore).score),status:dynamicScore(DATA,"tokenEconomics",x.tokenScore).status,label:"TOKEN ECONOMICS SCORE",meta:"Dynamic Google Sheet model"},
    demand:{score:toNum(x.demandScore),label:"AI DEMAND SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    compute:{score:toNum(compute.score),status:compute.status,label:"COMPUTE SUPPLY SCORE",meta:"Dynamic Google Sheet model · GPU utilization planned"},
    semis:{score:toNum(dynamicScore(DATA,"semiconductorMarket",x.semisScore).score),status:dynamicScore(DATA,"semiconductorMarket",x.semisScore).status,label:"SEMICONDUCTOR MARKET SCORE",meta:"Dynamic Google Sheet model · SOX momentum"},
    capex:{score:toNum(x.capexScore),label:"CAPEX INVESTMENT SCORE",meta:"Locked v3 baseline · dynamic model pending"},
    commitment:{score:toNum(commit.score),status:commit.status,label:"COMMITMENT OVERHANG SCORE",meta:"Dynamic Google Sheet model"},
    financing:{score:toNum(fin.score),status:fin.status,label:"FINANCING CONDITIONS SCORE",meta:"Dynamic Google Sheet model"},
    macro:{score:toNum(macro.score),status:macro.status,label:"MACRO & RISK SCORE",meta:"Dynamic Google Sheet model · headline Canary 41 remains locked"}
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
    case "explain": return explainDetailHtml();
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
    const clickable=c.detail?` detail-trigger-card money-theme-indicator`:"";
    const attrs=c.detail?` role="button" tabindex="0" data-detail="${escapeHtml(c.detail)}" aria-label="Open ${escapeHtml(c.label)} deep dive"`:"";
    const action=c.detail?`<span class="money-card-action">Open deep dive <b>→</b></span>`:"";
    return `<div class="connected-card metric-tone-${tone}${clickable}"${attrs}><div class="metric-card-top"><span>${escapeHtml(c.label)}</span>${scoreBadge}</div><strong>${escapeHtml(c.value ?? "—")}</strong><div class="metric-card-foot"><small>${escapeHtml(c.note || "")}</small>${trend}${locked}</div>${action}</div>`;
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

function commitmentUnitForRow(row) {
  const company=String(row?.company||"").trim().toLowerCase();
  const metric=String(row?.metric||"").trim().toLowerCase();
  const current=toNum(row?.currentValue);
  const sourceRows=(DATA?.commitments||[]).filter(x=>String(x.company||"").trim().toLowerCase()===company);
  if (!sourceRows.length) return "$bn";

  const exact=sourceRows.find(x=>{
    const v=toNum(x.value);
    const cat=String(x.category||"").trim().toLowerCase();
    return Number.isFinite(v) && Number.isFinite(current) && Math.abs(v-current)<0.02 && (!metric || !cat || metric.includes(cat) || cat.includes(metric));
  }) || sourceRows.find(x=>{
    const v=toNum(x.value);
    return Number.isFinite(v) && Number.isFinite(current) && Math.abs(v-current)<0.02;
  });
  return exact?.unit || "$bn";
}

function commitmentSourceMeta(row) {
  const company=String(row?.company||"").trim().toLowerCase();
  const current=toNum(row?.currentValue);
  const sourceRows=(DATA?.commitments||[]).filter(x=>String(x.company||"").trim().toLowerCase()===company);
  const exact=sourceRows.find(x=>{
    const v=toNum(x.value);
    return Number.isFinite(v) && Number.isFinite(current) && Math.abs(v-current)<0.02;
  });
  return exact || null;
}

function commitmentValueText(row) {
  const v=toNum(row?.currentValue);
  if (!Number.isFinite(v)) return "—";
  const unit=commitmentUnitForRow(row);
  if (String(unit).toLowerCase().includes("$bn")) return `$${formatNumber(v,1)}bn`;
  return `${formatNumber(v,1)} ${unit}`.trim();
}

function commitmentPeriodText(row) {
  const curr=String(row?.currentDate||"").slice(0,10);
  const prev=String(row?.previousDate||"").slice(0,10);
  if (!curr && !prev) return "—";
  const f=s=>{
    if (!s) return "—";
    const d=new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime())?s:d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"});
  };
  return `${f(prev)} → ${f(curr)}`;
}

function commitmentScoreBuildHtml(avg,breadthScore,finalScore,elevated,total) {
  const avgContribution=Number.isFinite(avg)?avg*0.70:NaN;
  const breadthContribution=Number.isFinite(breadthScore)?breadthScore*0.30:NaN;
  return `<div class="score-build">
    <div class="score-build-row">
      <div><span>Average company risk</span><small>Average Composite Risk across modeled companies</small></div>
      <strong>${Number.isFinite(avg)?formatNumber(avg,1):"—"}</strong>
      <em>× 70%</em>
      <b>${Number.isFinite(avgContribution)?formatNumber(avgContribution,1):"—"}</b>
    </div>
    <div class="score-build-row">
      <div><span>Breadth score</span><small>${Number.isFinite(elevated)&&Number.isFinite(total)?`${elevated} of ${total} companies above 50 · >75% breadth = score 100`:"Fixed buckets: ≤25%=20 · ≤50%=40 · ≤75%=70 · >75%=100"}</small></div>
      <strong>${Number.isFinite(breadthScore)?formatNumber(breadthScore,0):"—"}</strong>
      <em>× 30%</em>
      <b>${Number.isFinite(breadthContribution)?formatNumber(breadthContribution,1):"—"}</b>
    </div>
    <div class="score-build-total">
      <span>Commitment Overhang</span>
      <strong>${Number.isFinite(finalScore)?formatNumber(finalScore,1):"—"}</strong>
      <small>${Number.isFinite(avgContribution)&&Number.isFinite(breadthContribution)?`${formatNumber(avgContribution,1)} + ${formatNumber(breadthContribution,1)}`:"Dynamic model"}</small>
    </div>
  </div>`;
}

function commitmentCompanyTable(rows) {
  if (!rows.length) return `<div class="detail-empty">No connected company rows yet.</div>`;
  const body=rows.map(r=>{
    const risk=toNum(r.compositeRisk);
    const change=toNum(r.change);
    const revPct=toNum(r.commitmentRevenue);
    const scale=toNum(r.scaleScore), momentum=toNum(r.momentumScore), binding=toNum(r.bindingScore);
    const source=commitmentSourceMeta(r);
    const type=String(r.commitmentType||source?.category||"—").replaceAll("_"," ");
    const status=r.status || scoreStatus(risk);
    const tone=statusTone(status);
    return `<details class="commitment-company-row">
      <summary>
        <span class="company-name">${escapeHtml(r.company||"—")}</span>
        <span class="company-risk ${tone}">${Number.isFinite(risk)?formatNumber(risk,1):"—"}</span>
        <span class="company-value">${escapeHtml(commitmentValueText(r))}</span>
        <span class="company-change ${Number.isFinite(change)?(change>0?"risk-up":change<0?"risk-down":"flat"):"flat"}">${Number.isFinite(change)?formatSignedPercent(change):"—"}</span>
        <span class="company-period">${escapeHtml(commitmentPeriodText(r))}</span>
        <span class="company-revenue">${Number.isFinite(revPct)?formatPercent(revPct):"—"}</span>
        <span class="company-type">${escapeHtml(type)}</span>
        <span class="row-action">Details <span class="row-chevron">⌄</span></span>
      </summary>
      <div class="company-risk-detail">
        <div class="company-detail-title">Why ${escapeHtml(r.company||"this company")} scores ${Number.isFinite(risk)?formatNumber(risk,1):"—"}</div>
        <div class="company-risk-explain">
          <div><span>Scale score · 40%</span><strong>${Number.isFinite(scale)?formatNumber(scale,0):"—"}</strong><small>${Number.isFinite(scale)?`${formatNumber(scale,0)} × 40% = ${formatNumber(scale*.40,1)}`:"Commitment / TTM revenue"}</small></div>
          <div><span>Momentum score · 35%</span><strong>${Number.isFinite(momentum)?formatNumber(momentum,0):"—"}</strong><small>${Number.isFinite(momentum)?`${formatNumber(momentum,0)} × 35% = ${formatNumber(momentum*.35,1)}`:"Comparable-period change"}</small></div>
          <div><span>Binding score · 25%</span><strong>${Number.isFinite(binding)?formatNumber(binding,0):"—"}</strong><small>${Number.isFinite(binding)?`${formatNumber(binding,0)} × 25% = ${formatNumber(binding*.25,1)}`:"Obligation rigidity"}</small></div>
          <div class="composite-box"><span>Composite risk</span><strong>${Number.isFinite(risk)?formatNumber(risk,1):"—"}</strong><small>${Number.isFinite(scale)&&Number.isFinite(momentum)&&Number.isFinite(binding)?`${formatNumber(scale*.40,1)} + ${formatNumber(momentum*.35,1)} + ${formatNumber(binding*.25,1)} · ${escapeHtml(status)}`:escapeHtml(status)}</small></div>
        </div>
        <div class="company-detail-meta">
          <span><b>Metric:</b> ${escapeHtml(r.metric||source?.category||"—")}</span>
          <span><b>TTM revenue:</b> ${Number.isFinite(toNum(r.ttmRevenue))?`$${formatNumber(toNum(r.ttmRevenue),1)}bn`:"—"} · denominator used for Scale Score</span>
          <span><b>Current / previous:</b> ${escapeHtml(commitmentValueText(r))} / ${Number.isFinite(toNum(r.previousValue))?`$${formatNumber(toNum(r.previousValue),1)}bn`:"—"}</span>
          <span><b>Comparison:</b> ${escapeHtml(commitmentPeriodText(r))}</span>
        </div>
      </div>
    </details>`;
  }).join("");

  return `<div class="commitment-model-table">
    <div class="commitment-table-head">
      <span>Company</span><span>Risk</span><span>Commitment</span><span>Change</span><span>Period</span><span>% Revenue</span><span>Type</span><span></span>
    </div>
    ${body}
    <div class="commitment-table-note">Select a company row to see Scale, Momentum and Binding scores behind its Composite Risk.</div>
  </div>`;
}

function commitmentMethodologyHtml() {
  return `<div class="methodology-grid">
    <div><strong>Scale Score · 40%</strong><span>Commitment / TTM revenue is bucketed: &lt;10%=10, &lt;25%=25, &lt;50%=40, &lt;100%=60, &lt;200%=80, ≥200%=100.</span></div>
    <div><strong>Momentum Score · 35%</strong><span>Comparable-period change is bucketed: ≤−20%=0, ≤0%=10, ≤10%=20, ≤25%=40, ≤50%=60, ≤100%=80, &gt;100%=100.</span></div>
    <div><strong>Binding Score · 25%</strong><span>Model input for how rigid/binding the disclosed obligation type is. It is combined with Scale and Momentum rather than treated as a dollar measure.</span></div>
    <div><strong>Composite + Breadth</strong><span>Company risk = 40% Scale + 35% Momentum + 25% Binding. Headline Commitment Overhang = 70% average company risk + 30% Breadth Score. Breadth buckets are ≤25%=20, ≤50%=40, ≤75%=70, &gt;75%=100.</span></div>
  </div>`;
}

function commitmentDetailHtml() {
  const s=DATA.commitmentMomentum?.summary || {};
  const rows=(DATA.commitmentMomentum?.rows || []).filter(r=>r.company && Number.isFinite(toNum(r.compositeRisk)));
  const avg=summaryValue(s,"averageCompanyRisk"), breadth=summaryValue(s,"breadth"), elevated=summaryValue(s,"companiesAbove50"), total=summaryValue(s,"totalCompanies");
  const breadthScore=summaryValue(s,"breadthScore");
  const dynamic=dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore);
  const finalScore=toNum(dynamic.score);
  const trend=riskTrendForRows(rows);
  const cards=metricCards([
    {label:"Average company risk",value:Number.isFinite(avg)?formatNumber(avg,1):"—",note:"70% of headline score",riskScore:avg,trend:trend.text,trendTone:trend.tone},
    {label:"Breadth",value:Number.isFinite(breadth)?formatPercent(breadth):"—",note:Number.isFinite(elevated)&&Number.isFinite(total)?`${elevated}/${total} above 50`:"Share with elevated risk"},
    {label:"Breadth score",value:Number.isFinite(breadthScore)?formatNumber(breadthScore,0):"—",note:Number.isFinite(breadth)&&breadth>.75?">75% breadth → score 100":"30% of headline score",riskScore:breadthScore}
  ]);

  return sectionHtml("WHY IT MATTERS","Large and binding obligations become more dangerous when they grow faster than the revenue base and appear across many companies.",cards)
    + sectionHtml("HOW THE 76 IS BUILT","The headline Commitment Overhang score is calculated directly from the dynamic Google Sheet model — not entered manually.",commitmentScoreBuildHtml(avg,breadthScore,finalScore,elevated,total))
    + sectionHtml("COMPANY RISK MAP","Dollar values are shown with units, change is tied to the actual comparison period, and commitment size is normalized against TTM revenue. Open any company row to see the three sub-scores behind Composite Risk.",commitmentCompanyTable(rows))
    + sectionHtml("MODEL LOGIC","The exact Google Sheet transformation is shown below. Company Composite Risk uses 40% Scale + 35% Momentum + 25% Binding; the headline then combines average company risk and breadth.",commitmentMethodologyHtml())
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">High commitment pressure is broad, not just large in dollar terms.</div><p>The current danger signal comes from both elevated company-level risk and breadth across the group. The key confirmation question is whether demand, utilization and monetization remain strong enough to absorb these fixed obligations without creating financing stress.</p></section>`
    + sectionHtml("DATA & EVIDENCE","Commitment_Momentum provides the live risk transformation; Commitments provides the underlying accounting series and units. RPO/backlog stays in Demand and is not mixed into commitment obligations.",sourceNote("Live API-connected · dynamic score · accounting/company data is semi-automatic"));
}

function financingGroupLabel(group) {
  const map={GENERAL_FINANCING:"General financing",AI_CREDIT_STRESS:"AI credit stress",COMPANY_FINANCING:"Company burden"};
  return map[group] || String(group||"Financing").replaceAll("_"," ");
}

function financingValueText(row) {
  const v=toNum(row?.currentValue);
  if (!Number.isFinite(v)) return "—";
  const unit=String(row?.unit||"").trim();
  const group=String(row?.signalGroup||"");
  // Market yields/OAS are stored as percentage points (4.95 means 4.95%).
  // Company ratios are stored as decimals (0.4238 means 42.38%).
  if (unit==="%") return group==="GENERAL_FINANCING" ? `${formatNumber(v,2)} %` : formatPercent(v);
  if (unit.toLowerCase()==="bp") return `${formatNumber(v,0)} bp`;
  return `${formatNumber(v,2)} ${unit}`.trim();
}

function financingPreviousText(row) {
  const v=toNum(row?.previousValue);
  if (!Number.isFinite(v)) return "—";
  const unit=String(row?.unit||"").trim();
  const group=String(row?.signalGroup||"");
  if (unit==="%") return group==="GENERAL_FINANCING" ? `${formatNumber(v,2)} %` : formatPercent(v);
  if (unit.toLowerCase()==="bp") return `${formatNumber(v,0)} bp`;
  return `${formatNumber(v,2)} ${unit}`.trim();
}

function financingChangeText(row) {
  const change=toNum(row?.change);
  if (!Number.isFinite(change)) return "—";
  const group=String(row?.signalGroup||"");
  const unit=String(row?.unit||"").trim();
  const cur=toNum(row?.currentValue), prev=toNum(row?.previousValue);
  if (group==="GENERAL_FINANCING" && unit==="%" && Number.isFinite(cur) && Number.isFinite(prev)) {
    const bps=(cur-prev)*100;
    const bpText=`${bps>0?"+":bps<0?"−":""}${formatNumber(Math.abs(bps),0)} bp`;
    return `${bpText} · ${formatSignedPercent(change)}`;
  }
  return formatSignedPercent(change);
}

function shortDateText(value) {
  const s=String(value||"").slice(0,10);
  if (!s) return "—";
  const d=new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"});
}

function financingComparisonText(row) {
  const group=String(row?.signalGroup||"");
  const metric=String(row?.metric||"");
  const entity=String(row?.entityMarket||"");

  if (group==="GENERAL_FINANCING") return "~1Y comparison";

  if (group==="AI_CREDIT_STRESS") {
    const source=(DATA?.financing||[])
      .filter(x=>String(x.entityMarket||"")===entity && String(x.signalGroup||"")==="AI_CREDIT_STRESS" && String(x.unit||"").toLowerCase()==="bp")
      .filter(x=>Number.isFinite(toNum(x.value)) && x.date)
      .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    if (source.length>=2) return `${shortDateText(source[1].date)} → ${shortDateText(source[0].date)}`;
  }

  if (group==="COMPANY_FINANCING") {
    const dates=[...new Set((DATA?.companyFinancials||[])
      .filter(x=>String(x.company||"")===entity && ["Net interest expense","Adjusted EBITDA"].includes(String(x.metric||"")) && x.date)
      .map(x=>String(x.date).slice(0,10)))].sort().reverse();
    if (dates.length>=2) return `${shortDateText(dates[1])} → ${shortDateText(dates[0])}`;
  }
  return Number.isFinite(toNum(row?.change)) ? "Previous comparable observation" : "—";
}

function financingScoreBuildHtml(general,ai,burden,finalScore) {
  const parts=[
    {label:"General financing",score:general,weight:.30,note:"Nominal + real 10Y, IG/HY credit"},
    {label:"AI credit stress",score:ai,weight:.45,note:"AI-linked 5Y CDS"},
    {label:"Company burden",score:burden,weight:.25,note:"Interest expense / Adj. EBITDA"}
  ];
  return `<div class="score-build finance-score-build">${parts.map(x=>{
    const c=Number.isFinite(x.score)?x.score*x.weight:NaN;
    return `<div class="score-build-row"><div><span>${escapeHtml(x.label)}</span><small>${escapeHtml(x.note)}</small></div><strong>${Number.isFinite(x.score)?formatNumber(x.score,1):"—"}</strong><em>× ${Math.round(x.weight*100)}%</em><b>${Number.isFinite(c)?formatNumber(c,1):"—"}</b></div>`;
  }).join("")}<div class="score-build-total"><span>Financing Conditions</span><strong>${Number.isFinite(finalScore)?formatNumber(finalScore,1):"—"}</strong><small>${parts.every(x=>Number.isFinite(x.score))?parts.map(x=>formatNumber(x.score*x.weight,1)).join(" + "):"Dynamic model"}</small></div></div>`;
}

function financingSignalTable(rows) {
  if (!rows.length) return `<div class="detail-empty">No connected financing signals yet.</div>`;
  return `<div class="financing-model-table">
    <div class="financing-table-head"><span>Group</span><span>Signal</span><span>Latest</span><span>Change</span><span>Comparison</span><span>Risk</span><span></span></div>
    ${rows.map((r,i)=>{
      const risk=toNum(r.compositeRisk), change=toNum(r.change), level=toNum(r.levelScore), momentum=toNum(r.momentumScore), breadth=toNum(r.breadthBurdenScore);
      const status=r.status || scoreStatus(risk), tone=statusTone(status);
      const hasThird=Number.isFinite(breadth);
      const levelWeight=hasThird?.50:.80, momentumWeight=hasThird?.30:.20, thirdWeight=hasThird?.20:0;
      const thirdLabel=String(r.signalGroup||"")==="COMPANY_FINANCING"?"Burden / breadth":"Breadth score";
      return `<details class="financing-signal-row" ${i===0?"":""}>
        <summary>
          <span class="finance-group">${escapeHtml(financingGroupLabel(r.signalGroup))}</span>
          <span class="finance-signal"><b>${escapeHtml(r.entityMarket||"")}</b><small>${escapeHtml(r.metric||"")}</small></span>
          <span class="finance-latest">${escapeHtml(financingValueText(r))}</span>
          <span class="finance-change ${Number.isFinite(change)?(change>0?"risk-up":change<0?"risk-down":"flat"):"flat"}">${escapeHtml(financingChangeText(r))}</span>
          <span class="finance-period">${escapeHtml(financingComparisonText(r))}</span>
          <span class="company-risk ${tone}">${Number.isFinite(risk)?formatNumber(risk,1):"—"}</span>
          <span class="row-action">Details <span class="row-chevron">⌄</span></span>
        </summary>
        <div class="company-risk-detail finance-risk-detail">
          <div class="company-detail-title">Why ${escapeHtml(r.entityMarket||r.metric||"this signal")} scores ${Number.isFinite(risk)?formatNumber(risk,1):"—"}</div>
          <div class="company-risk-explain finance-risk-explain">
            <div><span>Level score · ${Math.round(levelWeight*100)}%</span><strong>${Number.isFinite(level)?formatNumber(level,0):"—"}</strong><small>${Number.isFinite(level)?`${formatNumber(level,0)} × ${Math.round(levelWeight*100)}% = ${formatNumber(level*levelWeight,1)}`:"Current level"}</small></div>
            <div><span>Momentum score · ${Math.round(momentumWeight*100)}%</span><strong>${Number.isFinite(momentum)?formatNumber(momentum,0):"—"}</strong><small>${Number.isFinite(momentum)?`${formatNumber(momentum,0)} × ${Math.round(momentumWeight*100)}% = ${formatNumber(momentum*momentumWeight,1)}`:"Change vs prior"}</small></div>
            ${hasThird?`<div><span>${escapeHtml(thirdLabel)} · ${Math.round(thirdWeight*100)}%</span><strong>${formatNumber(breadth,0)}</strong><small>${formatNumber(breadth,0)} × ${Math.round(thirdWeight*100)}% = ${formatNumber(breadth*thirdWeight,1)}</small></div>`:""}
            <div class="composite-box"><span>Composite risk</span><strong>${Number.isFinite(risk)?formatNumber(risk,1):"—"}</strong><small>${Number.isFinite(risk)?`${[Number.isFinite(level)?level*levelWeight:0,Number.isFinite(momentum)?momentum*momentumWeight:0,hasThird?breadth*thirdWeight:0].filter((_,idx)=>idx<2||hasThird).map(v=>formatNumber(v,1)).join(" + ")} · ${status}`:status}</small></div>
          </div>
          <div class="company-detail-meta finance-detail-meta">
            <span><b>Current / previous:</b> ${escapeHtml(financingValueText(r))} / ${escapeHtml(financingPreviousText(r))}</span>
            <span><b>Comparison:</b> ${escapeHtml(financingComparisonText(r))}</span>
            <span><b>Change:</b> ${escapeHtml(financingChangeText(r))}</span>
            <span><b>Metric:</b> ${escapeHtml(r.metric||"—")}</span>
            <span><b>Group:</b> ${escapeHtml(financingGroupLabel(r.signalGroup))}</span>
          </div>
        </div>
      </details>`;
    }).join("")}
    <div class="commitment-table-note">Open a signal to see the exact level, momentum and breadth/burden transformation behind Composite Risk.</div>
  </div>`;
}

function financingMethodologyHtml() {
  return `<div class="methodology-grid financing-methodology">
    <div><span>GENERAL FINANCING</span><strong>Weighted blend of 4 broad signals</strong><small>25% nominal US 10Y + 25% real US 10Y + 20% IG OAS + 30% HY OAS. Each row first combines level, momentum and shared breadth.</small></div>
    <div><span>AI CREDIT STRESS</span><strong>Average of AI-linked CDS</strong><small>5Y CDS is treated as a credit-stress market signal, not as a precise default probability.</small></div>
    <div><span>COMPANY BURDEN</span><strong>Company-specific pressure</strong><small>Current model uses CoreWeave net interest expense relative to Adjusted EBITDA.</small></div>
    <div><span>HEADLINE WEIGHTS</span><strong>30% · 45% · 25%</strong><small>General Financing · AI Credit Stress · Company Financing Burden.</small></div>
    <div><span>ROW MODEL WITH BREADTH</span><strong>50% · 30% · 20%</strong><small>Level · Momentum · Breadth/Burden score. General-financing breadth currently measures how many of the 4 broad signals have Level Score ≥50.</small></div>
    <div><span>ROW MODEL WITHOUT BREADTH</span><strong>80% · 20%</strong><small>Level · Momentum. Used when no third score is populated.</small></div>
  </div>`;
}

function financingDetailHtml() {
  const s=DATA.financingMomentum?.summary || {};
  const financingSortRank=(r)=>{
    const group=String(r?.signalGroup||"").trim().toUpperCase();
    const metric=String(r?.metric||"").trim().toLowerCase();
    if(group==="GENERAL_FINANCING") {
      if(metric.includes("nominal") || metric.includes("10y nominal")) return 10;
      if(metric.includes("real yield") || metric.includes("10y real")) return 20;
      if(metric.includes("ig oas")) return 30;
      if(metric.includes("hy oas")) return 40;
      return 49;
    }
    if(group==="AI_CREDIT_STRESS") return 60;
    if(group==="COMPANY_FINANCING") return 80;
    return 99;
  };
  const rows=(DATA.financingMomentum?.rows || [])
    .filter(r=>r.signalGroup && Number.isFinite(toNum(r.compositeRisk)))
    .map((r,i)=>({...r,__sourceOrder:i}))
    .sort((a,b)=>financingSortRank(a)-financingSortRank(b) || a.__sourceOrder-b.__sourceOrder);
  const general=summaryValue(s,"generalFinancingScore"), ai=summaryValue(s,"aiCreditStressScore"), burden=summaryValue(s,"companyFinancingBurden");
  const headline=summaryValue(s,"financingConditions");
  const finalScore=Number.isFinite(headline)?headline:((Number.isFinite(general)&&Number.isFinite(ai)&&Number.isFinite(burden))?general*.30+ai*.45+burden*.25:NaN);
  const generalRows=rows.filter(r=>r.signalGroup==="GENERAL_FINANCING"), aiRows=rows.filter(r=>r.signalGroup==="AI_CREDIT_STRESS"), burdenRows=rows.filter(r=>r.signalGroup==="COMPANY_FINANCING");
  const gt=riskTrendForRows(generalRows), at=riskTrendForRows(aiRows), bt=riskTrendForRows(burdenRows);
  const cards=metricCards([
    {label:"General financing",value:fmtScore(general),note:"30% of headline score",riskScore:general,trend:gt.text,trendTone:gt.tone},
    {label:"AI credit stress",value:fmtScore(ai),note:"45% of headline score",riskScore:ai,trend:at.text,trendTone:at.tone},
    {label:"Company burden",value:fmtScore(burden),note:"25% of headline score",riskScore:burden,trend:bt.text,trendTone:bt.tone}
  ]);
  return sectionHtml("WHY IT MATTERS","Financing can break an investment cycle before end demand disappears. Canary separates broad funding conditions from AI-specific credit stress and company-level interest burden.",cards)
    + sectionHtml("HOW THE SCORE IS BUILT","The headline Financing Conditions score is calculated directly from the dynamic Google Sheet model — not entered manually.",financingScoreBuildHtml(general,ai,burden,finalScore))
    + sectionHtml("FINANCING RISK MAP","The underlying signals below show current value, comparison context and Composite Risk. For yields and OAS, change is shown in basis points plus the relative % change used by Momentum Score. General-financing comparisons use the latest observation versus the latest available observation at least ~365 days earlier.",financingSignalTable(rows))
    + sectionHtml("MODEL LOGIC","The exact model has two layers: each underlying financing signal is scored first, then the three group scores are combined into the headline Financing Conditions score.",financingMethodologyHtml())
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">AI-specific credit stress is doing most of the damage.</div><p>Broad IG/HY credit remains relatively calm, while AI-linked CDS is much more stressed. That divergence is useful because localized financing pressure can appear before the broader corporate credit market deteriorates.</p></section>`
    + sectionHtml("DATA & EVIDENCE","Market rates and broad spreads come from MarketHistory; AI credit observations come from Financing; company burden comes from Company_Financials. CDS is a market stress indicator and is not presented as a direct default probability.",sourceNote("Live API-connected · dynamic score · company/credit observations can be semi-automatic"));
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

function computeRow(metricName) {
  const rows=DATA.computeMomentum?.rows || [];
  return rows.find(r=>String(r.metric||"").trim().toLowerCase()===String(metricName||"").trim().toLowerCase()) || {};
}

function computeScoreBuildHtml(broad, guaranteed, premium, finalScore) {
  const parts=[
    {label:"H100 Broad Rental 30D Trend",score:toNum(broad.riskScore),weight:toNum(broad.weight),weighted:toNum(broad.weightedScore),note:"Silicon Data · broad H100 rental market"},
    {label:"H100 Guaranteed 30D Trend",score:toNum(guaranteed.riskScore),weight:toNum(guaranteed.weight),weighted:toNum(guaranteed.weightedScore),note:"CCIR · guaranteed neocloud H100"},
    {label:"Guaranteed Premium",score:toNum(premium.riskScore),weight:toNum(premium.weight),weighted:toNum(premium.weightedScore),note:"Guaranteed rate versus broad rental market"}
  ];
  return `<div class="score-build compute-score-build">
    ${parts.map(p=>`<div class="score-build-row"><div><span>${escapeHtml(p.label)}</span><small>${escapeHtml(p.note)}</small></div><strong>${Number.isFinite(p.score)?formatNumber(p.score,1):"—"}</strong><em>${Number.isFinite(p.weight)?`× ${formatPercent(p.weight)}`:"—"}</em><b>${Number.isFinite(p.weighted)?formatNumber(p.weighted,2):"—"}</b></div>`).join("")}
    <div class="score-build-total"><span>Compute Supply</span><strong>${Number.isFinite(finalScore)?formatNumber(finalScore,2):"—"}</strong><small>${parts.every(p=>Number.isFinite(p.weighted))?parts.map(p=>formatNumber(p.weighted,2)).join(" + "):"Dynamic model"}</small></div>
  </div>`;
}

function computeMethodologyHtml() {
  return `<div class="methodology-grid compute-methodology">
    <div><strong>Broad H100 rental trend · 45%</strong><span>Tracks the broad Silicon Data H100 rental price index. Falling prices raise oversupply risk; stable or rising prices lower it. The target comparison is 30 days, with the oldest available observation used temporarily until the series has sufficient history.</span></div>
    <div><strong>Guaranteed H100 trend · 30%</strong><span>Tracks CCIR guaranteed neocloud H100 pricing over roughly 30 days. Rising guaranteed pricing is interpreted as evidence that dependable capacity still carries value.</span></div>
    <div><strong>Guaranteed premium · 25%</strong><span>Measures the premium of guaranteed H100 capacity over the broad rental market. A high premium points to continuing scarcity/value of secured capacity; a collapsing premium raises oversupply risk.</span></div>
    <div><strong>Planned utilization upgrade</strong><span>GPU utilization, capacity availability and forward supply growth are explicitly excluded from the current score until robust comparable data is connected.</span></div>
  </div>`;
}

function computeDetailHtml() {
  const dyn=dynamicScore(DATA,"computeSupply",DATA.canary?.latest?.computeScore);
  const broad=computeRow("H100 Broad Rental 30D Trend");
  const guaranteed=computeRow("H100 Guaranteed 30D Trend");
  const premium=computeRow("Guaranteed Premium");

  const broadCurrent=toNum(broad.currentValue), broadPrevious=toNum(broad.previousValue), broadChange=toNum(broad.change), broadRisk=toNum(broad.riskScore);
  const guaranteedCurrent=toNum(guaranteed.currentValue), guaranteedPrevious=toNum(guaranteed.previousValue), guaranteedChange=toNum(guaranteed.change), guaranteedRisk=toNum(guaranteed.riskScore);
  const premiumCurrent=toNum(premium.currentValue), premiumPrevious=toNum(premium.previousValue), premiumChange=toNum(premium.change), premiumRisk=toNum(premium.riskScore);
  const finalScore=toNum(dyn.score);

  return sectionHtml("WHY IT MATTERS","Compute Supply asks whether the rapid buildout of AI accelerator capacity is still being absorbed. Risk rises when rental pricing weakens, guaranteed-capacity pricing softens and the scarcity premium disappears.",metricCards([
      {label:"Broad H100 Rental",value:Number.isFinite(broadCurrent)?`$${formatNumber(broadCurrent,2)} / GPU-h`:"—",note:Number.isFinite(broadChange)?`${formatSignedPercent(broadChange)} vs comparison`:"Silicon Data",riskScore:broadRisk,trend:String(broad.trend||"")},
      {label:"Guaranteed H100",value:Number.isFinite(guaranteedCurrent)?`$${formatNumber(guaranteedCurrent,2)} / GPU-h`:"—",note:Number.isFinite(guaranteedChange)?`${formatSignedPercent(guaranteedChange)} vs ~30D`:"CCIR",riskScore:guaranteedRisk,trend:String(guaranteed.trend||"")},
      {label:"Guaranteed Premium",value:Number.isFinite(premiumCurrent)?formatPercent(premiumCurrent):"—",note:Number.isFinite(premiumPrevious)?`Previously ${formatPercent(premiumPrevious)}`:"Guaranteed vs broad",riskScore:premiumRisk,trend:String(premium.trend||"")}
    ]))
    + sectionHtml("HOW THE SCORE IS BUILT","The dynamic score is calculated in Compute_Momentum. The website only displays the spreadsheet model; it does not recreate or override the score.",computeScoreBuildHtml(broad,guaranteed,premium,finalScore))
    + sectionHtml("UNDERLYING DATA","The current model separates market price direction from market structure.",metricCards([
      {label:"Broad previous",value:Number.isFinite(broadPrevious)?`$${formatNumber(broadPrevious,2)}`:"—",note:"Comparison observation"},
      {label:"Guaranteed previous",value:Number.isFinite(guaranteedPrevious)?`$${formatNumber(guaranteedPrevious,2)}`:"—",note:"~30D comparison"},
      {label:"Premium change",value:Number.isFinite(premiumChange)?formatSignedPercent(premiumChange):"—",note:Number.isFinite(toNum(premium.levelStructure))?`Current spread $${formatNumber(toNum(premium.levelStructure),2)}`:"Change in scarcity premium"}
    ]))
    + sectionHtml("MODEL LOGIC","A falling broad rental price is not automatically bearish. It becomes more concerning when guaranteed pricing also weakens and the premium for secured capacity collapses. Conversely, rising guaranteed pricing and a healthy premium can indicate continuing scarcity even if broad rental pricing is flat or slightly lower.",computeMethodologyHtml())
    + sectionHtml("PLANNED INPUTS","These inputs are documented in Compute_Momentum but currently carry zero weight.",`<div class="utilization-empty compact-empty"><div class="empty-grid"></div><div class="empty-content"><strong>GPU Utilization · Capacity / Availability · Forward Supply Growth</strong><span>Planned for a later model version after stable, comparable data sources are selected. No utilization value is inferred or fabricated today.</span></div></div>`)
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">Current compute pricing does not show a clear oversupply warning.</div><p>Broad H100 rental pricing is roughly flat/slightly lower, while guaranteed pricing is higher and the guaranteed premium has widened materially. The current model therefore reads ${Number.isFinite(finalScore)?`${formatNumber(finalScore,2)} · ${escapeHtml(scoreStatus(finalScore))}`:"as a dynamic spreadsheet score"}. This is a pricing-and-scarcity signal, not yet a utilization signal.</p></section>`
    + sectionHtml("DATA & EVIDENCE","Broad H100 rental data comes from Silicon Data; guaranteed H100 pricing comes from CCIR. Both are read from Token_GPU into Compute_Momentum, where the score is calculated.",sourceNote("Connected · pricing model live · utilization inputs planned"));
}

function tokenRow(metricName) {
  const rows=DATA.tokenMomentumDetail?.rows || [];
  return rows.find(r=>String(r.metric||"").trim().toLowerCase()===String(metricName||"").trim().toLowerCase()) || {};
}

function tokenTrillions(v) {
  const n=toNum(v);
  return Number.isFinite(n)?`${formatNumber(n/1e12,2)}T`:"—";
}

function tokenScoreBuildHtml(volumeScore,drawdownScore,volumeChange,finalScore) {
  const moderation=Number.isFinite(volumeChange)?(1-Math.min(.50,Math.max(0,volumeChange-.10))):NaN;
  const adjustedExp=Number.isFinite(drawdownScore)&&Number.isFinite(moderation)?drawdownScore*moderation:NaN;
  const volumeContribution=Number.isFinite(volumeScore)?volumeScore*.60:NaN;
  const expenditureContribution=Number.isFinite(adjustedExp)?adjustedExp*.40:NaN;
  const moderationPct=Number.isFinite(moderation)?(1-moderation):NaN;

  return `<div class="score-build token-score-build">
    <div class="score-build-row">
      <div><span>Volume Momentum</span><small>Current 30D average vs previous non-overlapping 30D average</small></div>
      <strong>${Number.isFinite(volumeScore)?formatNumber(volumeScore,2):"—"}</strong>
      <em>× 60%</em>
      <b>${Number.isFinite(volumeContribution)?formatNumber(volumeContribution,2):"—"}</b>
    </div>
    <div class="score-build-row token-adjust-row">
      <div><span>Expenditure drawdown</span><small>${Number.isFinite(moderationPct)?`Strong volume growth reduces this risk by ${formatPercent(moderationPct)} before weighting`:"Volume-growth moderation is applied before weighting"}</small></div>
      <strong>${Number.isFinite(drawdownScore)?formatNumber(drawdownScore,2):"—"}</strong>
      <em>${Number.isFinite(moderation)?`× ${formatPercent(moderation)} × 40%`:"adjust × 40%"}</em>
      <b>${Number.isFinite(expenditureContribution)?formatNumber(expenditureContribution,2):"—"}</b>
    </div>
    <div class="score-build-total">
      <span>Token Economics</span>
      <strong>${Number.isFinite(finalScore)?formatNumber(finalScore,1):"—"}</strong>
      <small>${Number.isFinite(volumeContribution)&&Number.isFinite(expenditureContribution)?`${formatNumber(volumeContribution,2)} + ${formatNumber(expenditureContribution,2)}`:"Dynamic model"}</small>
    </div>
  </div>`;
}

function tokenMethodologyHtml() {
  return `<div class="methodology-grid token-methodology">
    <div><strong>Volume Momentum · 60%</strong><span>30D average token volume is compared with the previous non-overlapping 30D average. Strong growth lowers risk; falling volume raises it.</span></div>
    <div><strong>Expenditure Drawdown · 40%</strong><span>Current LLM Token Expenditure Index is compared with the May peak used by the model. A large drawdown raises risk because monetization/expenditure per unit of usage has weakened.</span></div>
    <div><strong>Volume moderation</strong><span>When volume growth exceeds 10%, part of the expenditure-drawdown risk is discounted. The discount is capped at 50%, so strong usage can reduce — but never erase — expenditure pressure.</span></div>
    <div><strong>Interpretation</strong><span>Falling token cost is not automatically bearish. Lower cost can be healthy if it unlocks enough additional usage. Risk rises when lower expenditure is not matched by sufficiently strong volume/adoption growth.</span></div>
  </div>`;
}

function tokenDetailHtml() {
  const dyn=dynamicScore(DATA,"tokenEconomics",DATA.canary?.latest?.tokenScore);
  const tm=DATA.tokenMomentum || {};
  const t=(DATA.latestTokenGpu || {}).TOKEN_SD || {};

  const vol=tokenRow("30D Avg Token Volume");
  const exp=tokenRow("LLM Token Expenditure Index");
  const draw=tokenRow("Drawdown from May Peak");

  const volCurrent=toNum(vol.currentValue), volPrevious=toNum(vol.previousValue), volChange=toNum(vol.change), volScore=toNum(vol.score);
  const expCurrent=toNum(exp.currentValue), expPrevious=toNum(exp.previousValue), expChange=toNum(exp.change);
  const drawCurrent=toNum(draw.currentValue), drawPrevious=toNum(draw.previousValue), drawChange=toNum(draw.change), drawScore=toNum(draw.score);
  const finalScore=toNum(dyn.score);

  const verifiedStatus=String(t.verificationStatus||"").trim() || "MANUAL / ASSISTED";
  const tokenDate=String(t.date||"").trim();
  const sampleCountCurrent=30, sampleCountPrevious=30;

  return sectionHtml("WHY IT MATTERS","Token Economics asks whether AI usage is expanding fast enough to offset falling effective expenditure per token. A decline in unit economics is less worrying when it triggers much stronger usage; it becomes more concerning when monetization weakens without enough volume response.",metricCards([
      {label:"30D Token Volume",value:tokenTrillions(volCurrent),note:Number.isFinite(volChange)?`${formatSignedPercent(volChange)} vs previous 30D`:"Current 30D average",riskScore:volScore},
      {label:"Token Expenditure",value:Number.isFinite(expCurrent)?`$${formatNumber(expCurrent,2)} / 1M`:"—",note:Number.isFinite(expChange)?`${formatSignedPercent(expChange)} vs previous observation`:"Silicon Data"},
      {label:"Drawdown from May Peak",value:Number.isFinite(drawChange)?formatSignedPercent(drawChange):"—",note:Number.isFinite(drawPrevious)?`$${formatNumber(drawCurrent,2)} vs $${formatNumber(drawPrevious,2)}`:"Peak comparison",riskScore:drawScore}
    ]))
    + sectionHtml("HOW THE 15.2 IS BUILT","The score is calculated in Google Sheets. Volume receives 60% base weight. Expenditure drawdown receives 40%, but strong volume growth can reduce up to half of that drawdown risk before the 40% weight is applied.",tokenScoreBuildHtml(volScore,drawScore,volChange,finalScore))
    + sectionHtml("UNDERLYING DATA","The two scored drivers and the latest expenditure observation are shown separately so usage growth is not confused with price/expenditure economics.",`
      <div class="token-data-grid">
        <div class="token-data-card">
          <span>VOLUME MOMENTUM</span>
          <strong>${tokenTrillions(volCurrent)}</strong>
          <b>${Number.isFinite(volChange)?formatSignedPercent(volChange):"—"}</b>
          <small>Current 30D avg · ${sampleCountCurrent} observations<br>Previous ${tokenTrillions(volPrevious)} · ${sampleCountPrevious} observations</small>
        </div>
        <div class="token-data-card">
          <span>LLM TOKEN EXPENDITURE</span>
          <strong>${Number.isFinite(expCurrent)?`$${formatNumber(expCurrent,2)}`:"—"}</strong>
          <b>${Number.isFinite(expChange)?formatSignedPercent(expChange):"—"}</b>
          <small>${tokenDate?escapeHtml(tokenDate)+" · ":""}${escapeHtml(verifiedStatus)}<br>Previous ${Number.isFinite(expPrevious)?`$${formatNumber(expPrevious,2)}`:"—"} / 1M tokens</small>
        </div>
        <div class="token-data-card">
          <span>MAY-PEAK DRAWDOWN</span>
          <strong>${Number.isFinite(drawChange)?formatSignedPercent(drawChange):"—"}</strong>
          <b class="warning-text">Risk ${Number.isFinite(drawScore)?formatNumber(drawScore,1):"—"}</b>
          <small>Current ${Number.isFinite(drawCurrent)?`$${formatNumber(drawCurrent,2)}`:"—"} vs peak ${Number.isFinite(drawPrevious)?`$${formatNumber(drawPrevious,2)}`:"—"}</small>
        </div>
      </div>`)
    + sectionHtml("WHY FALLING TOKEN COST IS NOT AUTOMATICALLY BEARISH","AI inference gets cheaper as hardware, models and routing improve. That can expand usage dramatically. Canary therefore treats falling expenditure as a risk only in combination with the volume response: strong usage growth offsets part of the pressure, while weak or falling usage would make the same expenditure drawdown much more concerning.")
    + sectionHtml("MODEL LOGIC","The exact transformation used by Token_Momentum is summarized below.",tokenMethodologyHtml())
    + sectionHtml("DATA STATUS","OpenRouter token volume is AUTO and currently has complete 30 + 30 day comparison windows. Silicon Data TOKEN_SD is MANUAL / ASSISTED after the public page proved unreliable for fresh automated parsing; the latest verified observation is retained without allowing stale automatic data to overwrite it.",`
      <div class="token-source-status">
        <div><span>OpenRouter Token Volume</span><strong>AUTO</strong><small>30D vs previous 30D · daily observations</small></div>
        <div><span>Silicon Data TOKEN_SD</span><strong>${escapeHtml(verifiedStatus)}</strong><small>${tokenDate?`Latest ${escapeHtml(tokenDate)} · `:""}$${Number.isFinite(expCurrent)?formatNumber(expCurrent,2):"—"} / 1M tokens</small></div>
      </div>`)
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">Usage growth is currently overpowering the expenditure drawdown.</div><p>Token volume is up ${Number.isFinite(volChange)?formatPercent(volChange):"strongly"} on a 30D-versus-prior-30D basis, which keeps Token Economics in ${escapeHtml(dyn.status||scoreStatus(finalScore))} territory despite the large decline from the May expenditure peak.</p></section>`;
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

function semiRow(metricName) {
  const rows=DATA.semiMomentumDetail?.rows || [];
  return rows.find(r=>String(r.metric||"").trim().toLowerCase()===String(metricName||"").trim().toLowerCase()) || {};
}

function semisTrendSvg() {
  const rows=(DATA?.marketHistory||[]).filter(r=>Number.isFinite(toNum(r.sox))).slice(-52);
  if (rows.length < 2) return `<div class="detail-empty">SOX history is not available.</div>`;
  const values=rows.map(r=>toNum(r.sox));
  const min=Math.min(...values), max=Math.max(...values), span=(max-min)||1;
  const w=560,h=142,pad=10;
  const pts=values.map((v,i)=>{
    const x=pad+(i/(values.length-1))*(w-pad*2);
    const y=h-pad-((v-min)/span)*(h-pad*2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const first=rows[0]?.weekEnding||"";
  const last=rows[rows.length-1]?.weekEnding||"";
  return `<div class="semi-trend-card"><div class="semi-trend-head"><div><strong>SOX · LAST 52 WEEKS</strong><small>${escapeHtml(String(first))} → ${escapeHtml(String(last))}</small></div><b>${formatNumber(values[values.length-1],0)}</b></div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="SOX 52 week trend"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="semi-trend-range"><span>Low ${formatNumber(min,0)}</span><span>High ${formatNumber(max,0)}</span></div></div>`;
}

function semisDetailHtml() {
  const m=DATA.latestMarket || {}, x=DATA.canary?.latest||{};
  const sox=m.sox||{};
  const dyn=dynamicScore(DATA,"semiconductorMarket",x.semisScore);
  const row=semiRow("30D Avg SOX");
  const current=toNum(row.currentValue);
  const previous=toNum(row.previousValue);
  const change=toNum(row.change);
  const risk=toNum(row.score);
  const finalScore=toNum(dyn.score);
  const trend=String(row.trend||DATA.semiMomentum?.trend||"→");
  const status=dyn.status||scoreStatus(finalScore);
  const contributionText=Number.isFinite(change)?`50 − (${formatPercent(change)} × 500)`:`50 − (30D momentum × 500)`;

  return sectionHtml("WHY IT MATTERS","Semiconductors are a fast market checkpoint on AI infrastructure expectations. Persistent SOX weakness can signal falling expectations for the AI investment cycle before company fundamentals fully reflect the slowdown.",metricCards([
      {label:"SOX",value:Number.isFinite(toNum(sox.value))?formatNumber(sox.value,0):"—",note:sox.date||"Latest market observation"},
      {label:"30D average",value:Number.isFinite(current)?formatNumber(current,0):"—",note:Number.isFinite(previous)?`Previous 30D ${formatNumber(previous,0)}`:"Current 30D window",trend:Number.isFinite(change)?formatSignedPercent(change):trend,trendTone:Number.isFinite(change)?(change>0?"good":change<0?"danger":"neutral"):"neutral"},
      {label:"Semiconductor score",value:fmtScore(finalScore),note:`${status} · dynamic`,riskScore:finalScore}
    ]))
    + sectionHtml("HOW THE 48 IS BUILT","The score is calculated in Semi_Momentum from two non-overlapping 30-calendar-day SOX averages. The website displays the spreadsheet result and does not recreate or override the model.",`<div class="score-build semi-score-build"><div class="score-build-row"><div><span>SOX 30D momentum</span><small>${Number.isFinite(current)&&Number.isFinite(previous)?`${formatNumber(current,2)} vs ${formatNumber(previous,2)}`:"Current 30D vs previous 30D"}</small></div><strong>${Number.isFinite(change)?formatSignedPercent(change):"—"}</strong><em>× 500</em><b>${Number.isFinite(risk)?formatNumber(risk,2):"—"}</b></div><div class="score-build-total"><span>Semiconductor Market</span><strong>${Number.isFinite(finalScore)?formatNumber(finalScore,2):"—"}</strong><small>${escapeHtml(contributionText)} · bounded 0–100</small></div></div>`)
    + sectionHtml("SOX TREND","The 52-week view provides context around the short 30D scoring window. It is evidence, not an additional scored input.",semisTrendSvg())
    + sectionHtml("MODEL LOGIC","Semiconductor Market v1 is intentionally simple. A flat SOX trend maps near 50 risk. Strong positive 30D momentum pushes risk toward 0; strong negative momentum pushes risk toward 100. The mapping is linear and capped at both ends.",`<div class="methodology-grid semis-methodology"><div><strong>+10% 30D momentum</strong><span>≈ 0 risk · strong market confirmation</span></div><div><strong>0% momentum</strong><span>50 risk · neutral / no confirmation</span></div><div><strong>−10% 30D momentum</strong><span>≈ 100 risk · strong market warning</span></div><div><strong>Current reading</strong><span>${Number.isFinite(change)?`${formatSignedPercent(change)} → ${formatNumber(finalScore,1)} / ${status}`:"Dynamic Semi_Momentum model"}</span></div></div>`)
    + sectionHtml("WHAT THIS MODEL DOES NOT YET CAPTURE","SOX is a market-price signal, not a complete semiconductor-cycle model. We will only add fundamental inputs after selecting stable, comparable data sources.",`<div class="semis-planned-grid"><div><strong>DRAM / NAND pricing</strong><small>PLANNED · memory-cycle confirmation</small></div><div><strong>Foundry / wafer utilization</strong><small>PLANNED · physical capacity signal</small></div><div><strong>Gross margins</strong><small>PLANNED · semiconductor economics</small></div><div><strong>Inventory / lead times</strong><small>PLANNED · supply-demand balance</small></div></div>`)
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">SOX is currently broadly neutral rather than flashing a cycle warning.</div><p>The latest 30D average is ${Number.isFinite(change)?`${formatSignedPercent(change)} versus the previous 30D window`:"close to the previous comparison window"}, producing ${Number.isFinite(finalScore)?`${formatNumber(finalScore,1)} · ${escapeHtml(status)}`:"a dynamic spreadsheet score"}. This should be read as market confirmation only; fundamental semiconductor-cycle inputs are not yet included.</p></section>`
    + sectionHtml("DATA & EVIDENCE","SOX history is fetched automatically into MarketHistory from the FRED/Nasdaq series. Semi_Momentum calculates the 30D-versus-prior-30D signal and dynamic risk score.",sourceNote("AUTO · FRED NASDAQSOX · dynamic Semi_Momentum model"));
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
  const rows=(DATA.macroMomentum?.rows || []).filter(r=>r.metric && Number.isFinite(toNum(r.compositeRisk)));
  const summary=DATA.macroMomentum?.summary || {};
  const dyn=dynamicScore(DATA,"macroRisk",DATA.canary?.latest?.macroScore);
  const old=toNum(DATA.canary?.latest?.macroScore);
  const v=marketMonthChange("vix","pct"), n=marketMonthChange("us10y","bps"), rr=marketMonthChange("real10y","bps"), hy=marketMonthChange("hyOas","bps"), ig=marketMonthChange("igOas","bps");
  const cards=metricCards([
    {label:"VIX",value:m.vix?formatNumber(m.vix.value,2):"—",note:m.vix?.date||"",trend:v.text,trendTone:v.tone,riskScore:rowRisk(rows,"VIX")},
    {label:"USDJPY",value:m.usdJpy?formatNumber(m.usdJpy.value,2):latestHistoryValue("usdJpy",2),note:"Japan / carry proxy",trend:macroRowTrend(rows,"USDJPY"),trendTone:macroTrendTone(rows,"USDJPY"),riskScore:rowRisk(rows,"USDJPY")},
    {label:"US 10Y",value:m.us10y?`${formatNumber(m.us10y.value,2)}%`:"—",note:"Nominal yield",trend:n.text,trendTone:n.tone,riskScore:rowRisk(rows,"US 10Y")},
    {label:"Real 10Y",value:m.real10y?`${formatNumber(m.real10y.value,2)}%`:"—",note:"Financing context · not in Macro v1",trend:rr.text,trendTone:rr.tone},
    {label:"HY OAS",value:m.hyOas?`${formatNumber(m.hyOas.value,2)}%`:"—",note:"Financing model · avoid double count",trend:hy.text,trendTone:hy.tone},
    {label:"IG OAS",value:m.igOas?`${formatNumber(m.igOas.value,2)}%`:"—",note:"Financing model · avoid double count",trend:ig.text,trendTone:ig.tone}
  ]);
  const breakdown=evidenceTable(rows.map(r=>({
    label:r.metric || r.indicator || "Macro signal",
    value:`${formatNumber(toNum(r.compositeRisk),2)} · ${r.status || scoreStatus(toNum(r.compositeRisk))}`,
    context:`Level ${formatNumber(toNum(r.levelScore),0)} · Momentum ${formatNumber(toNum(r.momentumScore),0)} · Weight ${formatPercent(toNum(r.weight))}`
  })));
  const formula=`Macro & Risk = 45% VIX + 30% USDJPY + 25% US 10Y = ${Number.isFinite(toNum(dyn.score))?formatNumber(toNum(dyn.score),2):"—"}/100.`;
  return sectionHtml("WHY IT MATTERS","Macro conditions can amplify or cushion AI-cycle stress through volatility, discount rates, global funding and risk appetite.",cards)
    + sectionHtml("DYNAMIC MACRO MODEL",formula,breakdown)
    + sectionHtml("WHY THE WEIGHTS DIFFER","The same change does not mean the same thing across markets. VIX uses 60% level / 40% momentum; USDJPY uses 35% level / 65% momentum because rapid FX moves can signal carry-trade stress; US 10Y uses 70% level / 30% momentum because the absolute discount-rate regime matters most.",macroWeightCards(rows))
    + `<section class="drawer-section canary-read"><div class="drawer-section-label">🐤 CANARY READ</div><div class="read-title">Dynamic Macro is ${escapeHtml(dyn.status || scoreStatus(toNum(dyn.score)))} at ${formatNumber(toNum(dyn.score),1)}/100.</div><p>The original v3 Macro baseline was ${Number.isFinite(old)?Math.round(old):"—"}. The dynamic score is now shown in this deep dive and indicator list, while the headline Canary 41 remains the locked baseline until all upgraded components are deliberately rolled into a new comparable headline model.</p></section>`
    + sectionHtml("DATA & EVIDENCE","Macro_Momentum is calculated in Google Sheets from MarketHistory. The v1 model intentionally excludes IG OAS, HY OAS and Real 10Y from the Macro score because those are already used in Financing Conditions; this limits double counting.",sourceNote("Live Macro_Momentum · dynamic score"));
}

function macroRow(rows,label){ return rows.find(r=>String(r.metric||r.indicator||"").toUpperCase().includes(String(label).toUpperCase())); }
function rowRisk(rows,label){ const r=macroRow(rows,label); return r?toNum(r.compositeRisk):NaN; }
function macroRowTrend(rows,label){ const r=macroRow(rows,label); if(!r) return "—"; const ch=toNum(r.change); if(!Number.isFinite(ch)) return r.trend||"—"; return `${r.trend|| (ch>0?"↑":ch<0?"↓":"→")} ${formatPercent(Math.abs(ch))} · 1M`; }
function macroTrendTone(rows,label){ const r=macroRow(rows,label); if(!r) return "neutral"; const ch=toNum(r.change); if(!Number.isFinite(ch)) return "neutral"; if(label==="USDJPY") return Math.abs(ch)>=.02?"danger":"neutral"; return ch>0?"danger":ch<0?"good":"neutral"; }
function latestHistoryValue(key,dec=2){ const rows=(DATA?.marketHistory||[]).filter(r=>Number.isFinite(toNum(r[key]))); return rows.length?formatNumber(toNum(rows[rows.length-1][key]),dec):"—"; }
function macroWeightCards(rows){
  const defs=[
    ["VIX","60% level + 40% momentum","45% of Macro"],
    ["USDJPY","35% level + 65% momentum","30% of Macro"],
    ["US 10Y","70% level + 30% momentum","25% of Macro"]
  ];
  return metricCards(defs.map(([label,logic,note])=>({label,value:logic,note,riskScore:rowRisk(rows,label),trend:macroRowTrend(rows,label),trendTone:macroTrendTone(rows,label)})));
}

function explainDetailHtml(){
  const sourceRows = [
    ["SOX","AUTO","Weekly refresh","FRED · NASDAQSOX","30D momentum / market confirmation","Semiconductor Market"],
    ["VIX","AUTO","Weekly refresh","FRED · VIXCLS","Risk sentiment / hedge context","Macro & Risk"],
    ["US 10Y","AUTO","Weekly refresh","FRED · DGS10","Funding level and rate pressure","Financing + Macro"],
    ["Real 10Y","AUTO","Weekly refresh","FRED · DFII10","Real funding / discount-rate context","Financing Conditions"],
    ["IG OAS","AUTO","Weekly refresh","FRED · BAMLC0A0CM","Broad investment-grade credit stress","Financing Conditions"],
    ["HY OAS","AUTO","Weekly refresh","FRED · BAMLH0A0HYM2","Broad high-yield credit stress","Financing Conditions"],
    ["USD/JPY","AUTO","Weekly refresh","FRED · DEXJPUS","Japan/carry/global-liquidity proxy","Macro & Risk"],
    ["LLM Token Expenditure","AUTO","Weekly refresh","Silicon Data","Price/mix drawdown + short-term context","Token Economics"],
    ["OpenRouter Token Volume","AUTO","Weekly refresh","OpenRouter rankings-daily API","30D avg vs previous 30D avg","Token Economics"],
    ["H100 rental index","AUTO","Weekly refresh","Silicon Data","GPU rental-price signal","Compute Supply"],
    ["H100 reference rates","AUTO","Weekly refresh","CCIR","Independent GPU-price cross-check","Compute Supply"],
    ["AI demand / RPO / revenue","SEMI_AUTO","Quarterly / releases","Company IR + SEC filings","Growth, backlog and demand quality","AI Demand"],
    ["AI CAPEX","SEMI_AUTO","Quarterly / guidance","Company IR + SEC filings","Actual spend + guidance momentum","CAPEX Investment"],
    ["Commitments / leases / obligations","SEMI_AUTO","Quarterly / filings","Company IR + SEC filings","Scale, change and bindingness","Commitment Overhang"],
    ["AI-linked credit / company burden","MANUAL / ASSISTED","As available","Verified market/company sources","CDS + financing burden","Financing Conditions"]
  ];

  const sourceTable = `<div class="source-registry"><div class="source-registry-head"><span>DATA</span><span>MODE</span><span>FREQUENCY</span><span>SOURCE</span><span>HOW USED</span><span>INDICATOR</span></div>${
    sourceRows.map(r=>`<div class="source-registry-row">${r.map((v,i)=>`<span data-col="${i}">${escapeHtml(v)}</span>`).join("")}</div>`).join("")
  }</div>`;

  return sectionHtml("PURPOSE","AI Canary is an early-warning framework for the AI investment cycle. It looks for stress building across monetization, demand, compute, investment commitments, financing and broad markets before those signals necessarily appear together in headline indices.")
  + sectionHtml("HOW THE LOOP WORKS","The cycle is easiest to read from funding through monetization. Capital enables builders, builders buy hardware, hardware becomes compute, and compute must ultimately create end-user value. Weakness can then feed back into financing and the next investment round.",metricCards([
    {label:"1 · Capital & Financing",value:"Can the cycle fund itself?",note:"Rates · credit · commitments"},
    {label:"2 · Hyperscalers & Neocloud",value:"Who is building?",note:"CAPEX · capacity · obligations"},
    {label:"3 · Semis & Hardware",value:"Is hardware confirming?",note:"SOX · chips · physical supply"},
    {label:"4 · Compute & AI Models",value:"Scarcity or oversupply?",note:"GPU pricing · utilization · tokens"},
    {label:"5 · End Users & Monetization",value:"Is value reaching users?",note:"Demand · adoption · monetization"}
  ]))
  + sectionHtml("HOW SCORES WORK","Each component uses its own economically relevant thresholds. Dynamic components are calculated in Google Sheets. The headline now uses the dynamic component score when one exists and the locked v3 score as a fallback for components not upgraded yet. This mixed headline is not backfilled into history.",`<div class="score-bands"><div><span class="band green"></span><b>0–25</b><small>Healthy</small></div><div><span class="band yellow"></span><b>26–50</b><small>Watch</small></div><div><span class="band orange"></span><b>51–75</b><small>Warning</small></div><div><span class="band red"></span><b>76–100</b><small>Danger</small></div></div>`)
  + sectionHtml("DATA MAP · WHAT WE FETCH","The table below shows the intended source discipline. AUTO means the scheduled Apps Script fetches the data; SEMI_AUTO means quarterly source rows are verified/maintained around releases; MANUAL / ASSISTED is used where a stable public API is not available.",sourceTable)
  + sectionHtml("HOW TO USE IT","AI Canary is not an automatic buy/sell signal. Treat a change as a prompt to inspect the underlying evidence. The strongest warning is when independent fundamental, financing and market indicators confirm the same deterioration.",sourceNote("Research framework · source-first · no invented data"));
}

function moneyThemePage(intro, watchItems, cards, footer=""){
  const watchHtml=`<div class="money-watch-grid">${watchItems.map(x=>`<div class="money-watch-item"><span class="money-watch-dot"></span><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.text)}</small></div></div>`).join("")}</div>`;
  return sectionHtml("ROLE IN THE AI MONEY CIRCLE",intro)
    + sectionHtml("WHAT CANARY IS LOOKING FOR","The node becomes more concerning when several independent signals deteriorate together.",watchHtml)
    + sectionHtml("CANARY INDICATORS","Each colored card is an existing 0–100 Canary indicator. Select a card to open its Deep Dive and see the underlying data, transformations, weights and score calculation.",metricCards(cards))
    + sectionHtml("HOW TO READ THIS NODE","The Money Circle node does not create a separate score. Its color reflects the highest risk category among the mapped Canary indicators.",footer?sourceNote(footer):"");
}

function moneyFinancingHtml(){
  const fin=dynamicScore(DATA,"financingConditions",DATA.canary?.latest?.financingScore);
  const commit=dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore);
  return moneyThemePage(
    "Capital & Financing asks whether the AI buildout can still be funded on acceptable terms while future obligations continue to accumulate. This is where high rates, widening credit stress and binding commitments can turn an investment boom into financial pressure.",
    [
      {title:"Cost of capital",text:"Are nominal and real yields making long-duration AI projects harder to finance?"},
      {title:"AI-specific credit",text:"Are CDS and company financing burdens deteriorating before broad credit markets?"},
      {title:"Locked-in obligations",text:"Are leases, purchases and other commitments growing faster than the revenue base?"}
    ],
    [
      {label:"Financing Conditions",value:fmtScore(fin.score),note:"Rates · credit · company burden",riskScore:toNum(fin.score),detail:"financing"},
      {label:"Commitment Overhang",value:fmtScore(commit.score),note:"Scale · momentum · bindingness",riskScore:toNum(commit.score),detail:"commitment"}
    ],
    "Financing and Commitment are separate risk components; confirmation across both is more important than either signal alone."
  );
}

function moneyHyperscalersHtml(){
  const commit=dynamicScore(DATA,"commitmentOverhang",DATA.canary?.latest?.commitmentScore);
  return moneyThemePage(
    "Hyperscalers & Neocloud are the spending engine of the AI cycle. Canary tests whether infrastructure investment and contractual commitments are being matched by durable customer demand rather than simply by continued capacity expansion.",
    [
      {title:"Investment pace",text:"Is AI infrastructure CAPEX still accelerating, flattening or being revised?"},
      {title:"Commitment growth",text:"Are future obligations expanding faster than the companies' financial capacity?"},
      {title:"Demand absorption",text:"Are cloud growth, backlog and AI revenue strong enough to absorb the new capacity?"}
    ],
    [
      {label:"CAPEX Investment",value:fmtScore(DATA.canary?.latest?.capexScore),note:"Infrastructure spending & guidance",riskScore:toNum(DATA.canary?.latest?.capexScore),detail:"capex",locked:true},
      {label:"Commitment Overhang",value:fmtScore(commit.score),note:"Future obligations & momentum",riskScore:toNum(commit.score),detail:"commitment"},
      {label:"AI Demand",value:fmtScore(DATA.canary?.latest?.demandScore),note:"Cloud · RPO/backlog · demand quality",riskScore:toNum(DATA.canary?.latest?.demandScore),detail:"demand",locked:true}
    ],
    "The key question is whether demand and monetization keep pace with the enormous infrastructure buildout."
  );
}

function moneySemisHtml(){
  const semis=dynamicScore(DATA,"semiconductorMarket",DATA.canary?.latest?.semisScore);
  const compute=dynamicScore(DATA,"computeSupply",DATA.canary?.latest?.computeScore);
  return moneyThemePage(
    "Semis & Hardware is the physical supply chain of the AI boom. Chip-market strength can confirm healthy infrastructure demand, while weakening semiconductor momentum alongside softer compute economics can be an early sign that supply is catching demand.",
    [
      {title:"Chip-market confirmation",text:"Does semiconductor performance still confirm the AI investment narrative?"},
      {title:"Compute balance",text:"Are GPU supply and rental economics moving from scarcity toward abundance?"},
      {title:"Cross-signal confirmation",text:"Does hardware weakness appear together with softer demand or token economics?"}
    ],
    [
      {label:"Semiconductor Market",value:fmtScore(semis.score),note:"SOX · chip-market momentum",riskScore:toNum(semis.score),detail:"semis"},
      {label:"Compute Supply",value:fmtScore(compute.score),note:"Dynamic · H100 pricing & scarcity",riskScore:toNum(compute.score),detail:"compute"}
    ],
    "Semiconductor weakness matters most when it is confirmed by compute, demand and financing signals."
  );
}

function moneyComputeHtml(){
  const token=dynamicScore(DATA,"tokenEconomics",DATA.canary?.latest?.tokenScore);
  const compute=dynamicScore(DATA,"computeSupply",DATA.canary?.latest?.computeScore);
  return moneyThemePage(
    "Compute & AI Models connects the cost and availability of GPU capacity with actual model usage. Falling compute prices can be healthy when efficiency improves, but become a warning when they coincide with weaker utilization, token demand or monetization.",
    [
      {title:"GPU economics",text:"Are rental prices and availability signalling scarcity, balance or oversupply?"},
      {title:"Utilization",text:"Is installed compute capacity being used intensively enough to justify further buildout?"},
      {title:"Token activity",text:"Is model usage expanding strongly enough as the cost per token changes?"}
    ],
    [
      {label:"Compute Supply",value:fmtScore(compute.score),note:"Dynamic · H100 pricing & scarcity",riskScore:toNum(compute.score),detail:"compute"},
      {label:"Token Economics",value:fmtScore(token.score),note:"Usage volume · token expenditure",riskScore:toNum(token.score),detail:"token"}
    ],
    "GPU utilization remains a planned input; the page should distinguish connected evidence from planned signals."
  );
}

function moneyMonetizationHtml(){
  const token=dynamicScore(DATA,"tokenEconomics",DATA.canary?.latest?.tokenScore);
  return moneyThemePage(
    "End Users & Monetization is where the AI Money Circle ultimately has to pay for itself. Infrastructure spending is sustainable only if enterprises and consumers keep increasing usage and if that activity converts into durable cloud, software and model-layer revenue.",
    [
      {title:"Usage growth",text:"Are token volumes and AI workloads continuing to expand?"},
      {title:"Revenue conversion",text:"Are cloud growth, RPO/backlog and AI-related revenues keeping pace with capacity?"},
      {title:"Unit economics",text:"Can falling model costs support more usage without destroying monetization?"}
    ],
    [
      {label:"AI Demand",value:fmtScore(DATA.canary?.latest?.demandScore),note:"Cloud · backlog · company demand",riskScore:toNum(DATA.canary?.latest?.demandScore),detail:"demand",locked:true},
      {label:"Token Economics",value:fmtScore(token.score),note:"Usage · effective token expenditure",riskScore:toNum(token.score),detail:"token"}
    ],
    "Enterprise-adoption data can strengthen this node later when a stable, repeatable series is connected."
  );
}
