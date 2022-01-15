import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import resources from './locales';
import app from './app';

const initLocale = async () => {
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  return i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => app(i18n));
};

initLocale();
