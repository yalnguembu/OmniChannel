import { createFileRoute } from "@tanstack/react-router";
import "./landing.css";
import { LandingPage } from "@/pages/landing/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
