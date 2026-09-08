import React from "react";
import { ContactInfo } from "@/types";
import { Shield, ShieldAlert, ShieldCheck, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaskedContactCardProps {
  contact: ContactInfo;
  orgName?: string;
  title?: string;
  className?: string;
}

export const MaskedContactCard: React.FC<MaskedContactCardProps> = ({
  contact,
  orgName,
  title = "Organization Contact",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all",
        contact.isMasked
          ? "bg-amber-50/30 border-amber-200/70 dark:bg-amber-950/10 dark:border-amber-900/40"
          : "bg-emerald-50/30 border-emerald-200/70 dark:bg-emerald-950/10 dark:border-emerald-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {orgName || title}
          </h4>
        </div>
        {contact.isMasked ? (
          <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Privacy Masked</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlocked Counterparty</span>
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-slate-500 w-24">Contact Person:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {contact.contact_person}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-mono text-xs">{contact.email}</span>
        </div>

        <div className="flex items-center space-x-3">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-mono text-xs">{contact.phone}</span>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-xs">{contact.address}</span>
        </div>
      </div>

      {contact.isMasked && (
        <div className="mt-4 pt-3 border-t border-amber-200/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Direct contact details are unmasked atomically once a quotation is formally accepted.</span>
        </div>
      )}
    </div>
  );
};
