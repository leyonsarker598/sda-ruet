import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import {
  getAdminUsers,
  generateUsersCSVReport,
} from "@/services/adminControlService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  UserRoleModal,
  UserStatusToggle,
  ExportUsersCSVButton,
} from "@/features/admin/users/AdminUserActions";
import { Users, Search, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "User Management & RBAC Roles | Admin Console",
  description: "Manage institutional profiles, grant administrator privileges, and enforce account statuses.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;

  const { users, count } = await getAdminUsers({
    role: resolvedParams.role,
    status: resolvedParams.status,
    search: resolvedParams.q,
  });

  const csvData = await generateUsersCSVReport();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            User Accounts &amp; RBAC Roles
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage association user profiles, assign 4-tier institutional roles, and monitor account health ({count} accounts).
          </p>
        </div>

        <ExportUsersCSVButton csvData={csvData} />
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
          title="No Users Found"
          description="No registered profiles match the search or filter criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Profile</TableHead>
              <TableHead>Student ID / Dept</TableHead>
              <TableHead>Institutional Role</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {user.full_name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {user.email}
                  </div>
                </TableCell>

                <TableCell className="text-xs">
                  <div className="font-mono font-semibold text-[#0F172A]">
                    {user.student_id || "N/A"}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {user.department || "RUET"} {user.series ? `('${user.series})` : ""}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.role_id === "ADMIN"
                        ? "admin"
                        : user.role_id === "LIBRARIAN"
                        ? "librarian"
                        : user.role_id === "TEACHER"
                        ? "teacher"
                        : user.role_id === "ALUMNI"
                        ? "alumni"
                        : "member"
                    }
                    size="sm"
                  >
                    {user.role_id}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.status === "ACTIVE"
                        ? "success"
                        : user.status === "SUSPENDED"
                        ? "destructive"
                        : "secondary"
                    }
                    size="sm"
                    dot
                  >
                    {user.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(user.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <UserRoleModal
                      userId={user.id}
                      currentRole={user.role_id}
                      userName={user.full_name}
                    />
                    <UserStatusToggle
                      userId={user.id}
                      currentStatus={user.status}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
