import { ImageResponse } from "next/og";

import { appIconDivStyle } from "../../icon-style";

const README_ICON_PX = 512;

export async function GET() {
  return new ImageResponse(
    <div style={appIconDivStyle(README_ICON_PX)}>tc</div>,
    {
      width: README_ICON_PX,
      height: README_ICON_PX,
    },
  );
}
