import { useMemo } from 'react';
import { PlayerData } from '../../shared/types/PlayerData';

interface Props {
  player: PlayerData;
  volume?: number;
  connState?: RTCPeerConnectionState;
}

export const ListPlayer: React.FC<Props> = ({ player, volume, connState }) => {
  const avatarSrc = useMemo(() => `https://crafatar.com/avatars/${player.uuid}?size=16`, [player]);

  return (
    <div className='player'>
      <img src={avatarSrc} alt={player.name} className='player-avatar' />
      <div className='player-name'>{player.name}</div>
      {!!volume && (
        <div className='player-volume'>
          <div className='player-volume-percentage' style={{ width: `${Math.floor(volume * 100)}%` }}></div>
        </div>
      )}
      {connState && <div className='player-conn-state' data-state={connState}></div>}
    </div>
  );
};
