interface LinkPreviewProps {
  icon: React.ReactNode;
  url: string;
  href?: string;
}

export default function LinkPreview({ icon, url, href = "#" }: LinkPreviewProps) {
  return (
    <a href={href} className="link-preview" target="_blank" rel="noopener noreferrer">
      <span className="lp-icon">{icon}</span>
      <span className="lp-url">{url}</span>
    </a>
  );
}
