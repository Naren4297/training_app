import React, { useState } from "react";
import { Steps, Button, message, Row, Col, Card } from "antd";
import GeneralInfo from "../components/Coordinator/TrainingPrograms/CreateTrainingPrograms/GeneralInfo";
import TrainingPlan from "../components/Coordinator/TrainingPrograms/CreateTrainingPrograms/TrainingPlan";
import Duration from "../components/Coordinator/TrainingPrograms/CreateTrainingPrograms/Duration";
import AdditionalResources from "../components/Coordinator/TrainingPrograms/CreateTrainingPrograms/AdditionalResources";
import ViewTrainingProgram from "./ViewTrainingProgram";
import { createTrainingProgram, updateTrainingProgram } from "../configs/coordinator_api_config";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { uploadTrainingResources } from "../components/Trainees/materialsUpload";
import { useAppContext } from "../utils/ApplicationContext";
import dayjs from "dayjs";

const { Step } = Steps;
const BASE_URL = "http://localhost:5000/api/coordinator";

function CreateTrainingProgram({ selectedProgram }) {

  const userDetails = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  // const [formData, setFormData] = useState(
  //   selectedProgram || {
  //     generalInfo: {},
  //     trainingPlan: {
  //       mainTopics: [],
  //     },
  //     duration: {},
  //     resources: [],
  // ;
  const [formData, setFormData] = useState(() => {
    if (selectedProgram && Object.keys(selectedProgram).length > 0) {
      // Edit functionality
      return {
        ...selectedProgram,
        updatedBy: userDetails?.state?.user?.name,
      };
    } else {
      // Create functionality
      return {
        generalInfo: {
          startDate: null,
          endDate: null,
        },
        trainingPlan: {
          mainTopics: [],
        },
        duration: {},
        resources: [],
        createdBy: userDetails?.state?.user?.name,
      };
    }
});

  const navigate = useNavigate();

  const validateGeneralInfo = () => {
    const { title, description, targetAudience, trainingMethods, startDate, endDate } = formData.generalInfo;
    if (!title || !description || !targetAudience || !trainingMethods?.length) {
      message.error("Please fill in all required fields in General Information");
      return false;
    }

    if (!startDate || !endDate) {
      message.error("Please provide both Start Date and End Date");
      return false;
    }
  
    if (new Date(startDate) > new Date(endDate)) {
      message.error("End Date cannot be earlier than Start Date");
      return false;
    }
    return true;
  };

  const validateTrainingPlan = () => {
    const { mainTopics } = formData.trainingPlan;
    if (!mainTopics?.length) {
      message.error("Please add at least one main topic with sub-topics");
      return false;
    }
    return true;
  };

  const validateDurationStep = () => {
    const topics = formData.trainingPlan?.mainTopics || [];
    for (const topic of topics) {
      for (const subTopic of topic.subTopics || []) {
        if (!subTopic.hours || isNaN(subTopic.hours) || Number(subTopic.hours) <= 0) {
          message.error("Please provide a valid duration for all sub-topics");
          return false;
        }
      }
    }
    if (
      !formData.duration?.programDuration ||
      isNaN(formData.duration.programDuration) ||
      Number(formData.duration.programDuration) <= 0
    ) {
      message.error("Please provide a valid program duration");
      return false;
    }
    return true;
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return validateGeneralInfo();
      case 1:
        return validateTrainingPlan();
      case 2:
        return validateDurationStep();
      default:
        return true;
    }
  };

  const handleNext = () => {
    console.log('Current data:', JSON.stringify(formData,null,2));

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    console.log('Sending Data to API:', JSON.stringify(formData,null,2));
    ;
    const programId = selectedProgram ? selectedProgram.generalInfo.trainingprogram_id : undefined;
    const trainingProgramName = formData.generalInfo.title; // Extracting the training program name
    message.loading(programId ? "Updating training program..." : "Creating training program...");
  
    try {
      // First, create or update the training program      
      const response = programId
        ? await updateTrainingProgram(programId, formData)
        : await createTrainingProgram(formData);
      console.log("hi", response);
      if (response.success) {
        const createdProgramId = response.data.trainingprogram_id; // Use the returned training program ID
        message.success(programId ? "Training program updated successfully!" : "Training program created successfully!");
        console.log("check", formData.resources);

        const resources = uploadTrainingResources(createdProgramId,trainingProgramName,formData.resources,false);
  
        // // Separate new files from existing files
        // const newFiles = formData.resources.filter(file => file instanceof File);
        // const existingFiles = formData.resources.filter(file => !(file instanceof File));
  
        // // Fetch existing files from the database
        // const existingDbFiles = await api.get(`${BASE_URL}/files/${createdProgramId}`);
        // console.log(existingDbFiles,"edb")
        // const existingFileNames = existingDbFiles.data.data.map(file => file.fileName);
  
        // // Identify files to delete
        // const newFileNames = formData.resources.map(file => file.name);
        // const filesToDelete = existingFileNames.filter(fileName => !newFileNames.includes(fileName));
  
        // // Delete files from S3 and database
        // const deletePromises = filesToDelete.map(async (fileName) => {
        //   await api.delete(`${BASE_URL}/files/${createdProgramId}/${fileName}`);
        // });
        // await Promise.all(deletePromises);
  
        // // Upload new files
        // const uploadPromises = newFiles.map(async (file) => {
        //   const formData = new FormData();
        //   formData.append('file', file);
        //   formData.append('fileName', file.name);
        //   formData.append('fileSize', file.size);
        //   formData.append('UploadedBy', 'User123'); // Replace with actual user ID or name
        //   formData.append('TrainingProgram', trainingProgramName); // Use the extracted training program name
        //   formData.append('createdDate', new Date().toISOString());
        //   formData.append('programId', createdProgramId); // Include the created program ID
        //   console.log("fd", formData);
        //   const uploadResponse = await api.post(`${BASE_URL}/upload`, formData, {
        //     headers: {
        //       'Content-Type': 'multipart/form-data',
        //     },
        //   });
  
        //   if (!uploadResponse.data.success) {
        //     throw new Error('Failed to upload file');
        //   }
  
        //   return {
        //     name: file.name,
        //     url: uploadResponse.data.fileUrl,
        //     size: file.size,
        //     uploadedBy: 'User123', // Replace with actual user ID or name
        //     trainingProgram: trainingProgramName, // Use the extracted training program name
        //     createdDate: new Date().toISOString(),
        //     programId: createdProgramId, // Include the created program ID
        //   };
        // });
  
        // const uploadedFiles = await Promise.all(uploadPromises);
  
        // Combine existing files with newly uploaded files
        // const allFiles = [...existingFiles, ...uploadedFiles];
  
        // Optionally, you can update the training program with the uploaded file details
        // if (programId) {
        //   await updateTrainingProgram(programId, { ...formData, resources: allFiles });
        // }
  
        navigate("/trainings");

      } else {
        message.error("Failed to save the training program. Please try again.");
      }
    } catch (error) {
      message.error("Failed to save the training program. Please try again.");
      console.error("Error saving training program:", error);
    }
  };

  const steps = [
    {
      title: "General Info",
      content: <GeneralInfo formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Training Plan",
      content: <TrainingPlan formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Duration",
      content: <Duration formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Resources",
      content: <AdditionalResources formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Preview & Submit",
      content: (
        <div style={{ padding: "20px 0" }}>
          <Card title="Preview Your Training Program">
            <ViewTrainingProgram selectedProgram={formData} />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Steps current={currentStep}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <div style={{ margin: "24px 0" }}>
        {steps[currentStep].content}
      </div>

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

export default CreateTrainingProgram;
