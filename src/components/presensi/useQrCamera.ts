'use client';

import type { IScannerControls } from '@zxing/browser';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

type CameraErrorKey = 'camera_denied' | 'camera_insecure' | 'camera_missing' | 'camera_unavailable';

type CameraRequest = {
  cancelled: boolean;
  controls: IScannerControls | null;
  stream: MediaStream | null;
};

function releaseCamera(request: CameraRequest) {
  request.cancelled = true;
  request.controls?.stop();
  for (const track of request.stream?.getTracks() ?? []) {
    track.stop();
  }
}

function cameraErrorKey(error: unknown): CameraErrorKey {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'camera_denied';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'camera_missing';
  }
  return 'camera_unavailable';
}

/**
 * Requests camera access from a click and releases it when scanning ends.
 * @param props - Preview element and scan result handlers.
 * @returns Camera state and controls.
 */
export function useQrCamera(props: {
  videoRef: RefObject<HTMLVideoElement | null>;
  onDecoded: (payload: string) => void;
  onError: (key: CameraErrorKey) => void;
}) {
  const requestRef = useRef<CameraRequest | null>(null);
  const [state, setState] = useState<'idle' | 'requesting' | 'scanning'>('idle');

  useEffect(
    () => () => {
      if (requestRef.current !== null) {
        releaseCamera(requestRef.current);
      }
    },
    [],
  );

  const stop = () => {
    if (requestRef.current !== null) {
      releaseCamera(requestRef.current);
      requestRef.current = null;
    }
    setState('idle');
  };

  const start = async () => {
    if (requestRef.current !== null) {
      return;
    }
    if (!window.isSecureContext) {
      props.onError('camera_insecure');
      return;
    }
    if (navigator.mediaDevices?.getUserMedia === undefined) {
      props.onError('camera_unavailable');
      return;
    }

    const request: CameraRequest = { cancelled: false, controls: null, stream: null };
    requestRef.current = request;
    setState('requesting');

    try {
      // Request permission in the click handler, before loading the decoder.
      request.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (request.cancelled) {
        releaseCamera(request);
        return;
      }

      setState('scanning');
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const preview = props.videoRef.current;
      if (request.cancelled || preview === null) {
        releaseCamera(request);
        return;
      }

      request.controls = await new BrowserQRCodeReader().decodeFromStream(
        request.stream,
        preview,
        (decoded, _error, controls) => {
          if (decoded === undefined || request.cancelled) {
            return;
          }
          request.controls = controls;
          stop();
          props.onDecoded(decoded.getText());
        },
      );
      if (request.cancelled) {
        releaseCamera(request);
      }
    } catch (error) {
      if (!request.cancelled) {
        stop();
        props.onError(cameraErrorKey(error));
      }
    }
  };

  return { start, stop, state };
}
