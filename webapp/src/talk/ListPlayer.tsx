import { PlayerData } from '@shared/types/PlayerData';
import { useMemo } from 'react';

interface Props {
  player: PlayerData;
}

export const ListPlayer: React.FC<Props> = ({ player }) => {
  const avatarSrc = useMemo(
    () => `https://crafatar.com/avatars/${player.uuid}?size=16`,
    [player]
  );

  return (
    <div className='player'>
      <img src={avatarSrc} alt={player.name} className='player-avatar' />
      <div className='player-name'>{player.name}</div>
    </div>
  );
};
