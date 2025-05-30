import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, message } from "antd";
import CreateTrainingProgram from "./CreateTrainingProgram";
import ViewTrainingProgram from "./ViewTrainingProgram";
import AssignProgram from "./AssignTrainings";
import { getTrainingPrograms, getTrainingProgramByID, createTrainingProgram, deleteTrainingProgram } from "../configs/coordinator_api_config";
import "../index.css"; // Import the CSS file
import sendNotification from "../utils/notificationHelper";
import { useAppContext } from "../utils/ApplicationContext";

function TrainingProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const userDetails = useAppContext();
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await getTrainingPrograms(userDetails.state.user.name);
        setPrograms(response.data.programs);
      } catch (error) {
        message.error("Failed to load training programs.");
      }
    };

    fetchPrograms();
  }, [userDetails]);

  const handleCreateProgram = async() => {
    await sendNotification(2, "test notification");
    console.log('Notification sent successfully');
    setIsCreating(true);
    setSelectedProgram(null);
  };

  const handleViewProgram = () => {
    setIsViewing(true);
    setSelectedProgram(null);
  };

  const handleSaveProgram = async (newProgram) => {
    try {
      const savedProgram = await createTrainingProgram(newProgram);
      setPrograms((prev) => [...prev, savedProgram]);
      message.success("Training program created successfully!");
      setIsCreating(false);
    } catch (error) {
      message.error("Failed to save training program.");
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      await deleteTrainingProgram(programId);
      setPrograms((prev) =>
        prev.filter(
          (program) => program.generalInfo.trainingprogram_id !== programId
        )
      );
      message.success("Training program deleted successfully!");
    } catch (error) {
      message.error("Failed to delete training program.");
    }
  };

  const handleEditProgram = async (programId) => {
    try {
      const response = await getTrainingProgramByID(programId);
      if (response.success) {
        setSelectedProgram(response.data);
        setIsCreating(true);
      } else {
        message.error("Failed to load the training program for editing.");
      }
    } catch (error) {
      message.error("Error fetching the training program.");
    }
  };

  const handleAssignTrainings = () => {
    if (selectedProgram) {
      navigate("/assign-training", { state: { program: selectedProgram } });
    }
  };

  const handleTrainingProgressTracker = () => {
    
    if (selectedProgram) {
      navigate("/training_progress", { state: { program: selectedProgram } });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {isCreating ? (
        <CreateTrainingProgram selectedProgram={selectedProgram} />
      ) :
      isViewing ? (
        <ViewTrainingProgram selectedProgram={selectedProgram} />
      ): (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {userDetails.state.modelName==='coordinator'&&
            <>
            <Button type="primary" onClick={handleCreateProgram}>
            Create Training Program
          </Button>
          <Button type="primary" onClick={handleAssignTrainings} disabled={!selectedProgram}>
            Assign Trainings
          </Button>
            </>
            }            
            {userDetails.state.modelName==='trainer'&&
            <Button type="primary" onClick={handleTrainingProgressTracker} disabled={!selectedProgram}>
            Mark Attendance
            </Button>
            }
          </div>
          <Table
            dataSource={programs}
            columns={[
              {
                title: "Title",
                dataIndex: ["generalInfo", "title"],
                key: "title",
              },
              {
                title: "Description",
                dataIndex: ["generalInfo", "description"],
                key: "description",
              },
              {
                title: "Target Audience",
                dataIndex: ["generalInfo", "targetAudience"],
                key: "targetAudience",
              },
              {
                title: "Status",
                dataIndex: ["generalInfo", "status"],
                key: "status",
              },
              {
                title: "Action",
                render: (_, record) => (
                  <>
                    <Button
                      onClick={handleViewProgram}
                    >
                      View
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProgram(record.generalInfo.trainingprogram_id);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </Button>
                    <Button
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProgram(record.generalInfo.trainingprogram_id);
                      }}
                    >
                      Delete
                    </Button>
                  </>
                ),
              },
            ]}
            rowKey={(record) => record.generalInfo.trainingprogram_id}
            rowClassName={(record) =>
              record.generalInfo.trainingprogram_id ===
              selectedProgram?.generalInfo?.trainingprogram_id
                ? "selected-row"
                : ""
            }
            onRow={(record) => ({
              onClick: () => setSelectedProgram(record),
            })}
          />
        </>
      )}
    </div>
  );
}

export default TrainingProgramManagement;