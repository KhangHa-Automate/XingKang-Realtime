import React, { useEffect, useState } from 'react';
import { getFriends } from '../services/userService';
import ChatBox from '../components/ChatBox';
import FriendList from '../components/FriendList';
import { Box } from '@mui/material';

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriends();
        setFriends(response.data.data.friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const onSelectFriend = (friendId) => {
    setSelectedFriend(friendId);
  };

  if(loading) return <div>Loading...</div>;

  return (
    <Box display="flex" height="88vh" sx={{ mt: '70px' }}>
      <Box width="30%" borderRight="1px solid #ccc">
        <FriendList friends={friends} onSelectFriend={onSelectFriend} />
      </Box>
      <Box flex={1} sx={{ height: '100%', overflow: 'hidden' }}>
        {selectedFriend ? (
          <ChatBox conversationId={selectedFriend} />
        ) : (
          <div>Select a conversation</div>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
