import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { hasOwnProperty } from '@shared/util';
import './ErrorAlerts.scss';

type ErrorAlertContext = {
  addError: (id: string, message: string) => void;
  removeError: (id: string) => void;
};

const errorAlertContext = createContext<ErrorAlertContext | undefined>(
  undefined
);

export const ErrorAlerts: React.FC = ({ children }) => {
  const [errorAlerts, setErrorAlerts] = useState<{
    [id: string]: { msg: string; shown: boolean };
  }>({});

  const alertContext = useMemo<ErrorAlertContext>(
    () => ({
      addError(id, msg) {
        setErrorAlerts((alerts) => ({
          ...alerts,
          [id]: { msg, shown: false },
        }));

        setTimeout(() => {
          setErrorAlerts((alerts) => {
            const newAlerts = { ...alerts };
            if (hasOwnProperty(newAlerts, id)) {
              newAlerts[id].shown = true;
            }
            return newAlerts;
          });
        }, 0);
      },
      removeError(id) {
        setErrorAlerts((alerts) => {
          const newAlerts = { ...alerts };
          if (hasOwnProperty(newAlerts, id)) {
            newAlerts[id].shown = false;
          }
          return newAlerts;
        });

        setTimeout(
          () =>
            setErrorAlerts((alerts) => {
              const newAlerts = { ...alerts };
              delete newAlerts[id];
              return newAlerts;
            }),
          500
        );
      },
    }),
    [setErrorAlerts]
  );

  const shownCount = Object.values(errorAlerts).reduce(
    (p, c) => (c.shown ? p + 1 : p),
    0
  );

  return (
    <errorAlertContext.Provider value={alertContext}>
      <div className='error-alerts'>
        <div
          className={`error-alert-container ${shownCount > 0 ? '-shown' : ''}`}
        >
          {Object.entries(errorAlerts).map(([id, { msg, shown }]) => (
            <div key={id} className={`error-alert ${shown ? '-shown' : ''}`}>
              <span>{msg}</span>
            </div>
          ))}
        </div>
        <div className='error-alerts-children'>{children}</div>
      </div>
    </errorAlertContext.Provider>
  );
};

export function useErrorAlert(id: string, message: string) {
  const context = useContext(errorAlertContext);
  if (!context) {
    throw new Error(
      "useErrorAlert can't be called outside the scope of a ErrorAlertContext"
    );
  }

  return [
    useCallback(() => context.addError(id, message), [context, id, message]),
    useCallback(() => context.removeError(id), [context, id]),
  ];
}
