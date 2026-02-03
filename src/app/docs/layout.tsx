import { getPageTree } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

import '@excalidraw/excalidraw/index.css';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
