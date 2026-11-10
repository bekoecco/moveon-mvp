import React from 'react';
import { FEEDBACK_URL } from './config';
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
        <span className="mv-appbar-icon"><Icon name="box" size={17} /></span>
        <p className="mv-appbar-name">MoveOn</p>
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
            <stop offset="0" stopColor="#3b7cff" /><stop offset="1" stopColor="#22d3ee" />
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
        <div className="mv-hero">
            <div className="mv-hero-glow g1" /><div className="mv-hero-glow g2" />
            <div className="mv-hero-inner">
                <p className="mv-hero-line">Students moving out leave furniture behind. Students moving in need it. MoveOn picks it up, stores it between semesters and delivers it.</p>
                <div className="mv-journeys">
                    <Link className="mv-journey" to="/moving-out">
                        <span className="mv-journey-icon"><Icon name="truck" size={22} /></span>
                        <span>
                            <p className="mv-journey-name">I am moving out</p>
                            <p className="mv-journey-detail">List your furniture for resale, or book a clear-out pickup before your flight.</p>
                        </span>
                        <span className="mv-journey-arrow"><Icon name="arrow" size={18} /></span>
                    </Link>
                    <Link className="mv-journey" to="/moving-in">
                        <span className="mv-journey-icon"><Icon name="sofa" size={22} /></span>
                        <span>
                            <p className="mv-journey-name">I am moving in</p>
                            <p className="mv-journey-detail">Furnish your room from pieces other students left behind, delivered in move-in week.</p>
                        </span>
                        <span className="mv-journey-arrow"><Icon name="arrow" size={18} /></span>
                    </Link>
                </div>
            </div>
        </div>
        <SectionLabel icon="spark">How a move would go</SectionLabel>
        <ol className="mv-steps">
            <li className="mv-step"><span className="mv-step-n">1</span><p>You book a pickup in move-out week and say what you are leaving behind.</p></li>
            <li className="mv-step"><span className="mv-step-n">2</span><p>The crew collects everything on a batched day and stores it between semesters.</p></li>
            <li className="mv-step"><span className="mv-step-n">3</span><p>Incoming students buy pieces or bundles at second-hand prices.</p></li>
            <li className="mv-step"><span className="mv-step-n">4</span><p>Orders arrive in move-in week, and sellers get their share after pieces sell.</p></li>
        </ol>
        <div style={{ marginTop: 16 }}>
            <Link className="mv-linkcard" to="/how-it-works">
                <span className="mv-label-icon"><Icon name="wallet" size={15} /></span>
                <span>
                    <span className="t">How it works</span>
                    <span className="d" style={{ display: 'block' }}>The three ways MoveOn could charge, and what is demo here.</span>
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
    campus: string;
    date: string;
    name: string;
    email: string;
    ref: string;
};

const EMPTY_MOVE_OUT: MoveOutDraft = { items: {}, service: '', campus: '', date: '', name: '', email: '', ref: '' };

function MovingOut() {
    const [draft, setDraft, saved] = useLocalState<MoveOutDraft>('moveon-moveout.v1', EMPTY_MOVE_OUT);
    const [step, setStep] = React.useState(1);
    const set = (patch: Partial<MoveOutDraft>) => { if (saved.ready) setDraft({ ...draft, ...patch }); };

    const pieces = countItems(draft.items);
    const listingTotal = PIECES.reduce((sum, p) => sum + p.resale * (draft.items[p.id] || 0), 0);
    const payout = Math.round(listingTotal / 2);

    const readyAll = pieces > 0 && draft.service !== '' && draft.campus !== '' && draft.date !== '' && draft.name.trim() !== '' && draft.email.trim() !== '';
    const stepValid = step >= 5 ? readyAll : [true,
        pieces > 0,
        draft.service !== '',
        draft.campus !== '' && draft.date !== '',
        draft.name.trim() !== '' && draft.email.trim() !== '',
    ][step];
    const hint = ['',
        'Tap + on each piece you have. Quantities are a guess at this stage, which is fine.',
        'Choose what should happen to your furniture.',
        'Choose a campus and a pickup day.',
        'Add your name and student email.',
    ][step];

    const next = () => { if (stepValid && step < 5) { setStep(step + 1); scrollTop(); } };
    const back = () => { if (step > 1) { setStep(step - 1); scrollTop(); } };
    const book = () => { set({ ref: makeRef('MV-OUT') }); scrollTop(); };

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
                        { label: 'Service', value: draft.service === 'sell' ? 'Sell through MoveOn' : 'Clear-out pickup' },
                        { label: 'Campus', value: draft.campus },
                        { label: 'Pickup day', value: draft.date + ' (demo date)' },
                        { label: draft.service === 'sell' ? 'Estimated payout' : 'Estimated fee', value: draft.service === 'sell' ? money(payout) + ' if all pieces sell' : 'about $99 to 109' },
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
        <ScreenHead title="Moving out" step={step} total={5} />
        <StorageNote message={saved.message} ready={saved.ready} />

        {step === 1 && <>
            <SectionLabel icon="box">What are you leaving?</SectionLabel>
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
                        <p className="mv-service-name">Sell through MoveOn</p>
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
                lines={[{ k: `Estimated listing total, ${pieces || 'your'} pieces`, v: money(listingTotal) }]}
                totalLabel="Your estimated share, 50 percent" totalValue={money(payout)}
                note="Estimates, not a promise. The 50/50 split is an assumption we want to test. Anything unsold at the end of the season can be cleared at the pickup rate or donated." />}
            {draft.service === 'clear' && <EstimatePanel
                lines={[]}
                totalLabel="Estimated fee for the whole job" totalValue="about $99 to 109"
                note="A rough estimate. You pay one fee and everything is gone before your flight." />}
        </>}

        {step === 3 && <>
            <SectionLabel icon="calendar">Pickup day</SectionLabel>
            <Sub>Campus</Sub>
            <Chips label="Campus" options={CAMPUSES} value={draft.campus} onChange={v => set({ campus: v })} />
            <Sub>Pickup day (demo dates)</Sub>
            <Chips label="Pickup day" options={MOVE_OUT_DATES} value={draft.date} onChange={v => set({ date: v })} />
            <Caption>Pickups are batched on set days in move-out week. That is how the cost stays low.</Caption>
        </>}

        {step === 4 && <>
            <SectionLabel icon="user">Your details</SectionLabel>
            <TextField label="Name" value={draft.name} onChange={v => set({ name: v })} />
            <TextField label="Student email" value={draft.email} onChange={v => set({ email: v })} />
            <Caption>Demo only. This goes nowhere.</Caption>
        </>}

        {step === 5 && <>
            <SectionLabel icon="list">Review and book</SectionLabel>
            <div className="mv-summary">
                <div className="line"><span className="k">Pieces</span><span className="v">{pieces}</span></div>
                <div className="line"><span className="k">Service</span><span className="v">{draft.service === 'sell' ? 'Sell through MoveOn' : draft.service === 'clear' ? 'Clear-out pickup' : 'Not chosen'}</span></div>
                <div className="line"><span className="k">Campus</span><span className="v">{draft.campus || 'Not chosen'}</span></div>
                <div className="line"><span className="k">Pickup day</span><span className="v">{draft.date || 'Not chosen'}</span></div>
                <div className="line total"><span className="k">{draft.service === 'clear' ? 'Estimated fee' : 'Estimated payout'}</span><span className="v">{draft.service === '' ? 'Choose a service first' : draft.service === 'clear' ? 'about $99 to 109' : money(payout) + ' if all pieces sell'}</span></div>
            </div>
        </>}

        {step < 5
            ? <>{!stepValid && <Caption>{hint}</Caption>}<CtaBar label="Continue" disabled={!stepValid} onClick={next} onBack={step > 1 ? back : undefined} /></>
            : <CtaBar total={draft.service === 'clear' ? 'about $99 to 109' : draft.service === 'sell' ? money(payout) + ' back' : undefined}
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
    const [draft, setDraft, saved] = useLocalState<MoveInDraft>('moveon-movein.v1', EMPTY_MOVE_IN);
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
    const reserve = () => { set({ ref: makeRef('MV-IN') }); scrollTop(); };
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
        <SectionLabel icon="wallet">Three ways MoveOn could charge</SectionLabel>
        <div className="mv-models">
            {models.map(m => <div className="mv-model" key={m.n}>
                <div className="mv-model-top"><span className="mv-model-n">{m.n}</span><p className="mv-model-name">{m.name}</p></div>
                <dl>
                    <div><dt>Who pays</dt><dd>{m.pays}</dd></div>
                    <div><dt>What MoveOn does</dt><dd>{m.does}</dd></div>
                    <div><dt>In this demo</dt><dd>{m.here}</dd></div>
                </dl>
            </div>)}
        </div>
        <SectionLabel icon="check">What is demo and what is real</SectionLabel>
        <Bullets items={[
            'Every piece, price, date, booking and reservation on this page is demo data. No crew, payment or message is real.',
            'The pickup fee of about $99 to 109 per job and the 50/50 resale split are rough estimates we want your reaction to.',
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
    return <FileCard>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/moving-out" element={<MovingOut />} />
            <Route path="/moving-in" element={<MovingIn />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
        <Closing>Early demo, November 2026. Sample data throughout: no real pickups, deliveries, deposits or accounts.</Closing>
    </FileCard>;
}
