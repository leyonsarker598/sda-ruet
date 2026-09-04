import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RegisterAlumniForm } from "@/features/auth/RegisterAlumniForm";

export const metadata: Metadata = {
  title: "Alumni Registration",
  description: "Register as a verified alumnus of RUET from Sirajganj District.",
};

export default function AlumniRegisterPage() {
  return (
    <Card className="shadow-sm max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-[#7B2D26]">RUET Alumni Registration</CardTitle>
        <CardDescription>
          Connect with fellow Sirajganj engineering graduates and mentor current students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterAlumniForm />
      </CardContent>
    </Card>
  );
}
