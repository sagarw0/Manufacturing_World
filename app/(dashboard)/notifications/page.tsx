"use client";

import React, { useState } from "react";
import Link from "next/link";
import { organizationService } from "@/services/organizationService";
import { marketplaceStore } from "@/lib/store/mockStore";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCheck, ExternalLink, Award, FileText, ShoppingCart, Gavel } from "lucide-react";

export default function NotificationsPage() {
  const currentOrg = organizationService.getCurrentOrganization();
  const [notifications, setNotifications] = useState(
    marketplaceStore.getNotifications(currentOrg?.id)
  );

  const markAllRead = () => {
    notifications.forEach((n) => marketplaceStore.markNotificationRead(n.id));
    setNotifications([...marketplaceStore.getNotifications(currentOrg?.id)]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "bid_accepted":
        return <Award className="w-5 h-5 text-emerald-600" />;
      case "po_issued":
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case "bid_submitted":
        return <Gavel className="w-5 h-5 text-amber-600" />;
      case "new_requirement":
      default:
        return <FileText className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications & System Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time updates on quotations, contract awards, and purchase orders.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-xl border transition-all flex items-start space-x-4 ${
                n.read_at
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  : "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/60"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-2"
                  >
                    <span>View opportunity details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
