import React, { useState, useEffect } from "react";
import { Button, Select, List, Collapse, message } from "antd";
import { getTrainingProgramByID } from "../../../configs/coordinator_api_config";

const { Option } = Select;
const { Panel } = Collapse;

function AssignTrainers({ selectedProgram, onNext }) {
  const [topics, setTopics] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState({});

  if(selectedProgram != undefined){
    setTopics(selectedProgram.mainTopics);
  }
//   useEffect(() => {
//     const fetchProgramDetails = async () => {
//       try {
//         
//         const response = await getTrainingProgramByID(selectedProgram.generalInfo.trainingprogram_id);
//         if (response.success) {
//           setTopics(response.data.trainingPlan.mainTopics);
//         } else {
//           message.error("Failed to load training program details.");
//         }
//       } catch (error) {
//         message.error("Error fetching training program details.");
//       }
//     };

//     fetchProgramDetails();
//   }, [selectedProgram]);

  const handleTrainerChange = (topicId, subtopicId, value) => {
    setSelectedTrainers((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [subtopicId]: value,
      },
    }));
  };

  const handleNext = () => {
    // Ensure all topics and subtopics have assigned trainers before proceeding
    const allAssigned = topics.every((topic) =>
      topic.subTopics.every((subtopic) => selectedTrainers[topic.id]?.[subtopic.id])
    );

    if (allAssigned) {
      onNext(selectedTrainers);
    } else {
      message.warning("Please assign trainers to all topics and subtopics.");
    }
  };

  return (
    <div>
      <h3>Assign Trainers</h3>
      <Collapse>
        {topics.map((topic) => (
          <Panel header={topic.name} key={topic.id}>
            <List
              dataSource={topic.subTopics}
              renderItem={(subtopic) => (
                <List.Item>
                  <span>{subtopic.name}</span>
                  <Select
                    placeholder="Select Trainer"
                    onChange={(value) => handleTrainerChange(topic.id, subtopic.id, value)}
                    style={{ width: 200, marginLeft: 10 }}
                  >
                    <Option value="Trainer 1">Trainer 1</Option>
                    <Option value="Trainer 2">Trainer 2</Option>
                  </Select>
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
      <Button type="primary" onClick={handleNext} style={{ marginTop: 20 }}>
        Next
      </Button>
    </div>
  );
}

export default AssignTrainers;