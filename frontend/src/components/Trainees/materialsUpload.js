import React, { useEffect, useRef, useState } from 'react';
import {  Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_BASE_URL;

export const uploadTrainingResources = async (programId, trainingProgramName, resources, isNew) => {
  const formData = new FormData();
  resources.forEach((file)=>{
    file instanceof File?formData.append('files',file):formData.append('existingResources',file.name);
  });
  formData.append('TrainingProgram', trainingProgramName); // Use the extracted training program name
  formData.append('programId', programId); // Include the created program ID
  formData.append('isNew',isNew);

  message.loading("Uploading Files");
  try{
    const response = await api.post(`${baseUrl}api/coordinator/upload`,formData, {
      headers:{
        'Content-Type':'multipart/form-data'
      }      
    });
    response.status==200?message.success("Files uploaded successfully."):message.error("Error Uploading the Files.");
  return response?.data?.resources||[];
  } catch(error){
    console.log(error);
    message.error("Error uploading the Files.");
  }
}

export const TrainingMaterialUpload = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const {Option} = Select;

  let programId = 0;
  let trainingProgramName = '';

  const [assignedTrainings,setAssignedTrainings] = useState([]);

  useEffect(()=>{
    const fetchData = async() => {
      try{
        const response = await api.get('/coordinator/training-programs-title');
        console.log(response);
        setAssignedTrainings(response.data.rows);
      } catch(error) {
        console.log(error);
        message.error("Error Retrieving Training Programs.");
      }
    }
    fetchData();
  },[])

  const onFinish = async (values) => {
    const resources = values.file.fileList.map(obj=>obj.originFileObj);
    await uploadTrainingResources(programId,trainingProgramName,resources,true);
    formRef.current=null;
    navigate('/');
  };

  const handleSelection = (value,option) => {
    trainingProgramName = option.value;
    programId = option.key;
  }


  return (
    
          <div
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Form
              ref={formRef}
              name="upload_material_form"
              layout="vertical"
              onFinish={onFinish}
              style={{ maxWidth: '600px', margin: '0 auto' }}
            >
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please Select the title of the material!' }]}
              >
                <Select placeholder="Select the Training Program" onChange={handleSelection}>
                {assignedTrainings.map(training=>(
                  <Option key={training.trainingprogram_id} value={training.title}>{training.title}</Option>
                ))}
                </Select>
                {/* <Input placeholder="Enter the title" /> */}
              </Form.Item>

              {/* <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter the description" />
              </Form.Item> */}

              <Form.Item
                name="file"
                label="Upload File"
                rules={[{ required: true, message: 'Please upload the training material!' }]}
              >
                <Upload beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
            );
};