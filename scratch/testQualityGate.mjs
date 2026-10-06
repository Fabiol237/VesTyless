import { OFFICIAL_TEMPLATE_CATALOGUE } from '../src/lib/template-packages/officialTemplates.js';
import { templateQualityGate } from '../src/lib/template-packages/TemplateQualityGate.js';

console.log(`Auditing ${OFFICIAL_TEMPLATE_CATALOGUE.length} official templates...`);

const result = templateQualityGate.evaluateCatalogue(OFFICIAL_TEMPLATE_CATALOGUE);

console.log(`\n================ QUALITY GATE REPORT ================`);
console.log(`Total Templates: ${result.totalCount}`);
console.log(`Passed: ${result.passedCount}/${result.totalCount}`);
console.log(`All Passed: ${result.allPassed ? 'YES (100% SUCCESS)' : 'NO'}\n`);

result.reports.forEach((r, idx) => {
  console.log(`[#${idx + 1}] ${r.templateName} (${r.templateId})`);
  console.log(`     Score: ${r.overallScore}/100 | Status: ${r.passed ? 'PASS' : 'FAIL'}`);
  if (r.criticalFailures.length > 0) {
    console.log(`     Critical Failures:`, r.criticalFailures);
  }
  if (r.warnings.length > 0) {
    console.log(`     Warnings:`, r.warnings);
  }
});
