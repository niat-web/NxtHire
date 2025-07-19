// client/src/utils/validators.js
// Form validation utilities

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate phone number format (simple validation)
  export const isValidPhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };
  
  // Validate URL format
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Validate LinkedIn URL
  export const isValidLinkedInUrl = (url) => {
    return url.includes('linkedin.com/') && isValidUrl(url);
  };
  
  // Validate password strength
  export const isStrongPassword = (password) => {
    return password.length >= 8;
  };
  
  // Validate application form
  export const validateApplicationForm = (values) => {
    const errors = {};
  
    if (!values.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
  
    if (!values.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }
  
    if (!values.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone(values.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
  
    if (!values.linkedinProfileUrl?.trim()) {
      errors.linkedinProfileUrl = 'LinkedIn profile URL is required';
    } else if (!isValidLinkedInUrl(values.linkedinProfileUrl)) {
      errors.linkedinProfileUrl = 'Please enter a valid LinkedIn profile URL';
    }
  
    if (!values.sourcingChannel) {
      errors.sourcingChannel = 'Please select how you found out about this opportunity';
    }
  
    return errors;
  };
  
  // Validate login form
  export const validateLoginForm = (values) => {
    const errors = {};
  
    if (!values.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }
  
    if (!values.password?.trim()) {
      errors.password = 'Password is required';
    }
  
    return errors;
  };
  
  // Validate password creation/reset form
  export const validatePasswordForm = (values) => {
    const errors = {};
  
    if (!values.password?.trim()) {
      errors.password = 'Password is required';
    } else if (!isStrongPassword(values.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }
  
    if (!values.confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  
    return errors;
  };
  
  