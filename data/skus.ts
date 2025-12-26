import { SKU, SKUInventoryOverview, InventorySummary, LocationGroup, VehicleGroup } from '@/types/sku';

export const mockSKUs: SKU[] = [
    {
        id: 1,
        skuCode: 'MIC-X-295-80',
        brand: 'Michelin',
        model: 'X Multi Z',
        size: '295/80 R22.5',
        plyRating: '16PR',
        category: 'Steer',
        retreadable: true,
        maxRetreadCycles: 3,
        expectedMileage: 120000,
        minTreadDepth: 4,
        reorderPoint: 20,
        minStockLevel: 10,
        preferredWarehouse: 'Main Depot',
        leadTimeDays: 5,
        avgUnitCost: 450000,
        status: 'active',
        isSafetyCritical: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    },
    {
        id: 2,
        skuCode: 'BRI-R-295-80',
        brand: 'Bridgestone',
        model: 'R-Drive 002',
        size: '295/80 R22.5',
        plyRating: '18PR',
        category: 'Drive',
        retreadable: true,
        maxRetreadCycles: 2,
        expectedMileage: 100000,
        minTreadDepth: 4,
        reorderPoint: 15,
        minStockLevel: 5,
        preferredWarehouse: 'Dar Depot',
        leadTimeDays: 7,
        avgUnitCost: 420000,
        status: 'active',
        isSafetyCritical: false,
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05'),
    },
    {
        id: 3,
        skuCode: 'CON-H-315-70',
        brand: 'Continental',
        model: 'Conti Hybrid HD3',
        size: '315/70 R22.5',
        plyRating: '20PR',
        category: 'Drive',
        retreadable: true,
        maxRetreadCycles: 3,
        expectedMileage: 110000,
        minTreadDepth: 5,
        reorderPoint: 25,
        minStockLevel: 12,
        preferredWarehouse: 'Arusha Yard',
        leadTimeDays: 6,
        avgUnitCost: 480000,
        status: 'active',
        isSafetyCritical: false,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10'),
    },
    {
        id: 4,
        skuCode: 'GOO-K-385-65',
        brand: 'Goodyear',
        model: 'KMAX S',
        size: '385/65 R22.5',
        plyRating: '22PR',
        category: 'Trailer',
        retreadable: false,
        maxRetreadCycles: 0,
        expectedMileage: 90000,
        minTreadDepth: 3,
        reorderPoint: 10,
        minStockLevel: 4,
        preferredWarehouse: 'Main Depot',
        leadTimeDays: 10,
        avgUnitCost: 510000,
        status: 'active',
        isSafetyCritical: true,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
    }
];

export const mockSKUInventory: SKUInventoryOverview[] = [
    {
        ...mockSKUs[0],
        totalQty: 120,
        available: 70,
        issued: 30,
        inspection: 10,
        quarantine: 10,
        scrapped: 0,
        inventorySummary: {
            total: 120,
            inInventory: 80,
            onVehicles: 30,
            underInspection: 5,
            quarantined: 5,
            scrapped: 0
        },
        locations: [
            { locationName: 'Main Depot', available: 45, inspection: 2, quarantine: 3, total: 50 },
            { locationName: 'Dar Depot', available: 25, inspection: 3, quarantine: 2, total: 30 }
        ],
        vehicles: [
            { vehicleId: 'V001', vehicleName: 'Truck 001', axlePosition: 'Front Left', tireCount: 1, avgTreadDepth: 12.5, status: 'OK', isSteerAxle: true },
            { vehicleId: 'V002', vehicleName: 'Truck 002', axlePosition: 'Front Right', tireCount: 1, avgTreadDepth: 11.2, status: 'OK', isSteerAxle: true },
            { vehicleId: 'V010', vehicleName: 'Bus 010', axlePosition: 'Rear Inner Right', tireCount: 1, avgTreadDepth: 6.5, status: 'Attention', isSteerAxle: false }
        ]
    },
    {
        ...mockSKUs[1],
        totalQty: 85,
        available: 40,
        issued: 35,
        inspection: 5,
        quarantine: 5,
        scrapped: 0,
        inventorySummary: {
            total: 85,
            inInventory: 45,
            onVehicles: 30,
            underInspection: 5,
            quarantined: 5,
            scrapped: 0
        },
        locations: [
            { locationName: 'Dar Depot', available: 30, inspection: 2, quarantine: 3, total: 35 },
            { locationName: 'Arusha Yard', available: 10, inspection: 3, quarantine: 2, total: 15 }
        ],
        vehicles: [
            { vehicleId: 'V005', vehicleName: 'Trailer 005', axlePosition: 'Axle 1 Left', tireCount: 1, avgTreadDepth: 8.5, status: 'OK', isSteerAxle: false }
        ]
    },
    {
        ...mockSKUs[2],
        totalQty: 200,
        available: 150,
        issued: 30,
        inspection: 10,
        quarantine: 5,
        scrapped: 5,
        inventorySummary: {
            total: 200,
            inInventory: 160,
            onVehicles: 30,
            underInspection: 5,
            quarantined: 5,
            scrapped: 0
        },
        locations: [
            { locationName: 'Arusha Yard', available: 100, inspection: 5, quarantine: 5, total: 110 },
            { locationName: 'Main Depot', available: 50, inspection: 5, quarantine: 0, total: 55 }
        ],
        vehicles: []
    },
    {
        ...mockSKUs[3],
        totalQty: 50,
        available: 15,
        issued: 25,
        inspection: 5,
        quarantine: 5,
        scrapped: 0,
        inventorySummary: {
            total: 50,
            inInventory: 20,
            onVehicles: 20,
            underInspection: 5,
            quarantined: 5,
            scrapped: 0
        },
        locations: [
            { locationName: 'Main Depot', available: 15, inspection: 5, quarantine: 5, total: 25 }
        ],
        vehicles: []
    }
];
