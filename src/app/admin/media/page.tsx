import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Upload, Copy } from "lucide-react";

export const metadata: Metadata = {
  title: "Media Library | Admin Console",
  description: "Manage uploaded photos, event galleries, and institutional banners.",
};

export default async function AdminMediaPage() {
  await requireRole(["ADMIN"]);

  const mediaAssets = [
    { name: "Sda-PNG.png", path: "/assets/Sda-PNG.png", size: "184 KB", type: "image/png" },
    { name: "ruet_logo.png", path: "/assets/ruet_logo.png", size: "92 KB", type: "image/png" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Media Assets &amp; File Storage
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Public logos, activity gallery snapshots, and event banner graphics.
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaAssets.map((asset) => (
          <Card key={asset.name} className="bg-white">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" size="sm">
                  {asset.type}
                </Badge>
                <span className="text-[11px] text-[#64748B]">{asset.size}</span>
              </div>
              <CardTitle className="text-xs font-bold text-[#0F172A] mt-2 truncate">
                {asset.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-[#64748B] truncate">
                {asset.path}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
