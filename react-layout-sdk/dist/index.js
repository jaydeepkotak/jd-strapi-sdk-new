"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ComponentFactory: () => ComponentFactory,
  Placeholder: () => Placeholder,
  fetchVeloxLayout: () => fetchVeloxLayout
});
module.exports = __toCommonJS(index_exports);

// src/Placeholder.tsx
var import_react = __toESM(require("react"));
var ComponentFactory = ({
  componentName,
  props,
  placeholderName,
  customProps,
  componentMap
}) => {
  const Component = componentMap[componentName];
  if (!Component) {
    console.warn(`[Velox SDK] Component not found for: ${componentName}`);
    return /* @__PURE__ */ import_react.default.createElement("div", { style: {
      padding: "2rem",
      margin: "1rem",
      border: "2px dashed #eab308",
      backgroundColor: "#fef9c3",
      color: "#713f12",
      borderRadius: "0.75rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    } }, /* @__PURE__ */ import_react.default.createElement("strong", { style: { fontSize: "1.25rem", color: "#ca8a04", marginBottom: "0.5rem" } }, "\u26A0\uFE0F Warning"), /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "1.125rem" } }, "Component not implemented:", /* @__PURE__ */ import_react.default.createElement("code", { style: {
      backgroundColor: "#f3f4f6",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
      marginLeft: "0.5rem",
      color: "#1f2937",
      border: "1px solid #d1d5db"
    } }, componentName)));
  }
  return /* @__PURE__ */ import_react.default.createElement(Component, { styles: props.styles, placeholderName, ...props, ...customProps });
};
var Placeholder = ({ name, rendering, customProps, componentMap }) => {
  if (!rendering || !Array.isArray(rendering) || rendering.length === 0) return null;
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, rendering.map((component, index) => /* @__PURE__ */ import_react.default.createElement(
    ComponentFactory,
    {
      key: `${component.__component}-${index}`,
      componentName: component.__component,
      props: component,
      customProps,
      placeholderName: name,
      componentMap
    }
  )));
};

// src/index.ts
var fetchVeloxLayout = async (apiUrl, slug, locale = "en", options) => {
  try {
    const querySymbol = slug.includes("?") ? "&" : "?";
    const res = await fetch(`${apiUrl}/api/layout/${slug}${querySymbol}locale=${locale}`, {
      ...options
    });
    if (!res.ok) {
      console.error(`[Velox SDK] Failed to fetch layout: ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[Velox SDK] Network error fetching layout`, error);
    return null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ComponentFactory,
  Placeholder,
  fetchVeloxLayout
});
