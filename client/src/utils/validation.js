// client/src/utils/validation.js
// Form validation utilities for all forms in the application

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
  
  // Validate skill assessment form
  export const validateSkillAssessmentForm = (values) => {
    const errors = {};
  
    if (!values.currentEmployer?.trim()) {
      errors.currentEmployer = 'Current employer is required';
    }
  
    if (!values.jobTitle?.trim()) {
      errors.jobTitle = 'Job title is required';
    }
  
    if (values.yearsOfExperience === undefined || values.yearsOfExperience === null || values.yearsOfExperience === '') {
      errors.yearsOfExperience = 'Years of experience is required';
    } else if (isNaN(values.yearsOfExperience) || values.yearsOfExperience < 0) {
      errors.yearsOfExperience = 'Years of experience must be a positive number';
    }
  
    if (!values.technicalSkills || values.technicalSkills.length === 0) {
      errors.technicalSkills = 'At least one technical skill is required';
    } else {
      const skillErrors = values.technicalSkills.map((skill, index) => {
        const skillError = {};
        
        if (!skill.skill?.trim()) {
          skillError.skill = 'Skill name is required';
        }
        
        if (!skill.proficiencyLevel) {
          skillError.proficiencyLevel = 'Proficiency level is required';
        }
        
        if (skill.yearsOfExperience === undefined || skill.yearsOfExperience === null || skill.yearsOfExperience === '') {
          skillError.yearsOfExperience = 'Years of experience is required';
        } else if (isNaN(skill.yearsOfExperience) || skill.yearsOfExperience < 0) {
          skillError.yearsOfExperience = 'Years of experience must be a positive number';
        }
        
        return Object.keys(skillError).length > 0 ? skillError : undefined;
      });
      
      if (skillErrors.some(error => error !== undefined)) {
        errors.technicalSkills = skillErrors;
      }
    }
  
    return errors;
  };
  