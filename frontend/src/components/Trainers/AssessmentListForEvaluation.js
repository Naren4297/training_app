import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useAppContext } from "../../utils/ApplicationContext";
import { Table,Layout, Button } from "antd";
import { data, useNavigate } from "react-router-dom";

const {Content} = Layout
const AssessmentListForEvaluation = () => {
    const[assessmentListForEvaluation, setAssessmentListForEvaluation] = useState([]);
    const userDetails = useAppContext();
    const navigate = useNavigate();
    useEffect(()=>{
        async function fetchData() {
            //fetch the Assessment Submission details from Mongo db to show it as a list
         const assessmentList = await api.get('/trainers/assessment-submissions',{
            params:{
                trainerName:userDetails.state.user.name,
            }
         })
         if(assessmentList.data!==assessmentListForEvaluation) setAssessmentListForEvaluation(assessmentList.data);
        //  setDataSource(assessmentListForEvaluation.map(assessment=>({
        //     assessment_id:assessment.objectId,
        //     qObjectId:assessment.qobjectId,
        //     trainingProgram:assessment.trainingProgram,
        //     assessment_name:assessment.assessmentName,
        //     assigned_trainee:assessment.traineeName,
        //     assigned_trainer:assessment.trainerName,
        //     // submission_date:assessment.assessmentendTime,
        // })));
        }   
        fetchData();   
    },
[userDetails.state.user.name]
);

const filterColumns = (columnName)=>{
    return assessmentListForEvaluation.map(row=>({
        text:row[columnName],
        value:row[columnName]
    }))
}

    const columns = [
        {
         title:'Training Program',
         dataIndex: 'trainingprogram',  
         key: 'trainingprogram',
         filter: filterColumns('trainingprogram'),
         filterMode: 'tree',
         filterSearch: true,
         onFilter: (value,record) => record.trainingprogram.includes(value),
        },
        {
            title:'Assessment Name',
            dataIndex: 'assessment_name',  
            key: 'assessment_name',
            filter: filterColumns('assessment_name'),
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value,record) => record.assessment_name.includes(value), 
        },
        {
            title:'Assigned Trainee',
            dataIndex: 'assigned_trainee',  
            key: 'assigned_trainee',
            filter: filterColumns('assigned_trainee'),
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value,record) => record.assigned_trainee.includes(value),  
        },
        {
            title:'Assigned Trainer',
            dataIndex: 'assigned_trainer',  
            key: 'assigned_trainer', 
            filter: filterColumns('assigned_trainer'),
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value,record) => record.assigned_trainer.includes(value), 
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                {/* <a onClick={() => navigate(`/evaluateAssessment/:${record.objectId}`)}>Evaluate Assessment</a> */}
              <Button type="primary" onClick={() => {
                const assessmentId = record.assessment_id;
                const userName = record.assigned_trainee;
                const objectId = record.qobjectid;
                const assignmentId = record.assignment_id;
                const passingCriteria = record.passingCriteria;
                
                navigate(`/evaluateAssessment`,{state:{assessmentId,userName,objectId,assignmentId,passingCriteria}});
                } }>
                Evaluate Assessment
              </Button>
                </>
                
            ),
        },
    ]

    console.log(assessmentListForEvaluation);
    console.log(columns);
    return(
        <>
        <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
             <Table columns={columns} dataSource={assessmentListForEvaluation} title={()=>(
                <>
                <Content  style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'left' }}>
                <b style={{}}>Submissions Pending Evaluation</b>
                </Content>
                </>
                )}/>
          </Content>
        </>
    )
}

export default AssessmentListForEvaluation;