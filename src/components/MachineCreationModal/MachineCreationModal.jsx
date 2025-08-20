import React, { useState } from 'react';
import { Form, Input, Upload, Button, Row, Col, Alert, message } from 'antd';
import { UploadOutlined, NumberOutlined, TagOutlined } from '@ant-design/icons';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import { createPump, createPart, getModelFromPart } from '../../services/machine.service';

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
  const [modelNotFound, setModelNotFound] = useState(false);

  // Reset form and errors when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setError('');
      setModelNotFound(false);
      setModelAutoFilled(false);
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    if (modelNotFound || !modelAutoFilled) {
      setError('Model not found for the entered Part Number. Please enter a valid Part Number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Add form fields to FormData
      Object.keys(values).forEach(key => {
        if (key === 'files' && values[key]) {
          const fileList = Array.isArray(values[key]) ? values[key] : values[key].fileList;
          if (Array.isArray(fileList)) {
            fileList.forEach(file => {
              if (file.originFileObj) {
                formData.append('files', file.originFileObj);
              }
            });
          } else if (values[key].originFileObj) {
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
    if (!partNo) {
      setModelNotFound(false);
      setModelAutoFilled(false);
      form.setFieldsValue({ model_no: '' });
      return;
    }
    setModelLoading(true);
    setModelAutoFilled(false);
    setModelNotFound(false);
    try {
      const resp = await getModelFromPart(partNo);
      if (resp && resp.model_no) {
        form.setFieldsValue({ model_no: resp.model_no });
        setModelAutoFilled(true);
        setModelNotFound(false);
      } else {
        form.setFieldsValue({ model_no: '' });
        setModelAutoFilled(false);
        setModelNotFound(true);
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

      {modelNotFound && (
        <Alert
          message="Machine not found"
          description="No model found for the entered Part Number. Please enter a valid Part Number."
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
              rules={[
                { required: true, message: 'Model number will be auto-filled' }
              ]}
            >
              <Input
                prefix={<TagOutlined />}
                placeholder="Model Number"
                disabled
                autoComplete="off"
                value={form.getFieldValue('model_no')}
                suffix={
                  modelLoading
                    ? <span style={{ color: '#1890ff' }}>Loading...</span>
                    : (modelAutoFilled
                      ? <span style={{ color: '#52c41a' }}>Auto-filled</span>
                      : null)
                }
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
            beforeUpload={() => false}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={modelNotFound || !modelAutoFilled}
          >
            Create
          </Button>
        </div>
      </Form>
    </ModalWrapper>
  );
};

export default MachineCreationModal;