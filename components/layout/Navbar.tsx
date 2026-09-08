"use client";

import React, { useState } from "react";
import Link from "next/link";
import { organizationService } from "@/services/organizationService";
import { Factory, ShieldCheck, UserCheck, Bell, Github, ExternalLink } from "lucide-react";

export const Navbar: React.FC = () => {
  const currentOrg = organizationService.getCurrentOrganization();
  const currentRole = organizationService.getCurrentMemberRole();

  const [selectedUser, setSelectedUser] = useState(
    currentRole === "buyer" ? "buyer" : "vendor1"
  );

  const handleRoleSwitch = (val: string) => {
    setSelectedUser(val);
    if (val === "buyer") {
      organizationService.switchSession(
        "33333333-3333-3333-3333-333333333301",
        "44444444-4444-4444-4444-444444444401"
      );
    } else if (val === "vendor1") {
      organizationService.switchSession(
        "33333333-3333-3333-3333-333333333302",
        "44444444-4444-4444-4444-444444444402"
      );
    } else if (val === "vendor2") {
      organizationService.switchSession(
        "33333333-3333-3333-3333-333333333303",
        "44444444-4444-4444-4444-444444444403"
      );
    }
    // reload to reflect in state
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Manufacturing World
              </span>
              <span className="block text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
                B2B Marketplace & PO Engine
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Persona / Role Quick Switcher for interactive testing */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="px-2 text-slate-500 font-medium hidden sm:inline">Active Persona:</span>
            <select
              value={selectedUser}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium py-1 px-2.5 rounded border-0 focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs"
            >
              <option value="buyer">Apex Mobility (Buyer)</option>
              <option value="vendor1">PrecisionTech Solutions (Vendor - CNC)</option>
              <option value="vendor2">Titan Forge Works (Vendor - Fabrication)</option>
            </select>
          </div>

          {/* Org Status Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-900">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentOrg?.display_name}</span>
          </div>

          <a
            href="https://github.com/akashw088/Manufacturing_world"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            title="GitHub: akashw088/Manufacturing_world"
          >
            <Github className="w-4 h-4" />
            <span className="hidden lg:inline">akashw088</span>
          </a>
        </div>
      </div>
    </header>
  );
};
