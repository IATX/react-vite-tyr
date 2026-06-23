// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // 引入后端加载器

import translationEN from './assets/locales/en/translation.json';
import translationZH from './assets/locales/zh/translation.json';


const resources = {
  en: {
    translation: translationEN,
  },
  zh: {
    translation: translationZH,
  },
};

const BASE_PATH = import.meta.env.VITE_JET_ASP_CONTEXT || '/';
const localesLng = import.meta.env.VITE_JET_LOCALES_LNG || 'zh';

i18n
  // 1. 挂载后端加载器
  // .use(Backend)
  // 2. 挂载语言检测器
  // .use(LanguageDetector)
  // 3. 挂载 React 绑定
  .use(initReactI18next)
  .init({
    // 配置 Backend 的加载路径
    // supportedLngs: ['en', 'zh'],
    // nonExplicitSupportedLngs: true,
    resources,
    lng: localesLng,
    // 默认设置
    fallbackLng: 'zh',
    debug: false,
    detection: {
      'load': 'languageOnly',
      'order': ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      'caches': ['localStorage', 'cookie'],
    },
    // 默认命名空间
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },

    // 异步加载时，如果没有加载完，就显示一个空组件
    react: {
      useSuspense: false,
    }
  });

export default i18n;