import React from 'react';

/* Crayon-sketched layer for DormDropp: rough-edged SVG line art,
   a box mascot, and soft draw-in / hop animations. Palette stays
   navy + turquoise + orange, no yellow. */

export function CrayonDefs() {
    return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
            <filter id="cr-rough" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
            </filter>
        </defs>
    </svg>;
}

type P = React.SVGProps<SVGPathElement>;
const I = (d: string, extra?: P) => <path className="cr-line ink" pathLength={100} d={d} {...extra} />;
const T = (d: string, extra?: P) => <path className="cr-line tq" pathLength={100} d={d} {...extra} />;
const O = (d: string, extra?: P) => <path className="cr-line or" pathLength={100} d={d} {...extra} />;

function SketchSearch() {
    return <svg className="cr-art" viewBox="0 0 130 110">
        <circle className="cr-line bl" pathLength={100} cx="56" cy="46" r="25" />
        {I('M74 64 l20 20')}
        {I('M40 48 q16 -16 32 0')}
        {T('M34 50 l8 -14 M46 44 l8 -16 M60 44 l6 -14', { className: 'cr-line tq hatch' })}
        {O('M28 90 q32 10 66 0', { strokeDasharray: '4 7', pathLength: undefined as never })}
    </svg>;
}

function SketchBoxes() {
    return <svg className="cr-art" viewBox="0 0 130 110">
        {I('M26 84 v-26 l12 -8 h38 l12 8 v26')}
        {I('M26 58 l12 8 h38 l12 -8')}
        {O('M76 84 v-22 h28 v22 M82 74 h12')}
        {T('M96 32 q10 -2 9 -14', { strokeDasharray: '4 6', pathLength: undefined as never })}
        {O('M20 92 h92', { className: 'cr-line or soft' })}
    </svg>;
}

function SketchTruck() {
    return <svg className="cr-art" viewBox="0 0 130 110">
        {I('M16 70 h58 v18 h-58 z M74 60 h26 l14 14 v14 h-40 z')}
        <circle className="cr-line ink" pathLength={100} cx="32" cy="92" r="7" />
        <circle className="cr-line ink" pathLength={100} cx="92" cy="92" r="7" />
        {T('M30 44 l12 12 22 -24')}
        {O('M104 34 q10 -6 8 -18', { strokeDasharray: '4 6', pathLength: undefined as never })}
    </svg>;
}

function SketchHome() {
    return <svg className="cr-art" viewBox="0 0 130 110">
        {I('M30 92 v-40 l16 -12 h38 l16 12 v40')}
        {I('M46 92 v-18 h14 v18')}
        {T('M74 66 h22 M74 78 h22')}
        {I('M20 100 h90', { className: 'cr-line ink soft' })}
        {O('M66 12 v10 M58 18 l8 -6 8 6', { strokeDasharray: '3 5', pathLength: undefined as never })}
    </svg>;
}

const SCENES = [
    { n: '1', t: 'Searching', d: 'A student picks the pieces her room is missing.', Art: SketchSearch },
    { n: '2', t: 'Moving out', d: 'Another lists a sofa instead of dumping it.', Art: SketchBoxes },
    { n: '3', t: 'Check & ride', d: 'We inspect and clean it, then the truck rolls.', Art: SketchTruck },
    { n: '4', t: 'Move-in day', d: 'The new room feels lived in by dinner.', Art: SketchHome },
];

export function StoryStrip() {
    return <section className="cr-strip">
        <p className="cr-eyebrow">One sofa, four little scenes</p>
        <div className="cr-grid">
            {SCENES.map(s => <div className="cr-card" key={s.n}>
                <s.Art />
                <p className="cr-card-t"><span className="cr-card-no">scene {s.n}</span>{s.t}</p>
                <p className="cr-card-d">{s.d}</p>
            </div>)}
        </div>
    </section>;
}

export function Boxy({ caption, mood }: { caption?: string; mood?: 'happy' | 'sad' }) {
    return <span className="cr-boxy" role="img" aria-label="Boxy, the DormDropp box character">
        <svg className="cr-boxy-art" viewBox="0 0 64 64">
            <g className="cr-boxy-wob">
                <path d="M10 25 L32 13 L54 25 V52 H10 Z" fill="#f2762e" stroke="#10233d" strokeWidth="3" strokeLinejoin="round" />
                <path d="M10 25 L54 25 M32 13 V25" stroke="#10233d" strokeWidth="3" fill="none" />
                <circle cx="24" cy="38" r="3.4" fill="#10233d" />
                <circle cx="40" cy="38" r="3.4" fill="#10233d" />
                {mood === 'sad'
                    ? <path d="M25 46 q7 -6 14 0" stroke="#10233d" strokeWidth="3" fill="none" strokeLinecap="round" />
                    : <path d="M25 44 q7 6 14 0" stroke="#10233d" strokeWidth="3" fill="none" strokeLinecap="round" />}
            </g>
        </svg>
        {caption && <span className="cr-boxy-cap">{caption}</span>}
    </span>;
}

export function Scribble({ color }: { color?: 'or' | 'tq' }) {
    return <svg className={'cr-scribble ' + (color || 'or')} viewBox="0 0 220 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 8 Q 55 2 110 7 T 216 5" fill="none" strokeWidth="3.5" strokeLinecap="round" />
    </svg>;
}
