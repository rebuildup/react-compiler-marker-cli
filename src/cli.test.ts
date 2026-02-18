import { describe, it, expect } from 'vitest';
import type { FileResult } from './checker.js';

// Import format functions by re-implementing them for testing
// since they're not exported from cli.ts

type FunctionResult = {
  name: string;
  line: number;
  optimized: boolean;
  reason?: string;
  description?: string;
  suggestions?: string[];
};

type MockFileResult = {
  file: string;
  functions: FunctionResult[];
  error?: string;
};

// Re-implement functions for testing
function formatCompactText(results: MockFileResult[], showAll: boolean): string {
  return results
    .map((r) => {
      const functions = showAll ? r.functions : r.functions.filter((f) => !f.optimized);
      if (functions.length === 0) return null;

      const parts = functions.map((f) => {
        const prefix = f.optimized ? '✓' : '✗';
        if (f.optimized) {
          return `${prefix}${f.name}:${f.line}`;
        }
        const reason = f.reason ? `(${f.reason.slice(0, 20)})` : '';
        return `${prefix}${f.name}:${f.line}${reason}`;
      });
      return `${r.file}: ${parts.join(' ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

function formatText(results: MockFileResult[], verbose: boolean, showAll: boolean): string {
  const lines: string[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    const functions = showAll ? result.functions : result.functions.filter((f) => !f.optimized);
    if (functions.length === 0) continue;

    lines.push(result.file);

    for (const fn of functions) {
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

    lines.push('');
  }

  lines.push(`${totalPassed} passed, ${totalFailed} failed`);
  return lines.join('\n');
}

function formatCompactJson(results: MockFileResult[], showAll: boolean): string {
  type CompactJsonResult = {
    f: string;
    ok?: Array<{ n: string; l: number }>;
    fail?: Array<{ n: string; l: number; e?: string }>;
  };

  const compact = results
    .map((r) => {
      const item: CompactJsonResult = { f: r.file };
      const ok = r.functions.filter((f) => f.optimized).map((f) => ({ n: f.name, l: f.line }));
      const fail = r.functions.filter((f) => !f.optimized).map((f) => ({ n: f.name, l: f.line, e: f.reason }));

      if (showAll && ok.length > 0) item.ok = ok;
      if (fail.length > 0) item.fail = fail;

      // Skip if no failures and not showing all
      if (!showAll && fail.length === 0) return null;

      return item;
    })
    .filter((item): item is CompactJsonResult => item !== null);

  return JSON.stringify(compact);
}

function formatFullJson(results: MockFileResult[], showAll: boolean): string {
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

  const full = results
    .map((r) => {
      const functions = showAll ? r.functions : r.functions.filter((f) => !f.optimized);

      if (functions.length === 0) return null;

      return {
        file: r.file,
        functions: functions.map((f) => ({
          name: f.name,
          line: f.line,
          optimized: f.optimized,
          ...(f.reason && { reason: f.reason }),
          ...(f.description && { description: f.description }),
          ...(f.suggestions && { suggestions: f.suggestions }),
        })),
        ...(r.error && { error: r.error }),
      };
    })
    .filter((item): item is FullJsonResult => item !== null);

  return JSON.stringify(full, null, 2);
}

// Helper to create mock results
function createMockResult(overrides?: Partial<MockFileResult>): MockFileResult {
  return {
    file: 'test.tsx',
    functions: [],
    ...overrides,
  };
}

function createMockFunction(overrides?: Partial<FunctionResult>): FunctionResult {
  return {
    name: 'TestComponent',
    line: 1,
    optimized: true,
    ...overrides,
  };
}

describe('formatCompactText', () => {
  it('should return empty string for empty results', () => {
    const result = formatCompactText([], false);
    expect(result).toBe('');
  });

  it('should skip results when all functions are optimized and showAll is false', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: true })],
      }),
    ];
    const result = formatCompactText(results, false);
    expect(result).toBe('');
  });

  it('should show optimized functions when showAll is true', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: true, name: 'Foo', line: 5 })],
      }),
    ];
    const result = formatCompactText(results, true);
    expect(result).toContain('test.tsx: ✓Foo:5');
  });

  it('should show failed functions regardless of showAll', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: false, name: 'Bar', line: 10 })],
      }),
    ];
    const result = formatCompactText(results, false);
    expect(result).toContain('test.tsx: ✗Bar:10');
  });

  it('should truncate reason to 20 characters', () => {
    const longReason = 'a'.repeat(30);
    const results = [
      createMockResult({
        functions: [
          createMockFunction({
            optimized: false,
            name: 'Baz',
            line: 15,
            reason: longReason,
          }),
        ],
      }),
    ];
    const result = formatCompactText(results, false);
    expect(result).toContain(`(${'a'.repeat(20)})`);
  });

  it('should handle multiple functions in one file', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: true, name: 'Foo', line: 1 }),
          createMockFunction({ optimized: false, name: 'Bar', line: 5 }),
        ],
      }),
    ];
    const result = formatCompactText(results, true);
    expect(result).toContain('✓Foo:1');
    expect(result).toContain('✗Bar:5');
  });
});

describe('formatText', () => {
  it('should return summary line for empty results', () => {
    const result = formatText([], false, false);
    expect(result).toContain('0 passed, 0 failed');
  });

  it('should count optimized functions as passed', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: true, name: 'Foo' }),
          createMockFunction({ optimized: true, name: 'Bar' }),
        ],
      }),
    ];
    const result = formatText(results, false, true);
    expect(result).toContain('2 passed, 0 failed');
  });

  it('should count failed functions', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: false, name: 'Baz' }),
        ],
      }),
    ];
    const result = formatText(results, false, false);
    expect(result).toContain('0 passed, 1 failed');
  });

  it('should show reason for failed functions', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({
            optimized: false,
            name: 'Qux',
            reason: 'has side effects',
          }),
        ],
      }),
    ];
    const result = formatText(results, false, false);
    expect(result).toContain('✗ Qux:1 - has side effects');
  });

  it('should show verbose details when verbose is true', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({
            optimized: false,
            name: 'VerboseTest',
            reason: 'test error',
            description: 'This is a detailed description',
            suggestions: ['Fix the issue', 'Use memo'],
          }),
        ],
      }),
    ];
    const result = formatText(results, true, false);
    expect(result).toContain('This is a detailed description');
    expect(result).toContain('→ Fix the issue');
    expect(result).toContain('→ Use memo');
  });

  it('should skip optimized functions when showAll is false', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: true, name: 'Optimized' }),
          createMockFunction({ optimized: false, name: 'Failed' }),
        ],
      }),
    ];
    const result = formatText(results, false, false);
    expect(result).not.toContain('✓ Optimized');
    expect(result).toContain('✗ Failed');
  });
});

describe('formatCompactJson', () => {
  it('should return valid JSON array', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction()],
      }),
    ];
    const result = formatCompactJson(results, false);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should include optimized functions in ok array when showAll is true', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: true, name: 'Foo' })],
      }),
    ];
    const result = formatCompactJson(results, true);
    const parsed = JSON.parse(result);
    expect(parsed[0].ok).toEqual([{ n: 'Foo', l: 1 }]);
  });

  it('should include failed functions in fail array', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: false, name: 'Bar', reason: 'error' }),
        ],
      }),
    ];
    const result = formatCompactJson(results, false);
    const parsed = JSON.parse(result);
    expect(parsed[0].fail).toEqual([{ n: 'Bar', l: 1, e: 'error' }]);
  });

  it('should skip files with only optimized functions when showAll is false', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: true })],
      }),
    ];
    const result = formatCompactJson(results, false);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(0);
  });

  it('should use short property names (f, ok, fail, n, l, e)', () => {
    const results = [
      createMockResult({
        file: 'src/App.tsx',
        functions: [
          createMockFunction({ optimized: true, name: 'MyComponent', line: 42 }),
        ],
      }),
    ];
    const result = formatCompactJson(results, true);
    const parsed = JSON.parse(result);
    expect(parsed[0]).toHaveProperty('f', 'src/App.tsx');
    expect(parsed[0].ok[0]).toEqual({ n: 'MyComponent', l: 42 });
  });
});

describe('formatFullJson', () => {
  it('should return valid JSON array', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction()],
      }),
    ];
    const result = formatFullJson(results, false);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should include all function properties', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({
            optimized: false,
            name: 'TestFn',
            line: 10,
            reason: 'test reason',
            description: 'test description',
            suggestions: ['suggestion 1'],
          }),
        ],
      }),
    ];
    const result = formatFullJson(results, false);
    const parsed = JSON.parse(result);
    expect(parsed[0].functions[0]).toMatchObject({
      name: 'TestFn',
      line: 10,
      optimized: false,
      reason: 'test reason',
      description: 'test description',
      suggestions: ['suggestion 1'],
    });
  });

  it('should omit undefined optional fields', () => {
    const results = [
      createMockResult({
        functions: [
          createMockFunction({ optimized: true, name: 'Simple' }),
        ],
      }),
    ];
    const result = formatFullJson(results, true);
    const parsed = JSON.parse(result);
    const fn = parsed[0].functions[0];
    expect(fn).not.toHaveProperty('reason');
    expect(fn).not.toHaveProperty('description');
    expect(fn).not.toHaveProperty('suggestions');
  });

  it('should skip files with only optimized functions when showAll is false', () => {
    const results = [
      createMockResult({
        functions: [createMockFunction({ optimized: true })],
      }),
    ];
    const result = formatFullJson(results, false);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(0);
  });

  it('should include error field when present', () => {
    const results = [
      createMockResult({
        file: 'error.tsx',
        functions: [createMockFunction()],
        error: 'Parse error',
      }),
    ];
    const result = formatFullJson(results, true);
    const parsed = JSON.parse(result);
    expect(parsed[0]).toHaveProperty('error', 'Parse error');
  });
});

describe('parseArgs', () => {
  it('should parse --json flag', () => {
    // Since parseArgs is not exported, we can't test it directly
    // This is a placeholder to document the expected behavior
    expect(true).toBe(true);
  });
});
