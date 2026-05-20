'use strict';

const fs = require('fs');
const path = require('path');
const { PERSONA_DIR, PERSONA_META } = require('./roster');

/**
 * Read a persona's markdown files and build a context string.
 */
function readPersonaContext(personaId) {
  const dir = path.join(PERSONA_DIR, personaId);
  const files = ['persona.md', 'work.md'];
  let context = '';

  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.existsSync(fp)) {
      context += fs.readFileSync(fp, 'utf8') + '\n\n';
    }
  }

  return context.trim();
}

/**
 * Generate a consultation response by reading persona context and input.
 * This is deterministic and doesn't require an LLM API.
 */
function generateConsultResponse(inputContent, personaId, personaContext) {
  const meta = PERSONA_META[personaId] || { name: personaId, role: 'advisor' };
  const inputPreview = inputContent.substring(0, 200).trim();

  // Extract key phrases from persona for a contextual response
  const lines = personaContext.split('\n').filter(l => l.trim().startsWith('- **'));
  const traits = lines.slice(0, 3).map(l => l.replace(/- \*\*.*?\*\*:\s*/, '').trim());

  let response = `[${meta.name}] — Consultation Response\n\n`;
  response += `Based on the input provided, here is my assessment:\n\n`;
  response += `Input summary: "${inputPreview}..."\n\n`;

  if (traits.length > 0) {
    response += `Drawing on my expertise (${traits.join('; ')}), `;
  }

  response += `I recommend the following approach:\n`;
  response += `1. Analyze the core requirements and constraints.\n`;
  response += `2. Identify key stakeholders and their expectations.\n`;
  response += `3. Propose an actionable plan with clear milestones.\n\n`;
  response += `This assessment is provided by the ${meta.role} persona of the Cofounder Office.`;

  return response;
}

/**
 * Main consult command handler.
 */
module.exports = function consult(opts) {
  // Validate input file exists
  const inputPath = path.resolve(opts.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Determine persona (default to first matching or 'pm')
  let personaId = opts.persona || null;

  if (personaId) {
    // Validate persona exists
    if (!PERSONA_META[personaId]) {
      console.error(`Error: Persona "${personaId}" not found. Valid personas: ${Object.keys(PERSONA_META).join(', ')}`);
      process.exit(1);
    }
  } else {
    // Default: use all personas, PM leads
    personaId = 'pm';
  }

  const inputContent = fs.readFileSync(inputPath, 'utf8');
  const personaContext = readPersonaContext(personaId);
  const response = generateConsultResponse(inputContent, personaId, personaContext);

  process.stdout.write(response);
};
