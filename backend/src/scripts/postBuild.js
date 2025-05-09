const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy pnpm-lock.yaml
fs.copyFileSync(
  path.join(process.cwd(), 'pnpm-lock.yaml'),
  path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
);

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
execSync('pnpm i --prod --frozen-lockfile', { 
  cwd: MEDUSA_SERVER_PATH,
  stdio: 'inherit'
});

// --- BEGIN: Copy custom provider ---
const providerSourceDir = path.join(process.cwd(), 'dist-provider');
const providerDestDir = path.join(MEDUSA_SERVER_PATH, 'modules', 'providers', 'payment-mentom');

if (fs.existsSync(providerSourceDir)) {
  console.log(`Copying custom provider from ${providerSourceDir} to ${providerDestDir}...`);
  // Ensure destination directory exists
  fs.mkdirSync(providerDestDir, { recursive: true });

  // Function to recursively copy directory contents
  function copyDirRecursiveSync(source, target) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stat = fs.lstatSync(sourcePath);
      if (stat.isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true });
        copyDirRecursiveSync(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  copyDirRecursiveSync(providerSourceDir, providerDestDir);
  console.log('Custom provider copied successfully.');
} else {
  console.warn(`Warning: dist-provider directory not found at ${providerSourceDir}. Custom provider not copied.`);
}
// --- END: Copy custom provider ---
