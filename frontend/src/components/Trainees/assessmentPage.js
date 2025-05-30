import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Tabs, Radio, Checkbox, Button, Alert, Form, Select, Input} from 'antd';
import { notification } from 'antd';
import {Editor} from '@monaco-editor/react'
import { useAppContext } from '../../utils/ApplicationContext';

const { Content } = Layout;
const { TabPane } = Tabs;
const {Option} = Select;
const baseUrl = process.env.REACT_APP_BASE_URL;

const AssessmentPage = () => {
  const codeAnswer = useRef({
    language:'javascript',
    code:''
  });

  const descriptiveAnswer = useRef({answer:"",});

  const { assessmentId } = useParams();
  // const navigate = useNavigate();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [assessmentDetails, setAssessmentDetails] = useState({});
  const [error, setError] = useState(null);
  const [editorLanguage, setEditorLanguage] = useState('java');
  const navigate = useNavigate();

  const appContext = useAppContext();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.post('http://localhost:5000/api/trainees/start-assessment', { assessmentId, username: appContext.state.user.name});
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.response?.data?.message || 'Error fetching questions');
      }
    };

    const fetchAssessmentDetails = async () => {
      try {
        const response = await api.get(`${baseUrl}api/trainees/assessment-details`, { params: { assessmentId } });
        setAssessmentDetails(response.data);
      } catch (error) {
        console.error('Error fetching assessment details:', error);
        setError(error.response?.data?.message || 'Error fetching assessment details');
      }
    };

    fetchQuestions();
    fetchAssessmentDetails();
  }, [assessmentId]);

  const handleSingleChoiceChange = (questionIndex, option) => {
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const handleMultiChoiceChange = (questionIndex, checkedValues) => {
    setAnswers({ ...answers, [questionIndex]: checkedValues });
  };

  const handleSubmit = async () => {
    const submissionData = {
      userName: appContext.state.user.name,
      assessmentName: assessmentDetails.title, // Use the actual assessment name
      assessmentId,
      qadatasetName: assessmentDetails.qadatasetName, // Use the actual dataset name
      qadatasetId: assessmentDetails.qadatasetId, // Use the actual dataset ID
      assessmentstartTime: new Date(), // Replace with actual start time
      assessmentendTime: new Date(), // Replace with actual end time
      duration: '01:00', // Replace with actual duration
      assignedTo: assessmentDetails.assignedTo, // Use the actual batch name
      qaDataset: questions.map((question, index) => ({
        ...question,
        options: question.options?.map(option => ({
          ...option,
          isSelected: answers[index]?.includes(option.option) || false,
        })),
        answer:(question.questionType==='code')?codeAnswer.current:question.questionType==='descriptive'?descriptiveAnswer.current:'',
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      score: 0, // Replace with actual score calculation
      totalMarks: assessmentDetails.totalMarks, // Use the actual total marks
      feedback: '' // Replace with actual feedback
    };

    try {
      await api.post('http://localhost:5000/api/trainees/submit-assessment', submissionData);
      console.log('Assessment submitted successfully');
      navigate("/assessment-list");
    } catch (error) {
      console.error('Error submitting assessment:', error);
      notification.error({
        message: 'Error',
        description: 'There was an error submitting the assessment',
      });
    }
  };

  return (
    <Content
      style={{
        padding: 24,
        margin: 0,
        minHeight: 280,
      }}
    >
      <h2>Assessment Questions</h2>
      {error ? (
        <Alert message={error} type="error" />
      ) : (
        <Tabs defaultActiveKey="1" tabPosition='top' tabBarExtraContent={<Button type="primary" onClick={handleSubmit} disabled={!!error}>
        Submit Assessment
      </Button>}>
          {questions.map((question, index) => (
            <TabPane tab={`Question ${index + 1}`} key={index}>
              <h3>{question.question}</h3>
              {question.questionType === 'single' && (
                <Radio.Group onChange={(e) => handleSingleChoiceChange(index, e.target.value)}>
                  {question.options.map((option, idx) => (
                    <Radio key={idx} value={option.option} className="option">
                      {option.option}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
              {question.questionType === 'multi' && (
                <Checkbox.Group onChange={(checkedValues) => handleMultiChoiceChange(index, checkedValues)}>
                  {question.options.map((option, idx) => (
                    <Checkbox key={idx} value={option.option} className="option">
                      {option.option}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              )}
              {question.questionType === 'code' && (
                <>
                 <div>
                    <label><b>Write Your Code here:</b></label>
                  </div>
                <div>
                  <Select defaultValue="javascript"
                    onChange={(value) => setEditorLanguage(value)}>
                    <Option value="javascript">JavaScript</Option>
                    <Option value="python">Python</Option>
                    <Option value="java">Java</Option>
                    <Option value="csharp">C#</Option>
                    <Option value="cpp">C++</Option>
                    </Select>
                </div>
                <Editor
                height="90vh"
                language={editorLanguage}
                value={codeAnswer.value}
                onChange={(value) =>{
                  codeAnswer.current = {...codeAnswer.current,language:editorLanguage,code:value};
                }}
                options={{
                  selectOnLineNumbers: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
              </>
              )}
               {question.questionType === 'descriptive' && (
              <Form form={form}>
              <Form.Item
                name="answer"
                label="Answer"
                rules={[{ required: true, message: 'Please input the answer!' }]}
              >
                <Input.TextArea rows={4} onChange={(event)=>descriptiveAnswer.current.answer=event.target.value}/>
              </Form.Item>
              </Form>
            )}
            </TabPane>
          ))}
        </Tabs>
      )}
    </Content>
  );
};

export default AssessmentPage;