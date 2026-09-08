"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { requirementService } from "@/services/requirementService";
import { biddingService } from "@/services/biddingService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MaskedContactCard } from "@/components/common/MaskedContactCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Gavel,
  AlertCircle,
} from "lucide-react";

export default function RequirementDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();

  const req = requirementService.getRequirementById(id);
  const bids = biddingService.getBidsForRequirement(id);

  const buyerContact = organizationService.getContact(
    req?.buyer_org_id || "",
    currentOrg?.id
  );

  const [showBidModal, setShowBidModal] = useState(false);
  const [leadTime, setLeadTime] = useState(28);
  const [paymentTerms, setPaymentTerms] = useState("30% Advance, 70% against dispatch");
  const [deliveryTerms, setDeliveryTerms] = useState("Door Delivery DAP Pune");
  const [qualityCommitments, setQualityCommitments] = useState(
    "100% CMM inspection report & Material Test Certificate (MTC) with every batch"
  );
  const [notes, setNotes] = useState("Samples / First Article Inspection Report (FAIR) ready in 7 days");
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});

  if (!req) {
    return (
      <div className="p-12 text-center text-slate-500">
        Requirement not found.
      </div>
    );
  }

  const isBuyer = req.buyer_org_id === currentOrg?.id;
  const myBid = bids.find((b) => b.vendor_org_id === currentOrg?.id);

  const handlePriceChange = (itemId: string, price: number) => {
    setItemPrices({ ...itemPrices, [itemId]: price });
  };

  const calculateSubtotal = () => {
    return (req.items || []).reduce((sum, item) => {
      const price = itemPrices[item.id] || item.target_unit_price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const bidItems = (req.items || []).map((it) => ({
      requirement_item_id: it.id,
      unit_price: itemPrices[it.id] || it.target_unit_price || 1000,
      quantity: it.quantity,
      total: (itemPrices[it.id] || it.target_unit_price || 1000) * it.quantity,
      remarks: "Manufactured per drawing tolerance & quality standard",
    }));

    biddingService.submitBid(
      {
        requirement_id: req.id,
        vendor_org_id: currentOrg?.id || "44444444-4444-4444-4444-444444444402",
        subtotal,
        tax,
        total,
        lead_time_days: leadTime,
        validity_date: "2026-12-31",
        payment_terms: paymentTerms,
        delivery_terms: deliveryTerms,
        quality_commitments: qualityCommitments,
        notes: notes,
      },
      bidItems
    );

    setShowBidModal(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/requirements"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requirements</span>
        </Link>
        <StatusBadge status={req.status} type="requirement" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            RFQ #{req.id.slice(0, 8)} • {req.category?.name}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {req.title}
          </h1>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {req.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Delivery Plant</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {req.delivery_location}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Required By</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(req.required_by_date)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px]">Submission Deadline</span>
              <span className="font-medium text-amber-600 dark:text-amber-400 font-mono">
                {new Date(req.deadline).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaskedContactCard
          contact={buyerContact}
          orgName={req.buyer_org?.display_name}
          title="Procuring Buyer Organization"
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Commercial Terms & Logistics
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {req.commercial_terms || "Standard PO terms applicable."}
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            All submitted quotations are private and isolated. Competing vendors will never see your pricing or terms.
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Part Specifications & Tolerances
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {req.items?.length || 0} Parts Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Part / Item Name</th>
                <th className="p-4">Material Grade</th>
                <th className="p-4">Tolerance</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Target Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(req.items || []).map((it) => (
                <tr key={it.id}>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {it.item_name}
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      {it.specification}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{it.material_grade || "As specified"}</td>
                  <td className="p-4 font-mono">{it.tolerance || "Standard"}</td>
                  <td className="p-4 font-bold">
                    {it.quantity} {it.unit}
                  </td>
                  <td className="p-4 text-slate-500">
                    {it.target_unit_price ? formatCurrency(it.target_unit_price) : "Open"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {isBuyer ? (
          <>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Quotation Evaluation ({bids.length} Received)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review vendor proposals, compare pricing and technical parameters, and select the winning quote.
              </p>
            </div>
            <Link
              href={`/evaluation/${req.id}`}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all shadow-blue-500/20 shrink-0"
            >
              Open Comparison Matrix & Award
            </Link>
          </>
        ) : (
          <>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {myBid ? `Quotation Submitted (Version ${myBid.version})` : "Submit Manufacturing Quotation"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {myBid
                  ? `Your bid of ${formatCurrency(myBid.total)} is active. You can revise it before the deadline.`
                  : "Submit your unit rates, lead time, and quality commitments."}
              </p>
            </div>
            <button
              onClick={() => setShowBidModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all shadow-blue-500/20 shrink-0 flex items-center space-x-2"
            >
              <Gavel className="w-4 h-4" />
              <span>{myBid ? "Revise Quotation" : "Submit Quotation"}</span>
            </button>
          </>
        )}
      </div>

      {showBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit Quotation for {req.title}
              </h3>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Itemized Unit Rates (INR)
                </span>
                {(req.items || []).map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {it.item_name}
                      </span>
                      <span className="text-slate-400">
                        Qty: {it.quantity} {it.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">₹</span>
                      <input
                        type="number"
                        required
                        defaultValue={it.target_unit_price || 2000}
                        onChange={(e) => handlePriceChange(it.id, Number(e.target.value))}
                        className="w-28 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 text-right font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={leadTime}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Quality Commitments & Inspection Standards
                </label>
                <textarea
                  rows={2}
                  required
                  value={qualityCommitments}
                  onChange={(e) => setQualityCommitments(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>Estimated Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(calculateSubtotal() * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-blue-200/40">
                  <span>Quotation Total:</span>
                  <span className="text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(calculateSubtotal() * 1.18)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                >
                  Submit Official Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
