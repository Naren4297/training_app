// AssignedBatches.js
import React from "react";
import { Card, Col, Row } from "antd";
import { TeamOutlined } from "@ant-design/icons";

function AssignedBatches({ batchNames }) {
  return (
    <Card title={<><TeamOutlined /> Assigned Batches</>} className="mb-6">
      <Row gutter={[16, 16]}>
        {batchNames.map((batch, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card size="small" className="text-center">
              {batch}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default AssignedBatches;
