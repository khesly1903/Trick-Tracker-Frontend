import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { MapPin, Settings, Eye } from "lucide-react";

// Placeholder image for gym/academy locations
const IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=400";


const LocationsCard = ({ location, onEdit, onSeePrograms }) => {
  if (!location) return null;

  return (
    <Card 
      sx={{ 
        maxWidth: 400, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '0.5rem',
        boxShadow: (theme) => theme.shadows[2],
        "&:hover": {
          boxShadow: (theme) => theme.shadows[6],
          transform: "translateY(-4px)",
          transition: "0.3s"
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={IMAGE_PLACEHOLDER}
        alt={location.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
          {location.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 1 }}>
          <MapPin size={18} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            {location.address}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          startIcon={<Eye size={16} />}
          onClick={() => onSeePrograms(location)}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          See programs
        </Button>
        <Tooltip title="Edit Location">
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<Settings size={16} />}
            onClick={() => onEdit(location)}
            sx={{ textTransform: 'none' }}
          >
            Manage
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default LocationsCard;
