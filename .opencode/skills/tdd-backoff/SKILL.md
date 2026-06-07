---
name: tdd-backoff
description: backoff-util の TDD 実装ワークフロー。テストを先に書き、最小限のコードで通過させ、リファクタリングするサイクルを厳守する。
---

# TDD for backoff-util

## 基本サイクル

1. **RED**: 失敗するテストを書く。テストだけが仕様である。
2. **GREEN**: テストを通す最小限のコードを書く。汎用性や美しさは不要。
3. **REFACTOR**: テストが通っている状態を維持しながらコードを改善する。

## テスト配置と命名

```
__tests__/
├── unit/                     # 単位テスト（純粋関数ごと）
│   ├── delay.test.ts         # delay 関数のテスト
│   └── jitter.test.ts        # jitter 関数のテスト
├── integration/
│   └── utility.test.ts       # Utility クラスの統合テスト
├── vitest.config.mts         # Vitest configuration
└── tsconfig.json             # TypeScript config for tests
```

## テスト記法

- `describe` / `test` / `expect` (vitest)
- `vi.fn()` でモック、`vi.spyOn()` でスパイ
- `@src/...` alias で import（テスト内部では `@src/delay` のように `@src` 経由）
- 統合テストで時間操作が必要な場合、実時間（短い遅延 1-5ms）を使用する（`useFakeTimers` は未対応のバグがあるため使わない）
- 1テスト = 1アサーションが理想。複数アサーションする場合はテスト名に理由を明記

## テストパターン

### Delay 関数のテスト

```ts
test('exponential delay doubles each attempt', () => {
  const delay = createExponentialDelay({ minDelay: 100, factor: 2 });
  expect(delay({ attempt: 0 })).toBe(100);
  expect(delay({ attempt: 1 })).toBe(200);
  expect(delay({ attempt: 2 })).toBe(400);
});
```

### Jitter 関数のテスト

```ts
test('full jitter returns value in [0, delay)', () => {
  const jitter = createFullJitter();
  for (let i = 0; i < 100; i++) {
    const v = jitter(1000);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1000);
  }
});
```

### Utility の統合テスト（実時間）

`useFakeTimers` は未対応のため、実時間（短い遅延値）でテストする。

```ts
test('retries on failure and eventually succeeds', async () => {
  const fn = vi
    .fn()
    .mockRejectedValueOnce(new Error('e1'))
    .mockRejectedValueOnce(new Error('e2'))
    .mockResolvedValueOnce('ok');

  const util = new Utility({ retryCount: 5, minDelay: 1, maxDelay: 5 });
  const result = await util.backoff(fn);
  expect(result).toBe('ok');
  expect(fn).toHaveBeenCalledTimes(3);
});
```

## 実装のルール

- GREEN フェーズでは **テストが通る最小限** を書く。余計なロジックを追加しない。
- REFACTOR フェーズでのみ、重複の除去・命名の改善・抽象化を行う。
- 一度に複数のテストを書かない。1テスト → 1実装 → リファクタリング のサイクルを守る。
- 全てのテストが常に GREEN である状態を保つ。

## コミットメッセージ

```
test(delay): add exponential delay test
feat(delay): implement exponential delay
refactor(delay): extract constant
```

## プッシュ前の自己同期

**本方針**: `git push` する前に、この SKILL.md 自身とプロジェクトのドキュメント群を最新のコードベースに合わせて更新する。これにより、次回このスキルをロードした時点で常に正しい知識が手に入る。

### 同期チェックリスト

1. **SKILL.md のテスト配置を実物と照合**
   - `__tests__/` 以下の実際のファイル一覧と SKILL.md の `テスト配置と命名` セクションが一致しているか確認する
   - 追加・削除・移動があれば更新する

2. **SKILL.md のテストパターンを実装と照合**
   - `src/` 以下のエクスポートとテストコードの import が一致しているか確認
   - 新しい機能や型が増えていればサンプルコードを追加、廃止されていれば削除

3. **プロジェクトドキュメントを更新**
   - `docs/architecture.md` — ディレクトリ構造・公開クラス・型定義・ビルド出力が実態に合っているか
   - `README.md` — Usage のコード例やオプション一覧が最新 API に追従しているか
   - `example/*.mjs` — 全サンプルが現行の公開 API で動作するか

4. **テスト・ビルドの通過確認**

   ```sh
   pnpm test
   pnpm build
   ```

5. **この SKILL.md 自身も更新内容を反映する**
   （`.opencode/skills/tdd-backoff/SKILL.md` に配置。プロジェクトと一緒にコミットされる）
