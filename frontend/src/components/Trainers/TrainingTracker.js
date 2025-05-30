import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Layout, Breadcrumb, message } from 'antd';
// import AppHeader from '../Layout/Header';
// import AppFooter from '../Layout/Footer';
// import AppSidebar from '../Layout/Sidebar';
import { getTrainingPrograms, updateSubtopic } from './Trainingapi';

const { Content } = Layout;

const TrainingPrograms = () => {
    const [trainingPrograms, setTrainingPrograms] = useState([]);
    const [editingSubtopic, setEditingSubtopic] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchTrainingPrograms();
    }, []);

    const fetchTrainingPrograms = async () => {
        try {
            const response = await getTrainingPrograms();
            setTrainingPrograms(response.data.data.programs);
        } catch (error) {
            console.error('Error fetching training programs:', error);
        }
    };

    const handleEditSubtopic = (subtopic) => {
        setEditingSubtopic(subtopic);
        setIsModalVisible(true);
    };

    const handleUpdateSubtopic = async (values) => {
        try {
            await updateSubtopic(editingSubtopic.subtopic_id, {
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
            title: 'Program Title',
            dataIndex: 'programTitle',
            key: 'programTitle',
        },
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
            render: (text, record) => {
                console.log('records date:'+JSON.stringify(record)); // Log the record for debugging
                return <Button onClick={() => handleEditSubtopic(record)}>Edit</Button>;
            },
        },
    ];

    const dataSource = [];
    trainingPrograms.forEach(program => {
        program.trainingPlan.mainTopics.forEach(topic => {
            topic.subTopics.forEach(subtopic => {
                dataSource.push({
                    ...subtopic,
                    programTitle: program.generalInfo.title,
                    topicName: topic.name,
                    subtopic_id: subtopic.subtopic_id,
                });
            });
        });
    });

    return (
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        <div>
                            <Table
                                dataSource={dataSource}
                                columns={columns}
                                rowKey="subtopic_id"
                                pagination={false} // Disable pagination to show all records at once
                            />

                            <Modal
                                title="Edit Subtopic"
                                visible={isModalVisible}
                                onCancel={() => setIsModalVisible(false)}
                                footer={null}
                            >
                                <Form
                                    initialValues={editingSubtopic}
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