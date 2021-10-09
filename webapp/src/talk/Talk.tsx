import { socket, useSubSocket } from '@/bin/socket';
import { RTCConnData } from '@shared/types/rtc';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/auth';
import { ListPlayer } from './ListPlayer';
import { PlayerConn } from './PlayerConn';
import './Talk.scss';

const Talk: React.FC = () => {
  const [conns, setConns] = useState<{ [socketId: string]: RTCConnData }>({});

  const auth = useAuth();

  // RTC connections
  const onRtcConnect = useCallback((connData: RTCConnData) => {
    setConns((conns) => ({ ...conns, [connData.to.socketId]: connData }));
  }, []);
  useSubSocket('rtc-connect', onRtcConnect);

  const onRtcDisconnect = useCallback((socketId: string) => {
    setConns((conns) => {
      const newConns = { ...conns };
      delete newConns[socketId];
      return newConns;
    });
  }, []);
  useSubSocket('rtc-disconnect', onRtcDisconnect);

  // Init talk
  useEffect(() => {
    socket.emit('init-talk');
  }, []);

  return (
    <div className='player-list'>
      <ListPlayer player={auth} />
      {Object.values(conns).map((conn) => (
        <PlayerConn key={conn.to.socketId} conn={conn} />
      ))}
    </div>
  );
};

export default Talk;
