import React, { useState, useEffect } from "react";
import { Steps, Button, message, Row, Col, Card } from "antd";
import AssignTrainers from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/AssignTrainers";
import AssignTrainees from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/AssignTrainees";
import PreviewSubmission from "../components/Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/PreviewSubmit";
import { getTrainingAssignmentByID, updateTrainingAssignment } from "../configs/coordinator_api_config";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const { Step } = Steps;

function EditTrainingSteps() {
  const location = useLocation();
  const { programId } = useParams(); // Assignment ID from URL
  const [currentStep, setCurrentStep] = useState(0);
  const program = location.state?.program;
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  ;

  useEffect(() => {
    // Fetch existing assignment data
    const fetchAssignmentDetails = async () => {
      try {
        const response = await getTrainingAssignmentByID(programId); // API to fetch assignment data
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        message.error("Failed to load assignment details.");
        navigate("/trainings");
      }
    };
    fetchAssignmentDetails();
  }, [programId, navigate]);

  const validateStep = (step) => {
    // Add validation logic (reuse from AssignTrainingSteps.js)
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleUpdate = async () => {
    try {
      message.loading("Updating training details...");
      const response = await updateTrainingAssignment(programId, formData); // Call update API
      if (response.status === 200) {
        message.success("Training details updated successfully!");
        navigate("/trainings");
      } else {
        message.error("Failed to update training details.");
      }
    } catch (error) {
      message.error("An error occurred while updating training details.");
    }
  };

  if (!formData) return <div>Loading...</div>;

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
            <Button type="primary" onClick={handleUpdate}>
              Update
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default EditTrainingSteps;
