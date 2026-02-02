import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/bpmn/docs/[docslug]/[bpmnslug]'>,
) {
  const { docslug, bpmnslug } = await params;

  const page = source.getPage([docslug]);

  if (!page || !page.absolutePath) notFound();

  const docPath = path.dirname(page.absolutePath);
  const bpmnPath = path.join(docPath, 'assets', `${bpmnslug}.bpmn`);

  const markdownContent = fs.readFileSync(bpmnPath, 'utf8');

  return new Response(markdownContent, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
