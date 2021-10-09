import { socketEmit, useSocketOn } from '@/bin/socket';
import { useAudioStream } from '@/context/audio';
import { RTCConnData } from '@shared/types/rtc';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPeerConnection } from './create-peer-conn';
import { ListPlayer } from './ListPlayer';

interface Props {
  conn: RTCConnData;
}

export const PlayerConn: React.FC<Props> = ({ conn }) => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(() => conn.volume);

  // Error handling
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (error !== null) {
      console.warn(`RTC to ${conn.to.player.uuid} failed:`, error);

      socketEmit('rtc-err');
    }
  }, [error, conn.to.player]);
  const onRtcErr = useCallback(() => setError('The other client errored.'), []);
  useSocketOn('rtc-err', onRtcErr);

  // RTC Connection
  const [rtc] = useState(() => createPeerConnection(conn.turnUser));
  useEffect(() => () => rtc.close(), [rtc]);

  // Apply remote audio
  const [remoteStream] = useState(() => new MediaStream());
  useEffect(() => {
    rtc.ontrack = (e) => {
      if (!audio.current) return setError(new Error('No audio element found.'));
      remoteStream.addTrack(e.track);
      audio.current.srcObject = remoteStream;
    };
  }, [rtc, remoteStream]);

  // Stream user audio
  const stream = useAudioStream();
  useEffect(() => {
    for (const track of stream?.getAudioTracks() ?? []) {
      rtc.addTrack(track);
    }
    return () => {
      if (rtc.connectionState === 'closed') return;

      for (const sender of rtc.getSenders()) {
        rtc.removeTrack(sender);
      }
    };
  }, [stream, rtc]);

  // Emit ICE candidates
  useEffect(() => {
    rtc.onicecandidate = (e) => {
      socketEmit('rtc-ice', e.candidate);
    };
  }, [rtc]);

  // Receive ICE candidates
  const onIceCand = useCallback(
    (socketId: string, ice: any) => {
      if (conn.to.socketId !== socketId) return;

      try {
        rtc.addIceCandidate(new RTCIceCandidate(ice)).catch(console.warn);
      } catch (e) {}
    },
    [rtc, conn]
  );
  useSocketOn('rtc-ice', onIceCand);

  // Apply / Send created local descs
  const createdDesc = useCallback(
    (sdp: RTCSessionDescriptionInit) => {
      rtc
        .setLocalDescription(sdp)
        .then(() => {
          socketEmit('rtc-desc', rtc.localDescription);
        })
        .catch(setError);
    },
    [rtc]
  );

  // Receive remote descs
  const onRtcDesc = useCallback(
    (socketId: string, sdp: any) => {
      if (conn.to.socketId !== socketId) return;

      try {
        rtc
          .setRemoteDescription(new RTCSessionDescription(sdp))
          .catch(setError);
      } catch (e) {
        setError(e);
        return;
      }

      // Answer if its an offer
      if (sdp?.type === 'offer') {
        rtc
          .createAnswer({
            voiceActivityDetection: true,
          })
          .then(createdDesc)
          .catch(setError);
      }
    },
    [rtc, conn, createdDesc]
  );
  useSocketOn('rtc-desc', onRtcDesc);

  // Create offer if initiator
  useEffect(() => {
    if (conn.initiator) {
      rtc
        .createOffer({
          offerToReceiveAudio: true,
          voiceActivityDetection: true,
        })
        .then(createdDesc)
        .catch(setError);
    }
  }, [rtc, conn, createdDesc]);

  // Receive volume updates
  const onUpdateVol = useCallback(
    (socketId: string, volume: number) => {
      if (conn.to.socketId !== socketId) return;

      setVolume(volume);
    },
    [conn]
  );
  useSocketOn('rtc-update-vol', onUpdateVol);

  useEffect(() => {
    if (!audio.current) return;
    audio.current.volume = volume;
  }, [volume]);

  return (
    <>
      <audio autoPlay ref={audio}></audio>
      <ListPlayer player={conn.to.player} />
    </>
  );
};
