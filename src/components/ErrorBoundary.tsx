import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, gap: 2, minHeight: 200 }}>
          <ErrorOutline sx={{ fontSize: 48, color: 'error.main' }} />
          <Typography variant="h6">页面加载出错</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
            {this.state.error?.message ?? '发生未知错误'}
          </Typography>
          <Button variant="outlined" size="small" onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
