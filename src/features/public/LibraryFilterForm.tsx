"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { BookCategoryItem } from "@/services/libraryService";

export function LibraryFilterForm({ categories }: { categories: BookCategoryItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const search = formData.get("search")?.toString().trim();
    const categoryId = formData.get("categoryId")?.toString().trim();
    const availableOnly = formData.get("availableOnly")?.toString();

    if (search) params.set("q", search);
    if (categoryId && categoryId !== "all") params.set("cat", categoryId);
    if (availableOnly) params.set("available", "true");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            name="search"
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search textbook title, author name, or ISBN..."
            defaultValue={searchParams.get("q") || ""}
          />
        </div>

        <div>
          <Select name="categoryId" defaultValue={searchParams.get("cat") || "all"}>
            <option value="all">All Disciplines &amp; Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F3EFEA]">
        <Checkbox
          name="availableOnly"
          value="true"
          defaultChecked={searchParams.get("available") === "true"}
          label="Show only books with available copies in library"
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
            Search Books
          </Button>
          {(searchParams.get("q") || searchParams.get("cat") || searchParams.get("available")) && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleReset}
              title="Reset Search Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
