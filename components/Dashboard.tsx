"use client";

import CreateForm from "@/components/CreateForm";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";


interface DashboardProps {
  session: {
    id: string;
    name: string;
    image: string;
    email: string;
  };
}

const Dashboard = ({ session }: DashboardProps) => {
  console.log("session--->>", session);
  // console.log(session.image);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut(); // This will redirect to signIn page by default
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/20 pb-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome, {session.name}
          </h1>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut && <Loader2 className="h-5 w-5 animate-spin" />}
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {/* User Info */}
        <section className="bg-white/5 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-gray-300">Email:</span>{" "}
              {session.email}
            </p>
            <p>
              <span className="font-semibold text-gray-300">Name:</span>{" "}
              {session.name}
            </p>
          </div>
        </section>

        {/* Upload Section */}
        <section className="bg-white/5 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Upload Files to S3</h2>
          <CreateForm user={session} />
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
