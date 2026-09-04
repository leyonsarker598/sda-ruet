"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AlumniFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const search = formData.get("search")?.toString().trim();
    const department = formData.get("department")?.toString().trim();
    const series = formData.get("series")?.toString().trim();
    const graduationYear = formData.get("graduationYear")?.toString().trim();

    if (search) params.set("q", search);
    if (department && department !== "all") params.set("dept", department);
    if (series && series !== "all") params.set("series", series);
    if (graduationYear && graduationYear !== "all") params.set("year", graduationYear);

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Input
            name="search"
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Name, company, designation..."
            defaultValue={searchParams.get("q") || ""}
          />
        </div>

        <div>
          <Select name="department" defaultValue={searchParams.get("dept") || "all"}>
            <option value="all">All Departments</option>
            <option value="CSE">Computer Science &amp; Engineering</option>
            <option value="EEE">Electrical &amp; Electronic Engineering</option>
            <option value="CE">Civil Engineering</option>
            <option value="ME">Mechanical Engineering</option>
            <option value="ETE">Electronics &amp; Telecommunication</option>
            <option value="IPE">Industrial &amp; Production</option>
            <option value="GCE">Glass &amp; Ceramic Engineering</option>
            <option value="MTE">Mechatronics Engineering</option>
            <option value="ECE">Electrical &amp; Computer Engineering</option>
            <option value="CFPE">Chemical &amp; Food Process</option>
            <option value="MSE">Materials Science &amp; Engineering</option>
            <option value="Arch">Architecture</option>
            <option value="URP">Urban &amp; Regional Planning</option>
            <option value="BECM">Building Engineering &amp; Construction</option>
          </Select>
        </div>

        <div>
          <Select name="series" defaultValue={searchParams.get("series") || "all"}>
            <option value="all">All Series / Batches</option>
            {Array.from({ length: 30 }, (_, i) => {
              const s = String(95 + i).slice(-2);
              return (
                <option key={s} value={s}>
                  Series &apos;{s}
                </option>
              );
            })}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" className="w-full text-xs" leftIcon={<Search className="w-3.5 h-3.5" />}>
            Search Directory
          </Button>
          {(searchParams.get("q") || searchParams.get("dept") || searchParams.get("series") || searchParams.get("year")) && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleReset}
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
