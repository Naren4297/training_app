import React, { useState, useEffect } from 'react';
import {  Button, Card, Collapse, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
const { Panel } = Collapse;
const { confirm } = Modal;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const navigate = useNavigate();
  let assessmentMap = [];

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get(`${baseUrl}api/coordinator/get-assessments`);
        console.log(response); 
        setAssessments(response.data);
      } catch (error) {
        message.error('Error fetching assessments');
        console.error('Error:', error);
      }
    };

    fetchAssessments();
  }, []);

  assessments.forEach(assessment=>{
    const programName = assessment.assessments.title;
    console.log(assessment);
    console.log(programName);
    console.log(assessmentMap[programName]);
    assessmentMap[programName]&&!(assessmentMap[programName].includes(assessment))?assessmentMap[programName].push(assessment):assessmentMap[programName]=[assessment];
});   

  const handleEdit = (id) => {
    navigate(`/modifyAssessment/${id}`);
  };

 

const handleDelete = async (id) => {
  confirm({
    title: 'Are you sure you want to delete this assessment?',
    content: 'This action cannot be undone.',
    onOk: async () => {
      try {
        await api.delete(`${baseUrl}api/coordinator/delete-assessment/${id}`);
        setAssessments(assessments.filter(assessment => assessment.id !== id));
        message.success('Assessment deleted successfully');
      } catch (error) {
        message.error('Error deleting assessment');
        console.error('Error:', error);
      }
    },
    onCancel() {
      message.success('Delete action cancelled');
    },
  });
};

  return (
    
          <div
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Assessment Management</h1>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create-assessment')}>
                Create Assessment
              </Button>
            </div>
            <Collapse accordion>
            {Object.entries(assessmentMap).map(([key,value])=>(
                           <Panel header={key} key={key}>
                            {value.map(assessment=> (
                              <Collapse accordion>
                              <Panel header={assessment.title} key={assessment.id} extra={
                                <div>
                                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(assessment.id)} />
                                  <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(assessment.id)} />
                                </div>
                              }>
                                <Card>
                                  <p><strong>Description:</strong> {assessment.description}</p>
                                  <p><strong>Due Date:</strong> {assessment.due_date}</p>
                                  <p><strong>Duration:</strong> {assessment.duration}</p>
                                  <p><strong>Customize:</strong> {assessment.customize ? 'Yes' : 'No'}</p>
                                  {assessment.customize && (
                                    <>
                                      <p><strong>Single Choice Questions:</strong> {assessment.singleChoiceCount}</p>
                                      <p><strong>Multiple Select Questions:</strong> {assessment.multiSelectCount}</p>
                                      <p><strong>Code Box Questions:</strong> {assessment.codeBoxCount}</p>
                                      <p><strong>Descriptive Questions:</strong> {assessment.descriptiveCount}</p>
                                      <p><strong>Shuffle Questions:</strong> {assessment.shuffle ? 'Yes' : 'No'}</p>
                                    </>
                                  )}
                                </Card>
                              </Panel>
                              </Collapse>
                            ))}
                           </Panel>
            )
            )}
              {/* {assessmentMap.map(assessment => (
                <Panel header={assessment.assessments.title} key={assessment.assessments.title}>
                <Panel header={assessment.title} key={assessment.id} extra={
                  <div>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(assessment.id)} />
                    <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(assessment.id)} />
                  </div>
                }>
                  <Card>
                    <p><strong>Description:</strong> {assessment.description}</p>
                    <p><strong>Due Date:</strong> {assessment.due_date}</p>
                    <p><strong>Duration:</strong> {assessment.duration}</p>
                    <p><strong>Customize:</strong> {assessment.customize ? 'Yes' : 'No'}</p>
                    {assessment.customize && (
                      <>
                        <p><strong>Single Choice Questions:</strong> {assessment.singleChoiceCount}</p>
                        <p><strong>Multiple Select Questions:</strong> {assessment.multiSelectCount}</p>
                        <p><strong>Code Box Questions:</strong> {assessment.codeBoxCount}</p>
                        <p><strong>Descriptive Questions:</strong> {assessment.descriptiveCount}</p>
                        <p><strong>Shuffle Questions:</strong> {assessment.shuffle ? 'Yes' : 'No'}</p>
                      </>
                    )}
                  </Card>
                </Panel>
                </Panel>
              ))} */}
            </Collapse>
          </div>
          
  );
};

export default AssessmentManagement;