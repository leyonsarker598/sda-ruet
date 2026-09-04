"use client";

import * as React from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveProfilePositionsAction } from "@/actions/profile";
import type { ProfilePositionItem } from "@/services/profileService";

interface PositionsFormProps {
  initialPositions?: ProfilePositionItem[];
}

export function PositionsForm({ initialPositions = [] }: PositionsFormProps) {
  const [positions, setPositions] = React.useState<ProfilePositionItem[]>(initialPositions);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);

  const addPosition = () => {
    const newItem: ProfilePositionItem = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: "",
      organization: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      image_url: "",
    };
    setPositions((prev) => [...prev, newItem]);
  };

  const removePosition = (index: number) => {
    setPositions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof ProfilePositionItem, value: any) => {
    setPositions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Validate that if items exist, they have title and organization
    for (let i = 0; i < positions.length; i++) {
      const item = positions[i];
      if (!item.title.trim()) {
        setMessage({ text: `Position #${i + 1} must have a title/designation.`, isError: true });
        setIsSaving(false);
        return;
      }
      if (!item.organization.trim()) {
        setMessage({ text: `Position #${i + 1} must have an organization name.`, isError: true });
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await saveProfilePositionsAction(positions);
      if (res.error) {
        setMessage({ text: res.error, isError: true });
      } else {
        setMessage({ text: res.message || "Positions saved successfully!" });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage({ text: "Failed to save positions. Please check your connection.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.isError ? "destructive" : "success"}>
          {message.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#7B2D26]" />
            Career &amp; Association Positions
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Add all your current and previous professional roles, company designations, and association leadership offices.
          </p>
        </div>

        <Button
          type="button"
          onClick={addPosition}
          size="sm"
          className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Position
        </Button>
      </div>

      {positions.length === 0 ? (
        <div className="bg-[#FAF5F5]/60 border border-dashed border-[#DFCEB5] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mx-auto shadow-2xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#0F172A]">No Positions Listed</div>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Highlight your professional journey and association offices. Add your current employer, previous companies, or executive committee roles.
            </p>
          </div>
          <Button
            type="button"
            onClick={addPosition}
            size="sm"
            variant="outline"
            className="text-xs font-semibold border-[#DFCEB5]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Position
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map((pos, idx) => (
            <div
              key={pos.id || idx}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-2xs space-y-4 relative group"
            >
              {/* Card Header & Remove Action */}
              <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
                <span className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] inline-flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  Position Details
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePosition(idx)}
                  className="text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C] h-7 px-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <Label htmlFor={`pos-title-${idx}`} required className="text-xs font-semibold text-[#0F172A]">
                    Designation / Title
                  </Label>
                  <Input
                    id={`pos-title-${idx}`}
                    value={pos.title}
                    onChange={(e) => updateField(idx, "title", e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Ex-President"
                    required
                    className="mt-1 text-xs"
                  />
                </div>

                {/* Organization */}
                <div>
                  <Label htmlFor={`pos-org-${idx}`} required className="text-xs font-semibold text-[#0F172A]">
                    Organization / Company
                  </Label>
                  <Input
                    id={`pos-org-${idx}`}
                    value={pos.organization}
                    onChange={(e) => updateField(idx, "organization", e.target.value)}
                    placeholder="e.g. Google LLC, SDA RUET"
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Dates & Current Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`pos-start-${idx}`} className="text-xs font-semibold text-[#0F172A]">
                    Start Date / Year
                  </Label>
                  <Input
                    id={`pos-start-${idx}`}
                    value={pos.start_date || ""}
                    onChange={(e) => updateField(idx, "start_date", e.target.value)}
                    placeholder="e.g. Jan 2021 or 2021"
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor={`pos-end-${idx}`} className="text-xs font-semibold text-[#0F172A]">
                    End Date / Year
                  </Label>
                  <Input
                    id={`pos-end-${idx}`}
                    value={pos.end_date || ""}
                    onChange={(e) => updateField(idx, "end_date", e.target.value)}
                    placeholder="e.g. Dec 2023 or Present"
                    disabled={pos.is_current}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`pos-current-${idx}`}
                  checked={Boolean(pos.is_current)}
                  onChange={(e) => updateField(idx, "is_current", e.target.checked)}
                  className="rounded border-[#DFCEB5] text-[#7B2D26] focus:ring-[#7B2D26]"
                />
                <label htmlFor={`pos-current-${idx}`} className="text-xs font-semibold text-[#0F172A] cursor-pointer">
                  I am currently working / serving in this position
                </label>
              </div>

              {/* Image URL with live preview */}
              <div>
                <Label htmlFor={`pos-img-${idx}`} className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
                  Organization Logo / Photo Link (Optional)
                </Label>
                <Input
                  id={`pos-img-${idx}`}
                  value={pos.image_url || ""}
                  onChange={(e) => updateField(idx, "image_url", e.target.value)}
                  placeholder="https://... direct image link"
                  className="mt-1 text-xs"
                />
                {pos.image_url && pos.image_url.trim() && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-[#FAF5F5] rounded-xl border border-[#E6C9C7]">
                    <div className="w-16 h-12 rounded-lg bg-white overflow-hidden border border-[#E8E2D9] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pos.image_url.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#64748B]">
                      Image preview loaded successfully.
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor={`pos-desc-${idx}`} className="text-xs font-semibold text-[#0F172A]">
                  Role Highlights &amp; Responsibilities (Optional)
                </Label>
                <Textarea
                  id={`pos-desc-${idx}`}
                  value={pos.description || ""}
                  onChange={(e) => updateField(idx, "description", e.target.value)}
                  placeholder="Describe your core accomplishments, projects, or leadership responsibilities..."
                  rows={3}
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
        <Button
          type="button"
          onClick={addPosition}
          size="sm"
          variant="outline"
          className="text-xs font-semibold border-[#DFCEB5]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Another Position
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold shadow-xs"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSaving ? "Saving Positions..." : "Save All Positions"}
        </Button>
      </div>
    </form>
  );
}
