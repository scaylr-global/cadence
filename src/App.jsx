import React, { useState, useMemo } from "react";
import {
  Flame, Clock, Snowflake, HelpCircle, XCircle, Send, Pencil, X, Check,
  ArrowUpRight, ShieldAlert, Sparkles, Loader2, Plus, CircleCheck
} from "lucide-react";

/* ── brand mark: connected-node motif (evokes the Catalist logo world) ── */
function NodeMark({ className = "", stroke = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke}>
      <line x1="5" y1="12" x2="12" y2="5" strokeWidth="1.2" />
      <line x1="12" y1="5" x2="19" y2="12" strokeWidth="1.2" />
      <line x1="19" y1="12" x2="12" y2="19" strokeWidth="1.2" />
      <line x1="12" y1="19" x2="5" y2="12" strokeWidth="1.2" />
      <circle cx="5" cy="12" r="2.1" fill={stroke} stroke="none" />
      <circle cx="19" cy="12" r="2.1" fill={stroke} stroke="none" />
      <circle cx="12" cy="5" r="2.1" strokeWidth="1.4" />
      <circle cx="12" cy="19" r="2.1" strokeWidth="1.4" />
    </svg>
  );
}

/* ── status system: encoded by ink density, not colour ── */
const STATUS = {
  warm:    { label: "Warm",    Icon: Flame,      chip: "bg-neutral-900 text-white border-neutral-900", strike: false, dash: false },
  delayed: { label: "Delayed", Icon: Clock,      chip: "bg-neutral-100 text-neutral-800 border-neutral-300", strike: false, dash: false },
  unclear: { label: "Unclear", Icon: HelpCircle, chip: "bg-white text-neutral-800 border-neutral-400 border-dashed", strike: false, dash: true },
  cold:    { label: "Cold",    Icon: Snowflake,  chip: "bg-white text-neutral-500 border-neutral-300", strike: false, dash: false },
  lost:    { label: "Lost",    Icon: XCircle,    chip: "bg-white text-neutral-400 border-neutral-200", strike: true,  dash: false },
};

let _id = 0;
const uid = () => `lead_${++_id}`;

const SEED = [
  {
    id: uid(), name: "Aruna Perera", company: "Cinnamon Lakeside", role: "F&B Director",
    channel: "Email", daysSilent: 1,
    conversation: [
      { who: "them", t: "Saw your retainer deck — the revenue + systems piece is exactly what our events arm is missing." },
      { who: "you",  t: "Glad it landed. Happy to walk your team through how the automation layer plugs into your booking flow." },
      { who: "them", t: "Yes please. Can you send pricing and grab 30 mins this week? We want to move before Q3." },
    ],
    analysis: {
      status: "warm", confidence: 94, leadScore: 88,
      reasoning: "Explicit buying intent, named the pain, asked for pricing AND a call, and set their own urgency (\"before Q3\"). No objections raised.",
      recommendedAction: "Send pricing + propose two concrete call slots this week.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Aruna — pricing attached, scoped to the events arm plus the systems + revenue layer we discussed. Two slots my side: Wed 2:00pm or Thu 10:30am. I'll bring a one-page view of how the automation plugs into your booking flow so the call is concrete, not a pitch. Which suits?",
    },
  },
  {
    id: uid(), name: "Dilani Fernando", company: "ShopLK", role: "Head of Growth",
    channel: "WhatsApp", daysSilent: 6,
    conversation: [
      { who: "them", t: "This looks strong. Send the numbers and I'll take it to the founder." },
      { who: "you",  t: "Sent — proposal + the ROI breakdown on cart-recovery automation. Shout if anything needs adjusting." },
      { who: "them", t: "" },
    ],
    analysis: {
      status: "delayed", confidence: 86, leadScore: 64,
      reasoning: "Was actively engaged and requested the proposal, then went quiet six days after pricing landed. Silence post-quote usually means internal review, not loss — worth one low-pressure nudge before assuming cold.",
      recommendedAction: "Send a single value-add nudge. No discount, no pressure.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Dilani — no rush at all, just keeping this on your radar. One thing I forgot to flag: the cart-recovery flow typically pays for the retainer inside the first six weeks for stores your size. Happy to send a two-line summary your founder can skim if it helps the internal conversation.",
    },
  },
  {
    id: uid(), name: "Priya Nathan", company: "Apex Retail Group", role: "COO",
    channel: "Email", daysSilent: 2,
    conversation: [
      { who: "them", t: "Interested, but LKR 250k/mo is above what we'd earmarked. What are we actually paying for vs hiring one ops person?" },
      { who: "you",  t: "Fair question — let me show the comparison properly." },
      { who: "them", t: "Do that. I need something I can defend to the board, not a sales line." },
    ],
    analysis: {
      status: "warm", confidence: 90, leadScore: 81,
      reasoning: "High intent and a senior decision-maker — but this is a live pricing objection tied to a board-level justification. The deal is high-value and a wrong auto-sent reply could anchor the negotiation badly or read as the 'sales line' she explicitly rejected.",
      recommendedAction: "Draft a cost comparison (retainer vs in-house ops hire). Do NOT auto-send — founder should set the framing.",
      humanReview: { required: true, reason: "High-value deal + active pricing objection + board-facing. Tone and anchoring matter too much to automate. A human should own this reply." },
      draftMessage: "Hi Priya — here's the honest comparison, not a pitch. One ops hire ≈ LKR 180–220k loaded, covers ~1 function, takes 2–3 months to ramp, and goes on leave. The retainer covers six functions from week one, doesn't churn, and scales without re-hiring. Worth defending to the board: [founder to insert the 1–2 outcomes that matter most to Apex].",
    },
  },
  {
    id: uid(), name: "Nimali Silva", company: "HomeMart Lanka", role: "Marketing Lead",
    channel: "Instagram", daysSilent: 4,
    conversation: [
      { who: "them", t: "Looks interesting!" },
      { who: "you",  t: "Thanks Nimali — want me to put together a quick scope for HomeMart?" },
      { who: "them", t: "Maybe later, let me check with the team. We're a bit swamped rn." },
    ],
    analysis: {
      status: "unclear", confidence: 72, leadScore: 47,
      reasoning: "Polite but non-committal. \"Maybe later\" + \"check with the team\" + \"swamped\" is classic soft-deflection — could be genuine timing or a gentle no. Not enough signal to know which.",
      recommendedAction: "Ask ONE low-friction qualifying question to surface real intent. Don't push a scope yet.",
      humanReview: { required: true, reason: "Ambiguous intent on a relationship channel (IG). A mistimed automated push reads as pushy and can kill a warm-able lead. Worth a human eye on tone first." },
      draftMessage: "No problem at all, Nimali — sounds like a busy stretch. Quick one so I don't chase you needlessly: is this a 'not right now, circle back next quarter', or more of a 'not a priority' for HomeMart? Either answer's genuinely fine — just tells me whether to check back later.",
    },
  },
  {
    id: uid(), name: "Roshan Jayawardena", company: "Ceylon Spice Exports", role: "Founder",
    channel: "Email", daysSilent: 23,
    conversation: [
      { who: "them", t: "Thanks for reaching out, will take a look." },
      { who: "you",  t: "Appreciate it Roshan — here's a short overview tailored to export ops." },
      { who: "them", t: "" },
    ],
    analysis: {
      status: "cold", confidence: 83, leadScore: 31,
      reasoning: "Single lukewarm reply, then 23 days of silence through one follow-up. Statistically near-dormant. One final useful touch is worth it before archiving — chasing harder wastes cycles.",
      recommendedAction: "Send ONE final value note, then auto-archive to a 90-day nurture list.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Roshan — I'll stop crowding your inbox after this one. If export-ops automation moves up the list later, the door's open and I'll keep a tailored scope on file. In the meantime, one thing worth doing regardless of us: [single useful tip]. Wishing Ceylon Spice a strong season.",
    },
  },
  {
    id: uid(), name: "Kasun Bandara", company: "Pixel Republic", role: "Managing Director",
    channel: "Email", daysSilent: 1,
    conversation: [
      { who: "them", t: "We really liked your approach." },
      { who: "you",  t: "That means a lot — keen to get started whenever you are." },
      { who: "them", t: "Unfortunately we've decided to go with another partner for now. Timing and budget. Appreciate your effort." },
    ],
    analysis: {
      status: "lost", confidence: 96, leadScore: 0,
      reasoning: "Explicit, unambiguous loss with a stated reason (timing + budget). The worst move an automated agent can make here is to chase or re-pitch — it damages a relationship that may re-open later.",
      recommendedAction: "Mark lost. Capture loss reason. Send a gracious, non-pitch door-open note only with human sign-off.",
      humanReview: { required: true, reason: "Lost deal. Any automated message risks reading as a desperate chase. A human should decide whether to send the graceful close at all — restraint is the correct default." },
      draftMessage: "Totally understand, Kasun — timing and budget are real, and I'd rather you make the right call than the rushed one. No pitch here: if the new partnership ever leaves a gap, I'd genuinely welcome a second look down the line. Wishing Pixel Republic a great run.",
    },
  },
];

/* ── atoms ── */
function Bar({ value }) {
  return (
    <div className="h-px w-full bg-neutral-200">
      <div className="h-px bg-neutral-900" style={{ width: `${Math.max(3, value)}%` }} />
    </div>
  );
}
function Eyebrow({ children, className = "" }) {
  return <div className={`text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 ${className}`}>{children}</div>;
}
function StatusChip({ status, sm }) {
  const s = STATUS[status]; const I = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border ${s.chip} ${sm ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"} font-medium uppercase tracking-wide`}>
      <I className={sm ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2} />
      <span className={s.strike ? "line-through" : ""}>{s.label}</span>
    </span>
  );
}

/* ── pipeline row ── */
function LeadRow({ lead, active, onClick }) {
  const a = lead.analysis;
  const handled = lead.outcome;
  return (
    <button
      onClick={onClick}
      className={`group w-full border-l-2 px-5 py-4 text-left transition-colors ${
        active ? "border-neutral-900 bg-neutral-50" : "border-transparent hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold tracking-tight text-neutral-900">{lead.name}</span>
            {a.humanReview.required && !handled && <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-neutral-900" strokeWidth={2.2} />}
          </div>
          <div className="mt-0.5 truncate text-[12px] text-neutral-500">{lead.company} · {lead.channel}</div>
        </div>
        <StatusChip status={a.status} sm />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[11px] tabular-nums text-neutral-400">{String(a.leadScore).padStart(2, "0")}</span>
        <div className="flex-1"><Bar value={a.leadScore} /></div>
        <span className={`font-mono text-[11px] tabular-nums ${lead.daysSilent >= 7 ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>
          {lead.daysSilent}d{lead.daysSilent >= 7 ? " · stale" : ""}
        </span>
      </div>
      {handled && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-neutral-900">
          <CircleCheck className="h-3 w-3" /> {handled}
        </div>
      )}
    </button>
  );
}

/* ── decision panel ── */
function Decision({ lead, onAction }) {
  const a = lead.analysis;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(a.draftMessage);
  const autoEligible = !a.humanReview.required && a.status !== "lost";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* header */}
      <div className="border-b border-neutral-200 px-8 pt-7 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow className="mb-2">{lead.role} · via {lead.channel}</Eyebrow>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{lead.name}</h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">{lead.company}</p>
          </div>
          <StatusChip status={a.status} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-8">
          {[
            { label: "Lead score", val: a.leadScore, bar: true },
            { label: "Confidence", val: a.confidence, bar: true },
            { label: "Days silent", val: lead.daysSilent, suffix: "d", danger: lead.daysSilent >= 7 },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex items-baseline justify-between">
                <Eyebrow>{m.label}</Eyebrow>
                <span className={`font-mono text-[15px] tabular-nums ${m.danger ? "font-semibold text-neutral-900" : "text-neutral-900"}`}>
                  {m.val}{m.suffix || ""}
                </span>
              </div>
              <div className="mt-2">{m.bar ? <Bar value={m.val} /> : <div className="h-px w-full bg-neutral-100" />}</div>
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="flex-1 space-y-7 overflow-y-auto px-8 py-7">
        <section>
          <Eyebrow>Conversation</Eyebrow>
          <div className="mt-3 space-y-2">
            {lead.conversation.filter(m => m.t).map((m, i) => (
              <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[84%] rounded-sm px-3.5 py-2 text-[13px] leading-relaxed ${
                  m.who === "you" ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}>{m.t}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Eyebrow className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-neutral-900" /> Agent read</Eyebrow>
          <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-700">{a.reasoning}</p>
          <div className="mt-4 border-l-2 border-neutral-900 bg-neutral-50 px-4 py-3">
            <Eyebrow>Recommended next action</Eyebrow>
            <div className="mt-1 text-[14px] text-neutral-900">{a.recommendedAction}</div>
          </div>
        </section>

        {/* the signature gate */}
        {autoEligible ? (
          <div className="flex items-center gap-2.5 border border-neutral-300 bg-white px-4 py-3">
            <span className="grid h-4 w-4 place-items-center rounded-sm bg-neutral-900"><Check className="h-3 w-3 text-white" strokeWidth={3} /></span>
            <p className="text-[12.5px] uppercase tracking-wide text-neutral-600">
              <span className="font-semibold text-neutral-900">Cleared to automate.</span> In production this sends on schedule — no human needed.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" strokeWidth={2.2} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">Held for a human — will not auto-send</span>
            </div>
            <p className="mt-2 pl-6 text-[13px] leading-relaxed text-neutral-300">{a.humanReview.reason}</p>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between">
            <Eyebrow>Drafted follow-up</Eyebrow>
            {!lead.outcome && (
              <button onClick={() => setEditing(e => !e)} className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-neutral-500 hover:text-neutral-900">
                <Pencil className="h-3 w-3" /> {editing ? "Done" : "Edit"}
              </button>
            )}
          </div>
          {editing ? (
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)} rows={6}
              className="mt-3 w-full resize-none rounded-sm border border-neutral-300 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-neutral-900 outline-none focus:border-neutral-900"
            />
          ) : (
            <div className="mt-3 rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13.5px] leading-relaxed text-neutral-700 whitespace-pre-wrap">
              {draft || <span className="text-neutral-400">No message — the agent recommends waiting.</span>}
            </div>
          )}
        </section>
      </div>

      {/* actions */}
      {!lead.outcome ? (
        <div className="border-t border-neutral-200 px-8 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {a.status === "lost" ? (
              <>
                <ActionBtn primary onClick={() => onAction(lead.id, "Marked lost · reason: timing + budget")}>
                  <XCircle className="h-4 w-4" /> Mark lost & log reason
                </ActionBtn>
                <ActionBtn onClick={() => onAction(lead.id, "Door-open note approved & sent")}>
                  <Send className="h-4 w-4" /> Approve graceful close
                </ActionBtn>
              </>
            ) : (
              <>
                <ActionBtn primary onClick={() => onAction(lead.id, autoEligible ? "Follow-up approved & sent" : "Human-approved & sent")}>
                  <Check className="h-4 w-4" /> Approve & send
                </ActionBtn>
                <ActionBtn onClick={() => onAction(lead.id, "Escalated to human owner")}>
                  <ArrowUpRight className="h-4 w-4" /> Escalate
                </ActionBtn>
                <ActionBtn onClick={() => onAction(lead.id, "Rejected — draft discarded")}>
                  <X className="h-4 w-4" /> Reject
                </ActionBtn>
              </>
            )}
          </div>
          {!autoEligible && a.status !== "lost" && (
            <p className="mt-2.5 text-[11px] uppercase tracking-wide text-neutral-400">Nothing leaves the system until you click. The agent surfaced this — you decide.</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-neutral-200 px-8 py-4 text-[12px] uppercase tracking-wide text-neutral-900">
          <CircleCheck className="h-4 w-4" /> {lead.outcome}
          <button onClick={() => onAction(lead.id, null)} className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-900">Undo</button>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, primary }) {
  const base = "inline-flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-[12px] font-medium uppercase tracking-wide transition-colors";
  const cls = primary
    ? "bg-neutral-900 text-white hover:bg-black"
    : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50";
  return <button onClick={onClick} className={`${base} ${cls}`}>{children}</button>;
}

/* ── live AI intake ── */
function LiveIntake({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [days, setDays] = useState("");
  const [convo, setConvo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function analyze() {
    if (!convo.trim()) { setErr("Paste the conversation first."); return; }
    setLoading(true); setErr("");
    const prompt = `You are a B2B sales follow-up triage agent for a Sri Lankan operations consultancy. Analyze the lead and return ONLY a JSON object — no markdown, no backticks, no preamble — with EXACTLY this shape:
{"status":"warm|cold|delayed|unclear|lost","confidence":<int 0-100>,"leadScore":<int 0-100>,"reasoning":"<=2 sentences","recommendedAction":"one imperative sentence","humanReview":{"required":<bool>,"reason":"<one sentence, empty string if not required>"},"draftMessage":"a concise, warm, professional follow-up the rep could send"}

Rules:
- status: warm=clear intent/asking to move; delayed=was engaged then silent after a quote/step; cold=minimal engagement + long silence; unclear=vague/non-committal; lost=explicit no.
- Set humanReview.required = true when the situation is high-value, involves a pricing objection, an upset or sensitive tone, ambiguous intent on a personal channel, or a lost deal — anything where an automated send could damage the relationship. Otherwise false.
- If status is lost, draftMessage must be a gracious non-pitch note (still gated by humanReview).

Lead: name="${name || "Unknown"}", company="${company || "Unknown"}", days since last contact=${days || "unknown"}.
Conversation:
${convo}`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const raw = (data.text || "").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const a = JSON.parse(clean);
      const lines = convo.split("\n").map(l => l.trim()).filter(Boolean);
      const conversation = lines.map(l => {
        const m = l.match(/^(you|me|rep|them|client|lead|prospect)\s*[:\-]\s*(.*)$/i);
        if (m) return { who: /^(you|me|rep)$/i.test(m[1]) ? "you" : "them", t: m[2] };
        return { who: "them", t: l };
      });
      onAdd({
        id: uid(), name: name || "New lead", company: company || "—", role: "—",
        channel: "Pasted", daysSilent: Number(days) || 0, conversation, analysis: a,
      });
      setOpen(false); setName(""); setCompany(""); setDays(""); setConvo("");
    } catch (e) {
      setErr("Couldn't parse the agent's response. Try again, or trim the conversation.");
    } finally { setLoading(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="m-4 inline-flex items-center justify-center gap-2 border border-dashed border-neutral-300 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900">
        <Plus className="h-4 w-4" /> Run a new lead through the agent
      </button>
    );
  }
  return (
    <div className="m-4 border border-neutral-300 bg-white p-4">
      <div className="flex items-center justify-between">
        <Eyebrow>Live agent · paste a real conversation</Eyebrow>
        <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900" />
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900" />
        <input value={days} onChange={e => setDays(e.target.value)} placeholder="Days silent" className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900" />
      </div>
      <textarea value={convo} onChange={e => setConvo(e.target.value)} rows={5} placeholder={"them: Looks good, send pricing\nyou: Sent it over\nthem: ..."} className="mt-2 w-full resize-none rounded-sm border border-neutral-300 bg-white px-3 py-2 text-[13px] leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900" />
      {err && <p className="mt-2 text-[12px] text-neutral-900">{err}</p>}
      <button onClick={analyze} disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-sm bg-neutral-900 px-4 py-2 text-[12px] font-medium uppercase tracking-wide text-white hover:bg-black disabled:opacity-60">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Agent is reading…</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
      </button>
    </div>
  );
}

/* ── shell ── */
export default function App() {
  const [leads, setLeads] = useState(SEED);
  const [sel, setSel] = useState(SEED[0].id);
  const selected = leads.find(l => l.id === sel);

  const stats = useMemo(() => {
    const open = leads.filter(l => !l.outcome);
    return {
      open: open.length,
      review: open.filter(l => l.analysis.humanReview.required).length,
      auto: open.filter(l => !l.analysis.humanReview.required && l.analysis.status !== "lost").length,
      handled: leads.filter(l => l.outcome).length,
    };
  }, [leads]);

  function act(id, outcome) { setLeads(ls => ls.map(l => l.id === id ? { ...l, outcome } : l)); }
  function add(lead) { setLeads(ls => [lead, ...ls]); setSel(lead.id); }

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* header */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-3.5">
          <div className="grid h-9 w-9 place-items-center bg-neutral-900">
            <NodeMark className="h-5 w-5 text-white" stroke="#ffffff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold uppercase tracking-[0.14em] text-neutral-900">Cadence</span>
              <span className="text-[12px] text-neutral-400">Follow-up agent</span>
            </div>
            <Eyebrow className="mt-0.5">Builder Challenge · Catalist Media</Eyebrow>
          </div>
        </div>
        <div className="hidden items-stretch divide-x divide-neutral-200 sm:flex">
          <Stat label="Open" value={stats.open} />
          <Stat label="Cleared" value={stats.auto} />
          <Stat label="Need you" value={stats.review} solid />
          <Stat label="Handled" value={stats.handled} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr]">
        <aside className="border-r border-neutral-200 bg-white lg:h-[calc(100vh-61px)] lg:overflow-y-auto">
          <LiveIntake onAdd={add} />
          <div className="border-t border-neutral-200 px-5 pb-2 pt-3">
            <Eyebrow>Pipeline · {leads.length}</Eyebrow>
          </div>
          <div className="divide-y divide-neutral-100">
            {leads.map(l => <LeadRow key={l.id} lead={l} active={l.id === sel} onClick={() => setSel(l.id)} />)}
          </div>
        </aside>

        <main className="lg:h-[calc(100vh-61px)] lg:overflow-hidden">
          {selected ? <Decision key={selected.id} lead={selected} onAction={act} /> : (
            <div className="grid h-full place-items-center text-neutral-400">Select a lead</div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, solid }) {
  return (
    <div className="px-5 text-right">
      <div className={`font-mono text-[18px] font-semibold tabular-nums leading-none ${solid ? "text-neutral-900" : "text-neutral-900"}`}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-neutral-400">{label}</div>
    </div>
  );
}
