import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProvideAudio } from './context/audio';
import { ProvideAuth } from './context/auth';
import { ErrorAlert } from './pages/error/ErrorAlert';
import { SocketError } from './pages/error/SocketError';

const NotFound = lazy(() => import('./pages/NotFound'));
const Logout = lazy(() => import('./pages/Logout'));
const Expired = lazy(() => import('./pages/Expired'));
const Talk = lazy(() => import('./talk/Talk'));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={'Loading...'}>
        <ErrorAlert>
          <SocketError></SocketError>
          <Routes>
            <Route path='*' element={<NotFound />} />
            <Route
              path='/'
              element={
                <ProvideAuth>
                  <ProvideAudio>
                    <Talk></Talk>
                  </ProvideAudio>
                </ProvideAuth>
              }
            />
            <Route path='/expired' element={<Expired />} />
            <Route path='/logout' element={<Logout />} />
          </Routes>
        </ErrorAlert>
      </Suspense>
    </BrowserRouter>
  );
};
