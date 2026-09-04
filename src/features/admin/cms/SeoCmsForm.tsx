"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateSeoCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import { type SeoCmsData } from "@/services/cmsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

export function SeoCmsForm({ initialData }: { initialData: SeoCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateSeoCmsAction,
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

      <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-2">
          Global SEO &amp; OpenGraph Metadata
        </h3>

        <div>
          <Label htmlFor="siteTitle" required>Global Title Tag</Label>
          <Input id="siteTitle" name="siteTitle" defaultValue={initialData.siteTitle} required />
        </div>

        <div>
          <Label htmlFor="siteDescription" required>Meta Description</Label>
          <Textarea id="siteDescription" name="siteDescription" defaultValue={initialData.siteDescription} rows={3} required />
        </div>

        <div>
          <Label htmlFor="keywords" required>SEO Keywords (Comma-separated)</Label>
          <Input id="keywords" name="keywords" defaultValue={initialData.keywords?.join(", ")} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="authorName" required>Author / Publisher</Label>
            <Input id="authorName" name="authorName" defaultValue={initialData.authorName} required />
          </div>

          <div>
            <Label htmlFor="ogImageUrl">OpenGraph Image URL</Label>
            <Input id="ogImageUrl" name="ogImageUrl" defaultValue={initialData.ogImageUrl} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} leftIcon={<Save className="w-4 h-4" />}>
          {isPending ? "Saving..." : "Save SEO Metadata"}
        </Button>
      </div>
    </form>
  );
}
