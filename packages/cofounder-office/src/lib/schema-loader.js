'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const OFFICE_ROOT = path.resolve(__dirname, '../../brains/cofounder-office');
const DEFAULT_CONFIG = path.join(OFFICE_ROOT, 'config', 'office.yml');

/**
 * Parsed & validated office schema singleton.
 * Hot-reloads when the YAML file changes.
 */
let _schema = null;
let _watcher = null;
let _configPath = null;
let _onReloadCallbacks = [];

// ─── Validation helpers ─────────────────────────────────────────────────────

function validateRoster(roster) {
  const errors = [];
  if (!roster || typeof roster !== 'object') {
    errors.push('roster: Eksik veya geçersiz (object olmalı)');
    return errors;
  }

  // Package root: packages/cofounder-office/
  const packageRoot = path.resolve(__dirname, '../..');

  for (const [key, entry] of Object.entries(roster)) {
    if (!entry.role) errors.push(`roster.${key}.role: Eksik`);
    if (!entry.persona_path) {
      errors.push(`roster.${key}.persona_path: Eksik`);
    } else {
      const absPath = path.resolve(packageRoot, entry.persona_path);
      if (!fs.existsSync(absPath)) {
        errors.push(`roster.${key}.persona_path: Dosya bulunamadı → ${entry.persona_path}`);
      }
    }
  }
  return errors;
}

function validateHierarchy(hierarchy) {
  const errors = [];
  if (!hierarchy || !Array.isArray(hierarchy)) {
    errors.push('hierarchy: Eksik veya geçersiz (array olmalı)');
    return errors;
  }

  const validPattern = /^(\w+)\s*->\s*(\w+)/;
  hierarchy.forEach((entry, i) => {
    if (typeof entry !== 'string' || !validPattern.test(entry)) {
      errors.push(`hierarchy[${i}]: Geçersiz format → "${entry}" (beklenen: "role -> role (açıklama)")`);
    }
  });
  return errors;
}

function validateChannels(channels) {
  const errors = [];
  if (!channels || !Array.isArray(channels)) {
    errors.push('channels: Eksik veya geçersiz (array olmalı)');
    return errors;
  }

  channels.forEach((ch, i) => {
    if (!ch.name) errors.push(`channels[${i}].name: Eksik`);
    if (!ch.members || !Array.isArray(ch.members) || ch.members.length === 0) {
      errors.push(`channels[${i}].members: Eksik veya boş`);
    }
  });
  return errors;
}

function validateTaskPolicies(policies) {
  const errors = [];
  if (!policies || typeof policies !== 'object') return errors; // opsiyonel
  if (policies.writeback_scope && typeof policies.writeback_scope !== 'object') {
    errors.push('task_policies.writeback_scope: Object olmalı');
  }
  return errors;
}

// ─── Parse hierarchy string into structured edges ───────────────────────────

function parseHierarchy(hierarchy) {
  if (!hierarchy || !Array.isArray(hierarchy)) return [];

  return hierarchy.map(entry => {
    const match = entry.match(/^(\w+)\s*->\s*(\w+)\s*(?:\((.+)\))?/);
    if (!match) return null;
    return {
      from: match[1],
      to: match[2],
      label: match[3] ? match[3].trim() : '',
      raw: entry,
    };
  }).filter(Boolean);
}

// ─── Main load function ─────────────────────────────────────────────────────

/**
 * Load and validate office.yml.
 * @param {string} [configPath] - Path to office.yml (defaults to standard location)
 * @returns {{ schema: object, errors: string[], warnings: string[] }}
 */
function loadSchema(configPath) {
  const filePath = configPath || DEFAULT_CONFIG;
  _configPath = filePath;

  const result = { schema: null, errors: [], warnings: [] };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.errors.push(`Config dosyası bulunamadı: ${filePath}`);
    return result;
  }

  // Parse YAML
  let raw;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    raw = yaml.load(content);
  } catch (e) {
    result.errors.push(`YAML parse hatası: ${e.message}`);
    return result;
  }

  if (!raw || typeof raw !== 'object') {
    result.errors.push('YAML dosyası boş veya geçersiz');
    return result;
  }

  // Validate each section
  result.errors.push(...validateRoster(raw.roster));
  result.errors.push(...validateHierarchy(raw.hierarchy));
  result.errors.push(...validateChannels(raw.channels));
  result.errors.push(...validateTaskPolicies(raw.task_policies));

  // Warnings (non-fatal)
  if (!raw.hitl_policy) {
    result.warnings.push('hitl_policy: Eksik — HITL checkpoints devre dışı');
  }
  if (!raw.task_policies) {
    result.warnings.push('task_policies: Eksik — varsayılan politikalar kullanılacak');
  }

  // Build structured schema
  result.schema = {
    roster: raw.roster || {},
    hierarchy: parseHierarchy(raw.hierarchy),
    hierarchy_raw: raw.hierarchy || [],
    channels: raw.channels || [],
    task_policies: raw.task_policies || { default_priority: 'normal' },
    hitl_policy: raw.hitl_policy || { risk_class: 'low', checkpoint: 'never' },
    _raw: raw,
    _file: filePath,
    _loaded_at: new Date().toISOString(),
  };

  // Cache
  _schema = result.schema;

  return result;
}

// ─── Hot-reload watcher ─────────────────────────────────────────────────────

/**
 * Start watching office.yml for changes.
 * Calls all registered callbacks on reload.
 */
function startWatching(configPath) {
  const filePath = configPath || _configPath || DEFAULT_CONFIG;

  if (_watcher) {
    _watcher.close();
    _watcher = null;
  }

  try {
    let debounceTimer = null;
    _watcher = fs.watch(filePath, (eventType) => {
      if (eventType !== 'change') return;

      // Debounce (multiple events fire on single save)
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('🔄 office.yml değişti — schema yeniden yükleniyor...');

        const result = loadSchema(filePath);

        if (result.errors.length > 0) {
          console.error('❌ Schema reload hatası:');
          result.errors.forEach(e => console.error(`   ${e}`));
          console.log('⚠️  Önceki schema korunuyor.');
          // Keep old schema on error — don't crash
          return;
        }

        if (result.warnings.length > 0) {
          result.warnings.forEach(w => console.warn(`   ⚠️  ${w}`));
        }

        console.log('✅ Schema başarıyla yeniden yüklendi');

        // Notify callbacks
        _onReloadCallbacks.forEach(cb => {
          try { cb(result.schema); }
          catch (e) { console.error('Reload callback error:', e.message); }
        });
      }, 300);
    });

    console.log(`👁  office.yml izleniyor: ${filePath}`);
  } catch (e) {
    console.warn(`⚠️  fs.watch başarısız: ${e.message}`);
  }
}

/**
 * Register a callback for schema reload events.
 */
function onReload(callback) {
  if (typeof callback === 'function') {
    _onReloadCallbacks.push(callback);
  }
}

/**
 * Stop watching.
 */
function stopWatching() {
  if (_watcher) {
    _watcher.close();
    _watcher = null;
  }
}

// ─── Getters ────────────────────────────────────────────────────────────────

function getSchema() {
  if (!_schema) {
    const result = loadSchema();
    if (result.errors.length > 0) return null;
  }
  return _schema;
}

function getRoster() {
  const s = getSchema();
  return s ? s.roster : {};
}

function getChannels() {
  const s = getSchema();
  return s ? s.channels : [];
}

function getHierarchy() {
  const s = getSchema();
  return s ? s.hierarchy : [];
}

function getTaskPolicies() {
  const s = getSchema();
  return s ? s.task_policies : { default_priority: 'normal' };
}

function getHitlPolicy() {
  const s = getSchema();
  return s ? s.hitl_policy : { risk_class: 'low', checkpoint: 'never' };
}

/**
 * Get members of a specific channel.
 */
function getChannelMembers(channelName) {
  const channels = getChannels();
  const ch = channels.find(c => c.name === channelName);
  return ch ? ch.members : [];
}

/**
 * Check if a role has direct hierarchy link to another.
 */
function hasDirectLink(fromRole, toRole) {
  const hierarchy = getHierarchy();
  return hierarchy.some(h => h.from === fromRole && h.to === toRole);
}

module.exports = {
  loadSchema,
  startWatching,
  stopWatching,
  onReload,
  getSchema,
  getRoster,
  getChannels,
  getHierarchy,
  getTaskPolicies,
  getHitlPolicy,
  getChannelMembers,
  hasDirectLink,
  DEFAULT_CONFIG,
};
