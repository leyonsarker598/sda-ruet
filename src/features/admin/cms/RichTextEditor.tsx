"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Eye,
  Sparkles,
  Type,
  Palette,
  RotateCcw,
} from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitizer";

interface RichTextEditorProps {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  rows?: number;
  required?: boolean;
  description?: string;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

export function RichTextEditor({
  id,
  name,
  label,
  defaultValue = "",
  value: controlledValue,
  onChange: controlledOnChange,
  rows = 4,
  required = false,
  description,
  placeholder,
  compact = false,
  className = "",
}: RichTextEditorProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [showPreview, setShowPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const currentValue = isControlled ? controlledValue : internalValue;

  const handleTextChange = (newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    controlledOnChange?.(newVal);
  };

  const insertTag = (openTag: string, closeTag = "", defaultSelection = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end);
    const replacement = `${openTag}${selectedText || defaultSelection}${closeTag}`;

    const nextValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    handleTextChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + replacement.length - closeTag.length
      );
    }, 10);
  };

  const insertLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://... or /about):", "https://");
    if (!url) return;
    insertTag(`<a href="${url}" class="text-[#7B2D26] underline hover:text-[#5E1F1A]">`, "</a>", "link text");
  };

  const insertColor = (colorClass: string) => {
    insertTag(`<span class="${colorClass}">`, "</span>", "highlighted text");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} required={required} className="text-xs font-semibold text-[#0F172A]">
            {label}
          </Label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7B2D26] hover:text-[#5E1F1A] px-2 py-0.5 rounded-md hover:bg-[#FAF5F5] transition-colors"
          >
            <Eye className="w-3 h-3" />
            {showPreview ? "Edit Text" : "Live Preview"}
          </button>
        </div>
      )}

      {description && <p className="text-[11px] text-[#64748B]">{description}</p>}

      {!showPreview ? (
        <div className="border border-[#E8E2D9] rounded-2xl bg-white focus-within:border-[#7B2D26] focus-within:ring-2 focus-within:ring-[#7B2D26]/10 transition-all overflow-hidden shadow-2xs">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b border-[#F0ECE6] bg-[#FAF8F5] px-2 py-1 text-[#334155]">
            {/* Bold */}
            <button
              type="button"
              onClick={() => insertTag("<b>", "</b>")}
              className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs font-bold"
              title="Bold (<b>...</b>)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => insertTag("<i>", "</i>")}
              className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs italic"
              title="Italic (<i>...</i>)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => insertTag("<u>", "</u>")}
              className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
              title="Underline (<u>...</u>)"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-[#E8E2D9] mx-1" />

            {/* Headings */}
            {!compact && (
              <>
                <button
                  type="button"
                  onClick={() => insertTag("<h2>", "</h2>")}
                  className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs font-semibold"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<h3>", "</h3>")}
                  className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs font-semibold"
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-[#E8E2D9] mx-1" />
              </>
            )}

            {/* Color Emphases */}
            <button
              type="button"
              onClick={() => insertColor("text-[#7B2D26] font-bold")}
              className="px-1.5 py-0.5 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-[11px] font-bold text-[#7B2D26]"
              title="Maroon Brand Color"
            >
              Maroon
            </button>
            <button
              type="button"
              onClick={() => insertColor("text-[#C5A880] font-bold")}
              className="px-1.5 py-0.5 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-[11px] font-bold text-[#B08D55]"
              title="Gold Accent Color"
            >
              Gold
            </button>
            <button
              type="button"
              onClick={() => insertColor("text-[#15803D] font-bold")}
              className="px-1.5 py-0.5 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-[11px] font-bold text-[#15803D]"
              title="Green Success Color"
            >
              Green
            </button>

            <div className="w-px h-3.5 bg-[#E8E2D9] mx-1" />

            {/* Lists */}
            {!compact && (
              <>
                <button
                  type="button"
                  onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>", "List item")}
                  className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<ol>\n  <li>", "</li>\n</ol>", "List item")}
                  className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<blockquote>", "</blockquote>", "Quote")}
                  className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Hyperlink */}
            <button
              type="button"
              onClick={insertLink}
              className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            {/* Badge Highlight */}
            <button
              type="button"
              onClick={() => insertTag('<span class="inline-block px-2 py-0.5 rounded-md bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold">', "</span>", "Badge")}
              className="p-1 rounded-lg hover:bg-[#E8E2D9]/60 transition-colors text-xs"
              title="Insert Highlight Badge"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            </button>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={currentValue}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={compact ? 2 : rows}
            required={required}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 text-xs text-[#0F172A] bg-transparent focus:outline-hidden font-normal leading-relaxed resize-y"
          />
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] min-h-[80px] text-xs text-[#0F172A] prose prose-sm max-w-none shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#64748B] mb-2 border-b border-[#E8E2D9] pb-1">
            Live Formatted Preview:
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(currentValue) || "<span class='text-slate-400 italic'>No content entered yet.</span>",
            }}
          />
        </div>
      )}
    </div>
  );
}
