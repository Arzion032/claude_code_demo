"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <span className="text-lg font-semibold text-emerald-600">
          🐢 Pagong — Kwento Mo Sa'ken
        </span>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-emerald-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/log"
            className={`text-sm font-medium transition-colors ${
              pathname === "/log"
                ? "text-emerald-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Log
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
