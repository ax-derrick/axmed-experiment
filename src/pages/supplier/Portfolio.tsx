import { Typography, Card, Input, Button, Table, Tag, Space, Select, Drawer, Row, Col, Dropdown } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SearchOutlined,
  CloseOutlined,
  PlusOutlined,
  UploadOutlined,
  ExportOutlined,
  DeleteOutlined,
  CheckOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import medicationPlaceholder from '/images/medication-placeholder.svg';

const { Title, Text } = Typography;

// Portfolio product type
interface PortfolioProduct {
  id: number;
  name: string;
  form: string;
  strength: string;
  category: string;
  countries: string[];
}

// Categories for filtering
const categories = [
  'Analgesics',
  'Anti-Infectives',
  'Anti-Inflammatory',
  'Cardiovascular',
  'Central Nervous System',
  'Dermatology',
  'Endocrine And Metabolic',
  'Gastrointestinal',
  'Genitourinary',
  'Haematology',
  'Immunological Agents',
  'Musculoskeletal',
  'Oncology',
  'Opthalmological & Otologicals',
  'Respiratory Agents',
  'Supplements',
  'Vaccines',
];

// Available countries for registration
const availableCountries = [
  'Armenia',
  'Aruba',
  'Austria',
  'Azerbaijan',
  'Barbados',
  'Botswana',
  'Burkina Faso',
  'Cameroon',
  'Chad',
  'DR Congo',
  'Ethiopia',
  'Ghana',
  'Guinea',
  'Ivory Coast',
  'Kenya',
  'Liberia',
  'Madagascar',
  'Malawi',
  'Mali',
  'Mozambique',
  'Niger',
  'Nigeria',
  'Rwanda',
  'Senegal',
  'Sierra Leone',
  'South Africa',
  'Tanzania',
  'Togo',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];

// Presentation options
const presentationOptions = [
  'Tablet',
  'Capsule',
  'Injectable Solution',
  'Syrup',
  'Suspension',
  'Cream',
  'Gel',
  'Ointment',
  'Eye Drops',
  'Inhaler',
  'Suppository',
  'Patch',
];

// Dosage options (common dosages)
const dosageOptions = [
  '1Mg',
  '2.5Mg',
  '5Mg',
  '10Mg',
  '20Mg',
  '25Mg',
  '50Mg',
  '100Mg',
  '200Mg',
  '250Mg',
  '400Mg',
  '500Mg',
  '1000Mg',
  '40Mg/0.4Ml',
  '100Mg/5Ml',
  '500Mg/5Ml',
  '1000Mg/50Ml',
];

// Available medicines for adding to portfolio
const availableMedicines = [
  { name: 'Abiraterone', category: 'Oncology' },
  { name: 'Acarbose', category: 'Endocrine And Metabolic' },
  { name: 'Aceclofenac', category: 'Anti-Inflammatory' },
  { name: 'Aceclofenac / Paracetamol', category: 'Anti-Inflammatory' },
  { name: 'Acenocoumarol', category: 'Cardiovascular' },
  { name: 'Acetaminophen', category: 'Analgesics' },
  { name: 'Adalimumab', category: 'Immunological Agents' },
  { name: 'Albendazole', category: 'Anti-Infectives' },
  { name: 'Albumin-Bound Paclitaxel', category: 'Oncology' },
  { name: 'Alprostadil', category: 'Cardiovascular' },
  { name: 'Amikacin', category: 'Anti-Infectives' },
  { name: 'Amoxicillin', category: 'Anti-Infectives' },
  { name: 'Ampicillin', category: 'Anti-Infectives' },
  { name: 'Artesunate', category: 'Anti-Infectives' },
  { name: 'Aspirin', category: 'Analgesics' },
  { name: 'Atenolol', category: 'Cardiovascular' },
  { name: 'Atorvastatin', category: 'Cardiovascular' },
  { name: 'Azithromycin', category: 'Anti-Infectives' },
  { name: 'Chlorphenamine', category: 'Respiratory Agents' },
  { name: 'Ciprofloxacin', category: 'Anti-Infectives' },
  { name: 'Doxycycline', category: 'Anti-Infectives' },
  { name: 'Ibuprofen', category: 'Analgesics' },
  { name: 'Metformin', category: 'Endocrine And Metabolic' },
  { name: 'Metronidazole', category: 'Anti-Infectives' },
  { name: 'Mycophenolate Mofetil', category: 'Immunological Agents' },
  { name: 'Omeprazole', category: 'Gastrointestinal' },
  { name: 'Paracetamol', category: 'Analgesics' },
  { name: 'Penicillin V', category: 'Anti-Infectives' },
];

// Sample portfolio data (based on screenshot)
const portfolioData: PortfolioProduct[] = [
  { id: 1, name: 'Adalimumab', form: 'Injectable Solution', strength: '40Mg/0.4Ml', category: 'Immunological Agents', countries: ['Ghana'] },
  { id: 2, name: 'Acenocoumarol', form: 'Tablet', strength: '1Mg', category: 'Cardiovascular', countries: ['Ghana'] },
  { id: 3, name: 'Alprostadil', form: 'Injectable Solution', strength: '0.5Ml / Ml', category: 'Cardiovascular', countries: ['Ghana'] },
  { id: 4, name: 'Mycophenolate Mofetil', form: 'Tablet', strength: '500Mg', category: 'Immunological Agents', countries: ['Ghana'] },
  { id: 5, name: 'Chlorphenamine', form: 'Tablet', strength: '4 Mg', category: 'Respiratory Agents', countries: ['Ghana'] },
  { id: 6, name: 'Albumin-Bound Paclitaxel', form: 'Injectable Solution', strength: '100Mg', category: 'Oncology', countries: ['Ghana'] },
  { id: 7, name: 'Paracetamol', form: 'Injectable Solution', strength: '1000Mg/50Ml', category: 'Analgesics', countries: ['Aruba', 'Ghana'] },
  { id: 8, name: 'Aceclofenac / Paracetamol', form: 'Caplet', strength: '100Mg/500Mg', category: 'Anti-Inflammatory', countries: ['Armenia', 'Austria', 'Azerbaijan', 'Barbados'] },
  { id: 9, name: 'Aceclofenac / Paracetamol / Serratiopeptidase', form: 'Tablet', strength: '100Mg/500Mg/15Mg', category: 'Anti-Inflammatory', countries: ['Aruba'] },
  { id: 10, name: 'Albendazole', form: 'Tablet', strength: '400Mg', category: 'Anti-Infectives', countries: ['Ghana', 'Nigeria'] },
  { id: 11, name: 'Amoxicillin', form: 'Capsule', strength: '500Mg', category: 'Anti-Infectives', countries: ['Ghana', 'Kenya', 'Nigeria', 'Tanzania'] },
  { id: 12, name: 'Azithromycin', form: 'Tablet', strength: '500Mg', category: 'Anti-Infectives', countries: ['Ghana', 'Uganda'] },
  { id: 13, name: 'Metformin', form: 'Tablet', strength: '500Mg', category: 'Endocrine And Metabolic', countries: ['Ghana', 'Kenya'] },
  { id: 14, name: 'Omeprazole', form: 'Capsule', strength: '20Mg', category: 'Gastrointestinal', countries: ['Nigeria'] },
  { id: 15, name: 'Ciprofloxacin', form: 'Tablet', strength: '500Mg', category: 'Anti-Infectives', countries: ['Ghana', 'Kenya', 'Tanzania'] },
];

// Calculate KPI data from portfolio
const totalProducts = portfolioData.length;
const uniqueCountries = [...new Set(portfolioData.flatMap(p => p.countries))];
const uniqueCategories = [...new Set(portfolioData.map(p => p.category))];

const kpiData = [
  { title: 'Total Products', value: String(totalProducts) },
  { title: 'Countries Active', value: String(uniqueCountries.length) },
  { title: 'Categories Covered', value: String(uniqueCategories.length) },
  { title: 'Pending Registrations', value: '3' }, // This would come from backend in real app
];

function Portfolio() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PortfolioProduct | null>(null);

  // Check for action=add query parameter to auto-open add drawer
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setAddDrawerOpen(true);
      // Remove the action param from URL to prevent re-opening on refresh
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Edit form state
  const [editForm, setEditForm] = useState<string>('');
  const [editStrength, setEditStrength] = useState<string>('');
  const [editCountries, setEditCountries] = useState<string[]>([]);

  // Add new form state
  const [newMedicineName, setNewMedicineName] = useState<string | undefined>(undefined);
  const [newPresentation, setNewPresentation] = useState<string | undefined>(undefined);
  const [newDosage, setNewDosage] = useState<string | undefined>(undefined);
  const [newCountries, setNewCountries] = useState<string[]>([]);

  // Filter products
  const filteredData = portfolioData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesCountry = selectedCountries.length === 0 || item.countries.some(c => selectedCountries.includes(c));
    return matchesSearch && matchesCategory && matchesCountry;
  });

  // Sort products
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0; // 'recent' - keep original order
  });

  // Handle edit click
  const handleEdit = (product: PortfolioProduct) => {
    setSelectedProduct(product);
    setEditForm(product.form);
    setEditStrength(product.strength);
    setEditCountries(product.countries);
    setEditDrawerOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    // In a real app, this would save to backend
    console.log('Saving product:', {
      ...selectedProduct,
      form: editForm,
      strength: editStrength,
      countries: editCountries,
    });
    setEditDrawerOpen(false);
  };

  // Handle open add drawer
  const handleOpenAddDrawer = () => {
    setNewMedicineName(undefined);
    setNewPresentation(undefined);
    setNewDosage(undefined);
    setNewCountries([]);
    setAddDrawerOpen(true);
  };

  // Handle add to portfolio
  const handleAddToPortfolio = () => {
    // In a real app, this would save to backend
    console.log('Adding new medicine:', {
      name: newMedicineName,
      presentation: newPresentation,
      dosage: newDosage,
      countries: newCountries,
    });
    setAddDrawerOpen(false);
  };

  // Check if add form is valid
  const isAddFormValid = newMedicineName && newPresentation && newDosage;

  // Add new menu items
  const addNewMenuItems: MenuProps['items'] = [
    {
      key: 'single',
      icon: <PlusOutlined />,
      label: 'Add manually',
      onClick: handleOpenAddDrawer,
    },
    {
      key: 'bulk',
      icon: <UploadOutlined />,
      label: 'Upload Bulk Portfolio',
      onClick: () => navigate('/portfolio/bulk-upload?r=supplier'),
    },
  ];

  // Table columns
  const columns: ColumnsType<PortfolioProduct> = [
    {
      title: 'Medication',
      key: 'medication',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={medicationPlaceholder}
            alt=""
            style={{ width: 32, height: 32, opacity: 0.6 }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.form} , {record.strength}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      responsive: ['md'],
      render: (category) => (
        <Tag style={{
          background: getCategoryColor(category),
          color: '#fff',
          border: 'none',
          borderRadius: 4,
        }}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Countries registered in',
      dataIndex: 'countries',
      key: 'countries',
      responsive: ['sm'],
      render: (countries: string[]) => (
        <Space size={[4, 4]} wrap>
          {countries.slice(0, 3).map((country, idx) => (
            <Tag key={idx} style={{ margin: 0, fontSize: 11 }}>{country}</Tag>
          ))}
          {countries.length > 3 && (
            <Tag style={{ margin: 0, fontSize: 11, background: '#f5f5f5' }}>+{countries.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="portfolio-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Portfolio</Title>
        </div>
        <Space>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Dropdown menu={{ items: addNewMenuItems }} trigger={['click']}>
            <Button type="primary" icon={<PlusOutlined />}>
              Add new <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* KPI Summary Cards */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }} className="portfolio-kpi-row">
        {kpiData.map((kpi, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{kpi.title}</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>
                {kpi.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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
              mode="multiple"
              placeholder="Category"
              style={{ minWidth: 150 }}
              value={selectedCategories}
              onChange={setSelectedCategories}
              options={categories.map(c => ({ label: c, value: c }))}
              maxTagCount={1}
              allowClear
            />
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
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 120 }}
              options={[
                { label: 'Recent', value: 'recent' },
                { label: 'Name (A-Z)', value: 'name' },
                { label: 'Category', value: 'category' },
              ]}
              prefix={<span style={{ color: '#8c8c8c' }}>Sort By</span>}
            />
          </Space>
        </div>

        {/* Product Count */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary">{sortedData.length} products</Text>
        </div>

        {/* Table */}
        <Table
          dataSource={sortedData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
          size="small"
          className="portfolio-table"
        />
      </Card>

      {/* Edit Product Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
        closable={false}
        styles={{ body: { padding: 0 } }}
        className="product-drawer"
      >
        {selectedProduct && (
          <div className="product-drawer-content">
            {/* Close button */}
            <div className="product-drawer-close">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setEditDrawerOpen(false)}
              />
            </div>

            {/* Centered Header */}
            <div className="product-drawer-header">
              <img
                src={medicationPlaceholder}
                alt="Medication"
                className="product-drawer-icon"
              />
              <Title level={3} style={{ margin: 0 }}>{selectedProduct.name}</Title>
              <Tag style={{ marginTop: 8, background: getCategoryColor(selectedProduct.category), color: '#fff', border: 'none' }}>
                {selectedProduct.category}
              </Tag>
            </div>

            {/* Presentation */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Presentation</Text>
              <div className="product-drawer-chips">
                {presentationOptions.map((presentation) => (
                  <div
                    key={presentation}
                    onClick={() => setEditForm(presentation)}
                    className={`product-option-card ${editForm === presentation ? 'selected' : ''}`}
                  >
                    {editForm === presentation && <CheckOutlined className="product-option-check" />}
                    <span>{presentation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Strength / Dosage</Text>
              <Input
                value={editStrength}
                onChange={(e) => setEditStrength(e.target.value)}
                placeholder="e.g., 500Mg, 100Mg/5Ml"
                style={{ marginTop: 8 }}
              />
            </div>

            {/* Countries Registered */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Countries Registered In</Text>
              <Select
                mode="multiple"
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Select countries"
                value={editCountries}
                onChange={setEditCountries}
                options={availableCountries.map(c => ({ label: c, value: c }))}
                maxTagCount={5}
              />
            </div>

            {/* Footer CTA */}
            <div className="product-drawer-footer">
              <Button
                type="primary"
                size="large"
                block
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add New Medicine Drawer */}
      <Drawer
        title="Add new medicine"
        placement="right"
        width={480}
        onClose={() => setAddDrawerOpen(false)}
        open={addDrawerOpen}
        styles={{ body: { padding: 24 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setAddDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleAddToPortfolio}
              disabled={!isAddFormValid}
            >
              Add to portfolio
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Name of the medicine */}
          <div>
            <Text style={{ display: 'block', marginBottom: 8 }}>Name of the medicine<span style={{ color: '#ff4d4f' }}>*</span></Text>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Select medicine"
              value={newMedicineName}
              onChange={setNewMedicineName}
              options={availableMedicines.map(m => ({ label: m.name, value: m.name }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {/* Presentation and Dosage in a row */}
          <Row gutter={16}>
            <Col span={12}>
              <Text style={{ display: 'block', marginBottom: 8 }}>Presentation<span style={{ color: '#ff4d4f' }}>*</span></Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select"
                value={newPresentation}
                onChange={setNewPresentation}
                options={presentationOptions.map(p => ({ label: p, value: p }))}
              />
            </Col>
            <Col span={12}>
              <Text style={{ display: 'block', marginBottom: 8 }}>Dosage<span style={{ color: '#ff4d4f' }}>*</span></Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select"
                value={newDosage}
                onChange={setNewDosage}
                options={dosageOptions.map(d => ({ label: d, value: d }))}
              />
            </Col>
          </Row>

          {/* Countries */}
          <div>
            <Text style={{ display: 'block', marginBottom: 8 }}>Countries</Text>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select countries"
              value={newCountries}
              onChange={setNewCountries}
              options={availableCountries.map(c => ({ label: c, value: c }))}
              maxTagCount={3}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Analgesics': '#f5222d',
    'Anti-Infectives': '#fa541c',
    'Anti-Inflammatory': '#fa8c16',
    'Cardiovascular': '#eb2f96',
    'Central Nervous System': '#722ed1',
    'Dermatology': '#2f54eb',
    'Endocrine And Metabolic': '#1890ff',
    'Gastrointestinal': '#13c2c2',
    'Genitourinary': '#52c41a',
    'Haematology': '#a0d911',
    'Immunological Agents': '#faad14',
    'Musculoskeletal': '#36cfc9',
    'Oncology': '#9254de',
    'Opthalmological & Otologicals': '#69c0ff',
    'Respiratory Agents': '#5cdbd3',
    'Supplements': '#b37feb',
    'Vaccines': '#ffc069',
  };
  return colors[category] || '#1890ff';
}

export default Portfolio;
