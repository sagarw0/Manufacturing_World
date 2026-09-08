"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { organizationService } from "@/services/organizationService";
import {
  LayoutDashboard,
  FileText,
  Gavel,
  ShoppingCart,
  Cpu,
  ShieldAlert,
  PlusCircle,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const currentRole = organizationService.getCurrentMemberRole();

  const navItems = [
    {
      name: "Dashboard & Market",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Requirements (RFQs)",
      href: "/requirements",
      icon: FileText,
      badge: currentRole === "buyer" ? "Create / Manage" : "Eligible Leads",
    },
    {
      name: "Bids & Quotations",
      href: "/bids",
      icon: Gavel,
      badge: currentRole === "vendor" ? "My Bids" : "Review",
    },
    {
      name: "Purchase Orders",
      href: "/purchase-orders",
      icon: ShoppingCart,
      badge: "Lifecycle",
    },
    {
      name: "Vendor Capabilities",
      href: "/organizations/capabilities",
      icon: Cpu,
      badge: "Machines & Tech",
    },
    {
      name: "Admin & Audit Trail",
      href: "/admin",
      icon: ShieldAlert,
      badge: "Compliance",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="space-y-6">
        {currentRole === "buyer" && (
          <Link
            href="/requirements/new"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition-all shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Requirement</span>
          </Link>
        )}

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Core Modules
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold mb-1">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Role Permissions</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          {currentRole === "buyer"
            ? "Buyer mode: Can create requirements, evaluate bids, award contracts and issue formal POs."
            : "Vendor mode: Can register shop machinery, browse eligible requirements, and submit isolated bids."}
        </p>
      </div>
    </aside>
  );
};
