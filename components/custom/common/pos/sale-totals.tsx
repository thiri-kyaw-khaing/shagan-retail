type SaleTotalsProps = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

export default function SaleTotals({
  subtotal,
  discount,
  tax,
  total,
}: SaleTotalsProps) {
  return (
    <div className="space-y-2 px-2 text-sm">
      <div className="flex justify-between text-ink-muted">
        <span>Subtotal</span>
        <span>K {subtotal.toLocaleString()}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-rose-600">
          <span>Discount</span>
          <span>− K {discount.toLocaleString()}</span>
        </div>
      )}

      {tax > 0 && (
        <div className="flex justify-between text-ink-muted">
          <span>Tax</span>
          <span>K {tax.toLocaleString()}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-ink">
        <span>Total</span>
        <span className="text-rose-900">K {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
