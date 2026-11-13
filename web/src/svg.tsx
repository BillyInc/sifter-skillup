import { createElement, type ReactNode } from "react";

function element(tag: string) {
  return function SvgElement({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) {
    // Render the real SVG child element (rect, polygon, ...). Wrapping each one in a
    // nested <svg> gives it a 0x0 viewport, so every shape rendered invisibly.
    return createElement(tag, props, children);
  };
}
export default function Svg({ children, width, height, ...props }: { children?: ReactNode; width?: number | string; height?: number | string; [key: string]: unknown }) {
  return <svg width={width} height={height} {...props}>{children}</svg>;
}
export const Rect = element("rect");
export const Path = element("path");
export const Line = element("line");
export const Circle = element("circle");
export const G = element("g");
export const Text = element("text");
export const Defs = element("defs");
export const LinearGradient = element("linearGradient");
export const Stop = element("stop");
export const Ellipse = element("ellipse");
export const Polygon = element("polygon");
export const Polyline = element("polyline");
export const RadialGradient = element("radialGradient");
export const ClipPath = element("clipPath");
