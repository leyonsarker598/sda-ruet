"use client";

import { useActionState } from "react";
import { submitContactMessageAction, type ContactActionResult } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactActionResult | null, FormData>(
    submitContactMessageAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-name" required>Your Full Name</Label>
          <Input
            id="contact-name"
            name="name"
            placeholder="e.g. Md. Yeasir Arafat"
            required
            error={state?.fieldErrors?.name?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="contact-email" required>Email Address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="e.g. name@example.com"
            required
            error={state?.fieldErrors?.email?.[0]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="+880 1700-000000"
          />
        </div>

        <div>
          <Label htmlFor="contact-subject" required>Subject / Topic</Label>
          <Input
            id="contact-subject"
            name="subject"
            placeholder="e.g. Library donation inquiry, Membership"
            required
            error={state?.fieldErrors?.subject?.[0]}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message" required>Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Please write your detailed message or inquiry here..."
          rows={4}
          required
          error={state?.fieldErrors?.message?.[0]}
        />
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto mt-2"
        disabled={isPending || state?.success}
        leftIcon={<Send className="w-4 h-4" />}
      >
        {isPending ? "Sending Message..." : "Send Message to SDA RUET"}
      </Button>
    </form>
  );
}
