import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RateLimitProvider, useRateLimit } from '../context/RateLimitContext';
import React from 'react';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RateLimitContext (Lógica de Persistência e Countdown)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RateLimitProvider>{children}</RateLimitProvider>
  );

  it('deve iniciar com estado zerado', () => {
    const { result } = renderHook(() => useRateLimit(), { wrapper });
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.showModal).toBe(false);
  });

  it('deve disparar o rate limit e salvar no localStorage', () => {
    const { result } = renderHook(() => useRateLimit(), { wrapper });

    act(() => {
      result.current.triggerRateLimit(60);
    });

    expect(result.current.timeLeft).toBe(60);
    expect(result.current.showModal).toBe(true);
    expect(localStorage.getItem('rateLimitTime')).toBeDefined();
  });

  it('deve persistir o estado após um "reload" (re-render do provider)', () => {
    // Simula estado salvo
    const expiration = Date.now() + 30000; // 30 segundos
    localStorage.setItem('rateLimitTime', expiration.toString());

    const { result } = renderHook(() => useRateLimit(), { wrapper });

    expect(result.current.timeLeft).toBeGreaterThan(0);
    expect(result.current.timeLeft).toBeLessThanOrEqual(30);
    expect(result.current.showModal).toBe(true);
  });

  it('deve respeitar o estado minimizado após reload', () => {
    const expiration = Date.now() + 30000;
    localStorage.setItem('rateLimitTime', expiration.toString());
    localStorage.setItem('rateLimitMinimized', 'true');

    const { result } = renderHook(() => useRateLimit(), { wrapper });

    expect(result.current.timeLeft).toBeGreaterThan(0);
    expect(result.current.showModal).toBe(false); // Deve estar minimizado
  });

  it('deve decrementar o tempo a cada segundo', () => {
    const { result } = renderHook(() => useRateLimit(), { wrapper });

    act(() => {
      result.current.triggerRateLimit(10);
    });

    expect(result.current.timeLeft).toBe(10);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(9);

    act(() => {
      vi.advanceTimersByTime(9000);
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem('rateLimitTime')).toBeNull();
  });

  it('deve limpar tudo ao chamar resetRateLimit', () => {
    const { result } = renderHook(() => useRateLimit(), { wrapper });

    act(() => {
      result.current.triggerRateLimit(60);
    });

    act(() => {
      result.current.resetRateLimit();
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem('rateLimitTime')).toBeNull();
    expect(localStorage.getItem('rateLimitMinimized')).toBeNull();
    expect(localStorage.getItem('rateLimitResetAt')).toBeDefined();
  });
});

