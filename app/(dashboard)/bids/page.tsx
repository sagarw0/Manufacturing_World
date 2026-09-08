"use client";

import React from "react";
import Link from "next/link";
import { requirementService } from "@/services/requirementService";
import { biddingService } from "@/services/biddingService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Gavel, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BidsIndexPage() {
  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();
  const requirements = requirementService.getRequirements();

  // Bids listing with strict bid isolation built into biddingService
  const bids = requirements.flatMap((req) =>
    biddingService.getBidsForRequirement(req.id, currentOrg?.id).map((b) => ({
      ...b,
      requirement_title: req.title,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentRole === "buyer" ? "Received Quotations & Bids" : "My Submitted Quotations"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentRole === "buyer"
              ? "All active quotations submitted by eligible manufacturing vendors."
              : "Track your engineering proposals, revisions, and contract award status."}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-900">
          <ShieldAlert className="w-4 h-4" />
          <span>Strict Bid Isolation Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {bids.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No quotations found for this organization.
          </div>
        ) : (
          bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={bid.status} type="bid" />
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Version {bid.version}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted on {formatDate(bid.created_at)}
                    </span>
                  </div>

                  <Link
                    href={`/requirements/${bid.requirement_id}`}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                  >
                    {bid.requirement_title}
                  </Link>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Lead Time:</span>{" "}
                      {bid.lead_time_days} calendar days
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Payment:</span>{" "}
                      {bid.payment_terms}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Quotation Value</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(bid.total)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">incl. 18% GST</span>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Link
                      href={`/bids/${bid.id}`}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
