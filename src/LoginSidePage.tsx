import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import AppTheme from './theme/AppTheme';
import SignInCard from './components/SignInCard';
import Content from './components/Content';

export default function SignInSide(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        component="main"
        sx={[
          {
            justifyContent: 'center',
            height: 'calc((1 - var(--template-frame-height, 0)) * 100%)',
            marginTop: 'max(40px - var(--template-frame-height, 0px), 0px)',
            minHeight: '100%',
          },
          (theme) => ({
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              zIndex: -1,
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse 80% 60% at 20% 20%, hsl(210, 100%, 96%), transparent), radial-gradient(ellipse 70% 60% at 90% 90%, hsl(152, 76%, 94%), hsl(0, 0%, 100%))',
              backgroundRepeat: 'no-repeat',
              ...theme.applyStyles('dark', {
                backgroundImage:
                  'radial-gradient(ellipse 80% 60% at 20% 20%, hsla(210, 100%, 16%, 0.55), transparent), radial-gradient(ellipse 70% 60% at 90% 90%, hsla(152, 60%, 20%, 0.4), hsl(220, 30%, 5%))',
              }),
            },
          }),
        ]}
      >
        <Stack
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{
              justifyContent: 'center',
              gap: { xs: 6, sm: 12 },
              p: { xs: 2, sm: 4 },
              m: 'auto',
            }}
          >
            <Content />
            <SignInCard />
          </Stack>
      </Stack>
    </AppTheme>
  );
}
