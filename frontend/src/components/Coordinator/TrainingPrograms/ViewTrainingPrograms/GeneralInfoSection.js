import React from "react";
import { Card, Descriptions, Tag, Space, Typography } from "antd";
import { 
  UserOutlined, 
  AimOutlined, 
  BulbOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

function GeneralInfoSection({ generalInfo }) {
  const renderTrainingMethods = () => (
    <Space wrap>
      {generalInfo.trainingMethods.map((method) => (
        <Tag key={method} color="blue">{method}</Tag>
      ))}
    </Space>
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title={<Title level={4}>Basic Information</Title>}>
        <Descriptions column={1} bordered>
          <Descriptions.Item 
            label={<><UserOutlined /> Target Audience</>}
          >
            {generalInfo.targetAudience}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><AimOutlined /> Level</>}
          >
            {generalInfo.level}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><BulbOutlined /> Program Type</>}
          >
            {generalInfo.programType}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><EnvironmentOutlined /> Location</>}
          >
            {generalInfo.location}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><CalendarOutlined /> Start Date</>}
          >
            {new Date(generalInfo.startDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><CalendarOutlined /> End Date</>}
          >
            {new Date(generalInfo.endDate).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={<Title level={4}>Program Details</Title>}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Description">
            {generalInfo.description}
          </Descriptions.Item>
          <Descriptions.Item label="Training Methods">
            {renderTrainingMethods()}
          </Descriptions.Item>
          <Descriptions.Item label="Assessment Required">
            <Tag color={generalInfo.assessmentRequired ? "green" : "red"}>
              {generalInfo.assessmentRequired ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={<Title level={4}>Additional Details</Title>}>
        <Descriptions column={1} bordered>
          <Descriptions.Item 
            label={<><CheckCircleOutlined /> Prerequisites</>}
          >
            {generalInfo.prerequisites}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

export default GeneralInfoSection;