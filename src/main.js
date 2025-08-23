import "./assets/main.css";
import "primeicons/primeicons.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import ToastService from "primevue/toastservice";

import App from "./App.vue";

const app = createApp(App);

app.use(createPinia());

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{slate.50}",
      100: "{slate.100}",
      200: "{slate.200}",
      300: "{slate.300}",
      400: "{slate.400}",
      500: "{slate.500}",
      600: "{slate.600}",
      700: "{slate.700}",
      800: "{slate.800}",
      900: "{slate.900}",
      950: "{slate.950}",
    },
    colorScheme: {
      light: {
        primary: {
          color: "{slate.950}",
          inverseColor: "#ffffff",
          hoverColor: "{slate.900}",
          activeColor: "{slate.800}",
        },
        highlight: {
          background: "{slate.950}",
          focusBackground: "{slate.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "{slate.50}",
          inverseColor: "{slate.950}",
          hoverColor: "{slate.100}",
          activeColor: "{slate.200}",
        },
        highlight: {
          background: "rgba(250, 250, 250, .16)",
          focusBackground: "rgba(250, 250, 250, .24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },

  components: {
    accordion: {
      header: {
        padding: "12px",
      },
      content: {
        padding: "12px",
      },
    },

    datepicker: {
      panel: {
        border: {
          radius: "12px",
        },
      },
    },
  },
});

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Noir,
    options: {
      darkModeSelector: ".xp-dark-mode",
    },
  },
  locale: {
    dayNames: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
    dayNamesShort: ["CN", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7"],
    dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    monthNames: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    monthNamesShort: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    today: "Hôm nay",
    firstDayOfWeek: 1,
    dateFormat: "dd/mm/yy",
  },
});
app.use(ToastService);

app.mount("#app");
