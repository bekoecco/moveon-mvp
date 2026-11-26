import React from 'react';
import { Link, useLocalState } from './ui';
import { DELIVERY_FEE, PAYOUT_PCT } from './data';
import { EMPTY_MARKET, Market, Order, OrderStage, STAGE_LABEL, money } from './market';
import { AppBar, Icon, SectionLabel } from './widgets';

/* The 13 steps of Bek's flow diagram, grouped by actor. */
const STEPS: { n: number; actor: 'buyer' | 'seller' | 'platform'; title: string }[] = [
    { n: 1, actor: 'buyer', title: 'Requests furniture - types, preferred colors, dropoff date and place' },
    { n: 2, actor: 'buyer', title: 'Accepts the estimated price' },
    { n: 3, actor: 'seller', title: 'Enters furniture to sell - details, pickup date and place, photos and condition' },
    { n: 4, actor: 'seller', title: 'Requests a pickup date' },
    { n: 5, actor: 'buyer', title: 'Accepts an offer and makes the deposit (picks one if several sellers offered)' },
    { n: 6, actor: 'seller', title: 'Confirms the order and pickup date' },
    { n: 7, actor: 'platform', title: 'Facilitates the furniture quality check with the seller, digital and non-digital' },
    { n: 8, actor: 'platform', title: 'Quality pass?' },
    { n: 9, actor: 'platform', title: 'Fraud: cancel the order and return the deposit' },
    { n: 10, actor: 'platform', title: 'Quality not as submitted: renegotiate the price, update the system, inform buyer and seller' },
    { n: 11, actor: 'platform', title: 'Quality as submitted: arrange pickup and dropoff' },
    { n: 12, actor: 'buyer', title: 'Receives the furniture and pays the platform' },
    { n: 13, actor: 'seller', title: 'Receives the payout' },
];

type StepState = 'done' | 'now' | 'todo' | 'skip';

function stepState(o: Order, n: number): StepState {
    if (n <= 5) return 'done';
    const s = o.stage;
    if (s === 'cancelled') {
        if (n === 6) return 'done';
        if (n === 7 || n === 8) return o.qcOutcome ? 'done' : 'todo';
        if (n === 9) return o.qcOutcome === 'fraud' ? 'done' : 'skip';
        if (n === 10) return o.renegotiated === 'declined' ? 'done' : 'skip';
        return 'skip';
    }
    if (n === 6) return s === 'awaiting-seller' ? 'now' : 'done';
    if (n === 7) return s === 'quality' ? 'now' : s === 'awaiting-seller' ? 'todo' : 'done';
    if (n === 8) return s === 'quality' ? 'now' : s === 'awaiting-seller' ? 'todo' : 'done';
    if (n === 9) return 'skip';
    if (n === 10) {
        if (s === 'renegotiate') return 'now';
        return o.renegotiated === 'accepted' ? 'done' : 'skip';
    }
    if (n === 11) {
        if (s === 'awaiting-seller' || s === 'quality' || s === 'renegotiate') return 'todo';
        if (s === 'logistics') return 'now';
        return 'done';
    }
    if (n === 12) {
        if (s === 'delivered') return 'now';
        if (s === 'complete') return 'done';
        return 'todo';
    }
    return s === 'complete' ? 'done' : 'todo';
}

const pillClass = (s: OrderStage) =>
    'dd-pill' + (s === 'complete' ? ' done' : s === 'cancelled' ? ' cancel' : ' wait');

export function OrdersHub() {
    const [market, ,] = useLocalState<Market>('dormdrop-market.v2', EMPTY_MARKET);
    const [, setCurrent] = useLocalState<string>('dormdrop-current-order', '');
    return <div className="mv">
        <AppBar back />
        <div className="mv-top"><p className="mv-top-title">My orders</p></div>
        {market.orders.length === 0 && <p className="app-para">No orders yet. Request furniture as a buyer or list furniture as a seller to start one.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
            {market.orders.map(o => <a key={o.id} className="dd-ordercard" href="#/order" onClick={() => setCurrent(o.id)}>
                <span className="dd-ordercard-top">
                    <span className="dd-ordercard-ref">{o.id}</span>
                    <span className={pillClass(o.stage)}>{STAGE_LABEL[o.stage]}</span>
                </span>
                <p className="dd-ordercard-summary">{o.summary} - {money(o.price)} - {o.own === 'buyer' ? 'buying from ' + o.seller : 'selling to ' + o.buyer}</p>
            </a>)}
        </div>
        <SectionLabel icon="tag">My listings</SectionLabel>
        {market.listings.length === 0 && <p className="app-para">No listings yet.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
            {market.listings.map(l => <div className="dd-listing" key={l.id}>
                <h3>{l.items}</h3>
                <p>{l.condition} condition - pickup {l.date}, {l.place} - asking {money(l.asking)}, estimated payout {money(l.payout)}</p>
            </div>)}
        </div>
        <div className="dd-grid2" style={{ marginTop: 16 }}>
            <Link className="mv-ghost" to="/buy" style={{ textDecoration: 'none' }}>Request furniture</Link>
            <Link className="mv-ghost" to="/sell" style={{ textDecoration: 'none' }}>Sell furniture</Link>
        </div>
    </div>;
}

export function OrderDetail() {
    const [market, setMarket] = useLocalState<Market>('dormdrop-market.v2', EMPTY_MARKET);
    const [current] = useLocalState<string>('dormdrop-current-order', '');
    const [newPrice, setNewPrice] = React.useState('');
    const order = market.orders.find(o => o.id === current) || market.orders[0];

    if (!order) {
        return <div className="mv"><AppBar back /><p className="app-para">No order selected. Open one from <Link to="/orders">My orders</Link>.</p></div>;
    }

    const update = (patch: Partial<Order>, event?: { step: number; note: string }) => {
        const updated: Order = { ...order, ...patch, events: event ? [...order.events, event] : order.events };
        setMarket({ ...market, orders: market.orders.map(o => o.id === order.id ? updated : o) });
        document.querySelector('.mv-appbar')?.scrollIntoView({ block: 'start' });
    };

    const remaining = order.price - order.deposit + DELIVERY_FEE + (order.addonsTotal || 0);
    const payout = Math.round(order.price * PAYOUT_PCT);

    return <div className="mv">
        <AppBar back />
        <div className="mv-top">
            <p className="mv-top-title">Order {order.id}</p>
            <span className={pillClass(order.stage)} style={{ marginLeft: 'auto' }}>{STAGE_LABEL[order.stage]}</span>
        </div>
        <p className="app-caption">{order.summary} - {money(order.price)} - {order.own === 'buyer' ? 'seller: ' + order.seller : 'buyer: ' + order.buyer}</p>

        {order.stage === 'cancelled' && <div className="dd-banner warn">
            Order cancelled{order.qcOutcome === 'fraud' ? ' for fraud: the furniture did not match the listing at all' : ''}. The {money(order.deposit)} deposit was returned to the buyer (demo).
        </div>}
        {order.stage === 'complete' && <div className="dd-banner">
            Delivered and paid. The seller received a payout of {money(payout)} ({Math.round(PAYOUT_PCT * 100)}% of {money(order.price)}). Demo only: no money moved.
        </div>}
        {order.stage === 'transit' && <div className="dd-banner">
            Pickup arranged for {order.pickup} at {order.pickupPlace}; dropoff {order.dropoff} at {order.dropoffPlace}.
        </div>}

        <SectionLabel icon="list">Flow progress</SectionLabel>
        <ol className="dd-timeline">
            {STEPS.map(s => {
                const st = stepState(order, s.n);
                const ev = order.events.filter(e => e.step === s.n);
                return <React.Fragment key={s.n}>
                    {(s.n === 1 || s.n === 5 || s.n === 12) && <li className="dd-tl-actor">Buyer</li>}
                    {(s.n === 3 || s.n === 6 || s.n === 13) && <li className="dd-tl-actor seller">Seller</li>}
                    {(s.n === 7) && <li className="dd-tl-actor platform">Platform</li>}
                    <li className={'dd-tl ' + (st === 'skip' ? 'skip' : st)}>
                        <span className="dd-tl-n">{st === 'done' ? <Icon name="check" size={14} /> : s.n}</span>
                        <span className="dd-tl-body">
                            <p className="dd-tl-title">{s.title}</p>
                            {ev.map((e, i) => <p className="dd-tl-detail" key={i}>{e.note}</p>)}
                            {st === 'now' && <p className="dd-tl-detail">In progress now.</p>}
                        </span>
                    </li>
                </React.Fragment>;
            })}
        </ol>

        {order.stage === 'awaiting-seller' && <div className="dd-panel">
            <p className="dd-panel-role">Seller action (demo)</p>
            <p className="dd-panel-title">Confirm the order and pickup date</p>
            <p className="dd-panel-text">{order.seller === 'You' ? 'A buyer accepted your offer.' : order.seller + ' reviews the order.'} Pickup: {order.pickup}, {order.pickupPlace}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'quality' }, { step: 6, note: (order.seller === 'You' ? 'You confirmed' : order.seller + ' confirmed') + ' the order and pickup on ' + order.pickup + ', ' + order.pickupPlace + '.' })}>Confirm order and pickup<Icon name="arrow" size={17} /></button>
        </div>}

        {order.stage === 'quality' && <div className="dd-panel">
            <p className="dd-panel-role">Platform action (demo)</p>
            <p className="dd-panel-title">Run the quality check</p>
            <p className="dd-panel-text">DormDrop compares the listing photos and condition with the furniture, digitally first and in person at pickup. Listing says: {order.condition.toLowerCase()} condition.</p>
            <div className="dd-panel-row">
                <button className="mv-cta" onClick={() => update({ stage: 'logistics', qcOutcome: 'pass' }, { step: 8, note: 'Quality check passed: furniture as submitted.' })}><Icon name="shield" size={17} />Quality as submitted</button>
                <button className="mv-ghost" onClick={() => update({ qcOutcome: 'mismatch' })}><Icon name="refresh" size={16} />Quality not as submitted</button>
                <button className="mv-ghost" onClick={() => update({ stage: 'cancelled', qcOutcome: 'fraud' }, { step: 9, note: 'Fraud found at the quality check. Order cancelled, deposit returned.' })}><Icon name="alert" size={16} />Fraud - cancel and return deposit</button>
            </div>
            {order.qcOutcome === 'mismatch' && <>
                <p className="dd-panel-text" style={{ marginTop: 12 }}>Propose a new price for the actual condition. The buyer decides whether to accept it.</p>
                <div className="dd-price-input"><span>$</span><input type="number" min="1" step="1" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder={String(Math.round(order.price * 0.8))} /></div>
                <button className="mv-cta" disabled={!(Number(newPrice) > 0)} onClick={() => update({ stage: 'renegotiate', newPrice: Number(newPrice) }, { step: 10, note: 'Quality below the listing. Platform proposed a new price of ' + money(Number(newPrice)) + ' (was ' + money(order.price) + ') and informed buyer and seller.' })}>Propose new price<Icon name="arrow" size={17} /></button>
            </>}
        </div>}

        {order.stage === 'renegotiate' && <div className="dd-panel">
            <p className="dd-panel-role">Buyer action (demo)</p>
            <p className="dd-panel-title">New price proposed</p>
            <p className="dd-panel-text">The quality check found the furniture below the listed condition. New price: {money(order.newPrice || order.price)} (was {money(order.price)}). The deposit stays the same.</p>
            <div className="dd-panel-row">
                <button className="mv-cta" onClick={() => update({ stage: 'logistics', price: order.newPrice, renegotiated: 'accepted' }, { step: 10, note: 'Buyer accepted the new price of ' + money(order.newPrice || order.price) + '.' })}>Accept new price<Icon name="arrow" size={17} /></button>
                <button className="mv-ghost" onClick={() => update({ stage: 'cancelled', renegotiated: 'declined' }, { step: 10, note: 'Buyer declined the new price. Order cancelled, deposit returned.' })}>Decline - cancel and return deposit</button>
            </div>
        </div>}

        {order.stage === 'logistics' && <div className="dd-panel">
            <p className="dd-panel-role">Platform action (demo)</p>
            <p className="dd-panel-title">Arrange pickup and dropoff</p>
            <p className="dd-panel-text">Collect from {order.pickupPlace} on {order.pickup}, store between semesters, deliver to {order.dropoffPlace} on {order.dropoff}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'transit' }, { step: 11, note: 'Pickup and dropoff arranged: ' + order.pickup + ' at ' + order.pickupPlace + ', delivery ' + order.dropoff + ' at ' + order.dropoffPlace + '.' })}><Icon name="truck" size={17} />Arrange pickup and dropoff</button>
        </div>}

        {order.stage === 'transit' && <div className="dd-panel">
            <p className="dd-panel-role">Platform action (demo)</p>
            <p className="dd-panel-title">Furniture on its way</p>
            <p className="dd-panel-text">The crew picks up, stores and delivers. Mark the order delivered when the buyer has the furniture.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'delivered' }, { step: 11, note: 'Furniture delivered to ' + order.dropoffPlace + '.' })}>Mark as delivered<Icon name="arrow" size={17} /></button>
        </div>}

        {order.stage === 'delivered' && <div className="dd-panel">
            <p className="dd-panel-role">Buyer action (demo)</p>
            <p className="dd-panel-title">Pay the platform</p>
            <p className="dd-panel-text">Furniture received. Remaining balance: {money(order.price - order.deposit)} plus {money(DELIVERY_FEE)} delivery{order.addonsTotal ? ' plus ' + money(order.addonsTotal) + ' add-ons (' + order.addons + ')' : ''} = {money(remaining)}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'complete' }, { step: 12, note: 'Buyer received the furniture and paid the platform ' + money(remaining) + ' (demo).' })}><Icon name="wallet" size={17} />Pay {money(remaining)} (demo)</button>
        </div>}

        <p className="mv-demo-line">Demo walkthrough: you play every role. Nothing is scheduled or charged.</p>
    </div>;
}
