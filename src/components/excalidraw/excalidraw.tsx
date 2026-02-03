'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

interface ExcalidrawWrapperProps {
  url?: string;
  ratio?: string;
  initialData?: any;
  onLoading?: () => void;
  onError?: (error: Error) => void;
}

// Dynamically import Excalidraw with SSR disabled
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw: ExcalidrawBase } = await import(
      '@excalidraw/excalidraw'
    );

    type ExProps = React.ComponentProps<typeof ExcalidrawBase>;

    const ExComponent = (props: ExProps & ExcalidrawWrapperProps) => {
      const { initialData, url, onLoading, onError, ratio, ...rest } = props;
      const [fetchedData, setFetchedData] = useState<any>(null);
      const [isLoading, setIsLoading] = useState(false);

      const params = useParams();
      const slug = params.slug as string;
      const dataUrl = `${slug}${url}`;

      useEffect(() => {
        if (!dataUrl) return;

        setIsLoading(true);
        onLoading?.();

        fetch(dataUrl)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch: ${res.statusText}`);
            }
            console.debug(res);
            return res.json();
          })
          .then((data) => {
            setFetchedData(data);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching Excalidraw data:', err);
            onError?.(err);
            setIsLoading(false);
          });
      }, [dataUrl, onLoading, onError]);

      const data = fetchedData ?? initialData;

      if (isLoading) {
        return (
          <div
            style={{
              width: '100%',
              height: '700px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Loading...
          </div>
        );
      }

      return (
        <div style={{ aspectRatio: ratio || '1/1' }} className="my-4 w-full">
          <ExcalidrawBase
            initialData={{
              ...data,
              appState: { zenModeEnabled: true },
              scrollToContent: true,
            }}
            {...rest}
          />
        </div>
      );
    };

    return ExComponent;
  },
  { ssr: false },
);

Excalidraw.displayName = 'Excalidraw';

export { Excalidraw };
export type { ExcalidrawWrapperProps };
