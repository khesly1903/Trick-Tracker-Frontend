import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Pencil, Layers, Users, GraduationCap, Calendar, Zap } from 'lucide-react';
import type { Class } from '../../api/types';

interface ClassCardProps {
  classItem: Class;
  onEdit: (classItem: Class) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, onEdit }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PRIVATE': return 'primary';
      case 'GROUP': return 'secondary';
      case 'MAKEUP': return 'warning';
      case 'WORKSHOP': return 'info';
      case 'EVENT': return 'error';
      default: return 'default';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PRIVATE': return <GraduationCap size={16} />;
      case 'GROUP': return <Users size={16} />;
      case 'MAKEUP': return <Zap size={16} />;
      case 'WORKSHOP': return <Layers size={16} />;
      case 'EVENT': return <Calendar size={16} />;
      default: return undefined;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '0.5rem',
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 20px 40px -12px rgba(0,0,0,0.5)' 
            : '0 20px 40px -12px rgba(0,0,0,0.1)',
          borderColor: 'primary.main',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Chip 
            label={classItem.type} 
            size="small" 
            color={getTypeColor(classItem.type) as any}
            icon={getIcon(classItem.type)}
            sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', px: 0.5 }}
          />
          <Chip 
            label={classItem.isActive ? 'Active' : 'Archived'} 
            size="small" 
            variant="outlined"
            color={classItem.isActive ? 'success' : 'default'}
            sx={{ fontWeight: 600, fontSize: '0.65rem' }}
          />
        </Box>
        
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
          {classItem.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.9 }}>
            {classItem._count?.programs || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Programs running
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'flex-end' }}>
        <Tooltip title="Edit Class Settings">
          <IconButton 
            size="medium" 
            onClick={() => onEdit(classItem)}
            sx={{ 
              borderRadius: '0.75rem',
              bgcolor: 'action.hover',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: 'primary.main', 
                color: 'white',
                transform: 'rotate(15deg)'
              }
            }}
          >
            <Pencil size={18} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ClassCard;
