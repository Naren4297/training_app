import { useEffect, useState} from "react"
import api from "../../utils/api";
import { Col, Row, Form, Tabs, Select, Input, Layout, Button, Space, message, notification} from "antd";
import { useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { TabPane } = Tabs;

const AssessmentEvaluationPage = ({assessmentId,userName,objectId,assignmentId,passingCriteria}) => {
  const {form} = Form.useForm();
    // const{assessmentId,userName,objectId} = location.state||{};
    const [assessment, setAssessment] = useState({});
    const navigate = useNavigate();

    useEffect(()=>{
        async function fetchData() {
            try{
                const response = await api.get('trainers/assessment-submission',{params:{assessmentId,userName,objectId}});
                setAssessment(response.data);
            } catch(error) {
                console.error('Error fetching Assessment Submissions:', error);
            }
        }
       fetchData();
    },[assessmentId,userName,objectId]);

    // const [questions, setQuestions] = useState([]);
    // const { objectId } = useParams();
    // useEffect(() => {
    //     const fetchQuestions = async () => {
    //       try {
    //         const response = await api.post('http://localhost:5000/api/trainees/start-assessment', {objectId});
    //         setQuestions(response.data);
    //       } catch (error) {
    //         console.error('Error fetching questions:', error);
    //       }
    //     };

    //     fetchQuestions();
    //   }, [objectId]);

    console.log(assessment);

    const answersByTrainee = assessment?.submission?.qaDataset.filter(ques=>ques.questionType==='code'||ques.questionType==='descriptive')||[];
    const actualAnswers = assessment?.questionSet?.qaDataset.filter(ques=>ques.questionType==='code'||ques.questionType==='descriptive')||[];

    function handleApprove(question,isApproved) {
        let submission = assessment.submission;
        const qaSet = submission.qaDataset.map(ques=>
            ques.question===question?{...ques,isApproved}:ques
        );
        submission = {...submission,qaDataset:qaSet}

        setAssessment({...assessment,submission:submission});
    }

    async function handleComplete(){
        const pendingQuestions =  assessment.submission.qaDataset.filter(set=>!('isApproved' in set));
        if(pendingQuestions.length>0) {
            console.log('Please Evaluate all the questions before Submitting.');
            message.error('Please Evaluate all the questions before Submitting.')
        } else {
        let resMessage = '';
        let statusCode = 200;
        try{
            const response = await api.post('trainers/submit-evaluation',{assignmentId,passingCriteria,submissionData:assessment.submission});
            resMessage = response.data.message;
            statusCode = response.status;
        } catch(error) {
            console.error('Error fetching Assessment Submissions:', error);
        }
        statusCode===200?message.success(resMessage):message.error(resMessage);
        navigate('/assessment-list-evaluation');
    }
    }

      return(
        <>
        <Content
      style={{
        padding: 24,
        margin: 0,
        minHeight: 280,
      }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Assessment Questions</h2>
      <Button color="cyan" variant="solid" onClick={handleComplete}>
        Complete Evaluation
      </Button>
    </div>
        <Tabs defaultActiveKey="1" tabPosition="top">
          {answersByTrainee.map((answer, index) => (
            <TabPane tab={`Question ${index + 1}`} key={index}>
              <h3>{answer.question}</h3>
              {answer.questionType === 'code' && (
                <>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="row-border">
                    <label><b>Actual Answer:</b></label>
                    </div>
                    <div>
                    <Select defaultValue={actualAnswers[index].language}>
                    </Select>
                </div>
                <Editor
                height="90vh"
                language={actualAnswers[index].language}
                value={actualAnswers[index].answer}
                options={{
                  selectOnLineNumbers: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
                    </Col>
                    <Col span={12}>
                    <Space>
                    <div className="row-border">
                    <label><b>Answer By Trainee:</b></label>
                  </div>
                  <Button color="cyan" variant={answer.isApproved?"solid":"outlined"} icon={<CheckOutlined/>} onClick={()=>handleApprove(answer.question,true)}>Approve</Button>
                  <Button color="danger" variant={(!('isApproved' in answer)||answer.isApproved)?"outlined":"solid"} icon={<CloseOutlined/>} onClick={()=>handleApprove(answer.question,false)}>Decline</Button>
                    </Space>
                    
                <div>
                  <Select defaultValue={answer.answer.language}>
                    </Select>
                </div>
                <Editor
                height="90vh"
                language={answer.answer.language}
                value={answer.answer.code}
                options={{
                  selectOnLineNumbers: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
                </Col>
                </Row>
              </>
              )}
               {answer.questionType === 'descriptive' && (
                <Row gutter={16}>
                    <Col span={12}>
                    <Form form={form}>
              <Form.Item
              >
                <div className="row-border">
                    <label><b>Actual answer:</b></label>
                  </div>
                <Input.TextArea rows={4} value={actualAnswers[index].answer}/>
              </Form.Item>
              </Form>
                    </Col>
                    <Col span={12}>
                    <Form form={form}>
              <Form.Item
              >
                <Space>
                <div className="row-border">
                    <label><b>Answer By Trainee:</b></label>
                  </div>
                  <Button color="cyan" variant={answer.isApproved?"solid":"outlined"} icon={<CheckOutlined/>} onClick={()=>handleApprove(answer.question,true)}>Approve</Button>
                  <Button color="danger" variant={(!('isApproved' in answer)||answer.isApproved)?"outlined":"solid"} icon={<CloseOutlined/>} onClick={()=>handleApprove(answer.question,false)}>Decline</Button>
                </Space>
                <Input.TextArea rows={4} value={answer.answer.answer}/>
              </Form.Item>
              </Form>
                    </Col>  
                </Row>
              
            )}
            </TabPane>
          ))}
        </Tabs>
    </Content>
        </>
      );
}

export default AssessmentEvaluationPage;