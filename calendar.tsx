import React from 'react';
import { Icon } from './widgets';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const toISO = (d: Date) =>
    d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const fmtDate = (iso: string) => {
    if (!iso) return '';
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export function DatePicker({ label, value, onChange }: { label: string; value: string; onChange: (iso: string) => void }) {
    const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
    const [view, setView] = React.useState(() => {
        const d = value ? new Date(value + 'T12:00:00') : today;
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);

    const shift = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));

    const startGap = (view.getDay() + 6) % 7; // Monday-first
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(startGap).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);

    return <div className="cal" role="group" aria-label={label}>
        <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="Previous month" disabled={view <= firstMonth} onClick={() => shift(-1)}>
                <Icon name="back" size={15} />
            </button>
            <span className="cal-month">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" className="cal-nav" aria-label="Next month" disabled={view >= lastMonth} onClick={() => shift(1)}>
                <Icon name="arrow" size={15} />
            </button>
        </div>
        <div className="cal-grid">
            {WD.map(w => <span className="cal-wd" key={w}>{w}</span>)}
            {cells.map((d, i) => {
                if (d === null) return <span key={i} />;
                const date = new Date(view.getFullYear(), view.getMonth(), d);
                const iso = toISO(date);
                const past = date < today;
                return <button type="button" key={i} disabled={past}
                    className={'cal-day' + (value === iso ? ' sel' : '')}
                    aria-pressed={value === iso}
                    onClick={() => onChange(iso)}>{d}</button>;
            })}
        </div>
        <p className="cal-sel">{value ? fmtDate(value) : 'Pick a date'}</p>
    </div>;
}
