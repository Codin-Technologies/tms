"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { addTyreToStock } from "@/actions/stock";

export type AddTyreFormValues = {
  vehicleReg: string;
  tyreBrand: string;
  tyreModel: string;
  tyreSize: string;
  tyreType: string;
  serialNumber: string;
  purchaseDate: string;
  cost?: number;
  notes?: string;
};

export default function AddTyreForm({
  onCancel,
  initialValues,
  onSuccess,
}: {
  onCancel: () => void;
  initialValues?: AddTyreFormValues;
  onSuccess?: () => void;
}) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<AddTyreFormValues>({
    defaultValues: {
      vehicleReg: initialValues?.vehicleReg || "",
      tyreBrand: initialValues?.tyreBrand || "",
      tyreModel: initialValues?.tyreModel || "",
      tyreSize: initialValues?.tyreSize || "",
      tyreType: initialValues?.tyreType || "",
      serialNumber: initialValues?.serialNumber || "",
      purchaseDate: initialValues?.purchaseDate || "",
      cost: initialValues?.cost || undefined,
      notes: initialValues?.notes || "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const onSubmit = async (values: AddTyreFormValues) => {
    console.log("Submitting form with values:", values);

    try {
      await toast.promise(
        addTyreToStock({
          brand: values.tyreBrand,
          model: values.tyreModel,
          size: values.tyreSize,
          serialNumber: values.serialNumber,
          cost: values.cost,
          vendor: values.vehicleReg,
          warehouseId: "Default Warehouse",
          purchaseDate: values.purchaseDate,
          tyreType: values.tyreType,
        }),
        {
          loading: "Adding tyre...",
          success: (result: any) => {
            console.log("Server action result:", result);
            if (result.success) {
              handleCancel();
              if (onSuccess) onSuccess();
              return result.message || "Tyre added successfully!";
            } else {
              console.error("Server action failed:", result.message);
              throw new Error(result.message);
            }
          },
          error: (err: any) => {
            console.error("Form submission error:", err);
            return err.message || "Failed to add tyre.";
          },
        }
      );
    } catch (error) {
      console.error("onSubmit try-catch error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-black/80">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Registration
          </label>
          <input
            {...register("vehicleReg", { required: "Vehicle registration is required" })}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.vehicleReg ? "border-red-300" : "border-gray-300"}`}
            placeholder="Enter vehicle registration"
          />
          {errors.vehicleReg && <p className="mt-1 text-sm text-red-600">{errors.vehicleReg.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tyre Brand
          </label>
          <input
            {...register("tyreBrand", { required: "Tyre brand is required" })}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.tyreBrand ? "border-red-300" : "border-gray-300"}`}
            placeholder="Enter tyre brand"
          />
          {errors.tyreBrand && <p className="mt-1 text-sm text-red-600">{errors.tyreBrand.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tyre Model
          </label>
          <input
            {...register("tyreModel", { required: "Tyre model is required" })}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.tyreModel ? "border-red-300" : "border-gray-300"}`}
            placeholder="Enter tyre model"
          />
          {errors.tyreModel && <p className="mt-1 text-sm text-red-600">{errors.tyreModel.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tyre Size
          </label>
          <input
            {...register("tyreSize", { required: "Tyre size is required" })}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.tyreSize ? "border-red-300" : "border-gray-300"}`}
            placeholder="e.g., 295/80R22.5"
          />
          {errors.tyreSize && <p className="mt-1 text-sm text-red-600">{errors.tyreSize.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tyre Type
          </label>
          <select
            {...register("tyreType", { required: "Tyre type is required" })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.tyreType ? "border-red-300" : "border-gray-300"}`}
          >
            <option value="">Select Tyre Type</option>
            <option value="Radial">Radial</option>
            <option value="Bias">Bias</option>
            <option value="Tubeless">Tubeless</option>
            <option value="Tube Type">Tube Type</option>
          </select>
          {errors.tyreType && <p className="mt-1 text-sm text-red-600">{errors.tyreType.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number
          </label>
          <input
            {...register("serialNumber", { required: "Serial number is required" })}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.serialNumber ? "border-red-300" : "border-gray-300"}`}
            placeholder="Enter serial number"
          />
          {errors.serialNumber && <p className="mt-1 text-sm text-red-600">{errors.serialNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Date
          </label>
          <input
            {...register("purchaseDate", { required: "Purchase date is required" })}
            type="date"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] ${errors.purchaseDate ? "border-red-300" : "border-gray-300"}`}
          />
          {errors.purchaseDate && <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost
          </label>
          <input
            {...register("cost", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] border-gray-300"
            placeholder="Enter cost"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004953] border-gray-300"
            placeholder="Optional notes about the tyre"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-[#004953] rounded-lg hover:bg-[#014852] disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Tyre"}
        </button>
      </div>
    </form>
  );
}
