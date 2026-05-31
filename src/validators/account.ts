interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateAccountUpdate = (username: string, password?: string): ValidationResult => {
  if (!username || username.trim().length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters long.'
    };
  }

  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long.'
      };
    }
  }

  return { isValid: true, message: '' };
};