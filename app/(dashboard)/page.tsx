"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { organizationService } from "@/services/organizationService";
import { requirementService } from "@/services/requirementService";
import { biddingService } from "@/services/biddingService";
import { poService } from "@/services/poService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  Gavel,
  ShoppingCart,
  Building2,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Calendar,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();

  const requirements = requirementService.getRequirements();
  const purchaseOrders = poService.getPurchaseOrders();

  // For bids: if buyer, aggregate bids across all requirements; if vendor, get only own bids
  const allBids = requirements.flatMap((r) =>
    biddingService.getBidsForRequirement(r.id)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Top Organization Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentOrg?.display_name}
            </h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Organization</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {currentOrg?.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {currentRole === "buyer" ? (
            <Link
              href="/requirements/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Requirement</span>
            </Link>
          ) : (
            <Link
              href="/requirements"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all shadow-blue-500/20"
            >
              <Gavel className="w-4 h-4" />
              <span>Browse Opportunities</span>
            </Link>
          )}
          <Link
            href="/organizations/capabilities"
            className="inline-flex items-center space-x-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Profile & Machinery</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Requirements
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {requirements.length}
            </span>
            <span className="text-xs text-slate-500">active RFQs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quotation Bids
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {allBids.length}
            </span>
            <span className="text-xs text-slate-500">
              {currentRole === "buyer" ? "submitted by vendors" : "my submitted bids"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Purchase Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {purchaseOrders.length}
            </span>
            <span className="text-xs text-slate-500">issued / in production</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Data Masking Privacy
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Active & Enforced
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Contacts shielded until bid award
          </p>
        </div>
      </div>

      {/* Main Content Area: Requirements & Active Workflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentRole === "buyer" ? "My Published Requirements" : "Eligible Requirements & RFQs"}
            </h2>
            <p className="text-xs text-slate-500">
              {currentRole === "buyer"
                ? "Manage RFQ stages, track incoming quotations and evaluate bids"
                : "Manufacturing requests matching your facilities, machinery and process capabilities"}
            </p>
          </div>
          <Link
            href="/requirements"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requirements.map((req) => {
            const reqBids = biddingService.getBidsForRequirement(req.id);
            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <StatusBadge status={req.status} type="requirement" />
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {req.category?.name || "Machining"}
                      </span>
                    </div>
                    <Link
                      href={`/requirements/${req.id}`}
                      className="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                    >
                      {req.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-3xl">
                      {req.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Quantity</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {req.quantity} {req.unit}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {currentRole === "buyer" ? (
                        <Link
                          href={`/evaluation/${req.id}`}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Compare Bids ({reqBids.length})
                        </Link>
                      ) : (
                        <Link
                          href={`/requirements/${req.id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Submit Quotation
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Required By: {formatDate(req.required_by_date)}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.items?.length || 0} line specifications</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Bidding Deadline: {new Date(req.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
