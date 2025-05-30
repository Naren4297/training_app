import React from "react";
import { Form, Input, Collapse, Button, Card, Space, Typography, Row, Col } from "antd";

const { Panel } = Collapse;
const { Title, Text } = Typography;

function Duration({ formData, setFormData, onNext }) {
  const handleFieldChange = (mainIndex, subIndex, key, value) => {
    const updatedTopics = [...(formData.trainingPlan?.mainTopics || [])];
    updatedTopics[mainIndex].subTopics[subIndex] = {
      ...updatedTopics[mainIndex].subTopics[subIndex],
      [key]: value,
    };

    setFormData({
      ...formData,
      trainingPlan: { ...formData.trainingPlan, mainTopics: updatedTopics },
    });
  };

  const validateDurations = () => {
    const topics = formData.trainingPlan?.mainTopics || [];
    let isValid = true;
    let totalHours = 0;

    // Validate sub-topic durations
    for (const topic of topics) {
      for (const subTopic of topic.subTopics) {
        const hours = parseFloat(subTopic.hours);
        if (!hours || isNaN(hours) || hours <= 0) {
          alert("Please enter valid duration for all sub-topics (must be greater than 0)");
          return false;
        }
        totalHours += hours;
      }
    }

    // Validate program duration
    const programDuration = parseFloat(formData.duration?.programDuration);
    if (!programDuration || isNaN(programDuration) || programDuration <= 0) {
      alert("Please enter a valid program duration in weeks (must be greater than 0)");
      return false;
    }

    // Validate that total hours make sense for program duration
    const maxHoursPerWeek = 40; // Assuming 40 hours max per week
    const totalAvailableHours = programDuration * maxHoursPerWeek;
    if (totalHours > totalAvailableHours) {
      alert(`Total sub-topic hours (${totalHours}) exceed maximum possible hours for ${programDuration} weeks (${totalAvailableHours} hours)`);
      return false;
    }

    return true;
  };

  const renderSubTopic = (mainIndex, subTopic, subIndex) => (
    <Card 
      key={subIndex}
      size="small"
      className="mb-4"
      title={
        <Text strong>
          Sub-Topic {subIndex + 1}: {subTopic.name || "Untitled Sub-Topic"}
        </Text>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item 
            label="Duration (Hours)"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            required
            rules={[
              { required: true, message: 'Please enter duration' },
              { type: 'number', min: 1, message: 'Duration must be greater than 0' }
            ]}
          >
            <Input
              type="number"
              placeholder="Enter duration"
              value={subTopic.hours || ""}
              onChange={(e) => handleFieldChange(mainIndex, subIndex, "hours", e.target.value)}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} sm={12}>
          <Form.Item 
            label="Agenda"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input
              placeholder="Enter agenda (e.g., DAY 1)"
              value={subTopic.agenda || ""}
              onChange={(e) => handleFieldChange(mainIndex, subIndex, "agenda", e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderTopics = () =>
    formData.trainingPlan?.mainTopics?.map((topic, mainIndex) => (
      <Card 
        key={mainIndex}
        className="mb-4"
        bordered
      >
        <Collapse>
          <Panel 
            header={
              <Title level={5} style={{ margin: 0 }}>
                {topic.name || `Untitled Main Topic ${mainIndex + 1}`}
              </Title>
            }
            key={`main-${mainIndex}`}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div className="sub-topics">
                {topic.subTopics.map((subTopic, subIndex) =>
                  renderSubTopic(mainIndex, subTopic, subIndex)
                )}
              </div>
            </Space>
          </Panel>
        </Collapse>
      </Card>
    ));


  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Duration Settings</Title>
        
        <div className="topics-container">
          {renderTopics()}
        </div>

        <Form.Item 
          label="Program Duration (Weeks)"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          required
          rules={[
            { required: true, message: 'Please enter program duration' },
            { type: 'number', min: 1, message: 'Duration must be greater than 0' }
          ]}
        >
          <Input
            type="number"
            value={formData.duration?.programDuration || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration: {
                  ...formData.duration,
                  programDuration: e.target.value,
                },
              })
            }
          />
        </Form.Item>
      </Space>
    </Card>
  );
}

export default Duration;
