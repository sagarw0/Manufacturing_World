"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { requirementService } from "@/services/requirementService";
import { organizationService } from "@/services/organizationService";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { DocumentAttachment } from "@/types/database.types";
import Link from "next/link";

export default function CreateRequirementPage() {
  const router = useRouter();
  const currentOrg = organizationService.getCurrentOrganization();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("22222222-2222-2222-2222-222222222201");
  const [deliveryLocation, setDeliveryLocation] = useState("Chakan Industrial Area, Pune, Maharashtra");
  const [requiredByDate, setRequiredByDate] = useState("2026-12-15");
  const [deadline, setDeadline] = useState("2026-11-15T18:00");
  const [commercialTerms, setCommercialTerms] = useState("Net 30 Days payment; Door delivery DAP; MTC required");
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);

  const [items, setItems] = useState([
    {
      item_name: "CNC Precision Machined Housing",
      specification: "Billet Al 7075-T6, 5-Axis contouring, clear anodized 25um",
      material_grade: "Al 7075-T6",
      tolerance: "+/- 0.010 mm",
      quantity: 250,
      unit: "Nos",
      target_unit_price: 5200,
    }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: "",
        specification: "",
        material_grade: "SS316L",
        tolerance: "+/- 0.025 mm",
        quantity: 100,
        unit: "Nos",
        target_unit_price: 1500,
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, val: any) => {
    const next = [...items];
    (next[index] as any)[field] = val;
    setItems(next);
  };

  const totalQuantity = items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || items.length === 0) return;

    const created = requirementService.createRequirement(
      {
        buyer_org_id: currentOrg?.id || "44444444-4444-4444-4444-444444444401",
        category_id: categoryId,
        title,
        description,
        quantity: totalQuantity,
        unit: "Sets / Nos",
        delivery_location: deliveryLocation,
        required_by_date: requiredByDate,
        deadline: new Date(deadline).toISOString(),
        status: "draft",
        commercial_terms: commercialTerms,
      },
      items,
      attachments
    );

    // Auto-publish for immediate marketplace demonstration
    requirementService.publishRequirement(created.id);
    router.push(`/requirements/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/requirements"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Manufacturing Requirement (RFQ)
          </h1>
          <p className="text-sm text-slate-500">
            Publish technical specifications to certified manufacturing vendors.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            General Information
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Requirement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5-Axis CNC Machined Aluminium Battery Housing Assembly"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Scope & Functional Requirements
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detail application environment, quality standards, pressure test limits, surface passivation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Manufacturing Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="22222222-2222-2222-2222-222222222201">Precision CNC Machining</option>
                <option value="22222222-2222-2222-2222-222222222202">Sheet Metal & Enclosures</option>
                <option value="22222222-2222-2222-2222-222222222203">Castings & Forgings</option>
                <option value="22222222-2222-2222-2222-222222222204">Moulded Polymers</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Delivery Location
              </label>
              <input
                type="text"
                required
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Required Delivery Date
              </label>
              <input
                type="date"
                required
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bidding Submission Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items Builder */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Line Items & Technical Specifications
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Part Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-rose-600 hover:text-rose-700 p-1 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Part / Item Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. End Flange"
                      value={item.item_name}
                      onChange={(e) => updateItem(idx, "item_name", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Material Grade
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SS316L / Al 6061-T6"
                      value={item.material_grade}
                      onChange={(e) => updateItem(idx, "material_grade", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Specification & Drawing Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Tolerances, surface finishes, CMM report required..."
                      value={item.specification}
                      onChange={(e) => updateItem(idx, "specification", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Quantity (Nos/Sets)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Target Unit Price (INR)
                    </label>
                    <input
                      type="number"
                      value={item.target_unit_price}
                      onChange={(e) => updateItem(idx, "target_unit_price", Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link
            href="/requirements"
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all shadow-blue-500/20"
          >
            Publish Requirement to Vendors
          </button>
        </div>
      </form>
    </div>
  );
}
