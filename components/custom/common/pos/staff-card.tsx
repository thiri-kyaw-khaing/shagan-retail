import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import type { Staff } from "@/lib/types/model/staffs";

export default function StaffCard({ staff }: { staff: Staff }) {
  return (
    <Card className="transition hover:shadow-md">
      <Link href={`/pos/pin?staffId=${staff.id}`} className="block">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <AvatarInitials name={staff.name} />
          <div>
            <p className="font-bold text-ink">{staff.name}</p>
            <p className="text-ink-muted">{staff.role}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
