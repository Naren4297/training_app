import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Steps, Form, Input, DatePicker, TimePicker, Button, Select, Switch, InputNumber, Radio, message, Card, Row, Col } from 'antd';
import api from '../../utils/api';
import dayjs from 'dayjs';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Step } = Steps;
const { Option } = Select;
const baseUrl = process.env.REACT_APP_BASE_URL;

const EditAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentInfo, setAssessmentInfo] = useState({});
  const [customizeQuestions, setCustomizeQuestions] = useState(false);
  const [qaInfo, setQaInfo] = useState({});
  const [assignToBatch, setAssignToBatch] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [batches, setBatches] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [questionSetsCount, setQuestionSetsCount] = useState(1);
  const [topics, setTopics] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([{ topic: '', count: 0, type: '' }]);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [form] = Form.useForm();
  const [qaForm] = Form.useForm();

  function safeJSONParse(value) {
    if (typeof value === "string" && value.trim() !== "") {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("Invalid JSON:", e);
        return null;
      }
    }
    return value;
  }

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        const response = await api.get(`${baseUrl}api/coordinator/assessment/${id}`);
        const data = response.data;
        const assessmentData = {
          ...data,
          due_date: dayjs(data.due_date),
          duration: dayjs(data.duration, 'HH:mm'),
          assignTo: safeJSONParse(data.assignTo),
          trainingProgram: data.trainingProgramId // Ensure training program is set
        };
        setAssessmentInfo(assessmentData);
        setCustomizeQuestions(data.customize);
        setShuffle(data.shuffle);
        setAssignToBatch(data.assignToBatch?.length > 0);
        form.setFieldsValue(assessmentData);

        const parsedTopics = safeJSONParse(data.topics);
        const initialCustomQuestions = [];
        for (const topic in parsedTopics) {
          parsedTopics[topic].forEach(q => {
            initialCustomQuestions.push({ topic, count: q.count, type: q.type });
          });
        }
        setCustomQuestions(initialCustomQuestions);

        qaForm.setFieldsValue({
          dataset: data.dataset,
          passingCriteria: data.passingCriteria,
          trainer: safeJSONParse(data.trainer),
          assignToBatch: safeJSONParse(data.assignToBatch),
          assignToTrainee: safeJSONParse(data.assignToUser),
          questionSetsCount: data.questionSetsCount,
          shuffle: data.shuffle,
          customQuestions: initialCustomQuestions
        });
        setQaInfo({
          selectedDataset: datasets.find(dataset => dataset.datasetName === data.dataset)
        });

        // Fetch topics for the initial training program
        if (data.trainingProgramId) {
          fetchTopics(data.trainingProgramId);
        }
      } catch (error) {
        message.error('Error fetching assessment details');
        console.error('Error:', error);
      }
    };

    const fetchData = async () => {
      try {
        const [datasetsResponse, batchesResponse, trainersResponse, traineesResponse, trainingProgramsResponse] = await Promise.all([
          api.get(`${baseUrl}api/trainers/get-questionAnswers`),
          api.get(`${baseUrl}api/coordinator/batches`),
          api.get(`${baseUrl}api/coordinator/trainers`),
          api.get(`${baseUrl}api/coordinator/trainees`),
          api.get(`${baseUrl}api/coordinator/training-programs`)
        ]);
        setDatasets(datasetsResponse.data);
        setBatches(batchesResponse.data.data || []); // Ensure batches is an array
        setTrainers(trainersResponse.data.data);
        setTrainees(traineesResponse.data.data);
        const programs = trainingProgramsResponse.data.data.programs.map(program => ({
          key: program.generalInfo.trainingprogram_id,
          value: program.generalInfo.title
        }));
        setTrainingPrograms(programs);
      } catch (error) {
        message.error('Error fetching data');
        console.error('Error:', error);
      }
    };

    fetchAssessmentDetails();
    fetchData();
  }, [id, form, qaForm]);

  const fetchTopics = async (programId) => {
    try {
      const response = await api.get(`${baseUrl}api/coordinator/topics/${programId}`);
      const topicNames = response.data.data.topics.map(topic => topic.name);
      setTopics(topicNames);
    } catch (error) {
      message.error('Error fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  const handleNext = useCallback(() => setCurrentStep(prevStep => prevStep + 1), []);
  const handlePrevious = useCallback(() => setCurrentStep(prevStep => prevStep - 1), []);
  const handleShuffleChange = (e) => setShuffle(e.target.value);

  const validateQuestionCount = (topic, type, count) => {
    const availableCount = qaInfo.selectedDataset?.questions?.filter(q => q.questionTopics.includes(topic) && q.questionType === type).length || 0;
    if (count > availableCount) {
      message.warning(`Only ${availableCount} questions of type ${type} are available for ${topic}.`);
    }
  };

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
      trainingProgramId: selectedProgramId
    };

    try {
      await api.put(`${baseUrl}api/coordinator/edit-assessment/${id}`, payload);
      message.success('Assessment and QA details updated successfully');
      navigate('/conductAssessment');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'An assessment with the same title and assignee already exists') {
        message.error('An assessment with the same title and assignee already exists');
      } else {
        message.error('Error updating data');
      }
      console.error('Error:', error);
    }
  }, [assessmentInfo, qaInfo, customizeQuestions, questionSetsCount, customQuestions, selectedProgramId, navigate]);

  const handleDatasetChange = (value) => {
    const selectedDataset = datasets.find(dataset => dataset.datasetName === value);
    setQaInfo(prev => ({ ...prev, selectedDataset }));
    qaForm.setFieldsValue({ dataset: selectedDataset.datasetName });
  };

  const handleCustomizeQuestionsChange = (checked) => setCustomizeQuestions(checked);

  const handleQuestionSetsCountChange = (value) => {
    setQuestionSetsCount(value);
    qaForm.setFieldsValue({ questionSetsCount: value });
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

    if (field === 'topic' || field === 'type') {
      const { topic, type, count } = newCustomQuestions[index];
      if (topic && type && count) {
        validateQuestionCount(topic, type, count);
      }
    }
  };

  const handleTrainingProgramChange = async (value) => {
    setSelectedProgramId(value);
    fetchTopics(value);
  };

  return (
    <div style={{ padding: 24, margin: 0, minHeight: 280 }}>
      <h1>Edit Assessment</h1>
      <Steps current={currentStep}>
        <Step title="Assessment Details" />
        <Step title="Configure Assessment" />
        <Step title="Preview" />
      </Steps>
      <div style={{ marginTop: '24px' }}>
        {currentStep === 0 && (
          <Form
            form={form}
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
              <Button type="default" onClick={() => navigate('/conductAssessment')}>
                Back
              </Button>
              <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
                Next
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form
            form={qaForm}
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
                {datasets.map((dataset, index) => (
                  <Option key={index} value={dataset.datasetName}>
                    {dataset.datasetName}
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
                  {batches.map((batch, index) => (
                    <Option key={index} value={batch.batch_name}>
                      {batch.batch_name}
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
              <p><strong>Dataset:</strong> {qaForm.getFieldValue('dataset')}</p>
              <p><strong>Passing Criteria:</strong> {qaForm.getFieldValue('passingCriteria')}</p>
              <p><strong>Trainer:</strong> {qaForm.getFieldValue('trainer')?.join(', ')}</p>
              <p><strong>Assign To:</strong> {assignToBatch ? qaForm.getFieldValue('assignToBatch')?.join(', ') : qaForm.getFieldValue('assignToTrainee')?.join(', ')}</p>
              {customizeQuestions && (
                <>
                  <p><strong>Shuffle Questions:</strong> {qaForm.getFieldValue('shuffle') ? 'Yes' : 'No'}</p>
                  <p><strong>Number of Question Sets:</strong> {qaForm.getFieldValue('questionSetsCount')}</p>
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

export default EditAssessment;