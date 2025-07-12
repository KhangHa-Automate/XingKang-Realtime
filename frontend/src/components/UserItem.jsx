import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const UserItem = ({ user }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px' }}>
      <Typography>{user.username}</Typography>
      <Button variant="contained">Add Friend</Button>
    </Box>
  );
};

export default UserItem;
