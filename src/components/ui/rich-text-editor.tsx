"use client";

import * as React from "react";
import { Button } from "./button";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Clock,
  Eye,
  Edit3,
} from "lucide-react";

interface RichTextEditorProps {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export function RichTextEditor({
  id,
  name,
  defaultValue = "",
  placeholder = "Write detailed program overview, schedule milestones, and guest info...",
  rows = 6,
  required = false,
}: RichTextEditorProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [isPreview, setIsPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || "text";

    const replacement = `${before}${selectedText}${after}`;
    const nextValue =
      previousText.substring(0, start) +
      replacement +
      previousText.substring(end);

    setValue(nextValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  return (
    <div className="border border-[#E8E2D9] rounded-xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-[#7B2D26]/20 focus-within:border-[#7B2D26]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#F3EFEA] bg-[#FAF5F5] px-3 py-1.5 gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("**", "**")}
            className="h-7 w-7 p-0 text-[#64748B] hover:text-[#0F172A]"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("*", "*")}
            className="h-7 w-7 p-0 text-[#64748B] hover:text-[#0F172A]"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>

          <div className="w-[1px] h-4 bg-[#E8E2D9] mx-1" />

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("## ")}
            className="h-7 px-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
            title="Section Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("### ")}
            className="h-7 px-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
            title="Subheading"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </Button>

          <div className="w-[1px] h-4 bg-[#E8E2D9] mx-1" />

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("- ")}
            className="h-7 w-7 p-0 text-[#64748B] hover:text-[#0F172A]"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("1. ")}
            className="h-7 w-7 p-0 text-[#64748B] hover:text-[#0F172A]"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => insertSnippet("> ")}
            className="h-7 w-7 p-0 text-[#64748B] hover:text-[#0F172A]"
            title="Quote / Note"
          >
            <Quote className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() =>
              insertSnippet(
                "\n### Program Schedule Timeline\n- **10:00 AM** – Reception & Guest Registration\n- **11:30 AM** – Keynote Address & Panel Discussion\n- **01:30 PM** – Feast & Networking Lunch\n- **03:30 PM** – Cultural Segment & Musical Evening\n"
              )
            }
            className="h-7 px-2 text-[11px] font-semibold text-[#7B2D26] hover:bg-[#FAF5F5]"
            title="Insert Timeline Template"
          >
            <Clock className="w-3 h-3 mr-1" />
            + Schedule
          </Button>
        </div>

        {/* Live Preview Toggle */}
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => setIsPreview(!isPreview)}
          className="h-6 text-[10px] font-medium border-[#DFCEB5]"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-3 h-3 mr-1 text-[#7B2D26]" /> Edit Text
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1 text-[#7B2D26]" /> Live Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor Body or Live Preview */}
      {isPreview ? (
        <div className="p-4 min-h-[140px] text-xs sm:text-sm text-[#1E293B] leading-relaxed whitespace-pre-line bg-[#FCFBF9] prose prose-slate max-w-none">
          {value ? value : <span className="text-[#94A3B8] italic">No content written yet...</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full p-3 text-xs sm:text-sm text-[#0F172A] focus:outline-hidden resize-y font-mono leading-relaxed"
        />
      )}
    </div>
  );
}
