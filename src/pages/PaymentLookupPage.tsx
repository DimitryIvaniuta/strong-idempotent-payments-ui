import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { usePayment } from '../hooks/usePayment';
import { JsonViewer } from '../components/JsonViewer';
import { extractApiProblem } from '../shared/utils/errors';

export function PaymentLookupPage() {
  const [paymentId, setPaymentId] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const q = usePayment(submittedId);

  const onSearch = () => {
    const id = paymentId.trim();
    setSubmittedId(id ? id : null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Lookup Payment
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Payment ID"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={onSearch} disabled={!paymentId.trim()}>
              Fetch
            </Button>
          </Stack>

          {q.isFetching ? (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading...
            </Typography>
          ) : null}

          {q.data ? <JsonViewer title="Payment" value={q.data} /> : null}

          {q.isError ? (
            <JsonViewer title="Error" value={extractApiProblem(q.error)} />
          ) : null}

          {!q.data && !q.isError && submittedId ? (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              No data.
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
