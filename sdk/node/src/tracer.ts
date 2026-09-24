/**
 * Governor Agent Tracer — TypeScript/Node.js
 *
 * Drop-in port of governor_tracer (Python). Records every LLM call, tool use,
 * data access, and agent decision in a hash-chained audit trail.
 *
 * Zero production dependencies — uses native fetch (Node 18+).
 *
 * Usage:
 *   import { GovernorTracer } from 'governor/tracer';
 *
 *   const tracer = new GovernorTracer('loan-processor-v2');
 *   const run = tracer.run();
 *
 *   run.dataAccess('crm', ['aadhaar', 'income'], 'loan_processing', 'CUST-001');
 *   run.llmCall('openai', 'gpt-4o', '[AADHAAR] applicant', 'Eligible. Score: 72.');
 *   run.decision('Score above threshold', 'approve', 0.87);
 *   run.humanCheckpoint('Approve ₹5L loan?', true, 'anand.k');
 *
 *   const { valid } = await run.verify();
 */

const DEFAULT_URL = 'https://agent-tracer.vercel.app';
const TIMEOUT_MS  = 5_000;

function randomUUID(): string {
  // Node 14 fallback — crypto.randomUUID() is Node 15+
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── RunContext ────────────────────────────────────────────────────────────────

export class RunContext {
  readonly runId: string;
  readonly agentId: string;
  private readonly _url: string;

  constructor(runId: string, agentId: string, url: string) {
    this.runId   = runId;
    this.agentId = agentId;
    this._url    = url.replace(/\/$/, '');
  }

  private _post(
    eventType: string,
    data: object,
    opts: { piiTypes?: string[]; piiRedacted?: boolean; humanApproved?: boolean } = {},
  ): void {
    const payload: Record<string, unknown> = {
      agent_id:    this.agentId,
      event_type:  eventType,
      data,
      pii_types:   opts.piiTypes   ?? [],
      pii_redacted: opts.piiRedacted ?? false,
    };
    if (opts.humanApproved !== undefined) payload.human_approved = opts.humanApproved;

    fetch(`${this._url}/runs/${this.runId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch(() => {}); // fire-and-forget — tracer must never throw inside an agent
  }

  /**
   * Record access to personal data.
   * DPDP §8 requires logging what data was accessed, for what purpose, and whose.
   */
  dataAccess(
    source: string,
    fieldsAccessed: string[],
    purpose: string,
    dataPrincipalId?: string,
  ): void {
    this._post('data_access', {
      source,
      fields_accessed: fieldsAccessed,
      purpose,
      ...(dataPrincipalId && { data_principal_id: dataPrincipalId }),
    });
  }

  /**
   * Record an LLM API call. Pass PII-redacted prompt/response.
   */
  llmCall(
    provider: string,
    model: string,
    prompt: string,
    response: string,
    opts: { redactPii?: boolean; piiTypes?: string[] } = {},
  ): void {
    this._post(
      'llm_call',
      { provider, model, prompt, response },
      { piiTypes: opts.piiTypes, piiRedacted: opts.redactPii ?? true },
    );
  }

  /**
   * Record a tool / function call made by the agent.
   */
  toolCall(
    tool: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    piiTypes?: string[],
  ): void {
    this._post('tool_call', { tool, input, output }, { piiTypes });
  }

  /**
   * Record a decision made by the agent.
   */
  decision(reason: string, outcome: string, confidence?: number): void {
    this._post('decision', {
      reason,
      outcome,
      ...(confidence !== undefined && { confidence }),
    });
  }

  /**
   * Record a human-in-the-loop review.
   * Required by RBI FREE Framework for high-risk AI decisions.
   */
  humanCheckpoint(
    question: string,
    approved: boolean,
    reviewerId?: string,
    notes?: string,
  ): void {
    this._post(
      'human_checkpoint',
      {
        question,
        ...(reviewerId && { reviewer_id: reviewerId }),
        ...(notes && { notes }),
      },
      { humanApproved: approved },
    );
  }

  /**
   * Verify the Merkle hash chain for this run is intact.
   */
  async verify(): Promise<{ valid: boolean; message: string }> {
    try {
      const res = await fetch(`${this._url}/runs/${this.runId}/verify`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const json = await res.json() as { valid?: boolean; message?: string };
      return { valid: json.valid ?? false, message: json.message ?? '' };
    } catch (e) {
      return { valid: false, message: String(e) };
    }
  }
}

// ── GovernorTracer ──────────────────────────────────────────────────────────────

/**
 * Entry point for the Governor Agent Tracer.
 *
 * @param agentId   Unique name for this agent, e.g. "loan-processor-v2"
 * @param opts.apiUrl  Override the Agent Tracer API URL.
 *                     Defaults to GOVERNOR_TRACER_URL env var, then hosted service.
 */
export class GovernorTracer {
  readonly agentId: string;
  readonly _url: string; // exposed for GovernorCallbackHandler compatibility

  constructor(agentId: string, opts: { apiUrl?: string } = {}) {
    this.agentId = agentId;
    this._url    = (opts.apiUrl ?? process.env['GOVERNOR_TRACER_URL'] ?? DEFAULT_URL).replace(/\/$/, '');
  }

  /**
   * Start a new agent run. Returns a RunContext you can pass around or
   * use with `using` (Explicit Resource Management, TS 5.2+).
   */
  run(runId?: string): RunContext {
    return new RunContext(runId ?? randomUUID(), this.agentId, this._url);
  }
}
