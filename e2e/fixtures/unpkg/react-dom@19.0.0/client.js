// Minimal stand-in for react-dom/client: renders function components and host elements once.
import { Fragment } from "react";

const build = (node) => {
  if (node == null || typeof node === "boolean") {
    return document.createDocumentFragment();
  }
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    node.forEach((child) => fragment.append(build(child)));
    return fragment;
  }
  const { type, props } = node;
  if (typeof type === "function") return build(type(props));
  if (type === Fragment) return build(props.children);
  const element = document.createElement(type);
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    element.setAttribute(key === "className" ? "class" : key, value);
  }
  element.append(build(props.children));
  return element;
};

export const createRoot = (container) => ({
  render: (element) => container.replaceChildren(build(element)),
});
