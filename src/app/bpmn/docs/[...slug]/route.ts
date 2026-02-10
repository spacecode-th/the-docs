import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/bpmn/docs/[...slug]'>,
) {
  const { slug } = await params;

  const bpmnslug = slug.at(-1);
  const docSlug = slug.slice(0, -1);

  const page = source.getPage(docSlug);

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

// To implement, this is our custom function, fumadocs won't have utility for it
// export function generateStaticParams() {
//   return source.generateParams();
// }