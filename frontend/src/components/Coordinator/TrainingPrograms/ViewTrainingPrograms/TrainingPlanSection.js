import React from "react";
import { Card, Collapse, List, Space, Typography, Tag, Tooltip, Descriptions } from "antd";
import { ClockCircleOutlined, ProjectOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Title, Text } = Typography;

function TrainingPlanSection({ trainingPlan, duration }) {
  const calculateTotalHours = (topics) => {
    return topics.reduce((total, topic) => {
      return total + topic.subTopics.reduce((subtotal, sub) => 
        subtotal + parseFloat(sub.hours), 0);
    }, 0);
  };

  const totalHours = calculateTotalHours(trainingPlan.mainTopics);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card 
        title={<Title level={4}>Training Schedule</Title>}
        extra={
          <Space>
            <Tag color="purple">
              <ClockCircleOutlined /> {duration.programDuration} weeks
            </Tag>
            <Tooltip title="Total training hours">
              <Tag color="cyan">{totalHours} hours</Tag>
            </Tooltip>
          </Space>
        }
      >
        <Collapse>
          {trainingPlan.mainTopics.map((topic, index) => (
            <Panel 
              header={
                <Space>
                  <strong>{topic.name}</strong>
                  <Tag color="blue">
                    {topic.subTopics.reduce((total, sub) => 
                      total + parseFloat(sub.hours), 0)} hours
                  </Tag>
                </Space>
              } 
              key={index}
            >
              <List
                dataSource={topic.subTopics}
                renderItem={(subTopic, subIndex) => (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{subTopic.name}</Text>
                      <Space>
                        <Tag color="orange">
                          <ClockCircleOutlined /> {subTopic.hours} hours
                        </Tag>
                        {subTopic.agenda && (
                          <Tag color="green">{subTopic.agenda}</Tag>
                        )}
                      </Space>
                    </Space>
                  </Card>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>

      <Card 
        title={
          <Space>
            <ProjectOutlined />
            <Title level={4} style={{ margin: 0 }}>Mock Project</Title>
          </Space>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Project Name">
            {trainingPlan.mockProject.name}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {trainingPlan.mockProject.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

export default TrainingPlanSection;