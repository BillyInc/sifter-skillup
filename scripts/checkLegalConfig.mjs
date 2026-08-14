const required = [
  "EXPO_PUBLIC_LEGAL_OPERATOR_NAME",
  "EXPO_PUBLIC_LEGAL_OPERATOR_ADDRESS",
];

const missing = required.filter((key) => !String(process.env[key] ?? "").trim());
if (missing.length) {
  console.error(`Production legal notice is incomplete. Set: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Production legal identity configuration is present.");
