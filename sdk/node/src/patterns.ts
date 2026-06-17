// ── India ─────────────────────────────────────────────────────────────────────
export const AADHAAR        = /\b([2-9][0-9]{3})[\s\-]?([0-9]{4})[\s\-]?([0-9]{4})\b/g;
export const AADHAAR_MASKED = /\b[Xx*]{4}[\s\-]?[Xx*]{4}[\s\-]?[0-9]{4}\b/g;
export const PAN            = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/g;
export const IFSC           = /\b([A-Z]{4}0[A-Z0-9]{6})\b/g;
export const MOBILE_IN      = /(?<!\d)(?:\+91[\s\-]?|91[\s\-]?|0)?([6-9][0-9]{9})(?!\d)/g;
export const GST            = /\b([0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z])\b/g;
export const BANK_ACCOUNT   = /(?:account\s*(?:number|no\.?|#)|a\/?c\s*(?:no\.?|#)|bank\s*a\/?c)[\s:]*([0-9]{9,18})/gi;

const UPI_PROVIDERS = [
  'paytm','gpay','phonepe','okicici','okhdfcbank','oksbi','okaxis','ybl',
  'axl','apl','ibl','icici','hdfcbank','sbi','upi','freecharge','airtel',
  'jio','amazon','indus','boi','cnrb','psb','aubank','dbs','federal',
  'idfc','kbl','kvb','rbl','scb','tjsb','uco','uboi','unionbank','kotak',
  'pnb','bob','barb','nkgsb','saraswat','mahb','nsdl','hsbc','cub','paribas',
].join('|');
export const UPI = new RegExp(`\\b[\\w.\\-]{2,256}@(?:${UPI_PROVIDERS})\\b`, 'gi');

// ── Global ────────────────────────────────────────────────────────────────────
export const EMAIL = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
export const IPV4  = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;

// ── GDPR / EU ─────────────────────────────────────────────────────────────────
const IBAN_CC = [
  'GB','DE','FR','ES','IT','NL','BE','AT','CH','SE','DK','NO','FI','PL','PT',
  'GR','IE','CZ','HU','RO','BG','HR','SK','SI','LT','LV','EE','LU','CY','MT',
  'IS','LI','MC','SM','VA','SA','AE','KW','QA','BH','JO','IL','TR','UA','RS',
  'BA','MK','AL','MD','GE','AM','AZ','BY','KZ','TN','MA','MU','SC',
].join('|');
export const IBAN = new RegExp(
  `\\b((?:${IBAN_CC})[0-9]{2}(?:[A-Z0-9]{4}\\s?){2,7}[A-Z0-9]{1,4})\\b`,
  'g',
);
export const UK_NIN = /\b(?!BG|GB|NK|KN|NT|TN|ZZ)[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z][0-9]{6}[A-D]\b/g;
export const EU_PASSPORT = /(?:passport|pass(?:port)?\s*(?:number|no\.?|#))\s*:?\s*([A-Z]{1,2}[0-9]{6,8})\b/gi;
// Visa / MC / Amex / Discover — Luhn-validated in index.ts
export const CREDIT_CARD = /\b(4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;

// ── HIPAA / US ────────────────────────────────────────────────────────────────
export const SSN_US   = /\b(?!(?:000|666|9\d{2})[-\s])(?!\d{3}[-\s]00[-\s])(?!\d{3}[-\s]\d{2}[-\s]0000)(\d{3}[-\s]\d{2}[-\s]\d{4})\b/g;
export const US_PHONE = /(?<!\d)(\+1[-.\s]?(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4})(?!\d)/g;
export const MRN      = /(?:mrn|medical\s+record\s+(?:number|no\.?|#)|patient\s+id)\s*:?\s*([A-Z0-9]{4,12})\b/gi;
export const NPI      = /(?:npi|national\s+provider\s+(?:identifier|id|number))\s*:?\s*([12][0-9]{9})\b/gi;
