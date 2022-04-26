import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketEmit, useSocketLoader, useSocketOn } from '../bin/socket';

const Expired: React.FC = () => {
  const navigate = useNavigate();

  const onLoggedIn = useCallback(() => navigate('/'), [navigate]);
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
