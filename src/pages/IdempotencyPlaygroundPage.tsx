import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateIdempotencyKey } from '../shared/utils/idempotency';
import type { ChargeRequest, ChargeResult } from '../shared/types/payments';
import { useChargePayment } from '../hooks/useChargePayment';
import { extractApiProblem } from '../shared/utils/errors';
import { JsonViewer } from '../components/JsonViewer';

const schema = z.object({
  idempotencyKey: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9._:-]+$/),
  customerId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  currency: z.string().min(1),
  paymentMethodToken: z.string().min(1),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Playground is intentionally explicit: you can tweak payload/key freely
 * to observe backend behavior (201 created, replay, or 409 conflict).
 */
export function IdempotencyPlaygroundPage() {
  const charge = useChargePayment();
  const [result, setResult] = useState<ChargeResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      idempotencyKey: generateIdempotencyKey(),
      customerId: 'cust_123',
      amount: 1999,
      currency: 'USD',
      paymentMethodToken: 'pm_tok_test_visa',
      description: 'Playground charge',
    },
  });

  const submit = form.handleSubmit(async (v) => {
    setError(null);
    setResult(null);

    const payload: ChargeRequest = {
      customerId: v.customerId,
      amount: v.amount,
      currency: v.currency,
      paymentMethodToken: v.paymentMethodToken,
      description: v.description || undefined,
    };

    try {
      const res = await charge.mutateAsync({ idempotencyKey: v.idempotencyKey, payload });
      setResult(res);
    } catch (e) {
      setError(e);
    }
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Idempotency Playground
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={submit}>
                <TextField
                  label="X-Idempotency-Key"
                  {...form.register('idempotencyKey')}
                  helperText="Reuse the same key to replay. Reuse with different payload to trigger 409."
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

                <TextField label="Customer ID" {...form.register('customerId')} />
                <TextField label="Amount (minor units)" type="number" {...form.register('amount')} />
                <TextField label="Currency" {...form.register('currency')} />
                <TextField label="Payment Method Token" {...form.register('paymentMethodToken')} />
                <TextField label="Description" {...form.register('description')} />

                <Divider />

                <Button variant="contained" type="submit" disabled={charge.isPending}>
                  Send request
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Output
              </Typography>

              {result ? (
                <>
                  <JsonViewer
                    title="Headers summary"
                    value={{
                      httpStatus: result.status,
                      replayed: result.replayed,
                      idempotencyKey: result.idempotencyKey,
                      requestHash: result.requestHash,
                    }}
                  />
                  <JsonViewer title="Body" value={result.body} />
                </>
              ) : null}

              {error ? <JsonViewer title="Error" value={extractApiProblem(error)} /> : null}

              {!result && !error ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Submit a request to see output.
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
