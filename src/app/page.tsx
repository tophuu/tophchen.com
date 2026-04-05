import TopBar from "../components/layout/TopBar";
import DesktopBackground from "../components/layout/DesktopBackground";
import NotesApp from "../components/NotesApp";

export default function Home() {
  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none" }}>
      <DesktopBackground />
      <TopBar />
      <NotesApp />
    </div>
  );
}
