import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Layout, Breadcrumb, message, Collapse } from 'antd';
// import AppHeader from '../Layout/Header';
// import AppFooter from '../Layout/Footer';
// import AppSidebar from '../Layout/Sidebar';
import { getTrainingPrograms, updateSubtopic } from './Trainingapi';

const { Content } = Layout;
const { Panel } = Collapse;

const TrainingPrograms = () => {
    const [trainingPrograms, setTrainingPrograms] = useState([]);
    const [editingSubtopic, setEditingSubtopic] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchTrainingPrograms();
    }, [currentPage, pageSize]);

    const fetchTrainingPrograms = async () => {
        try {
            const response = await getTrainingPrograms();
            setTrainingPrograms(response.data.data.programs);
        } catch (error) {
            console.error('Error fetching training programs:', error);
        }
    };

    const handleEditSubtopic = (subtopic) => {
        console.log('Editing subtopic:', subtopic); // Log the subtopic being edited
        setEditingSubtopic(subtopic);
        setIsModalVisible(true);
    };

    const handleUpdateSubtopic = async (values) => {
        console.log('Updating subtopic with values:', values); // Log the values being sent for update
        console.log('Current editing subtopic:', editingSubtopic); // Log the current editing subtopic
        try {
            await updateSubtopic(editingSubtopic.id, { // Use 'id' instead of 'subtopic_id'
                ...editingSubtopic,
                ...values
            });
            setIsModalVisible(false);
            fetchTrainingPrograms();
            message.success('Subtopic updated successfully');
        } catch (error) {
            console.error('Error updating subtopic:', error);
            message.error('Failed to update subtopic');
        }
    };

    const columns = [
        {
            title: 'Topic Name',
            dataIndex: 'topicName',
            key: 'topicName',
        },
        {
            title: 'Subtopic Name',
            dataIndex: 'subtopic_name',
            key: 'subtopic_name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Order Sequence',
            dataIndex: 'order_sequence',
            key: 'order_sequence',
        },
        {
            title: 'Hours',
            dataIndex: 'hours',
            key: 'hours',
        },
        {
            title: 'Agenda',
            dataIndex: 'agenda',
            key: 'agenda',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Button onClick={() => handleEditSubtopic(record)}>Edit</Button>
            ),
        },
    ];

    return (

        <Content
            style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
            }}
        >
            <div>
                <Collapse accordion>
                    {trainingPrograms.map(program => (
                        <Panel header={program.generalInfo.title} key={program.generalInfo.trainingprogram_id}>
                            <Table
                                dataSource={program.trainingPlan.mainTopics.flatMap(topic =>
                                    topic.subTopics.map(subtopic => ({
                                        ...subtopic,
                                        topicName: topic.name,
                                        subtopic_name: subtopic.name,
                                    }))
                                )}
                                columns={columns}
                                rowKey="id" // Use 'id' as the row key
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    },
                                }}
                            />
                        </Panel>
                    ))}
                </Collapse>

                <Modal
                    title="Edit Subtopic"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form
                        initialValues={{
                            subtopic_name: editingSubtopic?.name, // Ensure subtopic_name is set correctly
                            description: editingSubtopic?.description,
                            order_sequence: editingSubtopic?.order_sequence,
                            hours: editingSubtopic?.hours,
                            agenda: editingSubtopic?.agenda,
                        }}
                        onFinish={handleUpdateSubtopic}
                    >
                        <Form.Item name="subtopic_name" label="Subtopic Name">
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="order_sequence" label="Order Sequence">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="hours" label="Hours">
                            <Input type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item name="agenda" label="Agenda">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Content>

    );
};

export default TrainingPrograms;