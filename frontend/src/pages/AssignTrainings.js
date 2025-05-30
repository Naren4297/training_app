import React, { useState, useEffect } from "react";
import { Steps, Button, message, Select } from "antd";
import AssignTrainers from "../components/Coordinator/TrainingPrograms/AssignTrainers";
import { getTrainingProgramByID } from "../configs/coordinator_api_config";

const { Step } = Steps;
const { Option } = Select;

function AssignProgram({ selectedProgram }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [level, setLevel] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [trainingPlan, setTrainingPlan] = useState(null);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      try {
        
        const response = await getTrainingProgramByID(selectedProgram.generalInfo.trainingprogram_id);
        if (response.success) {
          setTrainingPlan(response.data.trainingPlan);
        } else {
          message.error("Failed to load training program details.");
        }
      } catch (error) {
        message.error("Error fetching training program details.");
      }
    };

    fetchProgramDetails();
  }, [selectedProgram]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleLevelChange = (value) => {
    setLevel(value);
  };

  const handleAssignTrainers = (assignedTrainers) => {
    setTrainers(assignedTrainers);
    handleNext();
  };

  const handleAssignTrainees = (assignedTrainees, assignedBatches) => {
    setTrainees(assignedTrainees);
    setBatches(assignedBatches);
  };

  const handleReviewAndPublish = () => {
    // Implement the logic to review and publish the assignments
    message.success("Assignments reviewed and published successfully!");
  };

  return (
    <div>
      <Steps current={currentStep}>
        <Step title="Select Level" />
        <Step title="Assign Trainers" />
        <Step title="Assign Trainees" />
        <Step title="Review & Publish" />
      </Steps>
      <div style={{ marginTop: 20 }}>
        {currentStep === 0 && (
          <div>
            <h3>Select Level</h3>
            <Select placeholder="Select Level" onChange={handleLevelChange} style={{ width: 200 }}>
              <Option value="department">Department Level</Option>
              <Option value="zifo">Zifo Level</Option>
            </Select>
            <Button type="primary" onClick={handleNext} disabled={!level} style={{ marginTop: 20 }}>
              Next
            </Button>
          </div>
        )}
        {currentStep === 1 && level === "department" && trainingPlan && (
          <AssignTrainers trainingPlan={trainingPlan} onNext={handleAssignTrainers} />
        )}
        {currentStep === 2 && level === "department" && (
          <div>
            <h3>Assign Trainees</h3>
            {/* Implement the UI to assign trainees to batches and individual users */}
            <Button type="primary" onClick={handleNext} style={{ marginTop: 20 }}>
              Next
            </Button>
          </div>
        )}
        {currentStep === 3 && level === "department" && (
          <div>
            <h3>Review & Publish</h3>
            {/* Implement the UI to review and publish the assignments */}
            <Button type="primary" onClick={handleReviewAndPublish} style={{ marginTop: 20 }}>
              Publish
            </Button>
          </div>
        )}
      </div>
      {currentStep > 0 && (
        <Button style={{ marginTop: 20 }} onClick={handlePrev}>
          Previous
        </Button>
      )}
    </div>
  );
}

export default AssignProgram;