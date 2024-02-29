import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { RTCConnData } from '../../shared/types/rtc';
import { socketEmit, useSocketOn } from '../bin/socket';
import { useAudioStream } from '../context/usermedia/audio-stream';
import { createPeerConnection } from './create-peer-conn';

function applySdpSettings(sdp: RTCSessionDescriptionInit) {
  sdp.sdp = sdp.sdp?.replace('useinbandfec=1', 'useinbandfec=1; maxaveragebitrate=510000');
  return sdp;
}

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
    setRtc((rtc) => (rtc.connectionState === 'closed' ? createPeerConnection(conn.turnUser) : rtc));
    return () => rtc.close();
  }, []);

  // Connection state (create new on failure)
  useEffect(() => {
    const onStateChange = () => {
      setConnState(rtc.connectionState);
      setRtc((rtc) => (rtc.connectionState === 'failed' ? createPeerConnection(conn.turnUser) : rtc));
    };
    rtc.addEventListener('connectionstatechange', onStateChange);
    return () => rtc.removeEventListener('connectionstatechange', onStateChange);
  }, [conn, rtc, setConnState]);

  // Receive remote audio
  useEffect(() => {
    const onTrack = (e: RTCTrackEvent) => remoteStream.addTrack(e.track);
    rtc.addEventListener('track', onTrack);
    return () => rtc.removeEventListener('track', onTrack);
  }, [rtc]);

  // Send local audio (initiates negotiationneeded if the tracks change)
  const stream = useAudioStream();
  useEffect(() => {
    if (rtc.signalingState !== 'stable') return;
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

  // Negotiation stuff
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  useEffect(() => {
    const onStateChange = () => {
      if (rtc.connectionState !== 'new') return;
      makingOffer.current = false;
      ignoreOffer.current = false;
    };
    onStateChange();
    return () => rtc.removeEventListener('connectionstatechange', onStateChange);
  }, [rtc]);

  // Emit ICE candidates
  useEffect(() => {
    const onIce = (e: RTCPeerConnectionIceEvent) => e.candidate && socketEmit('rtc-ice', conn.to.socketId, e.candidate);
    rtc.addEventListener('icecandidate', onIce);
    return () => rtc.removeEventListener('icecandidate', onIce);
  }, [rtc, conn]);

  // Receive ICE candidates
  const onIceCand = useCallback(
    async (socketId: string, ice: any) => {
      if (conn.to.socketId !== socketId) return;

      if (!rtc.remoteDescription) return; // could make sure we don't receive outdated ice candidates after page reload but doesn't matter that much

      try {
        await rtc.addIceCandidate(new RTCIceCandidate(ice));
      } catch (e) {
        if (!ignoreOffer.current) return logError(e);
      }
    },
    [rtc, conn, logError],
  );
  useSocketOn('rtc-ice', onIceCand);

  // ICE failures
  useEffect(() => {
    const onIceStateChange = () => {
      if (rtc.iceConnectionState === 'failed') {
        rtc.restartIce();
      }
    };
    return () => rtc.removeEventListener('iceconnectionstatechange', onIceStateChange);
  }, [rtc]);

  // Send offer on negotiation
  useEffect(() => {
    const onNegotiationNeeded = async () => {
      try {
        makingOffer.current = true;
        const offer = applySdpSettings(
          await rtc.createOffer({
            voiceActivityDetection: true,
          }),
        );
        if (rtc.signalingState !== 'stable') return;
        await rtc.setLocalDescription(offer);
        socketEmit('rtc-desc', conn.to.socketId, rtc.localDescription);
      } catch (e) {
        return logError(e);
      } finally {
        makingOffer.current = false;
      }
    };
    rtc.addEventListener('negotiationneeded', onNegotiationNeeded);
    return () => rtc.removeEventListener('negotiationneeded', onNegotiationNeeded);
  }, [rtc, conn, logError]);

  // Receive and apply remote descs
  const onRemoteDesc = useCallback(
    async (socketId: string, _sdp: any) => {
      if (conn.to.socketId !== socketId) return;
      try {
        const sdp = new RTCSessionDescription(_sdp);

        const offerCollision = sdp.type === 'offer' && (makingOffer || rtc.signalingState !== 'stable');
        ignoreOffer.current = !!(!conn.polite && offerCollision);
        if (ignoreOffer.current) return;

        await rtc.setRemoteDescription(sdp);
        if (sdp.type === 'offer') {
          const answer = applySdpSettings(
            await rtc.createAnswer({
              voiceActivityDetection: true,
            }),
          );
          if (rtc.signalingState === 'stable') return;
          await rtc.setLocalDescription(answer);
          socketEmit('rtc-desc', conn.to.socketId, rtc.localDescription);
        }
      } catch (e) {
        return logError(e);
      }
    },
    [rtc, conn, logError, makingOffer],
  );
  useSocketOn('rtc-desc', onRemoteDesc);
}
