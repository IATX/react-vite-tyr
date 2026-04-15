import * as React from 'react';

import Stack from '@mui/material/Stack';
import AppTheme from './theme/AppTheme';
import SignInCard from './components/SignInCard';

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <div className="bg-gray-50/50 scheme-dar min-h-screen flex flex-col justify-center">
        {/* 移除 pt-20，改用 flex 居中 */}
        <SignInCard />
      </div>

    </AppTheme>
  );
}
