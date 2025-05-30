import React from "react";
import { Collapse, Card, Switch } from "antd";
const { Panel } = Collapse;

function TrainingPlanProgress({ progressData, setProgressData }) {
  
  // Handle switch toggle for completion
  const handleStatusChange = (mainIndex, subIndex, checked) => {
    const updatedPlan = [...progressData.trainingPlan.mainTopics];
    // Update completion
    updatedPlan[mainIndex].subTopics[subIndex] = {
      ...updatedPlan[mainIndex].subTopics[subIndex],
      completed: checked
    };
    setProgressData({
      ...progressData,
      trainingPlan: { mainTopics: updatedPlan }
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Collapse accordion>
        {progressData.trainingPlan.mainTopics.map((topic, mainIndex) => (
          <Panel header={topic.name} key={mainIndex}>
            {topic.subTopics.map((subTopic, subIndex) => (
              <Card
                key={subIndex}
                size="small"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginRight: "16px",
                  }}
                >
                  {subTopic.name}
                </span>
                <Switch
                  checked={subTopic.completed || subTopic.status === "Completed"}
                  onChange={(checked) => handleStatusChange(mainIndex, subIndex, checked)}
                  checkedChildren="Completed"
                  unCheckedChildren="Not Completed"
                  className="animated-switch"
                />
              </Card>
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}

export default TrainingPlanProgress;