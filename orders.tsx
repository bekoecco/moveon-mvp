import React from 'react';
import { Link, useLocalState } from './ui';
import { DELIVERY_FEE, PAYOUT_PCT } from './data';
import { EMPTY_MARKET, Market, Order, OrderStage, STAGE_LABEL, money } from './market';
import { AppBar, Icon, SectionLabel } from './widgets';
import { Boxy } from './crayon';

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
        <div className="cr-hero-row" style={{ marginTop: 4, marginBottom: 6 }}><Boxy mood={order.stage === 'cancelled' ? 'sad' : 'happy'} caption={
            order.stage === 'complete' ? 'Delivered. New room, happy sofa.' :
            order.stage === 'cancelled' ? 'This one fell through. The deposit went back.' :
            order.stage === 'transit' ? 'On the truck. I am riding along.' :
            'I will keep you posted as things move.'} /></div>

        {order.stage === 'cancelled' && <div className="dd-banner warn">
            Order cancelled{order.qcOutcome === 'fraud' ? ' for fraud: the furniture did not match the listing at all' : ''}. The {money(order.deposit)} deposit was returned to the buyer (demo).
        </div>}
        {order.stage === 'complete' && <div className="dd-banner">
            Delivered and paid. The seller received a payout of {money(payout)} ({Math.round(PAYOUT_PCT * 100)}% of {money(order.price)}). Demo only: no money moved.
        </div>}
        {order.stage === 'transit' && <div className="dd-banner">
            Pickup arranged for {order.pickup} at {order.pickupPlace}; dropoff {order.dropoff} at {order.dropoffPlace}.
        </div>}

        <SectionLabel icon="list">Activity</SectionLabel>
        <ol className="dd-activity">
            {[...order.events].reverse().slice(0, 6).map((e, i) => <li key={i} className="dd-activity-item">
                <span className="dd-activity-dot" aria-hidden="true" />
                <p>{e.note}</p>
            </li>)}
        </ol>

        {order.stage === 'awaiting-seller' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Confirm the order and pickup date</p>
            <p className="dd-panel-text">{order.seller === 'You' ? 'A buyer accepted your offer.' : order.seller + ' reviews the order.'} Pickup: {order.pickup}, {order.pickupPlace}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'quality' }, { step: 6, note: (order.seller === 'You' ? 'You confirmed' : order.seller + ' confirmed') + ' the order and pickup on ' + order.pickup + ', ' + order.pickupPlace + '.' })}>Confirm order and pickup<Icon name="arrow" size={17} /></button>
        </div>}

        {order.stage === 'quality' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Run the quality check</p>
            <p className="dd-panel-text">DormDropp compares the listing photos and condition with the furniture, digitally first and in person at pickup. Listing says: {order.condition.toLowerCase()} condition.</p>
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
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">New price proposed</p>
            <p className="dd-panel-text">The quality check found the furniture below the listed condition. New price: {money(order.newPrice || order.price)} (was {money(order.price)}). The deposit stays the same.</p>
            <div className="dd-panel-row">
                <button className="mv-cta" onClick={() => update({ stage: 'logistics', price: order.newPrice, renegotiated: 'accepted' }, { step: 10, note: 'Buyer accepted the new price of ' + money(order.newPrice || order.price) + '.' })}>Accept new price<Icon name="arrow" size={17} /></button>
                <button className="mv-ghost" onClick={() => update({ stage: 'cancelled', renegotiated: 'declined' }, { step: 10, note: 'Buyer declined the new price. Order cancelled, deposit returned.' })}>Decline - cancel and return deposit</button>
            </div>
        </div>}

        {order.stage === 'logistics' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Arrange pickup and dropoff</p>
            <p className="dd-panel-text">Collect from {order.pickupPlace} on {order.pickup}, store between semesters, deliver to {order.dropoffPlace} on {order.dropoff}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'transit' }, { step: 11, note: 'Pickup and dropoff arranged: ' + order.pickup + ' at ' + order.pickupPlace + ', delivery ' + order.dropoff + ' at ' + order.dropoffPlace + '.' })}><Icon name="truck" size={17} />Arrange pickup and dropoff</button>
        </div>}

        {order.stage === 'transit' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Furniture on its way</p>
            <p className="dd-panel-text">The crew picks up, stores and delivers. Mark the order delivered when the buyer has the furniture.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'delivered' }, { step: 11, note: 'Furniture delivered to ' + order.dropoffPlace + '.' })}>Mark as delivered<Icon name="arrow" size={17} /></button>
        </div>}

        {order.stage === 'delivered' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Pay the platform</p>
            <p className="dd-panel-text">Furniture received. Remaining balance: {money(order.price - order.deposit)} plus {money(DELIVERY_FEE)} delivery{order.addonsTotal ? ' plus ' + money(order.addonsTotal) + ' add-ons (' + order.addons + ')' : ''} = {money(remaining)}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'complete' }, { step: 12, note: 'Buyer received the furniture and paid the platform ' + money(remaining) + ' (demo).' })}><Icon name="wallet" size={17} />Pay {money(remaining)} (demo)</button>
        </div>}

        <p className="mv-demo-line">Demo walkthrough: you play every role. Nothing is scheduled or charged.</p>
    </div>;
}
