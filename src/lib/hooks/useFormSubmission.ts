import { useState, FormEvent } from 'react';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/error-handler';
import { useFormHandler, FormValues, FieldValidation } from '@/lib/utils/form-handler';

/**
 * Hook that combines form handling with async submission
 * @param initialValues Initial form values
 * @param validationRules Form validation rules
 * @param submitFn Function to call for form submission
 * @param options Additional options for form handling
 * @returns Form state, handlers, and submission state
 */
export function useFormSubmission<T extends FormValues, R = any>(
  initialValues: T,
  validationRules: FieldValidation,
  submitFn: (values: T) => Promise<R>,
  options: {
    onSuccess?: (result: R) => void;
    onError?: (error: string) => void;
    resetOnSuccess?: boolean;
    logSubmission?: boolean;
  } = {}
) {
  const {
    onSuccess,
    onError,
    resetOnSuccess = false,
    logSubmission = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<R | null>(null);

  const form = useFormHandler<T>(
    initialValues,
    validationRules,
    async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitResult(null);

      try {
        if (logSubmission) {
          logger.debug('Form submission started', { formValues: values });
        }

        const result = await submitFn(values);
        
        if (logSubmission) {
          logger.debug('Form submission successful', { formValues: values });
        }
        
        setSubmitResult(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (resetOnSuccess) {
          form.resetForm();
        }
      } catch (error) {
        const errorMessage = handleApiError(error);
        
        if (logSubmission) {
          logger.error('Form submission failed', { 
            formValues: values, 
            error: errorMessage 
          });
        }
        
        setSubmitError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  );

  return {
    ...form,
    isSubmitting,
    submitError,
    submitResult,
    // Override the form's submit handler
    handleSubmit: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!form.validateForm()) {
        return;
      }
      return form.handleSubmit(e);
    }
  };
}
