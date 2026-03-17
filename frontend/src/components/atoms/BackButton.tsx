import React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

type BackButtonProps = {
  to?: string;
  label?: string;
  variant?: ButtonProps['variant'];
};

export function BackButton({ to = '/', label = 'Página inicial', variant = 'text' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(to)}
    >
      {label}
    </Button>
  );
}

