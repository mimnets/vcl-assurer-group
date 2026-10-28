// Shared validation for public business phone numbers (m1-014): optional,
// digits with common separators, an optional leading "+", 5–30 characters.
export const PHONE_PATTERN = '^$|^[+]?[0-9][0-9 ()./-]{4,28}$';
