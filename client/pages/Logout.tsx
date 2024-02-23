import { useEffect, useMemo, useState } from 'react';
import { clearCookie, cookieExists } from '../bin/cookies';

type LogoutState = 'LOGGED_IN' | 'LOGGED_OUT' | 'ALREADY_LOGGED_OUT';

const Logout: React.FC = () => {
  const [logoutState, setLogoutState] = useState<LogoutState>('LOGGED_IN');

  // Initiate logout
  useEffect(() => {
    if (cookieExists('token')) {
      clearCookie('token');
      setLogoutState('LOGGED_OUT');
    } else {
      setLogoutState('ALREADY_LOGGED_OUT');
    }
  }, []);

  const logoutMsg = useMemo(() => {
    if (logoutState === 'LOGGED_IN') {
      return 'Logging you out...';
    } else if (logoutState === 'ALREADY_LOGGED_OUT') {
      return 'You were already logged out.';
    } else {
      return 'You were logged out.';
    }
  }, [logoutState]);

  return (
    <div>
      <div>
        <p>{logoutMsg}</p>
        <p>
          Enter <code>/vc</code> on our Minecraft Server to log back in.
        </p>
      </div>
    </div>
  );
};

export default Logout;
