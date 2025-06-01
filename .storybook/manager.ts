import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "REI UI",
    brandUrl: "https://ramazandogna.com",
    brandImage: "",
  }),
});
