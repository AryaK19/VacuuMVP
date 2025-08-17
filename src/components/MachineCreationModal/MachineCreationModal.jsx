import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, Alert, message } from 'antd';
import { BarcodeOutlined, TagOutlined, NumberOutlined, UploadOutlined } from '@ant-design/icons';
import { createPump, createPart } from '../../services/machine.service';
import './MachineCreationModal.css';

const MachineCreationModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  type, // 'pump' or 'part'
  title 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('serial_no', values.serial_no);
      formData.append('model_no', values.model_no);
      
      if (values.part_no) {
        formData.append('part_no', values.part_no);
      }
      
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      let response;
      if (type === 'pump') {
        response = await createPump(formData);
      } else {
        response = await createPart(formData);
      }
      
      if (response.success) {
        message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
        form.resetFields();
        setFileList([]);
        onSuccess();
      } else {
        setError(response.message || 'Creation failed. Please try again.');
      }
    } catch (error) {
      console.error("Creation error:", error);
      let errorMessage = 'Failed to create. Please try again.';
      
      if (error.detail) {
        errorMessage = Array.isArray(error.detail) 
          ? error.detail.map(err => err.msg).join(', ')
          : error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setError(null);
    onCancel();
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    
    return false; // Prevent automatic upload
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the last file
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="machine-creation-modal"
    >
      {error && (
        <Alert
          message="Creation Error"
          description={error}
          type="error"
          showIcon
          closable
          className="creation-error-alert"
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        name="machine-creation-form"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        className="machine-creation-form"
      >
        <Form.Item
          name="serial_no"
          rules={[{ required: true, message: 'Please input the serial number!' }]}
          label="Serial Number"
        >
          <Input 
            prefix={<BarcodeOutlined />} 
            placeholder="Serial Number" 
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="model_no"
          rules={[{ required: true, message: 'Please input the model number!' }]}
          label="Model Number"
        >
          <Input 
            prefix={<TagOutlined />} 
            placeholder="Model Number" 
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="part_no"
          label="Part Number (Optional)"
        >
          <Input 
            prefix={<NumberOutlined />} 
            placeholder="Part Number" 
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="Product Image (Optional)"
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            fileList={fileList}
            maxCount={1}
            accept="image/*"
            disabled={loading}
          >
            <Button icon={<UploadOutlined />} disabled={loading}>
              Upload Image
            </Button>
          </Upload>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Supported formats: JPG, PNG, GIF (Max: 5MB)
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              Create {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MachineCreationModal;
