export type RequisitionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'closed';
export type POStatus = 'created' | 'sent' | 'acknowledged' | 'delivered' | 'closed';

export interface RequisitionLine {
  id?: string | number;
  skuCode: string;
  brand?: string;
  model?: string;
  size?: string;
  qty: number;
  unitCost: number;
  notes?: string;
}

export interface Requisition {
  id: string | number;
  reference: string;
  requesterId?: number | string;
  requesterName?: string;
  department?: string;
  status: RequisitionStatus;
  totalAmount: number;
  notes?: string;
  supplierId?: number | string;
  supplierName?: string;
  lines: RequisitionLine[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: number | string;
  poNumber: string;
  requisitionId?: string | number;
  supplierId?: number | string;
  supplierName?: string;
  status: POStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}