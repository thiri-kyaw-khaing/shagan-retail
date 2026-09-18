"use client";

import { CircleUserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomButton from "@/components/custom/common/custom-button";

export default function ShiftClosedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto bg-rose-50 px-4 py-8">
      <section className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-rose-200">
          <CircleUserRound
            aria-hidden="true"
            className="size-12 text-rose-700"
          />
        </div>

        <h1 className="mt-7 text-3xl font-bold text-slate-900">Shift closed</h1>
        <p className="mt-2 text-xl text-slate-600">
          See you next time, Ma Thida!
        </p>
        <p className="mt-1 text-base text-slate-500">
          Your shift summary has been saved.
        </p>

        <CustomButton
          label="Sign in for next shift"
          onClick={() => router.push("/portal")}
          className="mt-10 min-h-16 w-full max-w-sm rounded-xl bg-brand px-6 text-lg font-bold text-white hover:bg-brand/90"
        />
      </section>
    </main>
  );
}