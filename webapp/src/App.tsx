import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ProvideAudio } from './context/audio';
import { ProvideAuth } from './context/auth';
import { ErrorAlert } from './public/error/ErrorAlert';
import { SocketError } from './public/error/SocketError';

const NotFound = lazy(() => import('./public/NotFound'));
const Logout = lazy(() => import('./public/Logout'));
const Expired = lazy(() => import('./public/Expired'));
const Talk = lazy(() => import('./talk/Talk'));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={'Loading...'}>
        <ErrorAlert>
          <SocketError></SocketError>
          <Switch>
            <Route exact path='/'>
              <ProvideAuth>
                <ProvideAudio>
                  <Talk></Talk>
                </ProvideAudio>
              </ProvideAuth>
            </Route>
            <Route exact path='/expired' component={Expired} />
            <Route exact path='/logout' component={Logout} />
            <Route component={NotFound} />
          </Switch>
        </ErrorAlert>
      </Suspense>
    </BrowserRouter>
  );
};
