import React from "react";
import { Row, Col, Typography } from "antd";
import GeneralInfoSection from "../components/Coordinator/TrainingPrograms/ViewTrainingPrograms/GeneralInfoSection";
import TrainingPlanSection from "../components/Coordinator/TrainingPrograms/ViewTrainingPrograms/TrainingPlanSection";
import ResourceSection from "../components/Coordinator/TrainingPrograms/ViewTrainingPrograms/ResourceSection";

const { Title } = Typography;

function ViewTrainingProgram({ selectedProgram }) {
  if (!selectedProgram) {
    return <Title level={4}>Please select a training program to view details.</Title>;
  }

  console.log(selectedProgram);

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>{selectedProgram.generalInfo.title}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <GeneralInfoSection generalInfo={selectedProgram.generalInfo} />
        </Col>
        <Col xs={24} lg={12}>
          <TrainingPlanSection 
            trainingPlan={selectedProgram.trainingPlan}
            duration={selectedProgram.duration}
          />
        </Col>
        <Col xs={24}>
          <ResourceSection resources={selectedProgram.resources} />
        </Col>
      </Row>
    </div>
  );
}

export default ViewTrainingProgram;