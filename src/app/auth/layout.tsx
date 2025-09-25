
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-8 left-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <main>
          {children}
      </main>
    </div>
  );
}
