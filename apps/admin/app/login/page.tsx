import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { AdminLoginForm } from "../../components/admin-login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-20 max-w-md">
      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Ingreso administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
