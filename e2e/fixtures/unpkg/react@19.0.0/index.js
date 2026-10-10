// Minimal stand-in for react: just enough for JSX and the show() helper.
export const Fragment = Symbol.for("react.fragment");

export const createElement = (type, props, ...children) => ({
  $$typeof: Symbol.for("react.element"),
  type,
  props: {
    ...props,
    children: children.length === 1 ? children[0] : children,
  },
});

export default { createElement, Fragment };
