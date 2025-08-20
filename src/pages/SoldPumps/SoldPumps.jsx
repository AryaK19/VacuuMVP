import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  Tooltip,
  Tag,
  message,
  App,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  EyeOutlined,
  BarcodeOutlined,
  TagOutlined,
  NumberOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { getSoldPumps, deleteSoldMachine } from "../../services/machine.service";
import ServiceReportForm from "../../components/ServiceReportForm/ServiceReportForm";
import MachineDetailsModal from "../../components/MachineDetailsModal/MachineDetailsModal";
import MachineEditModal from "../../components/MachineEditModal/MachineEditModal";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";
import "./SoldPumps.css";

const { Title } = Typography;

const SoldPumpsContent = () => {
  const { modal } = App.useApp();
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEditMachineId, setSelectedEditMachineId] = useState(null);

  useEffect(() => {
    fetchPumps();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const fetchPumps = async (searchValue = search) => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sort_by: sortField,
        sort_order: sortOrder,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      const response = await getSoldPumps(params);

      setPumps(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
      });
    } catch (error) {
      message.error("Failed to fetch pumps. Please try again later.");
      console.error("Error fetching pumps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag, filters, sorter) => {
    const newPagination = {
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize,
    };

    let newSortField = sortField;
    let newSortOrder = sortOrder;

    if (sorter.field && sorter.order) {
      newSortField = sorter.field;
      newSortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    setPagination(newPagination);
    setSortField(newSortField);
    setSortOrder(newSortOrder);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchPumps(search);
  };

  const handleRefresh = () => {
    setPagination({ ...pagination, current: 1 });
    setSearch("");
    setSortField("created_at");
    setSortOrder("desc");
    fetchPumps("");
  };

  const handleViewMachine = (machineId) => {
    setSelectedMachineId(machineId);
    setDetailsModalVisible(true);
  };

  const handleEditMachine = (machineId) => {
    setSelectedEditMachineId(machineId);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchPumps(); // Refresh the list
    message.success("Machine updated successfully");
  };

  const showDeleteConfirm = (pump) => {
    modal.confirm({
      title: "Are you sure you want to delete this pump?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            This action will permanently delete the pump with serial number:{" "}
            <strong>{pump.serial_no}</strong>
          </p>
          <p>
            All associated service reports, parts, and files will also be
            deleted.
          </p>
          <p>This action cannot be undone.</p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk() {
        return handleDeletePump(pump.sold_info.id);
      },
    });
  };

  const handleDeletePump = async (pumpId) => {
    try {
      await deleteSoldMachine(pumpId);
      message.success("Pump deleted successfully");
      fetchPumps(); // Refresh the list
    } catch (error) {
      message.error(error.message || "Failed to delete pump");
    }
  };

  const columns = [
    {
      title: () => (
        <span>
          <BarcodeOutlined className="header-icon" /> Serial No
        </span>
      ),
      key: "serial_no",

      sorter: true,
      render: (record) => {
        return record.sold_info ? record.sold_info.serial_no : "";
      },
    },
    {
      title: () => (
        <span>
          <TagOutlined className="header-icon" /> Model No
        </span>
      ),
      dataIndex: "model_no",
      key: "model_no",
      sorter: true,
    },
    {
      title: () => (
        <span>
          <NumberOutlined className="header-icon" /> Part No
        </span>
      ),
      dataIndex: "part_no",
      key: "part_no",
      sorter: true,
    },
    {
      title: () => (
        <span>
          <UserOutlined className="header-icon" /> Customer
        </span>
      ),
      key: "customer",
      sorter: true,
      render: (record) => {
        return record.sold_info ? record.sold_info.customer_company : "Not Assigned to Customer";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle" className="action-column">
          <Tooltip title="View Details">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewMachine(record.sold_info.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditMachine(record.sold_info.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pumps-page">
      <Card>
        <div className="pumps-filter">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space size="large">
              <Input
                placeholder="Search pumps"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button icon={<SyncOutlined />} onClick={handleRefresh}>
                Reset
              </Button>
            </Space>

            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => setShowReportModal(true)}
            >
              + Add Report
            </Button>
          </div>
        </div>

        <div className="pumps-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={pumps}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} pumps`,
              }}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
              className="custom-table"
            />
          </Spin>
        </div>
      </Card>

      <ServiceReportForm
        visible={showReportModal}
        onCancel={() => setShowReportModal(false)}
        onSuccess={() => {
          setShowReportModal(false);
          fetchPumps();
        }}
      />

      <MachineDetailsModal
        visible={detailsModalVisible}
        machineId={selectedMachineId}
        onCancel={() => setDetailsModalVisible(false)}
      />

      <MachineEditModal
        visible={editModalVisible}
        machineId={selectedEditMachineId}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

// Wrap the component with App
const SoldPumps = () => (
  <App>
    <SoldPumpsContent />
  </App>
);

export default SoldPumps;
