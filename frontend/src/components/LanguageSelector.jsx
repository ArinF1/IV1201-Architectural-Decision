import { useTranslation } from 'react-i18next';

/**
 * Language toggle buttons for switching between English and Swedish.
 * @returns {JSX.Element}
 */
function LanguageSelector() {
  const { i18n } = useTranslation();

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={function () { changeLanguage('en'); }}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${i18n.language === 'en'
            ? 'bg-white text-slate-800'
            : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
      >
        EN
      </button>
      <button
        onClick={function () { changeLanguage('sv'); }}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${i18n.language === 'sv'
            ? 'bg-white text-slate-800'
            : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
      >
        SV
      </button>
    </div>
  );
}

export default LanguageSelector;
