export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "ADMIN" | "MEMBER" | "ALUMNI" | "TEACHER" | "LIBRARIAN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUESTED";
export type VisibilityLevel = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE" | "ADMIN_ONLY";
export type BookStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "ARCHIVED";
export type CopyCondition = "NEW" | "GOOD" | "FAIR" | "DAMAGED" | "LOST";
export type LoanStatus = "ISSUED" | "RETURNED" | "OVERDUE" | "LOST" | "CANCELLED";
export type DonationStatus = "PENDING" | "RECEIVED" | "ACCEPTED" | "REJECTED" | "CATALOGUED";
export type PaymentStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "FAILED" | "REFUNDED" | "CANCELLED";
export type EventStatus = "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          module: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id: string;
          module: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          module?: string;
          description?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
      };
      user_permissions: {
        Row: {
          user_id: string;
          permission_id: string;
          is_granted: boolean;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          permission_id: string;
          is_granted?: boolean;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          permission_id?: string;
          is_granted?: boolean;
          granted_by?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role_id: string;
          status: AccountStatus;
          department: string | null;
          series: string | null;
          session: string | null;
          student_id: string | null;
          blood_group: string | null;
          present_address: string | null;
          permanent_address: string | null;
          bio: string | null;
          social_links: Json;
          privacy_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role_id?: string;
          status?: AccountStatus;
          department?: string | null;
          series?: string | null;
          session?: string | null;
          student_id?: string | null;
          blood_group?: string | null;
          present_address?: string | null;
          permanent_address?: string | null;
          bio?: string | null;
          social_links?: Json;
          privacy_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role_id?: string;
          status?: AccountStatus;
          department?: string | null;
          series?: string | null;
          session?: string | null;
          student_id?: string | null;
          blood_group?: string | null;
          present_address?: string | null;
          permanent_address?: string | null;
          bio?: string | null;
          social_links?: Json;
          privacy_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_details: {
        Row: {
          id: string;
          profile_id: string;
          hall: string | null;
          current_semester: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          hall?: string | null;
          current_semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          hall?: string | null;
          current_semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alumni_profiles: {
        Row: {
          id: string;
          profile_id: string;
          graduation_year: number;
          degree: string;
          current_designation: string | null;
          organization: string | null;
          industry: string | null;
          current_city: string | null;
          current_country: string;
          linkedin_url: string | null;
          portfolio_url: string | null;
          achievements: string | null;
          is_featured: boolean;
          verification_status: VerificationStatus;
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          graduation_year: number;
          degree?: string;
          current_designation?: string | null;
          organization?: string | null;
          industry?: string | null;
          current_city?: string | null;
          current_country?: string;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          achievements?: string | null;
          is_featured?: boolean;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          graduation_year?: number;
          degree?: string;
          current_designation?: string | null;
          organization?: string | null;
          industry?: string | null;
          current_city?: string | null;
          current_country?: string;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          achievements?: string | null;
          is_featured?: boolean;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alumni_applications: {
        Row: {
          id: string;
          profile_id: string;
          submitted_data: Json;
          document_urls: string[];
          status: VerificationStatus;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          submitted_data: Json;
          document_urls?: string[];
          status?: VerificationStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          submitted_data?: Json;
          document_urls?: string[];
          status?: VerificationStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teacher_profiles: {
        Row: {
          id: string;
          profile_id: string;
          designation: string;
          department: string;
          office_location: string | null;
          research_interests: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          designation: string;
          department: string;
          office_location?: string | null;
          research_interests?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          designation?: string;
          department?: string;
          office_location?: string | null;
          research_interests?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      committees: {
        Row: {
          id: string;
          term_name: string;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          banner_image_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term_name: string;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          banner_image_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          term_name?: string;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          banner_image_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      committee_positions: {
        Row: {
          id: string;
          title: string;
          hierarchy_order: number;
        };
        Insert: {
          id: string;
          title: string;
          hierarchy_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          hierarchy_order?: number;
        };
      };
      committee_members: {
        Row: {
          id: string;
          committee_id: string;
          profile_id: string | null;
          position_id: string;
          custom_position_title: string | null;
          name: string;
          department: string | null;
          series: string | null;
          session: string | null;
          photo_url: string | null;
          bio: string | null;
          social_links: Json;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_id: string;
          profile_id?: string | null;
          position_id: string;
          custom_position_title?: string | null;
          name: string;
          department?: string | null;
          series?: string | null;
          session?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          social_links?: Json;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_id?: string;
          profile_id?: string | null;
          position_id?: string;
          custom_position_title?: string | null;
          name?: string;
          department?: string | null;
          series?: string | null;
          session?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          social_links?: Json;
          display_order?: number;
          created_at?: string;
        };
      };
      book_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          isbn: string | null;
          title: string;
          subtitle: string | null;
          author: string;
          co_authors: string[];
          publisher: string | null;
          publication_year: number | null;
          edition: string | null;
          language: string;
          category_id: string;
          description: string | null;
          cover_image_url: string | null;
          shelf_location: string | null;
          total_copies: number;
          available_copies: number;
          status: BookStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          isbn?: string | null;
          title: string;
          subtitle?: string | null;
          author: string;
          co_authors?: string[];
          publisher?: string | null;
          publication_year?: number | null;
          edition?: string | null;
          language?: string;
          category_id: string;
          description?: string | null;
          cover_image_url?: string | null;
          shelf_location?: string | null;
          total_copies?: number;
          available_copies?: number;
          status?: BookStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          isbn?: string | null;
          title?: string;
          subtitle?: string | null;
          author?: string;
          co_authors?: string[];
          publisher?: string | null;
          publication_year?: number | null;
          edition?: string | null;
          language?: string;
          category_id?: string;
          description?: string | null;
          cover_image_url?: string | null;
          shelf_location?: string | null;
          total_copies?: number;
          available_copies?: number;
          status?: BookStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_copies: {
        Row: {
          id: string;
          book_id: string;
          copy_code: string;
          condition: CopyCondition;
          is_available: boolean;
          acquisition_type: string;
          donation_id: string | null;
          donor_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          copy_code: string;
          condition?: CopyCondition;
          is_available?: boolean;
          acquisition_type?: string;
          donation_id?: string | null;
          donor_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          copy_code?: string;
          condition?: CopyCondition;
          is_available?: boolean;
          acquisition_type?: string;
          donation_id?: string | null;
          donor_name?: string | null;
          created_at?: string;
        };
      };
      book_loans: {
        Row: {
          id: string;
          book_id: string;
          book_copy_id: string;
          borrower_id: string;
          issue_date: string;
          due_date: string;
          return_date: string | null;
          renewal_count: number;
          status: LoanStatus;
          fine_amount: number;
          fine_paid: boolean;
          issued_by: string;
          returned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          book_copy_id: string;
          borrower_id: string;
          issue_date?: string;
          due_date: string;
          return_date?: string | null;
          renewal_count?: number;
          status?: LoanStatus;
          fine_amount?: number;
          fine_paid?: boolean;
          issued_by: string;
          returned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          book_copy_id?: string;
          borrower_id?: string;
          issue_date?: string;
          due_date?: string;
          return_date?: string | null;
          renewal_count?: number;
          status?: LoanStatus;
          fine_amount?: number;
          fine_paid?: boolean;
          issued_by?: string;
          returned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_reservations: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          status?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          status?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      book_donations: {
        Row: {
          id: string;
          donor_id: string | null;
          donor_name: string;
          donor_email: string;
          donor_phone: string | null;
          book_title: string;
          author: string;
          isbn: string | null;
          quantity: number;
          category_id: string | null;
          condition: CopyCondition;
          photo_url: string | null;
          message: string | null;
          status: DonationStatus;
          is_public_donor: boolean;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          donor_id?: string | null;
          donor_name: string;
          donor_email: string;
          donor_phone?: string | null;
          book_title: string;
          author: string;
          isbn?: string | null;
          quantity?: number;
          category_id?: string | null;
          condition?: CopyCondition;
          photo_url?: string | null;
          message?: string | null;
          status?: DonationStatus;
          is_public_donor?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string | null;
          donor_name?: string;
          donor_email?: string;
          donor_phone?: string | null;
          book_title?: string;
          author?: string;
          isbn?: string | null;
          quantity?: number;
          category_id?: string | null;
          condition?: CopyCondition;
          photo_url?: string | null;
          message?: string | null;
          status?: DonationStatus;
          is_public_donor?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      library_settings: {
        Row: {
          id: string;
          max_books_per_member: number;
          max_books_per_alumni: number;
          default_loan_days: number;
          max_renewals: number;
          fine_per_day: number;
          max_overdue_days: number;
          reservation_valid_hours: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          max_books_per_member?: number;
          max_books_per_alumni?: number;
          default_loan_days?: number;
          max_renewals?: number;
          fine_per_day?: number;
          max_overdue_days?: number;
          reservation_valid_hours?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          max_books_per_member?: number;
          max_books_per_alumni?: number;
          default_loan_days?: number;
          max_renewals?: number;
          fine_per_day?: number;
          max_overdue_days?: number;
          reservation_valid_hours?: number;
          updated_at?: string;
        };
      };
      activity_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category_id: string;
          author_id: string;
          cover_image_url: string | null;
          short_description: string;
          content: string;
          activity_date: string;
          location: string | null;
          is_published: boolean;
          published_at: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category_id: string;
          author_id: string;
          cover_image_url?: string | null;
          short_description: string;
          content: string;
          activity_date: string;
          location?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category_id?: string;
          author_id?: string;
          cover_image_url?: string | null;
          short_description?: string;
          content?: string;
          activity_date?: string;
          location?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_images: {
        Row: {
          id: string;
          activity_id: string;
          image_url: string;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          image_url: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          image_url?: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          banner_image_url: string | null;
          event_date: string;
          start_time: string;
          end_time: string | null;
          location: string;
          registration_required: boolean;
          registration_deadline: string | null;
          max_participants: number | null;
          current_participants: number;
          fee_amount: number;
          status: EventStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          banner_image_url?: string | null;
          event_date: string;
          start_time: string;
          end_time?: string | null;
          location: string;
          registration_required?: boolean;
          registration_deadline?: string | null;
          max_participants?: number | null;
          current_participants?: number;
          fee_amount?: number;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          banner_image_url?: string | null;
          event_date?: string;
          start_time?: string;
          end_time?: string | null;
          location?: string;
          registration_required?: boolean;
          registration_deadline?: string | null;
          max_participants?: number | null;
          current_participants?: number;
          fee_amount?: number;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          guest_count: number;
          payment_status: PaymentStatus;
          transaction_id: string | null;
          attended: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          guest_count?: number;
          payment_status?: PaymentStatus;
          transaction_id?: string | null;
          attended?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          guest_count?: number;
          payment_status?: PaymentStatus;
          transaction_id?: string | null;
          attended?: boolean;
          created_at?: string;
        };
      };
      donation_funds: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          target_amount: number | null;
          raised_amount: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          target_amount?: number | null;
          raised_amount?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          target_amount?: number | null;
          raised_amount?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          fund_id: string;
          profile_id: string | null;
          donor_name: string;
          donor_email: string;
          donor_phone: string | null;
          amount: number;
          currency: string;
          payment_method: string;
          transaction_id: string | null;
          payment_reference: string | null;
          proof_image_url: string | null;
          status: PaymentStatus;
          is_anonymous: boolean;
          message: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fund_id: string;
          profile_id?: string | null;
          donor_name: string;
          donor_email: string;
          donor_phone?: string | null;
          amount: number;
          currency?: string;
          payment_method: string;
          transaction_id?: string | null;
          payment_reference?: string | null;
          proof_image_url?: string | null;
          status?: PaymentStatus;
          is_anonymous?: boolean;
          message?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fund_id?: string;
          profile_id?: string | null;
          donor_name?: string;
          donor_email?: string;
          donor_phone?: string | null;
          amount?: number;
          currency?: string;
          payment_method?: string;
          transaction_id?: string | null;
          payment_reference?: string | null;
          proof_image_url?: string | null;
          status?: PaymentStatus;
          is_anonymous?: boolean;
          message?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          priority: AnnouncementPriority;
          target_audience: string;
          publish_date: string;
          expiry_date: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          priority?: AnnouncementPriority;
          target_audience?: string;
          publish_date?: string;
          expiry_date?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          priority?: AnnouncementPriority;
          target_audience?: string;
          publish_date?: string;
          expiry_date?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          is_read: boolean;
          is_archived: boolean;
          replied_at: string | null;
          reply_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          is_read?: boolean;
          is_archived?: boolean;
          replied_at?: string | null;
          reply_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          is_read?: boolean;
          is_archived?: boolean;
          replied_at?: string | null;
          reply_notes?: string | null;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_active?: boolean;
          subscribed_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      cms_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          filename: string;
          storage_path: string;
          bucket: string;
          mime_type: string;
          size_bytes: number;
          folder: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          storage_path: string;
          bucket?: string;
          mime_type: string;
          size_bytes: number;
          folder?: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          storage_path?: string;
          bucket?: string;
          mime_type?: string;
          size_bytes?: number;
          folder?: string;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_name: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_name: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_name?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      user_has_permission: {
        Args: {
          p_user_id: string;
          p_permission_id: string;
        };
        Returns: boolean;
      };
      current_user_has_permission: {
        Args: {
          p_permission_id: string;
        };
        Returns: boolean;
      };
      issue_book_transaction: {
        Args: {
          p_borrower_id: string;
          p_copy_id: string;
          p_issued_by: string;
          p_loan_days?: number;
        };
        Returns: string;
      };
      return_book_transaction: {
        Args: {
          p_loan_id: string;
          p_returned_to: string;
          p_condition?: CopyCondition;
          p_notes?: string | null;
        };
        Returns: boolean;
      };
      approve_alumni_application: {
        Args: {
          p_application_id: string;
          p_admin_id: string;
          p_admin_notes?: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role_type: UserRole;
      account_status_type: AccountStatus;
      verification_status_type: VerificationStatus;
      visibility_type: VisibilityLevel;
      book_status_type: BookStatus;
      copy_condition_type: CopyCondition;
      loan_status_type: LoanStatus;
      donation_status_type: DonationStatus;
      payment_status_type: PaymentStatus;
      event_status_type: EventStatus;
      announcement_priority_type: AnnouncementPriority;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
