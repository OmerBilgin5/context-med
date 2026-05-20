'use strict';

const { classifyRisk } = require('../lib/hitl-engine');

/**
 * CLI hitl command handler.
 * Tests risk classification on sample text.
 */
module.exports = function hitlCmd(opts) {
  if (opts.test) {
    // Test mode: classify risk of provided text
    const text = opts.test;
    const persona = opts.persona || 'arabulucu';

    const result = classifyRisk(text, persona);

    if (opts.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    const riskIcons = { high: '🔴', medium: '🟡', low: '🟢' };
    const icon = riskIcons[result.risk_class] || '⚪';
    const bar = '█'.repeat(Math.floor(result.risk_score / 10)) + '░'.repeat(10 - Math.floor(result.risk_score / 10));

    console.log(`\n${icon} Risk Sınıflandırma`);
    console.log(`   Sınıf: ${result.risk_class.toUpperCase()}`);
    console.log(`   Skor: ${bar} ${result.risk_score}/100`);
    console.log(`   Onay gerekli: ${result.requires_approval ? '✅ Evet' : '❌ Hayır'}`);

    if (result.matched_keywords.length > 0) {
      console.log(`   Eşleşen anahtar kelimeler: [${result.matched_keywords.join(', ')}]`);
    }

    console.log(`   Policy: risk_class=${result.policy.risk_class}, checkpoint=${result.policy.checkpoint}`);
    console.log('');
    return;
  }

  // Default: show HITL policy info
  let schemaLoader;
  try { schemaLoader = require('../lib/schema-loader'); } catch {}
  const policy = schemaLoader ? schemaLoader.getHitlPolicy() : { risk_class: 'high', checkpoint: 'always' };

  console.log(`\n🛡️  HITL Policy`);
  console.log(`   Risk sınıfı: ${policy.risk_class}`);
  console.log(`   Checkpoint: ${policy.checkpoint}`);
  if (policy.description) console.log(`   ${policy.description}`);
  console.log(`\n💡 Kullanım: cofounder-office hitl --test "Production'a deploy edelim mi?" --persona icraci\n`);
};
