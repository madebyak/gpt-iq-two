import { handleApiError, processError, createErrorHandler } from '../error-handler';
import { logger } from '../logger';

// Mock the logger dependency
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  }
}));

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiError', () => {
    test('should handle Error objects', () => {
      const error = new Error('Test error message');
      const result = handleApiError(error);
      
      expect(result).toBe('Test error message');
    });

    test('should handle string errors', () => {
      const error = 'String error message';
      const result = handleApiError(error);
      
      expect(result).toBe('String error message');
    });

    test('should handle errors with HTTP status codes', () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      
      const result = handleApiError(error);
      
      expect(result).toBe('Not Found');
    });

    test('should handle null or undefined errors', () => {
      const result = handleApiError(undefined);
      
      expect(result).toBe('An unexpected error occurred');
    });

    test('should handle complex error objects', () => {
      const error = {
        message: 'Complex error object',
        code: 'ERR_COMPLEX',
        data: { details: 'Additional details' }
      };
      
      const result = handleApiError(error);
      
      expect(result).toBe('Complex error object');
    });
  });

  describe('processError', () => {
    test('should log and return formatted error messages', () => {
      const error = new Error('Process error test');
      const result = processError(error, 'TestContext');
      
      expect(result).toBe('Process error test');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createErrorHandler', () => {
    test('should return a function that handles async operations with error handling', async () => {
      const successOperation = jest.fn().mockResolvedValue('success');
      const errorOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      const handler = createErrorHandler('TestContext');
      
      // Test successful operation
      const [successResult, successError] = await handler(successOperation);
      expect(successResult).toBe('success');
      expect(successError).toBeNull();
      
      // Test operation with error
      const [errorResult, errorMessage] = await handler(errorOperation);
      expect(errorResult).toBeNull();
      expect(errorMessage).toBe('Operation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
