import { useState, useEffect } from 'react';

// Hook simples que indica se a viewport está no tamanho "mobile" (< 768px),
// alinhado ao breakpoint `md` padrão do Tailwind. Reage a resize/rotação.
const MOBILE_QUERY = '(max-width: 767px)';

// Leitura síncrona inicial (evita "flash" do layout desktop em telas pequenas)
function getInitial() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getInitial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e) => setIsMobile(e.matches);

    // Sincroniza caso a viewport tenha mudado entre o render inicial e o efeito
    setIsMobile(mql.matches);

    // addEventListener é o método moderno; alguns navegadores antigos usam addListener
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return isMobile;
}
