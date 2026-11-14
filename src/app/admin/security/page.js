import { SecurityForm } from "@/features/admin/components/SecurityForm";
import { requireAdmin } from "@/features/admin/server/auth";

export default async function SecurityPage() {
  await requireAdmin();
  return (
    <main style={{ maxWidth: 600, margin: "3rem auto", padding: "2rem" }}>
      <h1>Security</h1>
      <SecurityForm />
    </main>
  );
}
