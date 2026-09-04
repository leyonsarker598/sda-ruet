"use client";

import * as React from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveProfileActivitiesAction } from "@/actions/profile";
import type { ProfileActivityItem } from "@/services/profileService";

interface ActivitiesFormProps {
  initialActivities?: ProfileActivityItem[];
}

export function ActivitiesForm({ initialActivities = [] }: ActivitiesFormProps) {
  const [activities, setActivities] = React.useState<ProfileActivityItem[]>(initialActivities);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);

  const addActivity = () => {
    const newItem: ProfileActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: "",
      description: "",
      image_url: "",
      date: "",
    };
    setActivities((prev) => [...prev, newItem]);
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof ProfileActivityItem, value: string) => {
    setActivities((prev) => {
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

    // Validate that if items exist, they have title and description
    for (let i = 0; i < activities.length; i++) {
      const item = activities[i];
      if (!item.title.trim()) {
        setMessage({ text: `Activity #${i + 1} must have a title.`, isError: true });
        setIsSaving(false);
        return;
      }
      if (!item.description.trim()) {
        setMessage({ text: `Activity #${i + 1} must have a description.`, isError: true });
        setIsSaving(false);
        return;
      }
    }

    try {
      const res = await saveProfileActivitiesAction(activities);
      if (res.error) {
        setMessage({ text: res.error, isError: true });
      } else {
        setMessage({ text: res.message || "Activities saved successfully!" });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch {
      setMessage({ text: "Failed to save activities. Please check your connection.", isError: true });
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

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#DFCEB5] flex items-center justify-center text-[#7B2D26]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">Extracurricular &amp; Association Activities</div>
            <div className="text-xs text-[#64748B]">
              Showcase club leadership, volunteer services, cultural organizing, workshops, or sports involvement.
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={addActivity}
          size="sm"
          className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add New Activity
        </Button>
      </div>

      {/* Dynamic Activities List */}
      {activities.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-[#E8E2D9] bg-[#FBF9F5] p-6 space-y-3">
          <Activity className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="font-bold text-sm text-[#0F172A]">No Activities Added Yet</div>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Document your community contributions, student projects, association events, and leadership initiatives.
          </p>
          <Button
            type="button"
            onClick={addActivity}
            variant="outline"
            size="sm"
            className="text-xs text-[#7B2D26] border-[#DFCEB5]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Activity
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((item, index) => (
            <div
              key={item.id || index}
              className="p-5 rounded-2xl border border-[#E8E2D9] bg-white shadow-2xs space-y-4 relative hover:border-[#DFCEB5] transition-all"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between border-b border-[#F1ECE4] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] font-mono text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    {item.title ? item.title : "New Activity Entry"}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={() => removeActivity(index)}
                  variant="ghost"
                  size="xs"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Remove this activity"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>

              {/* Title and Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor={`act_title_${index}`} required>
                    Activity / Role Title
                  </Label>
                  <Input
                    id={`act_title_${index}`}
                    value={item.title}
                    onChange={(e) => updateField(index, "title", e.target.value)}
                    placeholder="e.g. Lead Organizer - Sirajganj Cultural Gala 2024"
                    required
                    className="text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor={`act_date_${index}`}>Tenure / Date (Optional)</Label>
                  <Input
                    id={`act_date_${index}`}
                    value={item.date || ""}
                    onChange={(e) => updateField(index, "date", e.target.value)}
                    placeholder="e.g. 2023–2024, Summer 2024"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Image URL with live thumbnail preview */}
              <div>
                <Label htmlFor={`act_img_${index}`}>Image URL Link (Optional / Event Photo)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-1 items-start">
                  <div className="sm:col-span-3">
                    <Input
                      id={`act_img_${index}`}
                      value={item.image_url || ""}
                      onChange={(e) => updateField(index, "image_url", e.target.value)}
                      placeholder="https://example.com/event-or-workshop.jpg"
                      className="text-xs font-mono"
                    />
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Direct image link to your field photo, workshop picture, or banner.
                    </span>
                  </div>

                  {item.image_url && (
                    <div className="w-full h-20 rounded-xl border border-[#E8E2D9] overflow-hidden bg-[#FAF5F5] flex items-center justify-center relative shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.title || "Activity preview"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor={`act_desc_${index}`} required>
                  Description &amp; Key Highlights
                </Label>
                <Textarea
                  id={`act_desc_${index}`}
                  value={item.description}
                  onChange={(e) => updateField(index, "description", e.target.value)}
                  placeholder="Describe your responsibilities, the impact of the initiative, or event outcomes..."
                  rows={2}
                  required
                  className="text-xs"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              onClick={addActivity}
              variant="outline"
              size="sm"
              className="text-xs text-[#7B2D26] border-[#DFCEB5]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Another Activity
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold text-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving Activities..." : "Save All Activities"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
