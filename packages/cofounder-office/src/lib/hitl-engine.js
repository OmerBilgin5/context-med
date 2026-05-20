'use strict';

const path = require('path');

// Try to load schema-loader for policy reading
let schemaLoader = null;
try {
  schemaLoader = require('./schema-loader');
} catch { /* schema-loader optional */ }

/**
 * Risk classification keywords.
 * Maps keywords in AI output or user input to risk levels.
 */
const RISK_KEYWORDS = {
  high: [
    'deploy', 'production', 'prod', 'yayınla', 'publish', 'tweet', 'e-posta',
    'mail', 'fatura', 'ödeme', 'payment', 'sil', 'delete', 'drop',
    'migration', 'rollback', 'revert', 'api key', 'secret', 'credential',
    'müşteri verisi', 'kişisel veri', 'KVKK', 'GDPR',
    'mimari değişiklik', 'architecture change', 'monolith', 'microservice',
  ],
  medium: [
    'refactor', 'yeniden yaz', 'rewrite', 'değiştir', 'update', 'güncelle',
    'sprint', 'deadline', 'teslim', 'release', 'merge', 'branch',
    'config', 'yapılandırma', 'environment', 'ortam',
    'test', 'CI', 'pipeline',
  ],
  low: [
    'oku', 'read', 'listele', 'list', 'göster', 'show', 'rapor', 'report',
    'analiz', 'analyze', 'not', 'note', 'log', 'yorum', 'comment',
  ],
};

/**
 * Classify the risk level of an AI response or task.
 *
 * @param {string} text - AI response or user input text
 * @param {string} persona - 'mimar', 'arabulucu', 'icraci'
 * @returns {{ risk_class: string, risk_score: number, matched_keywords: string[], requires_approval: boolean }}
 */
function classifyRisk(text, persona) {
  const textLower = (text || '').toLowerCase();
  const matched = { high: [], medium: [], low: [] };

  // Check keywords
  for (const [level, keywords] of Object.entries(RISK_KEYWORDS)) {
    for (const kw of keywords) {
      if (textLower.includes(kw.toLowerCase())) {
        matched[level].push(kw);
      }
    }
  }

  // Determine risk class
  let risk_class = 'low';
  let risk_score = 10;

  if (matched.high.length > 0) {
    risk_class = 'high';
    risk_score = 70 + Math.min(matched.high.length * 10, 30);
  } else if (matched.medium.length > 0) {
    risk_class = 'medium';
    risk_score = 30 + Math.min(matched.medium.length * 10, 30);
  } else if (matched.low.length > 0) {
    risk_class = 'low';
    risk_score = 10;
  }

  // Persona escalation rules
  // If İcracı is making architecture decisions → escalate
  if (persona === 'icraci' && matched.high.length > 0) {
    risk_score = Math.min(risk_score + 15, 100);
  }

  // Get HITL policy from schema
  let requires_approval = false;
  const hitlPolicy = schemaLoader ? schemaLoader.getHitlPolicy() : { risk_class: 'high', checkpoint: 'always' };

  if (hitlPolicy.checkpoint === 'always' && risk_class === 'high') {
    requires_approval = true;
  } else if (hitlPolicy.checkpoint === 'medium_and_above' && (risk_class === 'high' || risk_class === 'medium')) {
    requires_approval = true;
  }

  return {
    risk_class,
    risk_score,
    matched_keywords: [...matched.high, ...matched.medium],
    requires_approval,
    policy: hitlPolicy,
  };
}

/**
 * Create a HITL checkpoint request.
 * Returns the checkpoint data that should be sent to the user.
 */
function createCheckpoint(opts) {
  return {
    id: `hitl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    persona: opts.persona,
    channel: opts.channel,
    risk_class: opts.risk_class,
    risk_score: opts.risk_score,
    matched_keywords: opts.matched_keywords || [],
    input_preview: (opts.user_input || '').substring(0, 200),
    output_preview: (opts.ai_output || '').substring(0, 300),
    status: 'pending', // pending → approved | rejected
  };
}

/**
 * Process HITL approval or rejection.
 */
function resolveCheckpoint(checkpoint, decision) {
  return {
    ...checkpoint,
    status: decision, // 'approved' or 'rejected'
    resolved_at: new Date().toISOString(),
  };
}

module.exports = {
  classifyRisk,
  createCheckpoint,
  resolveCheckpoint,
  RISK_KEYWORDS,
};
