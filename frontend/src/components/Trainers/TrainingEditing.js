import React, { useState } from 'react';
import { Form, Input, Button, List, Select } from 'antd';

const { Option } = Select;

const TrainingEditing = ({ training, onSave }) => {
  const [trainingName, setTrainingName] = useState(training.training_name);
  const [description, setDescription] = useState(training.description);
  const [subtopics, setSubtopics] = useState(training.subtopics || []);

  const handleSubtopicChange = (id, key, value) => {
    setSubtopics(subtopics.map(subtopic => 
      subtopic.id === id ? { ...subtopic, [key]: value } : subtopic
    ));
  };

  const handleAddSubtopic = () => {
    const newSubtopic = { id: Date.now(), description: '', status: 'Ongoing' };
    setSubtopics([...subtopics, newSubtopic]);
  };

  const handleDeleteSubtopic = (id) => {
    setSubtopics(subtopics.filter(subtopic => subtopic.id !== id));
  };

  const handleSave = () => {
    onSave({ ...training, training_name: trainingName, description, subtopics });
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Training Name">
        <Input value={trainingName} onChange={(e) => setTrainingName(e.target.value)} />
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Form.Item>
      <List
        itemLayout="horizontal"
        dataSource={subtopics}
        renderItem={subtopic => (
          <List.Item
            actions={[
              <Button onClick={() => handleDeleteSubtopic(subtopic.id)}>Delete</Button>
            ]}
          >
            <Form.Item label="Subtopic Description">
              <Input 
                value={subtopic.description} 
                onChange={(e) => handleSubtopicChange(subtopic.id, 'description', e.target.value)} 
              />
            </Form.Item>
            <Form.Item label="Status">
              <Select 
                value={subtopic.status} 
                onChange={(value) => handleSubtopicChange(subtopic.id, 'status', value)}
              >
                <Option value="Ongoing">Ongoing</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </List.Item>
        )}
      />
      <Form.Item>
        <Button type="dashed" onClick={handleAddSubtopic}>Add Subtopic</Button>
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSave}>Save</Button>
      </Form.Item>
    </Form>
  );
};

export default TrainingEditing;