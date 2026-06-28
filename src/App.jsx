import React, { useState, useMemo } from "react";
import {
  Flame, Clock, Snowflake, HelpCircle, XCircle, Send, Pencil, X, Check,
  ArrowUpRight, ShieldAlert, Sparkles, Loader2, Plus, Activity, ChevronRight,
  CircleCheck, Gauge, ShieldCheck
} from "lucide-react";

/* ───────────────────────────── status system ───────────────────────────── */
const STATUS = {
  warm:    { label: "Warm",    Icon: Flame,      ring: "ring-amber-400/30",  text: "text-amber-300",  dot: "bg-amber-400",  soft: "bg-amber-400/10",  bar: "bg-amber-400" },
  delayed: { label: "Delayed", Icon: Clock,      ring: "ring-sky-400/30",    text: "text-sky-300",    dot: "bg-sky-400",    soft: "bg-sky-400/10",    bar: "bg-sky-400" },
  cold:    { label: "Cold",    Icon: Snowflake,  ring: "ring-slate-400/30",  text: "text-slate-300",  dot: "bg-slate-400",  soft: "bg-slate-400/10",  bar: "bg-slate-400" },
  unclear: { label: "Unclear", Icon: HelpCircle, ring: "ring-violet-400/30", text: "text-violet-300", dot: "bg-violet-400", soft: "bg-violet-400/10", bar: "bg-violet-400" },
  lost:    { label: "Lost",    Icon: XCircle,    ring: "ring-rose-400/30",   text: "text-rose-300",   dot: "bg-rose-400",   soft: "bg-rose-400/10",   bar: "bg-rose-400" },
};

/* ───────────────────────────── seed leads (the test cases) ───────────────────────────── */
let _id = 0;
const uid = () => `lead_${++_id}`;

const SEED = [
  {
    id: uid(), name: "Aruna Perera", company: "Cinnamon Lakeside", role: "F&B Director",
    channel: "Email", daysSilent: 1,
    conversation: [
      { who: "them", t: "Saw your retainer deck — the revenue + systems piece is exactly what our events arm is missing." },
      { who: "you",  t: "Glad it landed. Happy to walk your team through how the automation layer would plug into your booking flow." },
      { who: "them", t: "Yes please. Can you send pricing and grab 30 mins this week? We want to move before Q3." },
    ],
    analysis: {
      status: "warm", confidence: 94, leadScore: 88,
      reasoning: "Explicit buying intent, named the pain, asked for pricing AND a call, and set their own urgency (\"before Q3\"). No objections raised.",
      recommendedAction: "Send pricing + propose 2 concrete call slots this week.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Aruna — pricing attached, scoped to the events arm plus the systems + revenue layer we discussed. Two slots that work my side: Wed 2:00pm or Thu 10:30am. I'll bring a 1-page view of how the automation plugs into your booking flow so the call is concrete, not a sales pitch. Which suits?",
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
      reasoning: "Was actively engaged and requested the proposal, then went quiet 6 days after pricing landed. Silence post-quote usually means internal review, not loss — worth one low-pressure nudge before assuming cold.",
      recommendedAction: "Send a single value-add nudge. No discount, no pressure.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Dilani — no rush at all, just keeping this on your radar. One thing I forgot to flag: the cart-recovery flow typically pays for the retainer inside the first 6 weeks for stores your size. Happy to send a 2-line summary your founder can skim if that helps the internal conversation.",
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
      reasoning: "High intent and a senior decision-maker — but this is a live PRICING OBJECTION tied to a board-level justification. The deal is high-value and the wrong auto-sent reply could anchor the negotiation badly or read as a 'sales line', which she explicitly rejected.",
      recommendedAction: "Draft a head-to-head cost comparison (retainer vs in-house ops hire). Do NOT auto-send — founder should set the framing.",
      humanReview: { required: true, reason: "High-value deal + active pricing objection + board-facing. Tone and anchoring matter too much to automate. A human should own this reply." },
      draftMessage: "Hi Priya — here's the honest comparison, not a pitch. One ops hire ≈ LKR 180–220k loaded, covers ~1 function, takes 2–3 months to ramp, and goes on leave. The retainer covers six functions from week one, doesn't churn, and scales without re-hiring. Where it's genuinely worth defending to the board: [founder to insert the 1–2 outcomes that matter most to Apex].",
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
      reasoning: "Polite but non-committal. \"Maybe later\" + \"check with the team\" + \"swamped\" is classic soft-deflection — could be a genuine timing issue or a gentle no. Not enough signal to know which.",
      recommendedAction: "Ask ONE low-friction qualifying question to surface real intent. Don't push a scope yet.",
      humanReview: { required: true, reason: "Ambiguous intent on a relationship channel (IG). A mistimed automated push here reads as pushy and can kill a warm-able lead. Worth a human eye on tone before sending." },
      draftMessage: "No problem at all, Nimali — sounds like a busy stretch. Quick one so I don't chase you needlessly: is this a 'not right now, circle back next quarter' or more of a 'not a priority' for HomeMart? Either answer is genuinely fine — just helps me know whether to check back later.",
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
      reasoning: "Single lukewarm reply, then 23 days of silence through one follow-up. Statistically near-dormant. One final, genuinely useful touch is worth it before archiving — chasing harder wastes cycles.",
      recommendedAction: "Send ONE final breakup-style value note, then auto-archive to a 90-day nurture list.",
      humanReview: { required: false, reason: "" },
      draftMessage: "Hi Roshan — I'll stop crowding your inbox after this one. If export-ops automation moves up the list later, the door's open and I'll keep a tailored scope on file for you. In the meantime, one thing worth doing regardless of us: [single useful tip]. Wishing Ceylon Spice a strong season.",
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
      reasoning: "Explicit, unambiguous loss with a stated reason (timing + budget). The single worst move an automated agent can make here is to chase or re-pitch — it damages a relationship that may re-open later.",
      recommendedAction: "Mark lost. Capture loss reason. Send a gracious, NON-pitch door-open note only with human sign-off.",
      humanReview: { required: true, reason: "Lost deal. Any automated message risks reading as a desperate chase. A human should decide whether to send the graceful close at all — restraint is the correct default." },
      draftMessage: "Totally understand, Kasun — timing and budget are real, and I'd rather you make the right call than the rushed one. No pitch here: if the new partnership ever leaves a gap, I'd genuinely welcome a second look down the line. Wishing Pixel Republic a great run.",
    },
  },
];

/* ───────────────────────────── small UI atoms ───────────────────────────── */
function Meter({ value, barClass }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(2, value)}%` }} />
    </div>
  );
}

function StatusBadge({ status, sm }) {
  const s = STATUS[status]; const I = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${s.soft} ${s.text} ring-1 ${s.ring} ${sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} font-medium`}>
      <I className={sm ? "h-3 w-3" : "h-3.5 w-3.5"} /> {s.label}
    </span>
  );
}

/* ───────────────────────────── lead row ───────────────────────────── */
function LeadRow({ lead, active, onClick }) {
  const a = lead.analysis;
  const handled = lead.outcome;
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left px-4 py-3.5 border-l-2 transition-colors ${
        active ? "border-teal-400 bg-white/[0.04]" : "border-transparent hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium text-slate-100">{lead.name}</span>
            {a.humanReview.required && !handled && (
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-300" />
            )}
          </div>
          <div className="truncate text-[13px] text-slate-400">{lead.company} · {lead.channel}</div>
        </div>
        <StatusBadge status={a.status} sm />
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums">
          <Gauge className="h-3 w-3" /> {a.leadScore}
        </div>
        <div className="flex-1"><Meter value={a.leadScore} barClass={STATUS[a.status].bar} /></div>
        <span className={`text-[11px] tabular-nums ${lead.daysSilent >= 7 ? "text-rose-300" : "text-slate-500"}`}>
          {lead.daysSilent}d silent
        </span>
      </div>
      {handled && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-teal-300">
          <CircleCheck className="h-3 w-3" /> {handled}
        </div>
      )}
    </button>
  );
}

/* ───────────────────────────── detail / decision panel ───────────────────────────── */
function Decision({ lead, onAction }) {
  const a = lead.analysis;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(a.draftMessage);
  const autoEligible = !a.humanReview.required && a.status !== "lost";

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b border-white/[0.06] px-7 pt-7 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">{lead.name}</h2>
            <p className="mt-0.5 text-sm text-slate-400">{lead.role} · {lead.company} · via {lead.channel}</p>
          </div>
          <StatusBadge status={a.status} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[
            { label: "Lead score", val: a.leadScore, bar: STATUS[a.status].bar },
            { label: "Confidence", val: a.confidence, bar: "bg-teal-400" },
            { label: "Days silent", val: lead.daysSilent, raw: true, danger: lead.daysSilent >= 7 },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">{m.label}</span>
                <span className={`text-sm tabular-nums ${m.danger ? "text-rose-300" : "text-slate-200"}`}>
                  {m.val}{m.raw ? "d" : ""}
                </span>
              </div>
              {!m.raw && <div className="mt-1.5"><Meter value={m.val} barClass={m.bar} /></div>}
              {m.raw && <div className="mt-1.5 h-1.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* scroll body */}
      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
        {/* conversation */}
        <section>
          <SectionLabel>Conversation</SectionLabel>
          <div className="mt-3 space-y-2">
            {lead.conversation.filter(m => m.t).map((m, i) => (
              <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                  m.who === "you" ? "bg-teal-500/10 text-teal-50 rounded-br-sm" : "bg-white/[0.05] text-slate-200 rounded-bl-sm"
                }`}>{m.t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* agent read */}
        <section>
          <SectionLabel><Sparkles className="h-3.5 w-3.5 text-teal-300" /> Agent read</SectionLabel>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-300">{a.reasoning}</p>
          <div className="mt-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Recommended next action</div>
            <div className="mt-1 text-[14px] text-slate-100">{a.recommendedAction}</div>
          </div>
        </section>

        {/* the signature: human-control gate */}
        {autoEligible ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-teal-500/[0.07] ring-1 ring-teal-400/20 px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-teal-300" />
            <p className="text-[13px] text-teal-100">
              <span className="font-medium">Cleared to automate.</span> Low relationship risk — in production this follow-up sends on a schedule without waiting on a human.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-500/[0.07] ring-1 ring-rose-400/25 px-4 py-3.5">
            <div className="flex items-center gap-2 text-rose-200">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span className="text-[13px] font-semibold">Held for a human — will not auto-send</span>
            </div>
            <p className="mt-1.5 pl-6 text-[13px] leading-relaxed text-rose-100/80">{a.humanReview.reason}</p>
          </div>
        )}

        {/* drafted message */}
        <section>
          <div className="flex items-center justify-between">
            <SectionLabel>Drafted follow-up</SectionLabel>
            {!lead.outcome && (
              <button onClick={() => setEditing(e => !e)} className="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-200">
                <Pencil className="h-3 w-3" /> {editing ? "Done" : "Edit"}
              </button>
            )}
          </div>
          {editing ? (
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)} rows={6}
              className="mt-3 w-full resize-none rounded-xl bg-black/30 ring-1 ring-white/10 focus:ring-teal-400/40 outline-none px-4 py-3 text-[13.5px] leading-relaxed text-slate-100"
            />
          ) : (
            <div className="mt-3 rounded-xl bg-black/20 ring-1 ring-white/[0.06] px-4 py-3 text-[13.5px] leading-relaxed text-slate-200 whitespace-pre-wrap">
              {draft || <span className="text-slate-500">No message — the agent recommends waiting.</span>}
            </div>
          )}
        </section>
      </div>

      {/* action bar */}
      {!lead.outcome ? (
        <div className="border-t border-white/[0.06] px-7 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {a.status === "lost" ? (
              <>
                <ActionBtn primary danger onClick={() => onAction(lead.id, "Marked lost · reason: timing + budget")}>
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
                <ActionBtn onClick={() => onAction(lead.id, "Rejected — agent draft discarded")}>
                  <X className="h-4 w-4" /> Reject
                </ActionBtn>
              </>
            )}
          </div>
          {!autoEligible && a.status !== "lost" && (
            <p className="mt-2.5 text-[11.5px] text-slate-500">Nothing leaves the system until you click. The agent surfaced this; you decide.</p>
          )}
        </div>
      ) : (
        <div className="border-t border-white/[0.06] px-7 py-4 flex items-center gap-2 text-[13px] text-teal-300">
          <CircleCheck className="h-4 w-4" /> {lead.outcome}
          <button onClick={() => onAction(lead.id, null)} className="ml-auto text-[12px] text-slate-500 hover:text-slate-300">Undo</button>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{children}</div>;
}
function ActionBtn({ children, onClick, primary, danger }) {
  const base = "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors";
  const cls = primary
    ? danger ? "bg-rose-500/90 hover:bg-rose-500 text-white" : "bg-teal-400 hover:bg-teal-300 text-slate-900"
    : "bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 ring-1 ring-white/10";
  return <button onClick={onClick} className={`${base} ${cls}`}>{children}</button>;
}

/* ───────────────────────────── live AI intake ───────────────────────────── */
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
      <button onClick={() => setOpen(true)} className="m-3 inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-2.5 text-[13px] text-slate-300 hover:border-teal-400/40 hover:text-teal-200 transition-colors">
        <Plus className="h-4 w-4" /> Run a new lead through the agent
      </button>
    );
  }
  return (
    <div className="m-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-200">Live agent · paste a real conversation</span>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="col-span-1 rounded-lg bg-black/30 ring-1 ring-white/10 focus:ring-teal-400/40 outline-none px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-600" />
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" className="col-span-1 rounded-lg bg-black/30 ring-1 ring-white/10 focus:ring-teal-400/40 outline-none px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-600" />
        <input value={days} onChange={e => setDays(e.target.value)} placeholder="Days silent" className="col-span-1 rounded-lg bg-black/30 ring-1 ring-white/10 focus:ring-teal-400/40 outline-none px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-600" />
      </div>
      <textarea value={convo} onChange={e => setConvo(e.target.value)} rows={5} placeholder={"them: Looks good, send pricing\nyou: Sent it over\nthem: ..."} className="mt-2 w-full resize-none rounded-lg bg-black/30 ring-1 ring-white/10 focus:ring-teal-400/40 outline-none px-3 py-2 text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-600" />
      {err && <p className="mt-2 text-[12px] text-rose-300">{err}</p>}
      <button onClick={analyze} disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-400 hover:bg-teal-300 disabled:opacity-60 px-4 py-2 text-[13px] font-medium text-slate-900">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Agent is reading…</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
      </button>
    </div>
  );
}

/* ───────────────────────────── shell ───────────────────────────── */
export default function App() {
  const [leads, setLeads] = useState(SEED);
  const [sel, setSel] = useState(SEED[0].id);
  const selected = leads.find(l => l.id === sel);

  const stats = useMemo(() => {
    const open = leads.filter(l => !l.outcome);
    return {
      total: leads.length,
      review: open.filter(l => l.analysis.humanReview.required).length,
      auto: open.filter(l => !l.analysis.humanReview.required && l.analysis.status !== "lost").length,
      handled: leads.filter(l => l.outcome).length,
    };
  }, [leads]);

  function act(id, outcome) {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, outcome } : l));
  }
  function add(lead) { setLeads(ls => [lead, ...ls]); setSel(lead.id); }

  return (
    <div className="min-h-screen w-full bg-[#0A0E11] text-slate-200" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {/* top bar */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400 text-slate-900"><Activity className="h-4 w-4" strokeWidth={2.5} /></div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-50">Cadence <span className="text-slate-500 font-normal">· follow-up agent</span></div>
            <div className="text-[11px] text-slate-500">Tracks status · drafts the reply · knows when to hand it back to you</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-5">
          <Stat label="Open" value={stats.total - stats.handled} />
          <Stat label="Cleared to send" value={stats.auto} tone="teal" />
          <Stat label="Need you" value={stats.review} tone="rose" />
          <Stat label="Handled" value={stats.handled} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* pipeline */}
        <aside className="border-r border-white/[0.06] lg:h-[calc(100vh-65px)] lg:overflow-y-auto">
          <LiveIntake onAdd={add} />
          <div className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Pipeline · {leads.length}</div>
          <div className="divide-y divide-white/[0.04]">
            {leads.map(l => <LeadRow key={l.id} lead={l} active={l.id === sel} onClick={() => setSel(l.id)} />)}
          </div>
        </aside>

        {/* detail */}
        <main className="lg:h-[calc(100vh-65px)] lg:overflow-hidden">
          {selected ? <Decision lead={selected} onAction={act} /> : (
            <div className="grid h-full place-items-center text-slate-600">Select a lead</div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const c = tone === "teal" ? "text-teal-300" : tone === "rose" ? "text-rose-300" : "text-slate-100";
  return (
    <div className="text-right">
      <div className={`text-lg font-semibold tabular-nums leading-none ${c}`}>{value}</div>
      <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
