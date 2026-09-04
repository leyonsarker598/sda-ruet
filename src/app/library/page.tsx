import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Search, CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LibraryFilterForm } from "@/features/public/LibraryFilterForm";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getBooksCatalog, getBookCategories } from "@/services/libraryService";

export const metadata: Metadata = {
  title: "Digital Textbook Library Catalog",
  description:
    "Search and explore engineering textbooks, reference volumes, and academic literature available at the SDA RUET Digital Library.",
};

export default async function LibraryCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; available?: string }>;
}) {
  const resolvedParams = await searchParams;
  const profile = await getCurrentProfile();
  const categories = await getBookCategories();
  const { books, count } = await getBooksCatalog({
    search: resolvedParams.q,
    categoryId: resolvedParams.cat,
    availableOnly: resolvedParams.available === "true",
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              SDA RUET Library
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
              Textbook Catalog
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Browse {count} engineering textbooks and reference titles available for loan to RUET members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/library/donate">Donate Books</Link>
            </Button>
            {!profile && (
              <Button asChild size="sm">
                <Link href="/login">Sign In to Borrow</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <LibraryFilterForm categories={categories} />

        {/* Books Grid */}
        {books.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6 text-[#7B2D26]" />}
            title="No Books Found in Catalog"
            description="No books matched your search or category filter. Try searching with a broader title, author, or discipline."
            action={
              <Button asChild size="sm" variant="default">
                <Link href="/library">View Full Catalog</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map((book) => {
              const isAvailable = book.available_copies > 0;
              return (
                <Card key={book.id} hoverable className="bg-white flex flex-col justify-between overflow-hidden">
                  {book.cover_image_url && (
                    <div className="relative w-full h-44 bg-slate-100 border-b border-[#F0ECE6]">
                      <Image
                        src={book.cover_image_url}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="secondary" size="sm" className="truncate max-w-[150px]">
                        {book.category?.name || "General Engineering"}
                      </Badge>
                      <Badge
                        variant={isAvailable ? "success" : "destructive"}
                        size="sm"
                        dot
                      >
                        {isAvailable ? `${book.available_copies} Available` : "Issued Out"}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-[#0F172A] line-clamp-2">
                      <Link href={`/library/${book.id}`} className="hover:text-[#7B2D26] transition-colors">
                        {book.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="text-xs text-[#64748B] line-clamp-1 mt-1">
                      By {book.author}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 text-xs text-[#64748B] space-y-1">
                    {book.edition && (
                      <div className="text-[11px]">Edition: {book.edition}</div>
                    )}
                    {book.shelf_location && (
                      <div className="text-[11px] text-[#7B2D26] font-medium">
                        Location: {book.shelf_location}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-2 border-t border-[#F3EFEA] justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {book.total_copies} total {book.total_copies === 1 ? "copy" : "copies"}
                    </span>
                    <Button asChild size="xs" variant="ghost" className="text-[#7B2D26] font-semibold p-0">
                      <Link href={`/library/${book.id}`} className="flex items-center gap-1">
                        Book Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
