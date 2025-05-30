import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Card, message, Form, Typography } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginComponent.css";
import {useAppUpdateContext, useAppContext} from "../../utils/ApplicationContext";

const { Title } = Typography;

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const updateContext = useAppUpdateContext();
  const context = useAppContext();

  const handleLogin = async () => {
    if (!email) {
      message.error("Email shouldn't be empty");
      return;
    }
    if (!password) {
      message.error("Password shouldn't be empty");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/login/loginUser", { email, password });
      if (response.data.success) {
        message.success("Login successful!");
        sessionStorage.setItem('token', response.data.token);

        const userState = { state: { modelName: response.data.data.modelName,
          user: response.data.data.user
         } };
        const userDetailsString = JSON.stringify(userState);
        document.cookie = `userDetails=${userDetailsString}; max-age=36000`
        updateContext(userState);
        navigate("/", userState);
      } else {
        message.error(response.data.message || "Login failed!");
      }
    } catch (error) {
      message.error("Invalid Login credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <Title level={2} className="app-name">DAAS</Title>
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                className="input-field"
                autoComplete="email"
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
                className="input-field"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginComponent;