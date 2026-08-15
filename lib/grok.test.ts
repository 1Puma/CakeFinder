import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resetEnvCache } from "./env";
import { grokJson } from "./grok";

describe("grokJson", () => {
  it("round-trips a JSON response", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ ok: true, n: 3 }) } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    process.env.GROK_API_KEY = "test-key";
    resetEnvCache();
    const result = await grokJson(
      {
        messages: [{ role: "user", content: "ping" }],
        fetchImpl,
      },
      (value) => {
        const record = value as { ok: boolean; n: number };
        return record;
      },
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.value, { ok: true, n: 3 });
    }
  });

  it("retries on 500 then succeeds", async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      if (calls === 1) {
        return new Response("nope", { status: 500 });
      }
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"ok":true}' } }],
        }),
        { status: 200 },
      );
    };
    process.env.GROK_API_KEY = "test-key";
    resetEnvCache();
    const result = await grokJson(
      { messages: [{ role: "user", content: "ping" }], fetchImpl },
      (value) => value as { ok: boolean },
    );
    assert.equal(result.ok, true);
    assert.equal(calls, 2);
  });
});
