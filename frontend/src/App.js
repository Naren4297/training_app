// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import { ConfigProvider } from 'antd';
import {ContextProvider} from './utils/ApplicationContext'
import LoginComponent from './components/Login/LoginComponent';
import PrivateRoute from './utils/privateRoute';

const App = () => (
  <Router>
    {/* <ConfigProvider theme={{
          token: {
            colorBgLayout: ' #fefefe',
          },
        }}> */}
          <ContextProvider>
          <Dashboard />
          </ContextProvider>
        {/* </ConfigProvider> */}
  </Router>
);

export default App;
