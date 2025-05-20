import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Internal Blog</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user?.name || session.user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Internal Blog System
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
