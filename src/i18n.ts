import i18next from 'i18next';
import resources from './localization/resources';

const defaultLanguage = 'en';
const fallbackLanguage = 'en';

export const i18n = i18next.init({
    fallbackLng: fallbackLanguage,
    interpolation: { escapeValue: false },
    lng: defaultLanguage,
    parseMissingKeyHandler: (key: string) => {
        return `No translation found for "${key}"`;
    },
    resources,
});
