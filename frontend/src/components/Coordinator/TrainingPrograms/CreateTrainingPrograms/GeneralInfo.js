import React from "react";
import { 
  Form, 
  Input, 
  Select, 
  Switch, 
  Card, 
  Space,
  DatePicker
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

function GeneralInfo({ formData, setFormData }) {
  formData.generalInfo = {...formData.generalInfo,  startDate:formData.generalInfo.startDate?dayjs(formData.generalInfo.startDate):formData.generalInfo.startDate, endDate:formData.generalInfo.endDate?dayjs(formData.generalInfo.endDate):formData.generalInfo.endDate};
  const handleChange = (changedValues) => {
    setFormData((prevData) => ({
      ...prevData,
      generalInfo: { ...prevData.generalInfo, ...changedValues },
    }));
  };

  return (
    <Form
      layout="vertical"
      initialValues={formData.generalInfo}
      onValuesChange={(_, allValues) => handleChange(allValues)}
      requiredMark="optional"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Basic Information" bordered={false}>
          <Form.Item 
            label="Title" 
            name="title" 
            required
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input size="large" placeholder="Enter program title" />
          </Form.Item>
          
          <Form.Item label="Description" name="description">
            <Input.TextArea 
              rows={4} 
              placeholder="Enter program description"
              showCount
              maxLength={500}
            />
          </Form.Item>
          <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: "Please select a start date!" }]}>
            <DatePicker size="large" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: "Please select an end date!" }]}>
            <DatePicker size="large" style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card title="Program Details" bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item label="Target Audience" name="targetAudience">
              <Select size="large" placeholder="Select target audience">
                <Option value="freshers">Freshers</Option>
                <Option value="experienced">Experienced</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Training Methods" name="trainingMethods">
              <Select 
                mode="multiple" 
                size="large"
                placeholder="Select training methods"
                options={[
                  { label: 'Lecture', value: 'lecture' },
                  { label: 'Hands-on', value: 'hands-on' },
                ]}
              />
            </Form.Item>

            <Form.Item 
              label="Assessment Required" 
              name="assessmentRequired"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Additional Details" bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item label="Program Level" name="level">
              <Select size="large" placeholder="Select program level">
                <Option value="beginner">Beginner</Option>
                <Option value="intermediate">Intermediate</Option>
                <Option value="advanced">Advanced</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Program Type" name="programType">
              <Select size="large" placeholder="Select program type">
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
                <Option value="hybrid">Hybrid</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Location" name="location">
              <Input size="large" placeholder="Enter location" />
            </Form.Item>

            <Form.Item label="Prerequisites" name="prerequisites">
              <Input.TextArea 
                rows={2} 
                placeholder="Enter prerequisites"
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Space>
        </Card>
      </Space>
    </Form>
  );
}

export default GeneralInfo;