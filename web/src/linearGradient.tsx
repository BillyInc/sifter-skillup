import type { ReactNode } from "react";

function flattenStyle(style: any): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (result, item) => Object.assign(result, flattenStyle(item)),
      {},
    );
  }
  return typeof style === "object" ? style : {};
}

export function LinearGradient({ colors = [], children, style, ...props }: { colors?: string[]; children?: ReactNode; style?: any; [key: string]: unknown }) {
  const backgroundImage = colors.length ? `linear-gradient(135deg, ${colors.join(", ")})` : undefined;
  return <div {...props} style={{ ...flattenStyle(style), backgroundImage }}>{children}</div>;
}
export default LinearGradient;
