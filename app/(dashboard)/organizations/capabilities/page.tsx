"use client";

import React, { useState } from "react";
import { organizationService } from "@/services/organizationService";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Factory,
  Cpu,
  Users,
  Award,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  Building2,
  Wrench,
} from "lucide-react";

export default function CapabilitiesPage() {
  const currentOrg = organizationService.getCurrentOrganization();
  const facilities = organizationService.getFacilities();
  const machines = organizationService.getMachines();
  const workforce = organizationService.getWorkforce();
  const certifications = organizationService.getCertifications();
  const technologies = organizationService.getTechnologies();

  const [activeTab, setActiveTab] = useState<"machinery" | "technologies" | "facilities" | "workforce" | "certifications">("machinery");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manufacturing Capabilities & Plant Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showcase machine specifications, processes, skilled workforce, and quality certifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile Verified</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { key: "machinery", label: `Machinery (${machines.length})`, icon: Wrench },
          { key: "technologies", label: `Processes & Tech (${technologies.length})`, icon: Cpu },
          { key: "facilities", label: `Plants / Facilities (${facilities.length})`, icon: Factory },
          { key: "workforce", label: `Workforce (${workforce.length})`, icon: Users },
          { key: "certifications", label: `Certifications (${certifications.length})`, icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Machinery Tab */}
      {activeTab === "machinery" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {m.machine_type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {m.make} {m.model}
                    </h3>
                  </div>
                  <StatusBadge status={m.status} type="default" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Quantity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {m.quantity} Units
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Year of Make</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.year_of_manufacture || "2022"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Capacity & Accuracy</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {m.capacity}
                    </span>
                  </div>
                  {m.certifications && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Compliance Standards</span>
                      <span className="font-mono text-[11px] text-emerald-600">
                        {m.certifications}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies Tab */}
      {activeTab === "technologies" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {t.technology?.category || "Manufacturing"}
                </span>
                <span className="text-xs font-bold uppercase text-emerald-600">
                  {t.proficiency}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t.technology?.name}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.technology?.description}
              </p>

              {t.notes && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>Notes:</strong> {t.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === "facilities" && (
        <div className="space-y-4">
          {facilities.map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {f.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.address}, {f.city}, {f.state}</span>
                  </p>
                </div>
                <StatusBadge status={f.status} type="default" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Floor Area</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {f.area_sqft?.toLocaleString()} Sq. Ft.
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Monthly Capacity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {f.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Operating Shifts</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {f.operating_hours}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workforce Tab */}
      {activeTab === "workforce" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Department / Skill Category</th>
                <th className="p-4">Certified Headcount</th>
                <th className="p-4">Average Experience</th>
                <th className="p-4">Key Certifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {workforce.map((w) => (
                <tr key={w.id}>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {w.skill_category}
                  </td>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">
                    {w.headcount} Engineers / Operators
                  </td>
                  <td className="p-4">{w.experience_band}</td>
                  <td className="p-4 font-mono text-slate-500">{w.certifications || "Standard"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === "certifications" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                  {c.issuing_agency}
                </span>
                <StatusBadge status={c.status} type="default" />
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {c.name}
              </h4>
              <p className="text-xs font-mono text-slate-500">
                Certificate No: {c.certificate_no}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                Valid from: <strong>{c.valid_from}</strong> to <strong>{c.valid_to || "Indefinite"}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
