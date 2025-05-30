import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Collapse } from 'antd';
import { fetchEntities, createEntity, editEntity, deleteEntity } from './GroupService';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppContext } from "../../utils/ApplicationContext";
import bcryptjs from 'bcryptjs';

const { Panel } = Collapse;
const { Search } = Input;

const GroupManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [entityForm] = Form.useForm();
  const [entityType, setEntityType] = useState('');
  const [searchText, setSearchText] = useState('');
  const userDetails = useAppContext();

  const entityTypes = ['admins', 'coordinators', 'trainers'];

  const showModal = (entity, type) => {
    setEditingEntity(entity);
    setEntityType(type);
    setIsModalVisible(true);
  };

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingEntity(null);
    entityForm.resetFields();
  }, [entityForm]);

  useEffect(() => {
    const getEntities = async () => {
      try {
        const [fetchedAdmins, fetchedCoordinators, fetchedTrainers] = await Promise.all(entityTypes.map(type => fetchEntities(type)));
        setAdmins(fetchedAdmins.map(admin => ({ ...admin, entity_type: 'admins' })));
        setCoordinators(fetchedCoordinators.map(coordinator => ({ ...coordinator, entity_type: 'coordinators' })));
        setTrainers(fetchedTrainers.map(trainer => ({ ...trainer, entity_type: 'trainers' })));
      } catch (error) {
        message.error('Failed to fetch entities');
      }
    };

    getEntities();
  }, []);

  const handleOk = useCallback(async (values) => {
    const { id, name, employeeID, email, department } = values;

    const entityData = {
      id,
      name,
      employeeID,
      email,
      department,
    };

    try {
      if (editingEntity) {
        await editEntity(entityType, entityData);
        const updatedEntities = (entityType === 'admins' ? admins : entityType === 'coordinators' ? coordinators : trainers).map((entity) => entity.id === editingEntity.id ? { ...entity, ...entityData } : entity);
        if (entityType === 'admins') setAdmins(updatedEntities);
        else if (entityType === 'coordinators') setCoordinators(updatedEntities);
        else setTrainers(updatedEntities);
        message.success('Entity updated successfully');
      } else {
        const hashedPassword = await bcryptjs.hash(values.password, 10);
        const newEntity = await createEntity(entityType, { ...entityData, password: hashedPassword });
        const updatedEntities = [...(entityType === 'admins' ? admins : entityType === 'coordinators' ? coordinators : trainers), newEntity];
        if (entityType === 'admins') setAdmins(updatedEntities);
        else if (entityType === 'coordinators') setCoordinators(updatedEntities);
        else setTrainers(updatedEntities);
        message.success('Entity created successfully');
      }
    } catch (error) {
      message.error('Failed to save entity');
    }

    setIsModalVisible(false);
    setEditingEntity(null);
    entityForm.resetFields();
  }, [editingEntity, entityForm, entityType, admins, coordinators, trainers]);

  const handleEntityDelete = useCallback((entity, type) => {
    const { id } = entity;
    Modal.confirm({
      title: `Are you sure you want to delete this ${type.slice(0, -1)}?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteEntity(type, id);
          const updatedEntities = (type === 'admins' ? admins : type === 'coordinators' ? coordinators : trainers).filter((entity) => entity.id !== id);
          if (type === 'admins') setAdmins(updatedEntities);
          else if (type === 'coordinators') setCoordinators(updatedEntities);
          else setTrainers(updatedEntities);
          message.success('Entity deleted successfully');
        } catch (error) {
          message.error('Failed to delete entity');
        }
      },
    });
  }, [admins, coordinators, trainers]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const getFilteredData = (data) => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.employeeID.toString().includes(searchText)  ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.department.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeID',
      key: 'employeeID',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => showModal(record, record.entity_type)}>Edit</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleEntityDelete(record, record.entity_type)}>Delete</Button>
        </span>
      ),
    },
  ];

  useEffect(() => {
    if (isModalVisible) {
      if (editingEntity) {
        entityForm.setFieldsValue({...editingEntity});
      } else {
        entityForm.resetFields();
      }
    }
  }, [isModalVisible, editingEntity, entityForm]);

  return (
    <div>
      <Collapse accordion>
        {userDetails.state.modelName=='admin'&& (
          <Panel header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Admins <span>{`Number of Admin(s): ${admins.length}`}</span></div>} key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null, 'admins')}>Add Admin</Button>
            <Search placeholder="Search Admins" onChange={handleSearch} style={{ marginBottom: 16, width: '300px' }} />
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table
                columns={columns}
                dataSource={getFilteredData(admins)}
                rowKey="id"
                pagination={false}
              />
            </div>
          </Panel>
        )}
        {userDetails.state.modelName=='admin'&& (
          <Panel header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Coordinators <span>{`Number of Coordinator(s): ${coordinators.length}`}</span></div>} key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null, 'coordinators')}>Add Coordinator</Button>
            <Search placeholder="Search Coordinators" onChange={handleSearch} style={{ marginBottom: 16, width: '300px' }} />
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table
                columns={columns}
                dataSource={getFilteredData(coordinators)}
                rowKey="id"
                pagination={false}
              />
            </div>
          </Panel>
        )}
        <Panel header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Trainers <span>{`Number of Trainer(s): ${trainers.length}`}</span></div>} key="3">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null, 'trainers')}>Add Trainer</Button>
          <Search placeholder="Search Trainers" onChange={handleSearch} style={{ marginBottom: 16, width: '300px' }} />
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table
              columns={columns}
              dataSource={getFilteredData(trainers)}
              rowKey="id"
              pagination={false}
            />
          </div>
        </Panel>
      </Collapse>

      <Modal
        title={editingEntity ? `Edit ${entityType ? entityType.slice(0, -1) : ''}` : `Add ${entityType.slice(0, -1)}`}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={entityForm}
          onFinish={handleOk}
        >
          <Form.Item
            name="id"
            style={{ display: 'none' }}
            >
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="employeeID" label="Employee ID" rules={[{ required: true, message: 'Please enter the employee ID!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email!' },{ type: 'email', message: 'Please enter a valid email!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please enter the department!' }]}>
            <Input />
          </Form.Item>
          {!editingEntity && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter the password!' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEntity ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagement;