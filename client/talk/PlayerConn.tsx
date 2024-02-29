import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioState } from '../../shared/types/AudioState';
import { RTCConnData } from '../../shared/types/rtc';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';
import { ListPlayer } from './ListPlayer';
import { useRtc } from './use-rtc';

interface Props {
  conn: RTCConnData;
}

export const PlayerConn: React.FC<Props> = ({ conn }) => {
  // Add stream to audio element
  const audio = useRef<HTMLAudioElement | null>(null);
  const [remoteStream] = useState(() => new MediaStream());
  useEffect(() => {
    if (!audio.current) return;
    audio.current.srcObject = remoteStream;
  }, [audio, remoteStream]);

  // RTC Connection
  const [connState, setConnState] = useState<RTCPeerConnectionState>('new');
  useRtc(conn, remoteStream, setConnState);

  // Receive audio state updates
  const [audioState, setAudioState] = useState(() => conn.audioState);

  const onAudioStateUpdate = useCallback(
    (socketId: string, audioState: AudioState) => {
      if (conn.to.socketId !== socketId) return;

      setAudioState(audioState);
    },
    [conn],
  );
  useSocketOn('rtc-update-audio', onAudioStateUpdate);

  // Init conn
  useSocketLoader(
    useCallback(() => {
      socketEmit('init-conn', conn.to.socketId);
    }, [conn]),
  );

  useEffect(() => {
    if (!audio.current) return;
    if (audioState.volume > 1) {
      audio.current.volume = 1;
      return;
    }
    audio.current.volume = audioState.volume;
  }, [audioState]);

  return (
    <>
      <ListPlayer player={conn.to.player} volume={audioState.volume} connState={connState} />
      <audio autoPlay ref={audio}></audio>
    </>
  );
};
