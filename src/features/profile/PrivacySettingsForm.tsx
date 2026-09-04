"use client";

import { useActionState } from "react";
import { updatePrivacySettingsAction, type ProfileActionResult } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Save, CheckCircle2, AlertCircle, Eye, Lock, Users } from "lucide-react";

export function PrivacySettingsForm({
  privacySettings,
}: {
  privacySettings: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    updatePrivacySettingsAction,
    null
  );

  const fields = [
    {
      id: "phone",
      label: "Phone Number Visibility",
      description: "Controls who can see your mobile number in directories.",
      defaultValue: privacySettings.phone || "PRIVATE",
    },
    {
      id: "email",
      label: "Email Address Visibility",
      description: "Controls who can view your email on your profile card.",
      defaultValue: privacySettings.email || "MEMBERS_ONLY",
    },
    {
      id: "blood_group",
      label: "Blood Group Visibility",
      description: "Allows emergency blood coordination teams to view your group.",
      defaultValue: privacySettings.blood_group || "PRIVATE",
    },
    {
      id: "present_address",
      label: "Present Address Visibility",
      description: "Visibility of your current residence/mess in Rajshahi.",
      defaultValue: privacySettings.present_address || "PRIVATE",
    },
    {
      id: "permanent_address",
      label: "Permanent Address Visibility",
      description: "Visibility of your Sirajganj hometown address.",
      defaultValue: privacySettings.permanent_address || "ADMIN_ONLY",
    },
    {
      id: "bio",
      label: "Biography & Introduction",
      description: "Public view of your self-description on public profiles.",
      defaultValue: privacySettings.bio || "PUBLIC",
    },
    {
      id: "social_links",
      label: "Social Media Links",
      description: "Visibility of your LinkedIn, GitHub, and Facebook handles.",
      defaultValue: privacySettings.social_links || "PUBLIC",
    },
  ];

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

      <div className="p-4 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] text-xs text-[#7B2D26] flex items-start gap-2.5">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Privacy-by-Design Architecture</span>
          <span>
            Sensitive fields (phone, present address, permanent address) default to <strong>PRIVATE</strong>.
            Institutional Student IDs are strictly protected for administration verification only.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className="p-4 rounded-xl bg-white border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-bold text-[#0F172A] block">{field.label}</span>
              <span className="text-[11px] text-[#64748B] block leading-relaxed">
                {field.description}
              </span>
            </div>

            <div className="w-full sm:w-48 flex-shrink-0">
              <Select name={field.id} defaultValue={field.defaultValue}>
                <option value="PUBLIC">Public (Everyone)</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="PRIVATE">Private (Only Me)</option>
                <option value="ADMIN_ONLY">Admin Only</option>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        leftIcon={<Save className="w-4 h-4" />}
        className="font-semibold"
      >
        {isPending ? "Saving Privacy Preferences..." : "Save Privacy Settings"}
      </Button>
    </form>
  );
}
