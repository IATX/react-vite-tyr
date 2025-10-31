import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Chip, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate } from 'react-router-dom';

interface NavBreadcrumbProps {
    navItems: {
        name: string,
        url?: string
    }[]
}

const NavBreadcrumb: React.FC<NavBreadcrumbProps> = ({ navItems }) => {
    const navigate = useNavigate();

    function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.preventDefault();
    }

    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Chip icon={<HomeOutlinedIcon sx={{color:'hsl(210, 98%, 48%)'}}/>} label="Home" size="small" variant="outlined"
      onClick={() => navigate('/main')} clickable/>

                {navItems && navItems.map((item, index) => {
                    const isLast = index === navItems.length - 1;
                    
                    return isLast ? (
                        <Typography key={item.name} className='text-sm text-blue-500'>
                            {item.name}
                        </Typography>
                    ) : (
                        <Chip
                            key={item.name}
                            label={item.name}
                            size="small"
                        >
                            
                        </Chip>
                    );
                })}
            </Breadcrumbs>
        </div>
    );
}

export default NavBreadcrumb;