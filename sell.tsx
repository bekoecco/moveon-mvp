import React from 'react';
import { Caption, useLocalState } from './ui';
import { CAMPUSES, CONDITIONS, PIECES, PAYOUT_PCT } from './data';
import { DatePicker, fmtDate } from './calendar';
import { EMPTY_MARKET, Listing, Market, Order, go, makeRef, money, readPhoto } from './market';
import {
    AppBar, CheckMark, Chips, CtaBar, EstimatePanel, Gradients, Icon, ScreenHead, SectionLabel, Stepper, Sub, scrollTop,
} from './widgets';

const summarize = (items: Record<string, number>) =>
    PIECES.filter(p => items[p.id] > 0).map(p => p.name + (items[p.id] > 1 ? ' x' + items[p.id] : '')).join(', ');

const subtotalOf = (items: Record<string, number>) =>
    PIECES.reduce((sum, p) => sum + (items[p.id] || 0) * p.resale, 0);

export function SellFlow() {
    const [market, setMarket] = useLocalState<Market>('dormdrop-market.v2', EMPTY_MARKET);
    const [, setCurrent] = useLocalState<string>('dormdrop-current-order', '');
    const [step, setStep] = React.useState(1);
    const [items, setItems] = React.useState<Record<string, number>>({});
    const [condition, setCondition] = React.useState('Good');
    const [photo, setPhoto] = React.useState('');
    const [place, setPlace] = React.useState('');
    const [date, setDate] = React.useState('');
    const [saved, setSaved] = React.useState<Listing | null>(null);

    const count = Object.values(items).reduce((a, b) => a + b, 0);
    const asking = subtotalOf(items);
    const payout = Math.round(asking * PAYOUT_PCT);

    const next = (n: number) => { setStep(n); scrollTop(); };

    const saveListing = () => {
        const listing: Listing = {
            id: makeRef('L'),
            items: summarize(items),
            condition,
            photo: photo || undefined,
            place,
            date: fmtDate(date),
            asking,
            payout,
        };
        setMarket({ ...market, listings: [listing, ...market.listings] });
        setSaved(listing);
        next(3);
    };

    const simulateOrder = () => {
        if (!saved) return;
        const order: Order = {
            id: makeRef('DD'),
            buyer: 'Maya R.',
            seller: 'You',
            own: 'seller',
            summary: saved.items,
            price: saved.asking,
            deposit: Math.max(5, Math.round(saved.asking * 0.2)),
            pickup: saved.date,
            pickupPlace: saved.place,
            dropoff: 'Tue 12 Jan 2027',
            dropoffPlace: 'UIC',
            condition: saved.condition,
            stage: 'awaiting-seller',
            events: [
                { step: 3, note: 'You listed furniture to sell: ' + saved.items + ' (' + saved.condition.toLowerCase() + ' condition).' },
                { step: 4, note: 'You requested pickup on ' + saved.date + ' at ' + saved.place + '.' },
                { step: 5, note: 'Maya R. accepted your offer and made a deposit of ' + money(Math.max(5, Math.round(saved.asking * 0.2))) + ' (demo).' },
            ],
        };
        setMarket({ ...market, orders: [order, ...market.orders] });
        setCurrent(order.id);
        go('/order');
    };

    return <div className="mv">
        <AppBar back />
        <Gradients />
        {step === 1 && <>
            <ScreenHead title="What are you selling?" step={1} total={3} />
            <Sub>Diagram step 3: enter furniture to sell - details, photos and condition.</Sub>
            <SectionLabel icon="tag">Items</SectionLabel>
            <div className="mv-items">
                {PIECES.map(p => <div className={'mv-item' + (items[p.id] > 0 ? ' on' : '')} key={p.id}>
                    <span className="mv-item-icon"><Icon name={p.icon} size={20} /></span>
                    <span className="mv-item-info">
                        <p className="mv-item-name">{p.name}</p>
                        <p className="mv-item-note">{p.note}</p>
                        <span className="mv-item-price">sells for about {money(p.resale)}</span>
                    </span>
                    <Stepper value={items[p.id] || 0} onChange={v => setItems({ ...items, [p.id]: v })} />
                </div>)}
            </div>
            <SectionLabel icon="check">Condition</SectionLabel>
            <Chips label="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
            <SectionLabel icon="camera">Photos</SectionLabel>
            <label className="dd-photo">
                <span className="dd-photo-thumb">{photo ? <img src={photo} alt="Uploaded furniture" /> : <Icon name="camera" size={24} />}</span>
                <span className="dd-photo-text">
                    <b>{photo ? 'Photo added' : 'Add a photo (optional)'}</b>
                    {photo ? 'Tap to replace it. The photo stays in this browser.' : 'Buyers and the quality check see this. It stays in this browser.'}
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files && e.target.files[0]; if (f) readPhoto(f, setPhoto); }} />
            </label>
            <CtaBar total={money(asking)} totalLabel="Sample resale value" label="Pickup details" disabled={count === 0} onClick={() => next(2)} />
        </>}
        {step === 2 && <>
            <ScreenHead title="Pickup date and place" step={2} total={3} />
            <Sub>Diagram step 4: request a pickup date. DormDrop collects during move-out week.</Sub>
            <SectionLabel icon="pin">Pickup campus</SectionLabel>
            <Chips label="Pickup campus" options={CAMPUSES} value={place} onChange={setPlace} />
            <SectionLabel icon="calendar">Pickup date</SectionLabel>
            <DatePicker label="Pickup date" value={date} onChange={setDate} />
            <SectionLabel icon="wallet">Your estimated payout</SectionLabel>
            <EstimatePanel
                lines={[
                    { k: 'Sample resale value (' + count + ' item' + (count === 1 ? '' : 's') + ')', v: money(asking) },
                    { k: 'DormDrop service share (10%)', v: '-' + money(asking - payout) },
                ]}
                totalLabel="Estimated payout" totalValue={money(payout)}
                note="You are paid after your furniture sells and the buyer pays the platform. Quality is checked at pickup: if it does not match the listing, the price can be renegotiated or the order cancelled." />
            <CtaBar total={money(payout)} totalLabel="Estimated payout" label="Request pickup date" disabled={!place || !date} onClick={saveListing} onBack={() => next(1)} />
            <Caption>Demo only: the listing is saved in this browser and shown as an offer in the buy flow.</Caption>
        </>}
        {step === 3 && saved && <>
            <div className="mv-done">
                <CheckMark />
                <h1 className="mv-done-title">Listing is live</h1>
                <span className="mv-done-ref">{saved.id}</span>
                <p className="app-para">{saved.items} - {saved.condition.toLowerCase()} condition, pickup {saved.date} at {saved.place}. Buyers can now see it as an offer (in this browser, demo only).</p>
                {saved.photo && <img src={saved.photo} alt="Listing" style={{ width: '100%', borderRadius: 16, margin: '6px 0 4px' }} />}
                <div className="dd-banner">When a buyer accepts your offer and makes a deposit, you confirm the order and pickup date. Then DormDrop checks the quality, delivers, and you receive the payout.</div>
                <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                    <button className="mv-cta" onClick={simulateOrder}>Simulate an incoming buyer order (demo)<Icon name="arrow" size={17} /></button>
                    <button className="mv-ghost" onClick={() => go('/orders')}>See my listings and orders</button>
                </div>
            </div>
        </>}
    </div>;
}
