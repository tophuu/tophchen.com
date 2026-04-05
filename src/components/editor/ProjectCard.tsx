interface ProjectCardProps {
  title: string;
  description: string;
  tags: { label: string; color: string }[];
  href?: string;
}

export default function ProjectCard({ title, description, tags, href = "#" }: ProjectCardProps) {
  return (
    <a href={href} className="project-card" target="_blank" rel="noopener noreferrer">
      <h3>{title} <span className="pc-ext-icon" aria-hidden="true">↗</span></h3>
      <div className="tag-row">
        {tags.map((tag) => (
          <span key={tag.label} className={`tag tag-${tag.color}`}>
            {tag.label}
          </span>
        ))}
      </div>
      <p className="pc-desc">{description}</p>
    </a>
  );
}
