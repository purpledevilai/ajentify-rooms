import { createContext, useContext, useState, ReactNode } from 'react';
import Alert, { AlertAction } from './Alert';

export interface ShowAlertParams {
    title: string;
    message: string;
    actions?: AlertAction[];
    onClose?: () => void;
}

interface AlertContextType {
    showAlert: (params: ShowAlertParams) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<{
        title: string;
        message: string;
        actions?: AlertAction[];
        onClose?: () => void;
    } | null>(null);

    
    const showAlert = ({ title, message, actions = [{ label: 'Ok', onClick: undefined }], onClose }: ShowAlertParams) => {
        setAlert({ title, message, actions, onClose });
    };

    const handleClose = () => {
        if (alert?.onClose) {
            alert.onClose();
        }
        setAlert(null);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <Alert
                    title={alert.title}
                    message={alert.message}
                    actions={alert.actions}
                    onClose={handleClose}
                />
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
