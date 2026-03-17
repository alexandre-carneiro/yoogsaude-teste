import React from 'react';
import styled from 'styled-components';
import Container from '@mui/material/Container';
import { globalTheme } from '../../styles/theme/globalTheme';

type PageShellProps = {
  children: React.ReactNode;
};

const Background = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, ${globalTheme.colors.primary}22, transparent 55%),
    radial-gradient(circle at bottom right, ${globalTheme.colors.secondary}22, transparent 55%),
    ${globalTheme.colors.background};
`;

const ShellContainer = styled(Container)`
  padding-top: 48px;
  padding-bottom: 48px;
`;

export function PageShell({ children }: PageShellProps) {
  return (
    <Background>
      <ShellContainer maxWidth="lg">{children}</ShellContainer>
    </Background>
  );
}

