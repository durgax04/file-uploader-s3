// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { getUserSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/");
  }

  return <Dashboard session={session} />;
}
