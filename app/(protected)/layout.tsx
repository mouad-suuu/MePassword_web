"use client";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import TopBar from "../../components/TopBar";

export default function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { userId } = useAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
