import React from 'react';
import { Link, useLocalState } from './ui';
import { EMPTY_MARKET, Market, Order, go, makeRef } from './market';

type SetListing = { title: string; contents: string; individual: number; price: number };
const sample: SetListing = { title: 'Complete student room', contents: 'Desk, desk chair, floor lamp, full bed frame, mattress, nightstand, dresser and bookshelf. Sample listing from one moving-out student.', individual: 325, price: 260 };
const dollars = (n: number) => '$' + n.toFixed(0);
export function RoomSets() {
 const [listing,setListing] = useLocalState<SetListing | null>('dormdrop-room-set.v1',null);
 const [tab,setTab] = React.useState<'buy'|'sell'>('buy');
 const [title,setTitle] = React.useState('My entire room set');
 const [contents,setContents] = React.useState('Desk, desk chair, floor lamp, full bed frame, mattress, nightstand, dresser and bookshelf');
 const [individual,setIndividual] = React.useState('325');
 const [price,setPrice] = React.useState('260');
 const [notice,setNotice] = React.useState(false);
 const [selected,setSelected] = React.useState<SetListing|null>(null);
 const [reserved,setReserved] = React.useState(false);
 const [market,setMarket] = useLocalState<Market>('dormdrop-market.v2',EMPTY_MARKET);
 const [,setCurrent] = useLocalState<string>('dormdrop-current-order','');
 const reserve = (s: SetListing) => {
  const order: Order = {
   id: makeRef('DD'), buyer: 'You', seller: 'Student seller', own: 'buyer',
   summary: 'Whole-room set: ' + s.title, price: s.price, deposit: Math.max(5, Math.round(s.price * 0.2)),
   pickup: 'Sat 20 Dec 2026', pickupPlace: 'Campus pickup point',
   dropoff: 'Mon 11 Jan 2027', dropoffPlace: 'Campus delivery point',
   condition: 'Good', stage: 'awaiting-seller',
   events: [
    { step: 1, note: 'You reserved the whole-room set "' + s.title + '": ' + s.contents },
    { step: 2, note: 'You accepted the set price of $' + s.price + ' (demo).' },
    { step: 5, note: 'Deposit of $' + Math.max(5, Math.round(s.price * 0.2)) + ' placed on the room-set offer (demo).' },
   ],
  };
  setMarket({ ...market, orders: [order, ...market.orders] });
  setCurrent(order.id);
  setReserved(true);
 };
 const valid = !!title.trim() && !!contents.trim() && Number(individual)>0 && Number(price)>0 && Number(price)<Number(individual) && Number.isFinite(Number(price)) && Number.isFinite(Number(individual));
 const save = () => {if(valid){setListing({title:title.trim(),contents:contents.trim(),individual:Number(individual),price:Number(price)});setNotice(true);setTab('buy');}};
 const choose = (s: SetListing) => {setSelected(s);setReserved(false);};
 return <div className="mv">
  <div className="mv-appbar"><Link to="/" className="mv-back" aria-label="Back to home">←</Link><p className="mv-appbar-name">Dorm<span className="mv-brand-cycle">Dropp</span></p><span className="mv-demo-pill">EARLY DEMO</span></div>
  <h1 className="room-heading">One room. One set. Less hassle.</h1>
  <p className="app-para">Moving out? Sell your room's furniture together at a discount. Moving in? Get a complete set from one student.</p>
  <p className="room-disclaimer">Demo only. Listings stay in this browser, are not shared with other students, and do not create a real pickup, sale or payment.</p>
  <div className="room-tabs"><button className={'mv-chip'+(tab==='buy'?' on':'')} onClick={()=>{setTab('buy');setSelected(null);}}>Buy a room set</button><button className={'mv-chip'+(tab==='sell'?' on':'')} onClick={()=>{setTab('sell');setSelected(null);}}>Sell my whole room</button></div>
  {tab==='sell' ? <section className="mv-model">
   <h2>List your whole room</h2><p className="app-caption">Add everything included and set one discounted price. Starting values are examples you can change.</p>
   <label className="room-field">Room set name<input maxLength={90} value={title} onChange={e=>setTitle(e.target.value)} /></label>
   <label className="room-field">What's included?<textarea maxLength={1000} rows={4} value={contents} onChange={e=>setContents(e.target.value)} /></label>
   <label className="room-field">Total if sold separately ($)<input type="number" min="1" step="1" value={individual} onChange={e=>setIndividual(e.target.value)} /></label>
   <label className="room-field">Discounted whole-room price ($)<input type="number" min="1" step="1" value={price} onChange={e=>setPrice(e.target.value)} /></label>
   {valid ? <p className="room-savings">Buyer saves {dollars(Number(individual)-Number(price))} ({Math.round((1-Number(price)/Number(individual))*100)}%) on the furniture.</p> : <p role="status">Enter a positive room-set price below the separate-item total.</p>}
   <p className="app-caption">Delivery is separate. The sample buying flow adds a $29 demo delivery fee. This listing price is not a seller-payout quote.</p>
   <button className="mv-cta" disabled={!valid} onClick={save}>Preview my demo listing</button>
  </section> : <>
   {notice && <p className="room-savings" role="status">Your demo room set is ready below. It is saved only in this browser.</p>}
   {selected ? <section className="mv-model">
    <h2>{reserved?'Demo reservation complete':'Review whole-room set'}</h2><h3>{selected.title}</h3><p>{selected.contents}</p>
    <dl className="app-facts"><div><dt>Room-set price</dt><dd>{dollars(selected.price)}</dd></div><div><dt>Demo delivery</dt><dd>$29</dd></div><div><dt>Total demo estimate</dt><dd>{dollars(selected.price+29)}</dd></div></dl>
    {reserved ? <><p role="status" className="room-savings">Demo reservation placed. It now shows in My orders like any other order, and you can walk it through the full flow there.</p><button className="mv-cta" onClick={()=>go('/order')}>Track this order</button></> : <><p className="app-caption">The entire set stays together. No pieces are removed or sold separately in this demo. All prices are sample estimates.</p><button className="mv-cta" onClick={()=>reserve(selected)}>Reserve full set, demo only</button></>}
    <button className="mv-ghost" onClick={()=>setSelected(null)}>Back to room sets</button>
   </section> : <div className="room-list">{[...(listing?[{...listing,own:true}]:[]),{...sample,own:false}].map((s,i)=><article className="mv-model" key={i}>
    <span className="room-eyebrow">{s.own?'YOUR LOCAL DEMO LISTING':'SAMPLE STUDENT LISTING'} · ENTIRE ROOM</span><h2>{s.title}</h2><p className="app-para">{s.contents}</p>
    <p className="room-price">{dollars(s.price)} <del>{dollars(s.individual)}</del></p><p className="room-savings">Save {dollars(s.individual-s.price)} ({Math.round((1-s.price/s.individual)*100)}%) vs. separate items</p><p className="app-caption">One set from one student. Demo delivery: +$29.</p>
    <button className="mv-cta" onClick={()=>choose(s)}>Buy the full room set</button>
    {s.own&&<button className="mv-ghost" onClick={()=>{setListing(null);setNotice(false);}}>Remove my demo listing</button>}
   </article>)}</div>}
  </>}
 </div>;
                        }
