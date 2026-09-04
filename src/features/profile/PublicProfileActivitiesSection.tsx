"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Plus,
  Edit3,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveProfileActivitiesAction } from "@/actions/profile";
import type { ProfileActivityItem } from "@/services/profileService";

interface PublicProfileActivitiesSectionProps {
  initialActivities?: ProfileActivityItem[];
  isOwner: boolean;
  profileId: string;
}

export function PublicProfileActivitiesSection({
  initialActivities = [],
  isOwner,
  profileId,
}: PublicProfileActivitiesSectionProps) {
  const [activities, setActivities] = React.useState<ProfileActivityItem[]>(initialActivities);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);

  // Form states for Quick Add
  const [newTitle, setNewTitle] = React.useState("");
  const [newDate, setNewDate] = React.useState("");
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Manage Modal working copy
  const [manageList, setManageList] = React.useState<ProfileActivityItem[]>([]);

  const handleOpenAdd = () => {
    setNewTitle("");
    setNewDate("");
    setNewImageUrl("");
    setNewDescription("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsAddModalOpen(true);
  };

  const handleOpenManage = () => {
    setManageList(JSON.parse(JSON.stringify(activities)));
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsManageModalOpen(true);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("Please enter an activity title.");
      return;
    }
    if (!newDescription.trim()) {
      setErrorMsg("Please enter a description for your activity.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const newItem: ProfileActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      image_url: newImageUrl.trim() || null,
      date: newDate.trim() || null,
    };

    const updatedList = [newItem, ...activities];

    try {
      const res = await saveProfileActivitiesAction(updatedList);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setActivities(updatedList);
        setIsAddModalOpen(false);
        setSuccessMsg("Activity added successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch {
      setErrorMsg("Failed to save activity. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSave = async () => {
    for (let i = 0; i < manageList.length; i++) {
      if (!manageList[i].title.trim() || !manageList[i].description.trim()) {
        setErrorMsg(`Item #${i + 1} must have a title and description.`);
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await saveProfileActivitiesAction(manageList);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setActivities(manageList);
        setIsManageModalOpen(false);
        setSuccessMsg("Activities updated successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch {
      setErrorMsg("Failed to update activities.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successMsg && (
        <Alert variant="success" className="animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Section Header with CMS & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Extracurricular &amp; Association Activities
              </h2>
              <Badge variant="secondary" size="sm" className="font-mono text-xs">
                {activities.length}
              </Badge>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Clubs, leadership initiatives, volunteer roles, and community projects.
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={handleOpenAdd}
              size="xs"
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
            </Button>

            <Button
              type="button"
              onClick={handleOpenManage}
              size="xs"
              variant="outline"
              className="text-xs text-[#7B2D26] border-[#DFCEB5] hover:bg-[#FAF5F5]"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Manage All
            </Button>

            <Button asChild size="xs" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
              <Link href="/profile?tab=activities" title="Open Full CMS">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Activities Card Grid */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5F5] border border-[#DFCEB5] flex items-center justify-center text-[#7B2D26] mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-[#0F172A]">No Extracurricular Activities Listed Yet</div>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            {isOwner
              ? "Share your club leadership, voluntary initiatives, organizing experiences, or community service."
              : "This member has not published any activities yet."}
          </p>
          {isOwner && (
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleOpenAdd}
                size="sm"
                className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Your First Activity
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activities.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-2xs flex flex-col justify-between hover:border-[#DFCEB5] transition-all group"
            >
              {item.image_url && (
                <div className="w-full h-44 bg-[#FAF5F5] relative overflow-hidden border-b border-[#F1ECE4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A] leading-snug">
                    {item.title}
                  </h3>
                  {item.date && (
                    <Badge variant="secondary" size="sm" className="shrink-0 text-[10px]">
                      {item.date}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Quick Add Activity */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Activity"
        description="Add club involvement, volunteer leadership, or event organization to your profile."
        size="lg"
      >
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="quick_act_title" required>
                Activity / Role Title
              </Label>
              <Input
                id="quick_act_title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Lead Organizer - Sirajganj Cultural Gala 2024"
                required
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label htmlFor="quick_act_date">Tenure / Date (Optional)</Label>
              <Input
                id="quick_act_date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="e.g. 2024–2025, Summer 2024"
                className="text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quick_act_image">Image URL Link (Optional Event Photo)</Label>
            <Input
              id="quick_act_image"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/event-photo.jpg"
              className="text-xs font-mono mt-1"
            />
            {newImageUrl && (
              <div className="mt-2 w-full h-28 rounded-xl border border-[#E8E2D9] overflow-hidden bg-[#FAF5F5] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={newImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="quick_act_desc" required>
              Description &amp; Key Highlights
            </Label>
            <Textarea
              id="quick_act_desc"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe your responsibilities, the impact of the initiative, or event outcomes..."
              rows={3}
              required
              className="text-xs mt-1"
            />
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Saving..." : "Save Activity"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal 2: Manage All Activities */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Extracurricular Activities"
        description="Edit, remove, or organize all your listed activities."
        size="xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {manageList.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#64748B]">
              No activities to manage. Click &quot;Add Activity&quot; above to create one.
            </div>
          ) : (
            manageList.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF9F5] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0F172A]">
                    #{index + 1} {item.title || "Untitled Entry"}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setManageList((prev) => prev.filter((_, i) => i !== index))}
                    size="xs"
                    variant="ghost"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...manageList];
                        updated[index].title = e.target.value;
                        setManageList(updated);
                      }}
                      className="text-xs mt-0.5 bg-white"
                      placeholder="Title"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Tenure / Date</Label>
                    <Input
                      value={item.date || ""}
                      onChange={(e) => {
                        const updated = [...manageList];
                        updated[index].date = e.target.value;
                        setManageList(updated);
                      }}
                      className="text-xs mt-0.5 bg-white"
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px]">Image Link URL</Label>
                  <Input
                    value={item.image_url || ""}
                    onChange={(e) => {
                      const updated = [...manageList];
                      updated[index].image_url = e.target.value;
                      setManageList(updated);
                    }}
                    className="text-xs font-mono mt-0.5 bg-white"
                    placeholder="https://example.com/event-photo.jpg"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...manageList];
                      updated[index].description = e.target.value;
                      setManageList(updated);
                    }}
                    className="text-xs mt-0.5 bg-white"
                    rows={2}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              onClick={() =>
                setManageList((prev) => [
                  ...prev,
                  {
                    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    title: "",
                    description: "",
                    image_url: "",
                    date: "",
                  },
                ])
              }
              variant="outline"
              size="xs"
              className="text-xs text-[#7B2D26] border-[#DFCEB5]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Another
            </Button>

            <Link
              href="/profile?tab=activities"
              className="text-xs text-[#64748B] hover:text-[#7B2D26] flex items-center gap-1 font-semibold"
            >
              Open Full Dashboard CMS <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsManageModalOpen(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleManageSave}
            size="sm"
            className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Saving Changes..." : "Save All Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
