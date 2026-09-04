import { Spinner } from "@/components/ui/loading";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-center shadow-xs">
        <Spinner size="lg" color="primary" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-[#7B2D26] uppercase tracking-wider">
          Sirajganj District Association, RUET
        </p>
        <p className="text-xs text-[#64748B] mt-0.5">Loading data...</p>
      </div>
    </div>
  );
}
