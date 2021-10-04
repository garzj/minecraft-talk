import './App.scss';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ProvideAuth } from './context/auth';
import { ErrorAlerts } from './public/error/ErrorAlerts';
import { SocketError } from './public/error/SocketError';

const NotFound = lazy(() => import('./public/NotFound'));
const Logout = lazy(() => import('./public/Logout'));
const Expired = lazy(() => import('./public/Expired'));
const Talk = lazy(() => import('./talk/Talk'));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={'Loading...'}>
        <ErrorAlerts>
          <SocketError></SocketError>
          <Switch>
            <Route exact path='/'>
              <ProvideAuth>
                <Talk></Talk>
              </ProvideAuth>
            </Route>
            <Route exact path='/expired' component={Expired} />
            <Route exact path='/logout' component={Logout} />
            <Route component={NotFound} />
          </Switch>
        </ErrorAlerts>
      </Suspense>
    </BrowserRouter>
  );
};
