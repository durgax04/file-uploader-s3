import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoIcon from "@/public/upload-icon.svg";

export default async function Home() {
  const user = await getUserSession();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8 bg-white/10 p-10 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex justify-center">
          <Image
            src={LogoIcon} // make sure this image exists
            alt="Logo"
            width={64}
            height={64}
            className="rounded-full bg-white/20 p-2"
          />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome to <span className="text-teal-400">Upload File form</span>
        </h1>
        <p className="text-lg text-gray-200">
          It lets you upload file(images, videos) in s3 and see those in /posts endpoint.
        </p>

        <Link
          href="/api/auth/signin"
          className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition duration-300"
        >
          Sign in with Google
        </Link>
      </div>
    </main>
  );
}
