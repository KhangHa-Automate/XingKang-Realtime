import React from 'react';
import { Box, Typography } from '@mui/material';

const TypingIndicator = ({ isTyping, senderName }) => {
  if (!isTyping) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        margin: '10px 0',
        opacity: 0.7,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#f1f1f1',
          padding: '8px 12px',
          borderRadius: '15px',
          maxWidth: '60%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
          {senderName || 'Someone'} is typing
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: '2px',
          }}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: `typing 1.4s infinite ease-in-out`,
                animationDelay: `${index * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.4,
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TypingIndicator; 