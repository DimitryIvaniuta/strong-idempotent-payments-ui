import { Alert, Snackbar } from '@mui/material';

export type ToastState =
  | { open: false }
  | { open: true; message: string; severity: 'success' | 'info' | 'warning' | 'error' };

export function Toast(props: { state: ToastState; onClose: () => void }) {
  return (
    <Snackbar open={props.state.open} autoHideDuration={4000} onClose={props.onClose}>
      {props.state.open ? (
        <Alert onClose={props.onClose} severity={props.state.severity} variant="filled">
          {props.state.message}
        </Alert>
      ) : null}
    </Snackbar>
  );
}
