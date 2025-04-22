// components/InfoItem.tsx
import React from "react";
import { Label } from "@/components/ui/label";

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

export default function InfoItem({ icon, label, children }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center text-sm text-gray-600">
        {icon}
        {label}
      </Label>
      <div className="text-base font-medium text-gray-900">{children}</div>
    </div>
  );
}
