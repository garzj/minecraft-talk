import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { RTCConnData } from '../../shared/types/rtc';
import { useSocketOn } from '../bin/socket';
import { createPeerConnection } from './create-peer-conn';

import { socketEmit } from '../bin/socket';
import { useAudioStream } from '../context/audio';

export function useRtc(
  conn: RTCConnData,
  remoteStream: MediaStream,
  setConnState: Dispatch<SetStateAction<RTCPeerConnectionState>>,
) {
  // Error handling
  const logError = useCallback(
    (err: unknown) => {
      console.warn(err);
      socketEmit('rtc-err');
    },
    [socketEmit],
  );
  const onRtcErr = useCallback(
    (socketId: string) => socketId === conn.to.socketId && console.warn(`The other client errored.`),
    [conn],
  );
  useSocketOn('rtc-err', onRtcErr);

  // RTC Connection
  const [rtc, setRtc] = useState(() => createPeerConnection(conn.turnUser));
  useEffect(() => {
    setRtc((rtc) => (rtc.signalingState === 'closed' ? createPeerConnection(conn.turnUser) : rtc));
    return () => rtc.close();
  }, [conn]);
  useEffect(() => {
    const onStateChange = () => {
      if (rtc.signalingState === 'closed') {
        setRtc((rtc) => (rtc.signalingState === 'closed' ? createPeerConnection(conn.turnUser) : rtc));
      }
    };
    rtc.addEventListener('signalingstatechange', onStateChange);
    return rtc.removeEventListener('signalingstatechange', onStateChange);
  }, [conn]);

  // Connection state
  useEffect(() => {
    const onStateChange = () => {
      setConnState(rtc.connectionState);
      setRtc((rtc) =>
        rtc.connectionState === 'closed' || rtc.connectionState === 'failed'
          ? createPeerConnection(conn.turnUser)
          : rtc,
      );
    };
    rtc.addEventListener('connectionstatechange', onStateChange);
    return () => {
      rtc.removeEventListener('connectionstatechange', onStateChange);
    };
  }, [conn, rtc, setConnState]);

  // Receive remote audio
  useEffect(() => {
    rtc.ontrack = (e) => {
      remoteStream.addTrack(e.track);
    };
  }, [rtc]);

  // Send local audio (when stable)
  const stream = useAudioStream();
  useEffect(() => {
    const onStateChange = () => {
      if (rtc.signalingState !== 'stable') return;
      rtc.removeEventListener('signalingstatechange', onStateChange);

      for (const track of stream?.getAudioTracks() ?? []) {
        rtc.addTrack(track);
      }
    };
    rtc.addEventListener('signalingstatechange', onStateChange);
    onStateChange();
    return () => {
      rtc.removeEventListener('signalingstatechange', onStateChange);

      if (rtc.connectionState === 'closed') return;
      for (const sender of rtc.getSenders()) {
        rtc.removeTrack(sender);
      }
    };
  }, [stream, rtc]);

  // Emit ICE candidates
  useEffect(() => {
    rtc.onicecandidate = (e) => {
      socketEmit('rtc-ice', conn.to.socketId, e.candidate);
    };
  }, [rtc, conn]);

  // Receive ICE candidates
  const onIceCand = useCallback(
    (socketId: string, ice: any) => {
      if (conn.to.socketId !== socketId) return;

      if (!rtc.remoteDescription) return; // could make sure we don't receive outdated ice candidates after page reload but doesn't matter that much
      try {
        rtc.addIceCandidate(new RTCIceCandidate(ice)).catch(logError);
      } catch (e) {}
    },
    [rtc, conn],
  );
  useSocketOn('rtc-ice', onIceCand);

  // Apply and send created local descs
  const createdDesc = useCallback(
    (sdp: RTCSessionDescriptionInit) => {
      // Add some quality settings
      sdp.sdp = sdp.sdp?.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000');

      rtc
        .setLocalDescription(sdp)
        .then(() => {
          socketEmit('rtc-desc', conn.to.socketId, rtc.localDescription);
        })
        .catch(logError);
    },
    [rtc, conn],
  );

  // Receive and apply remote descs
  const onRtcDesc = useCallback(
    (socketId: string, sdp: any) => {
      if (conn.to.socketId !== socketId) return;

      try {
        rtc.setRemoteDescription(new RTCSessionDescription(sdp)).catch(logError);
      } catch (e) {
        logError(e);
        return;
      }

      // Answer if its an offer
      if (sdp?.type === 'offer') {
        rtc
          .createAnswer({
            voiceActivityDetection: true,
          })
          .then(createdDesc)
          .catch(logError);
      }
    },
    [rtc, conn, createdDesc],
  );
  useSocketOn('rtc-desc', onRtcDesc);

  // Send offers if initiator (when stable)
  useEffect(() => {
    const onStateChange = () => {
      if (rtc.signalingState !== 'stable') return;
      rtc.removeEventListener('signalingstatechange', onStateChange);

      if (conn.initiator) {
        const sendOffer = () => {
          rtc
            .createOffer({
              offerToReceiveAudio: true,
            })
            .then(createdDesc)
            .catch(logError);
        };

        let negotiating = true;
        rtc.onnegotiationneeded = () => {
          if (negotiating) return;
          negotiating = true;

          sendOffer();
        };
        rtc.onconnectionstatechange = () => (negotiating = rtc.connectionState !== 'connected');

        sendOffer();
      }
    };
    rtc.addEventListener('signalingstatechange', onStateChange);
    onStateChange();
    return () => rtc.removeEventListener('signalingstatechange', onStateChange);
  }, [rtc, conn, createdDesc]);
}
