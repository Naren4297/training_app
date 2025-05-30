import React from 'react';
import { Card, Row, Col } from 'antd';
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,  // PointElement for the "point" in line/bar charts
  LineElement,   // LineElement for the Line chart
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const barData = {
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

  const lineData = {
    labels: ['Training 1', 'Training 2', 'Training 3'],
    datasets: [
      {
        label: 'Pass',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        data: [65, 59, 80],
      },
      {
        label: 'Fail',
        fill: false,
        lineTension: 0.5,
        backgroundColor: 'rgba(255,99,132,1)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 2,
        data: [28, 48, 40],
      },
    ],
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="Overall Trainers" bordered={false}>
            10
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Overall Trainees" bordered={false}>
            50
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Trainings in Progress" bordered={false}>
            5
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Trainings Needed" bordered={false}>
            3
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Training Progress">
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Training Progress',
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
        <Col span={12}>
          <Card title="Training Results">
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Training Results',
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

export default AdminDashboard;