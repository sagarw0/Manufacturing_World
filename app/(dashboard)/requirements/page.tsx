"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requirementService } from "@/services/requirementService";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Search, Filter, Calendar, MapPin } from "lucide-react";

export default function RequirementsListPage() {
  const currentRole = organizationService.getCurrentMemberRole();
  const requirements = requirementService.getRequirements();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = requirements.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manufacturing Requirements (RFQs)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentRole === "buyer"
              ? "Publish parts specifications, set tolerances, and receive private vendor quotations."
              : "Explore matching manufacturing requests and submit competitive engineering bids."}
          </p>
        </div>

        {currentRole === "buyer" && (
          <Link
            href="/requirements/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Requirement</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {["all", "published", "evaluation", "awarded", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === st
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No requirements match the selected criteria.
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={req.status} type="requirement" />
                    <span className="text-xs text-slate-500 font-medium">
                      Category: {req.category?.name}
                    </span>
                  </div>

                  <Link
                    href={`/requirements/${req.id}`}
                    className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                  >
                    {req.title}
                  </Link>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-3xl">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.delivery_location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Required By: {formatDate(req.required_by_date)}</span>
                    </span>
                    <span className="text-slate-400">
                      Deadline: {new Date(req.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Volume</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {req.quantity} {req.unit}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/requirements/${req.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Details
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
