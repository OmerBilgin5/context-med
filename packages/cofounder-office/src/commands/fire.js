'use strict';

const fs = require('fs');
const path = require('path');
const { PERSONA_DIR, PERSONA_META } = require('./roster');

/**
 * Main fire command handler.
 * Sets a persona's status to 'inactive' by writing status.json.
 */
module.exports = function fire(opts) {
  const personaId = opts.input;

  // Validate persona exists
  if (!PERSONA_META[personaId]) {
    const validIds = Object.keys(PERSONA_META).join(', ');
    console.error(`Error: Persona "${personaId}" not found. Valid personas: ${validIds}`);
    process.exit(1);
  }

  const personaDir = path.join(PERSONA_DIR, personaId);
  if (!fs.existsSync(personaDir)) {
    console.error(`Error: Persona directory not found: ${personaDir}`);
    process.exit(1);
  }

  // Write status.json
  const statusFile = path.join(personaDir, 'status.json');
  const statusData = {
    status: 'inactive',
    fired_at: new Date().toISOString(),
    fired_by: 'cli',
  };

  fs.writeFileSync(statusFile, JSON.stringify(statusData, null, 2), 'utf8');
  console.log(`Persona "${personaId}" has been deactivated.`);
};
