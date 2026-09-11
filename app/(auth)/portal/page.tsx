import PortalCard from "@/components/admin-portal/portal-card";
import Logo from "@/components/custom/logo/logo";
import { Card } from "@/components/ui/card";
import { ShoppingBagIcon, Monitor, Archive, Store } from "lucide-react";

function UserPortalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <Logo icon={<Store color="white" />} />
        </div>
        <h1 className="text-3xl font-bold">Shagan Retail</h1>
        <p className="text-muted-foreground">Choose a portal to continue</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PortalCard
            href="/pos/pin"
            icon={<Monitor />}
            title="POS"
            subtitle="Sales & Transactions"
          />
          <PortalCard
            href="/admin/pin"
            icon={<Archive />}
            title="Back Office"
            subtitle="Inventory & Management"
          />
        </div>
      </div>
    </div>
  );
}

export default UserPortalPage;
