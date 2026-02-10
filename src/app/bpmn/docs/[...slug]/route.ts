import { source, generateAssetsStaticParams } from '@/lib/source';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { bpmnToPng } from '@/lib/bpmn-to-png';

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

  if (bpmnslug === "testing.jpeg") {
    const a = await bpmnToPng();
    return a;
  }

  if (!fs.existsSync(bpmnPath)) notFound();

  const markdownContent = fs.readFileSync(bpmnPath, 'utf8');

  return new Response(markdownContent, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

export function generateStaticParams() {
  return generateAssetsStaticParams('.bpmn');
}