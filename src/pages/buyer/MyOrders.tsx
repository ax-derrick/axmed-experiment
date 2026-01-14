import { Typography, Input, Select, Table, Tag, Button, Dropdown, Card, Space } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Order type
interface Order {
  id: string;
  orderNumber: string;
  splitId: string | null;
  dateTime: string;
  status: 'Submitted' | 'In progress' | 'Completed' | 'Cancelled';
  total: number | null;
}

// Mock orders data
const ordersData: Order[] = [
  { id: '1', orderNumber: 'O-20251203000426', splitId: null, dateTime: 'Wednesday 03-Dec-2025 06:06:43 AM', status: 'Submitted', total: null },
  { id: '2', orderNumber: 'O-20251019000395', splitId: null, dateTime: 'Sunday 19-Oct-2025 02:18:58 PM', status: 'In progress', total: 672000 },
  { id: '3', orderNumber: 'O-20251016000390', splitId: null, dateTime: 'Thursday 16-Oct-2025 12:08:05 PM', status: 'In progress', total: 117.6 },
  { id: '4', orderNumber: 'O-20250911000366', splitId: null, dateTime: 'Thursday 11-Sep-2025 09:42:06 AM', status: 'In progress', total: null },
  { id: '5', orderNumber: 'O-20250820000343', splitId: null, dateTime: 'Wednesday 20-Aug-2025 09:03:38 AM', status: 'In progress', total: null },
  { id: '6', orderNumber: 'O-20250820000345', splitId: null, dateTime: 'Wednesday 20-Aug-2025 11:04:07 AM', status: 'In progress', total: 23.1 },
  { id: '7', orderNumber: 'O-20250919000372', splitId: null, dateTime: 'Friday 19-Sep-2025 06:49:01 AM', status: 'Submitted', total: null },
  { id: '8', orderNumber: 'O-20250820000344', splitId: null, dateTime: 'Wednesday 20-Aug-2025 10:48:44 AM', status: 'In progress', total: null },
  { id: '9', orderNumber: 'O-20250819000342', splitId: null, dateTime: 'Tuesday 19-Aug-2025 03:18:51 PM', status: 'In progress', total: null },
  { id: '10', orderNumber: 'O-20250819000341', splitId: null, dateTime: 'Tuesday 19-Aug-2025 03:18:09 PM', status: 'In progress', total: null },
];

function MyOrders() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');


  // New Order dropdown menu
  const newOrderMenuItems: MenuProps['items'] = [
    {
      key: 'browse',
      icon: <AppstoreOutlined />,
      label: 'Browse Catalogue',
      onClick: () => navigate('/catalogue?r=buyer'),
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload Spreadsheet',
      onClick: () => navigate('/bulk-upload?r=buyer'),
    },
  ];

  // Filter orders
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase().replace(' ', '_') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return '#1890ff'; // Blue
      case 'In progress': return '#fa8c16'; // Orange
      case 'Completed': return '#52c41a'; // Green
      case 'Cancelled': return '#f5222d'; // Red
      default: return '#d9d9d9'; // Grey
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return `$ ${amount.toLocaleString()}`;
  };

  // Table columns
  const columns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: (
        <span>
          Split ID <InfoCircleOutlined style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 4 }} />
        </span>
      ),
      dataIndex: 'splitId',
      key: 'splitId',
      render: (text: string | null) => text || '—',
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag style={{
          background: getStatusColor(status),
          color: '#fff',
          border: 'none',
          borderRadius: 4,
        }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number | null) => formatCurrency(total),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/order/${record.orderNumber}?r=buyer`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="my-orders-page">
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>My Orders</Title>
        </div>
        <Dropdown menu={{ items: newOrderMenuItems }} trigger={['click']}>
          <Button type="primary" icon={<PlusOutlined />}>
            New Order
          </Button>
        </Dropdown>
      </div>



      <Card
        className="catalogue-content catalogue-airtable"
        styles={{ body: { padding: 0 } }}
      >
        {/* Toolbar */}
        <div className="catalogue-toolbar" style={{
          padding: 16,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <Input
            placeholder="Search for order"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { label: 'All selected', value: 'all' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'In progress', value: 'in_progress' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
            <Select
              defaultValue="recent"
              style={{ width: 120 }}
              options={[
                { label: 'Recent', value: 'recent' },
                { label: 'Oldest', value: 'oldest' },
              ]}
            />
          </Space>
        </div>

        {/* Order Count */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary">{filteredOrders.length} orders</Text>
        </div>

        {/* Orders Table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
          }}
          size="small"
          className="catalogue-table catalogue-table-airtable"
        />
      </Card>
    </div>
  );
}

export default MyOrders;
