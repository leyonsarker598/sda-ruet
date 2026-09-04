"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  uploadCommitteeRosterAction,
  type AdminCommitteeResult,
} from "@/actions/adminCommittee";
import {
  parseCommitteeCSV,
  generateSampleCommitteeCSV,
  type CommitteeCSVRow,
} from "@/lib/csvHelpers";
import type { AdminCommitteeItem } from "@/services/adminCommitteeService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  FileUp,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon,
  HelpCircle,
} from "lucide-react";

interface UploadCommitteeModalProps {
  committeeId?: string;
  committees?: AdminCommitteeItem[];
}

export function UploadCommitteeModal({
  committeeId,
  committees = [],
}: UploadCommitteeModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = React.useState(committeeId || "");
  const [replaceRoster, setReplaceRoster] = React.useState(true);
  const [csvText, setCsvText] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [parsedPreview, setParsedPreview] = React.useState<CommitteeCSVRow[]>([]);
  const [parseErrors, setParseErrors] = React.useState<string[]>([]);

  const [state, formAction, isPending] = useActionState<AdminCommitteeResult | null, FormData>(
    uploadCommitteeRosterAction,
    null
  );

  React.useEffect(() => {
    if (committeeId) {
      setSelectedCommitteeId(committeeId);
    } else if (committees.length > 0 && !selectedCommitteeId) {
      setSelectedCommitteeId(committees[0].id);
    }
  }, [committeeId, committees, selectedCommitteeId]);

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      setCsvText("");
      setFileName("");
      setParsedPreview([]);
    }
  }, [state?.success]);

  // Handle client-side CSV / TSV text parsing preview
  const handleContentChange = (content: string) => {
    setCsvText(content);
    if (!content.trim()) {
      setParsedPreview([]);
      setParseErrors([]);
      return;
    }
    const { rows, errors } = parseCommitteeCSV(content);
    setParsedPreview(rows);
    setParseErrors(errors);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const text = await file.text();
      handleContentChange(text);
    } catch {
      setParseErrors(["Could not read file contents. Please upload a standard CSV or TSV file."]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = generateSampleCommitteeCSV();
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sda_ruet_committee_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        leftIcon={<FileUp className="w-4 h-4 text-[#7B2D26]" />}
        className="font-semibold text-xs border-[#DFCEB5] hover:bg-[#FAF5F5]"
      >
        Upload Committee (CSV/Excel)
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Batch Upload Executive Committee Roster"
        description="Upload committee members and designations from a CSV or Excel file to automatically configure the session roster."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.message && state.success && (
            <Alert variant="success">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Hidden Form Fields */}
          <input type="hidden" name="committeeId" value={selectedCommitteeId} />
          <input type="hidden" name="replaceRoster" value={replaceRoster ? "true" : "false"} />
          <input type="hidden" name="csvText" value={csvText} />

          {/* Target Committee Term Selector */}
          {!committeeId && committees.length > 0 && (
            <div>
              <Label htmlFor="committeeSelect" required>
                Target Committee Term
              </Label>
              <Select
                id="committeeSelect"
                value={selectedCommitteeId}
                onChange={(e) => setSelectedCommitteeId(e.target.value)}
              >
                {committees.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.term_name} {term.is_current ? "(Current Active Term)" : "(Archived)"}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Template Download & Help Banner */}
          <div className="bg-[#FAF5F5] border border-[#E8E2D9] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-[#7B2D26] flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-[#0F172A] block">
                  CSV / Excel Template Format
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Columns: Full Name, Designation, Department, Series, Session, Photo URL, Bio
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleDownloadTemplate}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#7B2D26]" />}
              className="text-[#7B2D26] font-semibold text-xs flex-shrink-0"
            >
              Download Sample CSV
            </Button>
          </div>

          {/* File Picker */}
          <div>
            <Label htmlFor="csvFileInput" required>
              Choose CSV or Excel Spreadsheet (.csv, .tsv, .txt)
            </Label>
            <div className="mt-1 flex items-center gap-3">
              <input
                id="csvFileInput"
                type="file"
                accept=".csv, .tsv, .txt, text/csv, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="text-xs text-[#64748B] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FAF5F5] file:text-[#7B2D26] hover:file:bg-[#F3EFEA] cursor-pointer"
              />
              {fileName && (
                <span className="text-xs font-semibold text-[#0F172A] truncate">
                  {fileName}
                </span>
              )}
            </div>
          </div>

          {/* Or Paste Raw CSV Data */}
          <div>
            <Label htmlFor="pasteData">Or Paste CSV / Tab-Separated Data</Label>
            <Textarea
              id="pasteData"
              rows={3}
              value={csvText}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Paste table data or comma-separated rows directly from Excel/Sheets..."
              className="text-xs font-mono"
            />
          </div>

          {/* Mode Toggle: Replace vs Append */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-[#1E293B] cursor-pointer">
              <input
                type="checkbox"
                checked={replaceRoster}
                onChange={(e) => setReplaceRoster(e.target.checked)}
                className="w-4 h-4 rounded text-[#7B2D26] focus:ring-[#7B2D26]"
              />
              <span>
                <strong>Replace entire roster</strong> (clears previous members of this term before importing)
              </span>
            </label>
          </div>

          {/* Parsing Errors */}
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                {parseErrors.join(" ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Real-time Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-[#7B2D26]" />
                  Preview: {parsedPreview.length} Members Ready to Import
                </span>
                <Badge variant="success" size="sm">
                  Parsed Successfully
                </Badge>
              </div>

              <div className="max-h-40 overflow-y-auto border border-[#E8E2D9] rounded-xl bg-[#FBF9F5] p-2 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E8E2D9] text-[10px] text-[#64748B] uppercase font-bold">
                      <th className="p-1">#</th>
                      <th className="p-1">Full Name</th>
                      <th className="p-1">Designation</th>
                      <th className="p-1">Dept</th>
                      <th className="p-1">Series</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1ECE4] last:border-0 text-[11px]">
                        <td className="p-1 text-[#64748B]">{idx + 1}</td>
                        <td className="p-1 font-semibold text-[#0F172A]">{row.name}</td>
                        <td className="p-1 text-[#7B2D26] font-medium">{row.designation}</td>
                        <td className="p-1 text-[#64748B]">{row.department || "-"}</td>
                        <td className="p-1 text-[#64748B]">{row.series || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedPreview.length > 10 && (
                  <div className="text-[10px] text-center text-[#64748B] pt-1">
                    + {parsedPreview.length - 10} more rows...
                  </div>
                )}
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || parsedPreview.length === 0}
              className="font-semibold text-xs"
            >
              {isPending
                ? "Importing Committee..."
                : `Import ${parsedPreview.length > 0 ? `${parsedPreview.length} Members` : "Committee"}`}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
