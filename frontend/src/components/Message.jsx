import React, { useState, useEffect, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import MessageStatus from './MessageStatus';

const Message = forwardRef(({ message, isLastMessage = false }, ref) => {
  const [messageStatus, setMessageStatus] = useState(message?.status || 'sent');

  useEffect(() => {
    if (message?.status && message.status !== messageStatus) {
      setMessageStatus(message.status);
    }
  }, [message?.status, messageStatus]);

  if (!message || !message.sender || !message.sender._id) {
    return null;
  }

  const formattedTime = message.timestamp ? dayjs(message.timestamp).format('HH:mm') : '';
  const currentUserId = localStorage.getItem('userId');
  const isSender = message.sender._id && currentUserId && message.sender._id === currentUserId;

  const getMessageStatus = () => {
    if (messageStatus === 'sending') return 'sending';
    if (message.read) return 'read';
    return 'sent';
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: isSender ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        sx={{
          border: '1px solid #ccc',
          padding: '8px',
          margin: '5px 0',
          width: 'fit-content',
          borderRadius: '7px',
          backgroundColor: isSender ? '#e0f7fa' : '#f1f1f1',
          maxWidth: '60%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Typography sx={{ fontSize: '15px' }} variant="body1">
          {message.content || ''}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '4px',
            gap: 1,
            minHeight: '16px',
          }}
        >
          <small style={{ fontSize: '10px', color: '#888' }}>
            {formattedTime}
          </small>
          <MessageStatus 
            status={getMessageStatus()} 
            timestamp={message.timestamp} 
            isOwnMessage={isSender && isLastMessage}
          />
        </Box>
      </Box>
    </Box>
  );
});

export default Message;
