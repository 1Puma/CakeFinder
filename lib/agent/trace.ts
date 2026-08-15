import type { TraceStep, TraceStepType } from "../types";

export function makeTraceStep(type: TraceStepType, message: string): TraceStep {
  return { type, at: new Date().toISOString(), message };
}

export function encodeSse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
