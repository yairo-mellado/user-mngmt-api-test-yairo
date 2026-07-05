const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const resultsDir = path.join(repoRoot, 'allure-results');
const reportDir = path.join(repoRoot, 'allure-report');

try {
  if (!fs.existsSync(resultsDir) || fs.readdirSync(resultsDir).length === 0) {
    console.warn(
      `No se encontraron resultados de Allure en ${path.relative(repoRoot, resultsDir)}. Ejecuta las pruebas primero para generar el reporte.`
    );
    process.exit(0);
  }

  const allureCommand = `npx allure generate "${resultsDir}" --clean -o "${reportDir}"`;
  console.log(`Ejecutando: ${allureCommand}`);
  execSync(allureCommand, {
    stdio: 'inherit',
    cwd: repoRoot,
    shell: true,
  });
  console.log(`Allure report generado en ${path.relative(repoRoot, reportDir)}/`);
} catch (error) {
  console.error('No se pudo generar el reporte Allure.');
  console.error(error.message || error);
  process.exit(0);
}
