"use client";

import { useState } from "react";
import Highlight from "../editor/Highlight";
import Checklist from "../editor/Checklist";

const experience = [
  {
    company: "Atlassian",
    role: "Software Engineer",
    date: "Summer 2026",
    logoSrc: "/images/companies/atlassian_logo.png",
    bullets: ["Incoming summer '26"],
  },
  {
    company: "Cohere",
    role: "Data Engineer",
    date: "Fall 2025",
    logoSrc: "/images/companies/cohere_logo.png",
    bullets: [
      "Optimized high-fidelity RLHF pipelines for over 1,000+ entries",
      "Worked on data quality and evaluation workflows for LLMs",
    ],
  },
  {
    company: "Qolytics",
    role: "Software Engineer",
    date: "Summer 2025",
    logoSrc: "/images/companies/qolytics_logo.png",
    bullets: [
      "Developed interactive analytics and 3D visualizations",
      "Engineered real-time data pipelines for ML microservices",
      "Built and launched an end-to-end client dashboard MVP",
    ],
  },
];

export default function AboutNote() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (company: string) => {
    setExpandedCards((prev) => ({ ...prev, [company]: !prev[company] }));
  };

  return (
    <article>
      <div className="note-date">March 30, 2026 at 10:14 PM</div>
      <h1>About Me</h1>
      <p>
        Hey! I&apos;m <Highlight>Toph</Highlight> — a computer science student at the University of Waterloo.
      </p>
      <p>
        I have a passion for building cool stuff that makes a real difference for the people using it.
        As a software engineer, I like moving fast, taking ownership of my work, and bringing ideas to life
        from start to finish.
      </p>
      <p>
        <Highlight color="blue">I build things that matter. </Highlight>
      </p>

      <h2>Where I&apos;ve worked</h2>
      {experience.map((exp) => {
        const isOpen = !!expandedCards[exp.company];
        return (
          <div
            key={exp.company}
            className={`exp-card${isOpen ? " exp-card-open" : ""}`}
            onClick={() => toggleCard(exp.company)}
          >
            <div className="exp-card-header">
              <div className="exp-icon">
                <img src={exp.logoSrc} alt="" decoding="async" />
              </div>
              <div className="exp-info">
                <div className="exp-company">{exp.company}</div>
                <div className="exp-role">{exp.role}</div>
              </div>
              <div className="exp-date">{exp.date}</div>
              <span className={`exp-chevron${isOpen ? " exp-chevron-open" : ""}`}>▼</span>
            </div>
            <div className={`exp-details${isOpen ? " exp-details-open" : ""}`}>
              <div className="exp-details-inner">
                <div className="exp-divider" />
                <ul>
                  {exp.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      <h2>When I&apos;m Not Coding</h2>
        <p>You&apos;ll find me:</p>
        <Checklist items={[
          { text: "Buried in a book or manga", checked: true },
          { text: "Watching an anime", checked: true },
          { text: "Questioning my life choices in a League of Legends game", checked: true },
          { text: "Jamming out to songs on Spotify", checked: true },
        ]} />
        <p>
          Since you&apos;re here, I figured I&apos;d share the vibe too. Hope you like some of my favorite tracks!
        </p>
    </article>
  );
}
