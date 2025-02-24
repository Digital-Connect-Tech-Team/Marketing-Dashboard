'use client';
import { useEffect, useState } from 'react';

export default function AutoDetectLanguage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);

    function detectAndSetLang(node: HTMLElement) {
      const thaiPattern = /[\u0E00-\u0E7F]/;
      const englishPattern = /[a-zA-Z]/;

      if (thaiPattern.test(node.textContent || '')) {
        node.setAttribute('lang', 'th');
      } else if (englishPattern.test(node.textContent || '')) {
        node.setAttribute('lang', 'en');
      }
    }

    function scanAndApplyLangAttribute() {
      document
        .querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a')
        .forEach((node) => {
          detectAndSetLang(node as HTMLElement);
        });
    }

    if (hydrated) {
      scanAndApplyLangAttribute();
      const observer = new MutationObserver(scanAndApplyLangAttribute);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    }
  }, [hydrated]);

  return null;
}
