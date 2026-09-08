"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { biddingService } from "@/services/biddingService";
import { requirementService } from "@/services/requirementService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MaskedContactCard } from "@/components/common/MaskedContactCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, ShoppingCart } from "lucide-react";

export default function BidDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const currentOrg = organizationService.getCurrentOrganization();

  const bid = biddingService.getBidById(id, currentOrg?.id);
  const req = bid ? requirementService.getRequirementById(bid.requirement_id) : null;

  if (!bid || !req) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        <p>Quotation not found or you are not authorized to view this isolated bid.</p>
        <Link href="/bids" className="text-blue-600 hover:underline text-xs mt-3 inline-block">
          Return to Bids
        </Link>
      </div>
    );
  }

  const isBuyer = req.buyer_org_id === currentOrg?.id;
  const targetOrgId = isBuyer ? bid.vendor_org_id : req.buyer_org_id;
  const counterpartyContact = organizationService.getContact(targetOrgId, currentOrg?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/bids"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
        <StatusBadge status={bid.status} type="bid" />
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Quotation #{bid.id.slice(0, 8)} • Version {bid.version}
          </span>
          <span className="text-xs text-slate-400">
            Valid until: {formatDate(bid.validity_date)}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Quotation for: {req.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(bid.subtotal)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Taxes (18% GST)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(bid.tax)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Bid Amount</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              {formatCurrency(bid.total)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Committed Lead Time</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {bid.lead_time_days} Days
            </span>
          </div>
        </div>
      </div>

      {/* Counterparty Privacy Card */}
      <MaskedContactCard
        contact={counterpartyContact}
        orgName={isBuyer ? bid.vendor_org?.display_name : req.buyer_org?.display_name}
        title={isBuyer ? "Vendor Contact Information" : "Buyer Contact Information"}
      />

      {/* Items Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Itemized Pricing Breakdown
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Item Description</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Unit Rate</th>
              <th className="p-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(bid.items || []).map((bi) => (
              <tr key={bi.id}>
                <td className="p-4">
                  <span className="font-medium text-slate-900 dark:text-white block">
                    {bi.requirement_item?.item_name || "Custom Manufacturing"}
                  </span>
                  <span className="text-[11px] text-slate-400">{bi.remarks}</span>
                </td>
                <td className="p-4">{bi.quantity} Nos</td>
                <td className="p-4">{formatCurrency(bi.unit_price)}</td>
                <td className="p-4 text-right font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(bi.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commercial Terms & Commitments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Technical Commitments & Terms
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Payment & Logistics Terms
            </span>
            <p className="text-slate-500 leading-relaxed">
              {bid.payment_terms} • {bid.delivery_terms || "Standard delivery"}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Quality & Inspection Commitments
            </span>
            <p className="text-slate-500 leading-relaxed">
              {bid.quality_commitments || "Complete CMM & MTC documentation provided."}
            </p>
          </div>
        </div>

        {bid.notes && (
          <div className="text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Notes:</span> {bid.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      {isBuyer && bid.status === "accepted" && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>This quotation has been officially awarded and accepted.</span>
          </div>
          <Link
            href={`/purchase-orders/new?bid_id=${bid.id}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Issue Purchase Order</span>
          </Link>
        </div>
      )}
    </div>
  );
}
