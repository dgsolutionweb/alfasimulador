import { Box, Typography } from '@mui/material';
import { CurrencyExchange } from '@mui/icons-material';

export const Logo = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)',
            borderRadius: '16px',
            transform: 'rotate(45deg)',
            position: 'absolute',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
          }}
        />
        <Box
          sx={{
            width: 50,
            height: 50,
            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
            borderRadius: '14px',
            transform: 'rotate(25deg)',
            position: 'absolute',
            opacity: 0.8,
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
          }}
        />
        <CurrencyExchange
          sx={{
            fontSize: 32,
            color: '#FFFFFF',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </Box>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(45deg, #0F172A 30%, #3B82F6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(59, 130, 246, 0.1)',
            mb: -0.5,
          }}
        >
          ALFA PRIME
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            color: 'text.secondary',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          }}
        >
          Simulador
        </Typography>
      </Box>
    </Box>
  );
}; 