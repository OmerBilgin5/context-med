'use strict';

const { getTrail, getStats, getById } = require('../lib/provenance');

/**
 * CLI audit command handler.
 * Shows provenance trail entries and stats.
 */
module.exports = function auditCmd(opts) {
  // ── Single entry lookup ────────────────────────────────────────────────
  if (opts.id) {
    const entry = getById(opts.id);
    if (!entry) {
      console.error(`Error: Provenance entry not found: ${opts.id}`);
      process.exit(1);
    }

    if (opts.format === 'json') {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      printEntry(entry, true);
    }
    return;
  }

  // ── Stats mode ─────────────────────────────────────────────────────────
  if (opts.stats) {
    const stats = getStats();

    if (opts.format === 'json') {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    console.log(`\n${'━'.repeat(60)}`);
    console.log('📊 Provenance İstatistikleri');
    console.log(`${'━'.repeat(60)}`);
    console.log(`   Toplam karar: ${stats.total}`);

    if (stats.total > 0) {
      console.log(`   Ortalama çıktı uzunluğu: ${stats.avg_output_length} karakter`);
      console.log(`   İlk kayıt: ${stats.first_entry}`);
      console.log(`   Son kayıt: ${stats.last_entry}`);

      console.log('\n   Persona bazında:');
      for (const [p, count] of Object.entries(stats.by_persona)) {
        const bar = '█'.repeat(Math.min(count, 20));
        console.log(`      ${p}: ${bar} ${count}`);
      }

      console.log('\n   Kanal bazında:');
      for (const [ch, count] of Object.entries(stats.by_channel)) {
        console.log(`      ${ch}: ${count}`);
      }

      console.log('\n   HITL:');
      console.log(`      Otomatik: ${stats.hitl.auto}`);
      console.log(`      Onaylanan: ${stats.hitl.approved}`);
      console.log(`      Reddedilen: ${stats.hitl.rejected}`);
    } else {
      console.log('   Henüz kayıt yok.');
    }

    console.log(`${'━'.repeat(60)}\n`);
    return;
  }

  // ── Trail mode (default) ───────────────────────────────────────────────
  const filters = {};
  if (opts.last) filters.last = parseInt(opts.last, 10);
  if (opts.persona) filters.persona = opts.persona;

  const entries = getTrail(filters);

  if (entries.length === 0) {
    console.log('\n📭 Provenance trail boş — henüz karar kaydedilmemiş.');
    console.log('   Dashboard üzerinden konuşma başlatın veya CLI consult kullanın.\n');
    return;
  }

  if (opts.format === 'json') {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  console.log(`\n${'━'.repeat(60)}`);
  console.log(`🔗 Provenance Trail — Son ${entries.length} karar`);
  console.log(`${'━'.repeat(60)}`);

  entries.forEach((entry, i) => {
    if (i > 0) console.log(`${'─'.repeat(60)}`);
    printEntry(entry, false);
  });

  console.log(`${'━'.repeat(60)}\n`);
};

/**
 * Print a single provenance entry to console.
 */
function printEntry(entry, detailed) {
  const personaIcons = { mimar: '🏛', arabulucu: '📋', icraci: '⚙️' };
  const hitlIcons = { auto: '🔓', approved: '✅', rejected: '❌', pending: '⏳' };
  const icon = personaIcons[entry.persona] || '👤';
  const hitlIcon = hitlIcons[entry.hitl_status] || '❓';

  console.log(`  ${icon} [${entry.id}] ${entry.persona} @ ${entry.channel}`);
  console.log(`     Zaman: ${entry.timestamp}`);
  console.log(`     Girdi: "${entry.input_preview}"`);
  console.log(`     HITL: ${hitlIcon} ${entry.hitl_status}`);

  if (entry.eval_score) {
    console.log(`     Fidelity: ${entry.eval_score.fidelity_score}/100`);
  }

  if (entry.provenance_tags && entry.provenance_tags.length > 0) {
    console.log(`     Tags: [${entry.provenance_tags.join(', ')}]`);
  }

  if (detailed) {
    console.log(`\n     Girdi Hash: ${entry.input_hash}`);
    console.log(`     Çıktı Uzunluğu: ${entry.output_length} karakter`);
    console.log(`     Çıktı Önizleme: "${entry.output_preview}"`);
    if (entry.brain_reads && entry.brain_reads.length > 0) {
      console.log(`     Okunan Dosyalar (${entry.brain_reads.length}):`);
      entry.brain_reads.forEach(f => console.log(`        📄 ${f}`));
    }
  }
}
