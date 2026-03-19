import { createHashRouter } from "react-router";
import { KioskHome } from "./components/KioskHome";

export const router = createHashRouter([
  {
    path: "/",
    Component: KioskHome,
  },
]);
