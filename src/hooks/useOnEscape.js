import { useEffect } from 'react';

// Executa `handler` quando a tecla Escape é pressionada, enquanto `active` for true.
// Usado por modais e painéis flutuantes para fechar com o teclado (acessibilidade/UX).
export function useOnEscape(active, handler) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, handler]);
}
