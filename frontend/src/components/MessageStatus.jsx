import React from 'react';
import { Check } from '@mui/icons-material';

const MessageStatus = ({ status = 'sent', timestamp, isOwnMessage = false }) => {
  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Đang gửi';
      case 'sent':
        return 'Đã gửi';
      case 'read':
        return 'Đã xem';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'sent':
        return <Check style={{ fontSize: '10px', marginRight: '2px' }} />;
      case 'read':
        return <span style={{ fontSize: '10px', marginRight: '2px' }}>👁</span>;
      default:
        return null;
    }
  };

  // Chỉ hiển thị trạng thái cho tin nhắn của chính mình
  if (!isOwnMessage) {
    return null;
  }

  return (
    <span style={{ color: '#888', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {getStatusIcon()}
      <span style={{ fontSize: '10px' }}>{getStatusText()}</span>
    </span>
  );
};

export default MessageStatus; 