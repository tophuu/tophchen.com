import TopBar from "../components/layout/TopBar";
import DesktopBackground from "../components/layout/DesktopBackground";
import NotesApp from "../components/NotesApp";
import MobileScaler from "../components/layout/MobileScaler";
import WebringWidget from "../components/layout/WebringWidget";

export default function Home() {
  return (
    <>
      <WebringWidget />
      <div className="home-stage">
        <DesktopBackground />
        <TopBar />
        <MobileScaler />
        <div className="notes-scale-frame">
          <div className="notes-scale-content">
            <NotesApp />
          </div>
        </div>
        <div className="portrait-overlay">
          <div className="portrait-content">
            <svg
              className="portrait-icon"
              viewBox="0 0 64 64"
              width="56"
              height="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="18" y="8" width="28" height="48" rx="5" />
              <circle cx="32" cy="48" r="2" fill="currentColor" stroke="none" opacity="0.4" />
              <path d="M10 38C10 22 18 12 32 8" opacity="0.5" />
              <polyline points="27 5 32 8 28 13" opacity="0.5" />
            </svg>
            <p className="portrait-text">Rotate your device to landscape</p>
          </div>
        </div>
      </div>
    </>
  );
}
