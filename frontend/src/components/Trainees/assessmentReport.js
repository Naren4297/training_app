import React, { useRef, useState, useEffect } from 'react';
import { Layout, Form, Select, Button, message, Card, Breadcrumb, Collapse, Input } from 'antd';
import Gauge from 'react-gauge-component';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { useAppContext } from '../../utils/ApplicationContext';

const { Option } = Select;
const { Panel } = Collapse;
const batchName  = 'Feb batch';
const userName = null; // Replace with actual user name if available
const baseUrl = process.env.REACT_APP_BASE_URL;

const KpiCard = ({ marks, totalMarks, pass }) => {

  const percentage = (marks / totalMarks) * 100;

  return (
    <Card
      style={{
        backgroundColor:'white',
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '16px',
        width: '250px',
        height: '250px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h3 style={{ margin: 0 }}>Score: {marks}/{totalMarks}</h3>
      <Gauge
        arc={{
          subArcs: [
            {
              limit: 20,
              color: '#EA4228',
              showTick: true
            },
            {
              limit: 40,
              color: '#F58B19',
              showTick: true
            },
            {
              limit: 60,
              color: '#F5CD19',
              showTick: true
            },
            {
              limit: 100,
              color: '#5BE12C',
              showTick: true
            },
          ]
        }}
        labels={{
          valueLabel: {
            matchColorWithArc: false,
            formatTextValue: (value) => `${value}%`,
            style: { fontSize: "25px", fill: "#000000"}, // Black color for the value label
            maxDecimalDigits: 2,
            hide: false
          },
          tickLabels: {
            type: "outer",
            hideMinMax: false,
            ticks: [
              { value: 0 },
              { value: 50 },
              { value: 100 }
            ],
            defaultTickValueConfig: {
              formatTextValue: (value) => `${value}`,
              style: { fontSize: "10px", fill: "#464A4F" },
              maxDecimalDigits: 2,
              hide: false
            },
            defaultTickLineConfig: {
              width: 1,
              length: 7,
              color: "rgb(173 172 171)",
              distanceFromArc: 3,
              hide: false
            }
          }
        }}
        value={percentage}
        width={150}
        height={100}
        label="Percentage"
        color={
          percentage < 50 ? '#FF0000' : // Red for less than 50%
          percentage < 75 ? '#FFFF00' : // Yellow for 50% to 74%
          '#00FF00' // Green for 75% and above
        }
      />
      <p style={{ margin: 0 }}>{pass ? 'Pass' : 'Fail'}</p>
    </Card>
  );
};

const AssessmentReport = () => {
  const userDetails = useAppContext();
  const formRef = useRef(null);
  const [selectedAssessment, setSelectedAssessment] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const params = {};
        if (batchName) {
          params.assignToBatch = batchName;
        }
        if (userName) {
          params.assignToUser = userName;
        }

        // const response = await api.get(`${baseUrl}api/coordinator/get-assessment-report`, { params });
        const response = await api.get(`${baseUrl}api/coordinator/get-assessments`);
        setAssessments(response.data);
      } catch (error) {
        message.error('Failed to load assessments');
      }
    };

    fetchAssessments();
  }, []);

  const handleViewReport = async () => {
    if (selectedAssessment) {
      try {
        // const response = await api.get('http://localhost:5000/api/trainees/get-assessmentReportTrainee', {
        //   params: {
        //     assessmentName: selectedAssessment,
        //   }
        // });

        const response = await api.get('http://localhost:5000/api/trainees/get-consolidated-report', {
          params: {
            assessmentId: selectedAssessment,
          }
        });
        console.log(response);
        setReportData(response.data);
        setReportVisible(true);
        response.status===200?message.success('Report loaded successfully'):response.status===204?message.info("Assessment is Queued for Evaluation."):response.status===404?message.error(response.data.error):message.error("Failed to Load Assessment Report.");
      } catch (error) {
        message.error('Failed to load report');
      }
    } else {
      message.error('Please select an assessment');
    }
  };

  const renderAnswers = (question) => (
    <div>
      <p><strong>Options:</strong></p>
      {question?.options?.map((option, index) => {
        const isSelected = option.isSelected;
        const isCorrect = option.isAnswer;
        const inputStyle = {
          borderColor: isCorrect ? 'green' : isSelected ? 'red' : 'black',
          borderWidth: '2px',
          borderStyle: 'solid',
          marginBottom: '8px',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        };

        return (
          <div key={option.option} style={inputStyle}>
            {question.questionType === 'single' ? (
              <input type="radio" checked={isSelected} readOnly />
            ) : (
              <input type="checkbox" checked={isSelected} readOnly />
            )}
            <Input value={option.option} readOnly style={{ marginLeft: '8px' }} />
          </div>
        );
      })}
      <p><strong>Your Answer:</strong> <span style={{ color: question?.options?.some(option => option.isSelected && option.isAnswer) ? 'green' : 'red' }}>
        {question?.options?.filter(option => option.isSelected)?.map(option => option.option)?.join(', ') || question.answer}
      </span></p>
      <p><strong>Correct Answer:</strong> <span style={{ color: 'green' }}>
        {question?.options?.filter(option => option.isAnswer)?.map(option => option.option)?.join(', ') || question.actualAnswer}
      </span></p>
      {question.comments && <p><strong>Comments:</strong> {question.comments}</p>}
    </div>
  );

  // const isQuestionCorrect = (question) => {
  //   const selectedAnswers = question.options.filter(option => option.isSelected).map(option => option.option).sort();
  //   const correctAnswers = question.options.filter(option => option.isAnswer).map(option => option.option).sort();
  //   return JSON.stringify(selectedAnswers) === JSON.stringify(correctAnswers);
  // };

  return (
    
          <div
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <h1>Assessment Report</h1>
            <Form ref={formRef}>
              <Form.Item label="Select Assessment">
                <Select
                  showSearch
                  placeholder="Select an assessment"
                  optionFilterProp="children"
                  onChange={(value) =>{
                     setSelectedAssessment(value);}}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {assessments.map((assessment) => (
                    <Option key={assessment.id} value={assessment.id}>
                      {assessment.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleViewReport}>
                  View Report
                </Button>
              </Form.Item>
            </Form>
            {reportVisible && reportData && (
              <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <KpiCard marks={reportData.marks} totalMarks={reportData.totalMarks} pass={reportData.pass} />
                  <Card title="Trainer Feedback" style={{ flex: 1 }}>
                    <p>{reportData.feedback}</p>
                  </Card>
                </div>
                <Card title="Detailed Assessment Results">
                  <Collapse accordion>
                    {reportData.answerKey.map((question, index) => (
                      <Panel
                        key={index}
                        header={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {question.question}
                            {question.isApproved ? (
                              <CheckCircleOutlined style={{ color: 'green', marginLeft: 'auto' }} />
                            ) : (
                              <CloseCircleOutlined style={{ color: 'red', marginLeft: 'auto' }} />
                            )}
                          </div>
                        }
                      >
                        {renderAnswers(question)}
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              </div>
            )}
          </div>
        
  );
};

export default AssessmentReport;