"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Bell, Save, CheckCircle2 } from "lucide-react";

export function NotificationPreferencesForm() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [libraryDue, setLibraryDue] = React.useState(true);
  const [committeeNotices, setCommitteeNotices] = React.useState(true);
  const [generalEvents, setGeneralEvents] = React.useState(true);
  const [bloodAlerts, setBloodAlerts] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        "Notification Preferences Saved",
        "Your email delivery and SMS notice settings have been updated."
      );
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs">
          <Checkbox
            checked={libraryDue}
            onChange={(e) => setLibraryDue(e.target.checked)}
            label="Library Loan &amp; Due Date Reminders"
            description="Receive email notices 2 days prior to book return deadlines."
          />
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs">
          <Checkbox
            checked={committeeNotices}
            onChange={(e) => setCommitteeNotices(e.target.checked)}
            label="Executive Committee &amp; AGM Notices"
            description="Receive official association announcements, meetings, and election notices."
          />
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs">
          <Checkbox
            checked={generalEvents}
            onChange={(e) => setGeneralEvents(e.target.checked)}
            label="Events, Freshers Reception &amp; Iftar Gatherings"
            description="Invitations and reminders for upcoming association community events."
          />
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs">
          <Checkbox
            checked={bloodAlerts}
            onChange={(e) => setBloodAlerts(e.target.checked)}
            label="Emergency Blood Donation Requests"
            description="Urgent blood request notices for Sirajganj/RUET patients in Rajshahi Medical College Hospital."
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        leftIcon={<Save className="w-4 h-4" />}
        className="font-semibold"
      >
        {isSaving ? "Saving Preferences..." : "Save Notification Preferences"}
      </Button>
    </form>
  );
}
