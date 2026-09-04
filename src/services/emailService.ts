/**
 * SDA RUET Email Service Abstraction Layer
 * Supports pluggable email providers (ConsoleMock, Resend, SMTP, SendGrid)
 * with robust fallback handling and built-in transactional email templates.
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(options: EmailOptions): Promise<EmailSendResult>;
}

/**
 * Console Mock Email Provider
 * Formats and outputs emails to console/logs for local development, testing, and CI.
 */
export class ConsoleMockEmailProvider implements EmailProvider {
  name = "ConsoleMock";

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    const recipients = Array.isArray(options.to) ? options.to.join(", ") : options.to;
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    console.log(`\n================== [TRANSACTIONAL EMAIL DISPATCH] ==================`);
    console.log(`Provider:   ${this.name}`);
    console.log(`Message-ID: ${messageId}`);
    console.log(`From:       ${options.from || "SDA RUET <no-reply@sdaruet.org>"}`);
    console.log(`To:         ${recipients}`);
    console.log(`Subject:    ${options.subject}`);
    console.log(`------------------------------ Text ------------------------------`);
    console.log(options.text || options.html.replace(/<[^>]*>?/gm, ""));
    console.log(`====================================================================\n`);

    return {
      success: true,
      messageId,
      provider: this.name,
    };
  }
}

/**
 * Resend API Email Provider Adapter (transactional HTTP API)
 */
export class ResendEmailProvider implements EmailProvider {
  name = "Resend";
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom = "SDA RUET <notifications@sdaruet.org>") {
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from || this.defaultFrom,
          to: recipients,
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          provider: this.name,
          error: data.message || "Failed to send email via Resend",
        };
      }

      return {
        success: true,
        messageId: data.id,
        provider: this.name,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error in Resend provider";
      return {
        success: false,
        provider: this.name,
        error: msg,
      };
    }
  }
}

/**
 * Global Email Service orchestrator with responsive branding templates
 */
export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    if (provider) {
      this.provider = provider;
    } else if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "mock-resend-key") {
      this.provider = new ResendEmailProvider(process.env.RESEND_API_KEY);
    } else {
      this.provider = new ConsoleMockEmailProvider();
    }
  }

  public setProvider(provider: EmailProvider) {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public async send(options: EmailOptions): Promise<EmailSendResult> {
    return this.provider.sendEmail(options);
  }

  /**
   * Base template wrapper for consistent SDA RUET branding
   */
  private wrapTemplate(title: string, bodyContent: string, actionUrl?: string, actionText?: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #7B2D26; padding: 24px 32px; text-align: left; border-bottom: 3px solid #C5A880;">
      <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">SDA RUET</h1>
      <p style="color: #E2E8F0; font-size: 12px; margin: 4px 0 0 0;">Sirajganj District Association, RUET</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px; line-height: 1.6;">
      <h2 style="color: #0F172A; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">${title}</h2>
      ${bodyContent}

      ${actionUrl && actionText ? `
      <div style="margin-top: 28px; text-align: center;">
        <a href="${actionUrl}" style="display: inline-block; background-color: #7B2D26; color: #FFFFFF; font-size: 14px; font-weight: 600; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(123,45,38,0.2);">
          ${actionText}
        </a>
      </div>` : ""}
    </div>

    <!-- Footer -->
    <div style="background-color: #F1F5F9; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
      <p style="margin: 0 0 6px 0;"><strong>Take a Stand &amp; Hold a Hand</strong></p>
      <p style="margin: 0;">Rajshahi University of Engineering &amp; Technology (RUET), Kazla, Rajshahi-6204</p>
      <p style="margin: 6px 0 0 0; font-size: 11px;">This is an automated notification from SDA RUET. Please do not reply directly to this email.</p>
    </div>

  </div>
</body>
</html>`;
  }

  // =========================================================================
  // TRANSACTIONAL EMAIL HELPERS FOR SYSTEM EVENTS
  // =========================================================================

  /**
   * 1. Alumni Application Received
   */
  async sendAlumniApplicationReceivedEmail(to: string, name: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Alumni Application Received",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Thank you for submitting your SDA RUET alumni verification application. Our administrative committee has received your submission and is reviewing your academic credentials.</p>
       <p>You will receive another notification as soon as your verification status is updated.</p>`,
      "https://sda-ruet.org/dashboard",
      "View Application Status"
    );
    return this.send({
      to,
      subject: "SDA RUET - Alumni Application Received",
      html,
    });
  }

  /**
   * 2. Alumni Approved
   */
  async sendAlumniApprovedEmail(to: string, name: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Alumni Membership Verified",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Congratulations! Your alumni membership for <strong>Sirajganj District Association, RUET</strong> has been officially approved and verified by the Executive Committee.</p>
       <p>Your profile is now featured in the Verified Alumni Directory, granting you full alumni portal access, mentoring opportunities, and association voting rights.</p>`,
      "https://sda-ruet.org/alumni",
      "View Alumni Directory"
    );
    return this.send({
      to,
      subject: "Congratulations! Your SDA RUET Alumni Status is Verified",
      html,
    });
  }

  /**
   * 3. Alumni Rejected
   */
  async sendAlumniRejectedEmail(to: string, name: string, notes?: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Alumni Application Update",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Thank you for your interest in joining the SDA RUET Alumni network. After careful review, our administrative team was unable to verify your application with the provided records.</p>
       ${notes ? `<div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #991B1B;"><strong>Reviewer Notes:</strong> ${notes}</div>` : ""}
       <p>If you believe this is an error or have updated verification documents, please feel free to update your profile or contact the committee.</p>`,
      "https://sda-ruet.org/contact",
      "Contact Support"
    );
    return this.send({
      to,
      subject: "SDA RUET - Alumni Application Status Update",
      html,
    });
  }

  /**
   * 4. Profile Changes
   */
  async sendProfileUpdatedEmail(to: string, name: string, changeType = "Profile Details"): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Security Notice: Account Updated",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>This is a quick security confirmation that your SDA RUET account <strong>${changeType}</strong> was recently updated.</p>
       <p>If you made this change, no further action is required. If you did not authorize this modification, please change your password immediately and contact our administrators.</p>`,
      "https://sda-ruet.org/dashboard/profile",
      "Review Account Settings"
    );
    return this.send({
      to,
      subject: `SDA RUET - Account ${changeType} Updated`,
      html,
    });
  }

  /**
   * 5. Book Issued
   */
  async sendBookIssuedEmail(to: string, name: string, bookTitle: string, dueDate: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Digital Library: Book Issued",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>You have successfully checked out <strong>"${bookTitle}"</strong> from the SDA RUET Digital Library circulation desk.</p>
       <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #1E40AF;">
         <strong>Due Date:</strong> ${dueDate}<br>
         <strong>Loan Duration:</strong> 14 Days
       </div>
       <p>Please remember to return or renew the book on or before the due date to avoid overdue daily fines.</p>`,
      "https://sda-ruet.org/dashboard/library",
      "Manage My Loans"
    );
    return this.send({
      to,
      subject: `SDA RUET Library - Book Issued: ${bookTitle}`,
      html,
    });
  }

  /**
   * 6. Book Due Reminder
   */
  async sendBookDueEmail(to: string, name: string, bookTitle: string, dueDate: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Reminder: Book Due Soon",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>This is a friendly reminder that your borrowed book <strong>"${bookTitle}"</strong> is due on <strong>${dueDate}</strong>.</p>
       <p>You may renew the loan online through your member dashboard if no other member has placed a reservation on this copy.</p>`,
      "https://sda-ruet.org/dashboard/library",
      "Renew or Return Book"
    );
    return this.send({
      to,
      subject: `SDA RUET Library - Book Due Soon: ${bookTitle}`,
      html,
    });
  }

  /**
   * 7. Book Overdue Notice
   */
  async sendBookOverdueEmail(to: string, name: string, bookTitle: string, daysOverdue: number, fineAmount: number): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Urgent: Overdue Library Book Notice",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Our records indicate that your borrowed book <strong>"${bookTitle}"</strong> is now <strong>${daysOverdue} day(s) overdue</strong>.</p>
       <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #991B1B;">
         <strong>Overdue Duration:</strong> ${daysOverdue} days<br>
         <strong>Accrued Fine:</strong> ৳${fineAmount.toFixed(2)} (BDT)
       </div>
       <p>Please return the copy to the SDA RUET circulation desk as soon as possible to prevent further fines and account borrowing holds.</p>`,
      "https://sda-ruet.org/dashboard/library",
      "View Library Status"
    );
    return this.send({
      to,
      subject: `URGENT: Overdue Book Notice - ${bookTitle}`,
      html,
    });
  }

  /**
   * 8. Donation Received
   */
  async sendDonationReceivedEmail(to: string, name: string, amount: number, fundName: string, transactionId: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Donation Submission Received",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Thank you for contributing to the <strong>Sirajganj District Association, RUET</strong>.</p>
       <div style="background-color: #F0FDF4; border-left: 4px solid #22C55E; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #166534;">
         <strong>Amount:</strong> ৳${amount.toLocaleString()} BDT<br>
         <strong>Fund:</strong> ${fundName}<br>
         <strong>Transaction ID / Ref:</strong> ${transactionId}
       </div>
       <p>Our audit team will verify the payment reference and issue an official verified receipt shortly.</p>`,
      "https://sda-ruet.org/donate",
      "View Donation Ledger"
    );
    return this.send({
      to,
      subject: `SDA RUET - Donation Received (৳${amount.toLocaleString()} BDT)`,
      html,
    });
  }

  /**
   * 9. Donation Verified
   */
  async sendDonationVerifiedEmail(to: string, name: string, amount: number, fundName: string, receiptNumber: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Official Donation Receipt & Verification",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>We are delighted to confirm that your donation to <strong>${fundName}</strong> has been audited and verified!</p>
       <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
         <p style="margin: 0 0 6px 0;"><strong>Receipt Number:</strong> ${receiptNumber}</p>
         <p style="margin: 0 0 6px 0;"><strong>Verified Amount:</strong> ৳${amount.toLocaleString()} BDT</p>
         <p style="margin: 0;"><strong>Designation:</strong> ${fundName}</p>
       </div>
       <p>Your generosity directly empowers students, expands our digital library, and funds emergency relief for our members.</p>`,
      "https://sda-ruet.org/donate",
      "View Verified Public Roll"
    );
    return this.send({
      to,
      subject: `Official Receipt: Verified Donation ৳${amount.toLocaleString()} BDT`,
      html,
    });
  }

  /**
   * 10. Event Registration Confirmation
   */
  async sendEventRegistrationEmail(to: string, name: string, eventTitle: string, eventDate: string, location: string): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      "Event Registration Confirmed",
      `<p>Dear <strong>${name}</strong>,</p>
       <p>Your seat for <strong>${eventTitle}</strong> has been successfully confirmed!</p>
       <div style="background-color: #F5F3FF; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #5B21B6;">
         <strong>Event:</strong> ${eventTitle}<br>
         <strong>Date & Time:</strong> ${eventDate}<br>
         <strong>Location / Venue:</strong> ${location}
       </div>
       <p>We look forward to seeing you there!</p>`,
      "https://sda-ruet.org/events",
      "View Event Details"
    );
    return this.send({
      to,
      subject: `Event Registration Confirmed: ${eventTitle}`,
      html,
    });
  }

  /**
   * 11. Official Announcements
   */
  async sendAnnouncementEmail(to: string | string[], title: string, contentSnippet: string, priority = "NORMAL"): Promise<EmailSendResult> {
    const html = this.wrapTemplate(
      `Official Announcement: ${title}`,
      `<div style="padding: 12px 16px; margin-bottom: 16px; background-color: ${priority === "URGENT" ? "#FEF2F2" : "#F8FAFC"}; border-left: 4px solid ${priority === "URGENT" ? "#EF4444" : "#7B2D26"}; font-size: 13px;">
         <strong>Priority:</strong> ${priority}
       </div>
       <p>${contentSnippet}</p>`,
      "https://sda-ruet.org/dashboard",
      "Read Full Announcement"
    );
    return this.send({
      to,
      subject: `[SDA RUET Announcement] ${title}`,
      html,
    });
  }
}

// Global default singleton instance
export const emailService = new EmailService();
