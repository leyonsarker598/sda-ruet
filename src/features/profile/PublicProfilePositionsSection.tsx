"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Building2,
  Calendar,
  MapPin,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveProfilePositionsAction } from "@/actions/profile";
import type { ProfilePositionItem } from "@/services/profileService";

interface ExtendedPositionItem extends ProfilePositionItem {
  location?: string | null;
  employment_type?: string | null;
}

interface PublicProfilePositionsSectionProps {
  initialPositions?: ExtendedPositionItem[];
  isOwner: boolean;
  profileId: string;
}

export function PublicProfilePositionsSection({
  initialPositions = [],
  isOwner,
  profileId,
}: PublicProfilePositionsSectionProps) {
  const [positions, setPositions] = React.useState<ExtendedPositionItem[]>(initialPositions);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);

  // Form states for Quick Add
  const [newTitle, setNewTitle] = React.useState("");
  const [newOrg, setNewOrg] = React.useState("");
  const [newLocation, setNewLocation] = React.useState("");
  const [newEmpType, setNewEmpType] = React.useState("Full-time");
  const [newStartDate, setNewStartDate] = React.useState("");
  const [newEndDate, setNewEndDate] = React.useState("");
  const [newIsCurrent, setNewIsCurrent] = React.useState(false);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Manage Modal working copy
  const [manageList, setManageList] = React.useState<ExtendedPositionItem[]>([]);

  const handleOpenAdd = () => {
    setNewTitle("");
    setNewOrg("");
    setNewLocation("");
    setNewEmpType("Full-time");
    setNewStartDate("");
    setNewEndDate("");
    setNewIsCurrent(false);
    setNewImageUrl("");
    setNewDescription("");
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleOpenManage = () => {
    setManageList(JSON.parse(JSON.stringify(positions)));
    setErrorMsg(null);
    setIsManageModalOpen(true);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("Please enter a position/designation title.");
      return;
    }
    if (!newOrg.trim()) {
      setErrorMsg("Please enter an organization or company name.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const newItem: ExtendedPositionItem = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      location: newLocation.trim() || null,
      employment_type: newEmpType.trim() || null,
      start_date: newStartDate.trim() || null,
      end_date: newIsCurrent ? null : (newEndDate.trim() || null),
      is_current: newIsCurrent,
      image_url: newImageUrl.trim() || null,
      description: newDescription.trim() || null,
    };

    const updatedList = [newItem, ...positions];

    try {
      const res = await saveProfilePositionsAction(updatedList);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setPositions(updatedList);
        setIsAddModalOpen(false);
      }
    } catch {
      setErrorMsg("Failed to save position. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSave = async () => {
    for (let i = 0; i < manageList.length; i++) {
      if (!manageList[i].title.trim()) {
        setErrorMsg(`Position #${i + 1} must have a title.`);
        return;
      }
      if (!manageList[i].organization.trim()) {
        setErrorMsg(`Position #${i + 1} must have an organization.`);
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await saveProfilePositionsAction(manageList);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setPositions(manageList);
        setIsManageModalOpen(false);
      }
    } catch {
      setErrorMsg("Failed to update positions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteManageItem = (idx: number) => {
    setManageList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateManageItem = (idx: number, field: keyof ExtendedPositionItem, val: any) => {
    setManageList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE6] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              Experience &amp; Positions
              {positions.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]">
                  {positions.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#64748B]">
              Career history, institutional designations, and association leadership roles.
            </p>
          </div>
        </div>

        {/* Owner Action Buttons */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="xs"
              onClick={handleOpenAdd}
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Position
            </Button>
            {positions.length > 0 && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={handleOpenManage}
                className="text-xs font-semibold border-[#DFCEB5] hover:bg-[#FAF5F5]"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Manage
              </Button>
            )}
            <Button asChild size="xs" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
              <Link href="/profile?tab=positions" title="Open Full CMS">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* LinkedIn Format Timeline Experience List */}
      {positions.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#0F172A]">No Experience Listed</div>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              {isOwner
                ? "Add your current employment, previous roles, or association executive designations to showcase your background."
                : "This member has not listed any experience or positions yet."}
            </p>
          </div>
          {isOwner && (
            <Button
              type="button"
              size="sm"
              onClick={handleOpenAdd}
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold mt-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Position
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6 relative">
          {positions.map((pos, idx) => {
            const hasNext = idx < positions.length - 1;
            return (
              <div key={pos.id || idx} className="relative flex items-start gap-4 sm:gap-5 group">
                {/* Left Logo / Avatar with Timeline Connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAF5F5] border-2 border-[#E8E2D9] overflow-hidden flex items-center justify-center text-[#7B2D26] shadow-2xs group-hover:border-[#7B2D26] transition-colors shrink-0">
                    {pos.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pos.image_url}
                        alt={pos.organization}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#7B2D26]" />
                    )}
                  </div>

                  {/* Vertical Timeline Connector Line */}
                  {hasNext && (
                    <div className="w-0.5 bg-[#E8E2D9] my-2 min-h-[40px] flex-1" />
                  )}
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-1.5 pb-6 border-b border-[#F5F2EC] last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[#0F172A] font-heading leading-snug">
                      {pos.title}
                    </h3>
                    {pos.is_current && (
                      <Badge variant="success" size="sm" dot className="text-[10px]">
                        Present Role
                      </Badge>
                    )}
                  </div>

                  {/* Organization & Employment Type */}
                  <div className="text-xs sm:text-sm font-semibold text-[#7B2D26] flex items-center gap-2">
                    <span>{pos.organization}</span>
                    {pos.employment_type && (
                      <>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="text-xs font-normal text-[#64748B]">{pos.employment_type}</span>
                      </>
                    )}
                  </div>

                  {/* Dates & Duration */}
                  {(pos.start_date || pos.is_current) && (
                    <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>
                        {pos.start_date || "Joined"} – {pos.is_current ? "Present" : (pos.end_date || "Completed")}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {pos.location && (
                    <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{pos.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  {pos.description && (
                    <div className="pt-2">
                      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line bg-[#FAF5F5]/40 rounded-xl p-3 border border-[#F0ECE6]">
                        {pos.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Quick Add Position (LinkedIn Style) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Experience / Position"
        description="Share a current role, previous job, or leadership designation in LinkedIn format."
        size="default"
      >
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="pos-title" required className="text-xs">
              Title / Designation
            </Label>
            <Input
              id="pos-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Assistant Professor, Ex-President"
              required
              className="text-xs mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pos-org" required className="text-xs">
              Company / Organization
            </Label>
            <Input
              id="pos-org"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="e.g. Google, RUET, Sirajganj District Association RUET"
              required
              className="text-xs mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pos-emp" className="text-xs">
                Employment Type
              </Label>
              <select
                id="pos-emp"
                value={newEmpType}
                onChange={(e) => setNewEmpType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] mt-1"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Association Leadership">Association Leadership</option>
                <option value="Academic">Academic</option>
              </select>
            </div>

            <div>
              <Label htmlFor="pos-loc" className="text-xs">
                Location (Optional)
              </Label>
              <Input
                id="pos-loc"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pos-start" className="text-xs">
                Start Date
              </Label>
              <Input
                id="pos-start"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                placeholder="e.g. Jan 2022 or 2022"
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pos-end" className="text-xs">
                End Date
              </Label>
              <Input
                id="pos-end"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                placeholder="e.g. Dec 2024"
                disabled={newIsCurrent}
                className="text-xs mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pos-current"
              checked={newIsCurrent}
              onChange={(e) => setNewIsCurrent(e.target.checked)}
              className="rounded border-[#DFCEB5] text-[#7B2D26] focus:ring-[#7B2D26]"
            />
            <label htmlFor="pos-current" className="text-xs font-semibold text-[#0F172A] cursor-pointer">
              I am currently working / serving in this position
            </label>
          </div>

          <div>
            <Label htmlFor="pos-image" className="text-xs">
              Company Logo Link (Direct Image URL)
            </Label>
            <Input
              id="pos-image"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://... logo or image link"
              className="text-xs mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pos-desc" className="text-xs">
              Description / Responsibilities (Optional)
            </Label>
            <Textarea
              id="pos-desc"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe your role, key contributions, and accomplishments..."
              rows={3}
              className="text-xs mt-1"
            />
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
            >
              {isSaving ? "Saving..." : "Save Experience"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal 2: Manage Positions */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Experience &amp; Positions"
        description="Edit, remove, or organize all your listed roles."
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {manageList.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B]">
              No positions to manage. Click &quot;Add Position&quot; above to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {manageList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF9F5] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider">
                      Position #{idx + 1}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteManageItem(idx)}
                      className="text-xs text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px]">Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateManageItem(idx, "title", e.target.value)}
                        placeholder="Role Title"
                        className="text-xs mt-0.5 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Company / Organization</Label>
                      <Input
                        value={item.organization}
                        onChange={(e) => handleUpdateManageItem(idx, "organization", e.target.value)}
                        placeholder="Company Name"
                        className="text-xs mt-0.5 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px]">Start Date</Label>
                      <Input
                        value={item.start_date || ""}
                        onChange={(e) => handleUpdateManageItem(idx, "start_date", e.target.value)}
                        placeholder="e.g. 2022"
                        className="text-xs mt-0.5 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">End Date</Label>
                      <Input
                        value={item.end_date || ""}
                        onChange={(e) => handleUpdateManageItem(idx, "end_date", e.target.value)}
                        placeholder="e.g. 2024"
                        disabled={item.is_current}
                        className="text-xs mt-0.5 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`manage-current-${idx}`}
                      checked={Boolean(item.is_current)}
                      onChange={(e) => handleUpdateManageItem(idx, "is_current", e.target.checked)}
                      className="rounded border-[#DFCEB5] text-[#7B2D26] focus:ring-[#7B2D26]"
                    />
                    <label htmlFor={`manage-current-${idx}`} className="text-xs text-[#0F172A] font-semibold cursor-pointer">
                      Current Position
                    </label>
                  </div>

                  <div>
                    <Label className="text-[11px]">Company Logo Link</Label>
                    <Input
                      value={item.image_url || ""}
                      onChange={(e) => handleUpdateManageItem(idx, "image_url", e.target.value)}
                      placeholder="https://..."
                      className="text-xs mt-0.5 bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px]">Description</Label>
                    <Textarea
                      value={item.description || ""}
                      onChange={(e) => handleUpdateManageItem(idx, "description", e.target.value)}
                      placeholder="Role responsibilities..."
                      rows={2}
                      className="text-xs mt-0.5 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsManageModalOpen(false)}
            disabled={isSaving}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleManageSave}
            disabled={isSaving || manageList.length === 0}
            className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold"
          >
            {isSaving ? "Saving All..." : "Save All Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
