import React from 'react';
import logoMark from './mark.webp';
import { Link } from './ui';

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
    camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13" r="3.2" /></>,
    shield: <><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4" /></>,
    alert: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17h.01" /></>,
    refresh: <><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
};

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>;
}

export function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return <div className="qty">
        <button type="button" aria-label="One fewer" disabled={value === 0} onClick={() => onChange(value - 1)}>-</button>
        <span className="qty-value" aria-live="polite">{value}</span>
        <button type="button" className="qty-plus" aria-label="One more" onClick={() => onChange(value + 1)}>+</button>
    </div>;
}

export function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
    return <div role="group" aria-label={label} className="mv-chips">
        {options.map(o => <button key={o} type="button" aria-pressed={value === o}
            className={'mv-chip' + (value === o ? ' on' : '')} onClick={() => onChange(o)}>{o}</button>)}
    </div>;
}

export function Sub({ children }: { children: React.ReactNode }) {
    return <p className="mv-sub">{children}</p>;
}

export function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
    return <div className="mv-label"><span className="mv-label-icon"><Icon name={icon} size={15} /></span><h2>{children}</h2></div>;
}

export function AppBar({ back }: { back?: boolean }) {
    return <div className="mv-appbar">
        {back && <Link className="mv-back" to="/" aria-label="Back to home"><Icon name="back" size={16} /></Link>}
        <img className="dd-appbar-mark" src={logoMark} alt="" aria-hidden="true" />
        <p className="mv-appbar-name">Dorm<span className="mv-brand-cycle">Drop</span></p>
        <span className="mv-demo-pill">EARLY DEMO</span>
    </div>;
}

export function ScreenHead({ title, step, total }: { title: string; step: number; total: number }) {
    return <>
        <div className="mv-top">
            <p className="mv-top-title">{title}</p>
            <span className="mv-top-step">Step {step} of {total}</span>
        </div>
        <div className="mv-progress" aria-hidden="true"><div style={{ width: (step / total * 100) + '%' }} /></div>
    </>;
}

export function EstimatePanel({ lines, totalLabel, totalValue, note }: {
    lines: { k: string; v: string }[]; totalLabel: string; totalValue: string; note: string;
}) {
    return <div className="mv-estimate">
        <div className="glow" />
        {lines.map(l => <div className="line" key={l.k}><span className="k">{l.k}</span><span className="v">{l.v}</span></div>)}
        <div className="line total"><span className="k">{totalLabel}</span><span className="v">{totalValue}</span></div>
        <p className="note">{note}</p>
    </div>;
}

export function CtaBar({ total, totalLabel, label, disabled, onClick, onBack }: {
    total?: string; totalLabel?: string; label: string; disabled: boolean; onClick: () => void; onBack?: () => void;
}) {
    return <div className="mv-cta-bar">
        {onBack && <button type="button" className="mv-cta-back" onClick={onBack}>Back</button>}
        {total && <div className="mv-cta-total"><span className="t1">{totalLabel || 'Estimated total'}</span><span className="t2">{total}</span></div>}
        <button type="button" className="mv-cta" disabled={disabled} onClick={onClick}>{label}<Icon name="arrow" size={17} /></button>
    </div>;
}

export function Gradients() {
    return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
        <linearGradient id="mvGradRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#91d1d0" /><stop offset="1" stopColor="#ff752f" />
        </linearGradient>
    </defs></svg>;
}

export function CheckMark() {
    return <svg className="mv-check-ring" viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="36" />
        <path d="M28 43.5 38 53 57 33" />
    </svg>;
}

export function scrollTop() {
    document.querySelector('.mv-appbar')?.scrollIntoView({ block: 'start' });
}
