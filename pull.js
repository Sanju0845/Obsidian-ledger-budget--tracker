import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REPO_URL = 'https://github.com/Sanju0845/Obsidian-ledger-budget--tracker.git';
const TEMP_DIR = './temp_repo';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (path.basename(src) === '.git') return;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Avoid copying some configurations that might break the build or are not needed,
    // but typically we should overwrite almost everything to get the full app.
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log(`Cloning ${REPO_URL} into ${TEMP_DIR}...`);
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  
  execSync(`git clone ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
  
  console.log('Copying files from clone...');
  copyRecursiveSync(TEMP_DIR, '.');
  
  console.log('Cleaning up temporary clone directory...');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  
  console.log('Successfully pulled repository and merged files/folders!');
} catch (error) {
  console.error('An error occurred during the pulling process:', error);
  process.exit(1);
}
