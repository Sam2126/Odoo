"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading TransitOps...</span>
      </div>
    </div>
  );
}
