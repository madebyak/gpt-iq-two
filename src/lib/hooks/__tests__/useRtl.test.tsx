import { renderHook } from '@testing-library/react';
import { useRtl } from '../useRtl';

describe('useRtl hook', () => {
  test('should return LTR values for non-RTL locales', () => {
    const { result } = renderHook(() => useRtl('en'));
    
    expect(result.current.isRtl).toBe(false);
    expect(result.current.textAlign).toBe('text-left');
    expect(result.current.flipIcon).toBe('');
    expect(result.current.direction).toBe('ltr');
    expect(result.current.side).toBe('right');
    expect(result.current.position).toBe('left-0');
  });

  test('should return RTL values for Arabic locale', () => {
    const { result } = renderHook(() => useRtl('ar'));
    
    expect(result.current.isRtl).toBe(true);
    expect(result.current.textAlign).toBe('text-right');
    expect(result.current.flipIcon).toBe('rtl-flip');
    expect(result.current.direction).toBe('rtl');
    expect(result.current.side).toBe('left');
    expect(result.current.position).toBe('right-0');
  });

  test('should handle unknown locales as LTR', () => {
    const { result } = renderHook(() => useRtl('unknown-locale'));
    
    expect(result.current.isRtl).toBe(false);
    expect(result.current.textAlign).toBe('text-left');
  });
});
