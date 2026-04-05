"use client";

import { useNoteStore } from "../lib/useNoteStore";
import TrafficLights from "./layout/TrafficLights";
import Sidebar from "./sidebar/Sidebar";
import NoteToolbar from "./editor/NoteToolbar";
import AboutNote from "./notes/AboutNote";
import ProjectsNote from "./notes/ProjectsNote";
import ContactNote from "./notes/ContactNote";

export default function NotesApp() {
  const { setActiveNote } = useNoteStore();

  return (
    <div className="app-window">
      <TrafficLights />

      <Sidebar onSelectNote={setActiveNote} />

      <div className="note-area">
        <NoteToolbar />
        <div className="note-content-area">
          <div className="note-panel" data-panel="about">
            <AboutNote />
          </div>
          <div className="note-panel" data-panel="projects">
            <ProjectsNote />
          </div>
          <div className="note-panel" data-panel="contact">
            <ContactNote />
          </div>
        </div>
      </div>
    </div>
  );
}
