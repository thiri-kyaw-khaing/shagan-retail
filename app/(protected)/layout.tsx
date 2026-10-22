import { PrinterProvider } from "@/components/custom/common/printer-context";

// One connection to this device's receipt printer and cash drawer, shared by
// the till and the Back Office, so it survives moving between them.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <PrinterProvider>{children}</PrinterProvider>;
}
