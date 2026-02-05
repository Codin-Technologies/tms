'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createRequisition } from '@/actions/procurement';
import { useQueryClient } from '@tanstack/react-query';

export default function RequisitionForm({ onSuccess, onCancel }: { onSuccess?: (id?: any) => void, onCancel?: () => void }) {
  const [lines, setLines] = useState([{ skuCode: '', qty: 1, unitCost: 0 }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const addLine = () => setLines([...lines, { skuCode: '', qty: 1, unitCost: 0 }]);
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));
  const updateLine = (idx: number, key: string, value: any) => {
    const copy = [...lines];
    // @ts-ignore
    copy[idx][key] = value;
    setLines(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      notes,
      lines: lines.map((l) => ({ skuCode: l.skuCode, qty: Number(l.qty), unitCost: Number(l.unitCost) }))
    };

    const res: any = await createRequisition(payload);
    setLoading(false);
    if (res.success) {
      qc.invalidateQueries({ queryKey: ['requisitions'] });
      if (onSuccess) onSuccess(res.data);
      alert('Requisition created');
    } else {
      alert((res as any).message || 'Failed to create requisition');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded p-2" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Line Items</label>
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-2 items-end">
              <div className="col-span-2">
                <Input placeholder="SKU code" value={line.skuCode} onChange={(e) => updateLine(idx, 'skuCode', e.target.value)} required />
              </div>
              <div>
                <Input type="number" min={1} value={String(line.qty)} onChange={(e) => updateLine(idx, 'qty', Number(e.target.value))} />
              </div>
              <div>
                <Input type="number" min={0} value={String(line.unitCost)} onChange={(e) => updateLine(idx, 'unitCost', Number(e.target.value))} />
              </div>
              <div className="col-span-1">
                <Button type="button" variant="ghost" className="text-red-500" onClick={() => removeLine(idx)}>Remove</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLine}>Add line</Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => onCancel && onCancel()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Requisition'}</Button>
      </div>
    </form>
  );
}
