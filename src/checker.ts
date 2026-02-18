import { createRequire } from "module";
import { PluginObj, transformFromAstSync } from "@babel/core";
import * as BabelParser from "@babel/parser";

const require = createRequire(import.meta.url);

type EventLocation = {
  start?: { line?: number; column?: number; index?: number };
  end?: { line?: number; column?: number; index?: number };
};

type Detail = {
  kind?: string;
  loc?: EventLocation;
  message?: string;
};

type Details = {
  reason?: string;
  description?: string;
  suggestions?: string[];
  loc?: EventLocation;
  details?: Array<Detail>;
};

type LoggerEvent = {
  filename: string | null;
  kind?: string;
  fnLoc: EventLocation;
  fnName?: string;
  detail?: Details & {
    options: Details;
  };
};

export type FunctionResult = {
  name: string;
  line: number;
  optimized: boolean;
  reason?: string;
  description?: string;
  suggestions?: string[];
};

export type FileResult = {
  file: string;
  functions: FunctionResult[];
  error?: string;
};

const DEFAULT_COMPILER_OPTIONS = {
  noEmit: false,
  compilationMode: "infer",
  panicThreshold: "none",
  environment: {
    enableTreatRefLikeIdentifiersAsRefs: true,
  },
};

let cachedPlugin: PluginObj | undefined;

function getLanguageFromFilename(filename: string): "flow" | "typescript" {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["js", "jsx", "mjs"].includes(ext ?? "") ? "flow" : "typescript";
}

function loadPlugin(): PluginObj | undefined {
  if (cachedPlugin) {
    return cachedPlugin;
  }

  try {
    cachedPlugin = require("babel-plugin-react-compiler");
    return cachedPlugin;
  } catch {
    return undefined;
  }
}

// Creates a logger that collects compilation events
function createLogger(): {
  logger: { logEvent: (filename: string | null, event: LoggerEvent) => void };
  successfulCompilations: LoggerEvent[];
  failedCompilations: LoggerEvent[];
} {
  const successfulCompilations: LoggerEvent[] = [];
  const failedCompilations: LoggerEvent[] = [];

  const logger = {
    logEvent(filename: string | null, rawEvent: LoggerEvent): void {
      const event = { ...rawEvent, filename };
      switch (event.kind) {
        case "CompileSuccess":
          successfulCompilations.push(event);
          break;
        case "CompileError":
        case "CompileDiagnostic":
        case "PipelineError":
          failedCompilations.push(event);
          break;
      }
    },
  };

  return { logger, successfulCompilations, failedCompilations };
}

// Creates parser options based on file extension
function createParserOptions(filename: string): BabelParser.ParserOptions {
  const language = getLanguageFromFilename(filename);
  return {
    sourceFilename: filename,
    plugins: [language, "jsx"],
    sourceType: "module",
  };
}

// Runs Babel transformation with React Compiler plugin
function runCompilation(
  sourceCode: string,
  filename: string,
  plugin: PluginObj,
  logger: { logEvent: (filename: string | null, event: LoggerEvent) => void }
): void {
  const ast = BabelParser.parse(sourceCode, createParserOptions(filename));

  transformFromAstSync(ast, sourceCode, {
    filename,
    highlightCode: false,
    retainLines: true,
    plugins: [[plugin, { ...DEFAULT_COMPILER_OPTIONS, logger, noEmit: true }]],
    sourceType: "module",
    configFile: false,
    babelrc: false,
  });
}

// Converts a compiler event to a FunctionResult
function eventToFunctionResult(event: LoggerEvent, optimized: boolean): FunctionResult {
  return {
    name: event.fnName || "anonymous",
    line: event.fnLoc?.start?.line || 1,
    optimized,
    ...(optimized ? {} : {
      reason: event.detail?.reason,
      description: event.detail?.description,
      suggestions: event.detail?.suggestions,
    }),
  };
}

// Collects function results from compilation events
function collectResults(
  successful: LoggerEvent[],
  failed: LoggerEvent[]
): FunctionResult[] {
  const results: FunctionResult[] = [];

  for (const event of successful) {
    results.push(eventToFunctionResult(event, true));
  }

  for (const event of failed) {
    results.push(eventToFunctionResult(event, false));
  }

  return results;
}

export function checkFile(sourceCode: string, filename: string): FileResult {
  const plugin = loadPlugin();
  if (!plugin) {
    return {
      file: filename,
      functions: [],
      error: "babel-plugin-react-compiler not found",
    };
  }

  const { logger, successfulCompilations, failedCompilations } = createLogger();

  try {
    runCompilation(sourceCode, filename, plugin, logger);
    const functions = collectResults(successfulCompilations, failedCompilations);
    return { file: filename, functions };
  } catch (error: unknown) {
    return {
      file: filename,
      functions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
