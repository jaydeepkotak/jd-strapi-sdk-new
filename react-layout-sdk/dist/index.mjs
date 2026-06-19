// src/Placeholder.tsx
import React from "react";
var ComponentFactory = ({
  componentName,
  props,
  placeholderName,
  customProps,
  componentMap
}) => {
  const Component = componentMap[componentName];
  if (!Component) {
    console.warn(`[JD SDK] Component not found for: ${componentName}`);
    return /* @__PURE__ */ React.createElement("div", { style: {
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
    } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: "1.25rem", color: "#ca8a04", marginBottom: "0.5rem" } }, "\u26A0\uFE0F Warning"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "1.125rem" } }, "Component not implemented:", /* @__PURE__ */ React.createElement("code", { style: {
      backgroundColor: "#f3f4f6",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
      marginLeft: "0.5rem",
      color: "#1f2937",
      border: "1px solid #d1d5db"
    } }, componentName)));
  }
  return /* @__PURE__ */ React.createElement(Component, { styles: props.styles, placeholderName, ...props, ...customProps });
};
var Placeholder = ({ name, rendering, customProps, componentMap }) => {
  if (!rendering || !Array.isArray(rendering) || rendering.length === 0) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, rendering.map((component, index) => /* @__PURE__ */ React.createElement(
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
var fetchJDLayout = async (apiUrl, slug, locale = "en", options) => {
  try {
    const querySymbol = slug.includes("?") ? "&" : "?";
    const res = await fetch(`${apiUrl}/api/layout/${slug}${querySymbol}locale=${locale}`, {
      ...options
    });
    if (!res.ok) {
      console.error(`[JD SDK] Failed to fetch layout: ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[JD SDK] Network error fetching layout`, error);
    return null;
  }
};
export {
  ComponentFactory,
  Placeholder,
  fetchJDLayout
};
