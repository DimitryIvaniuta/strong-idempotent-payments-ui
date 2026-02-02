import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

export function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        This UI is built for the Strong Idempotent Payments API. The backend guarantees “exactly-once
        business effect” for charges by persisting an idempotency key + request hash + stored response.
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                How idempotency works
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Send <b>X-Idempotency-Key</b> with your charge request. On retries/timeouts/double
                clicks, the backend replays the stored response and returns the same result.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                If the same key is reused with a different payload, the backend returns <b>409
                CONFLICT</b>.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                What to try
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                1) Go to <b>New Charge</b>, generate a key, submit.
              </Typography>
              <Typography variant="body2">
                2) Click <b>Replay</b> with the same key: response should be identical and marked as
                replayed.
              </Typography>
              <Typography variant="body2">
                3) Change the amount but keep the same key: you should get 409 conflict.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
