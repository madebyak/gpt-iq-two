import { useState, FormEvent } from 'react';
import { logger } from './logger';
import { handleApiError } from './error-handler';

/**
 * Type for form field validation rules
 */
export type ValidationRule = {
  test: (value: any) => boolean;
  message: string;
};

/**
 * Type for form field validation configuration
 */
export type FieldValidation = {
  [key: string]: ValidationRule[];
};

/**
 * Type for form field values
 */
export type FormValues = {
  [key: string]: any;
};

/**
 * Type for form validation errors
 */
export type FormErrors = {
  [key: string]: string | null;
};

/**
 * Hook for managing form state and validation
 * @param initialValues Initial values for form fields
 * @param validationRules Rules for validating form fields
 * @param onSubmit Function to call on successful form submission
 * @returns Form state and handlers
 */
export function useFormHandler<T extends FormValues>(
  initialValues: T,
  validationRules: FieldValidation,
  onSubmit: (values: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validate a single field value against its validation rules
   * @param name Field name
   * @param value Field value
   * @returns Error message or null if valid
   */
  const validateField = (name: string, value: any): string | null => {
    const fieldRules = validationRules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }

    return null;
  };

  /**
   * Validate all form fields
   * @returns True if all fields are valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      } else {
        newErrors[name] = null;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle input change
   * @param e Change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    // Validate field on change
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  /**
   * Handle checkbox change
   * @param name Field name
   * @param checked Checkbox checked state
   */
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setValues({ ...values, [name]: checked });

    // Validate field on change
    const error = validateField(name, checked);
    setErrors({ ...errors, [name]: error });
  };

  /**
   * Handle form submission
   * @param e Submit event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      logger.warn('Form validation failed', { errors });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setSubmitError(errorMessage);
      logger.error('Form submission error', { error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form to initial values
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  };

  return {
    values,
    errors,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    isSubmitting,
    submitError,
    resetForm,
    setValues
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      return true;
    },
    message
  }),
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => {
      if (!value) return true; // Allow empty unless combined with required
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message
  }),
  minLength: (length: number, message = `Must be at least ${length} characters`): ValidationRule => ({
    test: (value) => {
      if (!value) return true; // Allow empty unless combined with required
      return String(value).length >= length;
    },
    message
  }),
  maxLength: (length: number, message = `Must be no more than ${length} characters`): ValidationRule => ({
    test: (value) => {
      if (!value) return true; // Allow empty
      return String(value).length <= length;
    },
    message
  }),
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    test: (value) => {
      if (!value) return true; // Allow empty unless combined with required
      return regex.test(value);
    },
    message
  })
};
