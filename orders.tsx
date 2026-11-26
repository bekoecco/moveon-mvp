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
    const order = market.orders.find(o => o.id === current) || market.orders[0];

    const remaining = order ? order.price - order.deposit + DELIVERY_FEE + (order.addonsTotal || 0) : 0;
    const payout = order ? Math.round(order.price * PAYOUT_PCT) : 0;

    const update = (patch: Partial<Order>, event?: { step: number; note: string }) => {
        if (!order) return;
        const updated: Order = { ...order, ...patch, events: event ? [...order.events, event] : order.events };
        setMarket({ ...market, orders: market.orders.map(o => o.id === order.id ? updated : o) });
        document.querySelector('.mv-appbar')?.scrollIntoView({ block: 'start' });
    };

    /* Demo only: the other side of the trade is simulated, so a waiting order
       advances on its own after a short beat. Platform steps never advance here;
       they happen in the admin view. */
    const stageKey = order ? order.id + order.stage : '';
    React.useEffect(() => {
        if (!order) return;
        let t: ReturnType<typeof setTimeout> | undefined;
        if (order.own === 'buyer' && order.stage === 'awaiting-seller') {
            t = setTimeout(() => update({ stage: 'quality' }, { step: 6, note: order.seller + ' confirmed the order and pickup on ' + order.pickup + ', ' + order.pickupPlace + '.' }), 2800);
        } else if (order.own === 'seller' && order.stage === 'renegotiate') {
            t = setTimeout(() => update({ stage: 'logistics', price: order.newPrice, renegotiated: 'accepted' }, { step: 10, note: 'The buyer accepted the new price of ' + money(order.newPrice || order.price) + '.' }), 3200);
        } else if (order.own === 'seller' && order.stage === 'delivered') {
            t = setTimeout(() => update({ stage: 'complete' }, { step: 12, note: 'The buyer received the furniture and paid the remaining ' + money(remaining) + ' (demo).' }), 3200);
        }
        return () => { if (t) clearTimeout(t); };
    }, [stageKey]);

    if (!order) {
        return <div className="mv"><AppBar back /><p className="app-para">No order selected. Open one from <Link to="/orders">My orders</Link>.</p></div>;
    }

    const withPlatform =
        order.stage === 'quality' ? 'DormDropp is running the quality check on this furniture. You will see the outcome here.' :
        order.stage === 'logistics' ? 'Quality check passed. DormDropp is scheduling the pickup and delivery.' :
        order.stage === 'transit' ? 'Your furniture is on the truck.' : '';

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
            Order cancelled{order.qcOutcome === 'fraud' ? ': the furniture did not match the listing at all' : ''}. The {money(order.deposit)} deposit was returned to the buyer (demo).
        </div>}
        {order.stage === 'complete' && <div className="dd-banner">
            Delivered and paid. The seller received a payout of {money(payout)} ({Math.round(PAYOUT_PCT * 100)}% of {money(order.price)}). Demo only: no money moved.
        </div>}
        {order.stage === 'awaiting-seller' && order.own === 'buyer' && <div className="dd-banner">
            Waiting for {order.seller} to confirm the order and the pickup on {order.pickup}, {order.pickupPlace}. (Demo: the seller confirms on their own in a moment.)
        </div>}
        {order.stage === 'renegotiate' && order.own === 'seller' && <div className="dd-banner">
            The quality check found the furniture below the listed condition, so DormDropp proposed a new price of {money(order.newPrice || order.price)}. Waiting for the buyer to decide. (Demo: the buyer decides on their own in a moment.)
        </div>}
        {order.stage === 'delivered' && order.own === 'seller' && <div className="dd-banner">
            Furniture delivered to {order.dropoffPlace}. Once the buyer pays the balance, your payout of {money(payout)} is released (demo).
        </div>}

        <SectionLabel icon="list">Activity</SectionLabel>
        <ol className="dd-activity">
            {[...order.events].reverse().slice(0, 6).map((e, i) => <li key={i} className="dd-activity-item">
                <span className="dd-activity-dot" aria-hidden="true" />
                <p>{e.note}</p>
            </li>)}
        </ol>

        {order.stage === 'awaiting-seller' && order.own === 'seller' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Confirm the order and pickup date</p>
            <p className="dd-panel-text">{order.buyer} accepted your offer and paid the deposit. Pickup: {order.pickup}, {order.pickupPlace}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'quality' }, { step: 6, note: 'You confirmed the order and pickup on ' + order.pickup + ', ' + order.pickupPlace + '.' })}>Confirm order and pickup<Icon name="arrow" size={17} /></button>
        </div>}

        {order.stage === 'renegotiate' && order.own === 'buyer' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">New price proposed</p>
            <p className="dd-panel-text">The quality check found the furniture below the listed condition. New price: {money(order.newPrice || order.price)} (was {money(order.price)}). The deposit stays the same.</p>
            <div className="dd-panel-row">
                <button className="mv-cta" onClick={() => update({ stage: 'logistics', price: order.newPrice, renegotiated: 'accepted' }, { step: 10, note: 'You accepted the new price of ' + money(order.newPrice || order.price) + '.' })}>Accept new price<Icon name="arrow" size={17} /></button>
                <button className="mv-ghost" onClick={() => update({ stage: 'cancelled', renegotiated: 'declined' }, { step: 10, note: 'You declined the new price. Order cancelled and the deposit returned (demo).' })}>Decline - cancel and return deposit</button>
            </div>
        </div>}

        {order.stage === 'delivered' && order.own === 'buyer' && <div className="dd-panel">
            <p className="dd-panel-role">Next step</p>
            <p className="dd-panel-title">Pay the remaining balance</p>
            <p className="dd-panel-text">Furniture received. Remaining balance: {money(order.price - order.deposit)} plus {money(DELIVERY_FEE)} delivery{order.addonsTotal ? ' plus ' + money(order.addonsTotal) + ' add-ons (' + order.addons + ')' : ''} = {money(remaining)}.</p>
            <button className="mv-cta" onClick={() => update({ stage: 'complete' }, { step: 12, note: 'You received the furniture and paid the remaining ' + money(remaining) + ' (demo).' })}><Icon name="wallet" size={17} />Pay {money(remaining)} (demo)</button>
        </div>}

        {withPlatform && <div className="dd-panel">
            <p className="dd-panel-role">With DormDropp</p>
            <p className="dd-panel-title">{order.stage === 'transit' ? 'On the truck' : 'With the DormDropp team'}</p>
            <p className="dd-panel-text">{withPlatform}</p>
            <p className="dd-panel-text" style={{ fontSize: 12 }}>Demo shortcut: run the platform side in the <Link to="/admin">admin view</Link>.</p>
        </div>}

        <p className="mv-demo-line">Demo walkthrough: the other side of the trade is simulated. Nothing is scheduled or charged.</p>
    </div>;
}
