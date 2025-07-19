// client/src/hooks/useForm.js
import { useState } from 'react';

export const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error for this field when changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle blur event to track touched fields
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate field on blur if validate function is provided
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[name]) {
        setErrors({
          ...errors,
          [name]: fieldErrors[name]
        });
      }
    }
  };

  // Handle form reset
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Handle form submission
  const handleSubmit = async (submitFn) => {
    setIsSubmitting(true);

    // Validate all fields if validate function is provided
    if (validate) {
      const formErrors = validate(values);
      setErrors(formErrors);

      // Mark all fields as touched
      const allTouched = {};
      Object.keys(values).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Check if there are any errors
      if (Object.keys(formErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await submitFn(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
};