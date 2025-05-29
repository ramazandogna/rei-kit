import { Button } from "../components/Button";
import { Menu } from "../layout/Menu";
import { SideMenu } from "../layout/SideMenu";
import { Footer } from "../layout/Footer";
import { GoUp } from "../layout/GoUp";

export const routes = [
  { path: "/button", name: "Button", element: <Button /> },
  { path: "/menu", name: "Menu", element: <Menu /> },
  { path: "/side-menu", name: "SideMenu", element: <SideMenu /> },
  { path: "/footer", name: "Footer", element: <Footer /> },
  { path: "/go-up", name: "GoUp", element: <GoUp /> },
];
