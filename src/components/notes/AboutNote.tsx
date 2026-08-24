"use client";

import { useState } from "react";
import Highlight from "../editor/Highlight";
import Checklist from "../editor/Checklist";

const experience = [
  {
    company: "Wealthsimple",
    role: "Software Engineer Intern", 
    date: "Fall 2026",
    logoSrc: "/images/companies/wealthsimple_logo.png",
    bullets: [
      "Corporate Actions team"
    ]
  },
  {
    company: "Atlassian",
    role: "Software Engineer Intern",
    date: "Summer 2026",
    logoSrc: "/images/companies/atlassian_logo.png",
    bullets: [
      "Loom Admin Experience team",
      "Worked on an entity-agnostic internal migration tool",
      "Built admin interfaces with workspace-scoped RBAC",
    ],
  },
  {
    company: "Cohere",
    role: "Data Engineer Intern",
    date: "Fall 2025",
    logoSrc: "/images/companies/cohere_logo.png",
    bullets: [
      "Optimized RLHF pipelines and built training datasets",
      "Worked on data quality and evaluation workflows for LLMs",
    ],
  },
  {
    company: "Qolytics",
    role: "Software Engineer Intern",
    date: "Summer 2025",
    logoSrc: "/images/companies/qolytics_logo.png",
    bullets: [
      "Engineered a real-time ingestion pipeline for ML microservices",
      "Developed interactive analytics and 3D visualizations",
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
      <div className="note-date">August 24, 2026 at 5:51 PM</div>
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
