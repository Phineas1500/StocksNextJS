"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../../components/ui/button";
import { LogOut } from "lucide-react";

export function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-white">
          Balance: ${session.user.balance}
        </p>
        <Button
          onClick={() => signOut()}
          variant="secondary"
          className="bg-white/10 hover:bg-white/20 text-white border-0"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("google")}
      variant="secondary"
      className="bg-white/10 hover:bg-white/20 text-white"
    >
      Sign In with Google
    </Button>
  );
}