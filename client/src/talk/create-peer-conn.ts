import { TurnUserData } from '@shared/types/rtc';

export function createPeerConnection(turnUserData: TurnUserData) {
  return new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // { urls: 'stun:stun1.l.google.com:19302' },
      // { urls: 'stun:stun2.l.google.com:19302' },
      // { urls: 'stun:stun3.l.google.com:19302' },
      // { urls: 'stun:stun4.l.google.com:19302' },
      // { urls: 'stun:stunserver.org:19302' },
      // { urls: 'stun:stun.stunprotocol.org:3478' },
      {
        urls: `turn:${window.location.hostname}:3478`,
        credentialType: 'password',
        username: turnUserData.username,
        credential: turnUserData.password,
      } as RTCIceServer,
    ],
  });
}
