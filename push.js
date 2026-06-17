import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n=============================================');
  console.log('   GitHub Repository Push Utility (push.js)  ');
  console.log('=============================================\n');

  try {
    // 1. Get repository info
    let repoUrlInput = await question('Enter the GitHub Repository URL (e.g., https://github.com/Sanju0845/Obsidian-ledger-budget--tracker): ');
    repoUrlInput = repoUrlInput.trim();
    if (!repoUrlInput) {
      console.error('Error: Repository URL is required!');
      rl.close();
      return;
    }

    // Clean up repo URL in case user pasted .git or trailing slash
    let cleanRepoUrl = repoUrlInput.replace(/\.git$/, '').replace(/\/$/, '');

    // Extract owner and repo details
    const urlParts = cleanRepoUrl.split('/');
    const repoName = urlParts[urlParts.length - 1];
    const repoOwner = urlParts[urlParts.length - 2];

    if (!repoName || !repoOwner) {
      console.error('Error: Could not parse Owner/Repository name from the URL.');
      rl.close();
      return;
    }

    // 2. Get Authentication details
    const username = (await question(`Enter your GitHub Username [default: ${repoOwner}]: `)).trim() || repoOwner;
    
    console.log('\nTo push to an existing repo, you need a Personal Access Token (PAT).');
    console.log('Generate one here: https://github.com/settings/tokens (needs "repo" scope)');
    const pat = (await question('Enter your GitHub Personal Access Token (PAT): ')).trim();
    
    if (!pat) {
      console.error('Error: Personal Access Token (PAT) is required to authenticate.');
      rl.close();
      return;
    }

    // 3. Commit settings
    const commitMsg = (await question('Enter commit message [default: Update from AI Studio]: ')).trim() || 'Update from AI Studio';
    const branch = (await question('Enter branch to push to [default: main]: ')).trim() || 'main';
    const forcePushInput = (await question('Force push? (y/n) [default: n] (Use "y" if histories don\'t match): ')).trim().toLowerCase();
    const isForcePush = forcePushInput === 'y' || forcePushInput === 'yes';

    rl.close();

    // 4. Configure Git credentials with PAT embedded in remote URL
    const authenticatedRemoteUrl = `https://${username}:${pat}@github.com/${repoOwner}/${repoName}.git`;

    console.log('\nInitializing git configuration locally...');
    
    // Check if .git exists, if not initialize
    if (!fs.existsSync('.git')) {
      execSync('git init', { stdio: 'inherit' });
    }

    // Configure temporary mock identity if not already set globally
    try {
      execSync('git config user.name', { stdio: 'ignore' });
    } catch {
      execSync(`git config user.name "${username}"`);
    }
    try {
      execSync('git config user.email', { stdio: 'ignore' });
    } catch {
      execSync(`git config user.email "${username}@users.noreply.github.com"`);
    }

    // Handle remote addition/update
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {}
    execSync(`git remote add origin ${authenticatedRemoteUrl}`);

    // Create custom branch if not existing
    try {
      execSync(`git checkout -b ${branch}`, { stdio: 'ignore' });
    } catch {
      execSync(`git checkout ${branch}`, { stdio: 'ignore' });
    }

    // Git add and commit
    console.log('\nStaging changes...');
    execSync('git add .', { stdio: 'inherit' });

    console.log('\nCommitting changes...');
    try {
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    } catch (e) {
      console.log('Nothing to commit or commit failed. Moving to push step...');
    }

    // Push changes
    console.log(`\nPushing changes to branch "${branch}" on remote...`);
    const forceFlag = isForcePush ? '--force' : '';
    execSync(`git push -u origin ${branch} ${forceFlag}`, { stdio: 'inherit' });

    console.log('\n=============================================');
    console.log('  🎉 SUCCESS! Your code has been pushed!   ');
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n❌ An error occurred during the git pipeline:', error.message || error);
  }
}

main();
