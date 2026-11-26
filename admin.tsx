import React from 'react';
import { Link, useLocalState } from './ui';
import { DELIVERY_FEE, PAYOUT_PCT } from './data';
import { EMPTY_MARKET, Market, Order, STAGE_LABEL, money } from './market';
import { AppBar, Icon, SectionLabel } from './widgets';
import { Boxy } from './crayon';

/* Platform side of the demo: the quality check with its three outcomes
   and pickup/dropoff scheduling. Buyers and sellers only see the results
   as status updates on their own screens. */

function Queue({ title, hint, orders, children }: { title: string; hint?: string; orders: Order[]; children?: React.ReactNode }) {
    return <>
        <SectionLabel icon="shield">{title}{orders.length > 0 ? ' (' + orders.length + ')' : ''}</SectionLabel>
        {orders.length === 0 && <p className="app-para">{hint || 'Nothing waiting here.'}</p>}
        {children}
    </>;
}

export function AdminView() {
    const [market, setMarket] = useLocalState<Market>('dormdrop-market.v2', EMPTY_MARKET);
    const [prices, setPrices] = React.useState<Record<string, string>>({});

    const update = (order: Order, patch: Partial<Order>, note?: string) => {
        const updated: Order = { ...order, ...patch, events: note ? [...order.events, { step: 0, note }] : order.events };
        setMarket({ ...market, orders: market.orders.map(o => o.id === order.id ? updated : o) });
    };

    const quality = market.orders.filter(o => o.stage === 'quality');
    const logistics = market.orders.filter(o => o.stage === 'logistics');
    const transit = market.orders.filter(o => o.stage === 'transit');
    const watching = market.orders.filter(o => ['awaiting-seller', 'renegotiate', 'delivered'].includes(o.stage));
    const closed = market.orders.filter(o => ['complete', 'cancelled'].includes(o.stage));

    return <div className="mv">
        <AppBar back />
        <div className="mv-top"><p className="mv-top-title">DormDropp admin</p><span className="dd-pill wait" style={{ marginLeft: 'auto' }}>Demo</span></div>
        <p className="app-caption">The platform side: quality checks and logistics for every order. Buyers and sellers only see the outcomes as status updates.</p>
        <div className="cr-hero-row" style={{ marginTop: 2, marginBottom: 8 }}><Boxy caption="Admin hat on. Let us check some sofas." /></div>

        <Queue title="Quality check" hint="No orders waiting for a quality check." orders={quality}>
            <div style={{ display: 'grid', gap: 10 }}>
                {quality.map(o => <div className="dd-panel" key={o.id}>
                    <p className="dd-panel-title">{o.id} - {o.summary}</p>
                    <p className="dd-panel-text">{o.own === 'buyer' ? 'Seller: ' + o.seller : 'Buyer: ' + o.buyer}. Listing says {o.condition.toLowerCase()} condition. Compare photos and condition with the furniture, digitally first and in person at pickup.</p>
                    {o.qcOutcome !== 'mismatch' && <div className="dd-panel-row">
                        <button className="mv-cta" onClick={() => update(o, { stage: 'logistics', qcOutcome: 'pass' }, 'Quality check passed: furniture as submitted.')}><Icon name="shield" size={17} />As submitted</button>
                        <button className="mv-ghost" onClick={() => update(o, { qcOutcome: 'mismatch' })}><Icon name="refresh" size={16} />Not as submitted</button>
                        <button className="mv-ghost" onClick={() => update(o, { stage: 'cancelled', qcOutcome: 'fraud' }, 'The furniture did not match the listing at all. Order cancelled and the deposit returned to the buyer (demo).')}><Icon name="alert" size={16} />Fraud</button>
                    </div>}
                    {o.qcOutcome === 'mismatch' && <>
                        <p className="dd-panel-text">Propose a new price for the actual condition. Both sides are informed; the buyer decides.</p>
                        <div className="dd-price-input"><span>$</span><input type="number" min="1" step="1" value={prices[o.id] || ''} onChange={e => setPrices({ ...prices, [o.id]: e.target.value })} placeholder={String(Math.round(o.price * 0.8))} /></div>
                        <button className="mv-cta" disabled={!(Number(prices[o.id]) > 0)} onClick={() => update(o, { stage: 'renegotiate', newPrice: Number(prices[o.id]) }, 'Quality below the listing. A new price of ' + money(Number(prices[o.id])) + ' (was ' + money(o.price) + ') was proposed to the buyer.')}>Propose new price<Icon name="arrow" size={17} /></button>
                    </>}
                </div>)}
            </div>
        </Queue>

        <Queue title="Pickup and dropoff" hint="No orders waiting to be scheduled." orders={logistics}>
            <div style={{ display: 'grid', gap: 10 }}>
                {logistics.map(o => <div className="dd-panel" key={o.id}>
                    <p className="dd-panel-title">{o.id} - {o.summary}</p>
                    <p className="dd-panel-text">Collect from {o.pickupPlace} on {o.pickup}, store between semesters if needed, deliver to {o.dropoffPlace} on {o.dropoff}.</p>
                    <button className="mv-cta" onClick={() => update(o, { stage: 'transit' }, 'Pickup and delivery scheduled: ' + o.pickup + ' at ' + o.pickupPlace + ', delivery ' + o.dropoff + ' at ' + o.dropoffPlace + '.')}><Icon name="truck" size={17} />Schedule pickup and delivery</button>
                </div>)}
            </div>
        </Queue>

        <Queue title="On the way" hint="Nothing on the truck right now." orders={transit}>
            <div style={{ display: 'grid', gap: 10 }}>
                {transit.map(o => <div className="dd-panel" key={o.id}>
                    <p className="dd-panel-title">{o.id} - {o.summary}</p>
                    <p className="dd-panel-text">Delivery to {o.dropoffPlace} on {o.dropoff}. Mark delivered once the buyer has the furniture.</p>
                    <button className="mv-cta" onClick={() => update(o, { stage: 'delivered' }, 'Furniture delivered to ' + o.dropoffPlace + '. Waiting for the buyer to pay the balance.')}>Mark as delivered<Icon name="arrow" size={17} /></button>
                </div>)}
            </div>
        </Queue>

        <Queue title="Waiting on buyer or seller" hint="Nothing waiting on the other sides." orders={watching}>
            <div style={{ display: 'grid', gap: 10 }}>
                {watching.map(o => <div className="dd-ordercard" key={o.id} style={{ cursor: 'default' }}>
                    <span className="dd-ordercard-top"><span className="dd-ordercard-ref">{o.id}</span><span className="dd-pill wait">{STAGE_LABEL[o.stage]}</span></span>
                    <p className="dd-ordercard-summary">{o.summary} - {money(o.price)}</p>
                </div>)}
            </div>
        </Queue>

        {closed.length > 0 && <>
            <SectionLabel icon="check">Closed</SectionLabel>
            <div style={{ display: 'grid', gap: 10 }}>
                {closed.map(o => <div className="dd-ordercard" key={o.id} style={{ cursor: 'default' }}>
                    <span className="dd-ordercard-top"><span className="dd-ordercard-ref">{o.id}</span><span className={'dd-pill' + (o.stage === 'complete' ? ' done' : ' cancel')}>{STAGE_LABEL[o.stage]}</span></span>
                    <p className="dd-ordercard-summary">{o.summary} - {money(o.price)}</p>
                </div>)}
            </div>
        </>}

        <p className="mv-demo-line">Demo admin: same browser storage as the buyer and seller views. <Link to="/">Back to the app</Link>.</p>
    </div>;
}
