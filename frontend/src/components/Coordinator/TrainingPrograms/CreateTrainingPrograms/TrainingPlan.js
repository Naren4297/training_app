import React, { useRef, useState } from "react";
import { Form, Input, Button, Collapse } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

function TrainingPlan({ formData, setFormData }) {
  const [activePanel, setActivePanel] = useState([]); // To track expanded panels

  // Refs to track input fields for focusing
  const mainTopicRefs = useRef([]);
  const subTopicRefs = useRef({});

  const handleAddMainTopic = () => {
    const updatedPlan = [
      ...(formData.trainingPlan?.mainTopics || []),
      { name: "", subTopics: [] },
    ];

    setFormData({
      ...formData,
      trainingPlan: { ...formData.trainingPlan, mainTopics: updatedPlan },
    });

    setActivePanel([updatedPlan.length - 1]); // Automatically expand the new main topic

    // Ensure a new ref exists for the new main topic and focus it
    setTimeout(() => {
      mainTopicRefs.current[updatedPlan.length - 1]?.focus();
    }, 0);
  };

  const handleMainTopicChange = (index, value) => {
    const updatedPlan = [...(formData.trainingPlan?.mainTopics || [])];
    updatedPlan[index].name = value;
    setFormData({
      ...formData,
      trainingPlan: { ...formData.trainingPlan, mainTopics: updatedPlan },
    });
  };

  const handleAddSubTopic = (mainIndex) => {
    const updatedPlan = [...(formData.trainingPlan?.mainTopics || [])];
    updatedPlan[mainIndex].subTopics.push({
      name: "", // Initialize subtopic name
      assignedUsers: [],
      agenda: "",
    });

    setFormData({
      ...formData,
      trainingPlan: { ...formData.trainingPlan, mainTopics: updatedPlan },
    });

    setActivePanel([mainIndex]); // Keep the main topic expanded

    // Ensure a new ref exists for the sub-topic and focus it
    setTimeout(() => {
      const subTopicIndex = updatedPlan[mainIndex].subTopics.length - 1;
      if (!subTopicRefs.current[mainIndex]) {
        subTopicRefs.current[mainIndex] = [];
      }
      subTopicRefs.current[mainIndex][subTopicIndex]?.focus();
    }, 0);
  };

  const handleSubTopicChange = (mainIndex, subIndex, key, value) => {
    const updatedPlan = [...(formData.trainingPlan?.mainTopics || [])];
    updatedPlan[mainIndex].subTopics[subIndex][key] = value;
    setFormData({
      ...formData,
      trainingPlan: { ...formData.trainingPlan, mainTopics: updatedPlan },
    });
  };

  const togglePanel = (key) => {
    setActivePanel(key);
  };

  return (
    <Form layout="vertical">
      <h3>Main Topics</h3>
      <Collapse
        accordion
        activeKey={activePanel}
        onChange={(key) => togglePanel(key)}
      >
        {formData.trainingPlan?.mainTopics?.map((topic, index) => (
          <Panel
            header={topic.name || `Untitled Main Topic ${index + 1}`}
            key={index}
          >
            <Form.Item label="Main Topic Title">
              <Input
                ref={(el) => (mainTopicRefs.current[index] = el)}
                value={topic.name}
                onChange={(e) => handleMainTopicChange(index, e.target.value)}
                placeholder="Enter main topic title"
              />
            </Form.Item>
            <h4>Subtopics</h4>
            {topic.subTopics.map((subTopic, subIndex) => (
              <div key={subIndex}>
                <Form.Item label={`Subtopic ${subIndex + 1} Title`}>
                  <Input
                    ref={(el) => {
                      if (!subTopicRefs.current[index]) {
                        subTopicRefs.current[index] = [];
                      }
                      subTopicRefs.current[index][subIndex] = el;
                    }}
                    value={subTopic.name}
                    onChange={(e) =>
                      handleSubTopicChange(index, subIndex, "name", e.target.value)
                    }
                    placeholder="Enter sub-topic title"
                  />
                </Form.Item>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => handleAddSubTopic(index)}
              icon={<PlusOutlined />}
            >
              Add Subtopic
            </Button>
          </Panel>
        ))}
      </Collapse>
      <Button
        type="dashed"
        onClick={handleAddMainTopic}
        icon={<PlusOutlined />}
        style={{ marginTop: "20px" }}
      >
        Add Main Topic
      </Button>

      <h3>Mock Project</h3>
      <Form.Item label="Project Name">
        <Input
          value={formData.trainingPlan?.mockProject?.name || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              trainingPlan: {
                ...formData.trainingPlan,
                mockProject: {
                  ...formData.trainingPlan?.mockProject,
                  name: e.target.value,
                },
              },
            })
          }
        />
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea
          rows={4}
          value={formData.trainingPlan?.mockProject?.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              trainingPlan: {
                ...formData.trainingPlan,
                mockProject: {
                  ...formData.trainingPlan?.mockProject,
                  description: e.target.value,
                },
              },
            })
          }
        />
      </Form.Item>
    </Form>
  );
}

export default TrainingPlan;
