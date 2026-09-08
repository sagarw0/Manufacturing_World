"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { poService } from "@/services/poService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MaskedContactCard } from "@/components/common/MaskedContactCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  Building,
  Calendar,
  Layers,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();
  const po = poService.getPOById(id);

  const [updating, setUpdating] = useState(false);

  if (!po) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        Purchase Order not found.
      </div>
    );
  }

  const isBuyer = po.buyer_org_id === currentOrg?.id;
  const isVendor = po.vendor_org_id === currentOrg?.id;

  const buyerContact = organizationService.getContact(po.buyer_org_id, currentOrg?.id);
  const vendorContact = organizationService.getContact(po.vendor_org_id, currentOrg?.id);

  const handleStatusTransition = (newStatus: any, notes?: string) => {
    setUpdating(true);
    try {
      poService.updatePOStatus(po.id, newStatus, "33333333-3333-3333-3333-333333333301", notes);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || "Status update failed");
      setUpdating(false);
    }
  };

  const steps = [
    { key: "issued", label: "PO Issued" },
    { key: "vendor_accepted", label: "Vendor Accepted" },
    { key: "in_production", label: "In Production" },
    { key: "dispatched", label: "Dispatched" },
    { key: "delivered", label: "Delivered" },
    { key: "closed", label: "Closed / Completed" },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getStepIndex(po.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:p-0">
      {/* Action Header */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/purchase-orders"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Orders</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PO</span>
          </button>
          <StatusBadge status={po.status} type="po" />
        </div>
      </div>

      {/* Lifecycle Progress Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print:hidden space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Order Fulfillment Progress
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {steps.map((st, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div
                key={st.key}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold"
                    : isCompleted
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 font-medium"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                }`}
              >
                <span className="text-[10px] block opacity-70">Stage 0{idx + 1}</span>
                <span className="text-xs">{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Action Buttons based on Role & Lifecycle Status */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Current Stage: <strong className="text-slate-800 dark:text-slate-200">{po.status.replace(/_/g, " ").toUpperCase()}</strong>
          </span>

          <div className="flex items-center space-x-2">
            {po.status === "issued" && (
              <>
                <button
                  onClick={() => handleStatusTransition("vendor_accepted", "Vendor confirmed manufacturing capacity and accepted PO")}
                  disabled={updating}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept PO & Confirm Schedule</span>
                </button>
                <button
                  onClick={() => handleStatusTransition("vendor_rejected", "Vendor declined PO terms")}
                  disabled={updating}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              </>
            )}

            {po.status === "vendor_accepted" && (
              <button
                onClick={() => handleStatusTransition("in_production", "Raw materials loaded; machining cycle initiated.")}
                disabled={updating}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Start Production / CNC Milling</span>
              </button>
            )}

            {po.status === "in_production" && (
              <button
                onClick={() => handleStatusTransition("dispatched", "Inspected with CMM and dispatched via logistics partner")}
                disabled={updating}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Dispatch Consignment</span>
              </button>
            )}

            {po.status === "dispatched" && (
              <button
                onClick={() => handleStatusTransition("delivered", "Shipment received at dock and verified")}
                disabled={updating}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Confirm Delivery at Plant</span>
              </button>
            )}

            {po.status === "delivered" && (
              <button
                onClick={() => handleStatusTransition("closed", "All deliverables accepted; PO closed and archived.")}
                disabled={updating}
                className="px-4 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Close & Archive PO</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Printable PO Document Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">
              Commercial Purchase Order
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {po.po_number}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Issued Date: {formatDate(po.issued_at || po.created_at)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Total Order Amount
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(po.total)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block">
              All Taxes Included (18% GST)
            </span>
          </div>
        </div>

        {/* Counterparty Contact Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaskedContactCard
            contact={buyerContact}
            orgName={po.buyer_org?.display_name}
            title="Issuer / Billing Buyer Organization"
          />

          <MaskedContactCard
            contact={vendorContact}
            orgName={po.vendor_org?.display_name}
            title="Contractor / Vendor Organization"
          />
        </div>

        {/* Logistics & Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">
              Delivery Site Address
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {po.delivery_address}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block mb-1">
              Scheduled Delivery Date
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {formatDate(po.delivery_date)}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Specification & Description</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Unit Rate</th>
                <th className="p-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(po.items || []).map((it, idx) => (
                <tr key={it.id}>
                  <td className="p-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {it.description}
                  </td>
                  <td className="p-4 font-bold">
                    {it.quantity} {it.unit}
                  </td>
                  <td className="p-4">{formatCurrency(it.unit_price)}</td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(it.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-xs border-t border-slate-200 dark:border-slate-800">
              <tr>
                <td colSpan={4} className="p-4 text-right text-slate-500">
                  Subtotal:
                </td>
                <td className="p-4 text-right">{formatCurrency(po.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="p-4 text-right text-slate-500">
                  GST Tax (18%):
                </td>
                <td className="p-4 text-right">{formatCurrency(po.tax)}</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white">
                <td colSpan={4} className="p-4 text-right">
                  Grand Total:
                </td>
                <td className="p-4 text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(po.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Commercial Terms */}
        <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
          <h4 className="font-bold text-slate-900 dark:text-white">
            Commercial & Quality Terms
          </h4>
          <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg leading-relaxed">
            {po.commercial_terms}
          </p>
        </div>

        {po.notes && (
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <strong>Fulfillment Notes:</strong> {po.notes}
          </div>
        )}
      </div>
    </div>
  );
}
