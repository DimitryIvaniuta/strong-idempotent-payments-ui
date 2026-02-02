import { Box, Typography } from '@mui/material';

/** Simple JSON pretty printer component. */
export function JsonViewer(props: { title?: string; value: unknown }) {
  return (
    <Box sx={{ mt: 2 }}>
      {props.title ? (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {props.title}
        </Typography>
      ) : null}
      <Box
        component="pre"
        sx={{
          p: 2,
          m: 0,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.4,
        }}
      >
        {JSON.stringify(props.value, null, 2)}
      </Box>
    </Box>
  );
}
