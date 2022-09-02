import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18next from "i18next";

const i18n = i18next
    .use(initReactI18next)
    .use(HttpApi)
    .init({
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });

export { i18next };
export default i18n;
