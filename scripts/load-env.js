// Load environment variables with proper priority: system env > .env.local > .env
// System environment variables always take precedence (cannot be overridden by .env files)
const fs = require("fs");
const path = require("path");

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const root = path.resolve(__dirname, "..");

// Load in order: .env first, then .env.local overrides it
// System env always wins (we only set if not already defined)
const envFiles = [
  path.join(root, ".env"),
  path.join(root, ".env.local"),
];

for (const file of envFiles) {
  const vars = parseDotEnv(file);
  for (const [key, value] of Object.entries(vars)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
