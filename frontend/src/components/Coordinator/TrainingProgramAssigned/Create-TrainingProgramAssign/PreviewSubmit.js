import React from "react";
import { Collapse, List, Typography, Button, message } from "antd";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PreviewSubmit = ({ formData }) => {
  const { trainers = [], batches = [] } = formData;

  return (
    <div>
      <Title level={2}>Preview & Submit</Title>

      <Title level={3}>Assigned Trainers</Title>
      <Collapse accordion>
        {trainers.map((topic) => (
          <Panel header={topic.topicName} key={topic.topicId}>
            <List
              bordered
              dataSource={topic.subTopics}
              renderItem={(subTopic) => (
                <List.Item>
                  <Text strong>{subTopic.subTopicName}</Text>: {" "}
                  {subTopic.trainerName ? (
                    <Text type="success">{subTopic.trainerName}</Text>
                  ) : (
                    <Text type="danger">Not Assigned</Text>
                  )}
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>

      <Title level={3} style={{ marginTop: "20px" }}>
        Assigned Batches
      </Title>
      {batches.length > 0 ? (
        <List
          bordered
          dataSource={batches.map((batch) => batch.name)}
          renderItem={(batchInfo) => <List.Item>{batchInfo}</List.Item>}
        />
      ) : (
        <Text type="danger">No batches assigned.</Text>
      )}
    </div>
  );
};

export default PreviewSubmit;
