import { useErrorAlert } from '@/public/error/ErrorAlert';
import { createContext, useContext, useEffect, useState } from 'react';

const audioContext = createContext<MediaStream | null>(null);

export const ProvideAudio: React.FC = ({ children }) => {
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

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          !cleared && setStream(stream);
          removeMicError();
        })
        .catch(addMicError);
    };

    // Audio permission
    let permissionStatus: PermissionStatus | null = null;

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

    return () => {
      permissionStatus?.removeEventListener('change', requestAudioStream);
      cleared = true;
    };
  }, [addMicError, removeMicError]);

  return (
    <audioContext.Provider value={stream}>{children}</audioContext.Provider>
  );
};

export const useAudioStream = () => useContext(audioContext);
