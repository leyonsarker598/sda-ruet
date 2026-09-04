/**
 * HTML Sanitizer & Security Utilities
 * Strips malicious script vectors, event handlers, dangerous schemes, and disallowed elements
 * while preserving safe formatting tags for academic and organizational CMS content.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "span",
  "div",
  "a",
]);

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, // Matches onclick, onerror, onload, etc.
  /javascript\s*:\s*[^\s"'>]+/gi, // Matches javascript: pseudo-protocol
  /data\s*:\s*text\/html[^\s"'>]+/gi,
  /vbscript\s*:\s*[^\s"'>]+/gi,
];

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";

  let clean = dirty;

  // 1. Remove dangerous blocks & inline event handlers
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }

  // 2. Parse tags and strip non-whitelisted tags while retaining inner text
  clean = clean.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/g, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return ""; // Strip tag entirely
    }

    // If it's a closing tag
    if (match.startsWith("</")) {
      return `</${lowerTag}>`;
    }

    // If it's an anchor tag, clean its href and add rel/target
    if (lowerTag === "a") {
      const hrefMatch = attrs.match(/href\s*=\s*["']([^"']*)["']/i);
      let href = hrefMatch ? hrefMatch[1].trim() : "#";
      if (
        href.toLowerCase().startsWith("javascript:") ||
        href.toLowerCase().startsWith("data:") ||
        href.toLowerCase().startsWith("vbscript:")
      ) {
        href = "#";
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#7B2D26] underline hover:text-[#5E1F1A]">`;
    }

    // For hr, br
    if (lowerTag === "br" || lowerTag === "hr") {
      return `<${lowerTag} />`;
    }

    // Default safe tag without unvetted attributes
    return `<${lowerTag}>`;
  });

  return clean.trim();
}
