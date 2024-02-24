import { useCallback, useEffect, useRef, useState } from 'react';
import { RTCConnData } from '../../shared/types/rtc';
import { useSocketOn } from '../bin/socket';
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

  // Receive volume updates
  const [volume, setVolume] = useState(() => conn.volume);

  const onUpdateVol = useCallback(
    (socketId: string, volume: number) => {
      if (conn.to.socketId !== socketId) return;

      setVolume(volume);
    },
    [conn],
  );
  useSocketOn('rtc-update-vol', onUpdateVol);

  useEffect(() => {
    if (!audio.current) return;
    if (volume > 1) {
      audio.current.volume = 1;
      return;
    }
    audio.current.volume = volume;
  }, [volume]);

  return (
    <>
      <ListPlayer player={conn.to.player} volume={volume} connState={connState} />
      <audio autoPlay ref={audio}></audio>
    </>
  );
};
