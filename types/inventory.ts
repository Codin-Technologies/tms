export type LocationType = 'Warehouse' | 'Workshop' | 'Quarantine' | 'Yard';

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    region?: string;
    depot?: string;
    canStoreTires: boolean;
    canIssueTires: boolean;
    canInspectTires: boolean;
    canReceiveTransfers: boolean;
    status: 'active' | 'inactive';
}

export type DealerCategory = 'Tire Supplier' | 'Retreader' | 'Scrap / Disposal';

export interface Dealer {
    id: string;
    name: string;
    category: DealerCategory;
    contactPerson?: string;
    email?: string;
    phone?: string;
    status: 'active' | 'suspended';
    canReceiveNew: boolean;
    canReceiveUsed: boolean;
    canReturn: boolean;
    slaNotes?: string;
}

export type TransferType =
    | 'Internal Transfer'
    | 'Issue to Vehicle'
    | 'Send to Dealer'
    | 'Receive from Dealer'
    | 'Send for Retreading';

export interface StockTransfer {
    id: string;
    skuId: number;
    fromLocationId?: string;
    fromDealerId?: string;
    toLocationId?: string;
    toDealerId?: string;
    toVehicleId?: string;
    quantity: number;
    type: TransferType;
    reason?: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: Date;
    createdBy: string;
}
