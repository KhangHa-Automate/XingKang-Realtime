import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const FriendList = ({ friends, onSelectFriend }) => {
  return (
    <Box>
      <Typography variant="h6">Friends List</Typography>
      {friends.map((friend) => (
        <Box key={friend._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px' }}>
          <Typography>{friend.username}</Typography>
          <Button onClick={() => onSelectFriend(friend._id)}>Chat</Button>
        </Box>
      ))}
    </Box>
  );
};

export default FriendList;
