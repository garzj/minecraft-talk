import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { AudioContext } from 'standardized-audio-context';
import { useErrorAlert } from '../../pages/error/ErrorAlert';

export const acContext = createContext<AudioContext | null | undefined>(null);

export const useAC = () => useContext(acContext);

interface Props {
  children?: ReactNode;
}

export const ProvideAC: React.FC<Props> = ({ children }) => {
  const [ac, setAC] = useState<AudioContext | null>();

  const [addAudioError, removeAudioError] = useErrorAlert({
    index: 600,
    msg: 'Audio context access denied. Please interact with the page.',
    btn: { msg: 'Allow' },
  });

  useEffect(() => {
    if (ac) {
      const onStateChange = () => {
        if (ac.state !== 'running') {
          addAudioError();
          return;
        }
        removeAudioError();
      };
      ac.onstatechange = onStateChange;
      onStateChange();
      return;
    }
    addAudioError();
    return () => removeAudioError();
  }, [ac, addAudioError, removeAudioError]);

  useEffect(() => {
    if (ac && ac.state === 'running') return;
    const handleClick = ac ? () => ac.resume() : () => setAC(new AudioContext());
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ac]);

  return <acContext.Provider value={ac}>{children}</acContext.Provider>;
};
