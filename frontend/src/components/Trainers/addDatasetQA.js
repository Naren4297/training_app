import React, { useState, useEffect } from 'react';
import {  Form, Input, Button, Radio, Steps, Checkbox, message, List, Card, Select, Upload, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { Editor } from '@monaco-editor/react';
import * as XLSX from 'xlsx';
import image from '../../assets/artifacts/image.png';

const { Step } = Steps;
const { Option } = Select;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AddQA = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [bulkImport, setBulkImport] = useState('no');
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainingPrograms = async () => {
      try {
        const response = await api.get(`${baseUrl}api/coordinator/training-programs`);
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
  }, []);

  const fetchTopics = async (programId) => {
    try {
      const response = await api.get(`${baseUrl}api/coordinator/topics/${programId}`);

      // Extract topic names from the response
      const topicNames = response.data.data.topics.map(topic => topic.name);
      setTopics(topicNames);
    } catch (error) {
      message.error('Error fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  const handleProgramChange = (value) => {
    setSelectedProgramId(value);
    fetchTopics(value);
  };

  const handleSaveQuestion = (values) => {
    let newQuestion;

    if (questionType === 'code') {
      newQuestion = {
        questionType: values.questionType,
        question: values.question,
        answer: values.answer,
        language: editorLanguage,
        topic: values.topic,
        questionTopics: values.questionTopics,
      };
    } else if (questionType === 'descriptive') {
      newQuestion = {
        questionType: values.questionType,
        question: values.question,
        answer: values.answer,
        topic: values.topic,
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
        answer: questionType === 'Single Select' && selectedOption !== null && selectedOption < values.options.length
          ? values.options[selectedOption].option
          : selectedAnswers.map(option => option.option),
        topic: values.topic,
        questionTopics: values.questionTopics,
      };
    }

    setQuestions([...questions, newQuestion]);
    form.resetFields(['question', 'questionType', 'options', 'answer', 'topic', 'questionTopics']);
    setSelectedOption(null);
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

  const handleTypeChange = (e) => {
    setBulkImport(e.target.value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const questions = processBulkImport(json);
      setQuestions(questions);
    };
    reader.readAsArrayBuffer(file);
    setFileList([file]);
    return false;
  };

  const handleFileRemove = () => {
    setFileList([]);
    setQuestions([]);
  };

  const keyNames = {
    "Single Select": "single",
    "Multi Select": "multi",
    "Code box": "code",
    "Descriptive": "descriptive"
  };

  const processBulkImport = (data) => {
    const headers = data[0];
    const rows = data.slice(1);
    const questions = rows.map((row) => {
      const questionType = keyNames[row[0]];
      const question = row[1];
      const questionTopic = row[2];
      const options = row[3] ? row[3].split(',').map(opt => opt.trim()) : [];
      const answer = row[4];

      let questionData = {
        questionType,
        question,
        options: [],
        answer: '',
        questionTopics: questionTopic ? questionTopic.split(',').map(topic => topic.trim()) : [],
      };

      if (questionType === 'single' || questionType === 'multi') {
        questionData.options = options.map((option, index) => ({
          option,
          isAnswer: answer.includes(`Option ${index + 1}`)
        }));
        questionData.answer = options.filter((option, index) => answer.includes(`Option ${index + 1}`)).join(', ');
      } else if (questionType === 'code' || questionType === 'descriptive') {
        questionData.answer = answer;
      }

      return questionData;
    });

    return questions;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
// Find the selected training program name based on the key
const selectedProgram = trainingPrograms.find(program => program.key === datasetInfo.trainingProgram);

const dataset = {
  ...datasetInfo,
  trainingProgram: selectedProgram ? selectedProgram.value : '', // Use the program name
  questions,
};

    try {
      await api.post(`${baseUrl}api/trainers/submit-questionAnswers`, dataset);
      message.success('Dataset created successfully');
      navigate('/manage-datasets');
    } catch (error) {
      message.error('Error submitting dataset');
      console.error('Error submitting dataset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div style={{ padding: 24, margin: 0, minHeight: 280 }}>
      <h1>Create Q&A Dataset</h1>
      <Steps current={currentStep}>
        <Step title="Dataset Details" />
        <Step title="Add Q&A" />
        <Step title="Preview" />
      </Steps>
      <div style={{ marginTop: '24px' }}>
        {currentStep === 0 && (
          <Form
            form={form}
            initialValues={{ bulkImport: 'no' }}
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
                  <Option key={program.key} value={program.key}>
                    {program.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="bulkImport"
              label="Bulk Import dataset"
              rules={[{ required: true, message: 'Please select yes or no!' }]}
            >
              <Radio.Group onChange={handleTypeChange}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
              <InfoCircleOutlined onClick={showModal} style={{ marginLeft: '8px' }} />
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
        {currentStep === 1 && bulkImport === 'no' && (
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
              <Input />
            </Form.Item>
            <Form.Item
              name="questionTopics"
              label="Question Topics"
              rules={[{ required: true, message: 'Please input the question topics!' }]}
            >
              <Select placeholder="Enter or select topics">
                {topics.map((topic, index) => (
                  <Option key={index} value={topic}>
                    {topic}
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
        )}
        {currentStep === 1 && bulkImport === 'yes' && (
          <Form>
            <Form.Item
              name="file"
              label="Upload Excel File"
              rules={[{ required: true, message: 'Please upload an Excel file!' }]}
            >
              <Upload
                beforeUpload={handleFileUpload}
                accept=".xlsx, .xls"
                fileList={fileList}
                onRemove={handleFileRemove}
              >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
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
                    <p><strong>Question Topics:</strong> {Array.isArray(item.questionTopics) ? item.questionTopics.join(', ') : item.questionTopics}</p>
                    {(item.questionType === 'single' || item.questionType === 'multi') && item.options && Array.isArray(item.options) && (
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
                      <p><strong>Answer:</strong> {item.answer}</p>
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
        <Modal
          title="Bulk Import Information"
          open={isModalVisible}
          footer={[
            <Button key="understood" type="primary" onClick={handleOk}>
              Understood
            </Button>,
          ]}
          onCancel={handleCancel}
        >
          <img src={image} alt="Bulk Import Info" style={{ display: 'block', margin: '0 auto 20px', width: '-webkit-fill-available' }} />
          <p>1) Ensure the headers are matching</p>
          <p>2) Options for MCQ should be given as comma separated values</p>
          <p>3) Refer the above image and follow how to map answers for a question</p>
        </Modal>
      </div>
    </div>
  );
};

export default AddQA;