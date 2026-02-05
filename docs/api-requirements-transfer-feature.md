# API Requirements: Transfer Feature

## Overview

This document outlines the API requirements for the Stock Transfer feature in the Tire Management System (TMS). The transfer feature enables inventory movements across internal locations, external dealers, and vehicles, supporting various transfer types including internal transfers, dealer transactions, vehicle assignments, and retreading operations.

---

## Table of Contents

1. [Transfer Types](#transfer-types)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Business Rules](#business-rules)
5. [Error Handling](#error-handling)
6. [Security & Authorization](#security--authorization)
7. [Integration Points](#integration-points)

---

## Transfer Types

The system supports the following transfer types:

| Transfer Type | Description | Source | Destination |
|--------------|-------------|--------|-------------|
| `Internal Transfer` | Move stock between internal locations | Location | Location |
| `Issue to Vehicle` | Assign tires to a vehicle | Location | Vehicle |
| `Send to Dealer` | Send tires to external dealer | Location | Dealer |
| `Receive from Dealer` | Receive tires from dealer | Dealer | Location |
| `Send for Retreading` | Send used tires for retreading | Location | Dealer (Retreader) |

---

## Data Models

### StockTransfer

```typescript
interface StockTransfer {
    id: string;                    // Unique transfer ID (e.g., "TR-1001")
    skuId: number;                 // SKU being transferred
    fromLocationId?: string;       // Source location (optional)
    fromDealerId?: string;         // Source dealer (optional)
    toLocationId?: string;         // Destination location (optional)
    toDealerId?: string;           // Destination dealer (optional)
    toVehicleId?: string;          // Destination vehicle (optional)
    quantity: number;              // Number of units to transfer
    type: TransferType;            // Type of transfer
    reason?: string;               // Optional reason/notes
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: Date;               // Transfer creation timestamp
    createdBy: string;             // User who initiated transfer
    completedAt?: Date;            // Transfer completion timestamp
    completedBy?: string;          // User who completed transfer
    cancelledAt?: Date;            // Transfer cancellation timestamp
    cancelledBy?: string;          // User who cancelled transfer
    cancellationReason?: string;   // Reason for cancellation
}
```

### Location

```typescript
interface Location {
    id: string;                    // Unique location ID
    name: string;                  // Location name
    type: 'Warehouse' | 'Workshop' | 'Quarantine' | 'Yard';
    region?: string;               // Geographic region
    depot?: string;                // Parent depot
    canStoreTires: boolean;        // Can store inventory
    canIssueTires: boolean;        // Can issue tires
    canInspectTires: boolean;      // Has inspection capability
    canReceiveTransfers: boolean;  // Can receive transfers
    status: 'active' | 'inactive';
}
```

### Dealer

```typescript
interface Dealer {
    id: string;                    // Unique dealer ID
    name: string;                  // Dealer name
    category: 'Tire Supplier' | 'Retreader' | 'Scrap / Disposal';
    contactPerson?: string;
    email?: string;
    phone?: string;
    status: 'active' | 'suspended';
    canReceiveNew: boolean;        // Can receive new tires
    canReceiveUsed: boolean;       // Can receive used tires
    canReturn: boolean;            // Can return tires
    slaNotes?: string;             // Service level agreement notes
}
```

---

## API Endpoints

### 1. Create Transfer

**Endpoint:** `POST /api/transfers/create`

**Description:** Initiate a new stock transfer

**Request Body:**
```json
{
    "skuId": 1,
    "fromLocationId": "LOC-001",
    "toLocationId": "LOC-002",
    "quantity": 12,
    "type": "Internal Transfer",
    "reason": "Rebalancing stock levels"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Transfer created successfully",
    "data": {
        "id": "TR-1001",
        "skuId": 1,
        "fromLocationId": "LOC-001",
        "toLocationId": "LOC-002",
        "quantity": 12,
        "type": "Internal Transfer",
        "reason": "Rebalancing stock levels",
        "status": "pending",
        "createdAt": "2026-01-10T10:30:00Z",
        "createdBy": "admin@tire-system.com"
    }
}
```

**Validation Rules:**
- `skuId` must exist in the system
- `quantity` must be greater than 0
- Source location must have sufficient available stock
- Either `toLocationId`, `toDealerId`, or `toVehicleId` must be provided
- Transfer type must match source/destination combination
- Source and destination cannot be the same

---

### 2. List Transfers

**Endpoint:** `GET /api/transfers/list`

**Description:** Retrieve transfer history with filtering and pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`pending`, `completed`, `cancelled`)
- `type` (optional): Filter by transfer type
- `skuId` (optional): Filter by SKU
- `locationId` (optional): Filter by source or destination location
- `dealerId` (optional): Filter by dealer
- `vehicleId` (optional): Filter by vehicle
- `startDate` (optional): Filter transfers from this date
- `endDate` (optional): Filter transfers until this date
- `createdBy` (optional): Filter by user who created transfer

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": "TR-1001",
            "skuId": 1,
            "skuCode": "MICH-XZE-295/80R22.5",
            "skuName": "Michelin XZE 295/80R22.5",
            "fromLocationId": "LOC-001",
            "fromLocationName": "Main Depot",
            "toLocationId": "LOC-002",
            "toLocationName": "Dar Depot",
            "quantity": 12,
            "type": "Internal Transfer",
            "status": "completed",
            "createdAt": "2026-01-10T10:30:00Z",
            "createdBy": "admin@tire-system.com",
            "completedAt": "2026-01-10T11:00:00Z",
            "completedBy": "warehouse@tire-system.com"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
    }
}
```

---

### 3. Get Transfer Details

**Endpoint:** `GET /api/transfers/{transferId}`

**Description:** Retrieve detailed information about a specific transfer

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": "TR-1001",
        "skuId": 1,
        "sku": {
            "id": 1,
            "skuCode": "MICH-XZE-295/80R22.5",
            "brand": "Michelin",
            "model": "XZE",
            "size": "295/80R22.5"
        },
        "fromLocationId": "LOC-001",
        "fromLocation": {
            "id": "LOC-001",
            "name": "Main Depot",
            "type": "Warehouse"
        },
        "toLocationId": "LOC-002",
        "toLocation": {
            "id": "LOC-002",
            "name": "Dar Depot",
            "type": "Warehouse"
        },
        "quantity": 12,
        "type": "Internal Transfer",
        "reason": "Rebalancing stock levels",
        "status": "completed",
        "createdAt": "2026-01-10T10:30:00Z",
        "createdBy": "admin@tire-system.com",
        "completedAt": "2026-01-10T11:00:00Z",
        "completedBy": "warehouse@tire-system.com",
        "auditLog": [
            {
                "timestamp": "2026-01-10T10:30:00Z",
                "action": "created",
                "user": "admin@tire-system.com"
            },
            {
                "timestamp": "2026-01-10T11:00:00Z",
                "action": "completed",
                "user": "warehouse@tire-system.com"
            }
        ]
    }
}
```

---

### 4. Update Transfer Status

**Endpoint:** `PUT /api/transfers/{transferId}/status`

**Description:** Update the status of a transfer (complete or cancel)

**Request Body:**
```json
{
    "status": "completed",
    "notes": "Transfer completed successfully"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Transfer status updated successfully",
    "data": {
        "id": "TR-1001",
        "status": "completed",
        "completedAt": "2026-01-10T11:00:00Z",
        "completedBy": "warehouse@tire-system.com"
    }
}
```

**Validation Rules:**
- Only `pending` transfers can be updated
- Status can only transition to `completed` or `cancelled`
- Completing a transfer must update inventory levels
- Cancelling requires a cancellation reason

---

### 5. Cancel Transfer

**Endpoint:** `POST /api/transfers/{transferId}/cancel`

**Description:** Cancel a pending transfer

**Request Body:**
```json
{
    "reason": "Incorrect quantity entered"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Transfer cancelled successfully",
    "data": {
        "id": "TR-1001",
        "status": "cancelled",
        "cancelledAt": "2026-01-10T10:45:00Z",
        "cancelledBy": "admin@tire-system.com",
        "cancellationReason": "Incorrect quantity entered"
    }
}
```

---

### 6. Get Transfer Statistics

**Endpoint:** `GET /api/transfers/statistics`

**Description:** Retrieve transfer statistics and metrics

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics
- `locationId` (optional): Filter by location
- `type` (optional): Filter by transfer type

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "totalTransfers": 150,
        "pendingTransfers": 12,
        "completedTransfers": 130,
        "cancelledTransfers": 8,
        "completedToday": 5,
        "byType": {
            "Internal Transfer": 80,
            "Issue to Vehicle": 40,
            "Send to Dealer": 15,
            "Receive from Dealer": 10,
            "Send for Retreading": 5
        },
        "topSKUs": [
            {
                "skuId": 1,
                "skuCode": "MICH-XZE-295/80R22.5",
                "totalQuantity": 250
            }
        ],
        "topLocations": [
            {
                "locationId": "LOC-001",
                "locationName": "Main Depot",
                "outboundTransfers": 45,
                "inboundTransfers": 38
            }
        ]
    }
}
```

---

### 7. Validate Transfer

**Endpoint:** `POST /api/transfers/validate`

**Description:** Validate a transfer before creation (pre-flight check)

**Request Body:**
```json
{
    "skuId": 1,
    "fromLocationId": "LOC-001",
    "toLocationId": "LOC-002",
    "quantity": 12,
    "type": "Internal Transfer"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "valid": true,
    "warnings": [],
    "errors": [],
    "stockImpact": {
        "sourceLocation": {
            "locationId": "LOC-001",
            "currentStock": 50,
            "afterTransfer": 38,
            "available": true
        },
        "destinationLocation": {
            "locationId": "LOC-002",
            "currentStock": 20,
            "afterTransfer": 32
        }
    }
}
```

**Validation Response (with errors):**
```json
{
    "success": true,
    "valid": false,
    "warnings": [
        "Destination location is approaching capacity"
    ],
    "errors": [
        "Insufficient stock at source location. Available: 5, Requested: 12"
    ],
    "stockImpact": null
}
```

---

## Business Rules

### Stock Availability
1. Source location must have sufficient **available** stock (not just total stock)
2. Available stock = Total stock - Reserved - In transit - Quarantined
3. System should prevent over-allocation of stock

### Transfer Type Validation
1. **Internal Transfer**: Both source and destination must be locations
2. **Issue to Vehicle**: Source must be location, destination must be vehicle
3. **Send to Dealer**: Source must be location, destination must be dealer
4. **Receive from Dealer**: Source must be dealer, destination must be location
5. **Send for Retreading**: Source must be location, destination must be dealer with category "Retreader"

### Location Capabilities
1. Source location must have `canIssueTires: true`
2. Destination location must have `canReceiveTransfers: true`
3. Quarantine locations cannot issue tires (`canIssueTires: false`)

### Dealer Constraints
1. **Send to Dealer (New)**: Dealer must have `canReceiveNew: true`
2. **Send to Dealer (Used)**: Dealer must have `canReceiveUsed: true`
3. **Send for Retreading**: Dealer category must be "Retreader"
4. **Scrap/Disposal**: Dealer category must be "Scrap / Disposal"
5. Suspended dealers cannot participate in transfers

### Status Transitions
```
pending → completed
pending → cancelled
```
- Completed and cancelled transfers are immutable
- Only pending transfers can be modified

### Inventory Impact
1. **On Transfer Creation (pending)**:
   - Reserve stock at source location
   - Do not update destination inventory yet

2. **On Transfer Completion**:
   - Deduct from source location
   - Add to destination location
   - Release reservation

3. **On Transfer Cancellation**:
   - Release reservation at source location
   - No inventory changes

---

## Error Handling

### Error Response Format
```json
{
    "success": false,
    "message": "Error message",
    "errors": [
        {
            "field": "quantity",
            "message": "Insufficient stock available"
        }
    ],
    "code": "INSUFFICIENT_STOCK"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_STOCK` | 400 | Not enough stock at source location |
| `INVALID_TRANSFER_TYPE` | 400 | Transfer type doesn't match source/destination |
| `LOCATION_NOT_FOUND` | 404 | Location ID not found |
| `DEALER_NOT_FOUND` | 404 | Dealer ID not found |
| `SKU_NOT_FOUND` | 404 | SKU ID not found |
| `TRANSFER_NOT_FOUND` | 404 | Transfer ID not found |
| `INVALID_STATUS_TRANSITION` | 400 | Cannot change status from current state |
| `LOCATION_INACTIVE` | 400 | Location is inactive |
| `DEALER_SUSPENDED` | 400 | Dealer is suspended |
| `LOCATION_CANNOT_ISSUE` | 400 | Source location cannot issue tires |
| `LOCATION_CANNOT_RECEIVE` | 400 | Destination location cannot receive transfers |
| `SAME_SOURCE_DESTINATION` | 400 | Source and destination are the same |
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission for this operation |
| `VALIDATION_ERROR` | 422 | Request validation failed |

---

## Security & Authorization

### Authentication
- All endpoints require Bearer token authentication
- Token should be obtained via `/api/auth/login`
- Include in header: `Authorization: Bearer <token>`

### Authorization Roles

| Role | Permissions |
|------|-------------|
| `admin` | All transfer operations |
| `warehouse_manager` | Create, view, complete transfers |
| `warehouse_clerk` | Create, view transfers |
| `operations_manager` | View all transfers, statistics |
| `viewer` | View transfers only |

### Endpoint Permissions

| Endpoint | Admin | Warehouse Manager | Warehouse Clerk | Operations Manager | Viewer |
|----------|-------|-------------------|-----------------|-------------------|--------|
| `POST /api/transfers/create` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `GET /api/transfers/list` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `GET /api/transfers/{id}` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `PUT /api/transfers/{id}/status` | ✓ | ✓ | ✗ | ✗ | ✗ |
| `POST /api/transfers/{id}/cancel` | ✓ | ✓ | ✗ | ✗ | ✗ |
| `GET /api/transfers/statistics` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `POST /api/transfers/validate` | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## Integration Points

### 1. SKU Management
- Validate SKU existence before transfer
- Retrieve SKU details for display
- Check SKU-specific transfer rules (e.g., retreadable status)

### 2. Inventory Management
- Check available stock at source location
- Update inventory levels on transfer completion
- Reserve stock during pending transfers
- Track stock movements for audit trail

### 3. Location Management
- Validate location capabilities
- Check location status (active/inactive)
- Retrieve location details

### 4. Dealer Management
- Validate dealer capabilities
- Check dealer status (active/suspended)
- Retrieve dealer details

### 5. Vehicle Management
- Validate vehicle existence for "Issue to Vehicle" transfers
- Update vehicle tire assignments
- Track tire lifecycle on vehicles

### 6. Audit & Logging
- Log all transfer operations
- Track user actions (create, complete, cancel)
- Maintain audit trail for compliance

### 7. Notifications
- Notify warehouse staff of pending transfers
- Alert on low stock after transfers
- Send confirmation emails for dealer transfers

---

## Additional Considerations

### Performance
- Implement pagination for list endpoints
- Add database indexing on frequently queried fields (status, type, createdAt, locationId)
- Consider caching for statistics endpoint

### Concurrency
- Implement optimistic locking to prevent double-allocation
- Use database transactions for inventory updates
- Handle race conditions when multiple users transfer same stock

### Audit Trail
- Maintain complete history of all transfer state changes
- Record user, timestamp, and reason for each action
- Ensure immutability of completed/cancelled transfers

### Future Enhancements
- Batch transfers (multiple SKUs in one transfer)
- Scheduled/recurring transfers
- Transfer approval workflow
- Integration with external logistics systems
- Real-time transfer tracking
- Transfer cost calculation and reporting

---

## Appendix

### Sample Workflow: Internal Transfer

1. **User initiates transfer**
   - `POST /api/transfers/validate` (optional pre-flight check)
   - `POST /api/transfers/create`

2. **System validates and creates transfer**
   - Validates SKU, locations, quantity
   - Reserves stock at source location
   - Creates transfer record with status "pending"

3. **Warehouse processes transfer**
   - Physical movement of tires
   - `PUT /api/transfers/{id}/status` with status "completed"

4. **System updates inventory**
   - Deducts from source location
   - Adds to destination location
   - Updates transfer status and timestamps

5. **Audit log updated**
   - Records completion action
   - Tracks user and timestamp

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | TMS Team | Initial API requirements document |

---

**Document Status:** Draft  
**Last Updated:** 2026-01-10  
**Next Review:** 2026-02-10
