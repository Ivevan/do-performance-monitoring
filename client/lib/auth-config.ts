export const ALLOWED_EMAIL_SUFFIXES = [".dostxi@gmail.com", "@region11.dost.gov.ph", "@gmail.com"];

/**
 * Validates whether the user's email meets the DOST XI requirements.
 * Supports both beta testing accounts (.dostxi@gmail.com) and official company emails (@region11.dost.gov.ph).
 */
export function validateEmail(email: string | undefined): boolean {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return ALLOWED_EMAIL_SUFFIXES.some(suffix => lowerEmail.includes(suffix));
}
