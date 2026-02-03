import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
      {
        source: '/docs/:path/assets/:bpmnslug.bpmn',
        destination: '/bpmn/docs/:path/:bpmnslug',
      },
      {
        source: '/docs/:path/assets/:excalidrawslug.excalidraw',
        destination: '/excalidraw/docs/:path/:excalidrawslug',
      },
    ];
  },
};

export default withMDX(config);
