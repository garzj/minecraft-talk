import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import './ErrorAlert.scss';

type ErrorAlertData = {
  index: number;
  msg: string;
  loadingIcon?: boolean;
  btn?: {
    msg: string;
    onClick: () => void;
  };
};

type ErrorAlertContext = {
  addError: (data: ErrorAlertData) => void;
  removeError: (index: number) => void;
};

const errorAlertContext = createContext<ErrorAlertContext | undefined>(
  undefined
);

export const ErrorAlert: React.FC = ({ children }) => {
  const [errorAlerts, setErrorAlerts] = useState<{
    [index: string]: ErrorAlertData;
  }>({});

  const alertContext = useMemo<ErrorAlertContext>(
    () => ({
      addError: (data) =>
        setErrorAlerts((alerts) => ({
          ...alerts,
          [data.index]: data,
        })),
      removeError: (index) =>
        setErrorAlerts((alerts) => {
          const newAlerts = { ...alerts };
          delete newAlerts[index];
          return newAlerts;
        }),
    }),
    [setErrorAlerts]
  );

  const shownAlert = Object.values(errorAlerts)[0];

  return (
    <errorAlertContext.Provider value={alertContext}>
      {children}
      {shownAlert && (
        <div className='error-alert-bg'>
          <div className='error-alert-container'>
            <div className='error-alert'>
              {shownAlert.loadingIcon && <div className='loading-icon'></div>}

              <p>{shownAlert.msg}</p>

              {shownAlert.btn && (
                <button onClick={shownAlert.btn.onClick}>
                  {shownAlert.btn.msg}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </errorAlertContext.Provider>
  );
};

export function useErrorAlert(
  data: ErrorAlertData
): [() => void, () => void, (shown: boolean) => void] {
  const context = useContext(errorAlertContext);
  if (!context) {
    throw new Error(
      "useErrorAlert can't be called outside the scope of a ErrorAlertContext"
    );
  }

  return [
    /* eslint-disable */
    useCallback(() => context.addError(data), [context]),
    useCallback(() => context.removeError(data.index), [context]),
    useCallback(
      (shown: boolean) => {
        if (shown) {
          context.addError(data);
        } else {
          context.removeError(data.index);
        }
      },
      [context]
    ),
    /* eslint-enable */
  ];
}
