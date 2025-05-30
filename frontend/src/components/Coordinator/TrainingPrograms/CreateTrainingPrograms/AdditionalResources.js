import React from "react";
import { 
  Upload, 
  message, 
  Card, 
  Space, 
  Typography, 
  List,
  Button,
  theme, Flex 
} from "antd";
import { 
  InboxOutlined,
  FileOutlined,
  DeleteOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AdditionalResources({ formData, setFormData }) {
  const { token } = theme.useToken();

  const props = {
    name: "file",
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidFile = file.size / 1024 / 1024 < 50; // 50MB limit
      if (!isValidFile) {
        message.error(`${file.name} must be smaller than 50MB!`);
        return false;
      }
  
      setFormData((prevFormData) => {
        const updatedFiles = [...(prevFormData.resources || []), file];
        return { ...prevFormData, resources: updatedFiles, isChanged:true};
      });
  
      message.success({
        content: `${file.name} added successfully`,
        icon: <UploadOutlined style={{ color: token.colorSuccess }} />
      });
  
      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      setFormData((prevFormData) => {
        const updatedFiles = prevFormData.resources.filter((f) => f.name !== file.name);
        return { ...prevFormData, resources: updatedFiles, isChanged:true};
      });
      message.info(`${file.name} removed`);
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false}>
          <Space direction="vertical" size="middle">
            <Title level={4}>Training Resources</Title>
            <Paragraph type="secondary">
              Upload any additional materials needed for the training program such as documents,
              presentations, or reference materials. Supported file types: PDF, DOC, DOCX, PPT, PPTX
            </Paragraph>

            <Dragger {...props} style={{ 
              padding: '32px',
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              border: `1px dashed ${token.colorPrimary}`,
              transition: 'border-color 0.3s',
              marginTop: '16px'
            }}>
              <motion.div variants={itemVariants}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ 
                    fontSize: '48px', 
                    color: token.colorPrimary 
                  }} />
                </p>
                <p className="ant-upload-text" style={{ 
                  fontSize: '16px',
                  color: token.colorTextHeading
                }}>
                  Click or drag files to this area to upload
                </p>
                <p className="ant-upload-hint" style={{ color: token.colorTextSecondary }}>
                  Support for single or bulk upload of training materials
                </p>
              </motion.div>
            </Dragger>
          </Space>
        </Card>

        {formData.resources?.length > 0 && (
          <Card 
            title="Uploaded Resources" 
            bordered={false}
            style={{ marginTop: '24px' }}
          >
            <List
              dataSource={formData.resources}
              renderItem={(file, index) => (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => props.onRemove(file)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined style={{ fontSize: '24px', color: token.colorPrimary }} />}
                      title={file.name}
                      description={`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </List.Item>
                </motion.div>
              )}
            />
          </Card>
        )}
      </Space>
    </motion.div>
  );
}

export default AdditionalResources;