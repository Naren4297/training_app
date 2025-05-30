import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Form, Input, Button, Card, Breadcrumb, Steps, message, DatePicker, Select, InputNumber, TimePicker, Switch, Radio, Row, Col } from 'antd';
import dayjs from 'dayjs';
import api from "../../utils/api"
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../utils/ApplicationContext';

const { Option } = Select;
const { Content } = Layout;
const { Step } = Steps;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentInfo, setAssessmentInfo] = useState({});
  const [qaInfo, setQaInfo] = useState({});
  const [datasets, setDatasets] = useState([]);
  const [batches, setBatches] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [assignToBatch, setAssignToBatch] = useState(false);
  const [customizeQuestions, setCustomizeQuestions] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [questionSetsCount, setQuestionSetsCount] = useState(1);
  const [topics, setTopics] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([{ topic: '', count: 0, type: '' }]);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [trainers, setTrainers] = useState([]); // New state variable for trainers
  const [trainees, setTrainees] = useState([]); // New state variable for trainees
  const navigate = useNavigate();

  const userDetails = useAppContext();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionAnswersResponse, batchesResponse, trainersResponse, traineesResponse] = await Promise.all([
          api.get(`${baseUrl}api/trainers/get-questionAnswers`),
          api.get(`${baseUrl}api/coordinator/batches`),
          api.get(`${baseUrl}api/coordinator/trainers`), // Fetch trainers
          api.get(`${baseUrl}api/coordinator/trainees`)  // Fetch trainees
        ]);
        const datasetNames = questionAnswersResponse.data.map(item => item.datasetName);
        setDatasets(datasetNames);
        const batchNames = batchesResponse.data.data.map(item => item.name);
        setBatches(batchNames);

        setQuestionsData(questionAnswersResponse.data);

        // Fetch training programs
        const fetchTrainingPrograms = async () => {
          try {
            const response = await api.get(`${baseUrl}api/coordinator/training-programs`,{params:{userName:userDetails.state.user.name}});
            const programs = response.data.data.programs.map(program => ({
              key: program.generalInfo.trainingprogram_id,
              value: program.generalInfo.title
            }));
            setTrainingPrograms(programs);
          } catch (error) {
            message.error('Error fetching training programs');
            console.error('Error fetching training programs:', error);
          }
        };

        fetchTrainingPrograms();

        // Set trainers and trainees
        setTrainers(trainersResponse.data.data);
        setTrainees(traineesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentStep]);

  const handleNext = useCallback(() => setCurrentStep(prevStep => prevStep + 1), []);
  const handlePrevious = useCallback(() => setCurrentStep(prevStep => prevStep - 1), []);
  const handleShuffleChange = (e) => setShuffle(e.target.value);

  const handleSubmit = useCallback(async () => {
    const formattedDuration = dayjs(assessmentInfo.duration).format('HH:mm');

    const topicsDict = customQuestions.reduce((acc, { topic, count, type }) => {
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push({ count, type });
      return acc;
    }, {});

    const payload = {
      ...assessmentInfo,
      duration: formattedDuration,
      ...qaInfo,
      customize: customizeQuestions,
      shuffle: qaInfo.shuffle,
      questionSetsCount,
      topics: topicsDict,
      trainingProgramId: selectedProgramId,
      createdBy: userDetails.state.user.name,
    };

    try {
      const response = await api.post(`${baseUrl}api/coordinator/submit-assessment`, payload);
      message.success('Assessment and QA details saved successfully');
      navigate('/conductAssessment');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'An assessment with the same title and assignee already exists') {
        message.error('An assessment with the same title and assignee already exists');
      } else {
        message.error('Error saving data');
      }
      console.error('Error:', error);
    }
  }, [assessmentInfo, qaInfo, customizeQuestions, questionSetsCount, customQuestions, selectedProgramId, navigate]);

  const handleDatasetChange = (value) => {
    const selectedDataset = questionsData.find(dataset => dataset.datasetName === value);
    setQaInfo(prev => ({ ...prev, selectedDataset }));
  };

  const validateQuestionCount = (topic, type, count) => {
    const availableCount = qaInfo.selectedDataset.questions.filter(q => q.questionTopics.includes(topic) && q.questionType === type).length;
    if (count > availableCount) {
      message.error(`Only ${availableCount} questions of type ${type} are available for ${topic}.`);
    }
  };

  const handleCustomizeQuestionsChange = (checked) => {
    setCustomizeQuestions(checked);
  };

  const handleQuestionSetsCountChange = (value) => {
    setQuestionSetsCount(value);
    setQaInfo(prev => ({ ...prev, questionsSetCount: value }));
  };

  const handleAddCustomQuestion = () => {
    setCustomQuestions([...customQuestions, { topic: '', count: 0, type: '' }]);
  };

  const handleRemoveCustomQuestion = (index) => {
    const newCustomQuestions = [...customQuestions];
    newCustomQuestions.splice(index, 1);
    setCustomQuestions(newCustomQuestions);
  };

  const handleCustomQuestionChange = (index, field, value) => {
    const newCustomQuestions = [...customQuestions];
    newCustomQuestions[index][field] = value;
    setCustomQuestions(newCustomQuestions);

    // Validate question count whenever topic or type changes
    if (field === 'topic' || field === 'type') {
      const { topic, type, count } = newCustomQuestions[index];
      if (topic && type && count) {
        validateQuestionCount(topic, type, count);
      }
    }
  };

  const handleTrainingProgramChange = async (value) => {
    setSelectedProgramId(value);
    try {
      const response = await api.get(`${baseUrl}api/coordinator/topics/${value}`);
      const topicNames = response.data.data.topics.map(topic => topic.name);
      setTopics(topicNames);
    } catch (error) {
      message.error('Error fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  return (
    <div style={{ padding: 24, margin: 0, minHeight: 280 }}>
      <h1>Conduct Assessment</h1>
      <Steps current={currentStep}>
        <Step title="Assessment Details" />
        <Step title="Configure Assessment" />
        <Step title="Preview" />
      </Steps>
      <div style={{ marginTop: '24px' }}>
        {currentStep === 0 && (
          <Form
            name="assessment_form"
            layout="vertical"
            initialValues={assessmentInfo}
            onFinish={(values) => {
              setAssessmentInfo(values);
              handleNext();
            }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input the assessment title!' }]}
            >
              <Input placeholder="Enter assessment title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the description!' }]}
            >
              <Input.TextArea placeholder="Enter assessment description" />
            </Form.Item>

            <Form.Item
              name="due_date"
              label="Due date"
              rules={[{ required: true, message: 'Please input the Due Date!' }]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: 'Please input the duration!' }]}
            >
              <TimePicker
                format="HH:mm"
                defaultValue={dayjs('00:00', 'HH:mm')}
                showNow={false}
                allowClear={false}
              />
            </Form.Item>
            <Form.Item
              name="trainingProgram"
              label="Training Program"
              rules={[{ required: true, message: 'Please select a training program!' }]}
            >
              <Select placeholder="Select a training program" onChange={handleTrainingProgramChange}>
                {trainingPrograms.map(program => (
                  <Option key={program.key} value={program.key}>
                    {program.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
                Next
              </Button>
              <Button type="default" onClick={() => navigate('/conductAssessment')}>
                Back
              </Button>
            </Form.Item>
          </Form>
        )}
        {currentStep === 1 && (
          <Form
            name="configure_qa_form"
            layout="vertical"
            initialValues={qaInfo}
            onFinish={(values) => {
              setQaInfo(values);
              handleNext();
            }}
          >
            <Form.Item
              label="Q&A Dataset"
              name="dataset"
              rules={[{ required: true, message: 'Please select a dataset!' }]}
            >
              <Select placeholder="Select a dataset for Q&A" onChange={handleDatasetChange}>
                {datasets.map((name, index) => (
                  <Option key={index} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Customize Questions">
              <Switch
                checked={customizeQuestions}
                onChange={handleCustomizeQuestionsChange}
              />
            </Form.Item>

            {customizeQuestions && (
              <>
                {customQuestions.map((customQuestion, index) => (
                  <Row key={index} gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="Topic"
                        rules={[{ required: true, message: 'Please select a topic!' }]}
                      >
                        <Select
                          placeholder="Select a topic"
                          value={customQuestion.topic}
                          onChange={(value) => handleCustomQuestionChange(index, 'topic', value)}
                        >
                          {topics.map((topic, idx) => (
                            <Option key={idx} value={topic}>
                              {topic}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Question Type"
                        rules={[{ required: true, message: 'Please select the question type!' }]}
                      >
                        <Select
                          placeholder="Select question type"
                          value={customQuestion.type}
                          onChange={(value) => handleCustomQuestionChange(index, 'type', value)}
                        >
                          <Option value="single">Single Select</Option>
                          <Option value="multi">Multi Select</Option>
                          <Option value="code">Code Box</Option>
                          <Option value="descriptive">Descriptive</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Number of Questions"
                        rules={[{ required: true, message: 'Please enter the number of questions!' }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Enter number of questions"
                          value={customQuestion.count}
                          onChange={(value) => {
                            handleCustomQuestionChange(index, 'count', value);
                            validateQuestionCount(customQuestion.topic, customQuestion.type, value);
                          }}
                          disabled={!customQuestion.topic || !customQuestion.type}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="danger"
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveCustomQuestion(index)}
                        style={{ marginTop: '30px' }}
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  type="dashed"
                  onClick={handleAddCustomQuestion}
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                  <PlusOutlined /> Add Question
                </Button>

                <Form.Item
                  label="Number of Question Sets"
                  name="questionSetsCount"
                  rules={[{ required: true, message: 'Please enter the number of question sets!' }]}
                >
                  <InputNumber
                    min={1}
                    placeholder="Enter number of question sets"
                    onChange={handleQuestionSetsCountChange}
                  />
                </Form.Item>
                <Form.Item
                  label="Shuffle Questions"
                  name="shuffle"
                >
                  <Radio.Group onChange={handleShuffleChange}>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="Total Number of Questions"
                >
                  <span>{customQuestions.reduce((total, q) => total + q.count, 0)}</span>
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Passing Criteria"
              name="passingCriteria"
              rules={[{ required: true, message: 'Please enter the passing criteria!' }]}
            >
              <Input placeholder="Enter passing criteria (e.g., 70% or 50 points)" />
            </Form.Item>

            <Form.Item
              label="Trainer"
              name="trainer"
              rules={[{ required: true, message: 'Please select a trainer!' }]}
            >
              <Select
                placeholder="Select a trainer"
                allowClear
                mode="multiple"
              >
                {trainers.map(trainer => (
                  <Option key={trainer.id} value={trainer.name}>
                    {trainer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Assign to Batch">
              <Switch
                checked={assignToBatch}
                onChange={checked => setAssignToBatch(checked)}
              />
            </Form.Item>

            {assignToBatch ? (
              <Form.Item
                label="Assign to Batch"
                name="assignToBatch"
                rules={[{ required: true, message: 'Please select a batch!' }]}
              >
                <Select
                  placeholder="Select a batch"
                  allowClear
                  mode="multiple"
                >
                  {batches.map((name, index) => (
                    <Option key={index} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                label="Assign to Trainee"
                name="assignToTrainee"
                rules={[{ required: true, message: 'Please select a trainee!' }]}
              >
                <Select
                  placeholder="Select a trainee"
                  allowClear
                  mode="multiple"
                >
                  {trainees.map(trainee => (
                    <Option key={trainee.id} value={trainee.name}>
                      {trainee.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item>
              <Button type="default" onClick={handlePrevious}>
                Previous
              </Button>
              <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
                Next
              </Button>
            </Form.Item>
          </Form>
        )}
        {currentStep === 2 && (
          <>
            <Card title="Assessment Details">
              <p><strong>Title:</strong> {assessmentInfo.title}</p>
              <p><strong>Description:</strong> {assessmentInfo.description}</p>
              <p><strong>Due Date:</strong> {assessmentInfo.due_date?.format('YYYY-MM-DD')}</p>
              <p><strong>Duration:</strong> {assessmentInfo.duration?.format('HH:mm')}</p>
              <p><strong>Training Program:</strong> {trainingPrograms.find(program => program.key === assessmentInfo.trainingProgram)?.value}</p>
            </Card>
            <Card title="Assessment Configuration" style={{ marginTop: '16px' }}>
              <p><strong>Dataset:</strong> {qaInfo.dataset}</p>
              <p><strong>Passing Criteria:</strong> {qaInfo.passingCriteria}</p>
              <p><strong>Trainer:</strong> {qaInfo.trainer?.join(', ')}</p>
              <p><strong>Assign To:</strong> {assignToBatch ? qaInfo.assignToBatch?.join(', ') : qaInfo.assignToTrainee?.join(', ')}</p>
              {customizeQuestions && (
                <>
                  <p><strong>Shuffle Questions:</strong> {qaInfo.shuffle ? 'Yes' : 'No'}</p>
                  <p><strong>Number of Question Sets:</strong> {qaInfo.questionSetsCount}</p>
                  <p><strong>Total Number of Questions:</strong> {customQuestions.reduce((total, q) => total + q.count, 0)}</p>
                </>
              )}
            </Card>
            <div style={{ marginTop: '15px' }}></div>
            <Button type="default" onClick={handlePrevious}>
              Previous
            </Button>
            <Button type="primary" onClick={handleSubmit} style={{ backgroundColor: 'green', borderColor: 'green', float: 'right' }}>
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentForm;