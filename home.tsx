import React from 'react';
import { FEEDBACK_URL } from './config';
import { Caption, Link } from './ui';
import { ADDONS } from './data';
import { money } from './market';
import { AppBar, Icon, SectionLabel } from './widgets';
import { Boxy, CrayonDefs, Scribble, StoryStrip } from './crayon';
import logoMark from './mark.webp';

export function FeedbackCard() {
    return <div className="mv-feedback">
        <p className="mv-feedback-title">Tell us what you think</p>
        <p className="mv-feedback-text">Two minutes, honest answers. This demo exists to learn what students would actually use.</p>
        <a className="mv-feedback-btn" href={FEEDBACK_URL} target="_blank" rel="noreferrer">Give feedback</a>
    </div>;
}

export function Start() {
    return <div className="mv">
        <AppBar />
        <CrayonDefs />
        <section className="dd-hero">
            <img className="dd-hero-mark" src={logoMark} alt="DormDropp logo: a house dropping into a box" />
            <p className="dd-eyebrow">Student furniture marketplace</p>
            <h1 className="dd-title">Move out lighter.<br />Move in furnished.</h1>
            <Scribble />
            <p className="dd-lede">Request the furniture you need or list what you are leaving behind. DormDropp checks the quality, then handles pickup, delivery and the payout.</p>
            <div className="dd-actions">
                <Link className="dd-btn dd-btn-primary" to="/buy">
                    <span><b>I need furniture</b><small>Request pieces, pick an offer</small></span>
                    <Icon name="arrow" size={18} />
                </Link>
                <Link className="dd-btn dd-btn-ghost" to="/sell">
                    <span><b>I am selling furniture</b><small>List pieces, get a payout</small></span>
                    <Icon name="arrow" size={18} />
                </Link>
            </div>
            <p className="dd-check"><span aria-hidden="true">✓</span> Every piece is cleaned, inspected and quality-checked before delivery.</p>
            <div className="cr-hero-row"><Boxy caption="Hi, I'm Boxy. I follow every sofa to its new room." /></div>
        </section>
        <Link className="room-feature" to="/room-sets">
            <span className="room-eyebrow">NEW · BULK ROOM SETS</span>
            <h2>Your whole room, one better price.</h2>
            <p>Sell your furniture as one discounted set, or buy a full room from a moving-out student.</p>
            <span className="room-feature-action">Explore room sets →</span>
        </Link>
        <StoryStrip />
        <SectionLabel icon="spark">How a trade goes</SectionLabel>
        <ol className="mv-steps">
            <li className="mv-step"><span className="mv-step-n">1</span><p>You request furniture and get an instant estimate. Sellers list pieces with photos and condition.</p></li>
            <li className="mv-step"><span className="mv-step-n">2</span><p>You pick one seller offer and make a deposit. The seller confirms the order and pickup date.</p></li>
            <li className="mv-step"><span className="mv-step-n">3</span><p>DormDropp checks the quality. If it does not match the listing, the price is renegotiated or the deposit comes back.</p></li>
            <li className="mv-step"><span className="mv-step-n">4</span><p>We pick up, store and deliver. You pay on delivery, and the seller receives the payout.</p></li>
        </ol>
        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <Link className="mv-linkcard" to="/orders">
                <span className="mv-label-icon"><Icon name="list" size={15} /></span>
                <span>
                    <span className="t">My orders</span>
                    <span className="d" style={{ display: 'block' }}>See where each order stands and what happens next.</span>
                </span>
                <span className="arr"><Icon name="arrow" size={16} /></span>
            </Link>
            <Link className="mv-linkcard" to="/how-it-works">
                <span className="mv-label-icon"><Icon name="wallet" size={15} /></span>
                <span>
                    <span className="t">How it works</span>
                    <span className="d" style={{ display: 'block' }}>Buyer, seller and platform steps, and what is demo here.</span>
                </span>
                <span className="arr"><Icon name="arrow" size={16} /></span>
            </Link>
        </div>
        <SectionLabel icon="spark">Add-ons: more than furniture</SectionLabel>
        <div className="mv-addons">
            {ADDONS.map(a => <div className="mv-addon" key={a.id}>
                <span className="mv-addon-icon"><Icon name={a.icon} size={20} /></span>
                <p className="mv-addon-name">{a.name}</p>
                <p className="mv-addon-detail">{a.detail}</p>
                <span className="mv-addon-price">from {money(a.price)}</span>
            </div>)}
        </div>
        <Caption>Full-service mover extras, sized for a student budget. Demo prices, like everything here.</Caption>
        <p className="mv-demo-line">Early demo with sample data: nothing is scheduled, charged or sent.</p>
        <FeedbackCard />
    </div>;
}

export function HowItWorks() {
    return <div className="mv">
        <AppBar back />
        <div className="mv-top"><p className="mv-top-title">How it works</p></div>
        <p className="app-para">DormDropp is a managed marketplace: buyers and sellers never handle logistics or money directly. The platform sits in the middle, checks quality and moves both the furniture and the payment.</p>
        <div className="mv-models">
            <div className="mv-model">
                <div className="mv-model-top"><span className="mv-model-n"><Icon name="search" size={14} /></span><p className="mv-model-name">Buyer</p></div>
                <dl>
                    <div><dt>Request</dt><dd>Tell us what pieces you need, your colors, and when and where to deliver. You see the estimated price right away.</dd></div>
                    <div><dt>Offer & deposit</dt><dd>Pick one seller offer and hold it with a deposit.</dd></div>
                    <div><dt>Delivery</dt><dd>Receive the furniture and pay the remaining balance.</dd></div>
                </dl>
            </div>
            <div className="mv-model">
                <div className="mv-model-top"><span className="mv-model-n"><Icon name="tag" size={14} /></span><p className="mv-model-name">Seller</p></div>
                <dl>
                    <div><dt>List</dt><dd>Add your furniture: details, photos, condition, and a pickup date and place.</dd></div>
                    <div><dt>Confirm</dt><dd>Confirm the order and pickup once a buyer commits.</dd></div>
                    <div><dt>Payout</dt><dd>Get paid once the furniture is delivered.</dd></div>
                </dl>
            </div>
            <div className="mv-model">
                <div className="mv-model-top"><span className="mv-model-n"><Icon name="shield" size={14} /></span><p className="mv-model-name">Platform</p></div>
                <dl>
                    <div><dt>Quality check</dt><dd>Every piece is compared with its listing, digitally and in person.</dd></div>
                    <div><dt>If something is off</dt><dd>Below the listed condition, the buyer gets a lower price to consider. Not the real thing, the order is cancelled and the deposit returned.</dd></div>
                    <div><dt>Moving</dt><dd>We pick up, store between semesters if needed, and deliver.</dd></div>
                </dl>
            </div>
        </div>
        <div className="mv-note-inline" style={{ marginTop: 16 }}>
            <span className="mv-label-icon"><Icon name="shield" size={15} /></span>
            <p>The quality check protects both sides: buyers never pay full price for mislisted furniture, and honest sellers get a guaranteed payout once their pieces pass.</p>
        </div>
        <p className="mv-demo-line">This page describes the demo. No real pickups, deliveries, deposits or payouts.</p>
        <FeedbackCard />
    </div>;
}
