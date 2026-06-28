/**
 * adminNav — typed navigation helpers for the institutional/admin stack.
 * Centralises route strings so admin screens don't hand-build hrefs.
 */
import type { Router } from "expo-router";

type Nav = Pick<Router, "push" | "replace" | "back">;

export const adminNav = {
  dashboard(router: Nav) {
    router.replace("/(admin)" as never);
  },
  programmeDashboard(router: Nav) {
    router.push("/(admin)" as never);
  },
  domainIntelligence(router: Nav) {
    router.push("/(admin)/domain-intelligence" as never);
  },
  roleDemand(router: Nav) {
    router.push("/(admin)/role-demand" as never);
  },
  skillsGap(router: Nav) {
    router.push("/(admin)/skills-gap" as never);
  },
  trends(router: Nav) {
    router.push("/(admin)/trends" as never);
  },
  salary(router: Nav) {
    router.push("/(admin)/salary" as never);
  },
  remote(router: Nav) {
    router.push("/(admin)/remote" as never);
  },
  vsNational(router: Nav) {
    router.push("/(admin)/vs-national" as never);
  },
  peers(router: Nav) {
    router.push("/(admin)/peers" as never);
  },
  students(router: Nav) {
    router.push("/(admin)/students" as never);
  },
  session(router: Nav) {
    router.push("/(admin)/session" as never);
  },
  affiliation(router: Nav) {
    router.push("/(admin)/affiliation" as never);
  },
  verify(router: Nav) {
    router.push("/(admin)/verify" as never);
  },
};
