"use client";

import * as React from "react";
import { useActionState } from "react";
import { createAnnouncementAction, type AdminControlResult } from "@/actions/adminControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Megaphone, AlertCircle } from "lucide-react";

export function CreateAnnouncementModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, formAction, isPending] = useActionState<AdminControlResult | null, FormData>(
    createAnnouncementAction,
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
        Post Announcement
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Broadcast Official Announcement"
        description="Publish notices to members, verified alumni, faculty, or all users."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title" required>Notice Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Annual General Meeting &amp; Election Schedule 2026"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" required>Priority Level</Label>
              <Select id="priority" name="priority" defaultValue="NORMAL">
                <option value="LOW">Low Notice</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAudience" required>Target Audience</Label>
              <Select id="targetAudience" name="targetAudience" defaultValue="ALL">
                <option value="ALL">All Users &amp; Public</option>
                <option value="MEMBER">Current Student Members</option>
                <option value="ALUMNI">Verified Alumni Only</option>
                <option value="TEACHER">Faculty &amp; Advisors</option>
                <option value="ADMIN">Executive Committee / Admins</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content" required>Announcement Body</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write the full announcement text here..."
              rows={4}
              required
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Broadcasting..." : "Publish Announcement"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
