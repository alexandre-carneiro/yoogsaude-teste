import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { PageShell } from '../components/templates/PageShell';
import { ActionCard } from '../components/molecules/ActionCard';

export function HomePage() {
  return (
    <PageShell>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: 0.5, mb: 1 }}
          >
            Mini CRM de Atendimento
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
            Painel para acompanhamento de pacientes e o fluxo de atendimentos.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center" sx={{ alignItems: 'stretch' }}>
          <Grid item xs={12} md={5}>
            <ActionCard
              accentColor="primary"
              overline="Pacientes"
              title="Cadastro e gestão de pacientes"
              description="Mantenha os dados de contato sempre atualizados e tenha uma visão rápida dos pacientes da clínica."
              actionLabel="Ir para pacientes"
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <ActionCard
              accentColor="secondary"
              overline="Atendimentos"
              title="Fila e status dos atendimentos"
              description="Registre solicitações, acompanhe o status (aguardando, em atendimento, finalizado) e mantenha o fluxo sob controle."
              actionLabel="Ir para atendimentos"
              actionVariant="outlined"
            />
          </Grid>
        </Grid>
      </PageShell>
  );
}


