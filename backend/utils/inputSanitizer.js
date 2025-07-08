// backend/utils/inputSanitizer.js

/**
 * Sanitizes input by removing dangerous characters
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>"'`;\\]/g, '').trim();
}

/**
 * Validates the input length
 */
function validateInput(input, min = 1, max = 200) {
  return typeof input === 'string' && input.length >= min && input.length <= max;
}

module.exports = { sanitizeInput, validateInput };
