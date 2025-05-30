import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, Alert, Space, Button, message, Row, Col, Card } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../../../../utils/ApplicationContext';

import { getTrainingAssignments, deleteTrainingAssignment, getTrainingAssignmentDetails, getFormattedTrainingAssignmentDetails } from "../../../../configs/coordinator_api_config";

const { Title } = Typography;

const ViewTrainingAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userDetails = useAppContext();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await getTrainingAssignments();
                setAssignments(response.data);
            } catch (err) {
                setError('Failed to load training assignments');
                console.error('Error fetching assignments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    console.log(assignments);
    const handleView = async (assignment) => {
        try {
            setLoading(true);
            
            const response = await getTrainingAssignmentDetails(assignment.trainingprogram_id);
            // Assuming you're using react-router-dom for navigation
            navigate('/view-training-assignments/details', {
                state: { assignmentDetails: response.data }
            });
        } catch (error) {
            message.error("Failed to load training assignment details");
            console.error("Error loading assignment details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (assignment) => {
        try {
            setLoading(true);
            ;
            // const response = await getFormattedTrainingAssignmentDetails(record.trainingprogram_id);
            // navigate('/assign-training', { state: { assignmentData: response.data, isEditMode: true } });

            // const response = await getFormattedTrainingAssignmentDetails(record.trainingprogram_id);
            navigate(`/assign-training-steps/${assignment.trainingprogram_id}`);
        } catch (error) {
            message.error("Failed to load training assignment details");
            console.error("Error loading assignment details:", error);
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleDelete = async (assignment) => {
        try {
            
            const response = await deleteTrainingAssignment(assignment.trainingprogram_id);
            if(response.status == 200){
                message.success("Training program created successfully!");
                const updatedResponse = await getTrainingAssignments();
                setAssignments(updatedResponse.data);
            }
            else
                message.error("Failed to delete training program")

          } catch (error) {
            message.error("Failed to delete training program.");
            console.log("Training Assignemnt delete error: " + error);
          }
        console.log('Delete assignment:', assignment);
        // TODO: Implement Delete functionality
    };

    // const columns = [
    //     {
    //         title: 'Training Program',
    //         dataIndex: 'training_program_name',
    //         key: 'training_program_name',
    //     },
    //     {
    //         title: 'Level',
    //         dataIndex: 'assignment_level',
    //         key: 'assignment_level',
    //     },
    //     {
    //         title: 'Assigned Batches',
    //         dataIndex: 'batch_names',
    //         key: 'batch_names',
    //         render: (batches) => Array.from(new Set(batches?.flat())).join(', ') || 'N/A',
    //     },
    //     {
    //         title: 'Total Subtopics',
    //         dataIndex: 'total_subtopics',
    //         key: 'total_subtopics',
    //     },
    //     {
    //         title: 'Actions',
    //         key: 'actions',
    //         render: (text, record) => (
    //             <Space size="middle">
    //                 <Button 
    //                     type="primary" 
    //                     icon={<EyeOutlined />} 
    //                     onClick={() => handleView(record)}
    //                 >
    //                     View Details
    //                 </Button>
    //                 <Button 
    //             type="default" 
    //             icon={<EditOutlined />} 
    //             onClick={() => handleEdit(record)}
    //         >
    //             Edit
    //         </Button>
    //                 <Button 
    //                     type="danger" 
    //                     icon={<DeleteOutlined />} 
    //                     onClick={() => handleDelete(record)}
    //                 >
    //                     Delete
    //                 </Button>
    //             </Space>
    //         ),
    //     },
    // ];

    const rowCount = Math.ceil(assignments.length/3);
    const colCount = 3;

    return (
        <>
           <h2>Training Assignments</h2>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <Row gutter={16} key={rowIndex}>
          {Array.from({ length: colCount }).map((_, colIndex) => {
            const assignmentIndex = rowIndex * colCount + colIndex;
            return (
              assignmentIndex < assignments.length && (
                <Col span={8} key={colIndex}>
                  <Card
                    title={assignments[assignmentIndex]?.training_program_name}
                    actions={[
                        (<EyeOutlined key="view" onClick={()=>handleView(assignments[assignmentIndex])}/>),
                        // (userDetails.state.modelName==='coordinator' &&  <EditOutlined key="edit" onClick={()=>handleEdit(assignments[assignmentIndex])}/>),
                        (userDetails.state.modelName==='coordinator' && <DeleteOutlined key="delete" onClick={()=>handleDelete(assignments[assignmentIndex])}/>),
                      ].filter(Boolean)}
                  >
                    <Space direction='vertical'>
                    {assignments[assignmentIndex]?.training_programs?.description}
                    {assignments[assignmentIndex]?.training_programs?.start_date && (new Date(assignments[assignmentIndex]?.training_programs?.start_date).toLocaleDateString())}
                    </Space>
                  </Card>
                </Col>
              )
            );
          })}
        </Row>
      ))}
      </>
    );
};

export default ViewTrainingAssignments;
