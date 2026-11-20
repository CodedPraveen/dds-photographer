
import "@/styles/admin.css";

import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
