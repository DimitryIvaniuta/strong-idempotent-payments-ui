import { Outlet, NavLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import KeyIcon from '@mui/icons-material/Key';

const drawerWidth = 260;

type NavItem = {
  label: string;
  to: string;
  icon: JSX.Element;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <DashboardIcon /> },
  { label: 'New Charge', to: '/charges', icon: <PaymentIcon /> },
  { label: 'Lookup Payment', to: '/payments', icon: <ReceiptLongIcon /> },
  { label: 'Idempotency Playground', to: '/idempotency', icon: <KeyIcon /> },
];

/**
 * Production-ish layout skeleton:
 * - Header (AppBar)
 * - Left sidebar navigation (Drawer)
 * - Central content area (Outlet)
 * - Footer
 */
export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Strong Idempotent Payments
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            React 19 + Spring Boot
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((i) => (
              <ListItemButton
                key={i.to}
                component={NavLink}
                to={i.to}
                end={i.to === '/'}
                sx={{
                  '&.active': {
                    backgroundColor: 'action.selected',
                    '& .MuiListItemIcon-root': { opacity: 1 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, opacity: 0.85 }}>{i.icon}</ListItemIcon>
                <ListItemText primary={i.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Tip: use the same <b>X-Idempotency-Key</b> to safely retry a charge.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
          <Outlet />
        </Container>
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Strong Idempotent Payments UI
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
