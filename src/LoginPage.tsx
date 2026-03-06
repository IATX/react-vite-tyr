import * as React from 'react';

import Stack from '@mui/material/Stack';
import AppTheme from './theme/AppTheme';
import SignInCard from './components/SignInCard';

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <div className="bg-slate-50 min-h-screen flex flex-col justify-center">
        {/* 移除 pt-20，改用 flex 居中 */}
        <div className="relative isolate px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Stack
              direction={{ xs: 'column-reverse', md: 'row' }}
              sx={{
                justifyContent: 'center',
                alignItems: 'center', // 确保 Stack 内部也是居中的
                gap: { xs: 6, sm: 12 },
                p: { xs: 2, sm: 4 },
                m: 'auto',
              }}
            >
              <SignInCard />
            </Stack>
          </div>
        </div>
      </div>

    </AppTheme>
  );
}
