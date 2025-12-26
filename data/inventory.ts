import { Location, Dealer, StockTransfer } from "@/types/inventory";

export const mockLocations: Location[] = [
    {
        id: 'LOC-001',
        name: 'Main Depot',
        type: 'Warehouse',
        region: 'Central',
        depot: 'Depot A',
        canStoreTires: true,
        canIssueTires: true,
        canInspectTires: true,
        canReceiveTransfers: true,
        status: 'active'
    },
    {
        id: 'LOC-002',
        name: 'Dar Depot',
        type: 'Warehouse',
        region: 'East',
        depot: 'Depot B',
        canStoreTires: true,
        canIssueTires: true,
        canInspectTires: true,
        canReceiveTransfers: true,
        status: 'active'
    },
    {
        id: 'LOC-003',
        name: 'Workshop North',
        type: 'Workshop',
        region: 'North',
        depot: 'Depot C',
        canStoreTires: false,
        canIssueTires: true,
        canInspectTires: true,
        canReceiveTransfers: true,
        status: 'active'
    },
    {
        id: 'LOC-004',
        name: 'Quarantine Yard',
        type: 'Quarantine',
        region: 'Central',
        depot: 'Depot A',
        canStoreTires: true,
        canIssueTires: false,
        canInspectTires: true,
        canReceiveTransfers: true,
        status: 'active'
    }
];

export const mockDealers: Dealer[] = [
    {
        id: 'DLR-001',
        name: 'SuperTire Solutions',
        category: 'Tire Supplier',
        contactPerson: 'John Smith',
        email: 'contact@supertire.com',
        phone: '+255 788 000 111',
        status: 'active',
        canReceiveNew: true,
        canReceiveUsed: false,
        canReturn: true,
        slaNotes: '24h delivery for steer tires.'
    },
    {
        id: 'DLR-002',
        name: 'Reliable Retreaders',
        category: 'Retreader',
        contactPerson: 'Sarah Jane',
        email: 'info@reliableretread.com',
        phone: '+255 788 222 333',
        status: 'active',
        canReceiveNew: false,
        canReceiveUsed: true,
        canReturn: true,
        slaNotes: 'Max 3 retreads per casing.'
    },
    {
        id: 'DLR-003',
        name: 'Eco Disposal Ltd',
        category: 'Scrap / Disposal',
        contactPerson: 'Mike Ross',
        email: 'disposal@eco.com',
        status: 'active',
        canReceiveNew: false,
        canReceiveUsed: true,
        canReturn: false,
        slaNotes: 'Requires certification for every batch.'
    }
];

export const mockTransferHistory: StockTransfer[] = [
    {
        id: 'TR-1001',
        skuId: 1,
        fromLocationId: 'LOC-001',
        toLocationId: 'LOC-002',
        quantity: 12,
        type: 'Internal Transfer',
        status: 'completed',
        createdAt: new Date('2025-12-20T10:30:00'),
        createdBy: 'Admin User'
    },
    {
        id: 'TR-1002',
        skuId: 2,
        fromLocationId: 'LOC-001',
        toDealerId: 'DLR-002',
        quantity: 20,
        type: 'Send for Retreading',
        reason: 'Periodic maintenance for steer tires',
        status: 'pending',
        createdAt: new Date('2025-12-22T14:15:00'),
        createdBy: 'Ops Lead'
    },
    {
        id: 'TR-1003',
        skuId: 3,
        fromDealerId: 'DLR-001',
        toLocationId: 'LOC-001',
        quantity: 50,
        type: 'Receive from Dealer',
        status: 'completed',
        createdAt: new Date('2025-12-21T09:00:00'),
        createdBy: 'Warehouse Clerk'
    }
];
