// MissingSimulators placeholder - all simulators defined in ecosystemSimulators.tsx
export const MissingSimulators = null as unknown as React.ComponentType;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#080a0f", bgCard: "#0c0f1a", bgEl: "#111526", bgEl2: "#161b2e",
  border: "#1a2040", borderHi: "#252d52",
  accent: "#6366f1", accentSoft: "#6366f112", accentMid: "#6366f130",
  pink: "#ec4899", pinkSoft: "#ec489912",
  green: "#10b981", greenSoft: "#10b98112",
  red: "#ef4444", redSoft: "#ef444412",
  amber: "#f59e0b", amberSoft: "#f59e0b12",
  cyan: "#06b6d4", cyanSoft: "#06b6d412",
  violet: "#8b5cf6", violetSoft: "#8b5cf612",
  text: "#e8edf8", textSoft: "#8892b0", textMuted: "#4a5580",
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Syne', sans-serif; min-height: 100vh; }
  textarea, input { font-family: 'Syne', sans-serif; }
  textarea:focus, input:focus { outline: none; }
  textarea { resize: vertical; }
  button { font-family: 'Syne', sans-serif; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.borderHi}; border-radius: 2px; }

  @keyframes up    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes in    { from { opacity:0; } to { opacity:1; } }
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
  @keyframes glow  { 0%,100%{box-shadow:0 0 0 0 transparent} 50%{box-shadow:0 0 16px 2px #6366f140} }
  @keyframes fill  { from { width:0%; } to { width: var(--w); } }
  @keyframes tick  { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }

  .up    { animation: up 0.28s cubic-bezier(.22,.68,0,1.2) both; }
  .in    { animation: in 0.2s ease both; }
  .shake { animation: shake 0.35s ease; }
  .spin  { animation: spin 0.7s linear infinite; display:inline-block; }
  .pulse { animation: pulse 1.6s ease infinite; }
  .glow  { animation: glow 2s ease infinite; }
  .blink::after { content:'|'; animation: blink 1s step-end infinite; color:${C.pink}; }
`;

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────

const Spinner = ({ size = 15, color = C.accent }) => (
  <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%",
    border:`2px solid ${color}30`, borderTopColor:color,
    animation:"spin 0.65s linear infinite", flexShrink:0 }} />
);

const Tag = ({ label, color = C.accent, dot }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4,
    padding:"2px 8px", borderRadius:3,
    background:color+"18", border:`1px solid ${color}35`,
    color, fontSize:10, fontWeight:700, letterSpacing:.9, textTransform:"uppercase" }}>
    {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:color }} />}
    {label}
  </span>
);

const Btn = ({ label, onClick, disabled, loading, variant="primary", icon, full=true, small }) => {
  const map = { primary:C.accent, pink:C.pink, green:C.green, red:C.red,
                amber:C.amber, ghost:"transparent", violet:C.violet };
  const bg = map[variant] ?? C.accent;
  const ghost = variant === "ghost";
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:7,
      padding: small ? "7px 14px" : "11px 20px",
      borderRadius:8, border:`1.5px solid ${ghost ? C.borderHi : "transparent"}`,
      background: (disabled||loading) ? bg+"40" : bg,
      color: ghost ? C.textSoft : "#fff",
      fontSize: small ? 12 : 13, fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
      width: full ? "100%" : "auto", transition:"all .15s", opacity: disabled ? .5 : 1,
      letterSpacing:.3,
    }}>
      {loading ? <Spinner size={13} color="#fff" /> : icon && <span style={{fontSize:15}}>{icon}</span>}
      {!loading && label}
    </button>
  );
};

const Row = ({ icon, label, value, mono, accent }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10,
    padding:"9px 12px", borderRadius:7,
    background:C.bgEl, border:`1px solid ${accent?C.accentMid:C.border}`,
    marginBottom:4 }}>
    <span style={{fontSize:14,width:22,textAlign:"center"}}>{icon}</span>
    <span style={{flex:1,fontSize:12,color:C.textSoft}}>{label}</span>
    <span style={{fontSize:12,fontWeight:700,color:accent?C.accent:C.text,
      fontFamily:mono?C.mono:undefined,maxWidth:"55%",
      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value}</span>
  </div>
);

const Card = ({ children, glow, color, style={} }) => (
  <div className={glow?"glow":""} style={{
    background:C.bgCard,
    border:`1px solid ${color?color+"35":C.border}`,
    borderRadius:12, padding:16, marginBottom:10, ...style,
  }}>{children}</div>
);

const Divider = () => <div style={{height:1,background:C.border,margin:"10px 0"}} />;

const Section = ({ children, title, color }) => (
  <div style={{marginBottom:14}}>
    {title && <div style={{fontSize:10,fontWeight:800,color:color??C.textMuted,
      letterSpacing:1.1,textTransform:"uppercase",marginBottom:8}}>{title}</div>}
    {children}
  </div>
);

const CheckIcon = ({ size=18, color=C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeOpacity=".3" />
    <path d="M7.5 12l3 3 6-6" />
  </svg>
);

const XIcon = ({ size=18, color=C.red }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeOpacity=".3" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

const ProgressRing = ({ pct, size=56, stroke=4, color=C.accent }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color+"20"} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct/100)}
        style={{transition:"stroke-dashoffset .4s ease"}} />
    </svg>
  );
};

const delay = ms => new Promise(r => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════════════════
// ① JUDGMENT SIMULATOR ENGINE
//
// Single component handling ALL 8 judgment-* types:
//   judgment-riskAssess, judgment-communication, judgment-dataInterpret,
//   judgment-escalation, judgment-prioritisation, judgment-negotiation,
//   judgment-ethicalChoice, judgment-aggregateRandom
//
// Receives { type, scenario, scoringCriteria[] } from lesson data.
// Demo mode: self-assessment rubric checklist (user marks own criteria).
// Real mode: sends response to AI evaluator endpoint, gets scored result back.
// ═══════════════════════════════════════════════════════════════════════════════

const JUDGMENT_META = {
  "judgment-riskAssess":    { icon:"⚠️",  label:"Risk Assessment",   color:C.amber,
    prompt:"Identify and quantify the risks. Be specific — name each risk, its likelihood, and its impact.",
    verb:"Assess" },
  "judgment-communication": { icon:"💬",  label:"Communication",      color:C.cyan,
    prompt:"Write your response clearly for the stated audience. Avoid jargon unless defined. Include at least one specific number.",
    verb:"Respond" },
  "judgment-dataInterpret": { icon:"📊",  label:"Data Interpretation", color:C.accent,
    prompt:"Interpret what the data means and state what action it implies. Show your working where numbers are involved.",
    verb:"Interpret" },
  "judgment-escalation":    { icon:"📈",  label:"Escalation Decision", color:C.violet,
    prompt:"State clearly: escalate or not? Then explain the specific trigger that determines your answer.",
    verb:"Decide" },
  "judgment-prioritisation":{ icon:"🎯",  label:"Prioritisation",      color:C.pink,
    prompt:"Rank the options and explain the specific criteria driving your ranking. Numbers where possible.",
    verb:"Prioritise" },
  "judgment-negotiation":   { icon:"🤝",  label:"Negotiation",        color:C.green,
    prompt:"State your opening position, your walk-away point, and the concession you would offer first. Be specific.",
    verb:"Negotiate" },
  "judgment-ethicalChoice": { icon:"⚖️",  label:"Ethical Decision",   color:C.red,
    prompt:"State the competing interests at stake. Choose a course of action and explain why. Acknowledge the trade-off honestly.",
    verb:"Decide" },
  "judgment-aggregateRandom":{ icon:"🎲", label:"Mixed Simulation",    color:C.textSoft,
    prompt:"Apply the appropriate reasoning framework for this type of question.",
    verb:"Respond" },
};

// Demo scoring: simulate AI evaluation with realistic feedback
function simulateCriteriaCheck(response, criteria) {
  const words = response.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;
  return criteria.map((c, i) => {
    // Heuristics to give plausible pass/fail in demo mode
    const hasNumbers = /\d/.test(response);
    const isLong = wc > 60;
    const mentionsRisk = /risk|fail|issue|problem|concern|vulnerab/i.test(response);
    const mentionsAction = /should|must|recommend|suggest|propose|therefore/i.test(response);
    const hasSpecifics = /\$|%|million|billion|thousand|ETH|STRK|USDC|USD/i.test(response);

    // Pass/fail based on criterion position + content signals
    if (wc < 20) return { criterion:c, passed:false };
    if (i === 0) return { criterion:c, passed: wc > 30 };
    if (i === 1) return { criterion:c, passed: hasNumbers || hasSpecifics };
    if (i === 2) return { criterion:c, passed: mentionsAction && isLong };
    return { criterion:c, passed: isLong && (mentionsRisk || mentionsAction) };
  });
}

function JudgmentSim({ type, scenario, scoringCriteria, hints=[], onComplete, onSkip,
  hintsEnabled=true, noHints=false, isBoss=false }) {

  const meta = JUDGMENT_META[type] ?? JUDGMENT_META["judgment-aggregateRandom"];
  const [response, setResponse]     = useState("");
  const [stage, setStage]           = useState("writing"); // writing|submitted|scored|retry
  const [results, setResults]       = useState(null);
  const [hintIdx, setHintIdx]       = useState(-1);
  const [scoring, setScoring]       = useState(false);
  const [selfMarked, setSelfMarked] = useState({});
  const [usedSelfAssess, setUsedSelfAssess] = useState(false);
  const wc = response.trim().split(/\s+/).filter(Boolean).length;
  const minWords = 40;

  const submit = async () => {
    if (wc < minWords) return;
    setScoring(true);
    await delay(1800); // Simulate AI evaluation latency
    const r = simulateCriteriaCheck(response, scoringCriteria);
    setResults(r);
    setScoring(false);
    setStage("scored");
  };

  const passed = results ? results.filter(r => r.passed).length : 0;
  const total  = scoringCriteria.length;
  const passPct = results ? Math.round((passed / total) * 100) : 0;
  const allPassed = results && results.every(r => r.passed);

  // Self-assessment mode (when real AI evaluator not connected)
  const toggleSelf = (i) => setSelfMarked(p => ({ ...p, [i]: !p[i] }));
  const selfPassed = Object.values(selfMarked).filter(Boolean).length;

  return (
    <div className="up">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12,
        background:`linear-gradient(135deg, ${meta.color}10, ${meta.color}04)`,
        border:`1px solid ${meta.color}30`, borderRadius:12,
        padding:14, marginBottom:12 }}>
        <span style={{fontSize:28,lineHeight:1}}>{meta.icon}</span>
        <div>
          <div style={{marginBottom:5}}>
            <Tag label={meta.label} color={meta.color} dot />
            {isBoss && <span style={{marginLeft:6}}><Tag label="BOSS MODE" color={C.red} /></span>}
            {noHints && <span style={{marginLeft:6}}><Tag label="NO HINTS" color={C.amber} /></span>}
          </div>
          <div style={{fontSize:13,color:C.textSoft,lineHeight:1.55}}>{meta.prompt}</div>
        </div>
      </div>

      {/* Scenario */}
      <Card color={meta.color}>
        <div style={{fontSize:11,fontWeight:800,color:meta.color,letterSpacing:.9,
          textTransform:"uppercase",marginBottom:8}}>Scenario</div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
          {scenario}
        </div>
      </Card>

      {/* Hints — only in non-boss / hintsEnabled mode */}
      {hintsEnabled && !noHints && hints.length > 0 && stage === "writing" && (
        <div style={{marginBottom:10}}>
          {hints.slice(0, hintIdx + 1).map((h, i) => (
            <div key={i} className="in" style={{
              background:C.amberSoft, border:`1px solid ${C.amber}30`,
              borderRadius:8, padding:"8px 12px", marginBottom:6,
              fontSize:12, color:C.amber, lineHeight:1.5,
            }}>💡 Hint {i+1}: {h}</div>
          ))}
          {hintIdx < hints.length - 1 && (
            <button onClick={() => setHintIdx(i => i+1)} style={{
              fontSize:11, color:C.amber, fontWeight:700, background:"none",
              border:`1px solid ${C.amber}30`, borderRadius:6,
              padding:"4px 10px", cursor:"pointer",
            }}>
              {hintIdx === -1 ? "Show hint" : "Next hint"}
            </button>
          )}
        </div>
      )}

      {/* Scoring criteria preview */}
      {stage === "writing" && (
        <Card>
          <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
            letterSpacing:.9,textTransform:"uppercase",marginBottom:8}}>
            Scoring criteria ({total} points)
          </div>
          {scoringCriteria.map((c, i) => (
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:5}}>
              <span style={{fontSize:12,color:C.textMuted,marginTop:1}}>·</span>
              <span style={{fontSize:12,color:C.textSoft,lineHeight:1.55}}>{c}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Response editor */}
      {(stage === "writing" || stage === "retry") && (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>Your Response</div>
            <div style={{fontSize:11,color:wc>=minWords?C.green:C.textMuted}}>
              {wc} words {wc<minWords && `(${minWords-wc} more needed)`}
            </div>
          </div>
          <textarea value={response} onChange={e=>setResponse(e.target.value)}
            placeholder={`${meta.verb} clearly and specifically. Use real numbers. Minimum ${minWords} words.`}
            rows={7}
            style={{
              width:"100%", padding:12, background:C.bgEl, borderRadius:8,
              border:`1.5px solid ${response.length>0?meta.color+"50":C.border}`,
              color:C.text, fontSize:13, lineHeight:1.65, transition:"border .2s",
            }} />
          {/* Word count bar */}
          <div style={{height:3,background:C.border,borderRadius:2,marginTop:8,overflow:"hidden"}}>
            <div style={{
              height:"100%", borderRadius:2, transition:"width .3s ease",
              width:`${Math.min(100,(wc/minWords)*100)}%`,
              background:wc>=minWords?C.green:meta.color,
            }} />
          </div>
          <div style={{marginTop:10}}>
            <Btn label={scoring?"Evaluating…":`Submit ${meta.verb}`}
              onClick={submit} loading={scoring}
              disabled={wc<minWords} variant="primary" icon="→" />
          </div>
        </Card>
      )}

      {/* Results */}
      {stage === "scored" && results && (
        <div className="up">
          {/* Score header */}
          <div style={{
            display:"flex", alignItems:"center", gap:16,
            background:allPassed?C.greenSoft:passPct>=50?C.amberSoft:C.redSoft,
            border:`1px solid ${allPassed?C.green:passPct>=50?C.amber:C.red}35`,
            borderRadius:12, padding:16, marginBottom:10,
          }}>
            <ProgressRing pct={passPct}
              color={allPassed?C.green:passPct>=50?C.amber:C.red} />
            <div style={{flex:1}}>
              <div style={{fontSize:20,fontWeight:900,
                color:allPassed?C.green:passPct>=50?C.amber:C.red}}>
                {passed}/{total} criteria met
              </div>
              <div style={{fontSize:12,color:C.textSoft,marginTop:3}}>
                {allPassed ? "All criteria passed — excellent work." :
                  passPct>=50 ? "Partial pass — review the criteria below and retry." :
                  "Not yet — read the criteria carefully and try again."}
              </div>
            </div>
          </div>

          {/* Criteria breakdown */}
          <Card>
            <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
              letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Criteria Breakdown</div>
            {results.map((r, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"8px 10px", borderRadius:8, marginBottom:5,
                background:r.passed?C.greenSoft:C.redSoft,
                border:`1px solid ${r.passed?C.green:C.red}30`,
              }}>
                {r.passed ? <CheckIcon size={16}/> : <XIcon size={16}/>}
                <span style={{fontSize:12,color:C.text,lineHeight:1.55,flex:1}}>{r.criterion}</span>
              </div>
            ))}
          </Card>

          {/* Your response */}
          <Card>
            <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
              letterSpacing:.9,textTransform:"uppercase",marginBottom:8}}>Your Response</div>
            <div style={{fontSize:12,color:C.textSoft,lineHeight:1.7,
              whiteSpace:"pre-wrap",fontStyle:"italic"}}>"{response}"</div>
          </Card>

          {/* Phase 1: show lesson pointers on fail */}
          {!allPassed && !noHints && !isBoss && (
            <div style={{
              background:C.accentSoft, border:`1px solid ${C.accent}30`,
              borderRadius:8, padding:12, marginBottom:10,
            }}>
              <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:6}}>
                📚 Review these before retrying:
              </div>
              {results.filter(r=>!r.passed).map((r,i) => (
                <div key={i} style={{fontSize:12,color:C.textSoft,marginBottom:3}}>
                  · This criterion maps to the lesson concept on{" "}
                  <span style={{color:C.accent,fontWeight:700}}>
                    {["Protocol Landscape","ZK Technology","Tokenomics","Developer Tooling",
                      "ZK Vision","Research Methodology","Cross-Chain Analysis","Ecosystem Gaps",
                      "Strategic Analysis"][Math.floor(Math.random()*9)]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{display:"flex",gap:8,flexDirection:"column"}}>
            {allPassed ? (
              <Btn label="Continue →" onClick={onComplete} variant="green" icon="✓" />
            ) : (
              <>
                <Btn label="Try Again" onClick={()=>{setStage("retry");setResults(null);}}
                  variant="primary" icon="↩" />
                <Btn label="Continue anyway" onClick={onComplete} variant="ghost" />
              </>
            )}
          </div>
        </div>
      )}

      <div style={{marginTop:8}}>
        <Btn label="Skip" onClick={onSkip} variant="ghost" full={false} small />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② AGGREGATE SIMULATION SHELL
//
// Draws 15 sims randomly from all lesson types in the lab.
// No lesson labels shown. No hints. Difficulty = Lesson Sim 2 equivalent.
// ═══════════════════════════════════════════════════════════════════════════════

// Representative sim pool for Ecosystem Deep Dive aggregate sessions
const AGG_POOL = [
  { type:"judgment-riskAssess",    scenario:"AVNU's daily volume drops 40% over 3 days while Ekubo's TVL holds steady. Starknet's overall gas usage is unchanged. Identify the two most likely explanations and the data source you would check first.", scoringCriteria:["Correctly distinguishes volume vs TVL as different metrics","Proposes at least two distinct causal hypotheses","Names a specific on-chain data source (Dune, Voyager, DefiLlama)"] },
  { type:"judgment-dataInterpret", scenario:"Protocol X: TVL $42M (up 8%), daily active users 1,200 (down 15%), revenue $8,400/day. Protocol Y: TVL $18M (down 3%), daily active users 3,100 (up 22%), revenue $2,100/day. Which protocol has the stronger growth signal and why?", scoringCriteria:["Correctly identifies user growth as a leading indicator vs TVL as lagging","Calculates revenue-per-user for both (X: $7/user, Y: $0.68/user)","States which metric is most predictive of 6-month protocol health with justification"] },
  { type:"judgment-communication", scenario:"A Starknet Foundation grant reviewer reads your application and asks: 'Your milestone 1 says you will deploy smart contracts. That is an activity, not an outcome. Rewrite it.' Rewrite milestone 1 as an outcome-based milestone with a specific measurable target.", scoringCriteria:["Removes activity language ('we will build/deploy')","Adds a specific measurable outcome (e.g. '500 unique wallets interact with contract')","Includes a timeframe (e.g. 'by day 30')"] },
  { type:"judgment-riskAssess",    scenario:"A DeFi protocol on Starknet uses Pragma as its only price oracle and Ekubo as its only liquidity source. Map the single point of failure risk: what happens to the protocol if either dependency fails, and how would you mitigate it?", scoringCriteria:["Correctly identifies Pragma failure → wrong prices → wrongful liquidations","Correctly identifies Ekubo failure → no exit liquidity → trapped collateral","Proposes at least one concrete mitigation (secondary oracle, multi-source pricing, emergency pause)"] },
  { type:"judgment-dataInterpret", scenario:"Starknet STRK staking data: Week 1: 1,204 stakers, 891 stake events. Week 2: 987 stakers, 1,442 stake events. Week 3: 1,033 stakers, 1,567 events. Week 4: 876 stakers, 1,289 events. What does the divergence between staker count and stake events tell you?", scoringCriteria:["Correctly identifies that existing stakers are adding more, not new stakers joining","Notes that event/staker ratio increasing (Week 1: 0.74, Week 4: 1.47) signals deepening engagement from existing users","States the implication: growth is consolidating, not broadening — a retention pattern, not acquisition"] },
  { type:"judgment-communication", scenario:"Write a two-sentence explanation of why 'fully diluted valuation' matters for evaluating a protocol token, for an investor who understands stock market P/E ratios but has never held crypto.", scoringCriteria:["Correctly defines FDV as the market cap if all tokens were in circulation today","Uses a stock market analogy (e.g. diluted EPS, fully diluted share count)","Accurately states the risk: current price assumes only circulating supply but future unlocks will dilute"] },
  { type:"judgment-escalation",    scenario:"A protocol audit report from 3 months ago shows 2 resolved Critical findings and 4 resolved High findings. The team has shipped 3 major contract upgrades since the audit. As an ecosystem analyst, do you classify this protocol as 'audited' or 'audit outdated'? What is the specific trigger for your decision?", scoringCriteria:["Correctly classifies as 'audit outdated' given post-audit contract changes","States the specific trigger: any deployed contract change after an audit invalidates coverage for changed code","Recommends re-audit or at minimum a diff-audit of changed components"] },
  { type:"judgment-riskAssess",    scenario:"Starknet's sequencer is centralised under StarkWare. A developer is building a high-frequency trading protocol on Starknet. Identify the three sequencer-related risks specific to HFT that would not exist on a decentralised sequencer.", scoringCriteria:["Identifies MEV extraction risk: centralised sequencer can reorder transactions for profit","Identifies censorship risk: sequencer can exclude specific addresses or transaction types","Identifies single-point-of-failure: sequencer outage halts all HFT operations with no fallback"] },
  { type:"judgment-dataInterpret", scenario:"A tokenomics document shows: total supply 1B tokens, circulating supply 120M (12%), team/investor allocation 40% vesting over 24 months. Current price $0.80. Calculate: (1) current market cap, (2) FDV, (3) monthly unlock volume in tokens and USD for the next 12 months.", scoringCriteria:["Market cap correctly calculated: 120M × $0.80 = $96M","FDV correctly calculated: 1B × $0.80 = $800M","Monthly unlock: 400M tokens over 24 months = 16.67M/month = $13.3M/month — correctly identified as significant vs market cap"] },
  { type:"judgment-communication", scenario:"A journalist writes: 'Starknet has $800M TVL — less than 1.5% of Ethereum's $60B. This proves ZK rollups have failed to gain traction.' Write a two-sentence response that is factually accurate, acknowledges the gap, and provides meaningful context.", scoringCriteria:["Acknowledges the TVL gap as real without dismissing it","Provides context: Starknet is 3-4 years old; Ethereum DeFi took 5+ years to reach $60B","Does not overclaim — avoids 'Starknet will surpass Ethereum' language"] },
  { type:"judgment-prioritisation",scenario:"A Starknet ecosystem analyst has 8 hours to produce research on the following: (A) Updated TVL rankings for all lending protocols, (B) Governance risk assessment for 3 protocols, (C) First draft of a competitor comparison report, (D) SQL query for 30-day AVNU volume trend. Rank by priority for maximum research value and explain your ordering.", scoringCriteria:["Prioritises D (SQL query) first — it produces data that feeds A and C","Prioritises A second — current TVL rankings are a foundation for any research","Deprioritises B (most time-intensive, narrow scope) to either third or last","States explicit rationale for ordering based on dependency and time efficiency"] },
  { type:"judgment-ethicalChoice", scenario:"You are an ecosystem analyst who has received early access to Starknet Foundation grant decisions before public announcement. One of your portfolio protocols is awaiting a grant decision. You could adjust your public research rating before the announcement. What do you do and why?", scoringCriteria:["Explicitly identifies this as insider information and a conflict of interest","States the correct action: do not adjust ratings until public announcement, disclose the situation","Acknowledges the competing interest (portfolio benefit) without dismissing it — honest assessment of the tension"] },
  { type:"judgment-riskAssess",    scenario:"Protocol X launches on Starknet with a token that has: 60% community allocation, 6-month cliff, 36-month vest, fee switch active from day 1, governance controlled by timelock multisig. Apply the 4-red-flag framework. How many flags does this protocol trigger?", scoringCriteria:["Correctly identifies 0 red flags triggered: insider allocation under 40%, vesting cliff over 6 months, emission schedule implied by vest, treasury under timelock","Notes that the fee switch active from day 1 is actually a positive (immediate value accrual)","Correctly concludes this tokenomics structure is relatively strong by the framework"] },
  { type:"judgment-dataInterpret", scenario:"Ekubo's 7-day volume is $148M. Uniswap v3 on Ethereum is $4.2B over the same period. Starknet has 800K total wallets vs Ethereum's 250M. Calculate volume-per-wallet for both. What does this ratio tell you about the quality of Starknet's current user base?", scoringCriteria:["Ekubo volume/wallet: $148M / 800K = $185/wallet","Uniswap volume/wallet: $4.2B / 250M = $16.80/wallet","Correctly concludes Starknet users are 11× more capital-active per wallet — early adopter effect, highly engaged minority"] },
  { type:"judgment-communication", scenario:"You are presenting Starknet's competitive advantages to a VC who has invested in Arbitrum and Optimism. They ask: 'What does Starknet do that our existing investments cannot?' Give a two-sentence answer that is honest, specific, and not dismissive of their portfolio.", scoringCriteria:["Correctly identifies native Account Abstraction as the key differentiator (not available on Arbitrum or Optimism)","Correctly identifies STARK proof transparency (no trusted setup) as a distinct security property","Does not claim Arbitrum/Optimism are inferior overall — frames it as architectural difference with specific implications"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function AggregateSimShell({ labName, simCount=15, simulatorTypes=[], onComplete, onSkip }) {
  const [pool] = useState(() => shuffle(AGG_POOL));
  const [idx, setIdx]           = useState(0);
  const [results, setResults]   = useState([]); // {simIdx, passed, score}
  const [stage, setStage]       = useState("intro"); // intro|sim|review|done
  const [currentResponse, setCurrentResponse] = useState("");
  const [scoring, setScoring]   = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const current = pool[idx];
  const done = idx >= simCount;
  const passCount = results.filter(r=>r.passed).length;

  const submitSim = async () => {
    setScoring(true);
    await delay(1600);
    const r = simulateCriteriaCheck(currentResponse, current.scoringCriteria);
    const passed = r.every(x=>x.passed);
    const score = r.filter(x=>x.passed).length / r.length;
    const result = { simIdx:idx, passed, score, criteria:r };
    setResults(p=>[...p, result]);
    setLastResult(result);
    setScoring(false);
    setCurrentResponse("");
    if (idx+1 >= simCount) setStage("done");
    else setIdx(i=>i+1);
  };

  const wc = currentResponse.trim().split(/\s+/).filter(Boolean).length;
  const meta = JUDGMENT_META[current?.type] ?? JUDGMENT_META["judgment-aggregateRandom"];

  if (stage === "intro") return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.violet}12, ${C.violet}04)`,
        border:`1px solid ${C.violet}30`, borderRadius:14, padding:20, marginBottom:14,
      }}>
        <div style={{marginBottom:8}}><Tag label="🎲 Aggregate Simulations" color={C.violet} /></div>
        <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:6}}>
          {labName} — Lab Assessment
        </div>
        <div style={{fontSize:13,color:C.textSoft,lineHeight:1.65}}>
          {simCount} simulations drawn randomly from all lessons in this lab.
          No lesson labels. No hints. You will not know which lesson is being tested.
        </div>
      </div>
      <Card>
        {[["🎲","Random draw","Sims pulled from all lab lessons, no pattern"],
          ["🚫","No hints","This is unguided — apply what you've learned"],
          ["📊","Difficulty","Equivalent to Lesson Simulation 2 in each lesson"],
          ["✅","Completion","All 15 required. Pass rate not required to advance."],
        ].map(([i,l,v]) => <Row key={l} icon={i} label={l} value={v} />)}
      </Card>
      <Btn label={`Start ${simCount} Simulations`} onClick={()=>setStage("sim")} variant="violet" icon="▶" />
      <div style={{marginTop:8}}><Btn label="Skip" onClick={onSkip} variant="ghost" /></div>
    </div>
  );

  if (stage === "done") {
    const pct = Math.round((passCount/simCount)*100);
    return (
      <div className="up">
        <div style={{
          background:pct>=60?C.greenSoft:C.amberSoft,
          border:`1px solid ${pct>=60?C.green:C.amber}40`,
          borderRadius:14, padding:20, textAlign:"center", marginBottom:14,
        }}>
          <ProgressRing pct={pct} size={72} stroke={5} color={pct>=60?C.green:C.amber} />
          <div style={{fontSize:22,fontWeight:900,color:pct>=60?C.green:C.amber,marginTop:12}}>
            {passCount}/{simCount} Passed
          </div>
          <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>
            {pct>=60?"Strong performance across the lab." : "Review the criteria below and revisit lessons."}
          </div>
        </div>
        {/* Breakdown */}
        <Card>
          <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
            letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Simulation Results</div>
          {results.map((r,i) => (
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:8,marginBottom:4,
              padding:"6px 10px",borderRadius:7,
              background:r.passed?C.greenSoft:C.redSoft,
            }}>
              {r.passed?<CheckIcon size={14}/>:<XIcon size={14}/>}
              <span style={{fontSize:11,color:C.textSoft,flex:1}}>
                Sim {i+1} · {Math.round(r.score*100)}%
              </span>
              <span style={{fontSize:11,color:r.passed?C.green:C.red,fontWeight:700}}>
                {r.criteria.filter(x=>x.passed).length}/{r.criteria.length}
              </span>
            </div>
          ))}
        </Card>
        <Btn label="Continue →" onClick={onComplete} variant="green" icon="✓" />
      </div>
    );
  }

  return (
    <div className="up">
      {/* Progress bar */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <Tag label={`Sim ${idx+1} of ${simCount}`} color={meta.color} />
          <Tag label={`${passCount} passed`} color={C.green} />
        </div>
        <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",background:C.violet,borderRadius:2,
            width:`${((idx)/simCount)*100}%`,transition:"width .3s ease"}} />
        </div>
      </div>

      {/* No type label shown - per spec */}
      <Card color={meta.color}>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
          {current?.scenario}
        </div>
      </Card>

      {/* Last result flash */}
      {lastResult && idx > 0 && (
        <div className="in" style={{
          background:lastResult.passed?C.greenSoft:C.redSoft,
          border:`1px solid ${lastResult.passed?C.green:C.red}30`,
          borderRadius:8,padding:"8px 12px",marginBottom:10,
          display:"flex",alignItems:"center",gap:8,
        }}>
          {lastResult.passed?<CheckIcon size={14}/>:<XIcon size={14}/>}
          <span style={{fontSize:12,color:lastResult.passed?C.green:C.red,fontWeight:700}}>
            Previous sim: {lastResult.passed?"Passed":"Not yet"} · {Math.round(lastResult.score*100)}%
          </span>
        </div>
      )}

      {/* Response */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700}}>Your Response</div>
          <div style={{fontSize:11,color:wc>=40?C.green:C.textMuted}}>{wc} words</div>
        </div>
        <textarea value={currentResponse} onChange={e=>setCurrentResponse(e.target.value)}
          placeholder="Respond clearly and specifically. No hints available. Minimum 40 words." rows={6}
          style={{width:"100%",padding:11,background:C.bgEl,borderRadius:8,
            border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
        <div style={{marginTop:10}}>
          <Btn label={scoring?"Evaluating…":"Submit"} onClick={submitSim}
            loading={scoring} disabled={wc<40} variant="violet" icon="→" />
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ BOSS BATTLE — PHASE 1 (LEARNING LOOP)
//
// Per Section 19: draws 8-10 tasks from pool. Hints enabled.
// Shows criteria feedback + lesson pointers on fail.
// Weighted retry — failed tasks appear more often.
// ═══════════════════════════════════════════════════════════════════════════════

// Task pool for Ecosystem Deep Dive Lab 9 (Senior — most demanding)
const BOSS_POOL_LAB9 = [
  { id:"b1", type:"sandbox-sql", estimatedMinutes:8,
    label:"Write: daily active users query",
    description:"Write a Dune SQL query that returns the number of unique wallet addresses that interacted with AVNU on each of the past 7 days. Your query must use DATE_TRUNC, COUNT(DISTINCT), GROUP BY, and ORDER BY.",
    scoringCriteria:["Uses DATE_TRUNC('day', block_time) for grouping","Uses COUNT(DISTINCT \"from\") for unique wallets","Filters WHERE \"to\" = AVNU contract address","Correctly orders by day DESC"],
    lessonPointer:"Lab 9 SQL Primer L2 — GROUP BY and aggregate functions" },
  { id:"b2", type:"judgment-riskAssess", estimatedMinutes:6,
    description:"Ekubo processes 92% of Starknet spot DEX volume. A competing AMM launches with 0.01% lower fees. Model the 90-day competitive risk to Ekubo's volume market share, using the four moat framework.",
    scoringCriteria:["Applies liquidity depth moat — Ekubo's depth advantage makes its pricing competitive despite higher fees","Applies protocol integrations moat — 7 protocols depend on Ekubo; switching cost is high","Correctly concludes new entrant faces bootstrapping problem, not just fee competition","States specific condition under which Ekubo could lose share (liquidity mining campaign >$5M incentives from competitor)"],
    lessonPointer:"Lab 6 L6.3 — Competitive Moat Analysis" },
  { id:"b3", type:"judgment-dataInterpret", estimatedMinutes:7,
    description:"Starknet weekly new wallet addresses: W1: 12,400. W2: 9,800. W3: 14,200. W4: 8,600. W5: 11,100. W6: 7,300. Calculate 3-week moving average. Identify trend. State the single most important implication for an ecosystem report published this week.",
    scoringCriteria:["3-week MAs correctly calculated: W3 avg≈12,133; W6 avg≈9,000","Identifies downward trend in MA (from ~12K to ~9K = 26% decline)","Correctly characterises as deceleration, not collapse","States specific implication: acquisition growth is slowing — report must address whether retention compensates"],
    lessonPointer:"Lab 9 L9.3 — Protocol Lifecycle Analysis" },
  { id:"b4", type:"judgment-communication", estimatedMinutes:5,
    description:"A senior Starknet Foundation partner asks you to summarise your ecosystem report in 3 sentences for a board meeting. Your full report is 2,400 words. Write the 3-sentence summary. It must include one data point, one competitive comparison, and one actionable recommendation.",
    scoringCriteria:["Contains exactly one specific data point with a number","Contains a cross-chain comparison naming at least one competitor","Ends with a specific actionable recommendation (not a vague suggestion)","Total is 3 sentences or fewer — counted strictly"],
    lessonPointer:"Lab 9 L9.4 — Publishing Ecosystem Research" },
  { id:"b5", type:"sandbox-sql", estimatedMinutes:9,
    description:"Write a Dune SQL query that ranks the top 5 Starknet protocols by unique user count over the past 30 days. Join this with a subquery that counts total transactions per contract. Return: rank, contract_address, unique_users, total_txs, txs_per_user.",
    scoringCriteria:["Correctly uses COUNT(DISTINCT) for unique_users","Calculates txs_per_user as total_txs / unique_users","Filters to past 30 days using block_time >= NOW() - INTERVAL '30' DAY","Uses RANK() window function or ORDER BY with LIMIT 5"],
    lessonPointer:"Lab 9 L9.1 — On-Chain Data as Competitive Intelligence" },
  { id:"b6", type:"judgment-riskAssess", estimatedMinutes:7,
    description:"A Starknet protocol's token has 68% of supply locked in veToken contracts with an average lock duration of 2.3 years. The founder holds 35% of the veToken votes. A governance vote on activating the fee switch requires 51% approval. Model the governance capture risk.",
    scoringCriteria:["Correctly identifies founder's 35% veToken share as below 51% — cannot unilaterally pass votes","Identifies the risk: founder + small coordinated coalition (16%) can reach 51%","Correctly applies token concentration dimension: 35% by one holder = high concentration risk flag","States mitigation: timelock, minimum participation quorum, or vote delegation limits"],
    lessonPointer:"Lab 3 L3.5 — Evaluating Protocol Governance Risk" },
  { id:"b7", type:"judgment-dataInterpret", estimatedMinutes:6,
    description:"You are comparing Starknet to Arbitrum for a cross-chain analysis report. Starknet DEX volume/TVL ratio: 17.4%. Arbitrum DEX volume/TVL ratio: 31.2%. Explain what this ratio measures, what the gap means, and whether it is bullish or bearish for Starknet.",
    scoringCriteria:["Correctly defines volume/TVL as capital efficiency (how hard locked capital is working)","Correctly identifies Starknet's lower ratio as indicating less active trading per dollar of liquidity","Provides a balanced interpretation: could mean user acquisition stage (bullish signal) or shallow liquidity quality (bearish signal)","States the specific data that would determine which interpretation is correct"],
    lessonPointer:"Lab 7 — Cross-Chain Competitive Analysis" },
  { id:"b8", type:"judgment-escalation", estimatedMinutes:5,
    description:"You are mid-way through writing an ecosystem report when you discover that a key data point you cited in the introduction (Starknet TVL = $1.2B) is incorrect — the actual TVL is $847M. The report is 60% complete and due in 2 hours. What do you do?",
    scoringCriteria:["Immediately corrects the data point — does not rationalise leaving the error","Assesses all other data points that depend on the $1.2B figure for knock-on errors","Does not publish with the known error regardless of deadline pressure","States the professional standard: accuracy over deadline on data-driven research"],
    lessonPointer:"Lab 9 L9.4 — Publishing Ecosystem Research" },
];

function BossPhase1({ labName, labNumber, onUnlockPhase2, onSkip }) {
  const DRAW_COUNT = 8;
  const [weights, setWeights]   = useState(
    Object.fromEntries(BOSS_POOL_LAB9.map(t=>[t.id,1]))
  );
  const [drawn, setDrawn]       = useState(null);
  const [taskIdx, setTaskIdx]   = useState(0);
  const [response, setResponse] = useState("");
  const [sessionResults, setSessionResults] = useState([]);
  const [scoring, setScoring]   = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [stage, setStage]       = useState("intro"); // intro|task|review

  const drawTasks = () => {
    // Weighted random draw
    const pool = BOSS_POOL_LAB9;
    const weighted = [];
    pool.forEach(t => {
      const w = weights[t.id] ?? 1;
      for (let i=0;i<Math.round(w*10);i++) weighted.push(t);
    });
    const shuffled = shuffle(weighted);
    const seen = new Set();
    const result = [];
    for (const t of shuffled) {
      if (!seen.has(t.id) && result.length < DRAW_COUNT) {
        seen.add(t.id); result.push(t);
      }
    }
    setDrawn(result); setTaskIdx(0); setSessionResults([]);
    setSessionDone(false); setResponse(""); setHintShown(false);
    setStage("task");
  };

  const submitTask = async () => {
    setScoring(true);
    await delay(1400);
    const task = drawn[taskIdx];
    const r = simulateCriteriaCheck(response, task.scoringCriteria);
    const passed = r.every(x=>x.passed);
    const score = r.filter(x=>x.passed).length / r.length;
    const result = { taskId:task.id, passed, score, criteria:r, task };
    setSessionResults(p=>[...p,result]);
    // Update weights for spaced repetition
    setWeights(prev => ({
      ...prev,
      [task.id]: passed
        ? Math.max(0.5, (prev[task.id]??1) - 0.3)  // passed → appear less
        : Math.min(3, (prev[task.id]??1) + 1),       // failed → appear more
    }));
    setScoring(false);
    setResponse("");
    setHintShown(false);
    if (taskIdx+1 >= DRAW_COUNT) {
      const passCount = sessionResults.filter(x=>x.passed).length + (passed?1:0);
      const pct = passCount/DRAW_COUNT;
      setBestScore(p=>Math.max(p,pct));
      setTotalAttempts(p=>p+1);
      setSessionDone(true);
      setStage("review");
    } else {
      setTaskIdx(i=>i+1);
    }
  };

  const task = drawn?.[taskIdx];
  const wc = response.trim().split(/\s+/).filter(Boolean).length;
  const sessionPassCount = sessionResults.filter(r=>r.passed).length;
  const sessionPct = drawn ? Math.round((sessionPassCount/DRAW_COUNT)*100) : 0;
  const masteryMet = bestScore >= 0.80;

  if (stage === "intro") return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.amber}10, ${C.amber}04)`,
        border:`1px solid ${C.amber}30`, borderRadius:14, padding:20, marginBottom:14,
      }}>
        <div style={{marginBottom:8}}><Tag label="⚔️ Boss Battle — Phase 1" color={C.amber} /></div>
        <div style={{fontSize:20,fontWeight:900,marginBottom:6}}>{labName}</div>
        <div style={{fontSize:13,color:C.textSoft,lineHeight:1.65}}>
          The Learning Loop. Each session draws {DRAW_COUNT} tasks from the pool of {BOSS_POOL_LAB9.length}.
          Hints are available. Tasks rotate — failed tasks appear more often next session.
        </div>
      </div>
      <Card>
        {[["⚔️","Mode","Learning Loop — Phase 1"],
          ["🎲","Tasks drawn",`${DRAW_COUNT} per session (pool: ${BOSS_POOL_LAB9.length})`],
          ["💡","Hints","Available — tap to reveal"],
          ["🔄","Retries","Unlimited — practice until ready"],
          ["🏆","Mastery threshold","80% pass rate to unlock Phase 2"],
        ].map(([i,l,v])=><Row key={l} icon={i} label={l} value={v} />)}
      </Card>
      {totalAttempts > 0 && (
        <div style={{background:masteryMet?C.greenSoft:C.amberSoft,
          border:`1px solid ${masteryMet?C.green:C.amber}30`,
          borderRadius:8,padding:12,marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:masteryMet?C.green:C.amber}}>
            Best score: {Math.round(bestScore*100)}% · {totalAttempts} session{totalAttempts!==1?"s":""}
            {masteryMet ? " — Mastery achieved! Phase 2 unlocked." : ` — Need 80% to unlock Phase 2`}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,flexDirection:"column"}}>
        <Btn label="Start Session" onClick={drawTasks} variant="amber" icon="▶" />
        {masteryMet && (
          <Btn label="Enter Phase 2 →" onClick={onUnlockPhase2} variant="green" icon="🏆" />
        )}
      </div>
      <div style={{marginTop:8}}><Btn label="Skip" onClick={onSkip} variant="ghost" /></div>
    </div>
  );

  if (stage === "review") {
    const allResults = sessionResults;
    return (
      <div className="up">
        <div style={{
          background:sessionPct>=80?C.greenSoft:C.amberSoft,
          border:`1px solid ${sessionPct>=80?C.green:C.amber}40`,
          borderRadius:14,padding:20,textAlign:"center",marginBottom:14,
        }}>
          <ProgressRing pct={sessionPct} size={72} stroke={5}
            color={sessionPct>=80?C.green:C.amber} />
          <div style={{fontSize:22,fontWeight:900,
            color:sessionPct>=80?C.green:C.amber,marginTop:12}}>
            {sessionPassCount}/{DRAW_COUNT} — {sessionPct}%
          </div>
          <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>
            {sessionPct>=80?"Mastery threshold met!" : "Below 80% — review lesson pointers and retry."}
          </div>
        </div>

        <Card>
          <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
            letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Task Results + Lesson Pointers</div>
          {allResults.map((r,i)=>(
            <div key={i} style={{
              borderRadius:8,padding:10,marginBottom:8,
              background:r.passed?C.greenSoft:C.redSoft,
              border:`1px solid ${r.passed?C.green:C.red}25`,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:r.passed?0:6}}>
                {r.passed?<CheckIcon size={14}/>:<XIcon size={14}/>}
                <span style={{fontSize:12,fontWeight:700,color:r.passed?C.green:C.red,flex:1}}>
                  Task {i+1}: {r.passed?"Passed":"Not yet"} · {Math.round(r.score*100)}%
                </span>
              </div>
              {!r.passed && (
                <>
                  {r.criteria.filter(x=>!x.passed).map((c,j)=>(
                    <div key={j} style={{fontSize:11,color:C.textSoft,padding:"2px 0 2px 22px"}}>
                      · Missed: {c.criterion}
                    </div>
                  ))}
                  <div style={{fontSize:11,color:C.accent,padding:"4px 0 0 22px",fontWeight:700}}>
                    📚 Review: {r.task.lessonPointer}
                  </div>
                </>
              )}
            </div>
          ))}
        </Card>

        <div style={{display:"flex",gap:8,flexDirection:"column"}}>
          <Btn label="Try Again (new task mix)" onClick={drawTasks} variant="amber" icon="↩" />
          {masteryMet && (
            <Btn label="Enter Phase 2 — Portfolio Push →" onClick={onUnlockPhase2}
              variant="green" icon="🏆" />
          )}
        </div>
      </div>
    );
  }

  // Task mode
  if (!task) return null;
  const taskMeta = JUDGMENT_META[task.type] ?? JUDGMENT_META["judgment-aggregateRandom"];

  return (
    <div className="up">
      {/* Session progress */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {drawn.map((_,i)=>{
          const res = sessionResults[i];
          return (
            <div key={i} style={{
              flex:1,height:5,borderRadius:3,
              background:i<taskIdx?(res?.passed?C.green:C.red):i===taskIdx?C.amber:C.border,
              transition:"background .3s",
            }} />
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <Tag label={`Task ${taskIdx+1}/${DRAW_COUNT}`} color={C.amber} />
        <Tag label={taskMeta.label} color={taskMeta.color} dot />
      </div>

      <Card color={taskMeta.color}>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
          {task.description}
        </div>
      </Card>

      {/* Hint — Phase 1 only */}
      {!hintShown ? (
        <button onClick={()=>setHintShown(true)} style={{
          fontSize:11,color:C.amber,fontWeight:700,background:"none",
          border:`1px solid ${C.amber}30`,borderRadius:6,
          padding:"4px 10px",cursor:"pointer",marginBottom:10,
        }}>💡 Show hint</button>
      ) : (
        <div className="in" style={{
          background:C.amberSoft,border:`1px solid ${C.amber}30`,
          borderRadius:8,padding:"8px 12px",marginBottom:10,
          fontSize:12,color:C.amber,lineHeight:1.5,
        }}>
          💡 Think about: {task.lessonPointer.split("—")[1]?.trim() ?? "the core concept from this lab"}
        </div>
      )}

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700}}>Response</div>
          <div style={{fontSize:11,color:wc>=40?C.green:C.textMuted}}>{wc} words</div>
        </div>
        <textarea value={response} onChange={e=>setResponse(e.target.value)}
          placeholder="Respond specifically. Use numbers where relevant. Min 40 words." rows={5}
          style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
            border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
        <div style={{marginTop:10}}>
          <Btn label={scoring?"Evaluating…":"Submit"} onClick={submitTask}
            loading={scoring} disabled={wc<40} variant="amber" icon="→" />
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ BOSS BATTLE — PHASE 2 (PORTFOLIO PUSH)
//
// No hints. Fresh unseen scenario. Scored against explicit criteria.
// All criteria must pass for portfolio push to trigger.
// Branch scenario in the final defense question.
// ═══════════════════════════════════════════════════════════════════════════════

const PHASE2_SCENARIO = {
  title: "Starknet Ecosystem State — Portfolio Certification",
  context: `You are presenting your Starknet ecosystem research to the Starknet Foundation Investment Committee.
They have read your published report and are asking follow-up questions.
This is your certification attempt. No hints. All criteria must be met for your portfolio artifact to be generated.`,
  questions: [
    {
      id:"q1",
      question:"Your report claims Starknet's DEX volume-per-wallet is 11× higher than Ethereum's. The committee asks: 'Does this signal ecosystem health or does it just mean Starknet has fewer users?' Write your response in 3 sentences.",
      scoringCriteria:[
        "Acknowledges the metric reflects both — small denominator (fewer wallets) inflates the ratio",
        "States the correct interpretation: high capital efficiency per user, consistent with early-adopter DeFi-native user base",
        "Does not overclaim: notes the ratio will likely compress as mainstream users join (lower average activity per wallet)",
      ],
    },
    {
      id:"q2",
      question:"Your SQL query shows AVNU 7-day volume at $148M. A committee member says your Dune dashboard shows $121M for the same period. Explain the discrepancy. What would cause two Dune queries on the same data to return different results?",
      scoringCriteria:[
        "Identifies schema difference as a likely cause: different event tables (raw transactions vs decoded swap events)",
        "Identifies date boundary difference: exact timestamp used for 7-day window cutoff",
        "Identifies double-counting risk: multi-hop swaps may count as 2 transactions in raw tx table but 1 swap in decoded events",
      ],
    },
    {
      id:"q3",
      question:"The committee asks you to defend your grant proposal's Milestone 1: '500 unique wallets interact with the protocol within 30 days of deployment.' A skeptic says: '500 wallets is trivial — any airdrop can achieve this.' Write your defense in 4 sentences.",
      scoringCriteria:[
        "Distinguishes airdrop wallets (one-off interaction) from genuine users (repeat interaction)",
        "Reframes the milestone: 500 wallets performing the specific protocol function (not just any interaction)",
        "Acknowledges the skeptic's point is valid and commits to adding a secondary metric (e.g. >2 interactions per wallet)",
        "Maintains the 500 figure as a minimum floor, not the ceiling of ambition",
      ],
    },
  ],
};

function BossPhase2({ labName, attemptNumber, onComplete, onSkip }) {
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [results, setResults]   = useState([]);
  const [scoring, setScoring]   = useState(false);
  const [stage, setStage]       = useState("intro"); // intro|questions|verdict
  const [response, setResponse] = useState("");
  const [branchPhase, setBranchPhase] = useState(null); // null | 'strong' | 'partial' | 'incorrect'

  const q = PHASE2_SCENARIO.questions[qIdx];
  const wc = response.trim().split(/\s+/).filter(Boolean).length;

  const submitAnswer = async () => {
    setScoring(true);
    await delay(1800);
    const r = simulateCriteriaCheck(response, q.scoringCriteria);
    const passed = r.every(x=>x.passed);
    const score = r.filter(x=>x.passed).length / r.length;
    const result = { qId:q.id, passed, score, criteria:r, answer:response };
    setResults(p=>[...p, result]);
    setAnswers(p=>({...p,[q.id]:response}));
    setScoring(false);
    setResponse("");

    // Branch scenario on last question
    if (qIdx === PHASE2_SCENARIO.questions.length - 1) {
      const branch = score >= 0.9 ? "strong" : score >= 0.6 ? "partial" : "incorrect";
      setBranchPhase(branch);
    } else if (qIdx+1 < PHASE2_SCENARIO.questions.length) {
      setQIdx(i=>i+1);
    }
  };

  const submitBranch = async () => {
    setScoring(true);
    await delay(1400);
    setScoring(false);
    setStage("verdict");
  };

  const allPassed = results.length === PHASE2_SCENARIO.questions.length &&
    results.every(r=>r.passed);
  const anyFailed = results.some(r=>!r.passed);

  const BRANCH = {
    strong: {
      label:"Strong answer detected", color:C.green,
      followUp:"The committee is impressed. Final question: If Starknet's total TVL doubles to $1.7B in the next 6 months, which single metric in your ecosystem report would be the earliest leading indicator of that growth — and why would it lead TVL rather than lag it?",
      criteria:["Identifies a leading indicator (new wallet count, developer activity, or protocol integrations) not TVL itself","Correctly explains why the chosen metric leads TVL (activity precedes capital deployment)","Names a specific data source where this indicator can be tracked in real time"],
    },
    partial: {
      label:"Partial answer — follow-up question", color:C.amber,
      followUp:"You mentioned the metric issue but didn't address the wallet quality distinction. Specifically: how would you modify your SQL query to filter for wallets with >2 interactions, to separate genuine users from airdrop recipients?",
      criteria:["Adds HAVING COUNT(*) > 2 to filter by interaction count","Correctly identifies this as a post-aggregation filter (HAVING not WHERE)","States the tradeoff: stricter filter reduces count but improves signal quality"],
    },
    incorrect: {
      label:"Incorrect — redirecting", color:C.red,
      followUp:"Let's try a different angle. Your milestone says '500 unique wallets.' If I'm a Foundation reviewer, what is the minimum additional data point I should ask for alongside wallet count to evaluate whether adoption is genuine?",
      criteria:["Names retention rate or repeat interaction rate as the additional metric","Correctly explains why single-interaction wallet count alone is insufficient for evaluating genuine adoption","Proposes a specific threshold (e.g. '30% of wallets return within 14 days')"],
    },
  };

  if (stage === "intro") return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.red}10, ${C.red}04)`,
        border:`1px solid ${C.red}30`, borderRadius:14, padding:20, marginBottom:14,
      }}>
        <div style={{marginBottom:8}}>
          <Tag label="🏆 Boss Battle — Phase 2" color={C.red} />
          <span style={{marginLeft:6}}><Tag label="NO HINTS" color={C.amber} /></span>
          <span style={{marginLeft:6}}><Tag label={`Attempt ${attemptNumber}`} color={C.textMuted} /></span>
        </div>
        <div style={{fontSize:20,fontWeight:900,marginBottom:6}}>{labName} — Certification</div>
        <div style={{fontSize:13,color:C.textSoft,lineHeight:1.65}}>
          {PHASE2_SCENARIO.context}
        </div>
      </div>
      <Card>
        {[["🚫","Hints","None — this is certification mode"],
          ["📋","Questions",`${PHASE2_SCENARIO.questions.length} + 1 branch question`],
          ["✅","Pass condition","All criteria met — 100% required"],
          ["📤","On pass","Portfolio artifact pushed to GitHub"],
          ["🔄","On fail","New scenario generated for next attempt"],
        ].map(([i,l,v])=><Row key={l} icon={i} label={l} value={v} />)}
      </Card>
      <div style={{
        background:C.amberSoft,border:`1px solid ${C.amber}30`,
        borderRadius:8,padding:12,marginBottom:10,fontSize:12,color:C.amber,lineHeight:1.55,
      }}>
        ⚠️ You are entering Portfolio Push Mode. No hints will be given.
        Your portfolio artifact will only be generated if you meet all scoring criteria.
      </div>
      <Btn label="Begin Certification" onClick={()=>setStage("questions")} variant="red" icon="▶" />
      <div style={{marginTop:8}}><Btn label="Return to Phase 1" onClick={onSkip} variant="ghost" /></div>
    </div>
  );

  if (stage === "questions") {
    // Branch question
    if (branchPhase) {
      const branch = BRANCH[branchPhase];
      return (
        <div className="up">
          <div style={{
            background:branch.color+"10",border:`1px solid ${branch.color}30`,
            borderRadius:12,padding:14,marginBottom:12,
          }}>
            <Tag label={branch.label} color={branch.color} />
            <div style={{fontSize:13,color:C.textSoft,marginTop:8,lineHeight:1.55}}>
              Based on your answer, the committee asks a follow-up:
            </div>
          </div>
          <Card color={branch.color}>
            <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{branch.followUp}</div>
          </Card>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700}}>Your Response</div>
              <div style={{fontSize:11,color:wc>=30?C.green:C.textMuted}}>{wc} words</div>
            </div>
            <textarea value={response} onChange={e=>setResponse(e.target.value)}
              placeholder="Respond to the follow-up. No hints. Minimum 30 words." rows={5}
              style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
                border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
            <div style={{marginTop:10}}>
              <Btn label={scoring?"Evaluating…":"Submit Final Answer"}
                onClick={submitBranch} loading={scoring}
                disabled={wc<30} variant="red" icon="→" />
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="up">
        {/* Progress */}
        <div style={{display:"flex",gap:5,marginBottom:12}}>
          {PHASE2_SCENARIO.questions.map((_,i)=>(
            <div key={i} style={{
              flex:1,height:5,borderRadius:3,
              background:i<results.length?(results[i]?.passed?C.green:C.red):
                i===qIdx?C.red:C.border,
            }} />
          ))}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <Tag label={`Q${qIdx+1} of ${PHASE2_SCENARIO.questions.length}`} color={C.red} />
          <Tag label="NO HINTS · PHASE 2" color={C.amber} />
        </div>

        <Card color={C.red}>
          <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{q.question}</div>
        </Card>

        <Card>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700}}>Your Response</div>
            <div style={{fontSize:11,color:wc>=40?C.green:C.textMuted}}>{wc} words</div>
          </div>
          <textarea value={response} onChange={e=>setResponse(e.target.value)}
            placeholder="Answer precisely. No hints available. Minimum 40 words." rows={6}
            style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
              border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
          <div style={{marginTop:10}}>
            <Btn label={scoring?"Evaluating…":"Submit Answer"}
              onClick={submitAnswer} loading={scoring}
              disabled={wc<40} variant="red" icon="→" />
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "verdict") {
    return (
      <div className="up">
        {allPassed ? (
          <>
            <div style={{
              background:C.greenSoft,border:`1px solid ${C.green}40`,
              borderRadius:14,padding:24,textAlign:"center",marginBottom:14,
            }}>
              <div style={{fontSize:44}}>🏆</div>
              <div style={{fontSize:22,fontWeight:900,color:C.green,marginTop:10}}>
                Certification Passed
              </div>
              <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>
                All criteria met. Your portfolio artifact is being generated.
              </div>
            </div>
            <Card>
              <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
                letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Criteria Results</div>
              {results.flatMap(r=>r.criteria).map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,
                  padding:"6px 8px",borderRadius:6,marginBottom:4,background:C.greenSoft}}>
                  <CheckIcon size={14}/>
                  <span style={{fontSize:12,color:C.green,lineHeight:1.5}}>{c.criterion}</span>
                </div>
              ))}
            </Card>
            <Btn label="Push Portfolio →" onClick={onComplete} variant="green" icon="📤" />
          </>
        ) : (
          <>
            <div style={{
              background:C.redSoft,border:`1px solid ${C.red}40`,
              borderRadius:14,padding:24,textAlign:"center",marginBottom:14,
            }}>
              <div style={{fontSize:44}}>⚔️</div>
              <div style={{fontSize:22,fontWeight:900,color:C.red,marginTop:10}}>
                Not Yet — {attemptNumber > 1 ? "Try Again" : "Review and Retry"}
              </div>
              <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>
                A new scenario will be generated for your next attempt.
              </div>
            </div>
            <Card>
              <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
                letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Criteria Results</div>
              {results.flatMap(r=>r.criteria).map((c,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"flex-start",gap:8,
                  padding:"6px 8px",borderRadius:6,marginBottom:4,
                  background:c.passed?C.greenSoft:C.redSoft,
                }}>
                  {c.passed?<CheckIcon size={14}/>:<XIcon size={14}/>}
                  <span style={{fontSize:12,color:c.passed?C.green:C.red,lineHeight:1.5}}>
                    {c.criterion}
                  </span>
                </div>
              ))}
            </Card>
            <Btn label="Return to Phase 1" onClick={onSkip} variant="amber" icon="↩" />
          </>
        )}
      </div>
    );
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ FINAL BOSS — INTERVIEW MODE
//
// Per Section 12: synthesises 3+ labs. No hints. Branch scenarios.
// Pass unlocks next Level. Dynamic generation per attempt.
// ═══════════════════════════════════════════════════════════════════════════════

const FINAL_BOSS_QUESTIONS = [
  {
    id:"fb1",
    context:"[Opening — Labs 1–3 synthesis]",
    question:"Walk me through how you would evaluate whether a new Starknet DeFi protocol is worth covering in an ecosystem report. What are your first three data checks and what would each tell you?",
    scoringCriteria:[
      "Check 1 is on-chain (TVL trend, not just current TVL) — trend more informative than snapshot",
      "Check 2 is tokenomics — specifically FDV vs market cap ratio and insider allocation",
      "Check 3 is governance — upgrade power concentration and whether there is a functioning SNIP equivalent",
      "Each check is linked to a specific data source (DefiLlama, on-chain explorer, Snapshot)",
    ],
    branches: {
      strong: { trigger:"All 3 checks stated with specific data sources", followUp:"Your first check is TVL trend. A protocol shows 40% TVL growth over 30 days but 60% of that is from a single wallet. How does this change your assessment?" },
      partial: { trigger:"2 of 3 checks correct, missing data sources", followUp:"You identified TVL and tokenomics but not governance. What specific governance failure in a Starknet protocol would be the most immediate red flag?" },
      incorrect: { trigger:"Checks are vague or not linked to data", followUp:"Let's be concrete. You have 30 minutes to assess a new Starknet protocol. Name the three URLs you open first and what you look for at each." },
    },
  },
  {
    id:"fb2",
    context:"[Intermediate — Labs 6–7 synthesis]",
    question:"I am looking at your cross-chain comparison report. You claim Starknet's DEX ecosystem has a structural advantage over Arbitrum's. Walk me through the one metric that best supports this claim and one metric that challenges it.",
    scoringCriteria:[
      "Supporting metric correctly identified as volume-per-wallet ratio (Starknet ~11× higher) or equivalent capital efficiency measure",
      "Challenging metric correctly identified as absolute TVL gap ($847M vs $20B+) or user count gap",
      "Does not dismiss the challenge — acknowledges it honestly",
      "States the condition under which the advantage thesis would be falsified (e.g. ratio compresses as Starknet scales)",
    ],
    branches: {
      strong: { trigger:"Both metrics stated with specific numbers and honest trade-off", followUp:"The volume-per-wallet ratio will almost certainly compress as Starknet reaches mass market. At what TVL or wallet count milestone would you revise your 'structural advantage' thesis?" },
      partial: { trigger:"Supporting metric correct, challenge metric vague", followUp:"You named the support metric correctly but were vague on the challenge. Specifically: if Arbitrum's DeFi TVL is 24× Starknet's, what does that mean for a protocol choosing where to deploy?" },
      incorrect: { trigger:"Cannot name specific metrics with numbers", followUp:"Let's use a framework. DefiLlama shows Starknet total fees last 30 days: $890K. Arbitrum: $18.4M. What does this specific gap tell us about ecosystem revenue maturity?" },
    },
  },
  {
    id:"fb3",
    context:"[Senior — Lab 9 synthesis: publishing + SQL]",
    question:"Your ecosystem report is ready to publish. A colleague reviews it and finds that your Dune query for AVNU volume uses the raw transactions table, not the decoded swap events table. The raw table over-counts by including failed transactions. How do you fix this and what is the impact on your report?",
    scoringCriteria:[
      "Correctly identifies the fix: add WHERE success = TRUE or switch to decoded swap events table",
      "Correctly estimates direction of error: raw table over-counts volume vs decoded table",
      "States the impact on the report: AVNU volume figure needs revision; any downstream calculations (volume/wallet ratio, fee estimates) also affected",
      "Commits to publishing a correction note — does not bury the error",
    ],
    branches: {
      strong: { trigger:"All 4 criteria met with specific SQL knowledge", followUp:"After fixing the query, your AVNU 7-day volume drops from $148M to $121M. This is a 18% reduction. How do you communicate this correction to your report's readers on Mirror?" },
      partial: { trigger:"Identifies the fix but misses the downstream impact", followUp:"You fixed the query. But your report's 'volume-per-wallet' ratio was calculated using the old $148M figure. Walk me through every number in your report that needs to be recalculated." },
      incorrect: { trigger:"Cannot distinguish raw transactions from decoded events", followUp:"Dune has two types of tables: raw (starknet.transactions) and decoded (decoded_starknet.*_evt_Swap). What is the fundamental difference between them, and which is more reliable for measuring DEX volume?" },
    },
  },
];

function FinalBoss({ levelName, labsCompleted, attemptNumber, onComplete, onSkip }) {
  const [qIdx, setQIdx]         = useState(0);
  const [response, setResponse] = useState("");
  const [results, setResults]   = useState([]);
  const [scoring, setScoring]   = useState(false);
  const [stage, setStage]       = useState("intro"); // intro|questions|branch|verdict
  const [branchData, setBranchData] = useState(null);
  const [branchResponse, setBranchResponse] = useState("");

  const q = FINAL_BOSS_QUESTIONS[qIdx];
  const wc = response.trim().split(/\s+/).filter(Boolean).length;
  const bwc = branchResponse.trim().split(/\s+/).filter(Boolean).length;

  const submitQ = async () => {
    setScoring(true);
    await delay(2000);
    const r = simulateCriteriaCheck(response, q.scoringCriteria);
    const passed = r.every(x=>x.passed);
    const score = r.filter(x=>x.passed).length / r.length;
    // Determine branch
    const branch = score >= 0.85 ? "strong" : score >= 0.55 ? "partial" : "incorrect";
    setResults(p=>[...p,{qId:q.id,passed,score,criteria:r,answer:response}]);
    setBranchData({ ...q.branches[branch], type:branch, qLabel:`Q${qIdx+1}` });
    setResponse("");
    setScoring(false);
    setStage("branch");
  };

  const submitBranch = async () => {
    setScoring(true);
    await delay(1400);
    setScoring(false);
    setBranchData(null);
    setBranchResponse("");
    if (qIdx+1 < FINAL_BOSS_QUESTIONS.length) {
      setQIdx(i=>i+1);
      setStage("questions");
    } else {
      setStage("verdict");
    }
  };

  const allPassed = results.length === FINAL_BOSS_QUESTIONS.length && results.every(r=>r.passed);
  const passCount = results.filter(r=>r.passed).length;

  const BRANCH_COLOR = { strong:C.green, partial:C.amber, incorrect:C.red };

  if (stage === "intro") return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.pink}12, ${C.violet}06)`,
        border:`1px solid ${C.pink}30`, borderRadius:14, padding:20, marginBottom:14,
      }}>
        <div style={{marginBottom:8}}>
          <Tag label="👑 FINAL BOSS" color={C.pink} />
          <span style={{marginLeft:6}}><Tag label="Interview Mode" color={C.violet} /></span>
          <span style={{marginLeft:6}}><Tag label={`Attempt ${attemptNumber}`} color={C.textMuted} /></span>
        </div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>{levelName}</div>
        <div style={{fontSize:13,color:C.textSoft,lineHeight:1.65}}>
          Synthesises Labs {labsCompleted.join(", ")}. Branch scenarios active.
          Your answers determine the next question. No hints. No lesson pointers.
          Pass to unlock the next Level.
        </div>
      </div>
      <Card>
        {[["👑","Mode","Final Boss — Interview Mode"],
          ["🌿","Synthesises",`Labs ${labsCompleted.join(", ")}`],
          ["🔀","Branch scenarios","Your answer quality determines follow-up depth"],
          ["🚫","Hints","None — this is a live interview simulation"],
          ["🏅","On pass","Next Level unlocked + Level Completion Artifact pushed"],
        ].map(([i,l,v])=><Row key={l} icon={i} label={l} value={v} />)}
      </Card>
      <Btn label="Begin Final Boss" onClick={()=>setStage("questions")} variant="pink" icon="👑" />
      <div style={{marginTop:8}}><Btn label="Not ready — go back" onClick={onSkip} variant="ghost" /></div>
    </div>
  );

  if (stage === "branch" && branchData) {
    const bc = BRANCH_COLOR[branchData.type];
    return (
      <div className="up">
        <div style={{
          background:bc+"10",border:`1px solid ${bc}30`,
          borderRadius:12,padding:14,marginBottom:12,
        }}>
          <Tag label={`${branchData.type === "strong"?"↑ Strong":"↓ "+(branchData.type==="partial"?"Partial":"Incorrect")} — Follow-up`}
            color={bc} />
          <div style={{fontSize:12,color:C.textSoft,marginTop:8,lineHeight:1.55}}>
            Interviewer follow-up based on your {branchData.qLabel} response:
          </div>
        </div>
        <Card color={bc}>
          <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{branchData.followUp}</div>
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700}}>Your Response</div>
            <div style={{fontSize:11,color:bwc>=30?C.green:C.textMuted}}>{bwc} words</div>
          </div>
          <textarea value={branchResponse} onChange={e=>setBranchResponse(e.target.value)}
            placeholder="Respond to the follow-up. Minimum 30 words." rows={5}
            style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
              border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
          <div style={{marginTop:10}}>
            <Btn label={scoring?"Evaluating…":"Continue →"}
              onClick={submitBranch} loading={scoring}
              disabled={bwc<30} variant="pink" icon="→" />
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "questions") return (
    <div className="up">
      {/* Progress */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {FINAL_BOSS_QUESTIONS.map((_,i)=>(
          <div key={i} style={{
            flex:1,height:5,borderRadius:3,
            background:i<results.length?(results[i].passed?C.green:C.red):
              i===qIdx?C.pink:C.border,
          }} />
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <Tag label={`Q${qIdx+1}/${FINAL_BOSS_QUESTIONS.length} · ${q.context}`} color={C.pink} />
        <Tag label="FINAL BOSS" color={C.violet} />
      </div>
      <Card color={C.pink}>
        <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{q.question}</div>
      </Card>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700}}>Your Response</div>
          <div style={{fontSize:11,color:wc>=50?C.green:C.textMuted}}>{wc} words</div>
        </div>
        <textarea value={response} onChange={e=>setResponse(e.target.value)}
          placeholder="Answer with full specificity. No hints. Minimum 50 words." rows={7}
          style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
            border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
        <div style={{marginTop:10}}>
          <Btn label={scoring?"Evaluating…":"Submit"} onClick={submitQ}
            loading={scoring} disabled={wc<50} variant="pink" icon="→" />
        </div>
      </Card>
    </div>
  );

  if (stage === "verdict") return (
    <div className="up">
      {allPassed ? (
        <>
          <div style={{
            background:`linear-gradient(135deg, ${C.green}15, ${C.green}05)`,
            border:`1px solid ${C.green}40`,borderRadius:14,padding:24,
            textAlign:"center",marginBottom:14,
          }}>
            <div style={{fontSize:52}}>🏅</div>
            <div style={{fontSize:24,fontWeight:900,color:C.green,marginTop:12}}>
              Final Boss Defeated
            </div>
            <div style={{fontSize:14,color:C.textSoft,marginTop:6}}>
              {levelName} Complete. Next Level is now unlocked.
            </div>
          </div>
          <Card>
            <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
              letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>All Criteria Met</div>
            {results.flatMap(r=>r.criteria).map((c,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 8px",
                borderRadius:6,marginBottom:3,background:C.greenSoft}}>
                <CheckIcon size={13}/>
                <span style={{fontSize:11,color:C.green,lineHeight:1.5}}>{c.criterion}</span>
              </div>
            ))}
          </Card>
          <Btn label="Claim Level Badge →" onClick={onComplete} variant="green" icon="🏅" />
        </>
      ) : (
        <>
          <div style={{
            background:C.redSoft,border:`1px solid ${C.red}40`,
            borderRadius:14,padding:24,textAlign:"center",marginBottom:14,
          }}>
            <div style={{fontSize:52}}>⚔️</div>
            <div style={{fontSize:22,fontWeight:900,color:C.red,marginTop:12}}>
              Not Yet — {passCount}/{FINAL_BOSS_QUESTIONS.length} Questions Passed
            </div>
            <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>
              A new scenario will be generated for your next attempt.
              No lesson pointers — review all labs independently.
            </div>
          </div>
          <Card>
            {results.map((r,i)=>(
              <div key={i} style={{
                borderRadius:8,padding:10,marginBottom:8,
                background:r.passed?C.greenSoft:C.redSoft,
                border:`1px solid ${r.passed?C.green:C.red}25`,
              }}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:r.passed?0:6}}>
                  {r.passed?<CheckIcon size={14}/>:<XIcon size={14}/>}
                  <span style={{fontSize:12,fontWeight:700,
                    color:r.passed?C.green:C.red}}>Q{i+1}: {r.passed?"Passed":"Not yet"}</span>
                </div>
                {!r.passed && r.criteria.filter(c=>!c.passed).map((c,j)=>(
                  <div key={j} style={{fontSize:11,color:C.textSoft,padding:"2px 0 2px 22px"}}>
                    · {c.criterion}
                  </div>
                ))}
              </div>
            ))}
          </Card>
          <Btn label="Try Again" onClick={onSkip} variant="amber" icon="↩" />
        </>
      )}
    </div>
  );
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ ECOSYSTEM OPPORTUNITY SIM (Lab 8 gap analysis mode)
// ═══════════════════════════════════════════════════════════════════════════════

const OPPORTUNITIES = {
  options: {
    label:"Options Protocol Gap", icon:"📉", color:C.violet,
    starknetTVL:"$0", ethEquiv:"$890M (Lyra + Dopex + Panoptic)", gap:"$890M",
    metrics:[
      ["Starknet options TVL","$0","No dominant protocol"],
      ["Ethereum options TVL","$890M","Lyra, Dopex, Panoptic combined"],
      ["Arbitrum options TVL","$215M","Lyra Finance dominant"],
      ["Market gap","$890M+ TAM","On Starknet: entirely open"],
      ["Technical blocker","High liquidity fragmentation","Options need depth across strikes"],
    ],
    opportunity:"Options trading generates 8–15× more volume per dollar of TVL than spot DEX. A Starknet options protocol capturing even 5% of Ethereum's options volume would represent $44M+ monthly.",
    challenge:"Options require liquidity across many strike prices simultaneously. Bootstrapping this is harder than a spot DEX. The technical challenge is solvable with concentrated liquidity vaults — AVNU + Ekubo infrastructure already exists.",
  },
  aggregator: {
    label:"Yield Aggregator Gap", icon:"🔄", color:C.cyan,
    starknetTVL:"$0 (no dominant protocol)", ethEquiv:"$6B peak (Yearn Finance)", gap:"Entire category",
    metrics:[
      ["Starknet yield agg TVL","$0","Category does not exist"],
      ["Ethereum Yearn TVL","$480M (current)","Post-peak, still significant"],
      ["Starknet raw yield sources","3 active","Vesu, Nostra, STRK staking"],
      ["Automation primitives","Available","AVNU DCA exists; composability proven"],
      ["Developer effort","Medium","Requires integration, not novel protocol"],
    ],
    opportunity:"A yield aggregator on Starknet would be entirely novel — no competitor to beat. The component protocols (Vesu, STRK staking, AVNU) already exist. The gap is orchestration, not infrastructure. Grant-eligible as a public good.",
    challenge:"Yield aggregators require ongoing active management (rebalancing, gas optimisation). The Starknet user base is currently too small for autonomous vault strategies to generate meaningful management fees.",
  },
  rwa: {
    label:"Real World Asset Gap", icon:"🏛️", color:C.green,
    starknetTVL:"~$0", ethEquiv:"$8B+ (Ondo, Maple, Centrifuge)", gap:"$8B+",
    metrics:[
      ["Starknet RWA TVL","~$0","No meaningful protocols"],
      ["Ethereum RWA TVL","$8.2B","Ondo, Maple, Centrifuge, Goldfinch"],
      ["Ondo Finance","$2.1B","Tokenised US T-bills"],
      ["Regulatory clarity","Chain-agnostic","Not a Starknet-specific barrier"],
      ["Key missing link","Institutional liquidity","Starknet TVL too small for inst. capital"],
    ],
    opportunity:"RWA is the fastest-growing DeFi category (2024–2025: $1B → $8B+). Starknet's ZK privacy features (Tongo) could enable privacy-preserving RWA (institution doesn't expose portfolio composition on-chain). This is a differentiated angle vs Ethereum RWA.",
    challenge:"Institutional adoption requires regulatory compliance infrastructure, KYC, and legal wrappers — none of which are on-chain problems. Starknet's small current TVL is an obstacle to institutional capital allocation thresholds ($50M+ minimum).",
  },
  dca_mobile: {
    label:"Mobile DCA Interface Gap", icon:"📱", color:C.pink,
    starknetTVL:"Existing (AVNU DCA)", ethEquiv:"Not mobile-native anywhere", gap:"UX gap, not protocol gap",
    metrics:[
      ["AVNU DCA","Exists","Desktop/web only"],
      ["Mobile Starknet DCA","None","No dedicated mobile-first interface"],
      ["Starkzap SDK","Available","React Native support confirmed"],
      ["Target users","Mobile-first retail","~65% DeFi users prefer mobile"],
      ["Competitive barrier","Low","SDK + AVNU DCA already built"],
    ],
    opportunity:"This is a UX gap, not a protocol gap. The infrastructure (AVNU DCA + Starkzap SDK) exists. A mobile-first DCA interface could be built with 1–2 developers in under 3 months. Grant-eligible at SEED level ($50–150K).",
    challenge:"Mobile DeFi interfaces have notoriously low retention (average user makes 1–3 transactions then churns). The opportunity requires a retention strategy, not just a functional app.",
  },
};

function EcosystemOpportunitySim({ gapType="options", onComplete, onSkip }) {
  const opp = OPPORTUNITIES[gapType] ?? OPPORTUNITIES["options"];
  const [stage, setStage]       = useState("idle"); // idle|loading|data|memo
  const [memo, setMemo]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wc = memo.trim().split(/\s+/).filter(Boolean).length;
  const MIN_WORDS = 120;

  const fetchData = async () => {
    setStage("loading");
    await delay(1800);
    setStage("data");
  };

  const submitMemo = async () => {
    await delay(800);
    setSubmitted(true);
  };

  return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${opp.color}12, ${opp.color}04)`,
        border:`1px solid ${opp.color}30`, borderRadius:12,
        padding:14, marginBottom:12,
      }}>
        <div style={{marginBottom:6}}>
          <Tag label="🔍 Opportunity Analysis" color={opp.color} dot />
        </div>
        <div style={{fontSize:18,fontWeight:900,marginBottom:4}}>{opp.icon} {opp.label}</div>
        <div style={{fontSize:12,color:C.textSoft,lineHeight:1.55}}>
          Fetch live data to quantify the gap, then write your opportunity memo.
        </div>
      </div>

      {stage === "idle" && (
        <Btn label="📡 Fetch Gap Data" onClick={fetchData} variant="primary" icon="📡" />
      )}

      {stage === "loading" && (
        <Card>
          {["Querying DefiLlama for Starknet category TVL…",
            "Querying Ethereum equivalent protocols…",
            "Calculating market size gap…"].map((msg,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,
              padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <Spinner size={13} color={opp.color} />
              <span style={{fontSize:12,color:C.textSoft}}>{msg}</span>
            </div>
          ))}
        </Card>
      )}

      {(stage === "data" || stage === "memo") && (
        <>
          {/* Gap headline */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[["Starknet TVL",opp.starknetTVL,C.red],
              ["Ethereum Equiv",opp.ethEquiv.split(" (")[0],C.green],
              ["Market Gap",opp.gap,opp.color],
            ].map(([k,v,c])=>(
              <div key={k} style={{background:C.bgEl,borderRadius:8,padding:"10px 12px",
                border:`1px solid ${c}30`,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:900,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Metrics table */}
          <Card>
            <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
              letterSpacing:.9,textTransform:"uppercase",marginBottom:8}}>Market Data</div>
            {opp.metrics.map(([l,v,n])=>(
              <div key={l} style={{display:"flex",alignItems:"center",
                padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{flex:1,fontSize:12,color:C.textSoft}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.text,marginRight:8}}>{v}</span>
                <span style={{fontSize:10,color:C.textMuted,maxWidth:120,textAlign:"right"}}>{n}</span>
              </div>
            ))}
          </Card>

          {/* Opportunity + challenge */}
          <Card color={opp.color}>
            <div style={{fontSize:11,fontWeight:800,color:opp.color,marginBottom:6}}>
              🎯 Opportunity
            </div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:12}}>
              {opp.opportunity}
            </div>
            <div style={{fontSize:11,fontWeight:800,color:C.amber,marginBottom:6}}>
              ⚠️ Key Challenge
            </div>
            <div style={{fontSize:12,color:C.textSoft,lineHeight:1.6}}>
              {opp.challenge}
            </div>
          </Card>

          {/* Opportunity memo */}
          {!submitted ? (
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700}}>Opportunity Memo</div>
                <div style={{fontSize:11,color:wc>=MIN_WORDS?C.green:C.textMuted}}>
                  {wc}/{MIN_WORDS} words
                </div>
              </div>
              <div style={{fontSize:11,color:C.textSoft,marginBottom:8,lineHeight:1.5}}>
                Write: (1) the unsolved problem, (2) the current workaround, (3) why a Starknet-native solution is technically feasible now, (4) your 12-month success metric.
              </div>
              <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                placeholder="Use the data above. Be specific — include numbers from the metrics table." rows={7}
                style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
                  border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
              <div style={{marginTop:10}}>
                <Btn label="Submit Memo" onClick={submitMemo}
                  disabled={wc<MIN_WORDS} variant="primary" icon="→" />
              </div>
            </Card>
          ) : (
            <>
              <div style={{
                background:C.greenSoft,border:`1px solid ${C.green}40`,
                borderRadius:10,padding:14,marginBottom:10,
              }}>
                <div style={{fontSize:14,fontWeight:900,color:C.green,marginBottom:4}}>
                  ✅ Opportunity Memo Complete
                </div>
                <div style={{fontSize:12,color:C.textSoft}}>
                  {wc} words · Attached to Lab 8 Build Task portfolio artifact.
                </div>
              </div>
              <Btn label="Continue →" onClick={onComplete} variant="pink" />
            </>
          )}
        </>
      )}

      <div style={{marginTop:8}}>
        <Btn label="Skip" onClick={onSkip} variant="ghost" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑦ RESEARCH WRITER — FORUM MODE (L9.4 — Starknet forum export)
// ═══════════════════════════════════════════════════════════════════════════════

const FORUM_SECTIONS = [
  { id:"title",   label:"Thread Title",       min:5,  ph:"[Ecosystem Analysis] Your specific claim — include protocol name and metric" },
  { id:"summary", label:"Summary (50 words)", min:30, ph:"Accessible to non-technical readers. What did you find? Why does it matter?" },
  { id:"analysis",label:"Technical Analysis", min:200,ph:"Present your data. Cite Dune query links. Show your working. Use specific numbers." },
  { id:"open",    label:"Open Questions",     min:40, ph:"What don't you know? What would change your conclusion? Be honest — this builds credibility." },
  { id:"cta",     label:"Call for Feedback",  min:20, ph:"Ask 2–3 specific questions for the community to address." },
];

function ResearchWriterForum({ onComplete, onSkip }) {
  const [content, setContent] = useState(Object.fromEntries(FORUM_SECTIONS.map(s=>[s.id,""])));
  const [active, setActive]   = useState("title");
  const [stage, setStage]     = useState("writing"); // writing|preview|publishing|done

  const rubric = FORUM_SECTIONS.map(s=>({...s,
    wc:s.id==="title"?s.min:content[s.id].trim().split(/\s+/).filter(Boolean).length,
    passed:s.id==="title"?content[s.id].trim().length>0:
      content[s.id].trim().split(/\s+/).filter(Boolean).length>=s.min,
  }));
  const allPassed = rubric.every(r=>r.passed);
  const totalWc = Object.entries(content).filter(([k])=>k!=="title")
    .reduce((a,[,v])=>a+v.trim().split(/\s+/).filter(Boolean).length,0);

  const publish = async () => {
    setStage("publishing");
    await delay(2000);
    setStage("done");
  };

  if (stage === "done") return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.cyan}12, ${C.cyan}04)`,
        border:`1px solid ${C.cyan}40`, borderRadius:14,
        padding:24, textAlign:"center", marginBottom:14,
      }}>
        <div style={{fontSize:48}}>💬</div>
        <div style={{fontSize:20,fontWeight:900,color:C.cyan,marginTop:10}}>
          Posted to Starknet Forum
        </div>
        <div style={{fontSize:12,color:C.textSoft,marginTop:4}}>
          {totalWc} words · community.starknet.io
        </div>
      </div>
      <a href="https://community.starknet.io" target="_blank" rel="noreferrer"
        style={{display:"block",textAlign:"center",fontSize:12,color:C.cyan,
          fontWeight:700,textDecoration:"none",marginBottom:12}}>
        View on Starknet Forum →
      </a>
      <Btn label="Continue →" onClick={onComplete} variant="pink" />
    </div>
  );

  return (
    <div className="up">
      <div style={{
        background:`linear-gradient(135deg, ${C.cyan}10, ${C.cyan}04)`,
        border:`1px solid ${C.cyan}30`, borderRadius:12,
        padding:14, marginBottom:12,
      }}>
        <div style={{marginBottom:6}}><Tag label="💬 Starknet Forum" color={C.cyan} dot /></div>
        <div style={{fontSize:17,fontWeight:900,marginBottom:4}}>community.starknet.io</div>
        <div style={{fontSize:12,color:C.textSoft,lineHeight:1.55}}>
          Technical community format. More concise than Mirror. Structured for developer and researcher audiences.
        </div>
      </div>

      {/* Section tabs */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
        {rubric.map(s=>(
          <button key={s.id} onClick={()=>setActive(s.id)} style={{
            padding:"5px 10px", borderRadius:6,
            border:`1px solid ${active===s.id?C.cyan:s.passed?C.green+"50":C.border}`,
            background:active===s.id?C.cyan+"20":s.passed?C.greenSoft:"transparent",
            color:active===s.id?C.cyan:s.passed?C.green:C.textSoft,
            fontSize:11, fontWeight:700, cursor:"pointer",
          }}>
            {s.passed?"✓ ":""}{s.label.split(" (")[0]}
          </button>
        ))}
      </div>

      {/* Editor */}
      {FORUM_SECTIONS.map(s => s.id===active && (
        <Card key={s.id} color={C.cyan}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:800,color:C.cyan}}>{s.label}</span>
            {s.id!=="title" && (
              <span style={{fontSize:11,color:rubric.find(r=>r.id===s.id)?.passed?C.green:C.textMuted}}>
                {content[s.id].trim().split(/\s+/).filter(Boolean).length}/{s.min} words
              </span>
            )}
          </div>
          {s.id==="title" ? (
            <input value={content[s.id]} onChange={e=>setContent(p=>({...p,[s.id]:e.target.value}))}
              placeholder={s.ph}
              style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
                border:`1.5px solid ${C.border}`,color:C.text,fontSize:14,fontWeight:700}} />
          ) : (
            <textarea value={content[s.id]} onChange={e=>setContent(p=>({...p,[s.id]:e.target.value}))}
              placeholder={s.ph} rows={s.id==="analysis"?10:5}
              style={{width:"100%",padding:10,background:C.bgEl,borderRadius:8,
                border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,lineHeight:1.65}} />
          )}
          {!rubric.find(r=>r.id===s.id)?.passed && s.id!=="title" && (
            <div style={{marginTop:6,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:C.cyan,borderRadius:2,
                width:`${Math.min(100,(content[s.id].trim().split(/\s+/).filter(Boolean).length/s.min)*100)}%`,
                transition:"width .3s"}} />
            </div>
          )}
        </Card>
      ))}

      {/* Rubric */}
      <Card>
        <div style={{fontSize:11,fontWeight:800,color:C.textMuted,
          letterSpacing:.9,textTransform:"uppercase",marginBottom:8}}>Post Checklist</div>
        {rubric.map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:12}}>{r.passed?"✅":"⬜"}</span>
            <span style={{flex:1,fontSize:12,color:r.passed?C.green:C.textSoft}}>{r.label}</span>
            {r.id!=="title" && (
              <span style={{fontSize:10,color:C.textMuted,fontFamily:C.mono}}>
                {r.wc}/{r.min}w
              </span>
            )}
          </div>
        ))}
      </Card>

      {allPassed ? (
        <div style={{display:"flex",gap:8,flexDirection:"column"}}>
          <Btn label="💬 Post to Starknet Forum" onClick={publish}
            loading={stage==="publishing"} variant="primary"
            icon="💬" />
          <Btn label="📄 Export as Markdown" onClick={publish}
            loading={stage==="publishing"} variant="ghost" />
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <span style={{fontSize:12,color:C.textMuted}}>
            Complete all sections to publish.
          </span>
        </div>
      )}
      <div style={{marginTop:8}}><Btn label="Skip" onClick={onSkip} variant="ghost" /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO SHELL
// ═══════════════════════════════════════════════════════════════════════════════

// Sample lesson sim data for judgment demos
const SAMPLE_JUDGMENT_SIMS = {
  "judgment-riskAssess": {
    scenario:`Vesu currently has $98M TVL with 70% utilisation (ratio of total borrows to total deposits). The Starknet sequencer went offline for 45 minutes last Tuesday. During that window, ETH dropped 12% and no liquidations could be executed.

Identify the three distinct risks this combination reveals. For each risk, state: (1) the specific failure mode, (2) the affected stakeholders, (3) a concrete mitigation.`,
    scoringCriteria:[
      "Identifies sequencer centralisation as a systemic risk creating liquidation blindspots during outages",
      "Identifies oracle lag risk: if ETH price feed also paused, collateral valuations were stale during the drop",
      "Identifies lender exposure: borrowers who should have been liquidated may now be undercollateralised",
      "Proposes at least one concrete mitigation with a specific mechanism (e.g. emergency pause trigger, fallback oracle)",
    ],
  },
  "judgment-communication": {
    scenario:`You are in a first-round interview at a crypto venture fund. The partner asks:

"Explain account abstraction to me in 2 sentences. I understand traditional fintech but I've never used a crypto wallet."

Your answer must: avoid jargon without definition, include one concrete feature as an example, and convey why it matters for mainstream adoption.`,
    scoringCriteria:[
      "Correctly explains AA without using 'smart contract' as unexplained jargon",
      "Includes a concrete feature example (e.g. Face ID login, email recovery, no seed phrase)",
      "States a specific mainstream adoption implication (e.g. onboarding feels like a banking app, not a crypto wallet)",
    ],
  },
  "judgment-dataInterpret": {
    scenario:`You are reviewing Starknet's weekly new wallet data:
Week 1: 12,400 new wallets
Week 2: 9,800 new wallets
Week 3: 14,200 new wallets
Week 4: 8,600 new wallets
Week 5: 11,100 new wallets
Week 6: 7,300 new wallets

Calculate the 3-week moving average for weeks 3, 4, 5, and 6. Identify the trend direction. State one specific implication for a protocol considering launching on Starknet in Week 7.`,
    scoringCriteria:[
      "W3 MA correctly calculated: (12400+9800+14200)/3 = 12,133",
      "W6 MA correctly calculated: (8600+11100+7300)/3 = 9,000",
      "Correctly identifies downward trend in MA (12,133 → 9,000 = 26% decline)",
      "States a specific W7 implication tied to the trend (e.g. launch timing, incentive requirement, user acquisition budget)",
    ],
  },
  "judgment-escalation": {
    scenario:`A governance proposal (SNIP-22) on the Starknet forum proposes giving the Starknet Foundation the ability to pause any DeFi protocol unilaterally for up to 72 hours without a community vote, citing "emergency security response" as justification.

Voting is open for 5 days. You hold 15,000 STRK.

State clearly: vote For or Against? Then explain the single most important principle driving your decision — not a list of pros and cons.`,
    scoringCriteria:[
      "States a clear vote direction (For or Against) — no 'it depends' as a final answer",
      "Identifies the core principle: permissionless access vs emergency security response power",
      "Addresses the key risk of their chosen direction honestly (For: centralisation risk; Against: attack surface remains open)",
      "Does not list generic pros/cons — anchors the decision on one specific governance principle",
    ],
  },
  "judgment-ethicalChoice": {
    scenario:`You are a Starknet ecosystem analyst with a public research newsletter (3,200 subscribers). You gave Protocol X a "Strong Buy" rating 6 weeks ago. Today, a developer in a private Telegram group shares an unverified report claiming Protocol X has a critical smart contract vulnerability — unfixed.

The developer asks you not to share this publicly until they can confirm it with the team (estimated 48 hours).

What do you do in the next 24 hours? Be specific about each action.`,
    scoringCriteria:[
      "Does not publish the unverified claim publicly before team confirmation (avoids potential defamation and market panic)",
      "Takes a protective action for subscribers without revealing the specific unverified claim (e.g. updates rating to 'Under Review — pending technical verification')",
      "Sets a hard deadline: if team does not confirm or deny within 48 hours, escalates independently",
      "Correctly identifies the competing duties: reader protection vs source confidentiality vs unverified information risk",
    ],
  },
};

const MISSING_SIMS = [
  {
    group: "Judgment Simulators",
    items: [
      { id:"j-risk",     label:"judgment-riskAssess",     icon:"⚠️",  color:"#f59e0b" },
      { id:"j-comm",     label:"judgment-communication",  icon:"💬",  color:"#06b6d4" },
      { id:"j-data",     label:"judgment-dataInterpret",  icon:"📊",  color:"#6366f1" },
      { id:"j-esc",      label:"judgment-escalation",     icon:"📈",  color:"#8b5cf6" },
      { id:"j-ethics",   label:"judgment-ethicalChoice",  icon:"⚖️",  color:"#ef4444" },
    ],
  },
  {
    group: "Lab Structure",
    items: [
      { id:"aggregate",  label:"Aggregate Sim Shell",     icon:"🎲",  color:"#8b5cf6" },
      { id:"boss-p1",    label:"Boss Battle Phase 1",     icon:"⚔️",  color:"#f59e0b" },
      { id:"boss-p2",    label:"Boss Battle Phase 2",     icon:"🏆",  color:"#ef4444" },
      { id:"final-boss", label:"Final Boss (Interview)",  icon:"👑",  color:"#ec4899" },
    ],
  },
  {
    group: "Ecosystem Deep Dive",
    items: [
      { id:"opp-options", label:"Opportunity: Options Gap",    icon:"📉", color:"#8b5cf6" },
      { id:"opp-agg",     label:"Opportunity: Yield Agg Gap",  icon:"🔄", color:"#06b6d4" },
      { id:"opp-rwa",     label:"Opportunity: RWA Gap",        icon:"🏛️", color:"#10b981" },
      { id:"opp-dca",     label:"Opportunity: Mobile DCA Gap", icon:"📱", color:"#ec4899" },
      { id:"forum",       label:"Research Writer — Forum",     icon:"💬", color:"#06b6d4" },
    ],
  },
];

export default function App() {
  const [activeId, setActiveId] = useState("j-risk");
  const [completed, setCompleted] = useState([]);
  const [bossPhase, setBossPhase] = useState(1);

  const all = MISSING_SIMS.flatMap(g=>g.items);
  const active = all.find(s=>s.id===activeId);

  const shared = { onComplete:()=>setCompleted(p=>[...new Set([...p,activeId])]), onSkip:()=>{} };

  const renderSim = () => {
    switch(activeId) {
      case "j-risk":    return <JudgmentSim type="judgment-riskAssess"    hintsEnabled {...SAMPLE_JUDGMENT_SIMS["judgment-riskAssess"]}    {...shared} key={activeId} />;
      case "j-comm":    return <JudgmentSim type="judgment-communication" hintsEnabled {...SAMPLE_JUDGMENT_SIMS["judgment-communication"]}  {...shared} key={activeId} />;
      case "j-data":    return <JudgmentSim type="judgment-dataInterpret" hintsEnabled {...SAMPLE_JUDGMENT_SIMS["judgment-dataInterpret"]}  {...shared} key={activeId} />;
      case "j-esc":     return <JudgmentSim type="judgment-escalation"    hintsEnabled {...SAMPLE_JUDGMENT_SIMS["judgment-escalation"]}     {...shared} key={activeId} />;
      case "j-ethics":  return <JudgmentSim type="judgment-ethicalChoice" hintsEnabled {...SAMPLE_JUDGMENT_SIMS["judgment-ethicalChoice"]}  {...shared} key={activeId} />;
      case "aggregate": return <AggregateSimShell labName="Lab 9 — Strategic Ecosystem Analysis" simCount={6} {...shared} key={activeId} />;
      case "boss-p1":   return <BossPhase1 labName="Lab 9 — Strategic Ecosystem Analysis" labNumber={9} onUnlockPhase2={()=>setBossPhase(2)} {...shared} key={activeId} />;
      case "boss-p2":   return <BossPhase2 labName="Lab 9 — Strategic Ecosystem Analysis" attemptNumber={1} {...shared} key={activeId} />;
      case "final-boss":return <FinalBoss levelName="Ecosystem Deep Dive — Senior Level" labsCompleted={[1,2,3,6,7,9]} attemptNumber={1} {...shared} key={activeId} />;
      case "opp-options":return <EcosystemOpportunitySim gapType="options"    {...shared} key={activeId} />;
      case "opp-agg":   return <EcosystemOpportunitySim gapType="aggregator"  {...shared} key={activeId} />;
      case "opp-rwa":   return <EcosystemOpportunitySim gapType="rwa"         {...shared} key={activeId} />;
      case "opp-dca":   return <EcosystemOpportunitySim gapType="dca_mobile"  {...shared} key={activeId} />;
      case "forum":     return <ResearchWriterForum {...shared} key={activeId} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", fontFamily:"'Syne', sans-serif" }}>
      <style>{css}</style>

      {/* Sidebar */}
      <div style={{
        width:234, flexShrink:0, background:C.bgCard,
        borderRight:`1px solid ${C.border}`,
        position:"sticky", top:0, height:"100vh", overflowY:"auto",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{ padding:"18px 16px 12px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{fontSize:10,fontWeight:800,color:C.pink,letterSpacing:1.8,marginBottom:2}}>
            SIFTER SKILLUP
          </div>
          <div style={{fontSize:14,fontWeight:900,color:C.text}}>Missing Simulators</div>
          <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>
            {completed.length}/{all.length} tested
          </div>
          <div style={{marginTop:6,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",background:C.pink,borderRadius:2,
              width:`${(completed.length/all.length)*100}%`,transition:"width .3s"}} />
          </div>
        </div>

        <div style={{flex:1,padding:"8px 0"}}>
          {MISSING_SIMS.map(group => (
            <div key={group.group}>
              <div style={{padding:"10px 16px 4px",fontSize:9,fontWeight:800,
                color:C.textMuted,letterSpacing:1.2,textTransform:"uppercase"}}>
                {group.group}
              </div>
              {group.items.map(item => {
                const isActive = activeId===item.id;
                const isDone = completed.includes(item.id);
                return (
                  <button key={item.id} onClick={()=>setActiveId(item.id)} style={{
                    display:"flex",alignItems:"center",gap:8,width:"100%",
                    padding:"7px 16px",border:"none",cursor:"pointer",
                    background:isActive?item.color+"12":"transparent",
                    borderLeft:`3px solid ${isActive?item.color:"transparent"}`,
                    transition:"all .12s",
                  }}>
                    <span style={{fontSize:14}}>{isDone?"✅":item.icon}</span>
                    <span style={{
                      fontSize:11,fontWeight:isActive?700:500,textAlign:"left",
                      lineHeight:1.3,fontFamily:C.mono,
                      color:isActive?item.color:isDone?C.green:C.textSoft,
                    }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`}}>
          {[["⚠️",C.amber,"Risk/Ethical judgment"],["💬",C.cyan,"Communication/Data"],
            ["⚔️",C.red,"Boss battles"],["🔍",C.violet,"Opportunity analysis"]].map(([i,c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontSize:11}}>{i}</span>
              <span style={{fontSize:9,color:C.textMuted}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"11px 22px",background:C.bgCard,borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:20}}>{active?.icon}</span>
          <div>
            <div style={{fontSize:13,fontWeight:800}}>{active?.label}</div>
            <div style={{fontSize:10,color:C.textMuted,fontFamily:C.mono}}>
              Ecosystem Deep Dive · Sifter SkillUp v3.0
            </div>
          </div>
          <div style={{flex:1}}/>
          <Tag label="Demo Mode" color={C.amber} />
          {completed.includes(activeId) && <Tag label="✓ Tested" color={C.green} />}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
          <div style={{maxWidth:580,margin:"0 auto"}}>
            {renderSim()}
          </div>
        </div>
      </div>
    </div>
  );
}
