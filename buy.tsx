import React from 'react';
import { Caption } from './ui';
import {
    ADDONS, CAMPUSES, COLORS, DELIVERY_FEE, DEMO_SELLERS, DEPOSIT_PCT,
    PIECES,
} from './data';
import { DatePicker, fmtDate } from './calendar';
import { EMPTY_MARKET, Market, Order, go, makeRef, money } from './market';
import {
    AppBar, CheckMark, Chips, CtaBar, EstimatePanel, Gradients, Icon, ScreenHead, SectionLabel, Stepper, Sub, scrollTop,
} from './widgets';
import { useLocalState } from './ui';

export type Offer = {
    id: string; seller: string; campus: string; price: number;
    condition: string; pickup: string; pickupPlace: string; summary: string;
};

const summarize = (items: Record<string, number>) =>
    PIECES.filter(p => items[p.id] > 0).map(p => p.name + (items[p.id] > 1 ? ' x' + items[p.id] : '')).join(', ');

const subtotalOf = (items: Record<string, number>) =>
    PIECES.reduce((sum, p) => sum + (items[p.id] || 0) * p.resale, 0);

function buildOffers(items: Record<string, number>, market: Market): Offer[] {
    const subtotal = subtotalOf(items);
    const summary = summarize(items);
    const offers: Offer[] = DEMO_SELLERS.map((s, i) => ({
        id: 'demo-' + i,
        seller: s.name,
        campus: s.campus,
        price: Math.max(10, Math.round(subtotal * s.factor)),
        condition: s.condition,
        pickup: 'Sat 20 Dec 2026',
        pickupPlace: s.campus,
        summary,
    }));
    market.listings.forEach(l => {
        offers.unshift({
            id: 'own-' + l.id,
            seller: 'Your listing',
            campus: l.place,
            price: l.asking,
            condition: l.condition,
            pickup: l.date,
            pickupPlace: l.place,
            summary: l.items,
        });
    });
    return offers;
}

export function BuyFlow() {
    const [market, setMarket] = useLocalState<Market>('dormdrop-market.v2', EMPTY_MARKET);
    const [, setCurrent] = useLocalState<string>('dormdrop-current-order', '');
    const [step, setStep] = React.useState(1);
    const [items, setItems] = React.useState<Record<string, number>>({});
    const [color, setColor] = React.useState('Any color');
    const [place, setPlace] = React.useState('');
    const [date, setDate] = React.useState('');
    const [addons, setAddons] = React.useState<Record<string, boolean>>({});
    const [offers, setOffers] = React.useState<Offer[]>([]);
    const [picked, setPicked] = React.useState<Offer | null>(null);
    const [done, setDone] = React.useState<Order | null>(null);

    const count = Object.values(items).reduce((a, b) => a + b, 0);
    const subtotal = subtotalOf(items);
    const addonList = ADDONS.filter(a => addons[a.id]);
    const addonsTotal = addonList.reduce((s, a) => s + a.price, 0);
    const estimate = subtotal + DELIVERY_FEE + addonsTotal;

    const next = (n: number) => { setStep(n); scrollTop(); };

    const placeDeposit = () => {
        if (!picked) return;
        const order: Order = {
            id: makeRef('DD'),
            buyer: 'You',
            seller: picked.seller,
            own: 'buyer',
            summary: picked.summary + (color !== 'Any color' ? ' (' + color.toLowerCase() + ' preferred)' : ''),
            price: picked.price,
            deposit: Math.max(5, Math.round(picked.price * DEPOSIT_PCT)),
            pickup: picked.pickup,
            pickupPlace: picked.pickupPlace,
            dropoff: fmtDate(date),
            dropoffPlace: place,
            condition: picked.condition,
            addons: addonList.length ? addonList.map(a => a.name).join(', ') : undefined,
            addonsTotal: addonsTotal || undefined,
            stage: 'awaiting-seller',
            events: [
                { step: 1, note: 'You requested furniture: ' + picked.summary + '.' },
                { step: 2, note: 'You accepted the estimated price.' },
                { step: 5, note: 'You accepted ' + picked.seller + "'s offer and made a " + money(Math.max(5, Math.round(picked.price * DEPOSIT_PCT))) + ' deposit (demo).' + (addonList.length ? ' Add-ons: ' + addonList.map(a => a.name).join(', ') + '.' : '') },
            ],
        };
        setMarket({ ...market, orders: [order, ...market.orders] });
        setCurrent(order.id);
        setDone(order);
        scrollTop();
    };

    if (done) {
        return <div className="mv">
            <AppBar back />
            <Gradients />
            <div className="mv-done">
                <CheckMark />
                <h1 className="mv-done-title">Deposit placed</h1>
                <span className="mv-done-ref">{done.id}</span>
                <p className="app-para">{done.seller} has your order. Next, the seller confirms the order and pickup date, then DormDropp runs the quality check.</p>
                <div className="mv-ticket">
                    <div className="mv-ticket-head">ORDER SUMMARY (DEMO)</div>
                    <div className="mv-ticket-body">
                        <div className="mv-summary" style={{ border: 0, padding: '6px 0' }}>
                            <div className="line"><span className="k">Items</span><span className="v">{done.summary}</span></div>
                            <div className="line"><span className="k">Offer price</span><span className="v">{money(done.price)}</span></div>
                            <div className="line"><span className="k">Deposit placed (demo)</span><span className="v">{money(done.deposit)}</span></div>
                            <div className="line"><span className="k">Pickup</span><span className="v">{done.pickup}, {done.pickupPlace}</span></div>
                            <div className="line"><span className="k">Dropoff</span><span className="v">{done.dropoff}, {done.dropoffPlace}</span></div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: 18 }}><button className="mv-cta" style={{ width: '100%' }} onClick={() => go('/order')}>Track this order<Icon name="arrow" size={17} /></button></div>
                <p className="mv-demo-line">Demo only: no payment was made and nothing was scheduled.</p>
            </div>
        </div>;
    }

    return <div className="mv">
        <AppBar back />
        {step === 1 && <>
            <ScreenHead title="What do you need?" step={1} total={4} />
            <Sub>Tell us what you need: item types, preferred colors, and where and when to deliver.</Sub>
            <SectionLabel icon="search">Items</SectionLabel>
            <div className="mv-items">
                {PIECES.map(p => <div className={'mv-item' + (items[p.id] > 0 ? ' on' : '')} key={p.id}>
                    <span className="mv-item-icon"><Icon name={p.icon} size={20} /></span>
                    <span className="mv-item-info">
                        <p className="mv-item-name">{p.name}</p>
                        <p className="mv-item-note">{p.note}</p>
                        <span className="mv-item-price">{money(p.resale)}<span className="retail">{money(p.retail)}</span></span>
                    </span>
                    <Stepper value={items[p.id] || 0} onChange={v => setItems({ ...items, [p.id]: v })} />
                </div>)}
            </div>
            <SectionLabel icon="tag">Preferred colors</SectionLabel>
            <Chips label="Preferred colors" options={COLORS} value={color} onChange={setColor} />
            <CtaBar total={money(estimate)} label="See my estimate" disabled={count === 0} onClick={() => next(2)} />
        </>}
        {step === 2 && <>
            <ScreenHead title="Dropoff and estimate" step={2} total={4} />
            <SectionLabel icon="pin">Dropoff campus</SectionLabel>
            <Chips label="Dropoff campus" options={CAMPUSES} value={place} onChange={setPlace} />
            <SectionLabel icon="calendar">Dropoff date</SectionLabel>
            <DatePicker label="Dropoff date" value={date} onChange={setDate} />
            <SectionLabel icon="box">Moving add-ons (optional)</SectionLabel>
            <div className="mv-services">
                {ADDONS.map(a => <button type="button" key={a.id} className={'mv-service' + (addons[a.id] ? ' on' : '')}
                    onClick={() => setAddons({ ...addons, [a.id]: !addons[a.id] })}>
                    <span className="mv-service-icon"><Icon name={a.icon} size={20} /></span>
                    <span>
                        <p className="mv-service-name">{a.name} - {money(a.price)}</p>
                        <p className="mv-service-detail">{a.detail}</p>
                    </span>
                    <span className="mv-service-check"><Icon name="check" size={13} /></span>
                </button>)}
            </div>
            <SectionLabel icon="wallet">Your estimate</SectionLabel>
            <EstimatePanel
                lines={[
                    { k: 'Furniture (' + count + ' item' + (count === 1 ? '' : 's') + ')', v: money(subtotal) },
                    ...(addonList.length ? [{ k: 'Add-ons', v: money(addonsTotal) }] : []),
                    { k: 'Delivery', v: money(DELIVERY_FEE) },
                ]}
                totalLabel="Estimated total" totalValue={money(estimate)}
                note="Rough estimate from sample resale prices. The final price is the seller offer you accept on the next screen." />
            <CtaBar total={money(estimate)} label="Accept estimated price" disabled={!place || !date} onClick={() => { setOffers(buildOffers(items, market)); next(3); }} onBack={() => next(1)} />
            <Caption>You accept the estimated price before offers are shown.</Caption>
        </>}
        {step === 3 && <>
            <ScreenHead title="Seller offers" step={3} total={4} />
            <Sub>When several sellers match, you pick one offer and hold it with a deposit.</Sub>
            <div className="dd-offers">
                {offers.map(o => <div className={'dd-offer' + (picked?.id === o.id ? ' sel' : '')} key={o.id}>
                    <div className="dd-offer-top">
                        <span className="dd-offer-avatar">{o.seller[0]}</span>
                        <span>
                            <p className="dd-offer-seller">{o.seller}</p>
                            <p className="dd-offer-meta">{o.campus} - {o.condition} condition - photos on file (demo)</p>
                        </span>
                        <span className="dd-offer-price">{money(o.price)}</span>
                    </div>
                    <p className="dd-offer-items">{o.summary}. Pickup {o.pickup}, {o.pickupPlace}.</p>
                    <button className="mv-cta" onClick={() => { setPicked(o); next(4); }}>Accept this offer<Icon name="arrow" size={17} /></button>
                </div>)}
            </div>
            <div className="mv-cta-bar"><button type="button" className="mv-cta-back" onClick={() => next(2)}>Back</button></div>
        </>}
        {step === 4 && picked && <>
            <ScreenHead title="Make the deposit" step={4} total={4} />
            <Sub>A deposit holds the offer while DormDropp checks the furniture. It is returned if the order is cancelled.</Sub>
            <EstimatePanel
                lines={[
                    { k: picked.seller + "'s offer", v: money(picked.price) },
                    ...(addonsTotal ? [{ k: 'Add-ons (paid on delivery)', v: money(addonsTotal) }] : []),
                    { k: 'Delivery (paid on delivery)', v: money(DELIVERY_FEE) },
                    { k: 'Deposit due now (20%)', v: money(Math.max(5, Math.round(picked.price * DEPOSIT_PCT))) },
                ]}
                totalLabel="Due on delivery" totalValue={money(picked.price - Math.max(5, Math.round(picked.price * DEPOSIT_PCT)) + DELIVERY_FEE + addonsTotal)}
                note="Demo payment: no card is charged. The deposit is returned if the quality check fails or the order is cancelled." />
            <CtaBar total={money(Math.max(5, Math.round(picked.price * DEPOSIT_PCT)))} totalLabel="Deposit (demo)" label="Pay deposit (demo)" disabled={false} onClick={placeDeposit} onBack={() => next(3)} />
        </>}
    </div>;
}
