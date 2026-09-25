const { runFullEvaluationSuite } = require('../src/lib/evaluationHarness');

try {
  const { results, overallPassRate } = runFullEvaluationSuite();
  console.log('=== EVALUATION SUITE RESULTS ===');
  console.log('Overall Pass Rate:', overallPassRate + '%');
  console.table(results);
} catch (e) {
  console.error('Eval error:', e);
}
