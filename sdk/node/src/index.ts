import * as P from './patterns.js';

// ── Public types ──────────────────────────────────────────────────────────────

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
}

export interface DetectResult {
  entities: Entity[];
  count: number;
}

export interface RedactResult {
  text: string;
  originalText: string;
  entities: Entity[];
  count: number;
  clean: boolean;
}

type Replacement = 'token' | 'mask';
type Locale = 'in' | 'eu' | 'us' | 'global' | 'all';

// ── Internal ──────────────────────────────────────────────────────────────────

interface PatternDef {
  pattern: RegExp;
  type: string;
  group?: number;
  validate?: (v: string) => boolean;
}

function luhn(number: string): boolean {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 13) return false;
  let total = 0;
  digits.reverse().forEach((d, i) => {
    const v = i % 2 === 0 ? d : d * 2;
    total += v > 9 ? v - 9 : v;
  });
  return total % 10 === 0;
}

function luhnNpi(npi: string): boolean {
  return luhn('80840' + npi);
}

const INDIA_PATTERNS: PatternDef[] = [
  { pattern: P.AADHAAR,      type: 'AADHAAR' },
  { pattern: P.AADHAAR_MASKED, type: 'AADHAAR_MASKED' },
  { pattern: P.PAN,          type: 'PAN',          group: 1 },
  { pattern: P.UPI,          type: 'UPI_ID' },
  { pattern: P.IFSC,         type: 'IFSC',          group: 1 },
  { pattern: P.MOBILE_IN,    type: 'MOBILE_IN',     group: 1 },
  { pattern: P.GST,          type: 'GST',           group: 1 },
  { pattern: P.BANK_ACCOUNT, type: 'BANK_ACCOUNT',  group: 1 },
];

const GLOBAL_PATTERNS: PatternDef[] = [
  { pattern: P.EMAIL, type: 'EMAIL' },
  { pattern: P.IPV4,  type: 'IPV4' },
];

const EU_PATTERNS: PatternDef[] = [
  { pattern: P.IBAN,        type: 'IBAN',        group: 1 },
  { pattern: P.UK_NIN,      type: 'UK_NIN' },
  { pattern: P.EU_PASSPORT, type: 'EU_PASSPORT', group: 1 },
  { pattern: P.CREDIT_CARD, type: 'CREDIT_CARD', group: 1, validate: (v) => luhn(v) },
];

const US_PATTERNS: PatternDef[] = [
  { pattern: P.SSN_US,   type: 'SSN_US',   group: 1 },
  { pattern: P.US_PHONE, type: 'US_PHONE', group: 1 },
  { pattern: P.MRN,      type: 'MRN',      group: 1 },
  { pattern: P.NPI,      type: 'NPI',      group: 1, validate: (v) => luhnNpi(v) },
];

function selectDefs(locale: Locale): PatternDef[] {
  switch (locale) {
    case 'in':     return INDIA_PATTERNS;
    case 'eu':     return [...EU_PATTERNS, ...GLOBAL_PATTERNS];
    case 'us':     return [...US_PATTERNS, ...GLOBAL_PATTERNS];
    case 'global': return GLOBAL_PATTERNS;
    default:       return [...INDIA_PATTERNS, ...EU_PATTERNS, ...US_PATTERNS, ...GLOBAL_PATTERNS];
  }
}

function findEntities(text: string, defs: PatternDef[]): Entity[] {
  const entities: Entity[] = [];

  for (const { pattern, type, group = 0, validate } of defs) {
    const p = new RegExp(pattern.source, pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = p.exec(text)) !== null) {
      const value = group > 0 ? m[group] : m[0];
      if (!value) continue;
      if (validate && !validate(value)) continue;
      const start = group > 0 ? (m.index + m[0].indexOf(value)) : m.index;
      entities.push({ type, value, start, end: start + value.length });
    }
  }

  entities.sort((a, b) => a.start - b.start);
  return entities;
}

function deoverlap(entities: Entity[]): Entity[] {
  const result: Entity[] = [];
  for (const e of entities) {
    const last = result[result.length - 1];
    if (last && e.start < last.end) {
      if ((e.end - e.start) > (last.end - last.start)) result[result.length - 1] = e;
    } else {
      result.push(e);
    }
  }
  return result;
}

function maskEntity(e: Entity): string {
  switch (e.type) {
    case 'AADHAAR': {
      const d = e.value.replace(/[\s\-]/g, '');
      return `XXXX XXXX ${d.slice(-4)}`;
    }
    case 'PAN':
      return e.value.slice(0, 5) + 'XXXX' + e.value.slice(-1);
    case 'MOBILE_IN':
      return `XXXXXX${e.value.slice(-4)}`;
    case 'UPI_ID': {
      const [, provider] = e.value.split('@');
      return provider ? `XXXX@${provider}` : '[UPI_ID]';
    }
    case 'CREDIT_CARD': {
      const d = e.value.replace(/\D/g, '');
      return `XXXX-XXXX-XXXX-${d.slice(-4)}`;
    }
    case 'SSN_US': {
      const parts = e.value.split(/[-\s]/);
      return parts.length === 3 ? `XXX-XX-${parts[2]}` : '[SSN_US]';
    }
    case 'IBAN': {
      const v = e.value.replace(/\s/g, '');
      return v.slice(0, 4) + 'X'.repeat(Math.max(0, v.length - 8)) + v.slice(-4);
    }
    default:
      return `[${e.type}]`;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function detect(text: string, locale: Locale = 'all'): DetectResult {
  const entities = findEntities(text, selectDefs(locale));
  return { entities, count: entities.length };
}

export function redact(
  text: string,
  locale: Locale = 'all',
  replacement: Replacement = 'token',
): RedactResult {
  const { entities } = detect(text, locale);
  if (entities.length === 0) {
    return { text, originalText: text, entities: [], count: 0, clean: true };
  }

  const unique = deoverlap(entities);
  const parts: string[] = [];
  let cursor = 0;

  for (const e of unique) {
    parts.push(text.slice(cursor, e.start));
    parts.push(replacement === 'mask' ? maskEntity(e) : `[${e.type}]`);
    cursor = e.end;
  }
  parts.push(text.slice(cursor));

  return { text: parts.join(''), originalText: text, entities: unique, count: unique.length, clean: false };
}

// ── Client wrappers ───────────────────────────────────────────────────────────

type AnyClient = Record<string | symbol, any>;

export function wrap(client: AnyClient, locale: Locale = 'all'): AnyClient {
  const name = client?.constructor?.name ?? '';
  if (name.includes('OpenAI'))    return wrapOpenAI(client, locale);
  if (name.includes('Anthropic')) return wrapAnthropic(client, locale);
  throw new Error(
    `svitch.wrap() does not recognise client type "${name}". ` +
    'Supported: OpenAI, Anthropic.',
  );
}

function redactMessages(messages: any[], locale: Locale): { messages: any[]; count: number } {
  let count = 0;
  const cleaned = messages.map((msg) => {
    if (typeof msg?.content === 'string' && msg.content) {
      const r = redact(msg.content, locale);
      count += r.count;
      return { ...msg, content: r.text };
    }
    return msg;
  });
  return { messages: cleaned, count };
}

function wrapOpenAI(client: AnyClient, locale: Locale): AnyClient {
  return new Proxy(client, {
    get(target, prop) {
      if (prop !== 'chat') return target[prop];
      return new Proxy(target.chat, {
        get(chatTarget, chatProp) {
          if (chatProp !== 'completions') return chatTarget[chatProp];
          return new Proxy(chatTarget.completions, {
            get(compTarget, compProp) {
              if (compProp !== 'create') return compTarget[compProp];
              return async (params: any) => {
                const { messages } = redactMessages(params.messages ?? [], locale);
                return compTarget.create({ ...params, messages });
              };
            },
          });
        },
      });
    },
  });
}

function wrapAnthropic(client: AnyClient, locale: Locale): AnyClient {
  return new Proxy(client, {
    get(target, prop) {
      if (prop !== 'messages') return target[prop];
      return new Proxy(target.messages, {
        get(msgTarget, msgProp) {
          if (msgProp !== 'create') return msgTarget[msgProp];
          return async (params: any) => {
            const { messages } = redactMessages(params.messages ?? [], locale);
            let system = params.system;
            if (typeof system === 'string') system = redact(system, locale).text;
            return msgTarget.create({ ...params, messages, ...(system !== undefined && { system }) });
          };
        },
      });
    },
  });
}
