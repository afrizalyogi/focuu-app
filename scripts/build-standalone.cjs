const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const standaloneDir = path.join(rootDir, "standalone");
const publicDir = path.join(standaloneDir, "public");

console.log("Building standalone output...");

// 1. Build the Vite app (skipping if just testing script, but usually we run this)
try {
  console.log("Running standard build...");
  execSync("npm run build", { stdio: "inherit", cwd: rootDir });
} catch (e) {
  console.error("Build failed:", e);
  process.exit(1);
}

// 2. Create standalone structure
if (fs.existsSync(standaloneDir)) {
  fs.rmSync(standaloneDir, { recursive: true, force: true });
}
fs.mkdirSync(standaloneDir);
fs.mkdirSync(publicDir);

// 3. Copy dist to standalone/public
console.log("Copying dist files...");
fs.cpSync(distDir, publicDir, { recursive: true });

// 4. Create server.js
const serverContent = `
const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

// Force Trailing Slash Middleware
app.use((req, res, next) => {
  const path = req.path;
  const hasExtension = path.split('/').pop().indexOf('.') > -1;
  const isTrailing = path.substr(-1) === '/';

  if (!isTrailing && !hasExtension && path !== '/') {
    const query = req.url.slice(path.length);
    res.redirect(301, path + '/' + query);
    return;
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback: Serve index.html for non-static requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync(path.join(standaloneDir, "server.js"), serverContent.trim());

// 5. Create minimal package.json
const packageJson = {
  name: "standalone-server",
  version: "1.0.0",
  scripts: {
    start: "node server.js",
  },
  dependencies: {
    express: "^4.18.2",
    compression: "^1.7.4",
  },
};

fs.writeFileSync(
  path.join(standaloneDir, "package.json"),
  JSON.stringify(packageJson, null, 2),
);

console.log("Standalone build created at ./standalone");
console.log("To run:");
console.log("  cd standalone");
console.log("  npm install --production");
console.log("  npm start");
