interface HighlightProps {
  color?: "orange" | "pink" | "blue" | "mint" | "purple";
  children: React.ReactNode;
}

export default function Highlight({ color = "orange", children }: HighlightProps) {
  return <mark className={color}>{children}</mark>;
}
