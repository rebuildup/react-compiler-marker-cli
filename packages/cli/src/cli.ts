import * as fs from "fs";
import * as path from "path";
import { globby } from "globby";
import { checkFile, FileResult, FunctionResult } from "./checker.js";

const VERSION = "1.0.0";

type Options = {
  json: boolean;
  compact: boolean;
  verbose: boolean;
  fail: boolean;
  stdin: boolean;
  help: boolean;
  version: boolean;
  input: string | null;
};

function parseArgs(args: string[]): Options {
  const options: Options = {
    json: false,
    compact: false,
    verbose: false,
    fail: false,
    stdin: false,
    help: false,
    version: false,
    input: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--json":
        options.json = true;
        break;
      case "--compact":
        options.compact = true;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--fail":
        options.fail = true;
        break;
      case "--stdin":
        options.stdin = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--version":
        options.version = true;
        break;
      default:
        if (!arg.startsWith("-")) {
          options.input = arg;
        }
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
rcm - React Compiler Marker CLI

USAGE:
  rcm check [input] [options]

INPUT:
  <file>              Single file to check
  <directory>         Recursively check .tsx/.jsx files in directory
  <glob>              Glob pattern (e.g., "src/**/*.tsx")
  --stdin             Read from stdin

OPTIONS:
  --json              Output as JSON
  --compact           Token-efficient compact format
  --verbose           Show full error details
  --fail              Exit with code 1 if any function is not optimized
  --help, -h          Show this help
  --version           Show version

EXAMPLES:
  rcm check src/App.tsx
  rcm check src/components/
  rcm check "src/**/*.tsx" --json
  cat src/App.tsx | rcm check --stdin
  rcm check src/ --fail --json > report.json

EXIT CODES:
  0  Success (all optimized or --fail not set)
  1  Not optimized (--fail set and unoptimized functions found)
  2  Error (file not found, parse error, etc.)
`);
}

function formatCompactText(results: FileResult[]): string {
  return results
    .map((r) => {
      const parts = r.functions.map((f) => {
        const prefix = f.optimized ? "✓" : "✗";
        if (f.optimized) {
          return `${prefix}${f.name}:${f.line}`;
        }
        const reason = f.reason ? `(${f.reason.slice(0, 20)})` : "";
        return `${prefix}${f.name}:${f.line}${reason}`;
      });
      return `${r.file}: ${parts.join(" ")}`;
    })
    .join("\n");
}

function formatText(results: FileResult[], verbose: boolean): string {
  const lines: string[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    if (result.functions.length === 0) continue;

    lines.push(result.file);

    for (const fn of result.functions) {
      if (fn.optimized) {
        totalPassed++;
        lines.push(`  ✓ ${fn.name}:${fn.line}`);
      } else {
        totalFailed++;
        let msg = `  ✗ ${fn.name}:${fn.line}`;
        if (fn.reason) msg += ` - ${fn.reason}`;
        lines.push(msg);

        if (verbose) {
          if (fn.description) {
            lines.push(`      ${fn.description}`);
          }
          if (fn.suggestions && fn.suggestions.length > 0) {
            for (const s of fn.suggestions) {
              lines.push(`      → ${s}`);
            }
          }
        }
      }
    }

    lines.push("");
  }

  lines.push(`${totalPassed} passed, ${totalFailed} failed`);
  return lines.join("\n");
}

type CompactJsonResult = {
  f: string;
  ok?: Array<{ n: string; l: number }>;
  fail?: Array<{ n: string; l: number; e?: string }>;
};

function formatCompactJson(results: FileResult[]): string {
  const compact: CompactJsonResult[] = results.map((r) => {
    const item: CompactJsonResult = { f: r.file };
    const ok = r.functions
      .filter((f) => f.optimized)
      .map((f) => ({ n: f.name, l: f.line }));
    const fail = r.functions
      .filter((f) => !f.optimized)
      .map((f) => ({ n: f.name, l: f.line, e: f.reason }));

    if (ok.length > 0) item.ok = ok;
    if (fail.length > 0) item.fail = fail;
    return item;
  });

  return JSON.stringify(compact);
}

type FullJsonResult = {
  file: string;
  functions: Array<{
    name: string;
    line: number;
    optimized: boolean;
    reason?: string;
    description?: string;
    suggestions?: string[];
  }>;
  error?: string;
};

function formatFullJson(results: FileResult[]): string {
  const full: FullJsonResult[] = results.map((r) => ({
    file: r.file,
    functions: r.functions.map((f) => ({
      name: f.name,
      line: f.line,
      optimized: f.optimized,
      ...(f.reason && { reason: f.reason }),
      ...(f.description && { description: f.description }),
      ...(f.suggestions && { suggestions: f.suggestions }),
    })),
    ...(r.error && { error: r.error }),
  }));

  return JSON.stringify(full, null, 2);
}

async function getFiles(input: string | null): Promise<string[]> {
  if (!input) return [];

  const stat = await fs.promises.stat(input).catch(() => null);
  if (!stat) return [];

  if (stat.isFile()) {
    return [input];
  }

  if (stat.isDirectory()) {
    return globby(["**/*.{tsx,jsx,ts,js}"], {
      cwd: input,
      absolute: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    });
  }

  // Treat as glob pattern
  return globby([input], {
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  });
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);

  // Handle "check" subcommand or direct usage
  let cmdArgs = args;
  if (args[0] === "check") {
    cmdArgs = args.slice(1);
  }

  const options = parseArgs(cmdArgs);

  if (options.help) {
    showHelp();
    return 0;
  }

  if (options.version) {
    console.log(`rcm v${VERSION}`);
    return 0;
  }

  const results: FileResult[] = [];

  if (options.stdin) {
    const sourceCode = await readStdin();
    const result = checkFile(sourceCode, "stdin");
    results.push(result);
  } else if (options.input) {
    const files = await getFiles(options.input);

    if (files.length === 0) {
      console.error(`No files found: ${options.input}`);
      return 2;
    }

    for (const file of files) {
      const sourceCode = await fs.promises.readFile(file, "utf-8");
      const result = checkFile(sourceCode, file);
      results.push(result);
    }
  } else {
    showHelp();
    return 2;
  }

  // Output
  if (options.json && options.compact) {
    console.log(formatCompactJson(results));
  } else if (options.json) {
    console.log(formatFullJson(results));
  } else if (options.compact) {
    console.log(formatCompactText(results));
  } else {
    console.log(formatText(results, options.verbose));
  }

  // Exit code
  const hasFailures = results.some((r) =>
    r.functions.some((f) => !f.optimized)
  );

  if (options.fail && hasFailures) {
    return 1;
  }

  return 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(2);
  });
