'use client';

import { useState, useRef, useEffect } from "react";
import { useSKUsQuery } from "@/app/(pages)/inventory/query";
import { receiveStock } from "@/actions/sku";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X, Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { fetchWarehouses, fetchSuppliers, Warehouse, Supplier } from "@/actions/inventory";

type EntryMode = 'bulk' | 'individual';

interface TireEntry {
    dotCode: string;
    manufacturingWeek?: number;
    manufacturingYear?: number;
}

export default function ReceiveStockModal({
    onCancel,
    onSuccess,
    initialSkuId
}: {
    onCancel: () => void,
    onSuccess: () => void,
    initialSkuId?: number | string
}) {
    const { data: skus } = useSKUsQuery();
    const [loading, setLoading] = useState(false);
    const [entryMode, setEntryMode] = useState<EntryMode>('bulk');
    const [quantity, setQuantity] = useState(1);
    const [tireEntries, setTireEntries] = useState<TireEntry[]>([{ dotCode: '' }]);
    const [csvFileName, setCsvFileName] = useState<string>('');
    const [csvImported, setCsvImported] = useState(false);
    const [selectedSkuId, setSelectedSkuId] = useState<string | number>(initialSkuId || "");

    // New states for searchable selects
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | number>("");

    // Explicitly set the initial SKU if provided/changed
    useEffect(() => {
        if (initialSkuId) setSelectedSkuId(initialSkuId);
    }, [initialSkuId]);

    // Fetch warehouses and suppliers on mount
    useEffect(() => {
        const loadOptions = async () => {
            const [wRes, sRes] = await Promise.all([
                fetchWarehouses(),
                fetchSuppliers()
            ]);
            if (wRes.success) {
                setWarehouses(wRes.data);
                if (wRes.data.length > 0) setSelectedWarehouseId(wRes.data[0].id);
            }
            if (sRes.success) {
                setSuppliers(sRes.data);
                if (sRes.data.length > 0) setSelectedSupplierId(sRes.data[0].id);
            }
        };
        loadOptions();
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 1) return;
        setQuantity(newQuantity);

        if (entryMode === 'individual') {
            const currentLength = tireEntries.length;
            if (newQuantity > currentLength) {
                const newEntries = Array.from({ length: newQuantity - currentLength }, () => ({ dotCode: '' }));
                setTireEntries([...tireEntries, ...newEntries]);
            } else if (newQuantity < currentLength) {
                setTireEntries(tireEntries.slice(0, newQuantity));
            }
        }
    };

    const handleEntryModeChange = (mode: EntryMode) => {
        setEntryMode(mode);
        if (mode === 'individual') {
            setTireEntries(Array.from({ length: quantity }, () => ({ dotCode: '' })));
        } else {
            setCsvImported(false);
            setCsvFileName('');
            setTireEntries([{ dotCode: '' }]);
        }
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith('.csv');
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (!isCSV && !isExcel) {
            alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
            return;
        }

        setCsvFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) return;

                let workbook: XLSX.WorkBook;
                if (isCSV) {
                    const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
                    workbook = XLSX.read(text, { type: 'string' });
                } else {
                    workbook = XLSX.read(data, { type: 'array' });
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                if (jsonData.length < 2) {
                    alert('CSV file must have at least a header row and one data row');
                    return;
                }

                const headerRow = jsonData[0].map((h: any) => String(h || '').toLowerCase().trim());
                const dotCodeIndex = headerRow.findIndex((h: string) =>
                    h.includes('dot') || h.includes('dot_code') || h.includes('dotcode') ||
                    h.includes('dot number') || h.includes('dotnumber')
                );
                const mfgWeekIndex = headerRow.findIndex((h: string) =>
                    h.includes('manufacturing week') || h.includes('mfg_week') || h.includes('mfgweek') ||
                    h.includes('week') || h.includes('production week')
                );
                const mfgYearIndex = headerRow.findIndex((h: string) =>
                    h.includes('manufacturing year') || h.includes('mfg_year') || h.includes('mfgyear') ||
                    h.includes('year') || h.includes('production year')
                );

                if (dotCodeIndex === -1) {
                    alert('Could not find a DOT code column. Please ensure your CSV has a column with "DOT", "DOT Code", or "DOT_Code" in the header.');
                    return;
                }

                const importedTires: TireEntry[] = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const dotCode = String(row[dotCodeIndex] || '').trim();
                    if (dotCode) {
                        const tireEntry: TireEntry = { dotCode };

                        if (mfgWeekIndex !== -1) {
                            const week = row[mfgWeekIndex];
                            if (week !== undefined && week !== null && week !== '') {
                                tireEntry.manufacturingWeek = Number(week);
                            }
                        }

                        if (mfgYearIndex !== -1) {
                            const year = row[mfgYearIndex];
                            if (year !== undefined && year !== null && year !== '') {
                                tireEntry.manufacturingYear = Number(year);
                            }
                        }

                        importedTires.push(tireEntry);
                    }
                }

                if (importedTires.length === 0) {
                    alert('No DOT codes found in the CSV file');
                    return;
                }

                setTireEntries(importedTires);
                setQuantity(importedTires.length);
                setCsvImported(true);

                alert(`Successfully imported ${importedTires.length} tire details.`);
            } catch (error) {
                console.error('Error parsing CSV:', error);
                alert('Error reading CSV file.');
            }
        };

        if (isCSV) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleTireDetailChange = (index: number, field: keyof TireEntry, value: string | number | undefined) => {
        const updated = [...tireEntries];
        // @ts-ignore: Dynamic assignment
        updated[index] = { ...updated[index], [field]: value };
        setTireEntries(updated);
    };

    const handleDownloadTemplate = () => {
        const headers = ["DOT Code", "Manufacturing Week", "Manufacturing Year"];
        const csvContent = headers.join(",") + "\n" +
            "DOT12345678,12,2024\n" +
            "DOT87654321,01,2024";

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "tire_stock_import_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const addTireEntry = () => {
        setTireEntries([...tireEntries, { dotCode: '' }]);
        setQuantity(tireEntries.length + 1);
    };

    const removeTireEntry = (index: number) => {
        if (tireEntries.length > 1) {
            const updated = tireEntries.filter((_, i) => i !== index);
            setTireEntries(updated);
            setQuantity(updated.length);
        }
    };

    const validateTireDetails = (): string | null => {
        if (entryMode === 'individual' || (entryMode === 'bulk' && csvImported)) {
            const emptyDotCodes = tireEntries.some(entry => !entry.dotCode.trim());
            if (emptyDotCodes) {
                return "All tires must have a DOT code.";
            }
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (entryMode === 'bulk' && !csvImported) {
            alert('Please import a CSV file with tire details (DOT codes).');
            return;
        }

        const validationError = validateTireDetails();
        if (validationError) {
            alert(validationError);
            return;
        }

        if (!selectedSkuId) {
            alert("Please select a SKU.");
            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const condition = formData.get("condition") as string;

        // Construct the tires payload
        const tires = tireEntries.map(e => ({
            dotCode: e.dotCode.trim(),
            manufactureWeek: e.manufacturingWeek,
            manufactureYear: e.manufacturingYear,
            condition: condition
        }));

        const result = await receiveStock({
            skuId: selectedSkuId,
            warehouseId: selectedWarehouseId,
            supplierId: selectedSupplierId,
            entryMode: entryMode === 'bulk' ? 'BULK' : 'INDIVIDUAL',
            tires: tires
        });

        setLoading(false);

        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["skus"] }); // Invalidate skus to refresh stock count
            queryClient.invalidateQueries({ queryKey: ["sku-inventory"] });
            onSuccess();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 max-h-screen">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative shadow-2xl my-4 max-h-[90vh] flex flex-col">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                <h2 className="text-xl font-bold mb-6">Receive Stock</h2>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select SKU</label>
                        <select
                            value={String(selectedSkuId)} // Controlled input
                            onChange={(e) => setSelectedSkuId(e.target.value)}
                            required
                            className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        >
                            <option value="">-- Choose SKU --</option>
                            {skus?.map(sku => (
                                <option key={sku.id} value={sku.id}>
                                    {sku.brand} {sku.model} ({sku.size}) - {sku.skuCode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Entry Mode</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="entryMode"
                                    checked={entryMode === 'bulk'}
                                    onChange={() => handleEntryModeChange('bulk')}
                                    className="w-4 h-4"
                                />
                                <span>Bulk Entry (CSV Import)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="entryMode"
                                    checked={entryMode === 'individual'}
                                    onChange={() => handleEntryModeChange('individual')}
                                    className="w-4 h-4"
                                />
                                <span>Individual Entry (Manual)</span>
                            </label>
                        </div>
                    </div>

                    {entryMode === 'bulk' ? (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Import from CSV/Excel</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleCSVImport}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {csvImported ? 'Change File' : 'Import CSV/Excel'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDownloadTemplate}
                                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Template
                                    </Button>
                                    {csvImported && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <FileSpreadsheet className="w-4 h-4" />
                                            <span>{csvFileName} ({tireEntries.length} tires)</span>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {csvImported && (
                                <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Imported Tires ({tireEntries.length})</label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setCsvImported(false);
                                                setCsvFileName('');
                                                setTireEntries([{ dotCode: '' }]);
                                                setQuantity(1);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Clear Import
                                        </Button>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                        {tireEntries.map((entry, index) => (
                                            <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-gray-500 w-6">#{index + 1}</span>
                                                <span className="font-mono">DOT: {entry.dotCode}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Individual Tire Details ({tireEntries.length} tires)</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTireEntry}
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Tire
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-3 border rounded-md p-3">
                                {tireEntries.map((entry, index) => (
                                    <div key={index} className="space-y-2 border-b pb-3 last:border-b-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700 w-8">#{index + 1}</span>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">DOT Code *</label>
                                                    <Input
                                                        value={entry.dotCode}
                                                        onChange={(e) => handleTireDetailChange(index, 'dotCode', e.target.value)}
                                                        placeholder="DOT Code"
                                                        required
                                                        className="w-full h-8 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Week</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="52"
                                                        value={entry.manufacturingWeek || ''}
                                                        onChange={(e) => handleTireDetailChange(index, 'manufacturingWeek', e.target.value ? Number(e.target.value) : undefined)}
                                                        placeholder="1-52"
                                                        className="w-full h-8 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 block">Year</label>
                                                    <Input
                                                        type="number"
                                                        min="2000"
                                                        max="2100"
                                                        value={entry.manufacturingYear || ''}
                                                        onChange={(e) => handleTireDetailChange(index, 'manufacturingYear', e.target.value ? Number(e.target.value) : undefined)}
                                                        placeholder="2024"
                                                        className="w-full h-8 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            {tireEntries.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeTireEntry(index)}
                                                    className="text-red-500 hover:text-red-700 h-8 w-8"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 h-auto min-h-[100px]">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Warehouse *</label>
                            <SearchableSelect
                                options={warehouses}
                                value={selectedWarehouseId}
                                onChange={setSelectedWarehouseId}
                                placeholder="Search warehouse..."
                            />
                            <p className="text-[10px] text-gray-500 italic">Select from available depots</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Supplier</label>
                            <SearchableSelect
                                options={suppliers}
                                value={selectedSupplierId}
                                onChange={setSelectedSupplierId}
                                placeholder="Search supplier..."
                            />
                            <p className="text-[10px] text-gray-500 italic">Select from available vendors</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Condition</label>
                        <select
                            name="condition"
                            className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        >
                            <option value="NEW">New</option>
                            <option value="USED">Used</option>
                            <option value="RETREAD">Retread</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Processing..." :
                                entryMode === 'individual' ? `Receive ${tireEntries.length} Tires` :
                                    csvImported ? `Receive ${tireEntries.length} Tires from CSV` :
                                        "Import CSV Required"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
