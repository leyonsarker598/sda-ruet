"use client";

import * as React from "react";
import { Globe, Mail, ExternalLink } from "lucide-react";

interface SocialLinksViewProps {
  socialLinks?: {
    linkedin?: string | null;
    github?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    website?: string | null;
    [key: string]: any;
  } | null;
  email?: string | null;
  className?: string;
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SocialLinksView({ socialLinks, email, className = "" }: SocialLinksViewProps) {
  const links = socialLinks || {};

  const items = [
    {
      id: "linkedin",
      url: links.linkedin,
      label: "LinkedIn",
      icon: <LinkedInIcon className="w-3.5 h-3.5 text-[#0077B5]" />,
      bgHover: "hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30 hover:text-[#0077B5]",
    },
    {
      id: "github",
      url: links.github,
      label: "GitHub",
      icon: <GitHubIcon className="w-3.5 h-3.5 text-[#24292F]" />,
      bgHover: "hover:bg-[#24292F]/10 hover:border-[#24292F]/30 hover:text-[#24292F]",
    },
    {
      id: "facebook",
      url: links.facebook,
      label: "Facebook",
      icon: <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />,
      bgHover: "hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2]",
    },
    {
      id: "twitter",
      url: links.twitter,
      label: "Twitter / X",
      icon: <TwitterIcon className="w-3.5 h-3.5 text-[#0F172A]" />,
      bgHover: "hover:bg-[#0F172A]/10 hover:border-[#0F172A]/30 hover:text-[#0F172A]",
    },
    {
      id: "website",
      url: links.website,
      label: "Portfolio",
      icon: <Globe className="w-3.5 h-3.5 text-[#7B2D26]" />,
      bgHover: "hover:bg-[#7B2D26]/10 hover:border-[#7B2D26]/30 hover:text-[#7B2D26]",
    },
    {
      id: "email",
      url: email ? `mailto:${email}` : null,
      label: "Email",
      icon: <Mail className="w-3.5 h-3.5 text-amber-700" />,
      bgHover: "hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800",
    },
  ].filter((item) => Boolean(item.url));

  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url!}
          target={item.id === "email" ? undefined : "_blank"}
          rel={item.id === "email" ? undefined : "noopener noreferrer"}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D9] bg-white text-xs font-semibold text-[#334155] shadow-2xs transition-all ${item.bgHover}`}
          title={`${item.label}: ${item.url}`}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.id !== "email" && <ExternalLink className="w-2.5 h-2.5 opacity-50 ml-0.5" />}
        </a>
      ))}
    </div>
  );
}
