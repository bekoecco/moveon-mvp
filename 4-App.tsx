import React from 'react';
import { FEEDBACK_URL } from './config';
import logoMark from './mark.webp';
import { Bullets, Caption, Closing, Facts, FileCard, Link, Paragraph, Route, Routes, TextField, useLocalState } from './ui';

/* ------------------------------------------------------------------ */
/* Demo data. Every piece, price and date on this page is invented     */
/* for the demo. The fee and split figures are rough estimates, not   */
/* quotes.                                                             */
/* ------------------------------------------------------------------ */

type Piece = { id: string; name: string; note: string; resale: number; retail: number; icon: string };

const PIECES: Piece[] = [
    { id: 'desk', name: 'Study desk', note: 'Standard four-leg desk', resale: 45, retail: 120, icon: 'desk' },
    { id: 'chair', name: 'Desk chair', note: 'Adjustable, on casters', resale: 35, retail: 90, icon: 'chair' },
    { id: 'bed-frame', name: 'Bed frame, full', note: 'Frame and slats', resale: 55, retail: 150, icon: 'bed' },
    { id: 'mattress', name: 'Mattress, full', note: 'Clean, no stains', resale: 95, retail: 250, icon: 'mattress' },
    { id: 'lamp', name: 'Floor lamp', note: 'Bulb included', resale: 15, retail: 40, icon: 'lamp' },
    { id: 'dresser', name: 'Dresser', note: 'Three drawers', resale: 40, retail: 110, icon: 'dresser' },
    { id: 'bookshelf', name: 'Bookshelf', note: 'Three shelves', resale: 25, retail: 60, icon: 'shelf' },
    { id: 'nightstand', name: 'Nightstand', note: 'One drawer', resale: 12, retail: 35, icon: 'nightstand' },
    { id: 'sofa', name: 'Two-seat sofa', note: 'Fabric, good condition', resale: 110, retail: 300, icon: 'sofa' },
    { id: 'mini-fridge', name: 'Mini fridge', note: 'Clean and working', resale: 50, retail: 130, icon: 'fridge' },
];

type Bundle = { id: string; name: string; detail: string; price: number; icon: string };

const BUNDLES: Bundle[] = [
    { id: 'bundle-study', name: 'Study set', detail: 'Study desk, desk chair and floor lamp', price: 85, icon: 'desk' },
    { id: 'bundle-sleep', name: 'Sleep set', detail: 'Bed frame, full mattress and nightstand', price: 145, icon: 'bed' },
    { id: 'bundle-room', name: 'Whole room', detail: 'Study set, sleep set, dresser and bookshelf', price: 275, icon: 'room' },
];

const CATALOG: Record<string, { name: string; price: number }> = {};
PIECES.forEach(p => { CATALOG[p.id] = { name: p.name, price: p.resale }; });
BUNDLES.forEach(b => { CATALOG[b.id] = { name: b.name + ' (bundle)', price: b.price }; });

type Addon = { id: string; name: string; detail: string; price: number; icon: string };

const ADDONS: Addon[] = [
    { id: 'packing', name: 'Packing help', detail: 'A pair of hands packs your stuff into boxes', price: 49, icon: 'box' },
    { id: 'box-kit', name: 'Box kit', detail: '10 boxes, tape and labels dropped off ahead of pickup', price: 24, icon: 'boxes' },
    { id: 'on-loading', name: 'On-loading', detail: 'We load your car, van or storage unit', price: 29, icon: 'load' },
    { id: 'off-loading', name: 'Off-loading', detail: 'We unload and carry everything in at the new place', price: 29, icon: 'unload' },
    { id: 'short-move', name: 'Short move', detail: 'Across campus or across town, door to door', price: 59, icon: 'route' },
    { id: 'full-move', name: 'Full move', detail: 'Load, drive and unload, the whole trip handled', price: 99, icon: 'truck' },
];
const ADDON_BY_ID: Record<string, Addon> = {};
ADDONS.forEach(a => { ADDON_BY_ID[a.id] = a; });

const CAMPUSES = ['UC Berkeley', 'Stanford', 'SF State', 'San Jose State'];
const MOVE_OUT_DATES = ['Fri 18 Dec 2026', 'Sat 19 Dec 2026', 'Sun 20 Dec 2026'];
const MOVE_IN_DATES = ['Mon 11 Jan 2027', 'Tue 12 Jan 2027', 'Wed 13 Jan 2027'];
const DELIVERY_FEE = 29;

const money = (n: number) => '$' + n.toLocaleString('en-US');
const makeRef = (prefix: string) => prefix + '-' + Math.floor(1000 + Math.random() * 9000);
const countItems = (items: Record<string, number>) => Object.values(items).reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ */
/* Icons: simple stroke marks in the blue-turquoise palette            */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, React.ReactNode> = {
    desk: <><rect x="3" y="8" width="18" height="3" rx="1" /><path d="M5 11v8M19 11v8M5 15h14" /></>,
    chair: <><path d="M7 4v8h10V4" /><path d="M7 12l-2 8M17 12l2 8M7 16h10" /></>,
    bed: <><path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><path d="M3 14h18M6 8V6h12v2" /></>,
    mattress: <><rect x="3" y="9" width="18" height="7" rx="3" /><path d="M7 12.5h.01M12 12.5h.01M17 12.5h.01" /></>,
    lamp: <><path d="M9 3h6l3 8H6l3-8Z" /><path d="M12 11v7M8 21h8" /></>,
    dresser: <><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M5 9.5h14M5 15h14M10.5 6.8h3M10.5 12.2h3M10.5 17.6h3" /></>,
    shelf: <><rect x="4" y="4" width="16" height="16" rx="1.5" /><path d="M4 9.5h16M4 15h16M8 6.8h3M13 12.2h4" /></>,
    nightstand: <><rect x="6" y="7" width="12" height="9" rx="1.5" /><path d="M6 11.5h12M10.5 9.2h3M8 16v3M16 16v3" /></>,
    sofa: <><path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" /><path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3Z" /></>,
    fridge: <><rect x="7" y="3" width="10" height="18" rx="1.5" /><path d="M7 10h10M9.5 6h.01M9.5 13v3" /></>,
    room: <><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /></>,
    box: <><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M4 7l8 4 8-4M12 11v10" /></>,
    boxes: <><path d="M8 3 3 5.5v5L8 13l5-2.5v-5L8 3Z" /><path d="M3 5.5 8 8l5-2.5M8 8v5" /><path d="M16 11l-5 2.5v5L16 21l5-2.5v-5L16 11Z" /><path d="M11 13.5 16 16l5-2.5M16 16v5" /></>,
    load: <><path d="M4 15h16v5H4z" /><path d="M12 3v8M8.5 6.5 12 3l3.5 3.5" /></>,
    unload: <><path d="M4 15h16v5H4z" /><path d="M12 4v8M8.5 9 12 12.5 15.5 9" /></>,
    route: <><path d="M6 19s-2.5-2.2-2.5-4.5A2.5 2.5 0 0 1 6 12a2.5 2.5 0 0 1 2.5 2.5C8.5 16.8 6 19 6 19Z" /><path d="M18 12s-2.5-2.2-2.5-4.5A2.5 2.5 0 0 1 18 5a2.5 2.5 0 0 1 2.5 2.5C20.5 9.8 18 12 18 12Z" /><path d="M8 17.5c4 1.5 7 .5 8.5-3.5" strokeDasharray="2.5 2.5" /></>,
    truck: <><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>,
    tag: <><path d="M3 11V4h7l10 10-7 7L3 11Z" /><circle cx="8.5" cy="9.5" r="1.4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    back: <path d="M15 5l-7 7 7 7" />,
    spark: <path d="M12 3l2.1 5.4L20 10l-5.9 1.6L12 17l-2.1-5.4L4 10l5.9-1.6L12 3Z" />,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16.5 15h.01" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1.2" /><circle cx="4" cy="12" r="1.2" /><circle cx="4" cy="18" r="1.2" /></>,
};

function Icon({ name, size = 22 }: { name: string; size?: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;
}

/* ------------------------------------------------------------------ */
/* App building blocks                                                 */
/* ------------------------------------------------------------------ */

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return <div className="qty">
        <button type="button" aria-label="One fewer" disabled={value === 0} onClick={() => onChange(value - 1)}>-</button>
        <span className="qty-value" aria-live="polite">{value}</span>
        <button type="button" className="qty-plus" aria-label="One more" onClick={() => onChange(value + 1)}>+</button>
    </div>;
}

function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
    return <div role="group" aria-label={label} className="mv-chips">
        {options.map(o => <button key={o} type="button" aria-pressed={value === o}
            className={'mv-chip' + (value === o ? ' on' : '')} onClick={() => onChange(o)}>{o}</button>)}
    </div>;
}

function Sub({ children }: { children: React.ReactNode }) {
    return <p className="mv-sub">{children}</p>;
}

function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
    return <div className="mv-label"><span className="mv-label-icon"><Icon name={icon} size={15} /></span><h2>{children}</h2></div>;
}

function AppBar({ back }: { back?: boolean }) {
    return <div className="mv-appbar">
        {back && <Link className="mv-back" to="/" aria-label="Back to home"><Icon name="back" size={16} /></Link>}
        <img className="dd-appbar-mark" src={logoMark} alt="" aria-hidden="true" />
        <p className="mv-appbar-name">Dorm<span className="mv-brand-cycle">Drop</span></p>
        <span className="mv-demo-pill">EARLY DEMO</span>
    </div>;
}

function ScreenHead({ title, step, total }: { title: string; step: number; total: number }) {
    return <>
        <div className="mv-top">
            <p className="mv-top-title">{title}</p>
            <span className="mv-top-step">Step {step} of {total}</span>
        </div>
        <div className="mv-progress" aria-hidden="true"><div style={{ width: (step / total * 100) + '%' }} /></div>
    </>;
}

function EstimatePanel({ lines, totalLabel, totalValue, note }: {
    lines: { k: string; v: string }[]; totalLabel: string; totalValue: string; note: string;
}) {
    return <div className="mv-estimate">
        <div className="glow" />
        {lines.map(l => <div className="line" key={l.k}><span className="k">{l.k}</span><span className="v">{l.v}</span></div>)}
        <div className="line total"><span className="k">{totalLabel}</span><span className="v">{totalValue}</span></div>
        <p className="note">{note}</p>
    </div>;
}

function CtaBar({ total, label, disabled, onClick, onBack }: {
    total?: string; label: string; disabled: boolean; onClick: () => void; onBack?: () => void;
}) {
    return <div className="mv-cta-bar">
        {onBack && <button type="button" className="mv-cta-back" onClick={onBack}>Back</button>}
        {total && <div className="mv-cta-total"><span className="t1">Estimated total</span><span className="t2">{total}</span></div>}
        <button type="button" className="mv-cta" disabled={disabled} onClick={onClick}>{label}<Icon name="arrow" size={17} /></button>
    </div>;
}

function Gradients() {
    return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
        <linearGradient id="mvGradRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#91d1d0" /><stop offset="1" stopColor="#ff752f" />
        </linearGradient>
    </defs></svg>;
}

function CheckMark() {
    return <svg className="mv-check-ring" viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="36" />
        <path d="M28 43.5 38 53 57 33" />
    </svg>;
}

function StorageNote({ message, ready }: { message: string; ready: boolean }) {
    if (!ready || !message) return null;
    return <Caption>{message}</Caption>;
}

function scrollTop() {
    document.querySelector('.mv-appbar')?.scrollIntoView({ block: 'start' });
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function Start() {
    return <div className="mv">
        <AppBar />
        <section className="dd-hero">
            <img className="dd-hero-mark" src={logoMark} alt="DormDrop logo: a house dropping into a box" />
            <p className="dd-eyebrow">Student furniture pick up &amp; resale</p>
            <h1 className="dd-title">Move out lighter.<br />Move in furnished.</h1>
            <p className="dd-lede">Students moving out leave furniture behind, students moving in need it. DormDrop picks it up, stores it between semesters and delivers it.</p>
            <div className="dd-actions">
                <Link className="dd-btn dd-btn-primary" to="/moving-out">
                    <span><b>I am moving out</b><small>List furniture or book a pickup</small></span>
                    <Icon name="arrow" size={18} />
                </Link>
                <Link className="dd-btn dd-btn-ghost" to="/moving-in">
                    <span><b>I am moving in</b><small>Furnish your room, delivered</small></span>
                    <Icon name="arrow" size={18} />
                </Link>
            </div>
            <p className="dd-check"><span aria-hidden="true">✓</span> Every piece is cleaned and inspected.</p>
        </section>
        <Link className="room-feature" to="/room-sets">
            <span className="room-eyebrow">NEW · BULK ROOM SETS</span>
            <h2>Your whole room, one better price.</h2>
            <p>Sell your furniture as one discounted set, or buy a full room from a moving-out student.</p>
            <span className="room-feature-action">Explore room sets →</span>
        </Link>
        <SectionLabel icon="spark">How a move would go</SectionLabel>
        <ol className="mv-steps">
            <li className="mv-step"><span className="mv-step-n">1</span><p>You book a pickup in move-out week and say what you are leaving behind.</p></li>
            <li className="mv-step"><span className="mv-step-n">2</span><p>The crew collects everything on a batched day and stores it between semesters.</p></li>
            <li className="mv-step"><span className="mv-step-n">3</span><p>Incoming students buy pieces or bundles at second-hand prices.</p></li>
            <li className="mv-step"><span className="mv-step-n">4</span><p>Orders arrive in move-in week, and sellers get their share after pieces sell.</p></li>
        </ol>
        <SectionLabel icon="spark">Add-ons: more than furniture</SectionLabel>
        <div className="mv-addons">
            {ADDONS.map(a => <div className="mv-addon" key={a.id}>
                <span className="mv-addon-icon"><Icon name={a.icon} size={20} /></span>
                <p className="mv-addon-name">{a.name}</p>
                <p className="mv-addon-detail">{a.detail}</p>
                <span className="mv-addon-price">from {money(a.price)}</span>
            </div>)}
        </div>
        <Caption>Full-service mover extras, sized for a student budget. Pick them inside a pickup booking. Demo prices, like everything here.</Caption>
        <div style={{ marginTop: 16 }}>
            <Link className="mv-linkcard" to="/how-it-works">
                <span className="mv-label-icon"><Icon name="wallet" size={15} /></span>
                <span>
                    <span className="t">How it works</span>
                    <span className="d" style={{ display: 'block' }}>The three ways DormDrop could charge, and what is demo here.</span>
                </span>
                <span className="arr"><Icon name="arrow" size={16} /></span>
            </Link>
        </div>
        <p className="mv-demo-line">Early demo with sample data: nothing is scheduled, charged or sent.</p>
        <FeedbackCard />
    </div>;
}

/* ------------------------------------------------------------------ */
/* Moving out: five actual screens                                     */
/* ------------------------------------------------------------------ */

type MoveOutDraft = {
    items: Record<string, number>;
    service: '' | 'sell' | 'clear';
    addons: string[];
    campus: string;
    date: string;
    name: string;
    email: string;
    ref: string;
};

const EMPTY_MOVE_OUT: MoveOutDraft = { items: {}, service: '', addons: [], campus: '', date: '', name: '', email: '', ref: '' };

function MovingOut() {
    const [draft, setDraft, saved] = useLocalState<MoveOutDraft>('campuscycle-moveout.v1', EMPTY_MOVE_OUT);
    const [step, setStep] = React.useState(1);
    const set = (patch: Partial<MoveOutDraft>) => { if (saved.ready) setDraft({ ...draft, ...patch }); };

    const pieces = countItems(draft.items);
    const listingTotal = PIECES.reduce((sum, p) => sum + p.resale * (draft.items[p.id] || 0), 0);
    const payout = Math.round(listingTotal / 2);
    const addonsTotal = draft.addons.reduce((s, id) => s + (ADDON_BY_ID[id]?.price || 0), 0);
    const addonNames = draft.addons.map(id => ADDON_BY_ID[id]?.name).filter(Boolean).join(', ');
    const clearFee = 'about ' + money(99 + addonsTotal) + ' to ' + money(109 + addonsTotal);
    const toggleAddon = (id: string) => set({ addons: draft.addons.includes(id) ? draft.addons.filter(a => a !== id) : [...draft.addons, id] });

    const readyAll = pieces > 0 && draft.service !== '' && draft.campus !== '' && draft.date !== '' && draft.name.trim() !== '' && draft.email.trim() !== '';
    const stepValid = step >= 6 ? readyAll : [true,
        pieces > 0,
        draft.service !== '',
        true,
        draft.campus !== '' && draft.date !== '',
        draft.name.trim() !== '' && draft.email.trim() !== '',
    ][step];
    const hint = ['',
        'Tap + on each piece you have. Quantities are a guess at this stage, which is fine.',
        'Choose what should happen to your furniture.',
        'Add-ons are optional: pick any, or skip.',
        'Choose a campus and a pickup day.',
        'Add your name and student email.',
    ][step];

    const next = () => { if (stepValid && step < 6) { setStep(step + 1); scrollTop(); } };
    const back = () => { if (step > 1) { setStep(step - 1); scrollTop(); } };
    const book = () => { set({ ref: makeRef('CC-OUT') }); scrollTop(); };

    if (draft.ref) {
        return <div className="mv">
            <AppBar back />
            <Gradients />
            <div className="mv-done">
                <CheckMark />
                <p className="mv-done-title">Pickup request received</p>
                <br /><span className="mv-done-ref">{draft.ref}</span>
            </div>
            <div className="mv-ticket">
                <div className="mv-ticket-head">YOUR REQUEST</div>
                <div className="mv-ticket-body">
                    <Facts items={[
                        { label: 'Pieces', value: `${pieces}` },
                        { label: 'Service', value: draft.service === 'sell' ? 'Sell through DormDrop' : 'Clear-out pickup' },
                        { label: 'Campus', value: draft.campus },
                        { label: 'Pickup day', value: draft.date + ' (demo date)' },
                        { label: 'Add-ons', value: addonNames ? addonNames + ' (' + money(addonsTotal) + ')' : 'None' },
                        { label: draft.service === 'sell' ? 'Estimated payout' : 'Estimated fee', value: draft.service === 'sell' ? money(payout) + ' if all pieces sell' : clearFee },
                    ]} />
                </div>
            </div>
            <div style={{ marginTop: 16 }}>
                <Paragraph>Simulated booking: no crew is scheduled and no money moves. In the real app you would now get a confirmation email and a reminder the day before.</Paragraph>
                <button type="button" className="mv-ghost" onClick={() => { setDraft(EMPTY_MOVE_OUT); setStep(1); }}>Start a new request</button>
            </div>
        </div>;
    }

    return <div className="mv">
        <AppBar back />
        <ScreenHead title="Moving out" step={step} total={6} />
        <StorageNote message={saved.message} ready={saved.ready} />

        {step === 1 && <>
            <SectionLabel icon="box">What are you leaving?</SectionLabel>
            <p className="app-caption">Selling everything together? <Link to="/room-sets">List a discounted whole-room set instead →</Link></p>
            <div className="mv-items">
                {PIECES.map(p => {
                    const qty = draft.items[p.id] || 0;
                    return <div className={'mv-item' + (qty > 0 ? ' on' : '')} key={p.id}>
                        <span className="mv-item-icon"><Icon name={p.icon} size={22} /></span>
                        <div className="mv-item-info">
                            <p className="mv-item-name">{p.name}</p>
                            <p className="mv-item-note">{p.note}</p>
                            <span className="mv-item-price">lists for about {money(p.resale)}</span>
                        </div>
                        <Stepper value={qty} onChange={v => set({ items: { ...draft.items, [p.id]: v } })} />
                    </div>;
                })}
            </div>
        </>}

        {step === 2 && <>
            <SectionLabel icon="tag">What should happen to it?</SectionLabel>
            <div className="mv-services">
                <button type="button" aria-pressed={draft.service === 'sell'}
                    className={'mv-service' + (draft.service === 'sell' ? ' on' : '')}
                    onClick={() => set({ service: 'sell' })}>
                    <span className="mv-service-icon"><Icon name="wallet" size={21} /></span>
                    <span>
                        <p className="mv-service-name">Sell through DormDrop</p>
                        <p className="mv-service-detail">We list your pieces and you get a share when they sell.</p>
                    </span>
                    <span className="mv-service-check"><Icon name="check" size={13} /></span>
                </button>
                <button type="button" aria-pressed={draft.service === 'clear'}
                    className={'mv-service' + (draft.service === 'clear' ? ' on' : '')}
                    onClick={() => set({ service: 'clear' })}>
                    <span className="mv-service-icon"><Icon name="truck" size={21} /></span>
                    <span>
                        <p className="mv-service-name">Clear-out pickup</p>
                        <p className="mv-service-detail">One fee and everything is gone before your flight.</p>
                    </span>
                    <span className="mv-service-check"><Icon name="check" size={13} /></span>
                </button>
            </div>
            {draft.service === 'sell' && <EstimatePanel
                lines={[{ k: `Estimated listing total, ${pieces || 'your'} pieces`, v: money(listingTotal) },
                    ...(addonsTotal > 0 ? [{ k: 'Add-ons, charged once at pickup', v: money(addonsTotal) }] : [])]}
                totalLabel="Your estimated share, 50 percent" totalValue={money(payout)}
                note="Estimates, not a promise. The 50/50 split is an assumption we want to test. Add-ons are charged on top. Anything unsold at the end of the season can be cleared at the pickup rate or donated." />}
            {draft.service === 'clear' && <EstimatePanel
                lines={addonsTotal > 0 ? [{ k: 'Clear-out fee', v: 'about $99 to 109' }, { k: 'Add-ons', v: money(addonsTotal) }] : []}
                totalLabel="Estimated fee for the whole job" totalValue={clearFee}
                note="A rough estimate. You pay one fee and everything is gone before your flight." />}
        </>}

        {step === 3 && <>
            <SectionLabel icon="spark">Anything else? Add-ons</SectionLabel>
            <div className="mv-services">
                {ADDONS.map(a => {
                    const on = draft.addons.includes(a.id);
                    return <button type="button" aria-pressed={on} key={a.id}
                        className={'mv-service' + (on ? ' on' : '')}
                        onClick={() => toggleAddon(a.id)}>
                        <span className="mv-service-icon"><Icon name={a.icon} size={21} /></span>
                        <span>
                            <p className="mv-service-name">{a.name}</p>
                            <p className="mv-service-detail">{a.detail}</p>
                            <span className="mv-item-price">about {money(a.price)}</span>
                        </span>
                        <span className="mv-service-check"><Icon name="check" size={13} /></span>
                    </button>;
                })}
            </div>
            <Caption>Extra hands around the move itself, charged once with your pickup. Demo prices.</Caption>
        </>}

        {step === 4 && <>
            <SectionLabel icon="calendar">Pickup day</SectionLabel>
            <Sub>Campus</Sub>
            <Chips label="Campus" options={CAMPUSES} value={draft.campus} onChange={v => set({ campus: v })} />
            <Sub>Pickup day (demo dates)</Sub>
            <Chips label="Pickup day" options={MOVE_OUT_DATES} value={draft.date} onChange={v => set({ date: v })} />
            <Caption>Pickups are batched on set days in move-out week. That is how the cost stays low.</Caption>
        </>}

        {step === 5 && <>
            <SectionLabel icon="user">Your details</SectionLabel>
            <TextField label="Name" value={draft.name} onChange={v => set({ name: v })} />
            <TextField label="Student email" value={draft.email} onChange={v => set({ email: v })} />
            <Caption>Demo only. This goes nowhere.</Caption>
        </>}

        {step === 6 && <>
            <SectionLabel icon="list">Review and book</SectionLabel>
            <div className="mv-summary">
                <div className="line"><span className="k">Pieces</span><span className="v">{pieces}</span></div>
                <div className="line"><span className="k">Service</span><span className="v">{draft.service === 'sell' ? 'Sell through DormDrop' : draft.service === 'clear' ? 'Clear-out pickup' : 'Not chosen'}</span></div>
                <div className="line"><span className="k">Add-ons</span><span className="v">{addonNames ? addonNames + ' (' + money(addonsTotal) + ')' : 'None'}</span></div>
                <div className="line"><span className="k">Campus</span><span className="v">{draft.campus || 'Not chosen'}</span></div>
                <div className="line"><span className="k">Pickup day</span><span className="v">{draft.date || 'Not chosen'}</span></div>
                <div className="line total"><span className="k">{draft.service === 'clear' ? 'Estimated fee' : 'Estimated payout'}</span><span className="v">{draft.service === '' ? 'Choose a service first' : draft.service === 'clear' ? clearFee : money(payout) + ' if all pieces sell'}</span></div>
            </div>
        </>}

        {step < 6
            ? <>{!stepValid && <Caption>{hint}</Caption>}<CtaBar label="Continue" disabled={!stepValid} onClick={next} onBack={step > 1 ? back : undefined} /></>
            : <CtaBar total={draft.service === 'clear' ? clearFee : draft.service === 'sell' ? money(payout) + ' back' : undefined}
                label="Book this pickup (demo)" disabled={!stepValid} onClick={book} onBack={back} />}
    </div>;
}

/* ------------------------------------------------------------------ */
/* Moving in: five actual screens                                      */
/* ------------------------------------------------------------------ */

type MoveInDraft = {
    cart: Record<string, number>;
    campus: string;
    date: string;
    name: string;
    email: string;
    ref: string;
};

const EMPTY_MOVE_IN: MoveInDraft = { cart: {}, campus: '', date: '', name: '', email: '', ref: '' };

function MovingIn() {
    const [draft, setDraft, saved] = useLocalState<MoveInDraft>('campuscycle-movein.v1', EMPTY_MOVE_IN);
    const [step, setStep] = React.useState(1);
    const set = (patch: Partial<MoveInDraft>) => { if (saved.ready) setDraft({ ...draft, ...patch }); };

    const cartCount = countItems(draft.cart);
    const subtotal = Object.entries(draft.cart).reduce((sum, [id, qty]) => sum + (CATALOG[id]?.price || 0) * qty, 0);
    const total = subtotal + (cartCount > 0 ? DELIVERY_FEE : 0);
    const cartLines = Object.entries(draft.cart).filter(([, qty]) => qty > 0);

    const readyAll = cartCount > 0 && draft.campus !== '' && draft.date !== '' && draft.name.trim() !== '' && draft.email.trim() !== '';
    const stepValid = step >= 5 ? readyAll : [true,
        true,
        cartCount > 0,
        draft.campus !== '' && draft.date !== '',
        draft.name.trim() !== '' && draft.email.trim() !== '',
    ][step];
    const hint = ['', '', 'Add at least one piece here, or go back for a bundle.', 'Choose a campus and a delivery day.', 'Add your name and student email.'][step];

    const next = () => { if (stepValid && step < 5) { setStep(step + 1); scrollTop(); } };
    const back = () => { if (step > 1) { setStep(step - 1); scrollTop(); } };
    const reserve = () => { set({ ref: makeRef('CC-IN') }); scrollTop(); };
    const addOne = (id: string) => set({ cart: { ...draft.cart, [id]: (draft.cart[id] || 0) + 1 } });

    if (draft.ref) {
        return <div className="mv">
            <AppBar back />
            <Gradients />
            <div className="mv-done">
                <CheckMark />
                <p className="mv-done-title">Order reserved</p>
                <br /><span className="mv-done-ref">{draft.ref}</span>
            </div>
            <div className="mv-ticket">
                <div className="mv-ticket-head">YOUR ORDER</div>
                <div className="mv-ticket-body">
                    <div className="mv-summary" style={{ border: 0, padding: '8px 0 0' }}>
                        {cartLines.map(([id, qty]) =>
                            <div className="line" key={id}><span className="k">{CATALOG[id].name}{qty > 1 ? ' x ' + qty : ''}</span><span className="v">{money(CATALOG[id].price * qty)}</span></div>)}
                        <div className="line"><span className="k">Delivery, move-in week</span><span className="v">{money(DELIVERY_FEE)}</span></div>
                        <div className="line total"><span className="k">Total</span><span className="v">{money(total)}</span></div>
                    </div>
                    <Facts items={[
                        { label: 'Campus', value: draft.campus },
                        { label: 'Delivery day', value: draft.date + ' (demo date)' },
                    ]} />
                </div>
            </div>
            <div style={{ marginTop: 16 }}>
                <Paragraph>Simulated reservation: no deposit is charged and nothing is set aside. In the real app a small deposit would hold the pieces until your delivery day.</Paragraph>
                <button type="button" className="mv-ghost" onClick={() => { setDraft(EMPTY_MOVE_IN); setStep(1); }}>Start a new order</button>
            </div>
        </div>;
    }

    return <div className="mv">
        <AppBar back />
        <ScreenHead title="Moving in" step={step} total={5} />
        <StorageNote message={saved.message} ready={saved.ready} />

        {step === 1 && <>
            <SectionLabel icon="spark">Start with a bundle</SectionLabel>
            <p className="app-caption">Want one student's entire room? <Link to="/room-sets">Browse discounted room sets →</Link></p>
            <div className="mv-items">
                {BUNDLES.map(b => {
                    const qty = draft.cart[b.id] || 0;
                    return <div className={'mv-item' + (qty > 0 ? ' on' : '')} key={b.id}>
                        <span className="mv-item-icon"><Icon name={b.icon} size={22} /></span>
                        <div className="mv-item-info">
                            <p className="mv-item-name">{b.name}</p>
                            <p className="mv-item-note">{b.detail}</p>
                            <span className="mv-item-price">{money(b.price)}</span>
                        </div>
                        <button type="button" aria-pressed={qty > 0}
                            className={'mv-chip' + (qty > 0 ? ' on' : '')}
                            onClick={() => addOne(b.id)}>{qty > 0 ? 'Added x ' + qty : 'Add'}</button>
                    </div>;
                })}
            </div>
            <Caption>Bundles cost less than the same pieces bought one by one, and everything arrives together.</Caption>
        </>}

        {step === 2 && <>
            <SectionLabel icon="sofa">Or pick single pieces</SectionLabel>
            <div className="mv-items">
                {PIECES.map(p => {
                    const qty = draft.cart[p.id] || 0;
                    return <div className={'mv-item' + (qty > 0 ? ' on' : '')} key={p.id}>
                        <span className="mv-item-icon"><Icon name={p.icon} size={22} /></span>
                        <div className="mv-item-info">
                            <p className="mv-item-name">{p.name}</p>
                            <p className="mv-item-note">{p.note}</p>
                            <span className="mv-item-price">{money(p.resale)}<span className="retail">new {money(p.retail)}</span></span>
                        </div>
                        <Stepper value={qty} onChange={v => set({ cart: { ...draft.cart, [p.id]: v } })} />
                    </div>;
                })}
            </div>
            <Caption>Demo inventory. Real listings would come from actual move-outs, with photos and condition notes.</Caption>
        </>}

        {step === 3 && <>
            <SectionLabel icon="pin">Delivery</SectionLabel>
            <Sub>Campus</Sub>
            <Chips label="Campus" options={CAMPUSES} value={draft.campus} onChange={v => set({ campus: v })} />
            <Sub>Delivery day (demo dates)</Sub>
            <Chips label="Delivery day" options={MOVE_IN_DATES} value={draft.date} onChange={v => set({ date: v })} />
            <Caption>Deliveries are batched in move-in week, carried up to your room.</Caption>
        </>}

        {step === 4 && <>
            <SectionLabel icon="user">Your details</SectionLabel>
            <TextField label="Name" value={draft.name} onChange={v => set({ name: v })} />
            <TextField label="Student email" value={draft.email} onChange={v => set({ email: v })} />
            <Caption>Demo only. This goes nowhere.</Caption>
        </>}

        {step === 5 && <>
            <SectionLabel icon="list">Review and reserve</SectionLabel>
            <div className="mv-summary">
                {cartLines.map(([id, qty]) =>
                    <div className="line" key={id}><span className="k">{CATALOG[id].name}{qty > 1 ? ' x ' + qty : ''}</span><span className="v">{money(CATALOG[id].price * qty)}</span></div>)}
                <div className="line"><span className="k">Delivery, move-in week</span><span className="v">{money(DELIVERY_FEE)}</span></div>
                <div className="line total"><span className="k">Total</span><span className="v">{money(total)}</span></div>
            </div>
        </>}

        {step < 5
            ? <>{!stepValid && <Caption>{hint}</Caption>}<CtaBar total={cartCount > 0 ? money(total) : undefined} label="Continue" disabled={!stepValid} onClick={next} onBack={step > 1 ? back : undefined} /></>
            : <CtaBar total={money(total)} label="Reserve this order (demo)" disabled={!stepValid} onClick={reserve} onBack={back} />}
    </div>;
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
    const models = [
        { n: 1, name: 'Buy and resell', pays: 'The incoming student buys pieces', does: 'Picks up, stores, lists and delivers', here: 'The sell and browse flows' },
        { n: 2, name: 'Clearance fee', pays: 'The departing student pays per job', does: 'Picks up and clears or donates', here: 'The clear-out pickup flow' },
        { n: 3, name: 'Rental', pays: 'The incoming student pays monthly', does: 'Owns and delivers furniture sets', here: 'Not included yet' },
    ];
    return <div className="mv">
        <AppBar back />
        <div className="mv-top"><p className="mv-top-title">How it works</p></div>
        <SectionLabel icon="wallet">Three ways DormDrop could charge</SectionLabel>
        <div className="mv-models">
            {models.map(m => <div className="mv-model" key={m.n}>
                <div className="mv-model-top"><span className="mv-model-n">{m.n}</span><p className="mv-model-name">{m.name}</p></div>
                <dl>
                    <div><dt>Who pays</dt><dd>{m.pays}</dd></div>
                    <div><dt>What DormDrop does</dt><dd>{m.does}</dd></div>
                    <div><dt>In this demo</dt><dd>{m.here}</dd></div>
                </dl>
            </div>)}
        </div>
        <SectionLabel icon="check">What is demo and what is real</SectionLabel>
        <Bullets items={[
            'Every piece, price, date, booking and reservation on this page is demo data. No crew, payment or message is real.',
            'The pickup fee of about $99 to 109 per job and the 50/50 resale split are rough estimates we want your reaction to.',
            'Add-ons like packing help, on-loading, off-loading and short moves are demo services with rough prices.',
            'Still open: which of the three models to start with, and which campuses to launch on first. Your feedback decides this.',
        ]} />
        <FeedbackCard />
    </div>;
}

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

function FeedbackCard() {
    return <div className="mv-feedback">
        <p className="mv-feedback-title">Tried it? Tell us what you think.</p>
        <p className="mv-feedback-text">Two minutes, no account. Would you use this, what is missing, what would you pay?</p>
        {FEEDBACK_URL
            ? <a className="mv-feedback-btn" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">Give feedback</a>
            : <span className="mv-feedback-btn off">Feedback form coming soon</span>}
    </div>;
}

export function App() {
    React.useEffect(() => { document.title = "DormDrop - student furniture and whole-room sets (early demo)"; }, []);
    return <FileCard><style>{":root {\n    --ds-page: #102543;\n    --ds-ink: #f7fbff;\n    --ds-ink-2: #c3d5e9;\n    --ds-ink-4: #9db8d0;\n    --ds-hairline: #365574;\n    --ds-font-text: Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif;\n    --ds-font-display: \"Fredoka\", var(--ds-font-text);\n}\nhtml { -webkit-text-size-adjust: 100%; }\nbody { margin: 0; color: var(--ds-ink); font-family: var(--ds-font-text); font-size: 16px; line-height: 1.5; }\n.app-card { max-width: 560px; margin: 0 auto; padding: 8px 16px 40px; }\n.app-closing { margin-top: 28px; padding-top: 14px; border-top: 1px solid var(--ds-hairline); font-size: 12.5px; color: var(--ds-ink-4); }\n.app-caption { margin: 8px 0; font-size: 13px; color: var(--ds-ink-2); }\n.app-para { margin: 10px 0; color: var(--ds-ink-2); }\n.app-bullets { padding-left: 20px; color: var(--ds-ink-2); } .app-bullets li { margin: 6px 0; }\n.app-facts { margin: 0; } .app-facts > div { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--ds-hairline); }\n.app-facts dt { color: var(--ds-ink-2); font-size: 14px; } .app-facts dd { margin: 0; text-align: right; font-weight: 600; font-size: 14px; }\n.app-field { margin: 10px 0; } .app-field label { display: block; font-size: 13px; color: var(--ds-ink-2); margin-bottom: 4px; }\n.app-field input { width: 100%; box-sizing: border-box; padding: 11px 12px; font-size: 16px; border: 1px solid var(--ds-hairline); border-radius: 12px; background: #1b3555; color: var(--ds-ink); }\n.app-field input:focus { outline: 2px solid var(--cc-ring, #91d1d0); outline-offset: 1px; }\na { color: inherit; }\n\nhtml, body, #root { margin: 0; min-height: 100%; }\nbody { background: var(--ds-page); }\n\n/* DormDrop theme: deep navy, white, orange, turquoise and blue. */\n:root {\n    --cc-navy: #102543;\n    --cc-navy-2: #183858;\n    --cc-green: #91d1d0;\n    --cc-green-dk: #68b7bb;\n    --cc-orange: #f56b20;\n    --cc-yellow: #ff8b46;\n    --cc-cream: #f7fbff;\n    --cc-peach: #9bcfd0;\n    --cc-wash: rgb(145 209 208 / 0.10);\n    --cc-wash-2: rgb(255 139 70 / 0.20);\n    --cc-ring: rgb(145 209 208 / 0.55);\n    --cc-shadow: 0 4px 0 rgb(20 35 58 / 0.9);\n    --cc-glow: 0 6px 20px rgb(145 209 208 / 0.30);\n}\n\n.mv, .mv button, .mv input { font-family: var(--ds-font-text); }\n.mv * { box-sizing: border-box; }\n.mv-brand-cycle { color: var(--cc-green); }\n\n/* ---------------- App bar (sticky, blurred) --------------------------- */\n.mv-appbar {\n    position: sticky; top: 0; z-index: 30;\n    display: flex; align-items: center; gap: 10px;\n    margin: -8px 0 14px; padding: 10px 2px;\n    background: rgb(16 37 67 / 0.88);\n    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);\n    border-bottom: 1px solid var(--ds-hairline);\n}\n.mv-appbar-icon {\n    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; overflow: hidden;\n    background: var(--cc-navy); display: grid; place-items: center;\n    box-shadow: 0 2px 0 rgb(20 35 58 / 0.35);\n}\n.mv-appbar-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }\n.mv-appbar-name { margin: 0; font-family: var(--ds-font-display); font-weight: 600; font-size: 20px; letter-spacing: -0.01em; color: var(--ds-ink); }\n.mv-demo-pill {\n    margin-left: auto; flex-shrink: 0; padding: 4px 11px; border-radius: 999px;\n    background: var(--cc-yellow); border: 1.5px solid var(--cc-navy);\n    box-shadow: 2px 2px 0 var(--cc-navy); transform: rotate(-2deg);\n    font-size: 11px; font-weight: 700; letter-spacing: .05em; color: var(--cc-navy);\n}\n.mv-back {\n    display: inline-flex; align-items: center; justify-content: center;\n    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;\n    border: 1.5px solid var(--ds-hairline); color: var(--ds-ink-2); text-decoration: none;\n    transition: border-color .2s, color .2s;\n}\n.mv-back:hover { border-color: var(--cc-ring); color: var(--cc-green-dk); }\n\n/* ---------------- Motion ----------------------------------------------- */\n/* Entrance fades are avoided: they corrupt static renders. Motion lives in\n   interactions (progress, chips, buttons, check draw) and the hero stars. */\n@media (prefers-reduced-motion: reduce) {\n    .mv * { transition: none !important; }\n    .mv-hero-glow, .mv-star, .mv-check-ring circle, .mv-check-ring path { animation: none !important; }\n}\n\n/* ---------------- Hero (Start) ---------------------------------------- */\n.mv-hero {\n    position: relative; overflow: hidden; border-radius: 24px;\n    padding: 24px 20px 24px; color: var(--cc-cream);\n    background: linear-gradient(160deg, var(--cc-navy-2) 0%, var(--cc-navy) 55%, #0e1a2d 100%);\n    box-shadow: 0 18px 40px rgb(20 35 58 / 0.30);\n}\n.mv-hero-glow {\n    position: absolute; border-radius: 50%; filter: blur(46px); pointer-events: none;\n}\n.mv-hero-glow.g1 { width: 260px; height: 260px; right: -70px; top: -80px; background: rgb(145 209 208 / 0.38); animation: mv-drift 14s ease-in-out infinite alternate; }\n.mv-hero-glow.g2 { width: 220px; height: 220px; left: -60px; bottom: -90px; background: rgb(255 139 70 / 0.25); animation: mv-drift 18s ease-in-out infinite alternate-reverse; }\n@keyframes mv-drift { from { transform: translate(0, 0); } to { transform: translate(18px, 12px); } }\n.mv-hero-inner { position: relative; }\n.mv-hero-logo {\n    display: block; width: 100%; border-radius: 18px; margin: 0 0 16px;\n    border: 3px solid var(--cc-cream); transform: rotate(-1.2deg);\n    box-shadow: 7px 8px 0 rgb(0 0 0 / 0.28);\n}\n.mv-star { position: absolute; z-index: 1; color: var(--cc-yellow); animation: mv-float 6s ease-in-out infinite alternate; pointer-events: none; }\n.mv-star.s1 { right: 14px; top: 46%; }\n.mv-star.s2 { left: 10px; bottom: 34%; color: var(--cc-green); animation-duration: 8s; }\n.mv-star.s3 { right: 26px; bottom: 12px; color: var(--cc-cream); opacity: .7; animation-duration: 7s; }\n@keyframes mv-float { from { transform: translateY(0) rotate(-6deg); } to { transform: translateY(-7px) rotate(8deg); } }\n.mv-hero-line { margin: 0 0 18px; font-size: 14px; line-height: 22px; color: rgb(247 251 255 / 0.85); max-width: 46ch; }\n.mv-journeys { display: grid; gap: 10px; }\n@media (min-width: 768px) { .mv-journeys { grid-template-columns: 1fr 1fr; } }\n.mv-journey {\n    display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 16px;\n    background: rgb(247 251 255 / 0.07); border: 1px solid rgb(247 251 255 / 0.16);\n    color: var(--cc-cream); text-decoration: none; backdrop-filter: blur(6px);\n    transition: background .2s, border-color .2s, transform .2s;\n}\n.mv-journey:hover { background: rgb(247 251 255 / 0.12); border-color: rgb(255 139 70 / 0.55); transform: translateY(-2px); }\n.mv-journey-icon {\n    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;\n    display: grid; place-items: center; color: var(--cc-cream);\n    transition: transform .25s cubic-bezier(.34,1.56,.64,1);\n}\n.mv-journey:hover .mv-journey-icon { transform: rotate(-6deg) scale(1.06); }\n.mv-journey:nth-child(1) .mv-journey-icon { background: var(--cc-green); }\n.mv-journey:nth-child(2) .mv-journey-icon { background: var(--cc-orange); }\n.mv-journey-name { margin: 0; font-weight: 600; font-size: 15px; }\n.mv-journey-detail { margin: 2px 0 0; font-size: 12px; line-height: 17px; color: rgb(247 251 255 / 0.66); }\n.mv-journey-arrow { margin-left: auto; color: var(--cc-yellow); flex-shrink: 0; }\n\n/* ---------------- How-it-goes steps ------------------------------------ */\n.mv-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }\n.mv-step { display: flex; gap: 14px; position: relative; padding: 0 0 18px; }\n.mv-step:last-child { padding-bottom: 0; }\n.mv-step::before {\n    content: \"\"; position: absolute; left: 15px; top: 34px; bottom: 2px; width: 2px;\n    background: linear-gradient(var(--cc-green), var(--cc-yellow)); opacity: .4; border-radius: 2px;\n}\n.mv-step:last-child::before { display: none; }\n.mv-step-n {\n    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;\n    background: var(--cc-green); color: var(--cc-cream); font-weight: 700; font-size: 13px;\n    display: grid; place-items: center; box-shadow: 0 3px 0 rgb(20 35 58 / 0.85);\n}\n.mv-step p { margin: 5px 0 0; font-size: 14px; line-height: 22px; color: var(--ds-ink); }\n\n/* ---------------- Screen header + progress ----------------------------- */\n.mv-top { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }\n.mv-top-title { margin: 0; font-family: var(--ds-font-display); font-weight: 600; font-size: 23px; letter-spacing: -0.01em; color: var(--ds-ink); }\n.mv-top-step { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--cc-green-dk); white-space: nowrap; }\n.mv-progress { height: 6px; border-radius: 99px; background: rgb(20 35 58 / 0.08); overflow: hidden; margin: 8px 0 18px; }\n.mv-progress > div {\n    height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--cc-green), var(--cc-yellow));\n    transition: width .45s cubic-bezier(.22,.9,.3,1);\n}\n\n/* ---------------- Section label inside a screen ------------------------ */\n.mv-label { display: flex; align-items: center; gap: 8px; margin: 22px 0 10px; }\n.mv-label .mv-label-icon { width: 28px; height: 28px; border-radius: 9px; background: var(--cc-wash-2); color: var(--cc-navy); display: grid; place-items: center; flex-shrink: 0; }\n.mv-label h2 { margin: 0; font-family: var(--ds-font-display); font-weight: 600; font-size: 19px; letter-spacing: -0.01em; color: var(--ds-ink); }\n\n/* ---------------- Item cards with steppers ----------------------------- */\n.mv-items { display: grid; gap: 10px; }\n@media (min-width: 768px) { .mv-items { grid-template-columns: 1fr 1fr; } }\n.mv-item {\n    display: flex; align-items: center; gap: 12px; padding: 12px;\n    border: 1.5px solid var(--ds-hairline); border-radius: 16px; background: #1b3555;\n    transition: border-color .2s, box-shadow .2s, transform .15s;\n}\n.mv-item.on { border-color: var(--cc-ring); box-shadow: 0 4px 18px rgb(145 209 208 / 0.16); }\n.mv-item-icon {\n    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;\n    background: var(--cc-wash); color: var(--cc-green-dk); display: grid; place-items: center;\n    transition: background .2s, color .2s;\n}\n.mv-item.on .mv-item-icon { background: var(--cc-green); color: var(--cc-cream); }\n.mv-item-info { min-width: 0; flex: 1; }\n.mv-item-name { margin: 0; font-weight: 600; font-size: 14px; line-height: 20px; color: var(--ds-ink); }\n.mv-item-note { margin: 1px 0 0; color: var(--ds-ink-2); font-size: 12px; line-height: 17px; }\n.mv-item-price { display: block; margin-top: 3px; font-size: 12px; font-weight: 600; color: var(--cc-green-dk); }\n.mv-item-price .retail { font-weight: 350; color: var(--ds-ink-2); margin-left: 6px; text-decoration: line-through; }\n\n.qty { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }\n.qty button {\n    width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--ds-hairline);\n    background: #1b3555; color: var(--ds-ink); font-size: 18px; line-height: 1; cursor: pointer;\n    display: grid; place-items: center; transition: all .15s;\n}\n.qty button:hover:not(:disabled) { border-color: var(--cc-ring); color: var(--cc-green-dk); }\n.qty button:active:not(:disabled) { transform: scale(.9); }\n.qty button.qty-plus { background: var(--cc-green); border-color: transparent; color: var(--cc-cream); box-shadow: 0 3px 0 rgb(20 35 58 / 0.85); }\n.qty button:disabled { color: var(--ds-ink-4); cursor: default; }\n.qty .qty-value { min-width: 20px; text-align: center; font-weight: 600; font-size: 15px; color: var(--ds-ink); }\n\n/* ---------------- Chips ------------------------------------------------- */\n.mv-chips { display: flex; flex-wrap: wrap; gap: 8px; }\n.mv-chip {\n    min-height: 44px; padding: 8px 16px; border-radius: 999px; cursor: pointer;\n    border: 1.5px solid var(--ds-hairline); background: #1b3555; color: var(--ds-ink);\n    font-size: 13px; font-weight: 500; transition: all .18s;\n}\n.mv-chip:hover { border-color: var(--cc-ring); }\n.mv-chip:active { transform: scale(.96); }\n.mv-chip.on { background: var(--cc-green); border-color: transparent; color: var(--cc-cream); box-shadow: 0 3px 0 rgb(20 35 58 / 0.85); }\n\n/* ---------------- Service choice cards ---------------------------------- */\n.mv-services { display: grid; gap: 10px; }\n@media (min-width: 640px) { .mv-services { grid-template-columns: 1fr 1fr; } }\n.mv-service {\n    position: relative; text-align: left; padding: 14px; border-radius: 16px; cursor: pointer;\n    border: 1.5px solid var(--ds-hairline); background: #1b3555;\n    display: flex; gap: 12px; align-items: flex-start; transition: all .18s;\n}\n.mv-service:hover { border-color: var(--cc-ring); }\n.mv-service.on { border-color: var(--cc-green); background: linear-gradient(#1b3555, #1b3555) padding-box; box-shadow: 0 6px 20px rgb(145 209 208 / 0.18); }\n.mv-service-icon { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: var(--cc-wash); color: var(--cc-green-dk); display: grid; place-items: center; }\n.mv-service.on .mv-service-icon { background: var(--cc-green); color: var(--cc-cream); }\n.mv-service-name { margin: 0; font-weight: 600; font-size: 14px; color: var(--ds-ink); }\n.mv-service-detail { margin: 2px 0 0; font-size: 12px; line-height: 17px; color: var(--ds-ink-2); }\n.mv-service-check {\n    position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%;\n    background: var(--cc-green); color: var(--cc-cream); display: grid; place-items: center;\n    opacity: 0; transform: scale(.5); transition: all .2s cubic-bezier(.34,1.56,.64,1);\n}\n.mv-service.on .mv-service-check { opacity: 1; transform: scale(1); }\n\n/* ---------------- Add-ons grid (home) ----------------------------------- */\n.mv-addons { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }\n@media (min-width: 640px) { .mv-addons { grid-template-columns: repeat(3, 1fr); } }\n.mv-addon {\n    padding: 13px 12px; border-radius: 16px; background: #1b3555;\n    border: 1.5px solid var(--ds-hairline); transition: border-color .2s, transform .18s;\n}\n.mv-addon:hover { border-color: var(--cc-ring); transform: translateY(-2px) rotate(-.5deg); }\n.mv-addon-icon {\n    width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center;\n    margin-bottom: 8px; color: var(--cc-cream);\n}\n.mv-addon:nth-child(3n+1) .mv-addon-icon { background: var(--cc-green); }\n.mv-addon:nth-child(3n+2) .mv-addon-icon { background: var(--cc-orange); }\n.mv-addon:nth-child(3n+3) .mv-addon-icon { background: var(--cc-yellow); color: var(--cc-navy); }\n.mv-addon-name { margin: 0; font-weight: 600; font-size: 13.5px; color: var(--ds-ink); }\n.mv-addon-detail { margin: 2px 0 0; font-size: 11.5px; line-height: 16px; color: var(--ds-ink-2); }\n.mv-addon-price { display: inline-block; margin-top: 6px; font-size: 11.5px; font-weight: 700; color: var(--cc-navy); background: var(--cc-wash-2); padding: 2px 8px; border-radius: 999px; }\n\n/* ---------------- Estimate panel (navy, app-like) ----------------------- */\n.mv-estimate {\n    position: relative; overflow: hidden; border-radius: 18px; padding: 16px;\n    background: linear-gradient(150deg, var(--cc-navy-2), var(--cc-navy));\n    color: var(--cc-cream); margin-top: 12px; box-shadow: 0 10px 26px rgb(20 35 58 / 0.25);\n}\n.mv-estimate .glow { position: absolute; width: 180px; height: 180px; right: -60px; top: -70px; border-radius: 50%; background: rgb(145 209 208 / 0.35); filter: blur(42px); pointer-events: none; }\n.mv-estimate .line { position: relative; display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 13px; }\n.mv-estimate .line .k { color: rgb(247 251 255 / 0.66); }\n.mv-estimate .line .v { font-weight: 600; text-align: right; }\n.mv-estimate .total { border-top: 1px solid rgb(247 251 255 / 0.16); margin-top: 8px; padding-top: 11px; }\n.mv-estimate .total .v {\n    font-size: 19px; background: linear-gradient(90deg, var(--cc-yellow), var(--cc-peach));\n    -webkit-background-clip: text; background-clip: text; color: transparent;\n}\n.mv-estimate .note { position: relative; margin: 10px 0 0; font-size: 11.5px; line-height: 17px; color: rgb(247 251 255 / 0.55); }\n\n/* ---------------- Summary card (light) ---------------------------------- */\n.mv-summary { border: 1.5px solid var(--ds-hairline); border-radius: 16px; padding: 14px 16px; background: #1b3555; }\n.mv-summary .line { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 14px; line-height: 22px; }\n.mv-summary .line .k { color: var(--ds-ink-2); }\n.mv-summary .line .v { font-weight: 600; text-align: right; color: var(--ds-ink); }\n.mv-summary .total { border-top: 1px solid var(--ds-hairline); margin-top: 8px; padding-top: 10px; }\n.mv-summary .total .v { background: linear-gradient(90deg, var(--cc-green-dk), var(--cc-orange)); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 17px; }\n\n/* ---------------- CTA bar ------------------------------------------------ */\n.mv-cta-bar {\n    position: sticky; bottom: 12px; z-index: 15; margin-top: 18px;\n    display: flex; align-items: center; gap: 12px;\n    padding: 10px; border-radius: 18px;\n    background: rgb(16 37 67 / 0.96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);\n    border: 1px solid var(--ds-hairline); box-shadow: 0 10px 30px rgb(20 35 58 / 0.16);\n}\n.mv-cta-total { flex-shrink: 0; padding-left: 8px; }\n.mv-cta-total .t1 { display: block; font-size: 11px; color: var(--ds-ink-2); }\n.mv-cta-total .t2 { display: block; font-size: 16px; font-weight: 600; color: var(--ds-ink); }\n.mv-cta {\n    flex: 1; min-height: 48px; border: 0; border-radius: 13px; cursor: pointer;\n    background: var(--cc-green); color: var(--cc-cream); font-size: 15px; font-weight: 700;\n    display: inline-flex; align-items: center; justify-content: center; gap: 8px;\n    box-shadow: var(--cc-shadow); transition: transform .12s, box-shadow .12s, opacity .2s;\n}\n.mv-cta:hover:not(:disabled) { background: var(--cc-green-dk); }\n.mv-cta:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 rgb(20 35 58 / 0.9); }\n.mv-cta:disabled { opacity: .38; cursor: default; box-shadow: none; }\n.mv-ghost {\n    display: inline-flex; align-items: center; justify-content: center; gap: 8px;\n    min-height: 46px; padding: 10px 20px; border-radius: 13px; cursor: pointer;\n    border: 1.5px solid var(--ds-hairline); background: #1b3555; color: var(--ds-ink);\n    font-size: 14px; font-weight: 600; transition: border-color .2s, color .2s;\n}\n.mv-ghost:hover { border-color: var(--cc-ring); color: var(--cc-green-dk); }\n\n/* ---------------- Confirmation ------------------------------------------ */\n.mv-done { text-align: center; padding: 26px 0 6px; }\n.mv-check-ring { width: 84px; height: 84px; margin: 0 auto 16px; display: block; }\n.mv-check-ring circle {\n    fill: none; stroke: url(#mvGradRing); stroke-width: 5; stroke-linecap: round;\n    stroke-dasharray: 230; stroke-dashoffset: 230; animation: mv-draw .7s ease forwards;\n}\n.mv-check-ring path {\n    fill: none; stroke: var(--cc-green); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;\n    stroke-dasharray: 60; stroke-dashoffset: 60; animation: mv-draw .5s .45s ease forwards;\n}\n@keyframes mv-draw { to { stroke-dashoffset: 0; } }\n.mv-done-title { margin: 0 0 4px; font-family: var(--ds-font-display); font-weight: 600; font-size: 24px; letter-spacing: -0.01em; color: var(--ds-ink); }\n.mv-done-ref {\n    display: inline-block; margin: 8px 0 4px; padding: 7px 18px; border-radius: 999px;\n    background: var(--cc-wash); border: 1.5px dashed var(--cc-ring);\n    font-weight: 700; font-size: 15px; color: var(--cc-green-dk); letter-spacing: .02em;\n}\n.mv-ticket { border: 1.5px solid var(--ds-hairline); border-radius: 18px; overflow: hidden; margin-top: 18px; text-align: left; }\n.mv-ticket-head { padding: 12px 16px; background: linear-gradient(150deg, var(--cc-navy-2), var(--cc-navy)); color: var(--cc-cream); font-size: 12.5px; font-weight: 700; letter-spacing: .05em; }\n.mv-ticket-body { padding: 6px 16px 12px; background: #1b3555; }\n\n/* ---------------- Model cards (How it works) ----------------------------- */\n.mv-models { display: grid; gap: 12px; }\n@media (min-width: 768px) { .mv-models { grid-template-columns: repeat(3, 1fr); } }\n.mv-model { border: 1.5px solid var(--ds-hairline); border-radius: 18px; padding: 16px; background: #1b3555; transition: border-color .2s, transform .2s; }\n.mv-model:hover { border-color: var(--cc-ring); transform: translateY(-2px); }\n.mv-model-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }\n.mv-model-n { width: 28px; height: 28px; border-radius: 9px; background: var(--cc-green); color: var(--cc-cream); font-size: 13px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; }\n.mv-model:nth-child(2) .mv-model-n { background: var(--cc-orange); }\n.mv-model:nth-child(3) .mv-model-n { background: var(--cc-yellow); color: var(--cc-navy); }\n.mv-model-name { margin: 0; font-weight: 600; font-size: 15px; color: var(--ds-ink); }\n.mv-model dl { margin: 0; display: grid; gap: 8px; }\n.mv-model dt { font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--cc-green-dk); }\n.mv-model dd { margin: 1px 0 0; font-size: 13px; line-height: 19px; color: var(--ds-ink); }\n\n.mv-note-inline { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: var(--cc-wash); border: 1px solid var(--ds-hairline); }\n.mv-note-inline p { margin: 0; font-size: 12.5px; line-height: 19px; color: var(--ds-ink-2); }\n.mv-note-inline .mv-label-icon { flex-shrink: 0; }\n\n.mv-figure-wrap { margin: 18px 0 4px; }\n\n/* ---------------- Wizard bits ----------------------------------------- */\n.mv-sub { margin: 12px 0 8px; font-size: 12.5px; font-weight: 500; color: var(--ds-ink-2); }\n.mv-linkcard {\n    display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px;\n    border: 1.5px solid var(--ds-hairline); background: #1b3555; color: var(--ds-ink);\n    text-decoration: none; transition: border-color .2s, transform .15s;\n}\n.mv-linkcard:hover { border-color: var(--cc-ring); transform: translateY(-1px); }\n.mv-linkcard .t { font-weight: 600; font-size: 14px; }\n.mv-linkcard .d { font-size: 12px; color: var(--ds-ink-2); margin-top: 1px; }\n.mv-linkcard .arr { margin-left: auto; color: var(--cc-green-dk); }\n.mv-cta-back {\n    min-height: 48px; padding: 0 16px; border-radius: 13px; cursor: pointer; flex-shrink: 0;\n    border: 1.5px solid var(--ds-hairline); background: #1b3555; color: var(--ds-ink);\n    font-size: 14px; font-weight: 600; transition: border-color .2s, color .2s;\n}\n.mv-cta-back:hover { border-color: var(--cc-ring); color: var(--cc-green-dk); }\n.mv-demo-line { margin: 18px 0 4px; font-size: 12px; line-height: 18px; color: var(--ds-ink-2); text-align: center; }\n\n/* Feedback card */\n.mv-feedback { margin: 22px 0 6px; padding: 18px; border-radius: 18px; background: var(--cc-navy); color: var(--cc-cream); }\n.mv-feedback-title { margin: 0 0 4px; font-family: var(--ds-font-display); font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }\n.mv-feedback-text { margin: 0 0 14px; font-size: 14px; color: rgb(247 251 255 / .78); }\n.mv-feedback-btn { display: inline-block; padding: 11px 18px; border-radius: 12px; background: var(--cc-green); color: var(--cc-cream); font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: var(--cc-shadow); transition: transform .12s, box-shadow .12s; }\n.mv-feedback-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgb(20 35 58 / .9); }\n.mv-feedback-btn.off { background: rgb(247 251 255 / .14); box-shadow: none; }\n\n/* Use Bek's supplied image in full, without cropping or recoloring. */\n.mv-hero-logo { width: 100%; max-height: 350px; object-fit: contain; background: #102543; border: 0; border-radius: 12px; transform: none; box-shadow: none; }\n.mv-appbar-icon { color: #102543; background: #91d1d0; font-weight: 800; }\n.mv-brand-cycle { color: #ff8b46; }\n.mv-chip.on, .qty button.qty-plus, .mv-cta { color: #102543; }\n.mv-item.on { background: #234663; }\n.mv-demo-pill { background: #91d1d0; }\n\n.room-heading { font-family: var(--ds-font-display); font-size: 32px; line-height: 1.15; margin: 24px 0 14px; }\n.room-feature { display:block; margin:22px 0; padding:24px; border:1px solid #4d91a4; border-radius:22px; background:linear-gradient(135deg,#193b60,#153348); text-decoration:none; }\n.room-feature h2 { font-family:var(--ds-font-display); margin:8px 0; font-size:27px; line-height:1.15; }\n.room-feature p { color:#c3d5e9; font-size:14px; }\n.room-feature-action { display:inline-block; color:#ff9c64; font-weight:700; }\n.room-eyebrow { font-size:10px; font-weight:800; letter-spacing:.09em; color:#91d1d0; }\n.room-tabs { display:flex; gap:10px; flex-wrap:wrap; margin:22px 0; }\n.room-list { display:grid; gap:16px; }\n.room-list h2 { font-size:23px; line-height:1.2; margin:12px 0; }\n.room-disclaimer { border-left:3px solid #91d1d0; padding:10px 14px; background:#193755; color:#c3d5e9; font-size:12px; }\n.room-field { display:block; font-size:13px; color:#c3d5e9; margin:16px 0; }\n.room-field input,.room-field textarea { display:block; margin-top:6px; width:100%; border-radius:12px; border:1px solid #52738f; color:#f7fbff; background:#102543; font:inherit; font-size:16px; padding:12px; }\n.room-field input:focus,.room-field textarea:focus { outline:2px solid #91d1d0; outline-offset:2px; }\n.room-price { font-weight:800; font-size:30px; margin:16px 0 0; }\n.room-price del { font-size:16px; font-weight:400; color:#9db8d0; margin-left:10px; }\n.room-savings { color:#91d1d0; font-size:14px; font-weight:600; }\n.room-list .mv-cta,.mv-model > .mv-cta { width:100%; margin:14px 0 4px; }\n.mv-model h2 { margin-top:4px; }\n.mv-service-name,.mv-item-name,.mv-step p { color:var(--ds-ink); }\n.mv-addon-price { color:#102543; background:#91d1d0; }\n.mv-label-icon { color:#91d1d0; background:#234663; }\n.mv-feedback-btn { color:#102543; }\n"}</style>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/room-sets" element={<RoomSets />} />
            <Route path="/moving-out" element={<MovingOut />} />
            <Route path="/moving-in" element={<MovingIn />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
        <Closing>Early demo, November 2026. Sample data throughout: no real pickups, deliveries, deposits or accounts.</Closing>
    </FileCard>;
}


type SetListing = { title: string; contents: string; individual: number; price: number };
const sample: SetListing = { title: 'Complete student room', contents: 'Desk, desk chair, floor lamp, full bed frame, mattress, nightstand, dresser and bookshelf. Sample listing from one moving-out student.', individual: 325, price: 260 };
const dollars = (n: number) => '$' + n.toFixed(0);
function RoomSets() {
 const [listing,setListing] = useLocalState<SetListing | null>('dormdrop-room-set.v1',null);
 const [tab,setTab] = React.useState<'buy'|'sell'>('buy');
 const [title,setTitle] = React.useState('My entire room set');
 const [contents,setContents] = React.useState('Desk, desk chair, floor lamp, full bed frame, mattress, nightstand, dresser and bookshelf');
 const [individual,setIndividual] = React.useState('325');
 const [price,setPrice] = React.useState('260');
 const [notice,setNotice] = React.useState(false);
 const [selected,setSelected] = React.useState<SetListing|null>(null);
 const [reserved,setReserved] = React.useState(false);
 const valid = !!title.trim() && !!contents.trim() && Number(individual)>0 && Number(price)>0 && Number(price)<Number(individual) && Number.isFinite(Number(price)) && Number.isFinite(Number(individual));
 const save = () => {if(valid){setListing({title:title.trim(),contents:contents.trim(),individual:Number(individual),price:Number(price)});setNotice(true);setTab('buy');}};
 const choose = (s: SetListing) => {setSelected(s);setReserved(false);};
 return <div className="mv">
  <div className="mv-appbar"><Link to="/" className="mv-back" aria-label="Back to home">←</Link><p className="mv-appbar-name">Dorm<span className="mv-brand-cycle">Drop</span></p><span className="mv-demo-pill">EARLY DEMO</span></div>
  <h1 className="room-heading">One room. One set. Less hassle.</h1>
  <p className="app-para">Moving out? Sell your room's furniture together at a discount. Moving in? Get a complete set from one student.</p>
  <p className="room-disclaimer">Demo only. Listings stay in this browser, are not shared with other students, and do not create a real pickup, sale or payment.</p>
  <div className="room-tabs"><button className={'mv-chip'+(tab==='buy'?' on':'')} onClick={()=>{setTab('buy');setSelected(null);}}>Buy a room set</button><button className={'mv-chip'+(tab==='sell'?' on':'')} onClick={()=>{setTab('sell');setSelected(null);}}>Sell my whole room</button></div>
  {tab==='sell' ? <section className="mv-model">
   <h2>List your whole room</h2><p className="app-caption">Add everything included and set one discounted price. Starting values are examples you can change.</p>
   <label className="room-field">Room set name<input maxLength={90} value={title} onChange={e=>setTitle(e.target.value)} /></label>
   <label className="room-field">What's included?<textarea maxLength={1000} rows={4} value={contents} onChange={e=>setContents(e.target.value)} /></label>
   <label className="room-field">Total if sold separately ($)<input type="number" min="1" step="1" value={individual} onChange={e=>setIndividual(e.target.value)} /></label>
   <label className="room-field">Discounted whole-room price ($)<input type="number" min="1" step="1" value={price} onChange={e=>setPrice(e.target.value)} /></label>
   {valid ? <p className="room-savings">Buyer saves {dollars(Number(individual)-Number(price))} ({Math.round((1-Number(price)/Number(individual))*100)}%) on the furniture.</p> : <p role="status">Enter a positive room-set price below the separate-item total.</p>}
   <p className="app-caption">Delivery is separate. The sample buying flow adds a $29 demo delivery fee. This listing price is not a seller-payout quote.</p>
   <button className="mv-cta" disabled={!valid} onClick={save}>Preview my demo listing</button>
  </section> : <>
   {notice && <p className="room-savings" role="status">Your demo room set is ready below. It is saved only in this browser.</p>}
   {selected ? <section className="mv-model">
    <h2>{reserved?'Demo reservation complete':'Review whole-room set'}</h2><h3>{selected.title}</h3><p>{selected.contents}</p>
    <dl className="app-facts"><div><dt>Room-set price</dt><dd>{dollars(selected.price)}</dd></div><div><dt>Demo delivery</dt><dd>$29</dd></div><div><dt>Total demo estimate</dt><dd>{dollars(selected.price+29)}</dd></div></dl>
    {reserved ? <p role="status" className="room-savings">Nothing was purchased, charged, held or sent. This is only a demo reservation.</p> : <><p className="app-caption">The entire set stays together. No pieces are removed or sold separately in this demo. All prices are sample estimates.</p><button className="mv-cta" onClick={()=>setReserved(true)}>Reserve full set, demo only</button></>}
    <button className="mv-ghost" onClick={()=>setSelected(null)}>Back to room sets</button>
   </section> : <div className="room-list">{[...(listing?[{...listing,own:true}]:[]),{...sample,own:false}].map((s,i)=><article className="mv-model" key={i}>
    <span className="room-eyebrow">{s.own?'YOUR LOCAL DEMO LISTING':'SAMPLE STUDENT LISTING'} · ENTIRE ROOM</span><h2>{s.title}</h2><p className="app-para">{s.contents}</p>
    <p className="room-price">{dollars(s.price)} <del>{dollars(s.individual)}</del></p><p className="room-savings">Save {dollars(s.individual-s.price)} ({Math.round((1-s.price/s.individual)*100)}%) vs. separate items</p><p className="app-caption">One set from one student. Demo delivery: +$29.</p>
    <button className="mv-cta" onClick={()=>choose(s)}>Buy the full room set</button>
    {s.own&&<button className="mv-ghost" onClick={()=>{setListing(null);setNotice(false);}}>Remove my demo listing</button>}
   </article>)}</div>}
  </>}
 </div>;
                        }
