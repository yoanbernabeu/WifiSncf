import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { App } from "./renderer/App";
import "./renderer/styles/global.css";

const root = createRoot(document.getElementById("root")!);
root.render(createElement(App));
