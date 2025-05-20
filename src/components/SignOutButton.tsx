"use client";

import { signOut } from "next-auth/react";
import React from "react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="text-sm px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
    >
      Sign out
    </button>
  );
}
