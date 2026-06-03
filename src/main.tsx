import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/shared/api/queryClient";
import { SecurityProvider } from "./security/SecurityProvider";
import { ABACStrategy } from "./security/strategies/ABACStrategy";
import { router } from "./router";
import { UserSession } from "./security/types";
import { rules } from "./security/rules";
import "@/i18n";
import "./index.css";


const strategy = new ABACStrategy(rules);

function Root() {
  const user = {} as UserSession;
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider strategy={strategy} user={user}>
        <RouterProvider
          router={router}
          context={{
            user,
            strategy,
          }}
        />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "13px",
            },
          }}
        />
      </SecurityProvider>
    </QueryClientProvider>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
