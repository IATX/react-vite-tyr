import React from 'react';
import { Typography, IconButton, Chip } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';

interface Deployment {
  id: number;
  project: string;
  source: string;
  deployed: string;
  status: 'Production' | 'Preview';
}

const deployments: Deployment[] = [
  { id: 1, project: 'Planetaria', source: 'ios-app', deployed: '1m 32s ago', status: 'Preview' },
  { id: 2, project: 'Planetaria', source: 'mobile-api', deployed: '23s ago', status: 'Production' },
  { id: 3, project: 'Tailwind Labs', source: 'tailwindcss.com', deployed: '3m 4s ago', status: 'Preview' },
  // ... more data
];

const DeploymentsList: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-semibold">
          Deployments
        </Typography>
        <div className="flex items-center space-x-4">
          <Typography variant="body2" className="text-gray-500">
            Sort by
          </Typography>
          <IconButton>
            <MoreHorizIcon />
          </IconButton>
        </div>
      </div>

      <div className="space-y-4">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div>
                <Typography className="font-semibold text-sm">{deployment.project}</Typography>
                <Typography className="text-xs text-gray-500">{deployment.source}</Typography>
              </div>
            </div>
            <div className="flex-1 ml-8">
              <Typography className="text-sm text-gray-500">
                Deploys from GitHub
              </Typography>
            </div>
            <div className="flex-1">
              <Typography className="text-sm text-gray-500">
                Initiated {deployment.deployed}
              </Typography>
            </div>
            {deployment.status && (
              <Chip
                label={deployment.status}
                color={deployment.status === 'Production' ? 'primary' : 'default'}
                size="small"
                className={`ml-auto ${deployment.status === 'Production' ? 'bg-violet-100 text-violet-500' : 'bg-gray-200 text-gray-600'}`}
              />
            )}
            <IconButton className="ml-4">
              <MoreHorizIcon />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeploymentsList;