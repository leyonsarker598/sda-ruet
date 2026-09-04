import { redirect } from "next/navigation";

export default function PreviousCommitteeRedirectPage() {
  redirect("/committee/archive");
}
