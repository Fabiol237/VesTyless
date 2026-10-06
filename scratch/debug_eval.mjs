import { ingestAndAnalyzeHtml } from '../src/lib/component-registry/referenceSiteIngestion.js';
import { ComponentRegistry } from '../src/lib/component-registry/ComponentRegistry.js';
import { FIXTURE_DATASET } from '../tests/referenceSiteRealAnalysis.test.mjs';

for (const fix of FIXTURE_DATASET) {
  const rep = ingestAndAnalyzeHtml(fix.html, ComponentRegistry, { siteId: fix.siteId });
  console.log(`=== ${fix.siteId} (newCandidates: ${rep.newCandidatesCount}) ===`);
  for (const s of rep.sectionReports) {
    console.log(`  pos ${s.position} [${s.family}/${s.layout}] -> ${s.verdict} (closest: ${s.closestComponentId}, sim: ${s.similarityScore})`);
    if (s.structuralDifferences?.length) {
      console.log(`    diffs: ${s.structuralDifferences.join(' | ')}`);
    }
  }
}
