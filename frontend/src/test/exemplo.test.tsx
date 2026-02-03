import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Exemplo de Teste', () => {
  it('deve somar corretamente', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve renderizar um elemento de teste', () => {
    render(<div data-testid="teste">Olá Mundo</div>);
    expect(screen.getByTestId('teste')).toHaveTextContent('Olá Mundo');
  });
});

