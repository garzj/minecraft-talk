import { useAuth } from '../context/auth';
import { ListPlayer } from './ListPlayer';
import './Talk.scss';

const Talk: React.FC = () => {
  const auth = useAuth();

  if (!auth) {
    return <div>Connecting...</div>;
  }

  return (
    <div className='player-list'>
      <ListPlayer player={auth}></ListPlayer>
      {/* TODO: Other players */}
    </div>
  );
};

export default Talk;
