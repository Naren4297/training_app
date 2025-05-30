import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Table, Layout, Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../utils/ApplicationContext';

const { Content } = Layout;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AssessmentList = () => {
  const [ongoingAssessments, setOngoingAssessments] = useState([]);
  const [passedAssessments, setPassedAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const appContext = useAppContext();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('http://localhost:5000/api/trainees/assessments', {params:{userName:appContext.state.user.name}});
        const currentDate = new Date();
        const ongoing = response.data.filter(assessment => new Date(assessment.due_date) >= currentDate);
        const passed = response.data.filter(assessment => new Date(assessment.due_date) < currentDate);
        setOngoingAssessments(ongoing);
        setPassedAssessments(passed);
      } catch (error) {
        console.error('Error fetching assessments:', error);
      }
    };

    fetchAssessments();
  }, []);

  const showModal = (assessmentId) => {
    setSelectedAssessmentId(assessmentId);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setIsModalOpen(false);
    try {
      await api.post('http://localhost:5000/api/trainees/start-assessment', { assessmentId: selectedAssessmentId, username: 'Trainee' });
      navigate(`/assessment/${selectedAssessmentId}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      navigate(`/assessment/${selectedAssessmentId}`);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => showModal(record.id)}>
          Start Assessment
        </Button>
      ),
    },
  ];

  const passedColumns = [
    ...columns.slice(0, -1),
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" disabled>
          Start Assessment
        </Button>
      ),
    },
  ];

  return (
    <>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <h2>Ongoing Assessments</h2>
            <Table dataSource={ongoingAssessments} columns={columns} rowKey="id" />
            <h2>Due Date Passed</h2>
            <Table dataSource={passedAssessments} columns={passedColumns} rowKey="id" />
          </Content>
      <Modal
        title="Assessment Instructions"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>Please read the following instructions carefully before starting the assessment:</p>
        <ul>
          <li>Ensure you have a stable internet connection.</li>
          <li>Do not refresh the page during the assessment.</li>
          <li>Complete the assessment within the given time limit.</li>
          <li>Click "Yes" to start the assessment.</li>
        </ul>
      </Modal>
      </>
  );
};

export default AssessmentList;