import React, { useEffect, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { Box, Button } from '@material-ui/core';
import { useRouter } from 'next/router';
import sharedClasses from './sharedClasses';
import { Toc } from '@material-ui/icons';

const CmsLayout: React.FC<unknown> = ({ children }) => {
  const classes = sharedClasses();
  const router = useRouter();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const pathNames = ['/cms/schemas', '/cms/schemadata', '/cms/custom', '/cms/settings'];
    const index = pathNames.findIndex((pathname) => pathname === router.pathname);
    setValue(index);
  }, [router.pathname]);

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setValue(newValue);
    router.push(`${event.currentTarget.id}`, undefined, { shallow: false });
  };

  return (
    <Box p={4}>
      <Box className={classes.navBar}>
        <Typography className={classes.navContent} variant={'h4'}>
          Content Management
          <a
            href={`${process.env.CONDUIT_URL}/swagger/#/cms`}
            target="_blank"
            rel="noreferrer"
            className={classes.swaggerButton}>
            <Button variant="outlined" endIcon={<Toc />}>
              SWAGGER
            </Button>
          </a>
        </Typography>
        <Tabs value={value} className={classes.navContent} onChange={handleChange}>
          <Tab label="Schemas" id="schemas" />
          <Tab label="Data" id="schemadata" />
          <Tab label="Custom" id="custom" />
          <Tab label="Settings" id="settings" />
        </Tabs>
      </Box>
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};

export default CmsLayout;