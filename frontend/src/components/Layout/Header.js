import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Dropdown, Card, Button, Modal, Select } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import './AppHeader.css';
import { useAppContext, useAppUpdateContext } from '../../utils/ApplicationContext';

const { Header } = Layout;
const socket = io('http://localhost:5000');

const AppHeader = () => {
  let userDetails = useAppContext();
  const updateContext = useAppUpdateContext();
  const [notifications, setNotifications] = useState([]);
  const [role, setRole] = useState(userDetails?.state?.modelName);
  const navigate = useNavigate();
  const empID = userDetails.state.user?.employeeID; 

  useEffect(() => {
    socket.emit('register', empID); // Register user with empID

    socket.on('notification', (data) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: Date.now(), message: data.message, read: false },
      ]);
    });

    return () => {
      socket.off('notification');
    };
  }, [empID]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const notificationContent = (
    <Card style={{ width: 300 }}>
      <Button onClick={markAllAsRead} style={{ marginBottom: '10px' }}>Mark All as Read</Button>
      <div className="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            onClick={() => markAsRead(notification.id)} 
            className={`notification-item ${notification.read ? 'read' : ''}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </Card>
  );

  // TODO: Once logged out, token should expire.
  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      onOk: () => {
        sessionStorage.clear();
        navigate('/login');
      },
    });
  };

  const handleOnChange = (value) => {
    userDetails.state = {...userDetails.state, modelName:value};
    console.log(userDetails);
    const userDetailsString = JSON.stringify(userDetails);
    document.cookie = `userDetails=${userDetailsString}; max-age=3600`
    updateContext(userDetails);
    setRole(value);
    navigate('/');
  }

  return (
    <Header className="header">
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        <Menu.Item key="1" style={{ fontSize: '18px' }}>
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="2" style={{ fontSize: '18px' }}>About</Menu.Item>
        <Menu.Item key="3" style={{ fontSize: '18px' }}>Contact</Menu.Item>
        <Menu.Item key="4" style={{ marginLeft: 'auto', fontSize: '18px' }}>
          <Dropdown overlay={notificationContent} trigger={['click']} placement="bottomRight">
            <Badge count={unreadCount}>
              <BellOutlined style={{ fontSize: '25px', color: 'white' }} />
            </Badge>
          </Dropdown>
        </Menu.Item>
        <Menu.Item key="5" style={{ fontSize: '18px' }}>
          <Button type="link" onClick={handleLogout} style={{ color: 'white' }}>
            <LogoutOutlined style={{ fontSize: '22px' }} />
          </Button>
        </Menu.Item>
        {/* <Menu.Item key="6" style={{ fontSize: '18px' }}>
          <Select defaultValue={role} style={{width:120}} onChange={handleOnChange} options={[
        { value: 'trainee', label: 'trainee' },
        { value: 'trainer', label: 'trainer' },
        { value: 'coordinator', label: 'coordinator' },
      ]}>

          </Select>
        </Menu.Item> */}
      </Menu>
    </Header>
  );
};

export default AppHeader;