/**
 * Client-safe Money Utilities
 *
 * Pure math functions for safe monetary calculations to prevent
 * floating-point precision issues. These have zero server-only
 * dependencies — just arithmetic.
 *
 * IMPORTANT: Always use these functions for monetary operations.
 * JavaScript floating-point math can cause issues like:
 * - 0.1 + 0.2 = 0.30000000000000004
 * - 10.00 * 0.1 = 1.0000000000000002
 *
 * In a loyalty/rewards system, float accumulation errors cause
 * customers to miss tier upgrade thresholds — the system lies about
 * how much they've spent. (CS#1: float-money)
 *
 * This file mirrors money.server.ts (which is server-only due to the
 * .server suffix). Keep them in sync.
 */

// ============================================
// CONSTANTS
// ============================================

export const CURRENCY_DECIMALS = 2;
const PERCENTAGE_DECIMALS = 4;

// ============================================
// CORE MONEY FUNCTIONS
// ============================================

export function roundMoney(value: number, decimals: number = CURRENCY_DECIMALS): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function addMoney(a: number, b: number): number {
  return roundMoney(a + b);
}

export function subtractMoney(a: number, b: number): number {
  return roundMoney(a - b);
}

export function multiplyMoney(amount: number, factor: number): number {
  return roundMoney(amount * factor);
}

export function divideMoney(amount: number, divisor: number): number {
  if (divisor === 0 || !Number.isFinite(divisor)) {
    return 0;
  }
  return roundMoney(amount / divisor);
}

// ============================================
// PERCENTAGE CALCULATIONS
// ============================================

export function calculatePercentage(amount: number, percentage: number): number {
  if (!Number.isFinite(amount) || !Number.isFinite(percentage)) {
    return 0;
  }
  return roundMoney((amount * percentage) / 100);
}

export function getPercentageOf(part: number, whole: number): number {
  if (whole === 0 || !Number.isFinite(whole) || !Number.isFinite(part)) {
    return 0;
  }
  return roundMoney((part / whole) * 100, PERCENTAGE_DECIMALS);
}

export function calculateCashback(orderTotal: number, cashbackPercent: number): number {
  if (orderTotal <= 0 || cashbackPercent <= 0) {
    return 0;
  }
  return calculatePercentage(orderTotal, cashbackPercent);
}

// ============================================
// PARSING & FORMATTING
// ============================================

export function parseMoney(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? roundMoney(value) : 0;
  }

  if (typeof value === 'string') {
    const cleaned = value
      .replace(/^[$€£¥₹]+/, '')
      .replace(/,/g, '')
      .trim();
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
  }

  if (typeof value === 'object' && value !== null) {
    const numValue = Number(value);
    return Number.isFinite(numValue) ? roundMoney(numValue) : 0;
  }

  return 0;
}

export function formatMoneyValue(amount: number, decimals: number = CURRENCY_DECIMALS): string {
  const rounded = roundMoney(amount, decimals);
  return rounded.toFixed(decimals);
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  const rounded = roundMoney(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(rounded);
  } catch {
    return `${currencyCode} ${formatMoneyValue(rounded)}`;
  }
}

// ============================================
// VALIDATION
// ============================================

export function isValidMoneyAmount(value: unknown): value is number {
  if (typeof value !== 'number') return false;
  return Number.isFinite(value) && value >= 0;
}

export function isPositiveMoneyAmount(value: unknown): value is number {
  return isValidMoneyAmount(value) && (value as number) > 0;
}

export function moneyEquals(a: number, b: number): boolean {
  return roundMoney(a) === roundMoney(b);
}

export function compareMoney(a: number, b: number): -1 | 0 | 1 {
  const roundedA = roundMoney(a);
  const roundedB = roundMoney(b);
  if (roundedA < roundedB) return -1;
  if (roundedA > roundedB) return 1;
  return 0;
}

// ============================================
// AGGREGATE FUNCTIONS
// ============================================

export function sumMoney(amounts: number[]): number {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return 0;
  }
  const total = amounts.reduce((sum, amount) => {
    const parsed = parseMoney(amount);
    return sum + parsed;
  }, 0);
  return roundMoney(total);
}

export function averageMoney(amounts: number[]): number {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return 0;
  }
  const total = sumMoney(amounts);
  return divideMoney(total, amounts.length);
}