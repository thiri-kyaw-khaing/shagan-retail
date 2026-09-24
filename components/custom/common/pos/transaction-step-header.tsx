import { ChevronLeft } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import Header from "@/components/custom/common/pos/header";

type TransactionStepHeaderProps = {
  title: string;
  customerLabel: string;
  total: number;
  backHref: string;
  onBackStep?: () => void;
};

export default function TransactionStepHeader({
  title,
  customerLabel,
  total,
  backHref,
  onBackStep,
}: TransactionStepHeaderProps) {
  return (
    <Header
      title={title}
      right={
        <div className="text-right">
          <p className="text-sm font-medium text-white/90">{customerLabel}</p>
          <p className="text-lg font-bold">K {total.toLocaleString()}</p>
        </div>
      }
    >
      {onBackStep ? (
        <CustomButton
          icon={ChevronLeft}
          onClick={onBackStep}
          className="bg-transparent p-2 text-white hover:bg-transparent hover:opacity-70"
        />
      ) : (
        <BackButton href={backHref} className="text-white" />
      )}
    </Header>
  );
}
