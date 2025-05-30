import React, { useState } from "react";
import { Steps, Button, message, Row, Col } from "antd";
import TrainingPlanProgress from "../components/Trainers/ProgressTracker/TrainingPlanProgress";
import AdditionalResources from "../components/Coordinator/TrainingPrograms/CreateTrainingPrograms/AdditionalResources";
import { submitTrainingProgress } from "../configs/coordinator_api_config";
import { useNavigate, useLocation } from "react-router-dom";
const { Step } = Steps;
function TrainingProgressTracker() {
  const location = useLocation();
  const selectedProgram = location.state?.program || null;
  const [currentStep, setCurrentStep] = useState(0);
  const [progressData, setProgressData] = useState(() => ({
    trainingPlan: {
      mainTopics: selectedProgram?.trainingPlan?.mainTopics?.map(topic => ({
        ...topic,
        subTopics: topic.subTopics?.map(subTopic => ({
          ...subTopic,
          completed: subTopic.completed || false // Ensure completed attribute is present
        })) || []
      })) || []
    }
  }));
  console.log(progressData);
  const navigate = useNavigate();
  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrevious = () => setCurrentStep((prev) => prev - 1);
  const handleSubmit = async () => {
    message.loading("Submitting progress...");
    try {
      if (!validateProgressData(progressData)) {
        message.error("Please mark completion for at least one topic.");
        return;
      }
      const response = await submitTrainingProgress(progressData);
      if (response.status === 200) {
        message.success("Training progress submitted successfully!");
        navigate("/trainings");
      } else {
        message.error(response.message || "Failed to submit progress.");
      }
    } catch (error) {
      message.error("Submission failed. Please try again.");
      console.error("Error submitting training progress:", error);
    }
  };
  // Ensure at least one subtopic is completed
  const validateProgressData = (data) => {
    return data.trainingPlan.mainTopics.some(mainTopic => 
      mainTopic.subTopics.some(subTopic => subTopic.completed)
    );
  };
  const steps = [
    {
      title: "Training Plan",
      content: (
        <TrainingPlanProgress 
          progressData={progressData} 
          setProgressData={setProgressData} 
        />
      ),
    },
    {
      title: "Additional Resources",
      content: (
        <AdditionalResources 
          formData={progressData} 
          setFormData={setProgressData} 
        />
      ),
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
              Back
            </Button>
          )}
        </Col>
        <Col>
          {currentStep < steps.length - 1 ? (
            <Button 
              type="primary" 
              onClick={handleNext}
              disabled={!validateProgressData(progressData)}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={handleSubmit}
              disabled={!validateProgressData(progressData)}
            >
              Submit
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}
export default TrainingProgressTracker;