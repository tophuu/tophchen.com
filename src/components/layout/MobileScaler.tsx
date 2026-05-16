"use client";

import { useEffect } from "react";

const APP_W = 1140;
const APP_H = 712;
const MENU_H = 25;
const PAD_X = 16;
const PAD_Y = 16;
const PHONE_MAX_WIDTH = 767;
const MAX_DESKTOP_SCALE = 1.18;
const TABLET_LANDSCAPE_BOTTOM_RESERVE = 56;

export default function MobileScaler() {
  useEffect(() => {
    function update() {
      document.documentElement.style.removeProperty("zoom");

      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const isPhone = isTouch && Math.min(w, h) <= PHONE_MAX_WIDTH;
      const isPhonePortrait = isPhone && h > w;
      const isTabletLandscape = isTouch && !isPhone && w > h;

      // Let large desktop displays breathe while still fitting smaller screens.
      if (isPhonePortrait) {
        document.documentElement.style.setProperty("--notes-scale", "1");
        return;
      }

      const availableW = Math.max(320, w - PAD_X * 2);
      const bottomReserve = isTabletLandscape ? TABLET_LANDSCAPE_BOTTOM_RESERVE : PAD_Y;
      const availableH = Math.max(240, h - MENU_H - PAD_Y - bottomReserve);
      const scale = Math.min(MAX_DESKTOP_SCALE, availableW / APP_W, availableH / APP_H);
      const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

      document.documentElement.style.setProperty("--notes-scale", normalizedScale.toFixed(4));
    }

    update();
    window.addEventListener("resize", update);
    const orientationMql = window.matchMedia("(orientation: portrait)");
    orientationMql.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      orientationMql.removeEventListener("change", update);
      document.documentElement.style.removeProperty("zoom");
      document.documentElement.style.removeProperty("--notes-scale");
    };
  }, []);

  return null;
}
