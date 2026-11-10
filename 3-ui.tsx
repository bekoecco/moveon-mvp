import React from 'react';

/* Small stand-ins for the UI pieces the prototype used. Hash routing so the app works on static hosting. */

const RouteCtx = React.createContext<string>('/');
const currentPath = () => (window.location.hash.replace(/^#/, '') || '/');

export function Router({ children }: { children: React.ReactNode }) {
    const [path, setPath] = React.useState(currentPath());
    React.useEffect(() => {
        const on = () => setPath(currentPath());
        window.addEventListener('hashchange', on);
        return () => window.removeEventListener('hashchange', on);
    }, []);
    return <RouteCtx.Provider value={path}>{children}</RouteCtx.Provider>;
}

export function Routes({ children }: { children: React.ReactNode }) {
    const path = React.useContext(RouteCtx);
    const list = React.Children.toArray(children) as React.ReactElement<{ path: string; element: React.ReactNode }>[];
    const hit = list.find(c => c.props.path === path) || list[0];
    return <>{hit.props.element}</>;
}
export function Route(_p: { path: string; element: React.ReactNode }) { return null; }

export function Link({ to, children, ...rest }: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a href={'#' + to} {...rest}>{children}</a>;
}

export function FileCard({ children }: { children: React.ReactNode }) { return <main className="app-card">{children}</main>; }
export function Closing({ children }: { children: React.ReactNode }) { return <footer className="app-closing">{children}</footer>; }
export function Caption({ children }: { children: React.ReactNode }) { return <p className="app-caption">{children}</p>; }
export function Paragraph({ children }: { children: React.ReactNode }) { return <p className="app-para">{children}</p>; }
export function Bullets({ items }: { items: string[] }) { return <ul className="app-bullets">{items.map(i => <li key={i}>{i}</li>)}</ul>; }
export function Facts({ items }: { items: { label: string; value: string }[] }) {
    return <dl className="app-facts">{items.map(i => <div key={i.label}><dt>{i.label}</dt><dd>{i.value}</dd></div>)}</dl>;
}
export function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    const id = React.useId();
    return <div className="app-field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} /></div>;
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void, { ready: boolean; message: string }] {
    const [val, setVal] = React.useState<T>(() => {
        try { const raw = window.localStorage.getItem(key); if (raw) return JSON.parse(raw) as T; } catch { /* ignore */ }
        return initial;
    });
    const set = (v: T) => { setVal(v); try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } };
    return [val, set, { ready: true, message: '' }];
}
