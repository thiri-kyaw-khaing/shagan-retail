"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomButton from "@/components/custom/common/custom-button";
import { HeldSale, heldSales } from "@/lib/types/model/heldsale";
import { usePos } from "./pos-context";

export default function HeldSaleComponent() {
  const router = useRouter();
  const { heldSales, resumeHeldSale } = usePos();

  const handleResume = (heldSaleId: number) => {
    const resumed = resumeHeldSale(heldSaleId);

    if (resumed) {
      router.push("/pos/sell");
    }
  };

  return (
    <main className="min-h-screen bg-rose-50 p-3 sm:p-5">
      <Card className="gap-0 overflow-hidden rounded-xl border-0 py-0 shadow-md">
        {/* Rose header */}
        <CardHeader className="flex flex-row items-center gap-5 bg-brand px-4 py-4 text-white sm:px-8">
          <CustomButton
            icon={ArrowLeft}
            onClick={() => router.push("/pos/sell")}
            className="size-11 shrink-0 bg-transparent p-0 text-white shadow-none hover:bg-white/15"
          />

          <div>
            <CardTitle className="text-lg font-bold text-white">
              Held Sales
            </CardTitle>

            <p className="mt-1 text-sm font-medium text-white/90">
              {heldSales.length} carts paused
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {heldSales.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-4 text-center">
              <h2 className="font-semibold text-slate-800">No held sales</h2>

              <p className="mt-1 text-sm text-slate-500">
                Held carts will appear here.
              </p>
            </div>
          ) : (
            <ul>
              {heldSales.map((sale) => {
                const itemCount = sale.items.reduce(
                  (count, item) => count + item.quantity,
                  0,
                );

                const subtotal = sale.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                );

                const total =
                  subtotal * (1 - (sale.discountPercent ?? 0) / 100);

                const heldMinutesAgo = Math.max(
                  0,
                  // eslint-disable-next-line react-hooks/purity
                  Math.floor((Date.now() - sale.heldAt) / 60000),
                );

                return (
                  <li
                    key={sale.id}
                    className="flex items-center justify-between gap-5 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:px-8"
                  >
                    {/* Sale information */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-slate-900">
                        {sale.customerName}
                      </h2>

                      <p className="mt-1 text-base text-slate-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"} · held{" "}
                        {heldMinutesAgo} min ago
                      </p>

                      {(sale.discountPercent ?? 0) > 0 && (
                        <p className="mt-1 text-sm text-slate-500">
                          {sale.discountPercent}% discount
                        </p>
                      )}

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {sale.items.map((item) => item.name).join(", ")}
                      </p>
                    </div>

                    {/* Total and Resume */}
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-bold text-rose-950">
                        K {total.toLocaleString()}
                      </p>

                      <CustomButton
                        label="Resume"
                        icon={ArrowRight}
                        onClick={() => handleResume(sale.id)}
                        className="mt-1 min-h-11 bg-transparent p-0 font-semibold text-rose-800 shadow-none hover:bg-transparent hover:text-rose-600"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
