import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { CircleAlert } from "lucide-react";

type ApiErrorProps = {
  message?: string | null;
};

export default function ApiErrorUI({ message }: ApiErrorProps) {
  if (!message) return null;

  return (
    <Alert className="mb-4" variant="destructive">
      <CircleAlert className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
