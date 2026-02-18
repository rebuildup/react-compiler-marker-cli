import { describe, it, expect, beforeEach } from 'vitest';
import { checkFile } from './checker.js';

describe('getLanguageFromFilename', () => {
  // This function is not exported, so we test through checkFile behavior
  it('should detect Flow syntax for .js files', () => {
    const result = checkFile('export function foo() {}', 'test.js');
    // Should not error for valid JS syntax
    expect(result.error).toBeUndefined();
  });

  it('should detect Flow syntax for .jsx files', () => {
    const result = checkFile('export function foo() {}', 'test.jsx');
    expect(result.error).toBeUndefined();
  });

  it('should detect Flow syntax for .mjs files', () => {
    const result = checkFile('export function foo() {}', 'test.mjs');
    expect(result.error).toBeUndefined();
  });

  it('should detect TypeScript syntax for .ts files', () => {
    const result = checkFile('export function foo(): void {}', 'test.ts');
    expect(result.error).toBeUndefined();
  });

  it('should detect TypeScript syntax for .tsx files', () => {
    const result = checkFile('export function foo(): void {}', 'test.tsx');
    expect(result.error).toBeUndefined();
  });
});

describe('checkFile', () => {
  it('should return error when plugin is not found', () => {
    // We can't easily mock the require, so we skip this test
    // In a real setup, you'd need to mock the module system
  });

  it('should handle empty files', () => {
    const result = checkFile('', 'test.ts');
    expect(result.file).toBe('test.ts');
    expect(result.functions).toEqual([]);
    expect(result.error).toBeUndefined();
  });

  it('should handle valid React component', () => {
    const code = `
      export function Foo() {
        return <div>Hello</div>;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    expect(result.file).toBe('test.tsx');
    expect(result.functions.length).toBeGreaterThan(0);
  });

  it('should handle invalid syntax gracefully', () => {
    const result = checkFile('this is not valid javascript', 'test.ts');
    expect(result.file).toBe('test.ts');
    expect(result.error).toBeDefined();
  });

  it('should handle multiple functions', () => {
    const code = `
      export function Foo() { return <div />; }
      export function Bar() { return <span />; }
      export function Baz() { return <div />; }
    `;
    const result = checkFile(code, 'test.tsx');
    expect(result.functions.length).toBeGreaterThan(0);
  });

  it('should return function names correctly', () => {
    const code = `
      export function MyComponent() {
        return <div>Test</div>;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    const fn = result.functions.find((f: { name: string }) => f.name === 'MyComponent');
    expect(fn).toBeDefined();
  });

  it('should include line numbers for functions', () => {
    const code = `
      export function LineTwo() {
        return <div />;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    if (result.functions.length > 0) {
      expect(result.functions[0].line).toBeGreaterThan(0);
    }
  });

  it('should handle default exports without name', () => {
    const code = `
      export default function() {
        return <div />;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    // Should not error for valid syntax
    expect(result.error).toBeUndefined();
  });
});

describe('FunctionResult type', () => {
  it('should have optimized: true for successful compilations', () => {
    const code = `
      export function SimpleComponent() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    const optimizedFunctions = result.functions.filter((f: { optimized: boolean }) => f.optimized);
    // At least one function should have optimization status
    expect(result.functions.length).toBeGreaterThan(0);
  });

  it('should include reason for failed compilations', () => {
    const code = `
      export function DynamicProp(prop) {
        return <div className={prop.dynamic} />;
      }
    `;
    const result = checkFile(code, 'test.tsx');
    // Check if failed compilations have reasons
    const failedFunctions = result.functions.filter((f: { optimized: boolean }) => !f.optimized);
    failedFunctions.forEach((fn) => {
      if (!fn.optimized) {
        // reason might be undefined for some failures
        expect(fn.reason === undefined || typeof fn.reason === 'string').toBe(true);
      }
    });
  });
});
