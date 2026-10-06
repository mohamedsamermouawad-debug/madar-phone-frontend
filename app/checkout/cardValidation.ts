/**
 * Card Validation Utilities
 * - normalizeDigits: Converts Arabic/Eastern Arabic-Indic digits to standard ASCII digits
 * - isValidLuhn: Validates 16-digit card numbers using the Luhn Algorithm (Mod 10)
 * - isValidExpiry: Checks that MM is 01-12 and card is not expired (compared against current date)
 * - isValidCvv: Checks that CVV is exactly 3 digits
 */

export function normalizeDigits(str: string): string {
  if (!str) return "";
  return str
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = normalizeDigits(cardNumber).replace(/\D/g, "");
  if (digits.length !== 16) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateExpiry(cardExpiry: string): { valid: boolean; error: string } {
  const digits = normalizeDigits(cardExpiry).replace(/\D/g, "");
  if (digits.length === 0) {
    return { valid: false, error: "" };
  }
  if (digits.length < 4) {
    return { valid: false, error: "أدخل التاريخ بصيغة MM/YY" };
  }

  const mm = parseInt(digits.slice(0, 2), 10);
  const yy = parseInt(digits.slice(2, 4), 10);

  if (mm < 1 || mm > 12) {
    return { valid: false, error: "الشهر يجب أن يكون بين 01 و 12" };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fullYear = 2000 + yy;

  if (fullYear < currentYear || (fullYear === currentYear && mm < currentMonth)) {
    return { valid: false, error: "البطاقة منتهية الصلاحية" };
  }

  if (fullYear > currentYear + 25) {
    return { valid: false, error: "سنة الانتهاء غير صحيحة" };
  }

  return { valid: true, error: "" };
}

export function validateCvv(cardCvv: string): { valid: boolean; error: string } {
  const digits = normalizeDigits(cardCvv).replace(/\D/g, "");
  if (digits.length === 0) {
    return { valid: false, error: "" };
  }
  if (digits.length !== 3) {
    return { valid: false, error: "رمز الأمان (CVV) يجب أن يكون 3 أرقام" };
  }
  return { valid: true, error: "" };
}
