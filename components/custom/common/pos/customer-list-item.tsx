import AvatarInitials from "@/components/custom/common/avatar-initials";
import type { Customer } from "@/lib/types/model/customers";

type CustomerListItemProps = {
  customer: Customer;
  onSelect: (customer: Customer) => void;
};

export default function CustomerListItem({
  customer,
  onSelect,
}: CustomerListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(customer)}
      className="flex w-full items-center gap-4 rounded-xl px-2 py-3 text-left hover:bg-muted"
    >
      <AvatarInitials name={customer.name} className="h-10 w-10 text-sm" />

      <div>
        <p className="font-semibold text-ink">{customer.name}</p>
        <p className="text-sm text-ink-muted">{customer.phone}</p>
      </div>
    </button>
  );
}
