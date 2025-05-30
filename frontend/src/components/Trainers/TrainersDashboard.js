import React from 'react';
import { Row, Col, Card, Statistic, List, Calendar, Collapse} from 'antd';
import { Bar, Line } from 'react-chartjs-2';
import { layouts } from 'chart.js';
import './TrainersDashboard.css'

const {Panel} = Collapse

const Dashboard = () => {
  const totalSessions = 20;
  const totalAssessments = 15;

//   const assessmentData = [
//     { session: 'Session 1', averageMarks: 75 },
//     { session: 'Session 2', averageMarks: 85 },
//     { session: 'Session 3', averageMarks: 90 },
//     { session: 'Session 4', averageMarks: 70 },
//     { session: 'Session 5', averageMarks: 80 },
//   ];

  // Ongoing Training Progress (Bar chart)
  const assessmentData = {
    labels: ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'],
    datasets: [
      {
        label: 'Assessment Report',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [75, 85, 90, 70, 80],
      },
    ],
  };

  const sessionFeedbacks = [
    { key: '1', feedback: 'Great session on React Basics!' },
    { key: '2', feedback: 'Very informative and well-structured.' },
    { key: '3', feedback: 'Loved the hands-on approach.' },
  ];

  const assessmentFeedbacks = [
    { key: '1', feedback: 'The assessment was challenging but fair.' },
    { key: '2', feedback: 'Good mix of theoretical and practical questions.' },
    { key: '3', feedback: 'Helped me understand my weak areas.' },
  ];

  const upcomingSessions = [
    { key: '1', date: '2025-02-01', title: 'Advanced JavaScript' },
    { key: '2', date: '2025-02-10', title: 'Node.js Fundamentals' },
    { key: '3', date: '2025-02-15', title: 'GraphQL Basics' },
  ];

  const barConfig = {
    data: assessmentData,
    xField: 'session',
    yField: 'averageMarks',
    color: '#1890ff',
  };

  const dateCellRender = (value) => {
    const listData = upcomingSessions.filter(
      (session) => session.date === value.format('YYYY-MM-DD')
    );
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.key}>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
         <Row className='row-border' gutter={16}>
        <Col span={24}>
        <Collapse>
    <Panel header="Calendar" key="1">
    <Calendar cellRender={dateCellRender}/>
    </Panel>
  </Collapse>
        {/* <Collapse>
          <Card title="Upcoming Sessions">
            <Calendar cellRender={dateCellRender}/>
          </Card>
          </Collapse> */}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card style={{textAlign:'center'}}>
            <Statistic title="Total Sessions" value={totalSessions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{textAlign:'center'}}>
            <Statistic title="Total Assessments" value={totalAssessments} />
          </Card>
        </Col>
      </Row>
      <Row className='row-border' gutter={16}>
        <Col span={12}>
          <Card title="Session Feedbacks">
            <List
              dataSource={sessionFeedbacks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta description={item.feedback} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Assessment Feedbacks">
            <List
              dataSource={assessmentFeedbacks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta description={item.feedback} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row className='row-border' gutter={16}>
        <Col span={24}>
          <Card title="Assessment Report">
                      <Bar
                        data={assessmentData}
                        options={{
                          responsive: true,
                          plugins: {
                            title: {
                              display: true,
                              text: 'Assessment vs Average Marks',
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
    </div>
  );
};

export default Dashboard;