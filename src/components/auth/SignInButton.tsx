"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Balance: ${session.user.balance}</p>
        <Button
          onClick={() => signOut()}
          variant="outline"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("google")}
    >
      Sign In with Google
    </Button>
  );
}