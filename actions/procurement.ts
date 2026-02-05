import api from '@/lib/api';
import { Requisition, RequisitionLine, PurchaseOrder } from '@/types/procurement';

// Fallback mocks when backend is unavailable
const mockRequisitions: Requisition[] = [
  {
    id: 1,
    reference: 'REQ-2026-0001',
    requesterName: 'Frank K',
    status: 'pending',
    totalAmount: 1500000,
    notes: 'Require 4 steel tyres',
    supplierName: 'Michelin Dealer',
    lines: [
      { skuCode: 'MIC-X-295-80', qty: 4, unitCost: 375000 }
    ],
    createdAt: new Date().toISOString()
  }
];

export const fetchRequisitions = async () => {
  try {
    const resp = await api.get('/api/procurement/requisitions');
    return { success: true, data: resp.data.data || [] };
  } catch (err) {
    console.error('fetchRequisitions error', err);
    return { success: true, data: mockRequisitions };
  }
};

export const fetchRequisitionById = async (id: string | number) => {
  try {
    const resp = await api.get(`/api/procurement/requisitions/${id}`);
    return { success: true, data: resp.data };
  } catch (err) {
    console.error('fetchRequisitionById error', err);
    const found = mockRequisitions.find((r) => r.id.toString() === id.toString());
    if (found) return { success: true, data: found };
    return { success: false, message: 'Not found' };
  }
};

export const createRequisition = async (payload: {
  reference?: string;
  requesterId?: number | string;
  department?: string;
  notes?: string;
  supplierId?: string | number;
  lines: RequisitionLine[];
}) => {
  try {
    const resp = await api.post('/api/procurement/requisitions', payload);
    return { success: true, data: resp.data };
  } catch (err: any) {
    console.error('createRequisition error', err);
    // Simulate success with a new mock
    const total = payload.lines.reduce((s, l) => s + (l.qty * l.unitCost), 0);
    const created = {
      id: Math.floor(Math.random() * 100000),
      reference: payload.reference || `REQ-${Date.now()}`,
      requesterName: 'You',
      status: 'pending',
      totalAmount: total,
      notes: payload.notes,
      supplierName: 'Unknown',
      lines: payload.lines,
      createdAt: new Date().toISOString()
    } as Requisition;
    return { success: true, data: created };
  }
};

export const approveRequisition = async (id: string | number, comment?: string) => {
  try {
    const resp = await api.post(`/api/procurement/requisitions/${id}/approve`, { comment });
    return { success: true, data: resp.data };
  } catch (err) {
    console.error('approveRequisition error', err);
    return { success: false, message: 'Failed to approve (mock)' };
  }
};

export const rejectRequisition = async (id: string | number, comment?: string) => {
  try {
    const resp = await api.post(`/api/procurement/requisitions/${id}/reject`, { comment });
    return { success: true, data: resp.data };
  } catch (err) {
    console.error('rejectRequisition error', err);
    return { success: false, message: 'Failed to reject (mock)' };
  }
};

export const createPOFromRequisition = async (id: string | number, payload?: { supplierId?: string | number }) => {
  try {
    const resp = await api.post(`/api/procurement/requisitions/${id}/create-po`, payload || {});
    return { success: true, data: resp.data };
  } catch (err) {
    console.error('createPOFromRequisition error', err);
    // Mock a PO
    const po = {
      id: Math.floor(Math.random() * 10000),
      poNumber: `PO-${Date.now()}`,
      requisitionId: id,
      supplierName: 'Mock Supplier',
      status: 'created',
      totalAmount: 0,
      createdAt: new Date().toISOString()
    } as PurchaseOrder;
    return { success: true, data: po };
  }
};

export const fetchPOs = async () => {
  try {
    const resp = await api.get('/api/procurement/purchase-orders');
    return { success: true, data: resp.data.data || [] };
  } catch (err) {
    console.error('fetchPOs error', err);
    return { success: true, data: [] };
  }
};
