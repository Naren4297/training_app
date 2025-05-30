import React, { useEffect, useState } from "react";
import { Card, Flex, Progress, Space, Typography, Button, Divider, Collapse} from "antd";
import AssignedBatches from "./AssignedBatches";
import TopicsAndTrainers from "./TopicsAndTrainers";
import { useLocation } from "react-router-dom";
import AdditionalResources from "../../TrainingPrograms/CreateTrainingPrograms/AdditionalResources";
import { useAppContext } from "../../../../utils/ApplicationContext";
import { uploadTrainingResources } from "../../../Trainees/materialsUpload";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const ViewTrainingAssignmentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = useAppContext();
  const [progress, setProgress] = useState(0);
  const [assignmentDetails, setAssignmentDetails] = useState(location.state?.assignmentDetails);

  useEffect(()=>{
    const calculateProgress = () => {
      const completedCount = assignmentDetails.topics.reduce((acc,topic)=>acc+(topic.subtopics.reduce((acc2,sTopic)=>sTopic.completed?acc2+1:acc2,0)),0);
      const totalCount = assignmentDetails.topics.reduce((acc,topic)=>acc+topic.subtopics.length, 0);

      setProgress((completedCount/totalCount)*100);
    }
    calculateProgress();
  },[])
  console.log(assignmentDetails);
  if (!assignmentDetails) {
    return <Title level={4}>No assignment details available.</Title>;
  }

  const handleSaveResources = async () => {
    if(assignmentDetails?.resources&&assignmentDetails?.isChanged){
      const resources = await uploadTrainingResources(assignmentDetails.program_id, assignmentDetails.program_name, assignmentDetails.resources, false);
      console.log(resources);
      setAssignmentDetails({...assignmentDetails, resources:resources, isChanged:false});
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header Section */}
      <Card className="mb-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>{assignmentDetails.program_name}</h2>
      <Text style={{ fontSize: "16px", color: "#1890ff" }}>
          Level: {assignmentDetails.assignment_level}
        </Text>
    </div>
        <Progress percent={progress.toFixed(0)}/>
      </Card>

      {/* Assigned Batches */}
      <AssignedBatches batchNames={assignmentDetails.batch_names} />

      {/* Topics and Assigned Trainers */}
      <TopicsAndTrainers topics={assignmentDetails.topics} setProgress={setProgress} />

      {userDetails.state.modelName!=='trainee'&& (
        <Collapse>
        <Panel header={<Text strong>Additional Resources</Text>}>
        
        <AdditionalResources 
            formData={assignmentDetails} 
            setFormData={setAssignmentDetails} 
          />
          <Divider></Divider>
        <Flex justify="flex-end">
        <Button type="primary" onClick={handleSaveResources}> 
          Save Resources
        </Button>
        </Flex>
        </Panel>
       
        </Collapse>
      ) }
    </div>
  );
};

export default ViewTrainingAssignmentDetails;
