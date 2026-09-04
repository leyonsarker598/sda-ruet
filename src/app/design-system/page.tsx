"use client";

import * as React from "react";
import Image from "next/image";
import {
  HeartHandshake,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Search,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalFooter } from "@/components/ui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import {
  Spinner,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  LoadingOverlay,
} from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoadingBtn, setIsLoadingBtn] = React.useState(false);
  const [checkboxVal, setCheckboxVal] = React.useState(true);

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
      {/* 10. Navigation Demonstration Bar */}
      <header className="border-b border-[#E8E2D9] bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-[#7B2D26] text-lg font-heading tracking-tight">SDA RUET</span>
            <Badge variant="outline" className="text-[10px] text-[#7B2D26] border-[#E6C9C7] bg-[#FAF5F5]">
              UI Component System
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-xs">Engr. Yeasir Arafat (ADMIN)</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Design System Hero Introduction */}
        <section className="border-b border-[#E8E2D9] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            SDA RUET Design System 1.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7B2D26] font-heading tracking-tight">
            Academic Visual Identity &amp; Primitives
          </h1>
          <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
            A minimal, modern, academic design system tailored for the Sirajganj District Association, RUET.
            Built on burgundy, off-white canvas, warm neutrals, gold accents, and charcoal typography.
          </p>
        </section>

        {/* 1. Global Typography & Hierarchy */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              1. Global Typography
            </h2>
            <p className="text-xs text-[#64748B]">Hierarchical academic type scales and font styles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-[#E8E2D9]">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Display Heading / H1</span>
                <h1 className="text-3xl font-extrabold text-[#7B2D26] tracking-tight font-heading">
                  Connecting Sirajganj, Empowering RUET
                </h1>
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Section Heading / H2</span>
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight font-heading">
                  Digital Textbook Circulation &amp; Archive
                </h2>
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Card Title / H3</span>
                <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                  Executive Committee 2025–2026
                </h3>
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Subsection Title / H4</span>
                <h4 className="text-sm font-semibold text-[#0F172A]">
                  Verified Graduate Directory
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Body Paragraph (Primary)</span>
                <p className="text-sm text-[#1E293B] leading-relaxed">
                  The Sirajganj District Association, RUET represents a distinguished community of engineers,
                  students, and faculty members dedicated to solidarity, academic excellence, and mutual welfare.
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Muted Secondary Text</span>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Rajshahi University of Engineering &amp; Technology · Kazla, Rajshahi-6204, Bangladesh.
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Academic Badge / Tagline</span>
                <div className="text-xs font-semibold text-[#7B2D26] tracking-wide uppercase">
                  Take a Stand &amp; Hold a Hand
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Tokens & Swatches */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              2. Color Palette &amp; Design Tokens
            </h2>
            <p className="text-xs text-[#64748B]">Harmonious curated colors reflecting RUET and SDA identity</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Primary Burgundy */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#7B2D26] shadow-xs" />
              <div className="text-xs font-bold text-[#0F172A]">Primary Maroon</div>
              <div className="text-[11px] text-[#64748B] font-mono">#7B2D26</div>
            </div>

            {/* Deep Burgundy */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#60211B] shadow-xs" />
              <div className="text-xs font-bold text-[#0F172A]">Burgundy Dark</div>
              <div className="text-[11px] text-[#64748B] font-mono">#60211B</div>
            </div>

            {/* Academic Gold */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#C5A880] shadow-xs" />
              <div className="text-xs font-bold text-[#0F172A]">Academic Gold</div>
              <div className="text-[11px] text-[#64748B] font-mono">#C5A880</div>
            </div>

            {/* Off-White Canvas */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#FBF9F5] border border-[#E8E2D9] shadow-2xs" />
              <div className="text-xs font-bold text-[#0F172A]">Canvas Off-White</div>
              <div className="text-[11px] text-[#64748B] font-mono">#FBF9F5</div>
            </div>

            {/* Warm Neutral */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#F3EFEA] border border-[#E8E2D9] shadow-2xs" />
              <div className="text-xs font-bold text-[#0F172A]">Warm Neutral</div>
              <div className="text-[11px] text-[#64748B] font-mono">#F3EFEA</div>
            </div>

            {/* Charcoal Slate */}
            <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 space-y-2">
              <div className="h-14 rounded-lg bg-[#0F172A] shadow-xs" />
              <div className="text-xs font-bold text-[#0F172A]">Charcoal Slate</div>
              <div className="text-[11px] text-[#64748B] font-mono">#0F172A</div>
            </div>
          </div>
        </section>

        {/* 3. Buttons Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              3. Buttons &amp; Interactive States
            </h2>
            <p className="text-xs text-[#64748B]">Variants, sizes, loading toggles, and icon slots</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] space-y-6">
            {/* Variant Row */}
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-3">Variants</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary Burgundy</Button>
                <Button variant="secondary">Secondary Neutral</Button>
                <Button variant="accent">Gold Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </div>
            </div>

            {/* Sizes Row */}
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-3">Sizes</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small (xs)</Button>
                <Button size="sm">Small (sm)</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large (lg)</Button>
              </div>
            </div>

            {/* With Icons & Loading */}
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-3">Icon &amp; Loading States</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button leftIcon={<BookOpen className="w-4 h-4" />}>
                  Explore Library
                </Button>
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue
                </Button>
                <Button
                  variant="default"
                  isLoading={isLoadingBtn}
                  onClick={() => {
                    setIsLoadingBtn(true);
                    setTimeout(() => setIsLoadingBtn(false), 2000);
                  }}
                >
                  {isLoadingBtn ? "Processing..." : "Click to Test Loading"}
                </Button>
                <Button disabled variant="default">
                  Disabled Button
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Form Controls Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              4. Inputs &amp; Form Controls
            </h2>
            <p className="text-xs text-[#64748B]">Inputs, textareas, selects, and checkboxes with error states</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="standard-input" required>Standard Text Input</Label>
                <Input id="standard-input" placeholder="e.g. Student ID (1903001)" />
              </div>

              <div>
                <Label htmlFor="icon-input">Input with Search Icon</Label>
                <Input
                  id="icon-input"
                  leftIcon={<Search className="w-4 h-4" />}
                  placeholder="Search books, authors, or ISBN..."
                />
              </div>

              <div>
                <Label htmlFor="error-input" required>Input with Validation Error</Label>
                <Input
                  id="error-input"
                  defaultValue="invalid-format-id"
                  error="Student ID must be a valid 7-digit RUET roll number"
                />
              </div>

              <div>
                <Label htmlFor="academic-select" required>Academic Select</Label>
                <Select id="academic-select" defaultValue="cse">
                  <option value="cse">Computer Science &amp; Engineering (CSE)</option>
                  <option value="eee">Electrical &amp; Electronic Engineering (EEE)</option>
                  <option value="ce">Civil Engineering (CE)</option>
                  <option value="me">Mechanical Engineering (ME)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="academic-textarea">Textarea Input</Label>
                <Textarea
                  id="academic-textarea"
                  placeholder="Write a message, book note, or announcement..."
                  rows={3}
                  helperText="Maximum 500 characters."
                />
              </div>

              <div className="pt-2 space-y-3">
                <Label>Checkboxes</Label>
                <Checkbox
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                  label="Agree to Association Library &amp; Lending Guidelines"
                  description="Books must be returned within the standard 14-day circulation window."
                />
                <Checkbox
                  label="Display profile in public verified alumni directory"
                  description="Allows other RUET members to reach out to you."
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Cards & Elevation Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              5. Cards &amp; Surfaces
            </h2>
            <p className="text-xs text-[#64748B]">Structured card containers with headers, body, footers, and hover elevation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-2">
                  <BookOpen className="w-5 h-5" />
                </div>
                <CardTitle>Digital Textbook Library</CardTitle>
                <CardDescription>
                  Borrow textbooks and reserve reference volumes with atomic circulation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#64748B] leading-relaxed">
                  Over 1,200 curated engineering volumes available for RUET members.
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-[11px] text-[#15803D] font-bold">12 Copies Available</span>
                <Button size="xs" variant="outline">Reserve</Button>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle>Verified Alumni</CardTitle>
                <CardDescription>
                  Search graduate directory by batch, industry, city, and degree.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#64748B] leading-relaxed">
                  Multi-tier privacy settings ensure confidential contact information is safeguarded.
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="alumni" size="sm">500+ Alumni</Badge>
                <Button size="xs" variant="outline">Browse</Button>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-2">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <CardTitle>Student Welfare Fund</CardTitle>
                <CardDescription>
                  Transparent community funding for emergency student grants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-[#64748B] leading-relaxed">
                  Direct contributions via bKash, Nagad, Rocket, and institutional accounts.
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-[11px] text-[#7B2D26] font-bold">৳ 450,000 Raised</span>
                <Button size="xs" variant="default">Donate</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 6. Tables Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              6. Academic Tables
            </h2>
            <p className="text-xs text-[#64748B]">Responsive tabular layouts for book catalogues and member registries</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title &amp; Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Shelf Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">Introduction to Algorithms (4th Ed.)</div>
                  <div className="text-[11px] text-[#64748B]">Thomas H. Cormen, Charles E. Leiserson</div>
                </TableCell>
                <TableCell>Computer Science</TableCell>
                <TableCell>3 / 4 Available</TableCell>
                <TableCell>Shelf CS-04</TableCell>
                <TableCell>
                  <Badge variant="success" size="sm" dot>Available</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="outline">Issue Book</Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">Microelectronic Circuits (8th Ed.)</div>
                  <div className="text-[11px] text-[#64748B]">Adel S. Sedra, Kenneth C. Smith</div>
                </TableCell>
                <TableCell>Electrical Engineering</TableCell>
                <TableCell>1 / 2 Available</TableCell>
                <TableCell>Shelf EEE-02</TableCell>
                <TableCell>
                  <Badge variant="warning" size="sm" dot>Low Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="outline">Issue Book</Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">Mechanics of Materials (10th Ed.)</div>
                  <div className="text-[11px] text-[#64748B]">Russell C. Hibbeler</div>
                </TableCell>
                <TableCell>Mechanical Engineering</TableCell>
                <TableCell>0 / 3 Available</TableCell>
                <TableCell>Shelf ME-01</TableCell>
                <TableCell>
                  <Badge variant="destructive" size="sm" dot>All Issued</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="secondary">Reserve</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* 7. Badges Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              7. Badges &amp; Status Indicators
            </h2>
            <p className="text-xs text-[#64748B]">Role badges, verification statuses, and pill tags</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] space-y-4">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-2">User Roles</span>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="admin">ADMIN</Badge>
                <Badge variant="member">MEMBER</Badge>
                <Badge variant="alumni">ALUMNI</Badge>
                <Badge variant="teacher">TEACHER</Badge>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-2">Status Badges with Indicator Dots</span>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="success" dot>Active / Verified</Badge>
                <Badge variant="warning" dot>Pending Review</Badge>
                <Badge variant="destructive" dot>Suspended / Rejected</Badge>
                <Badge variant="accent" dot>Featured Alumni</Badge>
                <Badge variant="outline">Outline Tag</Badge>
                <Badge variant="secondary">Warm Neutral</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 8 & 9. Modals & Dropdowns Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              8 &amp; 9. Modals &amp; Dropdown Menus
            </h2>
            <p className="text-xs text-[#64748B]">Accessible dialogs and interactive dropdown overlays</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] flex flex-wrap items-center gap-4">
            {/* Modal Trigger */}
            <Button
              variant="default"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Open Academic Modal
            </Button>

            {/* Dropdown Trigger */}
            <Dropdown>
              <DropdownTrigger>
                <Button variant="outline" rightIcon={<MoreVertical className="w-4 h-4" />}>
                  Actions Dropdown
                </Button>
              </DropdownTrigger>
              <DropdownContent align="left" className="w-48">
                <DropdownLabel>Circulation Actions</DropdownLabel>
                <DropdownItem icon={<BookOpen className="w-4 h-4" />}>
                  Issue Book Copy
                </DropdownItem>
                <DropdownItem icon={<CheckCircle2 className="w-4 h-4" />}>
                  Mark Returned
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem destructive icon={<AlertTriangle className="w-4 h-4" />}>
                  Report Lost Book
                </DropdownItem>
              </DropdownContent>
            </Dropdown>

            {/* Interactive Modal Component */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Issue Library Textbook"
              description="Confirm student borrower details and record the circulation loan."
            >
              <div className="space-y-4">
                <div>
                  <Label required>Borrower Student ID</Label>
                  <Input placeholder="e.g. 1903001" defaultValue="1903001" />
                </div>
                <div>
                  <Label required>Book Copy Barcode</Label>
                  <Input placeholder="e.g. SDA-BOOK-0023-A" defaultValue="SDA-BOOK-0023-A" />
                </div>
                <div>
                  <Label required>Loan Period</Label>
                  <Select defaultValue="14">
                    <option value="14">14 Days (Standard)</option>
                    <option value="30">30 Days (Semester Extended)</option>
                  </Select>
                </div>
              </div>
              <ModalFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.success("Book Issued Successfully", "Loan record has been added to the circulation ledger.");
                  }}
                >
                  Confirm Issue
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        </section>

        {/* 13. Toast Notifications Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              13. Toast Notifications
            </h2>
            <p className="text-xs text-[#64748B]">Academic feedback banners with automatic dismissal</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                toast.success(
                  "Registration Successful",
                  "Your member account has been activated."
                )
              }
            >
              Trigger Success Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.error(
                  "Authentication Error",
                  "Invalid student credentials provided."
                )
              }
            >
              Trigger Error Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.info(
                  "New Announcement",
                  "General meeting scheduled for next Friday at 4 PM."
                )
              }
            >
              Trigger Info Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.warning(
                  "Loan Due Soon",
                  "Your book loan expires in 2 days."
                )
              }
            >
              Trigger Warning Toast
            </Button>
          </div>
        </section>

        {/* 14. Loading States Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              14. Loading States &amp; Skeletons
            </h2>
            <p className="text-xs text-[#64748B]">Spinners, skeleton card loaders, and table skeletons</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Spinners</span>
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="default" />
                <Spinner size="lg" />
                <Spinner size="lg" color="accent" />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Card Skeleton</span>
              <CardSkeleton />
            </div>
          </div>
        </section>

        {/* 15 & 16. Empty & Error States Showcase */}
        <section className="space-y-6">
          <div className="border-b border-[#E8E2D9] pb-2">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading">
              15 &amp; 16. Empty &amp; Error States
            </h2>
            <p className="text-xs text-[#64748B]">Clean feedback views for empty search queries and network recovery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="No Books Found in Catalog"
              description="We couldn't find any textbook matching your query. Try searching with a broader keyword or author name."
              action={
                <Button size="sm" variant="default" leftIcon={<Search className="w-3.5 h-3.5" />}>
                  Reset Search Filters
                </Button>
              }
              secondaryAction={
                <Button size="sm" variant="outline">
                  Suggest a Book
                </Button>
              }
            />

            <ErrorState
              title="Unable to Load Alumni Registry"
              message="The alumni database could not be reached. Please check your internet connection and try reloading."
              onRetry={() => toast.info("Retrying connection...")}
            />
          </div>
        </section>
      </main>

      {/* 11. Footer Demonstration Bar */}
      <footer className="border-t border-[#E8E2D9] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} Sirajganj District Association (SDA), RUET. Design System & Component Library.
        </div>
      </footer>
    </div>
  );
}
