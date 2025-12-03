import { Typography, Card, Input, Button, Table, Tag, Space, Select } from 'antd';
import { useState } from 'react';
import {
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Status options for filter
const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'In Buyer Review', label: 'In Buyer Review' },
  { value: 'Awarded', label: 'Awarded' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Not awarded', label: 'Not awarded' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

// Bid type
interface Bid {
  id: number;
  medication: string;
  form: string;
  dosage: string;
  totalVolume: string;
  packSize: number;
  packPriceLow: string;
  packPriceMid: string;
  packPriceHigh: string;
  submitted: string;
  status: 'Submitted' | 'In Buyer Review' | 'Awarded' | 'Confirmed' | 'Not awarded' | 'Withdrawn';
}

// Sample bid data based on reference image
const bidData: Bid[] = [
  {
    id: 1,
    medication: 'Adalimumab',
    form: 'Injectable Solution',
    dosage: '40Mg/0.4Ml',
    totalVolume: '600,000 vials/ampoules/cartridges',
    packSize: 600,
    packPriceLow: '$660',
    packPriceMid: '$600',
    packPriceHigh: '$600',
    submitted: '19-Oct-2025',
    status: 'Awarded',
  },
  {
    id: 2,
    medication: 'Alprostadil',
    form: 'Injectable Solution',
    dosage: '0.5Ml / Ml',
    totalVolume: '100 vials/ampoules/cartridges',
    packSize: 5,
    packPriceLow: '$5',
    packPriceMid: '$5',
    packPriceHigh: '$5',
    submitted: '16-Oct-2025',
    status: 'Awarded',
  },
  {
    id: 3,
    medication: 'Acenocoumarol',
    form: 'Tablet',
    dosage: '1Mg',
    totalVolume: '100 tablets',
    packSize: 100,
    packPriceLow: '$5',
    packPriceMid: '$5',
    packPriceHigh: '$5',
    submitted: '16-Oct-2025',
    status: 'Awarded',
  },
  {
    id: 4,
    medication: 'Mycophenolate Mofetil',
    form: 'Tablet',
    dosage: '500Mg',
    totalVolume: '80,000 tablets',
    packSize: 2000,
    packPriceLow: '$10',
    packPriceMid: '$9',
    packPriceHigh: '$8',
    submitted: '25-Sep-2025',
    status: 'In Buyer Review',
  },
  {
    id: 5,
    medication: 'Chlorphenamine',
    form: 'Tablet',
    dosage: '4 Mg',
    totalVolume: '30,000 tablets',
    packSize: 1000,
    packPriceLow: '$10',
    packPriceMid: '$9',
    packPriceHigh: '$8',
    submitted: '25-Sep-2025',
    status: 'In Buyer Review',
  },
  {
    id: 6,
    medication: 'Albumin-Bound Paclitaxel',
    form: 'Injectable Solution',
    dosage: '100Mg',
    totalVolume: '100,000 vials/ampoules/cartridges',
    packSize: 4000,
    packPriceLow: '$10',
    packPriceMid: '$9',
    packPriceHigh: '$8',
    submitted: '25-Sep-2025',
    status: 'In Buyer Review',
  },
  {
    id: 7,
    medication: 'Oxytocin',
    form: 'Injectable Solution',
    dosage: '10U/Ml',
    totalVolume: '100,000 vials/ampoules/cartridges',
    packSize: 40,
    packPriceLow: '$13.2',
    packPriceMid: '$12.6',
    packPriceHigh: '$12',
    submitted: '19-Aug-2025',
    status: 'Submitted',
  },
  {
    id: 8,
    medication: 'Metformin',
    form: 'Tablet',
    dosage: '500Mg',
    totalVolume: '1,000,000 tablets',
    packSize: 80,
    packPriceLow: '$26.4',
    packPriceMid: '$25.2',
    packPriceHigh: '$24',
    submitted: '19-Aug-2025',
    status: 'Submitted',
  },
];

// Status color mapping
function getStatusColor(status: Bid['status']): string {
  switch (status) {
    case 'Awarded':
      return 'success';
    case 'In Buyer Review':
      return 'processing';
    case 'Submitted':
      return 'default';
    case 'Confirmed':
      return 'success';
    case 'Not awarded':
      return 'error';
    case 'Withdrawn':
      return 'default';
    default:
      return 'default';
  }
}

function MyBids() {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter data
  const filteredData = bidData.filter(item => {
    const matchesSearch = item.medication.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Export handler
  const handleExport = () => {
    console.log('Exporting to XLS...');
  };

  // Table columns
  const columns: ColumnsType<Bid> = [
    {
      title: 'Medication',
      key: 'medication',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.medication}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.form}, {record.dosage}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Volume / Pack',
      key: 'volumePack',
      width: 140,
      responsive: ['md'],
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: 13 }}>{record.totalVolume}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pack: {record.packSize}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Pack price',
      key: 'packPrice',
      width: 150,
      responsive: ['sm'],
      render: (_, record) => (
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div><Text type="secondary">&lt;40%:</Text> {record.packPriceLow}</div>
          <div><Text type="secondary">40-75%:</Text> {record.packPriceMid}</div>
          <div><Text type="secondary">&gt;75%:</Text> {record.packPriceHigh}</div>
        </div>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted',
      key: 'submitted',
      width: 110,
      responsive: ['lg'],
      render: (text) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)} style={{ fontSize: 11 }}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 90,
      render: () => (
        <Button size="small">
          View more
        </Button>
      ),
    },
  ];

  return (
    <div className="my-bids-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Track Your Bids</Title>
          <Text type="secondary">Stay updated on the status of each bid, from submission to confirmation of supply</Text>
        </div>
        <Button icon={<ExportOutlined />} onClick={handleExport}>Export</Button>
      </div>

      {/* Filters and Table */}
      <Card styles={{ body: { padding: 0 } }}>
        {/* Filter Bar */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <Input
            placeholder="Search for medicine"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Space wrap>
            <Select
              placeholder="Status"
              style={{ minWidth: 160 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </Space>
        </div>

        {/* Bid Count */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary">{filteredData.length} bids</Text>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bids`,
          }}
          size="small"
          className="my-bids-table"
        />
      </Card>
    </div>
  );
}

export default MyBids;
