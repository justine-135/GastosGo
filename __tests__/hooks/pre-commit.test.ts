import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOOK = path.resolve(__dirname, '../../scripts/pre-commit.sh');
const PROJECT_ROOT = path.resolve(__dirname, '../..');

function runHook(cwd: string) {
  return spawnSync('bash', [HOOK], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${path.join(PROJECT_ROOT, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}` },
  });
}

function touch(filePath: string, offsetMs = 0) {
  const now = new Date(Date.now() + offsetMs);
  fs.utimesSync(filePath, now, now);
}

const TSC_BIN = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'bin', 'tsc');

function installTsc(dir: string) {
  fs.mkdirSync(path.join(dir, 'node_modules', '.bin'), { recursive: true });
  const wrapper = `#!/bin/sh\nexec node "${TSC_BIN}" "$@"\n`;
  const dest = path.join(dir, 'node_modules', '.bin', 'tsc');
  fs.writeFileSync(dest, wrapper, { mode: 0o755 });
}

function writeMinimalTsconfig(dir: string) {
  installTsc(dir);
  fs.writeFileSync(path.join(dir, 'index.ts'), 'const x = 1;');
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  );
}

describe('pre-commit hook', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pre-commit-test-'));
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    fs.mkdirSync(path.join(dir, 'node_modules'));
    fs.writeFileSync(path.join(dir, 'node_modules', '.package-lock.json'), '{}');
    touch(path.join(dir, 'package.json'), -10000);
    touch(path.join(dir, 'node_modules', '.package-lock.json'), -5000);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('exits 0 when package.json and lockfile are in sync and tsc passes', () => {
    writeMinimalTsconfig(dir);
    const result = runHook(dir);
    expect(result.status).toBe(0);
  });

  it('exits 1 and prints instructions when package.json is newer than lockfile', () => {
    touch(path.join(dir, 'package.json'), 10000);
    const result = runHook(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/npm install/);
  });

  it('exits 1 when tsc finds a type error', () => {
    installTsc(dir);
    fs.writeFileSync(path.join(dir, 'index.ts'), 'const x: number = "not a number";');
    fs.writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
    );
    const result = runHook(dir);
    expect(result.status).not.toBe(0);
  });
});
