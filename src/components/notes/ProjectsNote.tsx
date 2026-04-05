import ProjectCard from "../editor/ProjectCard";

export default function ProjectsNote() {
  return (
    <article>
      <div className="note-date">March 29, 2026 at 3:42 PM</div>
      <h1>Projects</h1>
      <p>Some things I&apos;ve built or am currently building.</p>

      <ProjectCard
        title="Overseer"
        description="Bias-mitigation tool that utilizes undersampling on resume datasets to enable more equitable training of automated screening models."
        tags={[{ label: "Three.js", color: "purple" }, { label: "Scikit-Learn", color: "orange" }, { label: "NumPy", color: "blue" }]}
        href="https://devpost.com/software/overseer-vn8fpc"
      />
      <ProjectCard
        title="Ledger"
        description="Mobile expense tracking and debt management app for friends or groups. Leverages LLMs to automate receipt transcription and convert unstructured financial data into actionable insights."
        tags={[{ label: "Kotlin", color: "green" }]}
        href="https://github.com/tophuu/ledger"
      />
      <ProjectCard
        title="Carl Friedrich Goose"
        description="Multimodal AI-tutoring assistant that synchronizes screen-state analysis with voice interaction. Sketches real-time explanations with human-like responsiveness."
        tags={[{ label: "Vapi", color: "blue" }, { label: "Redis", color: "orange" }]}
        href="https://devpost.com/software/carl-friedrich-goose"
      />
      <ProjectCard
        title="Exercist"
        description="Bio-feedback hardware integration tool that optimizes physiotherapy form by providing real-time movement correction."
        tags={[{ label: "Langchain", color: "purple" }, { label: "Arduino", color: "green" }]}
        href="https://devpost.com/software/the-exercists"
      />
    </article>
  );
}
