'use strict';

const { loadSchema } = require('../lib/schema-loader');

/**
 * CLI schema command handler.
 * Validates office.yml and optionally outputs structured data.
 */
module.exports = function schemaCmd(opts) {
  const configPath = opts.config || undefined;
  const result = loadSchema(configPath);

  // ── Validation mode ────────────────────────────────────────────────────
  if (opts.validate) {
    if (result.errors.length === 0) {
      console.log('✅ office.yml — geçerli');

      if (result.warnings.length > 0) {
        console.log(`\n⚠️  Uyarılar (${result.warnings.length}):`);
        result.warnings.forEach(w => console.log(`   ${w}`));
      }

      // Summary
      const s = result.schema;
      console.log(`\n📋 Özet:`);
      console.log(`   Roster: ${Object.keys(s.roster).length} persona`);
      console.log(`   Channels: ${s.channels.length} kanal`);
      console.log(`   Hierarchy: ${s.hierarchy.length} bağlantı`);
      console.log(`   HITL Policy: ${s.hitl_policy.risk_class} (${s.hitl_policy.checkpoint})`);
    } else {
      console.error(`❌ office.yml — ${result.errors.length} hata:`);
      result.errors.forEach(e => console.error(`   ${e}`));
      process.exit(2);
    }
    return;
  }

  // ── Default: show full schema ──────────────────────────────────────────
  if (result.errors.length > 0) {
    console.error(`❌ Schema yüklenemedi:`);
    result.errors.forEach(e => console.error(`   ${e}`));
    process.exit(2);
  }

  const schema = result.schema;

  if (opts.format === 'json') {
    // JSON output (machine-readable)
    const output = {
      roster: schema.roster,
      hierarchy: schema.hierarchy,
      channels: schema.channels,
      task_policies: schema.task_policies,
      hitl_policy: schema.hitl_policy,
      loaded_at: schema._loaded_at,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Default: human-readable output
  console.log(`\n${'━'.repeat(60)}`);
  console.log('🏢 Office Operational Schema');
  console.log(`${'━'.repeat(60)}`);
  console.log(`   Dosya: ${schema._file}`);
  console.log(`   Yükleme: ${schema._loaded_at}\n`);

  // Roster
  console.log('📋 Roster:');
  for (const [key, entry] of Object.entries(schema.roster)) {
    console.log(`   ${key}: ${entry.role}`);
    console.log(`      persona: ${entry.persona_path}`);
    console.log(`      work:    ${entry.work_path}`);
  }

  // Hierarchy
  console.log('\n🔗 Hiyerarşi:');
  schema.hierarchy.forEach(h => {
    console.log(`   ${h.from} → ${h.to}  (${h.label})`);
  });

  // Channels
  console.log('\n📡 Kanallar:');
  schema.channels.forEach(ch => {
    console.log(`   ${ch.name}: [${ch.members.join(', ')}]`);
    if (ch.purpose) console.log(`      ${ch.purpose}`);
  });

  // Policies
  console.log('\n⚙️  Görev Politikaları:');
  console.log(`   Varsayılan öncelik: ${schema.task_policies.default_priority || 'normal'}`);
  if (schema.task_policies.writeback_scope) {
    console.log('   Yazma kapsamları:');
    for (const [role, dir] of Object.entries(schema.task_policies.writeback_scope)) {
      console.log(`      ${role} → ${dir}`);
    }
  }

  // HITL
  console.log('\n🛡️  HITL Policy:');
  console.log(`   Risk sınıfı: ${schema.hitl_policy.risk_class}`);
  console.log(`   Checkpoint: ${schema.hitl_policy.checkpoint}`);
  if (schema.hitl_policy.description) {
    console.log(`   ${schema.hitl_policy.description}`);
  }

  console.log(`\n${'━'.repeat(60)}\n`);
};
