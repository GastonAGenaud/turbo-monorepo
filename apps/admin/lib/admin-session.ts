import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "./auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return session;
}
