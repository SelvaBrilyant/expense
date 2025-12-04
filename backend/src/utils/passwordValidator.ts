/**
 * Password Strength Validation Utility
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-5 strength score
  errors: string[];
  suggestions: string[];
}

export const validatePassword = (
  password: string
): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 1;
    if (password.length >= 12) {
      score += 1;
      if (password.length >= 16) {
        score += 0.5;
      }
    } else {
      suggestions.push("Consider using a longer password (12+ characters)");
    }
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 0.5;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 0.5;
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 0.5;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*...)"
    );
  } else {
    score += 1;
  }

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /111111/,
    /123123/,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
    /master/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push("Password contains a common pattern that is easy to guess");
      score -= 1;
      break;
    }
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating characters (e.g., "aaa")');
    score -= 0.5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(5, score));

  return {
    isValid: errors.length === 0,
    score: Math.round(score * 10) / 10,
    errors,
    suggestions,
  };
};

export const getPasswordStrengthLabel = (score: number): string => {
  if (score <= 1) return "Very Weak";
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Strong";
  return "Very Strong";
};
