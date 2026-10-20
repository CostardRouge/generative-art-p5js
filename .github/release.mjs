// Versions and releases, shared by every repo of the portfolio (COMMON-PROJECT-SPEC, C13). Copy it as is, with
// .github/workflows/release.yml; it needs Node ≥ 18, git with the full history, and the GitHub CLI for `publish`.
//
// The source of truth is CHANGELOG.md, checked against package.json's `version`:
//
//   ## [Unreleased]                         ← always there, filled by every PR that changes what users get
//   ## [1.2.0] - 2026-10-17 — Codename     ← one section per release, newest first; a codename for a new major or
//                                             minor, a patch keeps its minor's (it may restate it)
//   <!-- commit: <40 hex> -->              ← only on a release added after the fact (a backfill): the commit it names
//
// `node .github/release.mjs check` validates that shape (the pull request gate). `publish` (on main) creates, for
// every section without a GitHub Release, its tag v<version> and its Release: at the section's commit for a backfill,
// at the pushed commit for package.json's version. `backfill` publishes the backfilled sections only, with a token
// allowed to tag old commits (second-brain's backfill-releases.yml). Neither moves nor deletes a tag that exists.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/;
const HEADING = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2})(?: — (.+))?)?\s*$/;
const COMMIT = /^<!-- commit: ([0-9a-f]{40}) -->\s*$/;

const fail = (errors) => {
  for (const e of errors) console.error(`::error file=CHANGELOG.md::${e}`);
  process.exit(1);
};

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function parseVersion(v) {
  const m = SEMVER.exec(v);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ?? null } : null;
}

/** SemVer precedence, enough for this file: numbers, then a pre-release below its release. */
function compare(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  for (const k of ['major', 'minor', 'patch']) if (x[k] !== y[k]) return x[k] - y[k];
  if (x.pre === y.pre) return 0;
  if (x.pre === null) return 1;
  if (y.pre === null) return -1;
  return x.pre < y.pre ? -1 : 1;
}

export function parseChangelog(text) {
  const sections = [];
  const errors = [];
  let unreleased = false;
  let current = null;
  for (const [i, line] of text.split('\n').entries()) {
    if (line.startsWith('## ')) {
      const m = HEADING.exec(line);
      if (!m) {
        errors.push(`line ${i + 1}: a section heading is "## [x.y.z] - YYYY-MM-DD — Codename": ${line}`);
        continue;
      }
      if (m[1] === 'Unreleased') {
        if (sections.length > 0 || unreleased) errors.push(`line ${i + 1}: [Unreleased] comes once, first`);
        unreleased = true;
        current = null;
        continue;
      }
      if (!parseVersion(m[1])) errors.push(`line ${i + 1}: ${m[1]} is not a semantic version`);
      if (!m[2]) errors.push(`line ${i + 1}: ${m[1]} has no date`);
      current = { version: m[1], date: m[2], codename: m[3]?.trim() || null, commit: null, body: [], line: i + 1 };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    const c = COMMIT.exec(line);
    if (c && current.body.every((l) => l.trim() === '')) current.commit = c[1];
    else current.body.push(line);
  }
  if (!unreleased) errors.push('no "## [Unreleased]" section');
  for (const s of sections) s.body = s.body.join('\n').trim();
  return { sections, errors };
}

/** Everything a pull request must get right. `tags` are the existing v* tags, `hasCommit` asks git. */
export function validate({ sections, errors: parseErrors }, pkgVersion, tags, hasCommit) {
  const errors = [...parseErrors];
  if (!parseVersion(pkgVersion)) errors.push(`package.json's version ${pkgVersion} is not a semantic version`);
  const valid = sections.filter((s) => parseVersion(s.version));
  if (errors.length) return errors;

  const seen = new Set();
  valid.forEach((s, i) => {
    if (seen.has(s.version)) errors.push(`line ${s.line}: ${s.version} appears twice`);
    seen.add(s.version);
    const next = valid[i + 1];
    if (next && compare(s.version, next.version) <= 0)
      errors.push(`line ${s.line}: ${s.version} must be newer than the section below it (${next.version})`);
    if (next && s.date < next.date) errors.push(`line ${s.line}: ${s.version} is dated before ${next.version}`);
    if (!s.body) errors.push(`line ${s.line}: ${s.version} says nothing`);
  });

  // Codenames: one per major.minor, never reused by another.
  const byMinor = new Map();
  const owner = new Map();
  for (const s of [...valid].reverse()) {
    const v = parseVersion(s.version);
    const key = `${v.major}.${v.minor}`;
    const named = byMinor.get(key);
    if (s.codename === null) {
      if (!named) errors.push(`line ${s.line}: ${s.version} opens ${key} and needs a codename`);
      continue;
    }
    if (named && named !== s.codename) errors.push(`line ${s.line}: ${s.version} keeps ${key}'s codename, ${named}`);
    const taken = owner.get(s.codename.toLowerCase());
    if (taken && taken !== key) errors.push(`line ${s.line}: the codename ${s.codename} already names ${taken}`);
    byMinor.set(key, s.codename);
    owner.set(s.codename.toLowerCase(), key);
  }

  const top = valid[0];
  if (!top) errors.push(`package.json says ${pkgVersion} and CHANGELOG.md has no section for it`);
  else if (top.version !== pkgVersion)
    errors.push(`package.json says ${pkgVersion}, the newest section is ${top.version}: they move together`);

  for (const s of valid) {
    const tagged = tags.has(`v${s.version}`);
    if (s.commit && !hasCommit(s.commit)) errors.push(`line ${s.line}: ${s.version} names a commit not in history`);
    if (!tagged && !s.commit && s.version !== pkgVersion)
      errors.push(`line ${s.line}: ${s.version} has no tag yet: name its commit (<!-- commit: sha -->) to backfill it`);
  }
  const newest = [...tags]
    .map((t) => t.slice(1))
    .filter(parseVersion)
    .sort(compare)
    .pop();
  if (newest && compare(pkgVersion, newest) < 0) errors.push(`package.json says ${pkgVersion}, older than v${newest}`);
  return errors;
}

function load() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')).version ?? '';
  const changelog = parseChangelog(readFileSync('CHANGELOG.md', 'utf8'));
  const tags = new Set(git('tag', '--list', 'v*').split('\n').filter(Boolean));
  const hasCommit = (sha) => {
    try {
      return git('cat-file', '-t', sha) === 'commit';
    } catch {
      return false;
    }
  };
  return { pkg, changelog, tags, errors: validate(changelog, pkg, tags, hasCommit) };
}

function check() {
  const { pkg, changelog, errors } = load();
  if (errors.length) fail(errors);
  const n = changelog.sections.length;
  console.log(`CHANGELOG.md and package.json agree on ${pkg} (${n} release${n === 1 ? '' : 's'}).`);
}

/**
 * `publish` (release.yml, on main): every section without a Release, package.json's version first, at the pushed
 * commit. GitHub refuses the workflow's own token a new tag on a commit whose .github/workflows differ from the default
 * branch's, which every backfill is, so a refused backfill is only a warning there.
 * `backfill` (second-brain's backfill-releases.yml, with the maintainer's token): the backfilled sections only.
 */
function publish(backfillOnly) {
  const { pkg, changelog, tags, errors } = load();
  if (errors.length) fail(errors);
  const sha = process.env.GITHUB_SHA;
  if (!backfillOnly && !sha) fail(['GITHUB_SHA is not set: publish runs in GitHub Actions only']);
  const released = new Set(
    JSON.parse(
      execFileSync('gh', ['release', 'list', '--limit', '1000', '--json', 'tagName'], { encoding: 'utf8' }),
    ).map((r) => r.tagName),
  );
  // A patch carries its minor's codename: read them all, oldest first, before publishing anything.
  const minorOf = (s) => {
    const v = parseVersion(s.version);
    return `${v.major}.${v.minor}`;
  };
  const named = new Map();
  for (const s of [...changelog.sections].reverse()) if (s.codename) named.set(minorOf(s), s.codename);
  // package.json's version first: it is why a release pull request merges, and a backfill must never hold it back.
  const order = [...changelog.sections]
    .reverse()
    .filter((s) => !backfillOnly || s.commit)
    .sort((a, b) => (b.version === pkg) - (a.version === pkg));
  const skipped = [];
  for (const s of order) {
    const tag = `v${s.version}`;
    if (released.has(tag)) continue;
    const title = `${tag} — ${s.codename ?? named.get(minorOf(s))}`;
    const notes = `Released on ${s.date}.\n\n${s.body}\n`;
    const args = ['release', 'create', tag, '--title', title, '--notes-file', '-'];
    if (tags.has(tag)) args.push('--verify-tag');
    else args.push('--target', s.commit ?? sha);
    args.push(`--latest=${s.version === pkg}`);
    if (parseVersion(s.version).pre) args.push('--prerelease');
    try {
      execFileSync('gh', args, { input: notes, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
      if (s.version === pkg || backfillOnly) throw e;
      skipped.push(tag);
      continue;
    }
    console.log(`Released ${title} at ${s.commit ?? (tags.has(tag) ? 'its existing tag' : sha)}.`);
  }
  if (skipped.length)
    console.log(
      `::warning title=Backfill waiting::${skipped.join(', ')}: a tag on an older commit needs the maintainer's ` +
        'token. second-brain\'s "Backfill releases" workflow publishes them (COMMON-PROJECT-SPEC, C13).',
    );
}

const mode = process.argv[2];
if (mode === 'check') check();
else if (mode === 'publish') publish(false);
else if (mode === 'backfill') publish(true);
else if (mode !== undefined) fail([`unknown mode ${mode}: check, publish or backfill`]);
