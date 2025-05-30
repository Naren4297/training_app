import React, { useState } from "react";
import { Steps, Button, message, Row, Col, Card } from "antd";
import AssignTrainers from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/AssignTrainers"
import AssignTrainees from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/AssignTrainees";
import PreviewSubmission from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/PreviewSubmit";
import { saveTrainingAssignment } from "../configs/coordinator_api_config";
import { useNavigate, useLocation } from "react-router-dom";

const { Step } = Steps;

function AssignTrainingSteps() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const program = location.state?.program;
  const [formData, setFormData] = useState({
    programId: program?.generalInfo?.trainingprogram_id || null,
    programName: program?.generalInfo?.title || "",
    trainers: [],
    batches: [] // Changed from 'trainees' to 'batches'
  });
  

  const navigate = useNavigate();

  const validateTrainers = () => {
    const missingTrainers = [];
    formData.trainers.forEach((topic) => {
      topic.subTopics.forEach((subTopic) => {
        if (!subTopic.trainerId) {
          missingTrainers.push(`Trainer missing for ${subTopic.name}`);
        }
      });
    });

    if (missingTrainers.length > 0) {
      message.error(
        `Please assign trainers to all subtopics. Missing: ${missingTrainers.join(", ")}`
      );
      return false;
    }
    return true;
  };

  const validateBatches = () => {
    if (!formData.batches.length) {
      message.error("Please assign at least one batch");
      return false;
    }
    return true;
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return validateTrainers();
      case 1:
        return validateBatches(); // Updated to validate batches instead of trainees
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    console.log("Submitting Training Details:", JSON.stringify(formData, null, 2));
    ;
    message.loading("Submitting training details...");
    try {
      const response = await saveTrainingAssignment(formData);
      if (response.status === 200) {
        message.success("Training details submitted successfully!");
        navigate("/trainings");
      } else {
        message.error("Failed to submit training details. Please try again.");
      }
    } catch (error) {
      message.error("An error occurred while submitting training details.");
    }
  };

  const steps = [
    {
      title: "Assign Trainers",
      content: (
        <AssignTrainers formData={formData} setFormData={setFormData} program={program} />
      )
    },
    {
      title: "Assign Trainees",
      content: (
        <AssignTrainees formData={formData} setFormData={setFormData} program={program} />
      )
    },
    {
      title: "Preview & Submit",
      content: (
        <div style={{ padding: "20px 0" }}>
          <Card title="Preview Your Training Assignment">
            <PreviewSubmission formData={formData} />
          </Card>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Steps current={currentStep}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <div style={{ margin: "24px 0" }}>{steps[currentStep].content}</div>

      <Row justify="end" gutter={16}>
        <Col>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrevious}>
              Previous
            </Button>
          )}
        </Col>
        <Col>
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default AssignTrainingSteps;