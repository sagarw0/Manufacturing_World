"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { requirementService } from "@/services/requirementService";
import { biddingService } from "@/services/biddingService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle,
  Gavel,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Award,
  ShoppingCart,
} from "lucide-react";

export default function BidEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const requirementId = params?.requirementId as string;

  const currentOrg = organizationService.getCurrentOrganization();
  const req = requirementService.getRequirementById(requirementId);
  const bids = biddingService.getBidsForRequirement(requirementId);

  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!req) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        Requirement not found.
      </div>
    );
  }

  const handleAcceptBid = (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const result = biddingService.acceptBid(bidId);
      setSuccessMessage(
        `Quotation successfully accepted! Contract awarded to ${result.bid.vendor_org?.display_name}. Full contact details are now unlocked.`
      );
      setTimeout(() => {
        router.push(`/purchase-orders/new?bid_id=${bidId}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to accept bid");
    } finally {
      setAcceptingBidId(null);
    }
  };

  const winningBid = bids.find((b) => b.status === "accepted");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/requirements/${req.id}`}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requirement</span>
        </Link>
        <div className="flex items-center space-x-2">
          <StatusBadge status={req.status} type="requirement" />
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
            Atomic Award Engine
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quotation Comparison & Decision Matrix
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {req.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Volume: {req.quantity} {req.unit} • Delivery Plant: {req.delivery_location}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 block text-[11px]">Total Submissions</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {bids.length} Quotations
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage} Redirecting to PO creation...</span>
          </div>
        )}
      </div>

      {/* If awarded, show winning summary */}
      {winningBid && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-100">
                Awarded Vendor
              </span>
              <h3 className="text-lg font-bold">
                {winningBid.vendor_org?.display_name}
              </h3>
              <p className="text-xs text-emerald-50">
                Contract Total: {formatCurrency(winningBid.total)} • Committed Lead Time: {winningBid.lead_time_days} days
              </p>
            </div>
          </div>

          <Link
            href={`/purchase-orders/new?bid_id=${winningBid.id}`}
            className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>Proceed to Purchase Order</span>
          </Link>
        </div>
      )}

      {/* Side-by-side Comparison Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Vendor Quotations Comparison Table
            </h3>
            <p className="text-xs text-slate-400">
              Evaluate total landed pricing, taxes, lead times and technical compliance.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Privacy Filter: Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Vendor Profile</th>
                <th className="p-4">Quotation Total</th>
                <th className="p-4">Lead Time</th>
                <th className="p-4">Quality & Inspection</th>
                <th className="p-4">Payment Terms</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Award Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bids.map((bid) => {
                const isAccepted = bid.status === "accepted";
                const isRejected = bid.status === "rejected";

                return (
                  <tr
                    key={bid.id}
                    className={`transition-colors ${
                      isAccepted
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {bid.vendor_org?.display_name || "Verified Vendor"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                        {isAccepted ? (
                          <span className="text-emerald-600 font-medium flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Contact Revealed</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium flex items-center space-x-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Contact Masked until Acceptance</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm block">
                        {formatCurrency(bid.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Subtotal: {formatCurrency(bid.subtotal)} + 18% GST
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {bid.lead_time_days} days
                    </td>

                    <td className="p-4 max-w-xs text-slate-600 dark:text-slate-300">
                      <span className="line-clamp-2">
                        {bid.quality_commitments || "Standard QA & CMM"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {bid.payment_terms}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={bid.status} type="bid" />
                    </td>

                    <td className="p-4 text-right">
                      {isAccepted ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Winning Bid</span>
                        </span>
                      ) : isRejected ? (
                        <span className="text-xs text-slate-400">Not Selected</span>
                      ) : (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={acceptingBidId !== null || req.status === "awarded"}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1 ml-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Accept & Award</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
