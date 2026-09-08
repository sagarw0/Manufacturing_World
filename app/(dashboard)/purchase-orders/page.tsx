"use client";

import React from "react";
import Link from "next/link";
import { poService } from "@/services/poService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, ArrowRight, Building, Calendar } from "lucide-react";

export default function PurchaseOrdersListPage() {
  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();
  const purchaseOrders = poService.getPurchaseOrders(currentOrg?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Purchase Orders (POs)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official manufacturing contracts, delivery schedules, and fulfillment lifecycle tracking.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {purchaseOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-3">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No purchase orders created yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Purchase orders are automatically generated when a buyer accepts a vendor quotation.
            </p>
            {currentRole === "buyer" && (
              <Link
                href="/requirements"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Review Requirements & Award Bids
              </Link>
            )}
          </div>
        ) : (
          purchaseOrders.map((po) => (
            <div
              key={po.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={po.status} type="po" />
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {po.po_number}
                    </span>
                    <span className="text-xs text-slate-400">
                      Issued {formatDate(po.issued_at || po.created_at)}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <span className="text-slate-400">Buyer:</span> {po.buyer_org?.display_name} •{" "}
                        <span className="text-slate-400">Vendor:</span> {po.vendor_org?.display_name}
                      </span>
                    </p>
                    <p className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduled Delivery: {formatDate(po.delivery_date)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total PO Value</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(po.total)}
                    </span>
                  </div>

                  <Link
                    href={`/purchase-orders/${po.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 mt-2"
                  >
                    <span>Track & Manage PO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
