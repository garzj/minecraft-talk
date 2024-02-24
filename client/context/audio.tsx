/// <reference types="webrtc" />

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useErrorAlert } from '../pages/error/ErrorAlert';

const audioContext = createContext<MediaStream | null>(null);

interface Props {
  children?: ReactNode;
}

export const ProvideAudio: React.FC<Props> = ({ children }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [addMicError, removeMicError] = useErrorAlert({
    index: 500,
    msg: 'Microphone access denied.',
  });

  useEffect(() => {
    let cleared = false;

    // Get stream
    const requestAudioStream = () => {
      if (cleared) return;

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          autoGainControl: false,
          channelCount: 2,
          latency: 0,
          noiseSuppression: false,
          sampleRate: 48000,
          sampleSize: 16,
          volume: 1.0,
        },
        video: false,
      };
      const successCallback: (stream: MediaStream) => void = (stream) => {
        !cleared && setStream(stream);
        removeMicError();
      };

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints).then(successCallback).catch(addMicError);
      } else {
        navigator.getUserMedia =
          navigator.getUserMedia ||
          (navigator.mediaDevices as any)?.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        navigator.getUserMedia(constraints, successCallback, addMicError);
      }
    };

    // Auto update permissions
    let permissionStatus: PermissionStatus | null = null;

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          permissionStatus = status;
          requestAudioStream();
          status.addEventListener('change', requestAudioStream);
        })
        .catch(() => {
          requestAudioStream();
        });
    } else {
      requestAudioStream();
    }

    return () => {
      permissionStatus?.removeEventListener('change', requestAudioStream);
      cleared = true;
    };
  }, [addMicError, removeMicError]);

  return <audioContext.Provider value={stream}>{children}</audioContext.Provider>;
};

export const useAudioStream = () => useContext(audioContext);
