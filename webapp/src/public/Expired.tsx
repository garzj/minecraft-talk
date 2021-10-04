import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socket, useSubSocket } from '../bin/socket';

const Expired: React.FC = () => {
  const history = useHistory();

  const onLoggedIn = useCallback(() => history.push('/'), [history]);
  useSubSocket('logged-in', onLoggedIn);

  useEffect(() => {
    socket.emit('check-token');
  }, []);

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
