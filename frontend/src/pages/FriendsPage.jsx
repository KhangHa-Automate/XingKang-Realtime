import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../services/userService';
import UserItem from '../components/UserItem';
import { Box, Typography } from '@mui/material';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getAllUsers();
        setFriends(response.data.data.users);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h4">Friends List</Typography>
      {friends.map((friend) => (
        <UserItem key={friend._id} user={friend} />
      ))}
    </Box>
  );
};

export default FriendsPage;
