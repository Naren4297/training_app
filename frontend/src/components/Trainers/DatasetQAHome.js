
import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Collapse, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const { Panel } = Collapse;
const { confirm } = Modal;
const baseUrl = process.env.REACT_APP_BASE_URL;

console.log('Base')

const QADatasetManager = () => {
  const [datasets, setDatasets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get(`${baseUrl}api/trainers/get-dataset-names`);
        setDatasets(response.data);
      } catch (error) {
        message.error('Error fetching datasets');
        console.error('Error fetching datasets:', error);
      }
    };

    fetchDatasets();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (dataset) => {
    navigate('/edit-dataset', { state: { dataset } });
  };

  const showDeleteConfirm = (datasetName) => {
    confirm({
      title: 'Are you sure you want to delete this dataset?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => handleDelete(datasetName),
    });
  };

  const handleDelete = async (datasetName) => {
    try {
      await api.delete(`${baseUrl}api/trainers/delete-dataset/${datasetName}`);
      setDatasets(datasets.filter((d) => d.datasetName !== datasetName));
      message.success('Dataset deleted successfully');
    } catch (error) {
      message.error('Error deleting dataset');
      console.error('Error deleting dataset:', error);
    }
  };

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.datasetName && dataset.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Manage Q&A Datasets</h1>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create-dataset')}>
                Create QA Dataset
              </Button>
            </div>
            <Input
              placeholder="Search datasets"
              value={searchTerm}
              onChange={handleSearch}
              style={{ marginBottom: '20px' }}
            />
            <Collapse>
              {filteredDatasets.map((item) => (
                <Panel
                  header={item.datasetName}
                  key={item.datasetName}
                  extra={
                    <>
                      <EditOutlined onClick={() => handleEdit(item)} style={{ marginRight: 16 }} />
                      <DeleteOutlined onClick={() => showDeleteConfirm(item.datasetName)} />
                    </>
                  }
                >
                  <p><strong>Dataset Name:</strong> {item.datasetName}</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Topic:</strong> {item.topic}</p>
                  <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date(item.updatedAt).toLocaleString()}</p>
                </Panel>
              ))}
            </Collapse>
          </div>
          
  );
};

export default QADatasetManager;