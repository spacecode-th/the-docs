import puppeteer, { type Page } from "puppeteer";

import {
  basename,
} from 'node:path';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "node:url";


type OutputPath = string;

export type MinDimensions = {
  width?: number;
  height?: number;
};

export type PrintDiagramOptions = {
  input: string;
  outputs: OutputPath[];
  minDimensions?: MinDimensions;
  footer?: string | boolean;
  /**
   * - `false` disables title entirely
   * - `true` uses basename(input)
   * - `string` uses provided value (if empty string -> basename(input))
   */
  title?: boolean | string;
  deviceScaleFactor?: number;
};

export type Conversion = {
  input: string;
  outputs: OutputPath[];
};

export type ConvertAllOptions = Pick<
  PrintDiagramOptions,
  "minDimensions" | "footer" | "title" | "deviceScaleFactor"
>;

// These are provided by your skeleton.html / viewer environment
declare function loadScript(url: string): Promise<void>;
declare function openDiagram(
  diagramXML: string,
  options: {
    minDimensions?: MinDimensions;
    title?: string | false;
    footer?: string | boolean;
  }
): Promise<{ width: number; height: number; diagramHeight: number }>;
declare function resize(): void;
declare function toSVG(): string;

async function printDiagram(page: Page, options: PrintDiagramOptions): Promise<void> {
  const { input, outputs, minDimensions, footer, title = true, deviceScaleFactor } = options;

  console.log("cwd:", process.cwd());
  console.log("__dirname:", __dirname);
  console.log("exists:", fs.existsSync("/workspaces/compose/the-docs/content/docs/(main)/bpmn-testing/assets/testing.bpmn"));

  const diagramXML = fs.readFileSync('content/docs/(main)/bpmn-testing/assets/testing.bpmn', "utf8");

  const url = new URL(
    "bpmn-js/dist/bpmn-viewer.production.min.js",
    import.meta.url
  );

  // Convert file:// URL -> absolute path
  const path = fileURLToPath(url);

  // Read file contents as text
  const viewerScriptText = fs.readFileSync(path, "utf8");

  console.log(viewerScriptText);

  const htmlString = `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>Hello, World!</h1>
      <p id="dynamic-content">This content will change.</p>
      <script>
        document.getElementById('dynamic-content').textContent = 'Content has been rendered by JS!';
      </script>
    </body>
    </html>
  `;

  await page.setContent(htmlString, { waitUntil: 'networkidle0' });

  // Navigate the page to a URL.
  // await page.goto('https://developer.chrome.com/');

  // Set screen size.
  await page.setViewport({ width: 1080, height: 1024 });

  await page.screenshot({
    path: "/tmp/diagram.png",
    clip: {
      x: 0,
      y: 0,
      width: 1080,
      height: 1024,
    },
  });


  // await browser.close();


  // const diagramTitle: string | false =
  //   title === false ? false : typeof title === "string" ? (title.length ? title : basename(input)) : basename(input);

  // await page.goto(new URL("./skeleton.html", import.meta.url).toString());

  // // Node ESM: resolve viewer script file/url
  // // (kept as-is from your original; make sure your runtime supports import.meta.resolve)
  // const viewerScript = (import.meta as any).resolve?.(
  //   "bpmn-js/dist/bpmn-viewer.production.min.js"
  // ) as string;

  // const desiredViewport = await page.evaluate(
  //   async (xml, evalOptions) => {
  //     const { viewerScript: vs, ...openOptions } = evalOptions;
  //     await loadScript(vs);
  //     return openDiagram(xml, openOptions);
  //   },
  //   diagramXML,
  //   {
  //     minDimensions,
  //     title: diagramTitle,
  //     viewerScript,
  //     footer,
  //   }
  // );

  // await page.setViewport({
  //   width: Math.round(desiredViewport.width),
  //   height: Math.round(desiredViewport.height),
  //   deviceScaleFactor,
  // });

  // await page.evaluate(() => resize());

  // for (const output of outputs) {
  //   console.log(`writing ${ output }`);

  //   if (output.endsWith(".pdf")) {
  //     await page.pdf({
  //       path: output,
  //       width: desiredViewport.width,
  //       height: desiredViewport.diagramHeight,
  //     });
  //   } else if (output.endsWith(".png")) {
  //     await page.screenshot({
  //       path: output,
  //       clip: {
  //         x: 0,
  //         y: 0,
  //         width: desiredViewport.width,
  //         height: desiredViewport.diagramHeight,
  //       },
  //     });
  //   } else if (output.endsWith(".svg")) {
  //     const svg = await page.evaluate(() => toSVG());
  //     fs.writeFileSync(output, svg, "utf8");
  //   } else {
  //     console.error(`Unknown output file format: ${ output } `);
  //   }
  // }
}

async function withPage(fn: (page: Page) => Promise<void>): Promise<void> {
  let browser: any;

  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // other args
      ],
    });
    const page = await browser.newPage();
    await fn(page);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


export async function convertAll(
  conversions: Conversion[],
  options: ConvertAllOptions = {}
): Promise<void> {
  const { minDimensions, footer, title, deviceScaleFactor } = options;

  await withPage(async (page) => {
    for (const conversion of conversions) {
      const { input, outputs } = conversion;

      await printDiagram(page, {
        input,
        outputs,
        minDimensions,
        title,
        footer,
        deviceScaleFactor,
      });
    }
  });
}

export async function convert(input: string, output: string): Promise<void> {
  return await convertAll([{ input, outputs: [output] }]);
}


export const bpmnToPng = async () => {
  const inputPath = "/tmp/diagram.bpmn";
  const outputPath = "/tmp/diagram.png";

  // generate image
  await convertAll([
    {
      input: '/workspaces/compose/the-docs/content/docs/(main)/bpmn-testing/assets/testing.bpmn',
      outputs: [outputPath],
    },
  ]);

  // read image buffer
  const buffer = await fs.readFileSync(outputPath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}