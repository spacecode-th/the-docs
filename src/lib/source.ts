import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import * as PageTree from 'fumadocs-core/page-tree';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

function convertEmptyFoldersToPages(node: PageTree.Node): PageTree.Node {
  if (node.type === 'folder') {
    // If folder has no children, convert to page
    if (node.children.length === 0) {
      const page: PageTree.Item = {
        type: 'page',
        name: node.name,
        url: node.index?.url || '#', // Use index URL if available, otherwise fallback
        ...(node.$id && { $id: node.$id }),
        ...(node.description && { description: node.description }),
        ...(node.icon && { icon: node.icon }),
        ...(node.index?.external && { external: node.index.external }),
      };
      return page;
    }

    // If folder has children, recursively process them
    return {
      ...node,
      children: node.children.map(convertEmptyFoldersToPages),
    };
  }

  return node;
}

// Helper function to process the entire tree
function convertEmptyFoldersInTree(root: PageTree.Root): PageTree.Root {
  return {
    ...root,
    children: root.children.map(convertEmptyFoldersToPages),
    ...(root.fallback && {
      fallback: convertEmptyFoldersInTree(root.fallback),
    }),
  };
}

export function getPageTree() {
  const pageTree = source.getPageTree();

  // By default, Fumadocs represents empty folders (folder with only index.mdx) as folders.
  // Here, we convert such empty folders into pages for our specific use case.
  const convertedTree = convertEmptyFoldersInTree(pageTree);

  return convertedTree;
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
