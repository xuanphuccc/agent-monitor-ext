import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

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
          color: "{primary.950}",
          inverseColor: "#ffffff",
          hoverColor: "{primary.900}",
          activeColor: "{primary.800}",
        },
        highlight: {
          background: "{primary.950}",
          focusBackground: "{primary.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "{primary.50}",
          inverseColor: "{primary.950}",
          hoverColor: "{primary.100}",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.300}",
          color: "{primary.950}",
          focusColor: "{primary.950}",
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

export default Noir;
