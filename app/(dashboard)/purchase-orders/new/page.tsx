"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { biddingService } from "@/services/biddingService";
import { requirementService } from "@/services/requirementService";
import { organizationService } from "@/services/organizationService";
import { poService } from "@/services/poService";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ShoppingCart, ShieldCheck } from "lucide-react";

function CreatePOForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bidId = searchParams?.get("bid_id") || "";

  const currentOrg = organizationService.getCurrentOrganization();
  const bid = bidId ? biddingService.getBidById(bidId, currentOrg?.id) : null;
  const req = bid ? requirementService.getRequirementById(bid.requirement_id) : null;

  const [deliveryAddress, setDeliveryAddress] = useState("Plot 42, Chakan Industrial Area, Phase II, Pune - 410501");
  const [deliveryDate, setDeliveryDate] = useState("2026-11-25");
  const [terms, setTerms] = useState("Door Delivery DAP Pune; 100% inspection with CMM & MTC certificates.");
  const [submitting, setSubmitting] = useState(false);

  if (!bid || !req) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
        <p>No valid accepted quotation selected for PO generation.</p>
        <Link href="/requirements" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
          Select an awarded requirement
        </Link>
      </div>
    );
  }

  const handleIssuePO = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const createdPO = poService.createPOFromBid(
        bid.id,
        "33333333-3333-3333-3333-333333333301",
        deliveryAddress,
        deliveryDate,
        terms
      );
      router.push(`/purchase-orders/${createdPO.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create Purchase Order");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleIssuePO} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Buyer Organization
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentOrg?.display_name}
            </h3>
            <p className="text-xs text-slate-500">{currentOrg?.description}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Vendor (Contractor)
            </span>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {bid.vendor_org?.display_name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500">{bid.vendor_org?.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Scope of Supply & Agreed Pricing
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Part Specification</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Unit Rate</th>
              <th className="p-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(bid.items || []).map((it) => (
              <tr key={it.id}>
                <td className="p-4">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    {it.requirement_item?.item_name}
                  </span>
                  <span className="text-[11px] text-slate-400">{it.remarks}</span>
                </td>
                <td className="p-4 font-bold">{it.quantity} Nos</td>
                <td className="p-4">{formatCurrency(it.unit_price)}</td>
                <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(it.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold text-xs text-slate-700 dark:text-slate-300">
            <tr>
              <td colSpan={3} className="p-4 text-right">Subtotal:</td>
              <td className="p-4 text-right">{formatCurrency(bid.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-4 text-right">GST (18%):</td>
              <td className="p-4 text-right">{formatCurrency(bid.tax)}</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
              <td colSpan={3} className="p-4 text-right">Total PO Value:</td>
              <td className="p-4 text-right text-blue-600 dark:text-blue-400">
                {formatCurrency(bid.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Fulfillment & Delivery Terms
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Delivery Site / Factory Address *
            </label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Committed Delivery By Date *
            </label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Commercial & Quality Terms
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Link
          href={`/evaluation/${req.id}`}
          className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all shadow-blue-500/20 flex items-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{submitting ? "Issuing PO..." : "Issue Purchase Order"}</span>
        </button>
      </div>
    </form>
  );
}

export default function CreatePOPage() {
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
            Issue Purchase Order
          </h1>
          <p className="text-sm text-slate-500">
            Generate formal legal purchase order against accepted quotation.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading PO generation form...</div>}>
        <CreatePOForm />
      </Suspense>
    </div>
  );
}
