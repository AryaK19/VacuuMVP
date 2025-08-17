import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Spin, Image, Row, Col, Typography, Empty, Button, Table, message } from 'antd';
import { 
  FileImageOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  FileOutlined,
  ToolOutlined,
  SettingOutlined,
  FilePdfOutlined,
  UserOutlined
} from '@ant-design/icons';
import { downloadServiceReportPDF } from '../../services/dashboard.service';
import './ServiceReportDetailsModal.css';

const { Title, Text } = Typography;

const ServiceReportDetailsModal = ({
  visible,
  onClose,
  reportData,
  loading
}) => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Function to get service type color for tags
  const getServiceTypeColor = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'warranty':
        return 'green';
      case 'paid':
        return 'blue';
      case 'amc':
        return 'orange';
      case 'health check':
        return 'red';
      case 'installation':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to format manufacturing date
  const formatManufacturingDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to check if file is an image
  const isImageFile = (fileKey) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => 
      fileKey.toLowerCase().includes(ext)
    );
  };

  // Function to get file name from file key
  const getFileName = (fileKey) => {
    const parts = fileKey.split('/');
    return parts[parts.length - 1];
  };

  // Function to handle file download
  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle PDF download
  const handlePdfDownload = async () => {
    if (!reportData?.id) return;
    
    try {
      setPdfDownloading(true);
      const result = await downloadServiceReportPDF(reportData.id);
      message.success(`PDF downloaded successfully: ${result.filename}`);
    } catch (error) {
      message.error('Failed to download PDF');
      console.error('PDF download error:', error);
    } finally {
      setPdfDownloading(false);
    }
  };

  // Filter images and other files
  const images = reportData?.files?.filter(file => isImageFile(file.file_key)) || [];
  const otherFiles = reportData?.files?.filter(file => !isImageFile(file.file_key)) || [];

  // Parts table columns
  const partsColumns = [
    {
      title: 'Serial No',
      dataIndex: 'machine_serial_no',
      key: 'machine_serial_no',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Model No',
      dataIndex: 'machine_model_no',
      key: 'machine_model_no',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Part No',
      dataIndex: 'machine_part_no',
      key: 'machine_part_no',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color="blue">{quantity}</Tag>
      )
    },
    {
      title: 'Added At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    }
  ];

  return (
<Modal
  title={
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      <span style={{ marginRight: 24 }}>Service Report Details</span>
      <Button
        type="primary"
        icon={<FilePdfOutlined />}
        loading={pdfDownloading}
        onClick={handlePdfDownload}
        disabled={!reportData?.id}
      >
        Download PDF
      </Button>
    </div>
  }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="service-report-details-modal"
    >
      <Spin spinning={loading}>
        {reportData && (
          <div>
            {/* Basic Information */}
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Service Type">
                <Tag color={getServiceTypeColor(reportData.service_type_name)}>
                  {reportData.service_type_name}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Service Person">
                {reportData.service_person_name || 'Not specified'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Created By">
                {reportData.user_name}
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                {reportData.user_email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Created At">
                {formatDate(reportData.created_at)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Updated At">
                {formatDate(reportData.updated_at)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Problem" span={2}>
                {reportData.problem || 'No problem description provided'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Solution" span={2}>
                {reportData.solution || 'No solution provided'}
              </Descriptions.Item>
            </Descriptions>

            {/* Customer Information */}
            {reportData.customer_info && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <UserOutlined /> Customer Information
                </Title>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Customer Name">
                    {reportData.customer_info.customer_name || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Contact">
                    {reportData.customer_info.customer_contact || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Email">
                    {reportData.customer_info.customer_email || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Purchase Date">
                    {formatDate(reportData.customer_info.sold_date)}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Address" span={2}>
                    {reportData.customer_info.customer_address || 'Not specified'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Machine Information */}
            {reportData.machine_info && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <SettingOutlined /> Machine Information
                </Title>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Serial No">
                    {reportData.machine_info.serial_no || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Model No">
                    {reportData.machine_info.model_no || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Part No">
                    {reportData.machine_info.part_no || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Type">
                    {reportData.machine_info.type_name || 'Not specified'}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Manufacturing Date" span={2}>
                    {formatManufacturingDate(reportData.machine_info.date_of_manufacturing)}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Service Parts Information */}
            {reportData.parts && reportData.parts.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <ToolOutlined /> Service Parts ({reportData.parts.length})
                </Title>
                <Table
                  columns={partsColumns}
                  dataSource={reportData.parts}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  bordered
                />
              </div>
            )}

            {/* Images Section */}
            {images.length > 0 && (
              <div className="files-section">
                <Title level={5} style={{ marginBottom: 16 }}>
                  <FileImageOutlined /> Service Images ({images.length})
                </Title>
                <Row gutter={[16, 16]}>
                  {images.map((file, index) => (
                    <Col xs={12} sm={8} md={6} key={file.id}>
                      <div className="image-item">
                        <Image
                          src={file.file_url}
                          alt={getFileName(file.file_key)}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                          preview={{
                            mask: (
                              <div style={{ textAlign: 'center' }}>
                                <EyeOutlined style={{ fontSize: '20px' }} />
                                <div>Preview</div>
                              </div>
                            )
                          }}
                        />
                        <div className="image-actions">
                          <Button
                            type="text"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(file.file_url, getFileName(file.file_key))}
                          >
                            Download
                          </Button>
                        </div>
                        <Text className="file-name" ellipsis>
                          {getFileName(file.file_key)}
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Other Files Section */}
            {otherFiles.length > 0 && (
              <div className="files-section">
                <Title level={5} style={{ marginBottom: 16 }}>
                  <FileOutlined /> Other Files ({otherFiles.length})
                </Title>
                <Row gutter={[8, 8]}>
                  {otherFiles.map((file) => (
                    <Col xs={24} sm={12} key={file.id}>
                      <div className="file-item">
                        <FileOutlined className="file-icon" />
                        <Text className="file-name" ellipsis>
                          {getFileName(file.file_key)}
                        </Text>
                        <Button
                          type="link"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(file.file_url, getFileName(file.file_key))}
                        >
                          Download
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* No Files Message */}
            {(!reportData.files || reportData.files.length === 0) && (
              <div className="files-section">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No files attached to this service report"
                  style={{ margin: '20px 0' }}
                />
              </div>
            )}
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ServiceReportDetailsModal;