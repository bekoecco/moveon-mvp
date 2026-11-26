/* Demo data. Every piece, price, seller and date on this page is invented */
/* for the demo. Fee and split figures are rough estimates, not quotes.    */

export type Piece = { id: string; name: string; note: string; resale: number; retail: number; icon: string };

export const PIECES: Piece[] = [
    { id: 'desk', name: 'Study desk', note: 'Standard four-leg desk', resale: 45, retail: 120, icon: 'desk' },
    { id: 'chair', name: 'Desk chair', note: 'Adjustable, on casters', resale: 35, retail: 90, icon: 'chair' },
    { id: 'bed-frame', name: 'Bed frame, full', note: 'Frame and slats', resale: 55, retail: 150, icon: 'bed' },
    { id: 'mattress', name: 'Mattress, full', note: 'Clean, no stains', resale: 95, retail: 250, icon: 'mattress' },
    { id: 'lamp', name: 'Floor lamp', note: 'Bulb included', resale: 15, retail: 40, icon: 'lamp' },
    { id: 'dresser', name: 'Dresser', note: 'Three drawers', resale: 40, retail: 110, icon: 'dresser' },
    { id: 'bookshelf', name: 'Bookshelf', note: 'Three shelves', resale: 25, retail: 60, icon: 'shelf' },
    { id: 'nightstand', name: 'Nightstand', note: 'One drawer', resale: 12, retail: 35, icon: 'nightstand' },
    { id: 'sofa', name: 'Two-seat sofa', note: 'Fabric, good condition', resale: 110, retail: 300, icon: 'sofa' },
    { id: 'mini-fridge', name: 'Mini fridge', note: 'Clean and working', resale: 50, retail: 130, icon: 'fridge' },
];

export const PIECE_BY_ID: Record<string, Piece> = {};
PIECES.forEach(p => { PIECE_BY_ID[p.id] = p; });

export type Addon = { id: string; name: string; detail: string; price: number; icon: string };

export const ADDONS: Addon[] = [
    { id: 'packing', name: 'Packing help', detail: 'A pair of hands packs your stuff into boxes', price: 49, icon: 'box' },
    { id: 'box-kit', name: 'Box kit', detail: '10 boxes, tape and labels dropped off ahead of pickup', price: 24, icon: 'boxes' },
    { id: 'on-loading', name: 'On-loading', detail: 'We load your car, van or storage unit', price: 29, icon: 'load' },
    { id: 'off-loading', name: 'Off-loading', detail: 'We unload and carry everything in at the new place', price: 29, icon: 'unload' },
    { id: 'short-move', name: 'Short move', detail: 'Across campus or across town, door to door', price: 59, icon: 'route' },
    { id: 'full-move', name: 'Full move', detail: 'Load, drive and unload, the whole trip handled', price: 99, icon: 'truck' },
];

export const CAMPUSES = ['UIC', 'Illinois Tech', 'Northwestern', 'UChicago'];
export const PICKUP_DATES = ['Fri 18 Dec 2026', 'Sat 19 Dec 2026', 'Sun 20 Dec 2026'];
export const DROPOFF_DATES = ['Mon 11 Jan 2027', 'Tue 12 Jan 2027', 'Wed 13 Jan 2027'];
export const COLORS = ['Any color', 'Natural wood', 'White', 'Black', 'Gray'];
export const CONDITIONS = ['Like new', 'Good', 'Fair'];
export const DELIVERY_FEE = 29;
export const DEPOSIT_PCT = 0.2;
export const PAYOUT_PCT = 0.9;

export type DemoSeller = { name: string; campus: string; factor: number; condition: string };
export const DEMO_SELLERS: DemoSeller[] = [
    { name: 'Maya R.', campus: 'UIC', factor: 0.95, condition: 'Good' },
    { name: 'Danny K.', campus: 'Northwestern', factor: 1.0, condition: 'Like new' },
    { name: 'Priya S.', campus: 'Illinois Tech', factor: 1.08, condition: 'Good' },
];
