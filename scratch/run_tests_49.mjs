import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const nodeBin = 'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Microsoft\\VisualStudio\\NodeJs\\node.exe';
const testFiles = [
  'tests/integrationRealEngine49.test.mjs',
  'tests/adaptiveComposition48.test.mjs',
  'tests/controlledProduction47.test.mjs',
  'tests/compositionEngine.test.mjs',
  'tests/componentRegistry.test.mjs',
  'tests/businessProfile.test.mjs',
  'tests/businessProfileAdapter.test.mjs',
  'tests/businessTypeRegistry.test.mjs',
  'tests/canonicalComponents.test.mjs',
  'tests/canonicalProductionEngine.test.mjs',
  'tests/patternDecisionEngine.test.mjs',
  'tests/referenceSiteAnalysis.test.mjs',
  'tests/referenceSiteIngestion.test.mjs',
  'tests/referenceSiteRealAnalysis.test.mjs',
  'tests/deliveryEngine.test.mjs',
  'tests/checkoutValidation.test.mjs',
];

console.log('=== RUNNING GLOBAL TEST SUITE ===');
let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const tf of testFiles) {
  if (!fs.existsSync(tf)) {
    console.log(`[SKIP] ${tf} not found`);
    continue;
  }
  const res = spawnSync(nodeBin, ['--test', tf], { encoding: 'utf8' });
  const isPass = res.status === 0;
  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  
  // parse pass count
  const passMatch = stdout.match(/pass\s+(\d+)/i);
  const failMatch = stdout.match(/fail\s+(\d+)/i);
  const passed = passMatch ? parseInt(passMatch[1], 10) : (isPass ? 1 : 0);
  const failed = failMatch ? parseInt(failMatch[1], 10) : (isPass ? 0 : 1);
  
  totalPassed += passed;
  totalFailed += failed;
  results.push({ file: tf, passed, failed, isPass });
  console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${tf} -> ${passed} passed, ${failed} failed`);
  if (!isPass) {
    console.error(stdout);
    console.error(stderr);
  }
}

console.log(`\n===============================`);
console.log(`TOTAL PASSED: ${totalPassed}`);
console.log(`TOTAL FAILED: ${totalFailed}`);
console.log(`OVERALL STATUS: ${totalFailed === 0 ? 'ALL_PASS' : 'SOME_FAILED'}`);
console.log(`===============================`);
