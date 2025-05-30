import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await api.get('/notification/notifications');
      setNotifications(response.data);
    };

    fetchNotifications();

    socket.on('notification', (notification) => {
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <div>
      {notifications.map((notification) => (
        <div key={notification.id}>{notification.message}</div>
      ))}
    </div>
  );
};

export default Notifications;