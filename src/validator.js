import * as yup from 'yup';

export default (value, urls, i18n) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('validation.duplicate'),
    },
    string: {
      url: i18n.t('validation.invalid'),
    },
  });

  const schema = yup.string().required().url().notOneOf(urls);

  try {
    const valid = schema.validateSync(value, { abortEarly: false });
    return {
      url: valid,
    };
  } catch (e) {
    return {
      error: e.errors,
    };
  }
};
