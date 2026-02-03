import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/excalidraw/docs/[docslug]/[excalidrawslug]'>,
) {
  const { docslug, excalidrawslug } = await params;

  const page = source.getPage([docslug]);

  if (!page || !page.absolutePath) notFound();

  const docPath = path.dirname(page.absolutePath);
  const bpmnPath = path.join(docPath, 'assets', `${excalidrawslug}.excalidraw`);

  const markdownContent = fs.readFileSync(bpmnPath, 'utf8');

  return new Response(markdownContent, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
