'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import BpmnJS from 'bpmn-js';

export interface ReactBpmnProps {
  diagramXML?: string;
  onError?: (err: Error) => void;
  onLoading?: () => void;
  onShown?: (warnings: any[]) => void;
  ratio?: string;
  url?: string;
}

const ReactBpmn: FC<ReactBpmnProps> = ({
  url,
  ratio,
  diagramXML: initialXML,
  onLoading,
  onError,
  onShown,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [diagramXML, setDiagramXML] = useState<string | undefined>(initialXML);
  const bpmnViewerRef = useRef<BpmnJS | null>(null);

  // Initialize BPMN viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new BpmnJS({ container: containerRef.current });
    bpmnViewerRef.current = viewer;

    viewer.on('import.done', ({ error, warnings }) => {
      if (error) {
        onError?.(error);
      } else {
        viewer.get<any>('canvas').zoom('fit-viewport');
        onShown?.(warnings);
      }
    });

    return () => {
      viewer.destroy();
      bpmnViewerRef.current = null;
    };
  }, [onError, onShown]);

  // Fetch diagram from URL
  useEffect(() => {
    if (!url) return;

    onLoading?.();

    fetch(url)
      .then((res) => res.text())
      .then(setDiagramXML)
      .catch(onError);
  }, [url, onLoading, onError]);

  // Import XML into viewer
  const importXML = useCallback((xml?: string) => {
    if (xml && bpmnViewerRef.current) {
      bpmnViewerRef.current.importXML(xml);
    }
  }, []);

  useEffect(() => {
    importXML(initialXML ?? diagramXML);
  }, [initialXML, diagramXML, importXML]);

  return (
    <div
      ref={containerRef}
      className="react-bpmn-diagram-container p-2 bg-white my-4 rounded-md"
      style={{ aspectRatio: ratio }}
    />
  );
};

interface BpmnProps {
  ratio?: string;
  src: string;
}

const Bpmn: FC<BpmnProps> = ({ src, ratio }) => {
  const params = useParams();
  const slug = params.slug as string;

  return <ReactBpmn url={`${slug}${src}`} ratio={ratio} />;
};

export { Bpmn };
