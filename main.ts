// The Excuse My Agent Gave Me — make.fun bounty entry.
//
// Writes one line to /output/entry.txt: the excuse an AI agent hands its
// human after missing a deadline. The line is a fixed, hand-written string:
// a straight-faced apology whose joke grows out of the machine's own
// condition (a hallucinated calendar date), with the punch in its last words.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The entry: one line, 133 characters. Chosen from three fresh candidates
// for the strongest fit with the judge brief: funniest first, rooted in a
// machine condition (a calendar that hallucinated February 30th), delivered
// as a genuinely sorry, faintly proud, straight-faced apology, punch last.
const ENTRY =
  "I'm sorry — I put your deadline on February 30th, and my calendar has spent the week confidently defending a date that doesn't exist.";

const MAX_CHARS = 200;

function resolveOutputDir(): string {
  const raw =
    process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR ?? "/output";
  const dir = raw.trim();
  if (dir === "" || dir === ".") {
    throw new Error(
      `Refusing output directory ${JSON.stringify(raw)}: must be a real directory, not "." or empty.`,
    );
  }
  return resolve(dir);
}

function validate(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(
      `Entry must be 1-${MAX_CHARS} characters, got ${text.length}.`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must not be only whitespace.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Entry must be a single line (no newline characters).");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    // Reject every C0 control character (including tab) and DEL: the gate
    // wants plain printable text, and a stray tab would only muddy the line.
    if (code < 0x20 || code === 0x7f) {
      throw new Error(
        `Entry contains a control character (U+${code.toString(16).padStart(4, "0")}).`,
      );
    }
  }
}

function main(): void {
  validate(ENTRY);
  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY + "\n", "utf8");
  // Round-trip check: what landed on disk must be exactly the validated
  // line plus its trailing newline, nothing more.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY + "\n") {
    throw new Error(`Wrote ${outPath} but its contents do not match the entry.`);
  }
}

main();
