"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateAboutPageCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import { type AboutPageCmsData, type CmsMilestoneItem } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "./RichTextEditor";
import { CheckCircle2, AlertCircle, Save, Plus, Trash2, Calendar, Award } from "lucide-react";

export function AboutPageCmsForm({ initialData }: { initialData: AboutPageCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateAboutPageCmsAction,
    null
  );

  const defaultMilestones: CmsMilestoneItem[] = [
    { id: "m-1", year: "2012", title: "Association Foundation", description: "Established by RUET seniors from Sirajganj as a mutual welfare circle." },
    { id: "m-2", year: "2016", title: "Digital Textbook Bank Launched", description: "Began free semester textbook circulation across all engineering departments." },
    { id: "m-3", year: "2020", title: "Emergency Student Medical Fund", description: "Created permanent emergency welfare fund and verified blood donor registry." },
    { id: "m-4", year: "2024", title: "Unified Digital Platform", description: "Launched official membership portal, alumni directory, and automated library." },
  ];

  const [milestones, setMilestones] = React.useState<CmsMilestoneItem[]>(
    initialData.milestones && initialData.milestones.length > 0
      ? initialData.milestones
      : defaultMilestones
  );

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `milestone-${Date.now()}`,
        year: "2026",
        title: "New Milestone",
        description: "Describe the historical milestone achievement here...",
      },
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, field: keyof CmsMilestoneItem, val: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Pass dynamic milestones JSON */}
      <input type="hidden" name="milestonesJson" value={JSON.stringify(milestones)} />

      {/* Mission & Vision */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#7B2D26]" />
          Mission &amp; Vision Statements
        </h3>

        <div className="space-y-3">
          <div>
            <Label htmlFor="missionTitle">Mission Header</Label>
            <Input id="missionTitle" name="missionTitle" defaultValue={initialData.missionTitle} />
          </div>

          <RichTextEditor
            id="missionContent"
            name="missionContent"
            label="Mission Narrative"
            defaultValue={initialData.missionContent}
            rows={3}
          />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <Label htmlFor="visionTitle">Vision Header</Label>
            <Input id="visionTitle" name="visionTitle" defaultValue={initialData.visionTitle} />
          </div>

          <RichTextEditor
            id="visionContent"
            name="visionContent"
            label="Vision Narrative"
            defaultValue={initialData.visionContent}
            rows={3}
          />
        </div>
      </div>

      {/* History & Constitution */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-2">
          Association History &amp; Constitution
        </h3>

        <div className="space-y-3">
          <div>
            <Label htmlFor="historyTitle">History Section Title</Label>
            <Input id="historyTitle" name="historyTitle" defaultValue={initialData.historyTitle} />
          </div>

          <RichTextEditor
            id="historyContent"
            name="historyContent"
            label="Association Heritage &amp; Background"
            defaultValue={initialData.historyContent}
            rows={4}
          />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <Label htmlFor="constitutionTitle">Constitution Section Title</Label>
            <Input id="constitutionTitle" name="constitutionTitle" defaultValue={initialData.constitutionTitle} />
          </div>

          <RichTextEditor
            id="constitutionContent"
            name="constitutionContent"
            label="Constitution &amp; Governance Bylaws"
            defaultValue={initialData.constitutionContent}
            rows={4}
          />
        </div>
      </div>

      {/* Historical Milestones Timeline (Add / Edit / Delete) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7B2D26]" />
              Historical Milestones Timeline (Add, Edit, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">Manage chronological key events and breakthroughs since inception.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMilestone}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Milestone
          </Button>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B2D26]">Milestone #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label>Year / Date</Label>
                  <Input
                    value={m.year}
                    onChange={(e) => handleUpdateMilestone(m.id, "year", e.target.value)}
                    placeholder="e.g. 2012"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label>Milestone Headline</Label>
                  <Input
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(m.id, "title", e.target.value)}
                    placeholder="e.g. Foundation of Association"
                  />
                </div>
              </div>

              <RichTextEditor
                label="Milestone Description (With Formatting & Preview)"
                value={m.description}
                onChange={(val) => handleUpdateMilestone(m.id, "description", val)}
                rows={2}
                placeholder="Describe what occurred during this milestone..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-2">
          Core Values &amp; Pillars
        </h3>

        <div>
          <Label htmlFor="coreValues">Values (One per line)</Label>
          <Textarea
            id="coreValues"
            name="coreValues"
            defaultValue={initialData.coreValues?.join("\n")}
            rows={5}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending} leftIcon={<Save className="w-5 h-5" />}>
          {isPending ? "Publishing Changes..." : "Publish About CMS"}
        </Button>
      </div>
    </form>
  );
}
