import React from "react";
import { Card, List, Typography, Empty, Space } from "antd";
import { FileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function ResourceSection({ resources }) {
  return (
    <Card title={<Title level={4}>Additional Resources</Title>}>
      {resources && resources.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={resources}
          renderItem={(resource) => (
            <List.Item>
              <Card size="small">
                <Space>
                  <FileOutlined />
                  <Text>{resource.name || resource}</Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No resources available" />
      )}
    </Card>
  );
}

export default ResourceSection;