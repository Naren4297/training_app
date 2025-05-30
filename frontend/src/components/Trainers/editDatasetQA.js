import React, { useState, useEffect, useRef } from 'react';
import {  Form, Input, Button, Radio, Steps, Checkbox, message, List, Card, Select } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import Editor from '@monaco-editor/react';

const { Step } = Steps;
const { Option } = Select;
const baseUrl = process.env.REACT_APP_BASE_URL;

const EditQA = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const navigate = useNavigate();
  const location = useLocation();
  const editingDataset = location.state?.dataset;
  const [id, setID] = useState(0);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [dummyState, setDummyState] = useState(false);
  const questionInputRef = useRef(null);

  useEffect(() => {
    fetchTrainingPrograms();
  }, []);

  useEffect(() => {
    if (editingDataset) {
      setDatasetInfo({
        datasetName: editingDataset.datasetName,
        category: editingDataset.category,
        trainingProgram: editingDataset.trainingProgram,
      });
      fetchQuestions(editingDataset.datasetName);
    }
  }, [editingDataset]);

  useEffect(() => {
    if (trainingPrograms.length > 0 && datasetInfo?.trainingProgram) {
      const selectedProgram = trainingPrograms.find(program => program.name === datasetInfo.trainingProgram);
      if (selectedProgram) {
        setSelectedProgramId(selectedProgram.id);
        fetchTopics(selectedProgram.id);
      }
    }
  }, [trainingPrograms, datasetInfo?.trainingProgram]);

  const fetchQuestions = async (datasetName) => {
    try {
      const response = await api.get(`${baseUrl}api/trainers/fetchqaDataset/${encodeURIComponent(datasetName)}`);
      const data = response.data;
      setID(data._id);
      setQuestions(data.questions ? data.questions : []);
      setDatasetInfo({
        datasetName: data.datasetName,
        category: data.category,
        trainingProgram: data.trainingProgram,
      });
      form.setFieldsValue({
        datasetName: data.datasetName,
        category: data.category,
        trainingProgram: data.trainingProgram,
      });
    } catch (error) {
      message.error('Error fetching questions');
      console.error('Error fetching questions:', error);
    }
  };

  const fetchTrainingPrograms = async () => {
    try {
      const response = await api.get(`${baseUrl}api/coordinator/training-programs`);
      const programs = response.data.data.programs.map(program => ({
        id: program.generalInfo.trainingprogram_id,
        name: program.generalInfo.title
      }));
      setTrainingPrograms(programs);
    } catch (error) {
      message.error('Error fetching training programs');
      console.error('Error fetching training programs:', error);
    }
  };

  const fetchTopics = async (programId) => {
    try {
      const response = await api.get(`${baseUrl}api/coordinator/topics/${programId}`);
      const topicsData = response.data.data.topics.map(topic => ({
        id: topic.id,
        name: topic.name
      }));
      setTopics(topicsData);
    } catch (error) {
      message.error('Error fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  const handleProgramChange = (value) => {
    setSelectedProgramId(value);
    fetchTopics(value);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    const questionTypeKey = questionToEdit.questionType;
    setQuestionType(questionTypeKey);

    const formFields = {
      questionType: questionTypeKey,
      question: questionToEdit.question,
      answer: questionToEdit.answer,
      language: questionToEdit.language,
      questionTopics: questionToEdit.questionTopics,
    };

    if (questionTypeKey !== 'code' && questionTypeKey !== 'descriptive') {
      formFields.options = questionToEdit.options.map(option => ({
        option: option.option,
        isAnswer: option.isAnswer,
      }));
    }

    form.setFieldsValue(formFields);
    setDummyState(dummyState => !dummyState);

    if (questionToEdit.questionType === 'single') {
      const selectedOptionIndex = questionToEdit.options.findIndex(option => option.isAnswer);
      setSelectedOption(selectedOptionIndex);
    }

    setTimeout(() => {
      questionInputRef.current.focus();
    }, 0);

    setEditingIndex(index);
  };

  const handleSaveQuestion = (values) => {
    let newQuestion;

    if (questionType === 'code') {
      newQuestion = {
        questionType: values.questionType,
        question: values.question,
        answer: values.answer,
        language: editorLanguage,
        questionTopics: values.questionTopics,
      };
    } else if (questionType === 'descriptive') {
      newQuestion = {
        questionType: values.questionType,
        question: values.question,
        answer: values.answer,
        questionTopics: values.questionTopics,
      };
    } else {
      const options = values.options.map((option, index) => ({
        option: option.option,
        isAnswer: questionType === 'single' ? selectedOption === index : option.isAnswer,
      }));

      const selectedAnswers = options.filter(option => option.isAnswer);

      if (selectedAnswers.length === 0) {
        message.error('Please select at least one answer.');
        return;
      }

      newQuestion = {
        ...values,
        options,
        answer: questionType === 'single'
          ? values.options[selectedOption].option
          : selectedAnswers.map(option => option.option),
        questionTopics: values.questionTopics,
      };
    }

    const updatedQuestions = questions.map((question, index) =>
      index === editingIndex ? newQuestion : question
    );

    setQuestions(updatedQuestions);
    form.resetFields(['question', 'questionType', 'options', 'answer', 'questionTopics']);
    setSelectedOption(null);
    setEditingIndex(null);
  };

  const handleQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
    setSelectedOption(null);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    const dataset = {
      _id: id,
      category: datasetInfo.category,
      datasetName: datasetInfo.datasetName,
      trainingProgram: selectedProgramId ? selectedProgramId : datasetInfo.trainingProgram,
      questions: questions,
    };

    try {
      await api.put(`${baseUrl}api/trainers/update-dataset/${id}`, dataset);
      message.success('Dataset updated successfully');
      navigate('/manage-datasets');
    } catch (error) {
      message.error('Error updating dataset');
      console.error('Error updating dataset:', error);
    }
  };

  return (
    <div style={{ padding: 24, margin: 0, minHeight: 280 }}>
      <h1>Edit Q&A Dataset</h1>
      <Steps current={currentStep}>
        <Step title="Edit Dataset Details" />
        <Step title="Edit Q&A" />
        <Step title="Preview" />
      </Steps>
      <div style={{ marginTop: '24px' }}>
        {currentStep === 0 && (
          <Form
            form={form}
            initialValues={datasetInfo}
            onFinish={(values) => {
              setDatasetInfo(values);
              handleNext();
            }}
          >
            <Form.Item
              name="datasetName"
              label="Dataset Name"
              rules={[{ required: true, message: 'Please input the dataset name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please input the category!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="trainingProgram"
              label="Training Program"
              rules={[{ required: true, message: 'Please select a training program!' }]}
            >
              <Select placeholder="Select a training program" onChange={handleProgramChange}>
                {trainingPrograms.map((program) => (
                  <Option key={program.id} value={program.id}>
                    {program.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
                Next
              </Button>
              <Button type="default" onClick={() => navigate('/manage-datasets')}>
                Back
              </Button>
            </Form.Item>
          </Form>
        )}
        {currentStep === 1 && (
          <>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={questions}
              renderItem={(item, index) => (
                <List.Item>
                  <Card
                    title={`Question ${index + 1}`}
                    extra={<Button onClick={() => handleEditQuestion(index)}>Edit</Button>}
                  >
                    <p><strong>Question {index + 1}:</strong> {item.question}</p>
                    <p><strong>Question Type:</strong> {item.questionType}</p>
                    {item.options && (
                      <div>
                        <strong>Options:</strong>
                        <ul>
                          {item.options.map((option, idx) => (
                            <li key={idx}>{option.option} {option.isAnswer && '(Answer)'}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.questionType === 'code' && (
                      <div>
                        <p><strong>Answer:</strong></p>
                        <pre>{item.answer}</pre>
                      </div>
                    )}
                    {item.questionType === 'descriptive' && (
                      <p><strong>Answer:</strong> {item.answer}</p>
                    )}
                    {item.questionType === 'multi' && (
                      <p><strong>Answer:</strong> {Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</p>
                    )}
                  </Card>
                </List.Item>
              )}
            />
            <Form form={form} onFinish={handleSaveQuestion}>
              <Form.Item
                name="questionType"
                label="Question Type"
                rules={[{ required: true, message: 'Please select the question type!' }]}
              >
                <Radio.Group onChange={handleQuestionTypeChange}>
                  <Radio value="single">Single Select</Radio>
                  <Radio value="multi">Multi Select</Radio>
                  <Radio value="code">Code Box</Radio>
                  <Radio value="descriptive">Descriptive</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="question"
                label="Question"
                rules={[{ required: true, message: 'Please input the question!' }]}
              >
                <Input ref={questionInputRef} />
              </Form.Item>
              <Form.Item
                name="questionTopics"
                label="Question Topics"
                rules={[{ required: true, message: 'Please input the question topics!' }]}
              >
                <Select placeholder="Enter or select topics" mode="multiple">
                  {topics.map((topic) => (
                    <Option key={topic.id} value={topic.id}>
                      {topic.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {(questionType === 'single' || questionType === 'multi') && (
                <Form.List name="options" initialValue={[{ option: '' }, { option: '' }, { option: '' }, { option: '' }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Form.Item
                          key={field.key}
                          label={`Option ${index + 1}`}
                          required={false}
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, 'option']}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[{ required: true, message: 'Please input an option!' }]}
                            noStyle
                          >
                            <Input style={{ width: '70%' }} />
                          </Form.Item>
                          {questionType === 'single' ? (
                            <Radio
                              checked={selectedOption === index}
                              onChange={() => setSelectedOption(index)}
                              style={{ marginLeft: '10px' }}
                            />
                          ) : (
                            <Form.Item
                              name={[field.name, 'isAnswer']}
                              valuePropName="checked"
                              noStyle
                            >
                              <Checkbox style={{ marginLeft: '10px' }} />
                            </Form.Item>
                          )}
                          {fields.length > 4 ? (
                            <Button
                              type="primary"
                              danger
                              onClick={() => remove(field.name)}
                              style={{ width: '20%', marginLeft: '10px' }}
                            >
                              Remove Option
                            </Button>
                          ) : null}
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button
                          type="primary"
                          dashed
                          onClick={() => add()}
                          style={{ width: '100%' }}
                        >
                          Add Option
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              )}
              {questionType === 'code' && (
                <>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: 'Please select the language!' }]}
                  >
                    <Select
                      defaultValue="javascript"
                      onChange={(value) => setEditorLanguage(value)}
                    >
                      <Option value="javascript">JavaScript</Option>
                      <Option value="python">Python</Option>
                      <Option value="java">Java</Option>
                      <Option value="csharp">C#</Option>
                      <Option value="cpp">C++</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="answer"
                    label="Answer"
                    rules={[{ required: true, message: 'Please input the answer!' }]}
                  >
                    <Editor
                      height="200px"
                      language={editorLanguage}
                      theme="vs-light"
                      options={{
                        selectOnLineNumbers: true,
                        automaticLayout: true,
                      }}
                      onChange={(value) => form.setFieldsValue({ answer: value })}
                    />
                  </Form.Item>
                </>
              )}
              {questionType === 'descriptive' && (
                <Form.Item
                  name="answer"
                  label="Answer"
                  rules={[{ required: true, message: 'Please input the answer!' }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Question
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="default" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button type="primary" onClick={handleNext} style={{ float: 'right' }}>
                  Next
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
        {currentStep === 2 && (
          <>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={questions}
              renderItem={(item, index) => (
                <List.Item>
                  <Card title={`Question ${index + 1}`}>
                    <p><strong>Question {index + 1}:</strong> {item.question}</p>
                    <p><strong>Question Type:</strong> {item.questionType}</p>
                    {item.options && Array.isArray(item.options) && (
                      <div>
                        <strong>Options:</strong>
                        <ul>
                          {item.options.map((option, idx) => (
                            <li key={idx}>{option.option} {option.isAnswer && '(Answer)'}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.questionType === 'code' && (
                      <div>
                        <p><strong>Answer:</strong></p>
                        <pre>{item.answer}</pre>
                      </div>
                    )}
                    {item.questionType === 'descriptive' && (
                      <p><strong>Answer:</strong> {item.answer}</p>
                    )}
                    {item.questionType === 'multi' && (
                      <p><strong>Answer:</strong> {Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</p>
                    )}
                  </Card>
                </List.Item>
              )}
            />
            <Button type="default" onClick={handlePrevious}>
              Previous
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ backgroundColor: 'green', borderColor: 'green', float: 'right' }}
            >
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditQA;