// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect, useContext} from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Breadcrumb } from 'antd';
import AppHeader from '../Layout/Header';
import AppFooter from '../Layout/Footer';
import AppSidebar from '../Layout/Sidebar';
import AdminDashboard from '../Admin/AdminDashboard';
import CoordinatorDashboard from '../Coordinator/CoordinatorDashboard';
import TrainerDashboard from '../Trainers/TrainersDashboard'
import TraineeDashboard from '../Trainees/TraineesDashboard';
import GroupsPage from '../Admin/GroupManagement';
import BatchesPage from '../Admin/BatchManagement';
import TrainingProgramManagement from '../../pages/TrainingProgramManagement';
import CreateTrainingProgram from '../../pages/CreateTrainingProgram';
import ViewTrainingProgram from '../../pages/ViewTrainingProgram';
import AssignTrainings from '../Coordinator/TrainingProgramAssigned/Create-TrainingProgramAssign/AssignTrainings';
import ViewTrainingAssignments from '../Coordinator/TrainingProgramAssigned/View-TrainingProgramAssign/ViewTrainingAssignments';
import ViewTrainingAssignmentDetails from '../Coordinator/TrainingProgramAssigned/View-TrainingProgramAssign/ViewTrainingAssignmentDetails';
import AssignTrainingSteps from '../../pages/AssignTrainingSteps';
import EditTrainingSteps from '../../pages/EditTrainingSteps';
import FeedbackForm from '../Trainees/feedbackForm';
import AssessmentReport from '../Trainees/assessmentReport';
import AssessmentManagement from '../Coordinator/ManageAssessment';
import AssessmentForm from '../Coordinator/ConductAssessment';
import GroupManagement from '../Admin/GroupManagement';
import BatchManagement from '../Admin/BatchManagement';
import EditAssessment from '../Coordinator/ModifyAssessment';
import QADatasetManager from '../Trainers/DatasetQAHome';
import {TrainingMaterialUpload} from '../Trainees/materialsUpload';
import AddQA from '../Trainers/addDatasetQA';
import EditQA from '../Trainers/editDatasetQA';
import AssessmentList from '../Trainees/assessmentList';
import AssessmentPage from '../Trainees/assessmentPage';
import TrainingTracker from '../Trainers/TrainingTracker';
import TrainingProgram from '../Trainers/TrainingPrograms';
import LoginComponent from '../Login/LoginComponent';
import PrivateRoute from '../../utils/privateRoute'; // Import the PrivateRoute component
import {useAppContext,useAppUpdateContext} from '../../utils/ApplicationContext';
import TrainingProgressTracker from '../../pages/TrainingProgressTracker';
import AssessmentEvaluationPage from '../Trainers/AssessmentEvaluationPage';
import AssessmentListForEvaluation from '../Trainers/AssessmentListForEvaluation'
import AssessmentMetrics from '../Coordinator/AssessmentMetrics';

const { Content } = Layout;

const Dashboard = () => {
  const [role, setRole] = useState('trainer'); // Default role
  const[context,setContext] = useState(useAppContext());
  const location = useLocation();
  const appContext = useAppContext();
  // const appContext = useContext(AppContext);
  const updateContext = useAppUpdateContext();
  
  useEffect(() => {
    // Access the modelName from the location state
    if (appContext.state && appContext.state.modelName) {
      console.log('Logged in as:', appContext.state.modelName);
      // You can use this modelName to set the role or perform other actions
      setRole(appContext.state.modelName.toLowerCase());
    }
  }, [appContext?.state?.modelName]);

  // setRole(appContext.state.modelName);

  const getBreadcrumbs = (path) => {
    const pathMap = {
      '/groups': ['Home', 'Dashboard', 'Groups'],
      '/batches': ['Home', 'Dashboard', 'Batches'],
      '/trainings': ['Home', 'Dashboard', 'Training Program'],
      '/create-training': ['Home', 'Dashboard', 'Training Program', 'Create (or) Edit'],
    };
  
    // Handle parameterized paths
    if (path.startsWith('/create-training')) {
      return ['Home', 'Dashboard', 'Training Program', 'Create/Edit'];
    }
  
    return pathMap[path] || ['Home', 'Dashboard'];
  };

  const renderDashboardContent = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'coordinator':
        return <CoordinatorDashboard />;
      case 'trainer':
        return <TrainerDashboard />;
      case 'trainee':
        return <TraineeDashboard />;
      default:
        return <div>No dashboard available for this role.</div>;
    }
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Check if the current route is '/login'
  if (location.pathname === '/login') {
    return <LoginComponent />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar role={role}/>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbs.map((breadcrumb, index) => (
              <Breadcrumb.Item key={index}>{breadcrumb}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/" element={<PrivateRoute>{renderDashboardContent()}</PrivateRoute>} />
              <Route path="/groups" element={<PrivateRoute><GroupsPage /></PrivateRoute>} />
              <Route path="/batches" element={<PrivateRoute><BatchesPage /></PrivateRoute>} />
              <Route path='/trainings' element={<PrivateRoute><TrainingProgramManagement key={location.key} /></PrivateRoute>} />
              <Route path='/trainings/:id' element={<PrivateRoute><ViewTrainingProgram /></PrivateRoute>} />
              <Route path="/create-training/:programId?" element={<PrivateRoute><CreateTrainingProgram /></PrivateRoute>} />
              <Route path='/assign-training' element={<PrivateRoute><AssignTrainingSteps /></PrivateRoute>} />
              <Route path='/assign-training-steps/:programId' element={<PrivateRoute><EditTrainingSteps /></PrivateRoute>} />
              <Route path='/view-trainingassignments' element={<PrivateRoute><ViewTrainingAssignments /></PrivateRoute>} />
              <Route path='/view-training-assignments/details' element={<PrivateRoute><ViewTrainingAssignmentDetails /></PrivateRoute>} />
              <Route path="/feedback" element={<PrivateRoute><FeedbackForm /></PrivateRoute>} />
              <Route path="/assessmentReport" element={<PrivateRoute><AssessmentReport /></PrivateRoute>} />
              <Route path="/manage-datasets" element={<PrivateRoute><QADatasetManager /></PrivateRoute>} />
              <Route path="/create-dataset" element={<PrivateRoute><AddQA /></PrivateRoute>} />
              <Route path="/edit-dataset" element={<PrivateRoute><EditQA /></PrivateRoute>} />
              <Route path="/conductAssessment" element={<PrivateRoute><AssessmentManagement /></PrivateRoute>} />
              <Route path="/create-assessment" element={<PrivateRoute><AssessmentForm /></PrivateRoute>} />
              <Route path="/modifyAssessment/:id" element={<PrivateRoute><EditAssessment /></PrivateRoute>} />
              <Route path="/materialsUpload" element={<PrivateRoute><TrainingMaterialUpload /></PrivateRoute>} />
              <Route path="/assessment-list" element={<PrivateRoute><AssessmentList /></PrivateRoute>} />
              <Route path="/assessment-list-evaluation" element={<PrivateRoute><AssessmentListForEvaluation /></PrivateRoute>} />
              <Route path="/assessment/:assessmentId" element={<PrivateRoute><AssessmentPage /></PrivateRoute>} />
              <Route path="/evaluateAssessment" element={<PrivateRoute><AssessmentEvaluationPage {...location.state} /></PrivateRoute>} />
              <Route path="/training-tracker" element={<PrivateRoute><TrainingTracker /></PrivateRoute>} />
              <Route path="/login" element={<LoginComponent />} />
              <Route path='/training_progress' element={<TrainingProgressTracker/>}/>
              <Route path='/assessmentMetrics' element={<AssessmentMetrics/>}/>

            </Routes>
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;