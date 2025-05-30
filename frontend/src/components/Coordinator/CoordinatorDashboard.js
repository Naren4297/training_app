import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, ConfigProvider } from 'antd';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../utils/api';
import { useAppContext } from '../../utils/ApplicationContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CoordinatorDashboard = () => {
  const userDetails = useAppContext();
  // Sample data for the cards
  let cardData = {
    trainingsAssigned: 8,
    trainingsCompleted: 5,
    inProgressTrainings: 3,
    pendingAssessments: 7,
  };

  // Ongoing Training Progress (Bar chart)
  let barData = {
    labels: ['Training 1', 'Training 2', 'Training 3'],
    datasets: [
      {
        label: 'Training Progress',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [65, 59, 80],
      },
    ],
  };

  // Assessment Marks for each training (Line chart with curved lines)
  const lineData = {
    labels: ['Training 1', 'Training 2', 'Training 3'],
    datasets: [
      {
        label: 'Assessment Marks',
        fill: false,
        lineTension: 0.4,  // Makes the line curved
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        data: [80, 90, 75],
      },
    ],
  };

  console.log(userDetails);
  let dashboardData = GetTrainingReports(userDetails.state.user.name);
  return (
    <div>
            <ConfigProvider theme={{
                  token: {
                    // colorBgContainer: ' #add8e6', 
                    colorFillContent: ' #add8e6'
                  },
                }}>
      <Row gutter={16}>
        {/* Cards for Coordinator */}
        <Col xs={24} sm={12} md={8} lg={6} span={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Card style={{background: 'linear-gradient(180deg, #bb67ff 0%, #c484f3 100%', boxShadow: '0px 10px 20px 0px #e0c6f5'}} title="Trainings Assigned" bordered={false}>
            {dashboardData.cardData.trainingsAssigned}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} span={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{background: 'linear-gradient(180deg, #FF919D 0%, #FC929D 100%', boxShadow: '0px 10px 20px 0px #FDC0C7'}} title="Trainings Completed" bordered={false}>
            {dashboardData.cardData.trainingsCompleted}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} span={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{background: 'linear-gradient(rgb(248,212,154) -146.42%, rgb(255,202,113) -46.42%', boxShadow: '0px 10px 20px 0px #F9D59B'}} title="In-Progress Trainings" bordered={false}>
            {dashboardData.cardData.inProgressTrainings}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} span={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{background: 'linear-gradient(180deg,rgb(145, 255, 187) 0%,rgb(146, 252, 160) 100%', boxShadow: '0px 10px 20px 0pxrgb(199, 253, 192)'}}title="Pending Assessments" bordered={false}>
            {dashboardData.cardData.pendingAssessments}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Bar chart for ongoing training progress */}
        <Col span={12}>
          <Card title="Ongoing Training Progress">
            <Bar
              data={dashboardData.barData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Ongoing Training Progress',
                    fontSize: 20,
                  },
                  legend: {
                    display: true,
                    position: 'right',
                  },
                },
              }}
            />
          </Card>
        </Col>

        {/* Line chart for assessment marks */}
        <Col span={12}>
          <Card title="Assessment Marks">
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Assessment Marks for Trainings',
                    fontSize: 20,
                  },
                  legend: {
                    display: true,
                    position: 'right',
                  },
                },
              }}
            />
          </Card>
        </Col>
      </Row>
    </ConfigProvider>
    </div>
  );
};

function GetTrainingReports(userName) {
  console.log('Username-->',userName)
  const [trainingsAssigned, setTrainingsAssigned] = useState(0);
  const [trainingsCompleted, setTrainingsCompleted] = useState(0);
  const [inProgressTrainings, setInProgressTrainings] = useState(0);
  const [pendingAssessments, setPendingAssessments] = useState(0);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('coordinator/training-programs-status',{
          params:{
          userName: userName
          }
        });      
        setTrainingsAssigned(response.data.trainingsAssigned);
        setTrainingsCompleted(response.data.trainingsCompleted);
        setInProgressTrainings(response.data.inProgressTrainings);
        setPendingAssessments(response.data.pendingAssessments);
        setLabels(response.data.labels);
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching training programs:', error);
      }
    };
    fetchData();
  }, []);
  
  return {
   cardData : {
    trainingsAssigned : trainingsAssigned,
    trainingsCompleted : trainingsCompleted,
    inProgressTrainings : inProgressTrainings,
    pendingAssessments : pendingAssessments
  },
  barData : { 
    labels: labels,
    datasets: [
      {
        label: 'Training Progress',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: data,
      },
    ]
  }
}
}

export default CoordinatorDashboard;
