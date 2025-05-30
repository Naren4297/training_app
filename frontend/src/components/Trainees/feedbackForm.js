import React, { useRef } from 'react';
import { Layout, Form, Input, Button, Rate, Breadcrumb, Select, message } from 'antd';
import api from '../../utils/api'

const { Option } = Select;
const baseUrl = process.env.REACT_APP_BASE_URL;

const FeedbackForm = () => {
  const formRef = useRef(null);
  const sendNotification = async (message) => {
    try {
      await api.post(`${baseUrl}send-notification`, { message });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  
  
  

  const onFinish = async (values) => {
    try {
      await api.post(`${baseUrl}api/trainees/submit-feedback`, values)
      message.success('Feedback submitted successfully');
      formRef.current.resetFields();
      sendNotification('Feedback sent');
    } catch (error) {
      message.error('Error submitting feedback');
      console.error('Error creating feedback:', error);
    }
  };

  return (
    
          <div
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Form
              ref={formRef}
              name="feedback_form"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ remember: true }}
              style={{ maxWidth: '600px', margin: '0 auto' }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter your name!' }]}
              >
                <Input placeholder="Enter your name" />
              </Form.Item>

              <Form.Item
                name="trainingProgram"
                label="Training Program"
                rules={[{ required: true, message: 'Please select a training program!' }]}
              >
                <Select placeholder="Select a Training program" listHeight={100}>
                  <Option value="Training program 1">Training program 1</Option>
                  <Option value="Training program 2">Training program 2</Option>
                  <Option value="Training program 3">Training program 3</Option>
                  <Option value="Training program 4">Training program 4</Option>
                  <Option value="Training program 5">Training program 5</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Please rate the training session!' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                name="comments"
                label="Comments"
                rules={[{ required: true, message: 'Please provide your comments!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter your comments" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
          
  );
};

export default FeedbackForm;
