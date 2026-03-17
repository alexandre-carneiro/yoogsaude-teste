import React from 'react';
import styled from 'styled-components';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button, { type ButtonProps } from '@mui/material/Button';

type ActionCardProps = {
  accentColor: 'primary' | 'secondary';
  overline: string;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?: ButtonProps['variant'];
  onClick?: () => void;
};

const Root = styled(Card)`
  height: 100%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Content = styled(CardContent)`
  flex-grow: 1;
`;

const Actions = styled(CardActions)`
  padding: 0 24px 24px;
`;

export function ActionCard({
  accentColor,
  overline,
  title,
  description,
  actionLabel,
  actionVariant = 'contained',
  onClick
}: ActionCardProps) {
  return (
    <Root
      elevation={3}
      sx={{
        border: (theme) =>
          `1px solid ${accentColor === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main}22`
      }}
    >
      <Content>
        <Typography
          variant="overline"
          sx={{
            color: (theme) =>
              accentColor === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
            fontWeight: 700,
            letterSpacing: 1.2
          }}
        >
          {overline}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Content>
      <Actions>
        <Button
          fullWidth
          variant={actionVariant}
          color={accentColor}
          onClick={onClick}
        >
          {actionLabel}
        </Button>
      </Actions>
    </Root>
  );
}

