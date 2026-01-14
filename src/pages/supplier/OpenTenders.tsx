import { Typography, Card, Input, Button, Table, Tag, Space, Select, Tooltip } from 'antd';
import { useState } from 'react';
import {
  SearchOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Tender opportunity type
interface TenderOpportunity {
  id: number;
  tenderNo: string;
  tenderDescription: string;
  medication: string;
  form: string;
  dosage: string;
  totalVolume: string;
  countries: string[];
  daysUntilClose: number;
  hasActiveBid: boolean;
  hasDraft: boolean;
  therapyArea: string;
}

// Available countries for filtering
const availableCountries = [
  'Armenia', 'Aruba', 'Austria', 'Azerbaijan', 'Barbados', 'Botswana',
  'Burkina Faso', 'Cameroon', 'Chad', 'DR Congo', 'Ethiopia', 'Ghana',
  'Guinea', 'Ivory Coast', 'Kenya', 'Liberia', 'Madagascar', 'Malawi',
  'Mali', 'Mozambique', 'Niger', 'Nigeria', 'Rwanda', 'Senegal',
  'Sierra Leone', 'South Africa', 'Tanzania', 'Togo', 'Uganda', 'Zambia', 'Zimbabwe',
];

// Therapy areas
const therapyAreas = [
  'Analgesics',
  'Anti-Infectives',
  'Anti-Inflammatory',
  'Cardiovascular',
  'Endocrine And Metabolic',
  'Gastrointestinal',
  'Immunological Agents',
  'Maternal Health',
  'Oncology',
  'Respiratory Agents',
];

// Bid status options
const bidStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'no_bid', label: 'No bid' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
];

// Sample tender data (expanded from dashboard opportunities)
const tenderData: TenderOpportunity[] = [
  {
    id: 1,
    tenderNo: 'Tender 211',
    tenderDescription: 'International Organization: multi-country tender for...',
    medication: 'Abiraterone',
    form: 'Tablet',
    dosage: '250Mg',
    totalVolume: '100,600 tablets',
    countries: ['Ghana'],
    daysUntilClose: 21,
    hasActiveBid: false,
    hasDraft: true,
    therapyArea: 'Oncology',
  },
  {
    id: 2,
    tenderNo: 'Tender 212',
    tenderDescription: '-',
    medication: 'Abiraterone',
    form: 'Tablet',
    dosage: '250Mg',
    totalVolume: '1,000,000 tablets',
    countries: ['Cameroon'],
    daysUntilClose: 14,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Oncology',
  },
  {
    id: 3,
    tenderNo: 'Tender 213',
    tenderDescription: '-',
    medication: 'Abiraterone',
    form: 'Tablet',
    dosage: '250Mg',
    totalVolume: '200,000 tablets',
    countries: ['Ghana'],
    daysUntilClose: 7,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Oncology',
  },
  {
    id: 4,
    tenderNo: 'Tender 226',
    tenderDescription: '-',
    medication: 'Abiraterone',
    form: 'Tablet',
    dosage: '250Mg',
    totalVolume: '2,000,000 tablets',
    countries: ['Ghana'],
    daysUntilClose: 30,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Oncology',
  },
  {
    id: 5,
    tenderNo: 'Tender 213',
    tenderDescription: '-',
    medication: 'Acarbose',
    form: 'Tablet',
    dosage: '100Mg',
    totalVolume: '200,000 tablets',
    countries: ['Ghana'],
    daysUntilClose: 5,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Endocrine And Metabolic',
  },
  {
    id: 6,
    tenderNo: 'Tender 226',
    tenderDescription: '-',
    medication: 'Acarbose',
    form: 'Tablet',
    dosage: '100Mg',
    totalVolume: '200,500 tablets',
    countries: ['Ghana'],
    daysUntilClose: 12,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Endocrine And Metabolic',
  },
  {
    id: 7,
    tenderNo: 'Tender 211',
    tenderDescription: 'International Organization: multi-country tender for...',
    medication: 'Aceclofenac / Chlorzoxazone / Paracetamol',
    form: 'Tablet',
    dosage: '100Mg/375Mg/500Mg',
    totalVolume: '100 tablets',
    countries: ['Ghana'],
    daysUntilClose: 21,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Anti-Inflammatory',
  },
  {
    id: 8,
    tenderNo: 'Tender 220',
    tenderDescription: '-',
    medication: 'Albendazole',
    form: 'Tablet',
    dosage: '200Mg',
    totalVolume: '500,000 tablets',
    countries: ['Ghana'],
    daysUntilClose: 18,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Anti-Infectives',
  },
  {
    id: 9,
    tenderNo: 'Tender 214',
    tenderDescription: 'Public Sector Tender (Regional /',
    medication: 'Metformin',
    form: 'Tablet',
    dosage: '500Mg',
    totalVolume: '50,000 tablets',
    countries: ['Ghana'],
    daysUntilClose: 3,
    hasActiveBid: false,
    hasDraft: false,
    therapyArea: 'Endocrine And Metabolic',
  },
];

function OpenTenders() {
  const [searchText, setSearchText] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedBidStatus, setSelectedBidStatus] = useState<string>('all');
  const [selectedTherapyArea, setSelectedTherapyArea] = useState<string | undefined>(undefined);

  // Filter data
  const filteredData = tenderData.filter(item => {
    const matchesSearch = item.medication.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tenderNo.toLowerCase().includes(searchText.toLowerCase());
    const matchesCountry = selectedCountries.length === 0 ||
      item.countries.some(c => selectedCountries.includes(c));
    const matchesTherapyArea = !selectedTherapyArea || item.therapyArea === selectedTherapyArea;

    let matchesBidStatus = true;
    if (selectedBidStatus === 'no_bid') {
      matchesBidStatus = !item.hasActiveBid && !item.hasDraft;
    } else if (selectedBidStatus === 'draft') {
      matchesBidStatus = item.hasDraft;
    } else if (selectedBidStatus === 'submitted') {
      matchesBidStatus = item.hasActiveBid;
    }

    return matchesSearch && matchesCountry && matchesTherapyArea && matchesBidStatus;
  });

  // Export to XLS (mock)
  const handleExport = () => {
    console.log('Exporting to XLS...');
  };

  // Table columns
  const columns: ColumnsType<TenderOpportunity> = [
    {
      title: 'Tender',
      key: 'tender',
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong>{record.tenderNo}</Text>
          {record.tenderDescription && record.tenderDescription !== '-' && (
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {record.tenderDescription}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Medication',
      key: 'medication',
      width: 280,
      sorter: (a, b) => a.medication.localeCompare(b.medication),
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
      title: () => (
        <Space>
          Total volume
          <Tooltip title="Total quantity requested across all participating countries">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'totalVolume',
      key: 'totalVolume',
      width: 150,
      sorter: (a, b) => {
        const aNum = parseInt(a.totalVolume.replace(/[^0-9]/g, ''));
        const bNum = parseInt(b.totalVolume.replace(/[^0-9]/g, ''));
        return aNum - bNum;
      },
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: () => (
        <Space>
          Countries aggregated
          <Tooltip title="Countries participating in this tender">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'countries',
      key: 'countries',
      width: 180,
      render: (countries: string[]) => (
        <Space size={[4, 4]} wrap>
          {countries.slice(0, 2).map((country, idx) => (
            <span key={idx}>{country}</span>
          ))}
          {countries.length > 2 && (
            <Tag style={{ margin: 0, fontSize: 11 }}>+{countries.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 130,
      render: (_, record) => {
        if (record.hasDraft) {
          return (
            <Button
              icon={<FileTextOutlined />}
              style={{ borderColor: '#d9d9d9' }}
            >
              Edit draft
            </Button>
          );
        }
        return (
          <Button type="primary">
            Bid now
          </Button>
        );
      },
    },
  ];

  return (
    <div className="open-tenders-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Open Tenders</Title>
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
            placeholder="Search for medicine or tender"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Space wrap>
            <Select
              mode="multiple"
              placeholder="Country"
              style={{ minWidth: 150 }}
              value={selectedCountries}
              onChange={setSelectedCountries}
              options={availableCountries.map(c => ({ label: c, value: c }))}
              maxTagCount={1}
              allowClear
            />
            <Select
              placeholder="Bid status"
              style={{ width: 120 }}
              value={selectedBidStatus}
              onChange={setSelectedBidStatus}
              options={bidStatusOptions}
            />
            <Select
              placeholder="Therapy area"
              style={{ minWidth: 160 }}
              value={selectedTherapyArea}
              onChange={setSelectedTherapyArea}
              options={therapyAreas.map(t => ({ label: t, value: t }))}
              allowClear
            />
          </Space>
        </div>

        {/* Opportunity Count */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary">{filteredData.length} opportunities</Text>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} opportunities`,
          }}
          size="small"
          className="open-tenders-table"
        />
      </Card>
    </div>
  );
}

export default OpenTenders;
