/* Shared demo store: listings and orders live in this browser only. */

export type OrderStage =
    | 'awaiting-seller' | 'quality' | 'renegotiate' | 'logistics'
    | 'transit' | 'delivered' | 'complete' | 'cancelled';

export type OrderEvent = { step: number; note: string };

export type Order = {
    id: string;
    buyer: string;
    seller: string;
    own: 'buyer' | 'seller';
    summary: string;
    price: number;
    deposit: number;
    pickup: string;
    pickupPlace: string;
    dropoff: string;
    dropoffPlace: string;
    condition: string;
    addons?: string;
    addonsTotal?: number;
    stage: OrderStage;
    qcOutcome?: 'pass' | 'mismatch' | 'fraud';
    newPrice?: number;
    renegotiated?: 'accepted' | 'declined';
    events: OrderEvent[];
};

export type Listing = {
    id: string;
    items: string;
    condition: string;
    photo?: string;
    place: string;
    date: string;
    asking: number;
    payout: number;
};

export type Market = { orders: Order[]; listings: Listing[] };

export const EMPTY_MARKET: Market = { orders: [], listings: [] };

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
export const makeRef = (prefix: string) => prefix + '-' + Math.floor(1000 + Math.random() * 9000);

export const STAGE_LABEL: Record<OrderStage, string> = {
    'awaiting-seller': 'Seller confirming',
    'quality': 'Quality check',
    'renegotiate': 'Price review',
    'logistics': 'Scheduling',
    'transit': 'On the way',
    'delivered': 'Delivered - pay balance',
    'complete': 'Complete',
    'cancelled': 'Cancelled',
};

export const go = (path: string) => { window.location.hash = '#' + path; };

export function readPhoto(file: File, cb: (dataUrl: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, 360 / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.width * scale));
            c.height = Math.max(1, Math.round(img.height * scale));
            c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
            cb(c.toDataURL('image/jpeg', 0.7));
        };
        img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
}
