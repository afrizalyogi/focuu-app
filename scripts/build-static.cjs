const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

// Define all client-side routes here
const routes = [
  "/onboarding",
  "/work",
  "/auth",
  "/forgot-password",
  "/pricing",
  "/privacy",
  "/terms",
  "/app",
  "/app/history",
  "/app/settings",
  "/app/analytics",
  "/app/billing",
  "/admin",
];

console.log("Starting Static Export Build...");

// 1. Clean dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// 2. Build Vite app with relative base path
// This ensures assets are referenced as ./assets/... which we can easily rewrite
console.log("Running vite build --base=./ ...");
try {
  execSync("npm run build -- --base=./", { stdio: "inherit", cwd: rootDir });
} catch (e) {
  console.error("Build failed.");
  process.exit(1);
}

// 3. Post-process to create directory structure
console.log("Generating route directories...");

const indexHtmlPath = path.join(distDir, "index.html");
if (!fs.existsSync(indexHtmlPath)) {
  console.error("dist/index.html not found!");
  process.exit(1);
}

const template = fs.readFileSync(indexHtmlPath, "utf-8");

routes.forEach((route) => {
  const relativeRoute = route.startsWith("/") ? route.slice(1) : route;
  const targetDir = path.join(distDir, relativeRoute);

  // Create directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Calculate relative depth for asset adjustment
  const depth = relativeRoute.split("/").length;
  const prefix = "../".repeat(depth);

  // Replace "./" with "../../" etc. for assets
  // We look for src="./ and href="./ because vite base=./ produces these
  let pageContent = template
    .replace(/src="\.\//g, `src="${prefix}`)
    .replace(/href="\.\//g, `href="${prefix}`);

  // Also fix "assets/" if potential edge cases (though base=./ usually strictly handled)
  // Safety check: if standard Vite produces "assets/foo.js" (no dot), we handle that?
  // With base=./ it is typically ./assets.

  fs.writeFileSync(path.join(targetDir, "index.html"), pageContent);
  console.log(`✓ ${route}/`);
});

// 4. Create 404.html (copy of index)
fs.copyFileSync(indexHtmlPath, path.join(distDir, "404.html"));
console.log("✓ 404.html");

console.log("\nStatic export finished! verify in /dist");
