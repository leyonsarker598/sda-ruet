import type { Metadata } from "next";
import Link from "next/link";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import { getAdminBooks } from "@/services/adminLibraryService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateBookModal } from "@/features/admin/LibraryForms";
import { BookOpen, ArrowLeft, Layers, ArrowRight } from "lucide-react";
import { getLibraryCategories } from "@/services/libraryService";

export const metadata: Metadata = {
  title: "Book Catalog Inventory | Admin Console",
  description: "Add, edit, and audit engineering textbooks and physical barcode ledgers.",
};

export default async function AdminBookCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await requirePermissionOrRole("library.manage", ["ADMIN", "LIBRARIAN"]);
  const resolvedParams = await searchParams;

  const categories = await getLibraryCategories();
  const { books, count } = await getAdminBooks({
    categoryId: resolvedParams.category,
    search: resolvedParams.q,
  });

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
          <Link href="/admin/library" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Circulation Desk
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Textbook Inventory Catalog
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage titles, editions, shelf locations, and physical copy ledgers ({count} titles).
          </p>
        </div>

        <CreateBookModal categories={categories} />
      </div>

      {/* Books Table */}
      {books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6 text-[#7B2D26]" />}
          title="No Books Found"
          description="Use the 'Catalog New Book' button above to add textbooks to the library collection."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book Title &amp; Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Shelf Location</TableHead>
              <TableHead>Copies (Available / Total)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">{book.title}</div>
                  <div className="text-[11px] text-[#64748B]">
                    By {book.author} {book.edition ? `· ${book.edition}` : ""}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {book.category?.name || "General"}
                  </Badge>
                </TableCell>

                <TableCell className="font-mono text-xs text-[#0F172A]">
                  {book.shelf_location || "Open Stacks"}
                </TableCell>

                <TableCell className="text-xs font-semibold">
                  <span className={book.available_copies > 0 ? "text-[#15803D]" : "text-[#DC2626]"}>
                    {book.available_copies}
                  </span>{" "}
                  / {book.total_copies} available
                </TableCell>

                <TableCell>
                  <Badge
                    variant={book.available_copies > 0 ? "success" : "warning"}
                    size="sm"
                    dot
                  >
                    {book.available_copies > 0 ? "Available" : "Borrowed Out"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline">
                    <Link href={`/library/${book.id}`} target="_blank" className="flex items-center gap-1">
                      View Public <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
