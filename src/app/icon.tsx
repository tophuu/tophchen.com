import { ImageResponse } from "next/og";

import { appIconDivStyle } from "./icon-style";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={appIconDivStyle(size.width)}>tc</div>,
    {
      ...size,
    },
  );
}
