import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Tag, List, Flex, Tooltip, Carousel, Empty } from 'antd';
import './TraineesDashboard.css'
import api from '../../utils/api'
import {useAppContext,useAppUpdateContext} from '../../utils/ApplicationContext';

const Dashboard = () => {
  const userDetails = useAppContext();
  const [dashboardVariables, setDashboardVariables] = useState({
    completedTrainings: [],
    inProgressTrainings: [],
    pendingAssessments: [],
    assessmentReport: []
  });
  // let [completedTrainings, setCompletedTrainings] = useState([]);
  // let [inProgressTrainings, setInprogressTrainings] = useState([]);
  // let [pendingAssessments, setPendingAssessments] = useState([]);
  // let [assessmentReport, setAssessmentReport] = useState([]);

  useEffect(()=>{
    const fetchData = async() => {
      const response = await getTraineeDashboardData(userDetails.state.user.name);
      console.log(response);
      const dashboard = setDashboard(response.data);
      setDashboardVariables(dashboard);
      console.log(dashboardVariables);
    };
    fetchData();
  },[])

  const getColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'red';
    if (diffDays <= 7) return 'orange';
    return 'green';
  };

  const contentStyle = {
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  const getTraineeDashboardData = async (userName)=> {
    try {
      const response = await api.get('trainees/dashboard',{
        params:{
        userName: userName
        }
      }); 
      return response;     
    } catch (error) {
      console.error('Error fetching training programs:', error);
    }
  }

  const setDashboard = (dashboardData) => {
    const trainingProgress = dashboardData.trainingProgress;
    const pendingAssessments = dashboardData.pendingAssessments;

    let completed=[];
    let inProgress=[];
    let pending = [];
    let reports = [];

    for(let i=0; i<trainingProgress.length; i++){
      const progress = trainingProgress[i];
      if(progress.training_program_status==='Completed') {
        completed.push({
          key:i,
          name:progress.training_program_name,
        });
      } else {
        inProgress.push({
          key:i,
          name:progress.training_program_name,
          progress:progress.progress_percentage
        });
      }
    }

    for(let i=0; i<pendingAssessments.length; i++){
      const assessment = pendingAssessments[i];
      if(assessment.status==='Completed'){
        reports.push({
          key:i,
          name:assessment.title,
          marks:assessment.marks,
          status:assessment.pass?'Pass':'Fail',
        });
      } else {
        pending.push({
          key:i,
          name:assessment.title,
          dueDate:assessment.due_date,
        });
      }
    }

    return {completedTrainings:completed,
      inProgressTrainings:inProgress,
      pendingAssessments:pending,
      assessmentReport:reports,
    }
  };

  console.log(dashboardVariables);

  return (
    <div>
      <Row className='row-border' gutter={16}>
        <Col span={12}>
          <Card size='small' bordered={false} title="Completed Trainings">
          <div className="scrollable-card-content">
          {dashboardVariables.completedTrainings.length > 0 ? (
              <Carousel arrows infinite={true}>
                {dashboardVariables.completedTrainings.map((item) =>
                  <div key={item.name}>
                    <h3 style={contentStyle}> {item.name} </h3>
                  </div>
                )}
              </Carousel>
            ) : (
              <Empty description="No Completed Trainings" />
            )}
          </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size='small' title="Assessment Report">
            <div className="scrollable-card-content">
            {dashboardVariables.assessmentReport.length > 0 ? (
              <List
                dataSource={dashboardVariables.assessmentReport}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={
                        <>
                          Marks: {item.marks} <br />
                          <Tag color={item.status === 'Pass' ? 'green' : 'red'}>
                            {item.status}
                          </Tag>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No Assessment Reports" />
            )}
            </div>
          </Card>
        </Col>
      </Row>
      <Row className='row-border' gutter={16}>
        <Col span={12}>
          <Card size='small' title="In Progress Trainings">
          <div className="scrollable-card-content">
            <Flex gap={25} wrap>
            {dashboardVariables.inProgressTrainings.length > 0 ? (dashboardVariables.inProgressTrainings.map(training=>
              <Tooltip title={training.name}>
                <Progress type='dashboard' gapDegree={30} percent={Math.floor(training.progress)} />
              </Tooltip>
            )) : (
              <Empty description="No In Progress Trainings" />
            )}
            </Flex>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size='small' title="Pending Assessments">
          <div className="scrollable-card-content">
          {dashboardVariables.pendingAssessments.length > 0 ? (
              <List size='small'
                dataSource={dashboardVariables.pendingAssessments}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={
                        <Tag color={getColor(item.dueDate)}>
                          Due Date: {item.dueDate}
                        </Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No Pending Assessments" />
            )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;