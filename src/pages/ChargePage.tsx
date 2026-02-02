import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ChargeRequest, ChargeResult } from '../shared/types/payments';
import { generateIdempotencyKey } from '../shared/utils/idempotency';
import { extractApiProblem } from '../shared/utils/errors';
import { useChargePayment } from '../hooks/useChargePayment';
import { JsonViewer } from '../components/JsonViewer';
import { Toast, type ToastState } from '../components/Toast';

const schema = z.object({
  idempotencyKey: z
    .string()
    .min(1, 'Required')
    .max(128, 'Max 128 chars')
    .regex(/^[A-Za-z0-9._:-]+$/, 'Allowed: A-Z a-z 0-9 . _ : -'),
  customerId: z.string().min(1, 'Required'),
  amount: z.coerce.number().int().positive('Must be positive'),
  currency: z.string().min(1, 'Required'),
  paymentMethodToken: z.string().min(1, 'Required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  idempotencyKey: generateIdempotencyKey(),
  customerId: 'cust_123',
  amount: 1999,
  currency: 'USD',
  paymentMethodToken: 'pm_tok_test_visa',
  description: 'Test charge from UI',
};

export function ChargePage() {
  const charge = useChargePayment();

  const [lastSuccess, setLastSuccess] = useState<ChargeResult | null>(null);
  const [lastPayload, setLastPayload] = useState<ChargeRequest | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false });

  const form = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const canReplay = Boolean(lastKey && lastPayload && lastSuccess);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: ChargeRequest = {
      customerId: values.customerId,
      amount: values.amount,
      currency: values.currency,
      paymentMethodToken: values.paymentMethodToken,
      description: values.description || undefined,
    };

    try {
      const res = await charge.mutateAsync({ idempotencyKey: values.idempotencyKey, payload });
      setLastSuccess(res);
      setLastPayload(payload);
      setLastKey(values.idempotencyKey);
      setToast({
        open: true,
        severity: 'success',
        message: res.replayed ? 'Charge replayed successfully' : 'Charge created successfully',
      });
    } catch (e) {
      const p = extractApiProblem(e);
      setToast({
        open: true,
        severity: 'error',
        message: `${p.status ?? 500} ${p.message ?? 'Request failed'}`,
      });
      setLastSuccess(null);
    }
  });

  const replay = async () => {
    if (!lastKey || !lastPayload) return;
    form.setValue('idempotencyKey', lastKey);
    try {
      const res = await charge.mutateAsync({ idempotencyKey: lastKey, payload: lastPayload });
      setLastSuccess(res);
      setToast({
        open: true,
        severity: 'info',
        message: 'Replay request completed',
      });
    } catch (e) {
      const p = extractApiProblem(e);
      setToast({
        open: true,
        severity: 'error',
        message: `${p.status ?? 500} ${p.message ?? 'Replay failed'}`,
      });
    }
  };

  const headerChips = useMemo(() => {
    if (!lastSuccess) return null;
    return (
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
        <Chip label={`HTTP ${lastSuccess.status}`} />
        <Chip label={`X-Idempotency-Key: ${lastSuccess.idempotencyKey}`} />
        <Chip label={`X-Idempotency-Request-Hash: ${lastSuccess.requestHash || '(missing)'}`} />
        {lastSuccess.replayed ? <Chip color="info" label="Replayed" /> : <Chip color="success" label="Created" />}
      </Stack>
    );
  }, [lastSuccess]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        New Charge
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={onSubmit}>
                <TextField
                  label="X-Idempotency-Key"
                  {...form.register('idempotencyKey')}
                  error={Boolean(form.formState.errors.idempotencyKey)}
                  helperText={form.formState.errors.idempotencyKey?.message}
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={() => form.setValue('idempotencyKey', generateIdempotencyKey())}
                      >
                        Generate
                      </Button>
                    ),
                  }}
                />

                <TextField
                  label="Customer ID"
                  {...form.register('customerId')}
                  error={Boolean(form.formState.errors.customerId)}
                  helperText={form.formState.errors.customerId?.message}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Amount (minor units)"
                      type="number"
                      {...form.register('amount')}
                      error={Boolean(form.formState.errors.amount)}
                      helperText={form.formState.errors.amount?.message}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Currency"
                      {...form.register('currency')}
                      error={Boolean(form.formState.errors.currency)}
                      helperText={form.formState.errors.currency?.message}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Payment Method Token"
                  {...form.register('paymentMethodToken')}
                  error={Boolean(form.formState.errors.paymentMethodToken)}
                  helperText={form.formState.errors.paymentMethodToken?.message}
                />

                <TextField
                  label="Description (optional)"
                  {...form.register('description')}
                />

                <Divider />

                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={charge.isPending}
                  >
                    Submit charge
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    disabled={!canReplay || charge.isPending}
                    onClick={replay}
                  >
                    Replay last key
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  “Replay last key” uses the last successful payload + idempotency key to demonstrate
                  no double-charge under retries/double-clicks.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ minHeight: 360 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Result
              </Typography>

              {lastSuccess ? (
                <>
                  {headerChips}
                  <JsonViewer title="Response body" value={lastSuccess.body} />
                </>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Submit a charge to see the response here.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Toast state={toast} onClose={() => setToast({ open: false })} />
    </Box>
  );
}
