import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Barcode,
  Calendar,
  Layers,
  HeartHandshake,
  Share2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getBookDetails } from "@/services/libraryService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookDetails(id);
  if (!book) return { title: "Book Not Found" };
  return {
    title: `${book.title} | SDA RUET Library`,
    description: `Author: ${book.author}. ${book.description || "Engineering textbook in SDA RUET Library collection."}`,
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const book = await getBookDetails(id);

  if (!book) {
    notFound();
  }

  const isAvailable = book.available_copies > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/library" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog
            </Link>
          </Button>
        </div>

        {/* Book Header Card */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {book.cover_image_url ? (
              <div className="relative w-24 h-32 sm:w-32 sm:h-44 rounded-xl overflow-hidden border border-[#E8E2D9] flex-shrink-0 shadow-2xs bg-slate-100">
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-20 h-28 sm:w-28 sm:h-36 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex flex-col items-center justify-center text-[#7B2D26] flex-shrink-0 shadow-2xs">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-center px-1">
                  {book.category?.name?.slice(0, 10) || "Textbook"}
                </span>
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {book.category?.name || "General Engineering"}
                </Badge>
                <Badge
                  variant={isAvailable ? "success" : "destructive"}
                  dot
                >
                  {isAvailable
                    ? `${book.available_copies} of ${book.total_copies} Available`
                    : "All Copies Currently Issued"}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                {book.title}
              </h1>

              <div className="text-sm font-semibold text-[#7B2D26]">
                Author: {book.author}
                {book.co_authors && book.co_authors.length > 0 && ` with ${book.co_authors.join(", ")}`}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                {profile ? (
                  <Button asChild size="sm" disabled={!isAvailable}>
                    <Link href={`/dashboard/library/reserve?bookId=${book.id}`}>
                      {isAvailable ? "Reserve This Book" : "Join Waiting List"}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href={`/login?redirect=/library/${book.id}`}>
                      Sign In to Borrow / Reserve
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Book Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publication &amp; Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {book.isbn && (
                <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                  <span className="text-[#64748B]">ISBN Number</span>
                  <span className="font-semibold text-[#0F172A] font-mono">{book.isbn}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                  <span className="text-[#64748B]">Publisher</span>
                  <span className="font-semibold text-[#0F172A]">{book.publisher}</span>
                </div>
              )}
              {book.edition && (
                <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                  <span className="text-[#64748B]">Edition</span>
                  <span className="font-semibold text-[#0F172A]">{book.edition}</span>
                </div>
              )}
              {book.publication_year && (
                <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                  <span className="text-[#64748B]">Year of Publication</span>
                  <span className="font-semibold text-[#0F172A]">{book.publication_year}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#64748B]">Language</span>
                <span className="font-semibold text-[#0F172A]">{book.language || "English"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Circulation &amp; Shelf Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                <span className="text-[#64748B]">Library Location</span>
                <span className="font-semibold text-[#7B2D26]">
                  {book.shelf_location || "Main Library Shelf"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                <span className="text-[#64748B]">Standard Circulation Period</span>
                <span className="font-semibold text-[#0F172A]">14 Calendar Days</span>
              </div>
              <div className="flex justify-between border-b border-[#F3EFEA] pb-1.5">
                <span className="text-[#64748B]">Max Concurrent Loans</span>
                <span className="font-semibold text-[#0F172A]">2 Books / Student</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Renewal Limit</span>
                <span className="font-semibold text-[#0F172A]">1 Online Extension</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Physical Copies Ledger */}
        {book.copies && book.copies.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0F172A] font-heading">
              Physical Copy Inventory ({book.copies.length} copies)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Copy Code</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Donor Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.copies.map((copy) => (
                  <TableRow key={copy.id}>
                    <TableCell className="font-mono font-semibold text-[#0F172A]">
                      {copy.copy_code}
                    </TableCell>
                    <TableCell className="capitalize">{copy.condition?.toLowerCase() || "Good"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={copy.is_available ? "success" : "destructive"}
                        size="sm"
                        dot
                      >
                        {copy.is_available ? "On Shelf" : "Issued Out"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {copy.donor_name ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] font-semibold text-[11px]">
                          <HeartHandshake className="w-3.5 h-3.5" />
                          Donated by {copy.donor_name}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">Association Stock</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
