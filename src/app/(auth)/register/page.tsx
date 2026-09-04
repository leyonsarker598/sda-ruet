import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RegisterMemberForm } from "@/features/auth/RegisterMemberForm";

export const metadata: Metadata = {
  title: "Student Member Registration",
  description: "Register as a current RUET student from Sirajganj District to join the association.",
};

export default function RegisterPage() {
  return (
    <Card className="shadow-sm max-w-xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-[#7B2D26]">Student Member Registration</CardTitle>
        <CardDescription>
          Join the Sirajganj District Association, RUET community as a student member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterMemberForm />
      </CardContent>
    </Card>
  );
}
