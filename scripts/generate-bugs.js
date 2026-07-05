const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const junitPath = path.resolve(__dirname, '../reports/junit.xml');
const outputPath = path.resolve(__dirname, '../BUGS.md');

if (!fs.existsSync(junitPath)) {
  console.error('No se encontró reports/junit.xml. Ejecuta npm test primero.');
  process.exit(0);
}

const xml = fs.readFileSync(junitPath, 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const parsed = parser.parse(xml);
const suites = parsed.testsuites || parsed.testsuite;
let tests = [];

if (Array.isArray(suites)) {
  suites.forEach((suite) => {
    const cases = suite.testcase || [];
    tests = tests.concat(Array.isArray(cases) ? cases : [cases]);
  });
} else if (suites) {
  const cases = suites.testcase || [];
  tests = tests.concat(Array.isArray(cases) ? cases : [cases]);
}

const failures = tests.filter((test) => test.failure || test.error);

const lines = [
  '# BUGS
',
  'Los siguientes tests fallaron o tuvieron errores durante la ejecución:',
  '',
];

if (failures.length === 0) {
  lines.push('No se detectaron fallos en el reporte JUnit.');
} else {
  failures.forEach((test, index) => {
    const name = test.name || test['@_name'] || 'unknown';
    const classname = test.classname || test['@_classname'] || 'unknown';
    const failure = test.failure || test.error;
    const message = failure['@_message'] || failure.message || failure['#text'] || JSON.stringify(failure);
    lines.push(`## ${index + 1}. ${classname} › ${name}`);
    lines.push('');
    lines.push(`- Mensaje: ${message}`);
    if (failure['#text']) {
      lines.push('');
      lines.push('```text');
      lines.push(failure['#text'].trim());
      lines.push('```');
    }
    lines.push('');
  });
}

fs.writeFileSync(outputPath, lines.join('\n'));
console.log(`BUGS.md generado en ${outputPath}`);
