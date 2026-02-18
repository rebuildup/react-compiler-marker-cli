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

export function checkFile(sourceCode: string, filename: string): FileResult {
  const functions: FunctionResult[] = [];

  const plugin = loadPlugin();
  if (!plugin) {
    return {
      file: filename,
      functions: [],
      error: "babel-plugin-react-compiler not found",
    };
  }

  const successfulCompilations: Array<LoggerEvent> = [];
  const failedCompilations: Array<LoggerEvent> = [];

  const logger = {
    logEvent(filename: string | null, rawEvent: LoggerEvent) {
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

  try {
    const language = getLanguageFromFilename(filename);
    const ast = BabelParser.parse(sourceCode, {
      sourceFilename: filename,
      plugins: [language, "jsx"],
      sourceType: "module",
    });

    transformFromAstSync(ast, sourceCode, {
      filename,
      highlightCode: false,
      retainLines: true,
      plugins: [[plugin, { ...DEFAULT_COMPILER_OPTIONS, logger, noEmit: true }]],
      sourceType: "module",
      configFile: false,
      babelrc: false,
    });

    for (const event of successfulCompilations) {
      functions.push({
        name: event.fnName || "anonymous",
        line: event.fnLoc?.start?.line || 0,
        optimized: true,
      });
    }

    for (const event of failedCompilations) {
      functions.push({
        name: event.fnName || "anonymous",
        line: event.fnLoc?.start?.line || 0,
        optimized: false,
        reason: event.detail?.reason,
        description: event.detail?.description,
        suggestions: event.detail?.suggestions,
      });
    }

    return { file: filename, functions };
  } catch (error: unknown) {
    return {
      file: filename,
      functions,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
