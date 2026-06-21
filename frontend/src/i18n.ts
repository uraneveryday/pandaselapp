import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ko from "./locales/ko.json";
import zhCN from "./locales/zh-CN.json";

const savedLanguage = localStorage.getItem("language") || "zh-CN";

i18n.use(initReactI18next).init({
    resources: {
        ko: {
            translation: ko,
        },
        "zh-CN": {
            translation: zhCN,
        },
    },
    lng: savedLanguage,
    fallbackLng: "zh-CN",
    interpolation: {
        escapeValue: false,
    },
});

document.documentElement.lang = savedLanguage;

i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);
    document.documentElement.lang = lng;
});

export default i18n;