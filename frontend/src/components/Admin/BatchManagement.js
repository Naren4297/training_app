import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Upload, Row, Col, List, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, PlusOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import moment from 'moment';
import { fetchBatches, createBatch, editBatch, deleteBatch } from './BatchService';
import * as XLSX from 'xlsx';
import bcryptjs from 'bcryptjs';


const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchForm] = Form.useForm();
  const [filters, setFilters] = useState({ batch_name: [], joined_date: [] });
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [excelTrainees, setExcelTrainees] = useState([]);

  const getBatches = async () => {
    try {
      const fetchedBatches = await fetchBatches();
      const batchNameFilters = [...new Set(fetchedBatches.map(item => item.name))].map(name => ({ text: name, value: name }));
      const joinedDateFilters = [...new Set(fetchedBatches.map(item => moment(item.joined_date).format('DD-MMM-YYYY')))].map(joined_date => ({ text: joined_date, value: joined_date }));
      setFilters(prevFilters => ({ ...prevFilters, batch_name: batchNameFilters, joined_date: joinedDateFilters }));
      setBatches(fetchedBatches);
    } catch (error) {
      message.error('Failed to fetch batches');
    }
  };

  useEffect(() => {
    getBatches();
  }, []);

  const showBatchModal = useCallback((batch) => {
    setEditingBatch(batch);
    setIsBatchModalVisible(true);
    setIsBulkUpload(false);
  }, []);

  const handleBatchCancel = useCallback(() => {
    setIsBatchModalVisible(false);
    setEditingBatch(null);
    batchForm.resetFields();
  }, [batchForm]);

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
  
      const trainees = json.map(row => ({
        employeeID: row['Employee ID'],
        name: row.Name,
        email: row.Email,
        password: row.Password,
        role:row.Role
      }));
  
      console.log('Trainees from Excel:', trainees); // Debugging line
      setExcelTrainees(trainees);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleBatchOk = useCallback(async (values) => {
    console.log("Form values on submit:", values); // Debugging line
    const { joined_date, batch_name, id, trainees } = values;
    const formattedDate = joined_date.format('YYYY-MM-DD');
  
    // Use trainees from form if available, otherwise use trainees from Excel file
    const finalTrainees = trainees && trainees.length > 0 ? trainees : excelTrainees;
  
    const encryptedTrainees = await Promise.all((finalTrainees || []).map(async (trainee) => ({
      ...trainee,
      password: await bcryptjs.hash(trainee.password, 10),
    })));
  
    const batchData = {
      id,
      batch_name,
      joined_date: formattedDate,
      trainees: encryptedTrainees,
    };
    console.log(batchData);
  
    try {
      if (editingBatch) {
        await editBatch(batchData);
        message.success('Batch updated successfully');
      } else {
        await createBatch(batchData);
        message.success('Batch created successfully');
      }
      getBatches(); // Refresh the batch data
    } catch (error) {
      message.error('Failed to save batch');
    }
    setIsBatchModalVisible(false);
    setEditingBatch(null);
    batchForm.resetFields();
    setExcelTrainees([]); // Reset the state variable
  }, [editingBatch, batchForm, excelTrainees]);


  const handleBatchDelete = useCallback((values) => {
    const id = values.id;
    Modal.confirm({
      title: `Are you sure you want to delete this batch - ${values.batch_name}?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBatch(id);
          message.success('Batch deleted successfully');
          getBatches(); // Refresh the batch data
        } catch (error) {
          message.error('Failed to delete batch');
        }
      },
    });
  }, []);

  const batchColumns = useMemo(() => [
    {
      title: 'Batch Name',
      dataIndex: 'name',
      width: 250,
      key: 'name',
      filters: filters.batch_name,
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: 'Joined Date',
      dataIndex: 'joined_date',
      width: 200,
      key: 'joined_date',
      render: (text) => moment(text).format('DD-MMM-YYYY'),
      filters: filters.joined_date,
      onFilter: (value, record) => moment(record.joined_date).format('DD-MMM-YYYY').includes(value),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 100,
      render: (text, record) => (
        <EditOutlined onClick={() => showBatchModal(record)} style={{ cursor: 'pointer', color: '#1890ff' }} />
      ),
    },
    {
      title: 'Delete',
      key: 'delete',
      width: 100,
      render: (text, record) => (
        <DeleteOutlined onClick={() => handleBatchDelete(record)} style={{ cursor: 'pointer', color: '#ff4d4f' }} />
      ),
    },
  ], [filters, showBatchModal, handleBatchDelete]);

  useEffect(() => {
    if (isBatchModalVisible) {
      if (editingBatch) {
        batchForm.setFieldsValue({
          ...editingBatch,
          batch_name: editingBatch.name,
          joined_date: moment(editingBatch.joined_date),
          trainees: editingBatch.batchTrainees || [],
        });
      } else {
        batchForm.resetFields();
      }
    }
  }, [isBatchModalVisible, editingBatch, batchForm]);

  return (
    <div>
      <Button type="primary" onClick={() => showBatchModal(null)}>Add Batch</Button>
      <Table columns={batchColumns} dataSource={batches} rowKey="id" style={{ marginTop: 16 }} />

      <Modal
        title={editingBatch ? "Edit Batch" : "Add Batch"}
        visible={isBatchModalVisible}
        onCancel={handleBatchCancel}
        footer={null}
        width={800}
      >
        <Form
          form={batchForm}
          onFinish={handleBatchOk}
          layout="vertical"
        >
          <Form.Item
            name="id"
            style={{ display: 'none' }}
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="batch_name"
            label="Batch Name"
            rules={[{ required: true, message: 'Please input the batch name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="joined_date"
            label="Joined Date"
            rules={[{ required: true, message: 'Please select the joined date!' }]}
          >
            <DatePicker format="DD-MMM-YYYY" />
          </Form.Item>
          {editingBatch ? (
            <>
              <List
                header={<div>Trainees</div>}
                bordered
                dataSource={batchForm.getFieldValue('trainees')}
                renderItem={(trainee) => (
                  
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="Are you sure you want to remove this trainee?"
                        onConfirm={() => {
                          const updatedTrainees = batchForm.getFieldValue('trainees').filter(t => t.employeeID !== trainee.employeeID);
                          batchForm.setFieldsValue({ trainees: updatedTrainees });
                        }}
                      >
                        <Button type="link" danger>Remove</Button>
                      </Popconfirm>
                    ]}
                  >
                    {trainee.name} ({trainee.employeeID})
                  </List.Item>
                )}
                style={{ maxHeight: '200px', overflowY: 'scroll', marginBottom: '16px' }}
              />
              <Form.List name="trainees">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                      <Row gutter={16} key={key}>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'employeeID']}
                            fieldKey={[fieldKey, 'employeeID']}
                            rules={[{ required: true, message: 'Missing employee ID' }]}
                          >
                            <Input placeholder="Employee ID" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            fieldKey={[fieldKey, 'name']}
                            rules={[{ required: true, message: 'Missing name' }]}
                          >
                            <Input placeholder="Name" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'email']}
                            fieldKey={[fieldKey, 'email']}
                            rules={[{ required: true, message: 'Missing email' }]}
                          >
                            <Input placeholder="Email" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'password']}
                            fieldKey={[fieldKey, 'password']}
                            rules={[{ required: true, message: 'Missing password' }]}
                          >
                            <Input.Password
                              placeholder="Password"
                              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                            icon={<DeleteOutlined />}
                          />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
                      >
                        Add Trainee
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          ) : (
            <>
              <Button type="dashed" onClick={() => setIsBulkUpload(!isBulkUpload)} style={{ width: '100%', marginBottom: 16 }}>
                {isBulkUpload ? "Add Trainee via Input" : "Bulk Add via File Upload"}
              </Button>
              {isBulkUpload ? (
                <Form.Item
                  name="excel_file"
                  label="Upload Excel File"
                  rules={[{ required: true, message: 'Please upload the Excel file!' }]}
                >
                  <Upload
                    beforeUpload={handleExcelUpload}
                    accept=".xlsx, .xls"
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              ) : (
                <Form.List name="trainees">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...restField }) => (
                        <Row gutter={16} key={key}>
                          <Col span={5}>
                            <Form.Item
                              {...restField}
                              name={[name, 'employeeID']}
                              fieldKey={[fieldKey, 'employeeID']}
                              rules={[{ required: true, message: 'Missing employee ID' }]}
                            >
                              <Input placeholder="Employee ID" />
                            </Form.Item>
                          </Col>
                          <Col span={5}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              fieldKey={[fieldKey, 'name']}
                              rules={[{ required: true, message: 'Missing name' }]}
                            >
                              <Input placeholder="Name" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'email']}
                              fieldKey={[fieldKey, 'email']}
                              rules={[{ required: true, message: 'Missing email' }]}
                            >
                              <Input placeholder="Email" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'password']}
                              fieldKey={[fieldKey, 'password']}
                              rules={[{ required: true, message: 'Missing password' }]}
                            >
                              <Input.Password
                                placeholder="Password"
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                            />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          style={{ width: '100%' }}
                        >
                          Add Trainee
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              )}
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingBatch ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BatchManagement;