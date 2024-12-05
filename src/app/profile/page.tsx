import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { ProfileContent } from "./_components/ProfileContent";

export default async function ProfilePage() {
  noStore();
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Your <span className="text-[hsl(280,100%,70%)]">Portfolio</span>
        </h1>
        <ProfileContent />
      </div>
    </main>
  );
}