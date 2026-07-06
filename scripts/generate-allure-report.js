const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const resultsDir = path.join(repoRoot, 'allure-results');
const reportDir = path.join(repoRoot, 'allure-report');

try {
  if (!fs.existsSync(resultsDir) || fs.readdirSync(resultsDir).length === 0) {
    console.warn(
      `No Allure results found in ${path.relative(repoRoot, resultsDir)}. Run tests first to generate the report.`
    );
    process.exit(0);
  }

  const allureCommand = `npx allure generate "${resultsDir}" --clean -o "${reportDir}"`;
  console.log(`Executing: ${allureCommand}`);
  execSync(allureCommand, {
    stdio: 'inherit',
    cwd: repoRoot,
    shell: true,
  });
  console.log(`Allure report generated in ${path.relative(repoRoot, reportDir)}/`);
} catch (error) {
  console.error('Could not generate the Allure report.');
  console.error(error.message || error);
  process.exit(0);
}
