import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Card, message, DatePicker, Select, Row, Col, Table } from 'antd';
import api from "../../utils/api"
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Option } = Select;
const { Content } = Layout;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AssessmentMetrics = () => {
  const [selectedProgramId, setSelectedProgramId] = useState('ALL'); // Set default to 'ALL'
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('ALL'); // Set default to 'ALL'
  const [selectedAssessmentProgramId, setSelectedAssessmentProgramId] = useState([]); // Store assessments
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [globalData, setGlobalData] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    totalTrainees: 0,
    totalBatches: 0,
  });
  const [assessmentData, setAssessmentData] = useState({
    completed: 0,
    notCompleted: 0,
    pass: 0,
    fail: 0,
    averageMarks: 0,
    topScorers: [],
    leastScorers: [],
  });
  const [localFilters, setLocalFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Fetch training programs data
    const fetchTrainingPrograms = async () => {
      try {
        const response = await api.get(`${baseUrl}api/coordinator/training-programs-assessment`);
        const programs = response.data.data.programs.map(program => ({
          key: program.generalInfo.trainingprogram_id,
          value: program.generalInfo.title
        }));
        // Store the full program data for later use
        setProgramData(response.data.data.programs);
        // Add "ALL" option to the training programs and set it as selected
        setTrainingPrograms([{ key: 'ALL', value: 'ALL' }, ...programs]);
      } catch (error) {
        message.error('Error fetching training programs');
        console.error('Error fetching training programs:', error);
      }
    };

    fetchTrainingPrograms();
  }, []);

  useEffect(() => {
    // Update assessments when training programs are fetched or selectedProgramId changes
    if (programData.length > 0) {
      handleTrainingProgramChange('ALL');
    }
  }, [programData]);

  const handleFilterChange = (changedValues) => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      ...changedValues,
    }));
  };

  const handleTrainingProgramChange = (value) => {
    setSelectedProgramId(value);
    let assessments = [];
    // Assessments:
    if (value === 'ALL') {
      // If "ALL" is selected, combine assessments from all programs
      programData.forEach(program => {
        assessments = assessments.concat(program.assessment);
      });
    } else {
      // Find the selected program and get its assessments
      const selectedProgram = programData.find(program => program.generalInfo.trainingprogram_id === value);
      if (selectedProgram) {
        assessments = selectedProgram.assessment;
      } else {
        console.error('Selected program not found');
        message.error('Selected program not found');
        return;
      }
    }
    setGlobalData(prevData => ({
      ...prevData,
      totalAssessments: assessments.length,
    }));

    // Calculate total trainees based on assignToUser field
    let trainees = new Set();
    assessments.forEach(assessment => {
      if (assessment.assignToUser) {
        JSON.parse(assessment.assignToUser).forEach(user => trainees.add(user));
      }
    });
    setGlobalData(prevData => ({
      ...prevData,
      totalTrainees: trainees.size,
    }));

    // Calculate total batches based on assignToBatch field
    let batches = new Set();
    assessments.forEach(assessment => {
      if (assessment.assignToBatch) {
        JSON.parse(assessment.assignToBatch).forEach(batch => batches.add(batch));
      }
    });
    setGlobalData(prevData => ({
      ...prevData,
      totalBatches: batches.size,
    }));

    // Clear the assessment select list
    setSelectedAssessmentId('ALL');
    setSelectedAssessmentProgramId([{ id: 'ALL', title: 'ALL' }, ...assessments]); // Add "ALL" option to assessments

    // Update assessment data
    updateAssessmentData(assessments);
  };

  const handleAssessmentChange = (value) => {
    setSelectedAssessmentId(value);
    let assessments = [];
    if (value === 'ALL') {
      // If "ALL" is selected, combine assessments from all programs
      programData.forEach(program => {
        assessments = assessments.concat(program.assessment);
      });
    } else {
      // Find the selected assessment
      programData.forEach(program => {
        const assessment = program.assessment.find(assessment => assessment.id === value);
        if (assessment) {
          assessments.push(assessment);
        }
      });
    }
    // Update assessment data
    updateAssessmentData(assessments);
  };

  const updateAssessmentData = (assessments) => {
    let completed = 0;
    let notCompleted = 0;
    let pass = 0;
    let fail = 0;
    let totalMarks = 0;
    let totalReports = 0;
    let topScorers = [];
    let leastScorers = [];

    assessments.forEach(assessment => {
      assessment.assessmentsAssignments.forEach(assignment => {
        if (assignment.status === 'Completed') {
          completed++;
        } else {
          notCompleted++;
        }
      });

      assessment.assessmentsAssignments.forEach(assignment => {
        assignment.assessmentsReports.forEach(report => {
          if (report.pass) {
            pass++;
          } else {
            fail++;
          }
          totalMarks += report.marks || 0;
          totalReports++;
        });
      });

      assessment.assessmentsAssignments.forEach(assignment => {
        assignment.assessmentsReports.forEach(report => {
          topScorers.push({ name: report.traineeNam, marks: report.marks });
          leastScorers.push({ name: report.traineeNam, marks: report.marks });
        });
      });
    });

    topScorers.sort((a, b) => b.marks - a.marks);
    leastScorers.sort((a, b) => a.marks - b.marks);

    setAssessmentData({
      completed,
      notCompleted,
      pass,
      fail,
      averageMarks: totalReports ? totalMarks / totalReports : 0,
      topScorers: topScorers.slice(0, 3),
      leastScorers: leastScorers.slice(0, 3),
    });
  };

  const pieConfigCompleted = {
    appendPadding: 10,
    data: [
      { type: 'Completed', value: assessmentData.completed },
      { type: 'Not Completed', value: assessmentData.notCompleted },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
  };

  const pieConfigPass = {
    appendPadding: 10,
    data: [
      { type: 'Pass', value: assessmentData.pass },
      { type: 'Fail', value: assessmentData.fail },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
  ];


  return (
    <Layout style={{ padding: '24px', minHeight: '100vh' }}>
      <Content>
        <Col span={24}>
          <Form.Item
            name="trainingProgram"
            label="Training Program"
            rules={[{ required: true, message: 'Please select a training program!' }]}
          >
            <Select
              placeholder="Select a training program"
              onChange={handleTrainingProgramChange}
              value={selectedProgramId} // Control the value of the Select component
            >
              {trainingPrograms.map(program => (
                <Option key={program.key} value={program.key}>
                  {program.value}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card title="Total Assessments" variant="outlined">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{globalData.totalAssessments}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Trainees's count" variant="outlined">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{globalData.totalTrainees}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Batch's count" variant="outlined">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{globalData.totalBatches}</div>
            </Card>
          </Col>
        </Row>
        <Card title="Local Filters" style={{ marginBottom: '24px' }}>
          <Form layout="vertical" onValuesChange={handleFilterChange}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="assessment" label="Assessment">
                  <Select
                    placeholder="Select an assessment"
                    onChange={handleAssessmentChange}
                    value={selectedAssessmentId} // Control the value of the Select component
                  >
                    {selectedAssessmentProgramId.map(assessment => (
                      <Option key={assessment.id} value={assessment.id}>
                        {assessment.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card title="Assessment Completed %" variant="outlined">
              <Pie
                data={{
                  labels: ['Completed', 'Not Completed'],
                  datasets: [
                    {
                      data: [assessmentData.completed, assessmentData.notCompleted],
                      backgroundColor: ['#36A2EB', '#FF6384'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                          const percentage = ((value / total) * 100).toFixed(2);
                          return `${label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Assessment Pass %" variant="outlined">
              <Pie
                data={{
                  labels: ['Pass', 'Fail'],
                  datasets: [
                    {
                      data: [assessmentData.pass, assessmentData.fail],
                      backgroundColor: ['#4BC0C0', '#FF9F40'],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                          const percentage = ((value / total) * 100).toFixed(2);
                          return `${label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Average Marks" variant="outlined">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assessmentData.averageMarks.toFixed(2)}</div>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Card title="Top 3 Scorers" variant="outlined">
              <Table dataSource={assessmentData.topScorers} columns={columns} pagination={false} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Least 3 Scorers" variant="outlined">
              <Table dataSource={assessmentData.leastScorers} columns={columns} pagination={false} />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

  export default AssessmentMetrics;