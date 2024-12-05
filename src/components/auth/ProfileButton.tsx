"use client";

import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const ProfileButton = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null;

  return (
    <Button 
      onClick={() => router.push('/profile')}
      variant="secondary"
      className="bg-white/10 hover:bg-white/20 text-white border-0"
    >
      Profile
    </Button>
  );
};