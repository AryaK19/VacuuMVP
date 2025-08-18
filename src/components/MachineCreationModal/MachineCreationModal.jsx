import React, { useState } from 'react';
import { Form, Input, Upload, Button, Row, Col, Alert, message } from 'antd';
import { UploadOutlined, NumberOutlined, TagOutlined } from '@ant-design/icons';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import { createPump, createPart, getModelFromPart } from '../../services/machine.service';

/**
 * A modal for creating new machines (pumps or parts)
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls visibility of the modal
 * @param {Function} props.onCancel - Function called when modal is cancelled
 * @param {Function} props.onSuccess - Function called when creation is successful
 * @param {string} props.type - Type of machine to create ('pump' or 'part')
 * @param {string} [props.title] - Modal title
 */
const MachineCreationModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  type, 
  title,
  ...restProps 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [modelAutoFilled, setModelAutoFilled] = useState(false);
  
  // Reset form and errors when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setError('');
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.keys(values).forEach(key => {
        if (key === 'files' && values[key]) {
          // Fix: Check if fileList exists and is an array
          const fileList = Array.isArray(values[key]) ? values[key] : values[key].fileList;
          
          if (Array.isArray(fileList)) {
            fileList.forEach(file => {
              if (file.originFileObj) {
                formData.append('files', file.originFileObj);
              }
            });
          } else if (values[key].originFileObj) {
            // Handle case where a single file object is provided
            formData.append('files', values[key].originFileObj);
          }
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      
      // Call appropriate API based on type
      if (type === 'pump') {
        await createPump(formData);
      } else if (type === 'part') {
        await createPart(formData);
      }
      
      message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
      onSuccess();
    } catch (err) {
      setError(err.message || `Failed to create ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Handler for part_no blur/change to fetch model_no
  const handlePartNoBlur = async () => {
    const partNo = form.getFieldValue('part_no');
    if (!partNo) return;
    setModelLoading(true);
    setModelAutoFilled(false);
    try {
      const resp = await getModelFromPart(partNo);
      if (resp && resp.model_no) {
        form.setFieldsValue({ model_no: resp.model_no });
        setModelAutoFilled(true);
      } else {
        setModelAutoFilled(false);
        // Do not overwrite model_no, allow manual entry
      }
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onCancel={onCancel}
      title={title || `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      footer={null}
      width={800}
      {...restProps}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          {type === 'pump' && (
            <Col span={12}>
              <Form.Item
                name="serial_no"
                label="Serial Number"
                rules={[{ required: true, message: 'Please enter serial number' }]}
              >
                <Input prefix={<NumberOutlined />} placeholder="Serial Number" />
              </Form.Item>
            </Col>
          )}
          
          <Col span={12}>
            <Form.Item
              name="part_no"
              label="Part Number"
              rules={[{ required: true, message: 'Please enter part number' }]}
            >
              <Input
                prefix={<NumberOutlined />}
                placeholder="Part Number"
                onBlur={handlePartNoBlur}
                onPressEnter={handlePartNoBlur}
                autoComplete="off"
              />
            </Form.Item>
          </Col>
          
          <Col span={type === 'pump' ? 12 : 24}>
            <Form.Item
              name="model_no"
              label="Model Number"
              rules={[{ required: true, message: 'Please enter model number' }]}
            >
              <Input
                prefix={<TagOutlined />}
                placeholder="Model Number"
                disabled={modelLoading}
                autoComplete="off"
                // If autofilled, show a hint
                suffix={modelLoading ? <span style={{ color: '#1890ff' }}>Loading...</span> : (modelAutoFilled ? <span style={{ color: '#52c41a' }}>Auto-filled</span> : null)}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="files"
          label="Upload Files (Optional)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            multiple
            beforeUpload={() => false} // Prevent auto upload
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </div>
      </Form>
    </ModalWrapper>
  );
};

export default MachineCreationModal;
