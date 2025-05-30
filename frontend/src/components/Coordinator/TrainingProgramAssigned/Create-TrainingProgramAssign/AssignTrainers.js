import React, { useEffect, useState } from "react";
import { Card, Select, Collapse, message, Row, Col } from "antd";
import { getTrainers } from "../../../../configs/coordinator_api_config";

const { Panel } = Collapse;

const AssignTrainers = ({ formData, setFormData, program }) => {
  const { trainers = [] } = formData;
  const [localTopics, setLocalTopics] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await getTrainers();
        
        const trainers = response.data || [];
        // setTrainerOptions(trainers.map((t) => ({ id: t.id, name: t.name })));
        setTrainerOptions(response.data.map((trainer) => ({
            id: trainer.id,
            name: trainer.name,
          })));
          
      } catch (error) {
        console.error("Error fetching trainers:", error);
        message.error("Failed to fetch trainers");
      }
    };
  
    fetchTrainers(); // Ensure this is called only once
  }, []); // Empty dependency array ensures it runs once
  

  useEffect(() => {
    if (!program?.trainingPlan?.mainTopics?.length) {
      message.info("No topics to assign trainers to.");
      return;
    }
  
    const updatedTopics = program.trainingPlan.mainTopics.map((topic) => {
      const matchedTrainer = formData.trainers.find((t) => t.topicId === topic.id);
      return {
        ...topic,
        subTopics: topic.subTopics.map((subTopic) => {
          const trainerInfo = matchedTrainer?.subTopics.find((st) => st.subTopicId === subTopic.id);
          return {
            ...subTopic,
            trainerId: trainerInfo?.trainerId || null,
            trainerName: trainerInfo?.trainerName || null,
          };
        }),
      };
    });
  
    setLocalTopics(updatedTopics);
  }, [program, trainers, formData.trainers]); // Include formData.trainers as a dependency
  
  

  const handleTrainerChange = (topicId, subTopicId, trainerId) => {
    const trainer = trainerOptions.find((t) => t.id === trainerId);

    const updatedTopics = localTopics.map((topic) => {
      if (topic.id === topicId) {
        const updatedSubTopics = topic.subTopics.map((subTopic) =>
          subTopic.id === subTopicId
            ? { ...subTopic, trainerId, trainerName: trainer?.name }
            : subTopic
        );
        return { ...topic, subTopics: updatedSubTopics };
      }
      return topic;
    });

    setLocalTopics(updatedTopics);

    setFormData((prev) => ({
      ...prev,
      trainers: updatedTopics.map((topic) => ({
        topicId: topic.id,
        topicName: topic.name,
        subTopics: topic.subTopics.map((subTopic) => ({
          subTopicId: subTopic.id,
          subTopicName: subTopic.name,
          trainerId: subTopic.trainerId,
          trainerName: subTopic.trainerName,
        })),
      })),
    }));
  };

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Assign Trainers</h2>
      <Collapse defaultActiveKey={localTopics.map((topic) => topic.id)} bordered={false}>
        {localTopics.map((topic) => (
          <Panel
            header={<strong>{topic.name}</strong>}
            key={topic.id}
            style={{ background: "#f0f2f5", marginBottom: "12px" }}
          >
            <p>{topic.description}</p>
            <Row gutter={[16, 16]}>
              {topic.subTopics.map((subTopic) => (
                <Col span={12} key={subTopic.id}>
                  <Card title={subTopic.name} hoverable>
                    <p>{subTopic.description}</p>
                    <Select
                      placeholder="Select Trainer"
                      style={{ width: "100%" }}
                      value={subTopic.trainerId}
                      onChange={(value) => handleTrainerChange(topic.id, subTopic.id, value)}
                      options={trainerOptions.map((trainer) => ({
                        label: trainer.name,
                        value: trainer.id,
                      }))}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default AssignTrainers;