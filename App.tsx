import React from 'react';
import { Closing, FileCard, Route, Routes } from './ui';
import { BuyFlow } from './buy';
import { SellFlow } from './sell';
import { OrderDetail, OrdersHub } from './orders';
import { HowItWorks, Start } from './home';
import { AdminView } from './admin';
import { RoomSets } from './roomsets';

export function App() {
    React.useEffect(() => { document.title = 'DormDropp - student furniture marketplace (early demo)'; }, []);
    return <FileCard>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/buy" element={<BuyFlow />} />
            <Route path="/sell" element={<SellFlow />} />
            <Route path="/orders" element={<OrdersHub />} />
            <Route path="/order" element={<OrderDetail />} />
            <Route path="/room-sets" element={<RoomSets />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/admin" element={<AdminView />} />
        </Routes>
        <Closing>Early demo, November 2026. Sample data throughout: no real pickups, deliveries, deposits, payouts or accounts. Everything is stored only in this browser.</Closing>
    </FileCard>;
}
