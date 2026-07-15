import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignIn />
      </div>
    </main>
  );
}
