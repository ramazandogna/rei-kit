import "../src/styles/global.css";

import type { Preview } from "@storybook/react";
import { withRouter } from "storybook-addon-react-router-v6";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withRouter], // 👈 decorators buraya taşındı!
};

export default preview;
