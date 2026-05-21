import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Template } from './types';
import { MOCK_TEMPLATES } from './mockData';

interface TemplateContextValue {
  templates: Template[];
  isLoading: boolean;
  refresh: () => void;
}

const TemplateContext = createContext<TemplateContextValue>({
  templates: MOCK_TEMPLATES,
  isLoading: false,
  refresh: () => {},
});

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [pushedTemplates, setPushedTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPushedTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.templates)) {
        // Map backend StoredTemplate shape to frontend Template shape
        const mapped: Template[] = data.templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category || 'Custom',
          style: t.style || 'Custom • Pushed',
          image: t.image || '',
          qrConfig: t.qrConfig,
        }));
        setPushedTemplates(mapped);
      }
    } catch (err) {
      console.warn('[TemplateContext] Could not fetch pushed templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPushedTemplates();
  }, [fetchPushedTemplates]);

  // Merge: static MOCK_TEMPLATES first, then any pushed ones that don't duplicate by name
  const templates = React.useMemo(() => {
    const staticNames = new Set(MOCK_TEMPLATES.map((t) => t.name));
    const newOnes = pushedTemplates.filter((t) => !staticNames.has(t.name));
    return [...MOCK_TEMPLATES, ...newOnes];
  }, [pushedTemplates]);

  return (
    <TemplateContext.Provider value={{ templates, isLoading, refresh: fetchPushedTemplates }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates(): TemplateContextValue {
  return useContext(TemplateContext);
}
