import React, { useRef } from "react";
import { Card, Collapse, List, Space, Typography, Tag, Switch, Flex , Button, Divider, message} from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";
import { useAppContext } from "../../../../utils/ApplicationContext";
import { submitTrainingProgress } from "../../../../configs/coordinator_api_config";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

function TopicsAndTrainers({topics, setProgress}) {

  const isChanged = useRef(false);
  const userDetails = useAppContext();
  const navigate = useNavigate();

  function handleStatusChange(index,subIndex,checked){
    topics[index].subtopics[subIndex].completed = checked;
    const completedCount = topics.reduce((acc,topic)=>acc+(topic.subtopics.reduce((acc2,sTopic)=>sTopic.completed?acc2+1:acc2,0)),0);
    const totalCount = topics.reduce((acc,topic)=>acc+topic.subtopics.length, 0);
    
    isChanged.current = true;
    setProgress((completedCount/totalCount)*100);
  }

  function isDisabled(trainerName){
    return userDetails.state.modelName==='trainee'? true:trainerName&&trainerName===userDetails.state.user.name?false:true; 
  }

  const requestBody = {
    trainingPlan:{
    mainTopics:[...topics],
  }
  }

  const handleSave = async () => {
    if(isChanged.current){
      console.log("Submitting");
      message.loading("Submitting progress...");
      try {
        console.log(requestBody);
        const response = await submitTrainingProgress(requestBody);
        console.log(response);
        if (response.status === 200) {
          message.success("Training progress submitted successfully!");
          navigate("/view-trainingassignments");
        } else {
          message.error(response.message || "Failed to submit progress.");
        }
      } catch (error) {
        message.error("Submission failed. Please try again.");
        console.error("Error submitting training progress:", error);
      }
    }
  };

  return (
    <Card 
      title={
        <>
          <BookOutlined /> Topics & Assigned Trainers
        </>
      }
      className="mb-6"
    >
      <Collapse>
        {topics && topics.length > 0 ? (
          topics.map((topic, index) => (
            <Panel 
              header={
                <Space direction="vertical">
                  <Text strong>{topic.topic_name}</Text>
                  <Text type="secondary">{topic.topic_description}</Text>
                </Space>
              } 
              key={index}
            >
              <List
                dataSource={topic.subtopics}
                renderItem={(subTopic,subIndex) => (
                  <Card 
                    size="small" 
                    style={{ borderLeft: "5px solid #1890ff", marginBottom: 8 }}
                  >
                    {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
                      <Flex justify="flex-start" align="flex-start">
                      <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>
                        {subTopic.subtopic_name}
                      </Text>
                      <Text type="secondary">{subTopic.subtopic_description}</Text>
                      <Tag color="green">
                        <UserOutlined /> {subTopic.trainer.name} - {subTopic.trainer.email}
                      </Tag>
                    </Space>
                    

                    <Switch
                  disabled={isDisabled(subTopic.trainer.name)}
                  checked={subTopic.completed}
                  onChange={(checked) => handleStatusChange(index,subIndex,checked)}
                  checkedChildren="Completed"
                  unCheckedChildren="Pending"
                  className="animated-switch"
                />
                      </Flex>
                    {/* </div> */}
                  </Card>
                )}
              />
            </Panel>
          ))
        ) : (
          <Text>No topics available</Text>
        )}
      </Collapse>
      {userDetails.state.modelName!=='trainee' &&(
        <>
        <Divider></Divider>
      
        <Flex justify="flex-end">
        <Button type="primary" onClick={handleSave}> 
          Save
        </Button>
        </Flex>
        </>
      )
      }
    </Card>
  );
}

export default TopicsAndTrainers;
