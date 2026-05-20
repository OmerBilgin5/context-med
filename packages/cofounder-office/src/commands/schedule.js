'use strict';

const { getScheduleStatus, getDueSchedules, simulateTrigger } = require('../lib/scheduler');

/**
 * CLI schedule command handler.
 * Shows schedule status, due tasks, and allows simulation.
 */
module.exports = function scheduleCmd(opts) {
  // ── Simulate trigger ───────────────────────────────────────────────────
  if (opts.trigger) {
    const result = simulateTrigger(opts.trigger);

    if (result.error) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (opts.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(`\n⚡ Schedule Tetiklendi`);
    console.log(`   Schedule: ${result.schedule}`);
    console.log(`   Persona: ${result.trigger_persona}`);
    console.log(`   Kanal: ${result.channel}`);
    console.log(`   Görev: ${result.task}`);
    console.log(`   Zaman: ${result.executed_at}`);
    console.log(`   Mod: ${result.mode}\n`);
    return;
  }

  // ── Due tasks ──────────────────────────────────────────────────────────
  if (opts.due) {
    const due = getDueSchedules();

    if (opts.format === 'json') {
      console.log(JSON.stringify(due, null, 2));
      return;
    }

    if (due.length === 0) {
      console.log('\n✅ Bekleyen schedule yok — tüm görevler güncel.\n');
      return;
    }

    console.log(`\n⏰ Bekleyen Schedule'lar (${due.length}):`);
    due.forEach(d => {
      console.log(`   📌 ${d.name} (${d.trigger} @ ${d.channel})`);
      console.log(`      Görev: ${d.task.substring(0, 80)}`);
      console.log(`      Neden: ${d.reason}`);
    });
    console.log(`\n💡 Tetiklemek için: cofounder-office schedule --trigger <isim>\n`);
    return;
  }

  // ── Default: show all schedules ────────────────────────────────────────
  const status = getScheduleStatus();

  if (opts.format === 'json') {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`\n${'━'.repeat(60)}`);
  console.log('📅 Schedule Durumu');
  console.log(`${'━'.repeat(60)}`);

  status.forEach(s => {
    const icon = s.custom ? '🔧' : '📌';
    const lastRun = s.last_run
      ? new Date(s.last_run).toLocaleString('tr-TR')
      : 'Hiç çalışmadı';

    console.log(`  ${icon} ${s.name}`);
    console.log(`     Persona: ${s.trigger} @ ${s.channel}`);
    console.log(`     Aralık: ${s.interval}`);
    console.log(`     Son çalışma: ${lastRun}`);
    console.log(`     Sonraki: ${s.next_due}`);
    console.log('');
  });

  console.log(`${'━'.repeat(60)}\n`);
};
