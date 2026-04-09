import React from 'react';
import {
  Box,
  Typography,
  Card,
} from '@mui/material';
import { TrendingUp } from 'lucide-react';

export const StatusCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => {

  return (
    <Card
      sx={{
        p: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '1rem' }}>
        <Box
          sx={{
            p: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: '0.25rem' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} />
          {subtitle}
        </Typography>
      )}
    </Card>
  );
};