'use strict';

const fs = require('fs');
const path = require('path');

const SCHEDULE_LOG = path.resolve(__dirname, '../../brains/cofounder-office/execution_logs/schedule.jsonl');

// Ensure directory exists
const logDir = path.dirname(SCHEDULE_LOG);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/**
 * Built-in schedule definitions.
 * Each schedule has a name, trigger persona, task description, and interval.
 */
const BUILTIN_SCHEDULES = [
  {
    name: 'daily_standup',
    trigger: 'arabulucu',
    task: 'Dünkü ilerlemeyi özetle ve bugünkü planı çıkar. Her persona için kısa durum raporu ver.',
    interval_hours: 24,
    channel: '#genel',
  },
  {
    name: 'weekly_review',
    trigger: 'mimar',
    task: 'Haftalık stratejik değerlendirme: Bu hafta ne karar alındı, ne hayata geçti, ne bekleniyor?',
    interval_hours: 168, // 7 days
    channel: '#strateji',
  },
  {
    name: 'backlog_sweep',
    trigger: 'arabulucu',
    task: 'Backlog klasöründeki görevleri tara. Stale olanları işaretle, önceliklendirmeyi güncelle.',
    interval_hours: 72, // 3 days
    channel: '#operasyon',
  },
];

/**
 * Load custom schedules from office.yml (if present).
 */
function loadCustomSchedules() {
  try {
    const schemaLoader = require('./schema-loader');
    const schema = schemaLoader.getSchema();
    if (schema && schema._raw && schema._raw.cron) {
      return schema._raw.cron.map(entry => ({
        name: entry.schedule || entry.name,
        trigger: entry.trigger,
        task: entry.task,
        interval_hours: entry.interval_hours || 24,
        channel: entry.channel || '#genel',
        custom: true,
      }));
    }
  } catch { /* no custom schedules */ }
  return [];
}

/**
 * Get all schedules (built-in + custom from office.yml).
 */
function getAllSchedules() {
  const custom = loadCustomSchedules();
  // Custom schedules override built-in ones with the same name
  const customNames = new Set(custom.map(c => c.name));
  const builtins = BUILTIN_SCHEDULES.filter(b => !customNames.has(b.name));
  return [...builtins, ...custom];
}

/**
 * Read schedule execution log.
 */
function getExecutionLog() {
  if (!fs.existsSync(SCHEDULE_LOG)) return [];

  return fs.readFileSync(SCHEDULE_LOG, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);
}

/**
 * Record a schedule execution.
 */
function logExecution(scheduleName, trigger, result) {
  const entry = {
    schedule: scheduleName,
    trigger,
    timestamp: new Date().toISOString(),
    result: result || 'completed',
  };
  fs.appendFileSync(SCHEDULE_LOG, JSON.stringify(entry) + '\n', 'utf8');
  return entry;
}

/**
 * Check which schedules are due based on their interval and last execution.
 * @returns {Array} list of schedules that should run now
 */
function getDueSchedules() {
  const schedules = getAllSchedules();
  const log = getExecutionLog();
  const now = Date.now();
  const due = [];

  for (const schedule of schedules) {
    // Find last execution of this schedule
    const lastExec = log
      .filter(l => l.schedule === schedule.name)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    if (!lastExec) {
      // Never executed → due
      due.push({ ...schedule, last_run: null, reason: 'İlk çalıştırma' });
      continue;
    }

    const lastTime = new Date(lastExec.timestamp).getTime();
    const intervalMs = schedule.interval_hours * 60 * 60 * 1000;

    if (now - lastTime >= intervalMs) {
      due.push({ ...schedule, last_run: lastExec.timestamp, reason: 'Süre doldu' });
    }
  }

  return due;
}

/**
 * Simulate a schedule trigger (for demo purposes).
 * Marks the schedule as "triggered" and returns the task details.
 */
function simulateTrigger(scheduleName) {
  const schedules = getAllSchedules();
  const schedule = schedules.find(s => s.name === scheduleName);

  if (!schedule) {
    return { error: `Schedule bulunamadı: ${scheduleName}` };
  }

  const logEntry = logExecution(scheduleName, schedule.trigger, 'simulated');

  return {
    schedule: schedule.name,
    trigger_persona: schedule.trigger,
    channel: schedule.channel,
    task: schedule.task,
    executed_at: logEntry.timestamp,
    mode: 'simulated',
  };
}

/**
 * Get schedule status summary.
 */
function getScheduleStatus() {
  const schedules = getAllSchedules();
  const log = getExecutionLog();
  const now = Date.now();

  return schedules.map(schedule => {
    const lastExec = log
      .filter(l => l.schedule === schedule.name)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    let next_due = 'Şimdi';
    if (lastExec) {
      const lastTime = new Date(lastExec.timestamp).getTime();
      const intervalMs = schedule.interval_hours * 60 * 60 * 1000;
      const nextTime = lastTime + intervalMs;

      if (nextTime > now) {
        const hoursLeft = Math.round((nextTime - now) / (60 * 60 * 1000));
        next_due = `${hoursLeft} saat sonra`;
      }
    }

    return {
      name: schedule.name,
      trigger: schedule.trigger,
      channel: schedule.channel,
      interval: `${schedule.interval_hours} saat`,
      last_run: lastExec ? lastExec.timestamp : null,
      next_due,
      custom: schedule.custom || false,
    };
  });
}

module.exports = {
  getAllSchedules,
  getDueSchedules,
  simulateTrigger,
  logExecution,
  getScheduleStatus,
  getExecutionLog,
  BUILTIN_SCHEDULES,
};
