import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Bpmn } from './components/bpmn';
import { Excalidraw } from './components/excalidraw';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Bpmn,
    Excalidraw,
  };
}
