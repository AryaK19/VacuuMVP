import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Alert,
  message,
  DatePicker,
  AutoComplete,
} from 'antd';
import {
  UploadOutlined,
  NumberOutlined,
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import { createSoldPump, getModelFromPart, getCustomerNames } from '../../services/machine.service';
import './SoldMachineCreationModal.css';

const { TextArea } = Input;

const SoldMachineCreationModal = ({
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
  const [customerOptions, setCustomerOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  // Reset form and errors when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setError('');
      setModelNotFound(false);
      setModelAutoFilled(false);
    }
  }, [visible, form]);

  // Fetch customer companies as user types
  const handleCompanySearch = async (value) => {
    if (!value || value.length < 2) {
      setCustomerOptions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await getCustomerNames(value);
      setCustomerOptions(
        (res.customers || []).map((c) => ({
          value: c.customer_company || '',
          label: (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 36, justifyContent: 'center' }}>
              <span style={{ fontWeight: 500 }}>{c.customer_company}</span>
              <span style={{ fontSize: 12, color: '#888' }}>
                {c.customer_name ? `${c.customer_name} | ` : ''}
                {c.customer_contact || ''} {c.customer_email ? `| ${c.customer_email}` : ''}
              </span>
            </div>
          ),
          data: c,
        }))
      );
    } catch {
      setCustomerOptions([]);
    } finally {
      setSearching(false);
    }
  };

  // When user selects a company, auto-fill other fields (but keep editable)
  const handleCompanySelect = (value, option) => {
    if (option && option.data) {
      const { customer_name, customer_contact, customer_email, customer_address, customer_company } = option.data;
      // Always set customer_company to the selected value (from option or input)
      form.setFieldsValue({
        customer_company: customer_company || value,
        customer_name: customer_name || '',
        customer_contact: customer_contact || '',
        customer_email: customer_email || '',
        customer_address: customer_address || '',
      });
    } else {
      // If not from option, set the input value directly
      form.setFieldsValue({
        customer_company: value,
      });
    }
  };

  // Ensure customer_company is always set from input if not selected from dropdown
  const handleCompanyChange = (value) => {
    form.setFieldsValue({ customer_company: value });
  };

  // Controlled value for customer_company
  const customerCompanyValue = Form.useWatch('customer_company', form);

  const handleSubmit = async (values) => {
    console.log('Form values:', values);
    if (modelNotFound || !modelAutoFilled) {
      setError('Model not found for the entered Part Number. Please enter a valid Part Number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = {
        serial_no: values.serial_no,
        part_no: values.part_no,
        model_no: values.model_no,
        customer_company: values.customer_company, // This will now always be set
        customer_name: values.customer_name,
        customer_contact: values.customer_contact,
        customer_email: values.customer_email,
        customer_address: values.customer_address,
        date_of_manufacturing: values.date_of_manufacturing
          ? values.date_of_manufacturing.format('YYYY-MM-DD')
          : undefined,
      };

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });

      await createSoldPump(data);

      message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
      onSuccess();
    } catch (err) {
      setError(err.message || `Failed to create ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
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

  // Ensure customer_company is always set on blur
  const handleCompanyBlur = (e) => {
    const value = e.target.value;
    if (value) {
      form.setFieldsValue({ customer_company: value });
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onCancel={onCancel}
      title={title || `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      footer={null}
      width={800}
      className="machine-creation-modal"
      {...restProps}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="creation-error-alert"
          style={{ marginBottom: 16 }}
        />
      )}

      {modelNotFound && (
        <Alert
          message="Machine not found"
          description="No model found for the entered Part Number. Please enter a valid Part Number."
          type="error"
          showIcon
          className="creation-error-alert"
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="machine-creation-form"
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
                  <span style={{ color: 'black' }}>
                    {modelLoading
                      ? <span style={{ color: '#1890ff' }}>Loading...</span>
                      : (modelAutoFilled
                        ? <span style={{ color: '#52c41a' }}>Auto-filled</span>
                        : null)
                    }
                  </span>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Customer Company"
              name="customer_company"
              rules={[
                { required: true, message: 'Please enter company name' },
                { min: 2, message: 'Company name must be at least 2 characters' }
              ]}
            >
              <AutoComplete
                options={customerOptions}
                onSearch={handleCompanySearch}
                onSelect={handleCompanySelect}
                onChange={handleCompanyChange}
                value={customerCompanyValue || ''}
                placeholder="Enter company name"
                size="large"
                allowClear
                filterOption={false}
                notFoundContent={searching ? 'Searching...' : null}
                onBlur={handleCompanyBlur}
              >
                <Input prefix={<ApartmentOutlined />} />
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Contact Person"
              name="customer_name"
              rules={[
                { required: true, message: 'Please enter customer name' },
                { min: 2, message: 'Customer name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Customer name"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Contact Number"
              name="customer_contact"
              rules={[
                { required: true, message: 'Please enter contact number' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid contact number' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Contact number"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="customer_email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email address"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Address"
          name="customer_address"
          rules={[
            { required: true, message: 'Please enter customer address' },
            { min: 10, message: 'Address must be at least 10 characters' }
          ]}
        >
          <TextArea
            prefix={<HomeOutlined />}
            placeholder="Enter complete address"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label="Date of Manufacturing"
          name="date_of_manufacturing"
          rules={[
            { required: true, message: 'Please select date of manufacturing' }
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="Select date"
            suffixIcon={<CalendarOutlined />}
          />
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
            icon={<CheckCircleOutlined />}
          >
            Create
          </Button>
        </div>
      </Form>
    </ModalWrapper>
  );
};

export default SoldMachineCreationModal;