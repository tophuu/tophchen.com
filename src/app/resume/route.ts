import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "resume.pdf");

  let file: Buffer;
  try {
    file = await readFile(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Cristophe-Chen-Resume.pdf"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
