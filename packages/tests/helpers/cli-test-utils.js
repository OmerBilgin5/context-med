/**
 * Proxy CLI Test Utilities
 * 
 * This file bridges the path difference between the root tests/helpers/
 * and the packages/ level require path used by regular package smoke tests.
 * 
 * Regular packages use: require('../../../tests/helpers/cli-test-utils')
 * which resolves to packages/tests/helpers/ — this file proxies to the real utils
 * with corrected ROOT_DIR.
 */
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// ROOT_DIR should be the monorepo root (2 levels up from packages/tests/helpers/)
const ROOT_DIR = path.resolve(__dirname, '../../../');
const FIXTURES = path.join(ROOT_DIR, 'fixtures');

function execCli(binPath, args = [], opts = {}) {
  const cmd = `node ${binPath} ${args.join(' ')}`;
  const cwd = opts.cwd || ROOT_DIR;
  const timeout = opts.timeout || 30000;

  try {
    const stdout = execSync(cmd, {
      cwd,
      timeout,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...opts.env },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

function setupOutputDir(packageName, testName) {
  const dir = path.join(ROOT_DIR, 'tmp-test-output', packageName, testName);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function teardownOutputDir(packageName) {
  const dir = path.join(ROOT_DIR, 'tmp-test-output', packageName);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function expectFileExists(filePath) {
  expect(fs.existsSync(filePath)).toBe(true);
}

function expectValidJson(filePath) {
  expectFileExists(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  expect(() => { parsed = JSON.parse(content); }).not.toThrow();
  return parsed;
}

function expectNonEmptyFile(filePath) {
  expectFileExists(filePath);
  const stat = fs.statSync(filePath);
  expect(stat.size).toBeGreaterThan(0);
}

function getBinPath(packageName) {
  return path.join(ROOT_DIR, 'packages', packageName, 'bin', 'cli.js');
}

function expectHelpWorks(binPath) {
  const result = execCli(binPath, ['--help']);
  expect(result.exitCode).toBe(0);
  expect(result.stdout.length).toBeGreaterThan(0);
  return result;
}

module.exports = {
  ROOT_DIR,
  FIXTURES,
  execCli,
  setupOutputDir,
  teardownOutputDir,
  expectFileExists,
  expectValidJson,
  expectNonEmptyFile,
  getBinPath,
  expectHelpWorks,
};
