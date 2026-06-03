import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    // console.log(context.user?.id);
    if (context.user?.id) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
