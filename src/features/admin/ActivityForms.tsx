"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  createActivityAction,
  togglePublishActivityAction,
  deleteActivityAction,
  type AdminActivityResult,
} from "@/actions/adminActivity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Eye, EyeOff, Trash2, AlertCircle } from "lucide-react";

export function CreateActivityModal({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, formAction, isPending] = useActionState<AdminActivityResult | null, FormData>(
    createActivityAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="w-4 h-4" />}
        className="font-semibold text-xs"
      >
        Write New Story
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Publish Association Activity / News"
        description="Share event highlights, humanitarian drives, and student updates."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" required>Story Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Annual Grand Iftar &amp; Doa Mahfil 2026"
                required
                error={state?.fieldErrors?.title?.[0]}
              />
            </div>

            <div>
              <Label htmlFor="slug" required>URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="e.g. annual-iftar-2026"
                required
                error={state?.fieldErrors?.slug?.[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId" required>Category</Label>
              <Select id="categoryId" name="categoryId" defaultValue={categories[0]?.id}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="activityDate" required>Activity Date</Label>
              <Input
                id="activityDate"
                name="activityDate"
                type="date"
                required
                error={state?.fieldErrors?.activityDate?.[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Event Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. RUET Central Auditorium, Kazla"
              />
            </div>

            <div>
              <Label htmlFor="coverImageUrl">Cover / Banner Image URL</Label>
              <Input
                id="coverImageUrl"
                name="coverImageUrl"
                type="url"
                placeholder="https://images.unsplash.com/... or https://..."
                error={state?.fieldErrors?.coverImageUrl?.[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription" required>Summary / Short Hook</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              placeholder="1-2 sentences summarizing the highlights..."
              rows={2}
              required
              error={state?.fieldErrors?.shortDescription?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="content" required>Full Story Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Complete event article or writeup..."
              rows={4}
              required
              error={state?.fieldErrors?.content?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" placeholder="e.g. Iftar, Reunion, RUET, 2026" />
          </div>

          <div className="pt-1">
            <Checkbox
              name="isPublished"
              value="true"
              label="Publish live immediately to public website"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Save Activity"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function TogglePublishButton({
  activityId,
  isPublished,
}: {
  activityId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await togglePublishActivityAction(activityId, !isPublished);
        });
      }}
      className="text-xs"
      leftIcon={isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#15803D]" />}
    >
      {isPending ? "Updating..." : isPublished ? "Set Draft" : "Publish"}
    </Button>
  );
}
