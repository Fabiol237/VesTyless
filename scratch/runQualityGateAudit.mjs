import fs from 'fs';
import path from 'path';

// Load officialTemplates.js dynamically
const templatePath = path.resolve('src/lib/template-packages/officialTemplates.js');
const qualityGatePath = path.resolve('src/lib/template-packages/TemplateQualityGate.js');

const templateModule = await import(`file://${templatePath.replace(/\\/g, '/')}`);
const qualityGateModule = await import(`file://${qualityGatePath.replace(/\\/g, '/')}`);

const templates = templateModule.OFFICIAL_TEMPLATE_CATALOGUE;
const gate = qualityGateModule.templateQualityGate;

console.log(`Auditing ${templates.length} official templates with Professional Template Quality Gate...`);

const evaluation = gate.evaluateCatalogue(templates);

console.log(`\n================ PROFESSIONAL TEMPLATE QUALITY GATE ================`);
console.log(`Total Templates Evaluated : ${evaluation.totalCount}`);
console.log(`Templates Passed (≥ 80%)   : ${evaluation.passedCount}/${evaluation.totalCount}`);
console.log(`Quality Gate Verdict      : ${evaluation.allPassed ? '✅ 100% PASS - ALL CERTIFIED' : '❌ SOME FAILED'}\n`);

evaluation.reports.forEach((r, idx) => {
  console.log(`[#${idx + 1}] ${r.templateName} (${r.templateId})`);
  console.log(`     Category   : ${r.category}`);
  console.log(`     Score      : ${r.overallScore}/100`);
  console.log(`     Status     : ${r.passed ? '✅ PASS (CERTIFIED)' : '❌ FAIL'}`);
  console.log(`     Dimensions : Design=${r.scores.visualDesign} | UX=${r.scores.ux} | Responsive=${r.scores.responsive} | MultiPage=${r.scores.multiPage} | DataIntegrity=${r.scores.dataIntegrity}`);
  if (r.criticalFailures.length > 0) {
    console.log(`     Critical Failures:`, r.criticalFailures);
  }
  if (r.warnings.length > 0) {
    console.log(`     Warnings:`, r.warnings);
  }
  console.log('---------------------------------------------------------------------');
});
