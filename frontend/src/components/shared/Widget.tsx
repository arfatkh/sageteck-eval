import React from 'react';
import { Paper, Box, Typography, Button, styled, alpha } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

const WidgetContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: alpha(theme.palette.common.white, 0.1),
  height: '100%',
  position: 'relative',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
    borderColor: alpha(theme.palette.primary.main, 0.2),
    '& .drag-handle': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
    pointerEvents: 'none',
    opacity: 0.5,
  }
}));

const DragHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  cursor: 'move',
  color: alpha(theme.palette.common.white, 0.3),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.05),
    color: theme.palette.common.white,
  }
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ViewMoreButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5, 1),
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      transform: 'translateX(4px)',
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: 18,
    marginLeft: theme.spacing(0.5),
    transition: 'transform 0.2s ease-in-out',
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  letterSpacing: '-0.025em',
}));

export const Widget: React.FC<WidgetProps> = ({ title, children, actionText, onAction }) => {
  return (
    <WidgetContainer>
      <DragHandle className="drag-handle">
        <DragIndicatorIcon />
      </DragHandle>
      <Header>
        <Title variant="h6">
          {title}
        </Title>
        {actionText && (
          <ViewMoreButton
            onClick={onAction}
            endIcon={<ArrowForwardIcon />}
          >
            {actionText}
          </ViewMoreButton>
        )}
      </Header>
      {children}
    </WidgetContainer>
  );
}; 