export interface Note {
  id: string;
  title: string;
  date: string;
  snippet: string;
}

// Manually update this whenever you make website content changes.
// Format: YYYY-MM-DD
export const lastEditedDate = "2026-03-30";

export const notes: Note[] = [
  {
    id: "about",
    title: "About Me",
    date: "Mar 30",
    snippet: "Hey! I'm Toph — a computer science student at the University of Waterloo.",
  },
  {
    id: "projects",
    title: "Projects",
    date: "Mar 30",
    snippet: "Things I've built or am currently building.",
  },
  {
    id: "contact",
    title: "Contact & Links",
    date: "Mar 30",
    snippet: "Always down to chat about anything!",
  },
];


