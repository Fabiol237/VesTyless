import { runComprehensiveStressTests } from './VestinEdgeCases.test.ts';

async function main() {
  console.log('STARTING STRESS & EDGE CASE AUDIT...');
  const results = await runComprehensiveStressTests();
  console.log('\n========================================');
  console.log(`TOTAL TESTS : ${results.total}`);
  console.log(`PASSED      : ${results.passed}`);
  console.log(`FAILED      : ${results.failed}`);
  console.log('========================================\n');

  for (const detail of results.testDetails) {
    console.log(`[${detail.status}] ${detail.name} — ${detail.notes}`);
  }

  if (results.failed > 0) {
    console.error('\n❌ FAILURES:');
    for (const f of results.failures) {
      console.error(`- ${f}`);
    }
  } else {
    console.log('\n🎉 ALL 18 EDGE CASES & STRESS TESTS PASSED WITH ZERO FAILURES!');
  }
}

main().catch(console.error);
