import { renderHook, act } from '@testing-library/react';
import { useFormHandler, validationRules } from '../form-handler';

// Mock the logger and error-handler dependencies
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  }
}));

jest.mock('../error-handler', () => ({
  handleApiError: jest.fn((error) => `Error: ${error.message || error}`),
}));

describe('useFormHandler', () => {
  const initialValues = {
    name: '',
    email: '',
    age: '',
  };

  const validationRulesMock = {
    name: [validationRules.required()],
    email: [validationRules.required(), validationRules.email()],
    age: [
      validationRules.required(),
      validationRules.pattern(/^\d+$/, 'Age must be a number'),
    ],
  };

  const mockSubmit = jest.fn().mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  test('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  test('should update values on handleChange', () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  test('should validate fields on handleChange', () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    // Test valid input
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.errors.email).toBe(null);

    // Test invalid input
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address');
  });

  test('should validate all fields on form submission', async () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    const formEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Submit with empty form (should fail validation)
    await act(async () => {
      await result.current.handleSubmit(formEvent);
    });

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(Object.values(result.current.errors).some(error => error !== null)).toBe(true);
  });

  test('should handle checkbox changes', () => {
    const initialValuesWithCheckbox = {
      ...initialValues,
      subscribe: false,
    };

    const { result } = renderHook(() =>
      useFormHandler(initialValuesWithCheckbox, validationRulesMock, mockSubmit)
    );

    act(() => {
      result.current.handleCheckboxChange('subscribe', true);
    });

    expect(result.current.values.subscribe).toBe(true);
  });

  test('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    // Change form values
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe('John Doe');

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.submitError).toBe(null);
  });
  
  test('should call onSubmit when validation passes', async () => {
    const { result } = renderHook(() =>
      useFormHandler(initialValues, validationRulesMock, mockSubmit)
    );

    // Fill all required fields with valid data
    act(() => {
      result.current.setValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '30',
      });
    });

    // Simply call handleSubmit directly - we're bypassing validation checks
    // by ensuring the form has valid data already
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // Now check that mockSubmit was called (which happens only if validation passed)
    expect(mockSubmit).toHaveBeenCalled();
  });
});
