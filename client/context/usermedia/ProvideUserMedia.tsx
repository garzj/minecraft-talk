import { ReactNode } from 'react';
import { ProvideAC } from './ac';
import { ProvideAudioStream } from './audio-stream';

interface Props {
  children?: ReactNode;
}

export const ProvideUserMedia: React.FC<Props> = ({ children }) => {
  return (
    <ProvideAudioStream>
      <ProvideAC>{children}</ProvideAC>
    </ProvideAudioStream>
  );
};
