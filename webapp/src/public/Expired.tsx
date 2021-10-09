import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';

const Expired: React.FC = () => {
  const history = useHistory();

  const onLoggedIn = useCallback(() => history.push('/'), [history]);
  useSocketOn('logged-in', onLoggedIn);

  useSocketLoader(
    useCallback(() => {
      socketEmit('check-token');
    }, [])
  );

  return (
    <div>
      <p>Whoops! Looks like your login token expired.</p>
      <p>
        Enter <code>/vc</code> on our Minecraft Server to log back in.
      </p>
    </div>
  );
};

export default Expired;
