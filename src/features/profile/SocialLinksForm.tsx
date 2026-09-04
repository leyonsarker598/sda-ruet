"use client";

import { useActionState } from "react";
import { updateSocialLinksAction, type ProfileActionResult } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, CheckCircle2, AlertCircle, Globe, Share2 } from "lucide-react";

export function SocialLinksForm({
  socialLinks,
}: {
  socialLinks: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    updateSocialLinksAction,
    null
  );

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

      <div className="space-y-4">
        <div>
          <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={socialLinks.linkedin || ""}
            placeholder="https://linkedin.com/in/yourusername"
            error={state?.fieldErrors?.linkedin?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="github">GitHub Profile URL</Label>
          <Input
            id="github"
            name="github"
            type="url"
            defaultValue={socialLinks.github || ""}
            placeholder="https://github.com/yourusername"
            error={state?.fieldErrors?.github?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="facebook">Facebook Profile URL</Label>
          <Input
            id="facebook"
            name="facebook"
            type="url"
            defaultValue={socialLinks.facebook || ""}
            placeholder="https://facebook.com/yourusername"
            error={state?.fieldErrors?.facebook?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="website">Personal Website / Portfolio</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={socialLinks.website || ""}
            placeholder="https://yourwebsite.com"
            error={state?.fieldErrors?.website?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="twitter">Twitter / X Profile URL</Label>
          <Input
            id="twitter"
            name="twitter"
            type="url"
            defaultValue={socialLinks.twitter || ""}
            placeholder="https://x.com/yourusername"
            error={state?.fieldErrors?.twitter?.[0]}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        leftIcon={<Save className="w-4 h-4" />}
        className="font-semibold"
      >
        {isPending ? "Updating Social Links..." : "Save Social Profiles"}
      </Button>
    </form>
  );
}
