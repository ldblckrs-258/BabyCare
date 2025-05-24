import { useCallback } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';

// Define a type for the translation function that always returns a string
type TranslationFunction = (key: string, options?: any) => string;

export const useTranslation = () => {
  const { t: originalT, i18n } = useI18nTranslation();

  const translate: TranslationFunction = useCallback(
    (key: string, options?: any) => {
      return originalT(key, options) as string;
    },
    [originalT]
  );

  return {
    t: translate,
    i18n,
    currentLanguage: i18n.language,
  };
};