# React Compiler Marker CLI

React Compilerの最適化状態をチェックするCLIツール

## インストール

```bash
cd packages/cli && npm link
```

## 使い方

```bash
rcm check [入力] [オプション]
```

### 入力

| 入力 | 説明 |
|------|------|
| `<ファイル>` | 単一ファイルをチェック |
| `<ディレクトリ>` | `.tsx`/`.jsx`/`.ts`/`.js`ファイルを再帰的にチェック |
| `<glob>` | globパターン (例: `"src/**/*.tsx"`) |
| `--stdin` | 標準入力から読み込み |

### オプション

| オプション | 説明 |
|------------|------|
| `--all, -a` | 全ての関数を表示 (デフォルト: 失敗のみ) |
| `--json` | JSON形式で出力 |
| `--compact` | トークン効率重視のコンパクト形式 |
| `--verbose` | エラーの詳細を表示 |
| `--fail` | 最適化されていない関数がある場合、終了コード1で終了 |

## 使用例

```bash
# ディレクトリをチェック (失敗のみ表示)
rcm check src/

# 全ての関数を表示
rcm check src/ --all

# CI連携
rcm check src/ --fail --json > report.json

# AI用のコンパクト形式
rcm check src/ --compact
```

## 出力例

**デフォルト (失敗のみ):**
```
src/App.tsx
  ✗ handleClick:25 - dependency array issue

0 passed, 1 failed
```

**--all付き:**
```
src/App.tsx
  ✓ Counter:4
  ✗ handleClick:25 - dependency array issue

1 passed, 1 failed
```

## 要件

- Node.js 18+

## ライセンス

MIT (c) 2026 361do_sleep
