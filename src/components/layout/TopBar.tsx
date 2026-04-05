"use client";

import { useEffect, useState } from "react";
import { useMusicPlayer } from "../../lib/useMusicPlayer";
import DynamicIsland from "../music/DynamicIsland";

export default function TopBar() {
  const [time, setTime] = useState("");
  const music = useMusicPlayer();

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, "0");
      const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
      const month = now.toLocaleDateString("en-US", { month: "short" });
      const dayNum = now.getDate();
      setTime(`${weekday} ${month} ${dayNum}\u2003${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`);
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="menu-bar">
      <span className="apple-logo">&#63743;</span>
      <nav className="menu-items">
        <span>Notes</span>
        <span>File</span>
        <span>Edit</span>
        <span>Format</span>
        <span>View</span>
        <span>Window</span>
        <span>Help</span>
      </nav>
      <div className="menu-right">
        <div className="menu-bar-music">
          <DynamicIsland
            track={music.track}
            isPlaying={music.isPlaying}
            isExpanded={music.isExpanded}
            isMini={music.isMini}
            progress={music.progress}
            currentTime={music.currentTime}
            duration={music.duration}
            onTogglePlay={music.togglePlay}
            onNext={music.nextTrack}
            onPrev={music.prevTrack}
            onSeek={music.seek}
            onSeekStart={music.seekStart}
            onSeekEnd={music.seekEnd}
            onToggleExpanded={music.toggleExpanded}
            onCollapse={music.collapse}
            onToggleMini={music.toggleMini}
          />
        </div>
        <span>{time}</span>
      </div>
    </header>
  );
}
