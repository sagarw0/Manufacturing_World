"use client";

import React, { useState } from "react";
import { organizationService } from "@/services/organizationService";
import { marketplaceStore } from "@/lib/store/mockStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { ShieldCheck, CheckCircle, Clock, Building2, ShieldAlert, History } from "lucide-react";

export default function AdminPage() {
  const orgs = organizationService.getOrganizations();
  const auditLogs = marketplaceStore.getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Super Admin & Platform Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organization moderation, dispute verification, and immutable security audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Governance Active</span>
          </span>
        </div>
      </div>

      {/* Organizations Directory & Moderation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Registered Organizations & Verification Status
            </h3>
            <p className="text-xs text-slate-400">
              Review company registration, GSTIN, and manufacturing capability credentials.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {orgs.length} Entities Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Organization Name</th>
                <th className="p-4">Business Category</th>
                <th className="p-4">Type</th>
                <th className="p-4">Tax ID / GSTIN</th>
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {org.display_name}
                    <span className="block text-[11px] font-normal text-slate-400">
                      {org.legal_name}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {org.business_category}
                  </td>
                  <td className="p-4 capitalize font-semibold text-slate-700 dark:text-slate-300">
                    {org.org_type.replace(/_/g, " ")}
                  </td>
                  <td className="p-4 font-mono text-slate-500">{org.tax_id || "N/A"}</td>
                  <td className="p-4">
                    <StatusBadge status={org.verification_status} type="org" />
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-xs transition-colors">
                      Audit Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Immutable Activity & Security Audit Log
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Append-only cryptographic record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-4 text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                    {log.action}
                  </td>
                  <td className="p-4 uppercase text-slate-600 dark:text-slate-400">
                    {log.entity_type}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {log.actor?.full_name || "System Automated"}
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
