export interface CmsStatCard {
  id: string;
  label: string;
  value?: string;
  liveMetricKey?: "MEMBERS" | "ALUMNI" | "TEACHERS" | "BOOKS" | "NONE";
  suffix?: string;
}

export interface CmsNarrativeBlock {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CmsMilestoneItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface CmsPaymentChannel {
  id: string;
  channelName: string;
  accountNumber: string;
  accountType: string;
  reference: string;
  instructions?: string;
}

export interface CmsDropdownItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface CmsNavItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order?: number;
  isDropdown?: boolean;
  dropdownItems?: CmsDropdownItem[];
  highlight?: boolean;
}

export interface NavbarCmsData {
  showSubBar?: boolean;
  subBarMotto?: string;
  subBarUniversityText?: string;
  subBarDistrictText?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  logoUrl?: string;
  ruetLogoUrl?: string;
  showRuetLogo?: boolean;
  navItems?: CmsNavItem[];
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  showSignInButton?: boolean;
  signInButtonText?: string;
  signInButtonLink?: string;
}

export type CmsSectionPlacement =
  | "AFTER_HERO"
  | "AFTER_STATS"
  | "AFTER_ABOUT"
  | "AFTER_ACTIVITIES"
  | "AFTER_EVENTS"
  | "BEFORE_CONTACT"
  | "BOTTOM";

export type CmsSectionLayout =
  | "RICH_TEXT"
  | "TWO_COLUMN_IMAGE_LEFT"
  | "TWO_COLUMN_IMAGE_RIGHT"
  | "BANNER_CTA"
  | "CARDS_GRID"
  | "PHOTO_GALLERY";

export interface CmsCustomSection {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  content: string;
  layout: CmsSectionLayout;
  imageUrl?: string;
  imageCaption?: string;
  images?: string[];
  ctaText?: string;
  ctaLink?: string;
  bgStyle?: "WHITE" | "WARM" | "MAROON" | "GRADIENT";
  enabled: boolean;
  placement?: CmsSectionPlacement;
  order?: number;
}

export interface HomePageCmsData {
  // Hero Section
  showHeroSection?: boolean;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  mottoText: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  showPrimaryCta?: boolean;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  showSecondaryCta?: boolean;
  heroBannerImages?: string[];

  // Ticker Banner
  showAnnouncementBanner: boolean;
  announcementBannerText?: string;

  // Live & Custom Statistics Cards (Add, Edit, Delete, Reorder)
  showStatsSection?: boolean;
  statCards?: CmsStatCard[];

  // Executive Welcome Narrative
  showWelcomeSection?: boolean;
  welcomeTitle?: string;
  welcomeMessage: string;

  // About Association 2-Column Section
  showAboutSection?: boolean;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutHistory?: string;
  aboutMission?: string;
  aboutVision?: string;
  aboutBlocks?: CmsNarrativeBlock[];
  aboutPhotos?: string[];

  // Activities Chronicle Section
  showActivitiesSection?: boolean;
  activitiesSectionTitle?: string;
  activitiesSectionSubtitle?: string;
  activitiesLimit?: number;

  // Events & Gatherings Section
  showEventsSection?: boolean;
  eventsSectionTitle?: string;
  eventsSectionSubtitle?: string;
  eventsLimit?: number;

  // Contact & Helpdesk Section on Homepage
  showContactSection?: boolean;
  contactSectionTitle?: string;
  contactSectionSubtitle?: string;
  showContactForm?: boolean;

  // Dynamic Custom Sections (Add, Edit, Enable/Disable, Delete)
  customSections?: CmsCustomSection[];
}

export interface AboutPageCmsData {
  missionTitle: string;
  missionContent: string;
  visionTitle: string;
  visionContent: string;
  historyTitle: string;
  historyContent: string;
  constitutionTitle: string;
  constitutionContent: string;
  coreValues: string[];
  milestones?: CmsMilestoneItem[];
}

export interface ContactCmsData {
  campusName: string;
  address: string;
  primaryEmail: string;
  helplinePhone: string;
  alternatePhone?: string;
  officeHours: string;
  emergencyDeskNotice?: string;
  faqs?: CmsFaqItem[];
}

export interface CmsFooterLink {
  id: string;
  title: string;
  url: string;
  category?: "PORTALS" | "AFFAIRS" | "RESOURCES" | "OTHER";
}

export interface SocialFooterCmsData {
  facebookUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  twitterUrl?: string;
  emailContact?: string;
  copyrightText: string;
  footerDescription: string;
  affiliationNotice: string;
  inlineCodeSnippet?: string;
  showInlineCode?: boolean;
  customLinks?: CmsFooterLink[];
}

export interface SeoCmsData {
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  ogImageUrl?: string;
  authorName: string;
  twitterHandle?: string;
}

export interface CmsWelfareFund {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  raisedAmount: number;
  active: boolean;
  category?: string;
  urgent?: boolean;
  order?: number;
}

export interface CmsDonationCampaign {
  id: string;
  title: string;
  badge?: string;
  subtitle?: string;
  story: string;
  bannerImageUrl?: string;
  targetAmount: number;
  raisedAmount: number;
  endDate?: string;
  beneficiary?: string;
  urgent?: boolean;
  active: boolean;
  fundId?: string;
  presetAmounts?: string;
  order?: number;
}

export interface DonatePageCmsData {
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  // Primary Spotlight Campaign
  campaignActive?: boolean;
  campaignTitle?: string;
  campaignBadge?: string;
  campaignSubtitle?: string;
  campaignStory?: string;
  campaignBannerUrl?: string;
  campaignTargetAmount?: number;
  campaignRaisedAmount?: number;
  campaignEndDate?: string;
  campaignBeneficiary?: string;
  campaignUrgent?: boolean;
  campaignPresetAmounts?: string;
  campaignFundId?: string;
  // Multi-Campaigns Manager (Add, Edit, Remove, Enable, Disable)
  campaigns?: CmsDonationCampaign[];
  additionalCampaigns?: CmsDonationCampaign[];
  // Active Welfare Funds Manager (Add, Edit, Remove, Enable, Disable)
  welfareFunds?: CmsWelfareFund[];
  // Payment Channels & Banking Details
  bkashNumber: string;
  bkashType: string;
  bkashReference: string;
  nagadNumber: string;
  nagadType: string;
  nagadReference: string;
  rocketNumber?: string;
  rocketType?: string;
  rocketReference?: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  bankRouting?: string;
  formTitle: string;
  formSubtitle: string;
  transparencyNotice?: string;
  customChannels?: CmsPaymentChannel[];
}

export const DEFAULT_HOMEPAGE_CMS: HomePageCmsData = {
  showHeroSection: true,
  heroBadge: "Official District Association · RUET",
  heroHeadline: "Connecting Engineers, Serving Humanity & Inspiring Community",
  heroSubheadline:
    "The premier student and alumni platform of Sirajganj District Association at Rajshahi University of Engineering & Technology.",
  mottoText: "Take a Stand & Hold a Hand",
  primaryCtaText: "Join Association",
  primaryCtaLink: "/register",
  showPrimaryCta: true,
  secondaryCtaText: "Explore Activities",
  secondaryCtaLink: "/activities",
  showSecondaryCta: true,
  welcomeMessage:
    "Welcome to the official digital hub of SDA RUET. For years, our brotherhood has fostered academic excellence, community service, and professional mentorship across generations.",
  welcomeTitle: "Executive Welcome",
  showWelcomeSection: true,
  announcementBannerText: "Registration is open for Freshers' Reception '26 & Alumni Reunion.",
  showAnnouncementBanner: true,
  heroBannerImages: [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80",
  ],
  showStatsSection: true,
  statCards: [
    { id: "stat-1", label: "Active Student Members", liveMetricKey: "MEMBERS", suffix: "+" },
    { id: "stat-2", label: "Verified Alumni Engineers", liveMetricKey: "ALUMNI", suffix: "+" },
    { id: "stat-3", label: "Faculty & Advisors", liveMetricKey: "TEACHERS", suffix: "+" },
    { id: "stat-4", label: "Library Textbooks", liveMetricKey: "BOOKS", suffix: "+" },
  ],
  showAboutSection: true,
  aboutTitle: "About Sirajganj District Association, RUET",
  aboutSubtitle: "Uniting Generations of Engineers & Fostering Brotherhood Since Inception",
  aboutHistory:
    "Founded by dedicated RUET seniors from Sirajganj, the association was created to provide an institutional home and mutual support for freshmen arriving on campus. Over the years, it has evolved into a formally chartered organization connecting students, faculty patrons, and hundreds of alumni engineers working across Bangladesh and the globe.",
  aboutMission:
    "To unite, support, and mentor every student and graduate of Rajshahi University of Engineering & Technology originating from Sirajganj through free textbook loans, student welfare funds, career development, and social solidarity.",
  aboutVision:
    "To build an enduring, self-sustaining community of visionary engineers and scholars who lead technological progress, champion humanitarian service, and bring pride to our native Sirajganj.",
  aboutBlocks: [
    {
      id: "block-1",
      title: "Heritage & Roots",
      content:
        "Founded by dedicated RUET seniors from Sirajganj, the association was created to provide an institutional home and mutual support for freshmen arriving on campus. Over the years, it has evolved into a formally chartered organization connecting students, faculty patrons, and hundreds of alumni engineers working across Bangladesh and the globe.",
      icon: "Building2",
    },
    {
      id: "block-2",
      title: "Our Guiding Mission",
      content:
        "To unite, support, and mentor every student and graduate of Rajshahi University of Engineering & Technology originating from Sirajganj through free textbook loans, student welfare funds, career development, and social solidarity.",
      icon: "Award",
    },
    {
      id: "block-3",
      title: "Our Vision for the Future",
      content:
        "To build an enduring, self-sustaining community of visionary engineers and scholars who lead technological progress, champion humanitarian service, and bring pride to our native Sirajganj.",
      icon: "Sparkles",
    },
  ],
  aboutPhotos: [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  ],
  showActivitiesSection: true,
  activitiesSectionTitle: "Recent Activities & Stories",
  activitiesSectionSubtitle: "Association Chronicle",
  activitiesLimit: 3,
  showEventsSection: true,
  eventsSectionTitle: "Featured Events & Receptions",
  eventsSectionSubtitle: "Campus Gatherings",
  eventsLimit: 3,
  showContactSection: true,
  contactSectionTitle: "Get in Touch & Campus Helpdesk",
  contactSectionSubtitle: "Direct Communication",
  showContactForm: true,
};

export const DEFAULT_ABOUT_PAGE_CMS: AboutPageCmsData = {
  missionTitle: "Our Guiding Mission",
  missionContent:
    "To unite, support, and empower every student and graduate of Rajshahi University of Engineering & Technology originating from Sirajganj district through academic aid, career mentorship, humanitarian service, and social solidarity.",
  visionTitle: "Our Vision for the Future",
  visionContent:
    "To build a thriving, self-sustaining community of visionary engineers and scholars who lead technological advancement, champion social equity, and uplift our beloved Sirajganj and Bangladesh.",
  historyTitle: "Association Heritage & Roots",
  historyContent:
    "Established by dedicated RUET seniors from Sirajganj, the association grew from an informal student welfare circle into a formally chartered academic, cultural, and humanitarian institution with thousands of alumni serving worldwide.",
  constitutionTitle: "Association Constitution & Bylaws",
  constitutionContent:
    "The association is governed by an elected Executive Committee in accordance with its democratic constitution, promoting transparency, fraternal unity, student welfare, and strict non-partisanship.",
  coreValues: [
    "Fraternal Solidarity & Community Care",
    "Academic & Engineering Excellence",
    "Integrity & Uncompromising Transparency",
    "Empowerment & Continuous Mentorship",
    "Humanitarian Service to Society",
  ],
};

export const DEFAULT_CONTACT_CMS: ContactCmsData = {
  campusName: "Rajshahi University of Engineering & Technology (RUET)",
  address: "Kazla, Motihar, Rajshahi-6204, Bangladesh",
  primaryEmail: "contact@sda-ruet.org",
  helplinePhone: "+880 1700-000000",
  alternatePhone: "+880 1800-000000",
  officeHours: "Sunday – Thursday: 4:00 PM – 8:00 PM",
  emergencyDeskNotice: "For immediate student blood requirement or medical emergency, contact our 24/7 volunteer hotline.",
};

export const DEFAULT_SOCIAL_FOOTER_CMS: SocialFooterCmsData = {
  facebookUrl: "https://facebook.com/sdaruet",
  linkedinUrl: "https://linkedin.com/company/sdaruet",
  youtubeUrl: "https://youtube.com/@sdaruet",
  githubUrl: "https://github.com/sda-ruet",
  instagramUrl: "https://instagram.com/sdaruet",
  whatsappNumber: "+880 1700-000000",
  twitterUrl: "https://twitter.com/sdaruet",
  emailContact: "contact@sda-ruet.org",
  copyrightText: "© 2026 Sirajganj District Association, RUET (SDA RUET). All Rights Reserved.",
  footerDescription:
    "Empowering engineering students and alumni of Sirajganj district at Rajshahi University of Engineering & Technology.",
  affiliationNotice: "Take a Stand & Hold a Hand · Established at RUET, Rajshahi-6204",
  inlineCodeSnippet: "const fraternalBond = (engineer) => engineer.origin === 'Sirajganj' && engineer.almaMater === 'RUET';",
  showInlineCode: true,
  customLinks: [
    { id: "fl-1", title: "Digital Textbook Library", url: "/library", category: "PORTALS" },
    { id: "fl-2", title: "Verified Alumni Directory", url: "/alumni", category: "PORTALS" },
    { id: "fl-3", title: "Student Welfare Fund", url: "/donate", category: "PORTALS" },
    { id: "fl-4", title: "Executive Committee", url: "/committee", category: "AFFAIRS" },
    { id: "fl-5", title: "Constitution & Bylaws", url: "/about", category: "AFFAIRS" },
    { id: "fl-6", title: "Member FAQs & Helpdesk", url: "/faq", category: "AFFAIRS" },
  ],
};

export const DEFAULT_SEO_CMS: SeoCmsData = {
  siteTitle: "Sirajganj District Association, RUET (SDA RUET)",
  siteDescription:
    "Official website of Sirajganj District Association, RUET. Connecting engineering students, alumni directory, digital library, event registrations, and community welfare.",
  keywords: [
    "SDA RUET",
    "Sirajganj District Association",
    "RUET",
    "Rajshahi University of Engineering & Technology",
    "Alumni Network",
    "Student Welfare",
    "Engineers Bangladesh",
  ],
  ogImageUrl: "/assets/Sda-PNG.png",
  authorName: "SDA RUET Executive Committee",
  twitterHandle: "@sdaruet",
};

export const DEFAULT_DONATE_PAGE_CMS: DonatePageCmsData = {
  heroBadge: "Welfare & Solidarity",
  heroHeadline: "Support RUET Students from Sirajganj",
  heroSubheadline:
    "Your generous contributions empower disadvantaged students with emergency medical aid, semester book allocations, and educational grants. Every contribution is verified transparently.",
  campaignActive: false,
  campaignTitle: "",
  campaignBadge: "Active Welfare Drive",
  campaignSubtitle: "",
  campaignStory: "",
  campaignBannerUrl: "",
  campaignTargetAmount: 0,
  campaignRaisedAmount: 0,
  campaignEndDate: "",
  campaignBeneficiary: "",
  campaignUrgent: false,
  campaignPresetAmounts: "500, 1000, 2000, 5000, 10000",
  campaigns: [],
  additionalCampaigns: [],
  welfareFunds: [],
  bkashNumber: "01700-000000",
  bkashType: "bKash Personal / Merchant",
  bkashReference: "SDA-WELFARE",
  nagadNumber: "01700-000000",
  nagadType: "Nagad Personal",
  nagadReference: "SDA-WELFARE",
  rocketNumber: "01700-000000-0",
  rocketType: "Rocket Personal",
  rocketReference: "SDA-WELFARE",
  bankAccountName: "Sirajganj District Association, RUET",
  bankAccountNumber: "2050XXXXXXXX",
  bankName: "Islami Bank Bangladesh Ltd.",
  bankBranch: "RUET Branch, Rajshahi-6204",
  bankRouting: "125271890",
  formTitle: "Submit Contribution Record",
  formSubtitle:
    "After sending funds via bKash, Nagad, Rocket, or Bank Deposit, submit the transaction ID below for treasurer verification.",
  transparencyNotice:
    "100% of public donations are audited and published on the verified donors roll to maintain financial accountability.",
};

export const DEFAULT_NAVBAR_CMS: NavbarCmsData = {
  showSubBar: true,
  subBarMotto: "Take a Stand & Hold a Hand",
  subBarUniversityText: "Rajshahi University of Engineering & Technology (RUET)",
  subBarDistrictText: "Sirajganj District",
  brandTitle: "SDA RUET",
  brandSubtitle: "Sirajganj District Association, RUET",
  logoUrl: "/assets/Sda-PNG.png",
  ruetLogoUrl: "/assets/ruet_logo.png",
  showRuetLogo: true,
  navItems: [
    {
      id: "nav-home",
      label: "Home",
      href: "/",
      enabled: true,
      order: 1,
    },
    {
      id: "nav-library",
      label: "Digital Library",
      href: "/library",
      enabled: true,
      order: 2,
    },
    {
      id: "nav-members",
      label: "Members",
      href: "#",
      enabled: true,
      order: 3,
      isDropdown: true,
      dropdownItems: [
        {
          id: "mem-faculty",
          label: "Faculty Members",
          href: "/teachers",
          description: "Teachers & Advisors",
          icon: "Building2",
        },
        {
          id: "mem-students",
          label: "Students",
          href: "/members",
          description: "Undergrad & Postgrad",
          icon: "GraduationCap",
        },
        {
          id: "mem-alumni",
          label: "Alumni",
          href: "/alumni",
          description: "Verified RUET Graduates",
          icon: "Users",
        },
      ],
    },
    {
      id: "nav-committee",
      label: "Committee",
      href: "#",
      enabled: true,
      order: 4,
      isDropdown: true,
      dropdownItems: [
        {
          id: "com-current",
          label: "Current Executive Committee",
          href: "/committee",
          description: "Active governing body",
          icon: "Award",
        },
        {
          id: "com-archive",
          label: "Previous Executive Committee",
          href: "/committee/archive",
          description: "Historical sessions & rosters",
          icon: "History",
        },
      ],
    },
    {
      id: "nav-activities",
      label: "Activities",
      href: "/activities",
      enabled: true,
      order: 5,
    },
    {
      id: "nav-events",
      label: "Events",
      href: "/events",
      enabled: true,
      order: 6,
    },
    {
      id: "nav-donate",
      label: "Donate",
      href: "/donate",
      enabled: true,
      order: 7,
      highlight: true,
    },
    {
      id: "nav-contact",
      label: "Contact",
      href: "/contact",
      enabled: true,
      order: 8,
    },
  ],
  showCtaButton: true,
  ctaButtonText: "Join SDA",
  ctaButtonLink: "/register",
  showSignInButton: true,
  signInButtonText: "Sign In",
  signInButtonLink: "/login",
};

