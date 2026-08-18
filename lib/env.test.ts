import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEnv, resetEnvCache } from "./env";

describe("radius floors", () => {
  it("ignores a 15-mile env default so production actually widens", () => {
    const prevDefault = process.env.DEFAULT_RADIUS_MILES;
    const prevMax = process.env.MAX_RADIUS_MILES;
    process.env.DEFAULT_RADIUS_MILES = "15";
    process.env.MAX_RADIUS_MILES = "40";
    resetEnvCache();
    try {
      const env = getEnv();
      assert.equal(env.DEFAULT_RADIUS_MILES, 30);
      assert.equal(env.MAX_RADIUS_MILES, 60);
    } finally {
      if (prevDefault === undefined) delete process.env.DEFAULT_RADIUS_MILES;
      else process.env.DEFAULT_RADIUS_MILES = prevDefault;
      if (prevMax === undefined) delete process.env.MAX_RADIUS_MILES;
      else process.env.MAX_RADIUS_MILES = prevMax;
      resetEnvCache();
    }
  });
});
