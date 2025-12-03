import { Typography, Card, Input, Button, Table, Tag, Space, Select, Drawer } from 'antd';
import { useState } from 'react';
import {
  SearchOutlined,
  CloseOutlined,
  MinusOutlined,
  PlusOutlined,
  CheckOutlined,
  SortAscendingOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import medicationPlaceholder from '/images/medication-placeholder.svg';
import { useDraftOrder } from '../../context/DraftOrderContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Product type
interface Product {
  id: number;
  name: string;
  category: string;
  presentations: string[];
  dosages: string[];
  sipRequired: boolean;
}

// Sample product data
const productData: Product[] = [
  // A
  { id: 1, name: 'Abiraterone', category: 'Oncology', presentations: ['Tablet', 'Tablet - Chewable', 'Analg', 'Auto-Injector', 'Buccal Tablet', 'Caplet'], dosages: ['250mg', '500mg'], sipRequired: false },
  { id: 2, name: 'Acarbose', category: 'Endocrine And Metabolic', presentations: ['Tablet'], dosages: ['50mg', '100mg'], sipRequired: false },
  { id: 3, name: 'Aceclofenac', category: 'Anti-Inflammatory', presentations: ['Tablet'], dosages: ['100mg'], sipRequired: false },
  { id: 4, name: 'Aceclofenac/Paracetamol', category: 'Anti-Inflammatory', presentations: ['Tablet'], dosages: ['100mg/500mg'], sipRequired: false },
  { id: 5, name: 'Aceclofenac/Paracetamol/Chlorzoxazone', category: 'Anti-Inflammatory', presentations: ['Tablet'], dosages: ['100mg/500mg/500mg'], sipRequired: false },
  { id: 6, name: 'Aceclofenac/Paracetamol/Serratiopeptidase', category: 'Anti-Inflammatory', presentations: ['Tablet'], dosages: ['100mg/325mg/15mg'], sipRequired: false },
  { id: 7, name: 'Aceclofenac/Serratiopeptidase', category: 'Anti-Inflammatory', presentations: ['Tablet'], dosages: ['100mg/15mg'], sipRequired: false },
  { id: 8, name: 'Acetaminophen', category: 'Analgesics', presentations: ['Tablet', 'Caplet', 'Syrup'], dosages: ['500mg', '650mg'], sipRequired: false },
  { id: 9, name: 'Acetaminophen/Caffeine', category: 'Analgesics', presentations: ['Tablet'], dosages: ['500mg/65mg'], sipRequired: false },
  { id: 10, name: 'Acetaminophen/Ibuprofen', category: 'Analgesics', presentations: ['Tablet', 'Caplet'], dosages: ['325mg/200mg'], sipRequired: false },
  { id: 11, name: 'Acetazolamide', category: 'Opthalmological & Otologicals', presentations: ['Tablet', 'Injection'], dosages: ['250mg'], sipRequired: true },
  { id: 12, name: 'Acetylcysteine', category: 'Respiratory Agents', presentations: ['Solution', 'Tablet'], dosages: ['200mg/ml', '600mg'], sipRequired: false },
  { id: 13, name: 'Acyclovir', category: 'Anti-Infectives', presentations: ['Tablet', 'Cream', 'Injection'], dosages: ['200mg', '400mg', '800mg'], sipRequired: false },
  { id: 14, name: 'Adalimumab', category: 'Immunological Agents', presentations: ['Injection', 'Auto-Injector'], dosages: ['40mg'], sipRequired: true },
  { id: 15, name: 'Adapalene', category: 'Dermatology', presentations: ['Gel', 'Cream'], dosages: ['0.1%', '0.3%'], sipRequired: false },
  { id: 16, name: 'Adrenaline Bp', category: 'Cardiovascular', presentations: ['Injection', 'Auto-Injector'], dosages: ['1mg/ml'], sipRequired: false },
  { id: 17, name: 'Albendazole', category: 'Anti-Infectives', presentations: ['Tablet', 'Suspension'], dosages: ['400mg'], sipRequired: false },
  { id: 18, name: 'Albumin (Human)', category: 'Haematology', presentations: ['Injection'], dosages: ['20%', '25%'], sipRequired: true },
  { id: 19, name: 'Albuterol', category: 'Respiratory Agents', presentations: ['Inhaler', 'Nebulizer Solution', 'Tablet'], dosages: ['90mcg', '2mg', '4mg'], sipRequired: false },
  { id: 20, name: 'Alendronic Acid', category: 'Musculoskeletal', presentations: ['Tablet'], dosages: ['70mg', '10mg'], sipRequired: false },
  { id: 21, name: 'Alfuzosin', category: 'Genitourinary', presentations: ['Tablet'], dosages: ['10mg'], sipRequired: false },
  { id: 22, name: 'Allopurinol', category: 'Musculoskeletal', presentations: ['Tablet'], dosages: ['100mg', '300mg'], sipRequired: false },
  { id: 23, name: 'Alprazolam', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['0.25mg', '0.5mg', '1mg'], sipRequired: true },
  { id: 24, name: 'Aluminium Hydroxide', category: 'Gastrointestinal', presentations: ['Tablet', 'Suspension'], dosages: ['500mg'], sipRequired: false },
  { id: 25, name: 'Aluminium Hydroxide/Magnesium Hydroxide', category: 'Gastrointestinal', presentations: ['Tablet', 'Suspension'], dosages: ['200mg/200mg'], sipRequired: false },
  { id: 26, name: 'Amikacin', category: 'Anti-Infectives', presentations: ['Injection'], dosages: ['100mg/2ml', '500mg/2ml'], sipRequired: false },
  { id: 27, name: 'Amiloride', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg'], sipRequired: false },
  { id: 28, name: 'Amiloride/Hydrochlorothiazide', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/50mg'], sipRequired: false },
  { id: 29, name: 'Aminophylline', category: 'Respiratory Agents', presentations: ['Tablet', 'Injection'], dosages: ['100mg', '250mg/10ml'], sipRequired: false },
  { id: 30, name: 'Amiodarone', category: 'Cardiovascular', presentations: ['Tablet', 'Injection'], dosages: ['200mg', '150mg/3ml'], sipRequired: false },
  { id: 31, name: 'Amitriptyline', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['10mg', '25mg', '50mg'], sipRequired: false },
  { id: 32, name: 'Amlodipine', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg', '10mg'], sipRequired: false },
  { id: 33, name: 'Amlodipine/Atenolol', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/50mg'], sipRequired: false },
  { id: 34, name: 'Amlodipine/Benazepril', category: 'Cardiovascular', presentations: ['Capsule'], dosages: ['2.5mg/10mg', '5mg/20mg'], sipRequired: false },
  { id: 35, name: 'Amlodipine/Losartan', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/50mg', '5mg/100mg'], sipRequired: false },
  { id: 36, name: 'Amlodipine/Olmesartan', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/20mg', '5mg/40mg'], sipRequired: false },
  { id: 37, name: 'Amlodipine/Telmisartan', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/40mg', '5mg/80mg'], sipRequired: false },
  { id: 38, name: 'Amlodipine/Valsartan', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/80mg', '5mg/160mg', '10mg/160mg'], sipRequired: false },
  { id: 39, name: 'Amoxicillin', category: 'Anti-Infectives', presentations: ['Capsule', 'Suspension', 'Tablet'], dosages: ['250mg', '500mg', '125mg/5ml'], sipRequired: false },
  { id: 40, name: 'Amoxicillin/Clavulanic Acid', category: 'Anti-Infectives', presentations: ['Tablet', 'Suspension', 'Injection'], dosages: ['625mg', '1g', '228.5mg/5ml'], sipRequired: false },
  { id: 41, name: 'Amphotericin B', category: 'Anti-Infectives', presentations: ['Injection'], dosages: ['50mg'], sipRequired: true },
  { id: 42, name: 'Ampicillin', category: 'Anti-Infectives', presentations: ['Capsule', 'Injection', 'Suspension'], dosages: ['250mg', '500mg', '1g'], sipRequired: false },
  { id: 43, name: 'Ampicillin/Cloxacillin', category: 'Anti-Infectives', presentations: ['Capsule', 'Injection'], dosages: ['250mg/250mg', '500mg/500mg'], sipRequired: false },
  { id: 44, name: 'Ampicillin/Sulbactam', category: 'Anti-Infectives', presentations: ['Injection'], dosages: ['1.5g', '3g'], sipRequired: false },
  { id: 45, name: 'Anastrozole', category: 'Oncology', presentations: ['Tablet'], dosages: ['1mg'], sipRequired: false },
  { id: 46, name: 'Anti-D Immunoglobulin', category: 'Immunological Agents', presentations: ['Injection'], dosages: ['300mcg'], sipRequired: true },
  { id: 47, name: 'Apixaban', category: 'Haematology', presentations: ['Tablet'], dosages: ['2.5mg', '5mg'], sipRequired: false },
  { id: 48, name: 'Aripiprazole', category: 'Central Nervous System', presentations: ['Tablet', 'Injection'], dosages: ['5mg', '10mg', '15mg', '30mg'], sipRequired: false },
  { id: 49, name: 'Artemether', category: 'Anti-Infectives', presentations: ['Injection'], dosages: ['80mg/ml'], sipRequired: false },
  { id: 50, name: 'Artemether/Lumefantrine', category: 'Anti-Infectives', presentations: ['Tablet'], dosages: ['20mg/120mg', '40mg/240mg'], sipRequired: false },
  { id: 51, name: 'Artesunate', category: 'Anti-Infectives', presentations: ['Injection', 'Tablet'], dosages: ['60mg', '50mg'], sipRequired: false },
  { id: 52, name: 'Artesunate/Amodiaquine', category: 'Anti-Infectives', presentations: ['Tablet'], dosages: ['25mg/67.5mg', '50mg/135mg'], sipRequired: false },
  { id: 53, name: 'Artesunate/Mefloquine', category: 'Anti-Infectives', presentations: ['Tablet'], dosages: ['100mg/220mg'], sipRequired: false },
  { id: 54, name: 'Artesunate/Pyronaridine', category: 'Anti-Infectives', presentations: ['Tablet'], dosages: ['60mg/180mg'], sipRequired: false },
  { id: 55, name: 'Artesunate/Sulfadoxine/Pyrimethamine', category: 'Anti-Infectives', presentations: ['Tablet'], dosages: ['100mg/500mg/25mg'], sipRequired: false },
  { id: 56, name: 'Ascorbic Acid (Vitamin C)', category: 'Supplements', presentations: ['Tablet', 'Injection'], dosages: ['100mg', '500mg', '1000mg'], sipRequired: false },
  { id: 57, name: 'Aspirin', category: 'Analgesics', presentations: ['Tablet'], dosages: ['75mg', '100mg', '300mg'], sipRequired: false },
  { id: 58, name: 'Atenolol', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['25mg', '50mg', '100mg'], sipRequired: false },
  { id: 59, name: 'Atorvastatin', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['10mg', '20mg', '40mg', '80mg'], sipRequired: false },
  { id: 60, name: 'Atracurium', category: 'Central Nervous System', presentations: ['Injection'], dosages: ['25mg/2.5ml', '50mg/5ml'], sipRequired: true },
  { id: 61, name: 'Atropine', category: 'Opthalmological & Otologicals', presentations: ['Injection', 'Eye Drops'], dosages: ['0.6mg/ml', '1%'], sipRequired: false },
  { id: 62, name: 'Azathioprine', category: 'Immunological Agents', presentations: ['Tablet'], dosages: ['50mg'], sipRequired: false },
  { id: 63, name: 'Azithromycin', category: 'Anti-Infectives', presentations: ['Tablet', 'Capsule', 'Suspension'], dosages: ['250mg', '500mg', '200mg/5ml'], sipRequired: false },

  // B
  { id: 64, name: 'Bacillus Calmette-Guerin (BCG) Vaccine', category: 'Vaccines', presentations: ['Injection'], dosages: ['1 dose'], sipRequired: true },
  { id: 65, name: 'Baclofen', category: 'Musculoskeletal', presentations: ['Tablet'], dosages: ['10mg', '25mg'], sipRequired: false },
  { id: 66, name: 'Balsalazide', category: 'Gastrointestinal', presentations: ['Capsule'], dosages: ['750mg'], sipRequired: false },
  { id: 67, name: 'Baricitinib', category: 'Immunological Agents', presentations: ['Tablet'], dosages: ['2mg', '4mg'], sipRequired: true },
  { id: 68, name: 'Beclomethasone', category: 'Respiratory Agents', presentations: ['Inhaler', 'Nasal Spray'], dosages: ['50mcg', '100mcg', '250mcg'], sipRequired: false },
  { id: 69, name: 'Bendroflumethiazide', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['2.5mg', '5mg'], sipRequired: false },
  { id: 70, name: 'Benzhexol (Trihexyphenidyl)', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['2mg', '5mg'], sipRequired: false },
  { id: 71, name: 'Benzoyl Peroxide', category: 'Dermatology', presentations: ['Gel', 'Cream', 'Wash'], dosages: ['2.5%', '5%', '10%'], sipRequired: false },
  { id: 72, name: 'Benzyl Benzoate', category: 'Dermatology', presentations: ['Lotion'], dosages: ['25%'], sipRequired: false },
  { id: 73, name: 'Benzyl Penicillin (Penicillin G)', category: 'Anti-Infectives', presentations: ['Injection'], dosages: ['1MU', '5MU'], sipRequired: false },
  { id: 74, name: 'Betahistine', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['8mg', '16mg', '24mg'], sipRequired: false },
  { id: 75, name: 'Betamethasone', category: 'Dermatology', presentations: ['Cream', 'Ointment', 'Injection'], dosages: ['0.1%', '4mg/ml'], sipRequired: false },
  { id: 76, name: 'Betamethasone/Calcipotriol', category: 'Dermatology', presentations: ['Ointment', 'Gel'], dosages: ['0.05%/0.005%'], sipRequired: false },
  { id: 77, name: 'Betamethasone/Clotrimazole', category: 'Dermatology', presentations: ['Cream'], dosages: ['0.05%/1%'], sipRequired: false },
  { id: 78, name: 'Betamethasone/Fusidic Acid', category: 'Dermatology', presentations: ['Cream'], dosages: ['0.1%/2%'], sipRequired: false },
  { id: 79, name: 'Betamethasone/Gentamicin', category: 'Dermatology', presentations: ['Cream', 'Ointment'], dosages: ['0.1%/0.1%'], sipRequired: false },
  { id: 80, name: 'Betamethasone/Neomycin', category: 'Dermatology', presentations: ['Cream', 'Eye Drops'], dosages: ['0.1%/0.5%'], sipRequired: false },
  { id: 81, name: 'Betamethasone/Salicylic Acid', category: 'Dermatology', presentations: ['Ointment', 'Lotion'], dosages: ['0.05%/3%'], sipRequired: false },
  { id: 82, name: 'Bevacizumab', category: 'Oncology', presentations: ['Injection'], dosages: ['100mg/4ml', '400mg/16ml'], sipRequired: true },
  { id: 83, name: 'Bicalutamide', category: 'Oncology', presentations: ['Tablet'], dosages: ['50mg', '150mg'], sipRequired: false },
  { id: 84, name: 'Bimatoprost', category: 'Opthalmological & Otologicals', presentations: ['Eye Drops'], dosages: ['0.01%', '0.03%'], sipRequired: false },
  { id: 85, name: 'Bisacodyl', category: 'Gastrointestinal', presentations: ['Tablet', 'Suppository'], dosages: ['5mg', '10mg'], sipRequired: false },
  { id: 86, name: 'Bismuth Subsalicylate', category: 'Gastrointestinal', presentations: ['Tablet', 'Suspension'], dosages: ['262mg'], sipRequired: false },
  { id: 87, name: 'Bisoprolol', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['2.5mg', '5mg', '10mg'], sipRequired: false },
  { id: 88, name: 'Bisoprolol/Amlodipine', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['5mg/5mg', '5mg/10mg', '10mg/5mg'], sipRequired: false },
  { id: 89, name: 'Bisoprolol/Hydrochlorothiazide', category: 'Cardiovascular', presentations: ['Tablet'], dosages: ['2.5mg/6.25mg', '5mg/6.25mg', '10mg/6.25mg'], sipRequired: false },
  { id: 90, name: 'Bleomycin', category: 'Oncology', presentations: ['Injection'], dosages: ['15 units'], sipRequired: true },
  { id: 91, name: 'Bortezomib', category: 'Oncology', presentations: ['Injection'], dosages: ['3.5mg'], sipRequired: true },
  { id: 92, name: 'Brimonidine', category: 'Opthalmological & Otologicals', presentations: ['Eye Drops'], dosages: ['0.1%', '0.15%', '0.2%'], sipRequired: false },
  { id: 93, name: 'Brimonidine/Timolol', category: 'Opthalmological & Otologicals', presentations: ['Eye Drops'], dosages: ['0.2%/0.5%'], sipRequired: false },
  { id: 94, name: 'Brinzolamide', category: 'Opthalmological & Otologicals', presentations: ['Eye Drops'], dosages: ['1%'], sipRequired: false },
  { id: 95, name: 'Bromhexine', category: 'Respiratory Agents', presentations: ['Tablet', 'Syrup'], dosages: ['8mg', '4mg/5ml'], sipRequired: false },
  { id: 96, name: 'Budesonide', category: 'Respiratory Agents', presentations: ['Inhaler', 'Nasal Spray', 'Nebulizer'], dosages: ['100mcg', '200mcg', '400mcg'], sipRequired: false },
  { id: 97, name: 'Budesonide/Formoterol', category: 'Respiratory Agents', presentations: ['Inhaler'], dosages: ['80mcg/4.5mcg', '160mcg/4.5mcg', '320mcg/9mcg'], sipRequired: false },
  { id: 98, name: 'Bumetanide', category: 'Cardiovascular', presentations: ['Tablet', 'Injection'], dosages: ['1mg', '0.5mg/ml'], sipRequired: false },
  { id: 99, name: 'Bupivacaine', category: 'Central Nervous System', presentations: ['Injection'], dosages: ['0.25%', '0.5%'], sipRequired: false },
  { id: 100, name: 'Buprenorphine', category: 'Central Nervous System', presentations: ['Tablet', 'Patch', 'Injection'], dosages: ['2mg', '8mg', '35mcg/hr'], sipRequired: true },
  { id: 101, name: 'Bupropion', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['150mg', '300mg'], sipRequired: false },
  { id: 102, name: 'Buscopan (Hyoscine Butylbromide)', category: 'Gastrointestinal', presentations: ['Tablet', 'Injection'], dosages: ['10mg', '20mg/ml'], sipRequired: false },
  { id: 103, name: 'Buspirone', category: 'Central Nervous System', presentations: ['Tablet'], dosages: ['5mg', '10mg'], sipRequired: false },
  { id: 104, name: 'Busulfan', category: 'Oncology', presentations: ['Tablet', 'Injection'], dosages: ['2mg', '60mg/10ml'], sipRequired: true },
];

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
  'Hormone Therapy',
  'Immunological Agents',
  'Maternal, Newborn & Child Health',
  'Medical supplies',
  'Musculoskeletal',
  'Oncology',
  'Opthalmological & Otologicals',
  'Other services',
  'Reproductive Health',
  'Respiratory Agents',
  'Supplements',
  'Vaccines',
];

// SIP options
const sipOptions = [
  { label: 'Does not apply', value: 'does_not_apply' },
  { label: 'Has been issued', value: 'has_been_issued' },
  { label: 'Is being processed', value: 'is_being_processed' },
  { label: 'To be requested', value: 'to_be_requested' },
];

function Catalogue() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [selectedDosage, setSelectedDosage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);
  const [packagingNotes, setPackagingNotes] = useState('');
  const [sipValue, setSipValue] = useState('does_not_apply');
  const [showSuccess, setShowSuccess] = useState(false);

  // Draft order context
  const { addItem, showItemNotification } = useDraftOrder();

  const filteredData = productData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    return matchesSearch && matchesCategory;
  });

  const handleAddToOrder = (product: Product) => {
    setSelectedProduct(product);
    setSelectedForm(product.presentations[0] || '');
    setSelectedDosage(product.dosages[0] || '');
    setQuantity(100);
    setPackagingNotes('');
    setSipValue('does_not_apply');
    setDrawerOpen(true);
  };

  const handleSubmitToCart = () => {
    if (!selectedProduct) return;

    const itemName = selectedProduct.name;

    addItem({
      medicineName: itemName,
      presentation: selectedForm,
      dosage: selectedDosage,
      sip: sipValue,
      quantity,
      units: getUnitForPresentation(selectedForm),
      packagingNotes: packagingNotes || undefined,
    });

    // Show success state, then close drawer and show notification
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setDrawerOpen(false);
      // Show notification after drawer closes
      showItemNotification(itemName);
    }, 1200);
  };

  // Table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Presentations',
      dataIndex: 'presentations',
      key: 'presentations',
      width: '30%',
      render: (presentations: string[]) => (
        <Space size={[4, 4]} wrap>
          {presentations.slice(0, 3).map((presentation: string, idx: number) => (
            <Tag key={idx} style={{ margin: 0, fontSize: 11 }}>{presentation}</Tag>
          ))}
          {presentations.length > 3 && (
            <Tag style={{ margin: 0, fontSize: 11, background: '#f5f5f5' }}>+{presentations.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '25%',
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
      title: '',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleAddToOrder(record)}
          style={{ padding: 0 }}
        >
          Add to Order
        </Button>
      ),
    },
  ];

  return (
    <div className="catalogue-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Catalogue</Title>
      </div>

      <Card
        className="catalogue-content catalogue-airtable"
        styles={{ body: { padding: 0 } }}
      >
        {/* Search and Filter Bar */}
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
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Space>
            <Select
              mode="multiple"
              placeholder="All categories"
              style={{ minWidth: 200 }}
              value={selectedCategories}
              onChange={setSelectedCategories}
              options={categories.map(c => ({ label: c, value: c }))}
              maxTagCount={1}
              allowClear
            />
            <Button icon={<SortAscendingOutlined />}>Sort by Name</Button>
          </Space>
        </div>

        {/* Product Count */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary">{filteredData.length} products</Text>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
          size="small"
          className="catalogue-table catalogue-table-airtable"
        />
      </Card>
 
      {/* Product Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        width={480}
        onClose={() => !showSuccess && setDrawerOpen(false)}
        open={drawerOpen}
        closable={false}
        styles={{ body: { padding: 0 } }}
        className="product-drawer"
      >
        {selectedProduct && (
          <div className="product-drawer-content">
            {/* Success Overlay */}
            {showSuccess && (
              <div className="product-drawer-success">
                <div className="product-drawer-success-content">
                  <CheckCircleFilled className="product-drawer-success-icon" />
                  <Typography.Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                    Added to Draft Order
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {selectedProduct.name}
                  </Typography.Text>
                </div>
              </div>
            )}
            {/* Close button */}
            <div className="product-drawer-close">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setDrawerOpen(false)}
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
                {selectedProduct.presentations.map((presentation) => (
                  <div
                    key={presentation}
                    onClick={() => setSelectedForm(presentation)}
                    className={`product-option-card ${selectedForm === presentation ? 'selected' : ''}`}
                  >
                    {selectedForm === presentation && <CheckOutlined className="product-option-check" />}
                    <span>{presentation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dosage */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Dosage</Text>
              <div className="product-drawer-chips">
                {selectedProduct.dosages.map((dosage) => (
                  <div
                    key={dosage}
                    onClick={() => setSelectedDosage(dosage)}
                    className={`product-option-card ${selectedDosage === dosage ? 'selected' : ''}`}
                  >
                    {selectedDosage === dosage && <CheckOutlined className="product-option-check" />}
                    <span>{dosage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Quantity <span style={{ fontStyle: 'italic', opacity: 0.7 }}>(Click to edit)</span></Text>
              <div className="product-quantity">
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => setQuantity(Math.max(1, quantity - 100))}
                  disabled={quantity <= 1}
                />
                <div className="product-quantity-value">
                  <Input
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(val);
                      } else if (e.target.value === '') {
                        setQuantity(1);
                      }
                    }}
                    className="product-quantity-input"
                  />
                  <span className="product-quantity-unit">{getUnitForPresentation(selectedForm)}</span>
                </div>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setQuantity(quantity + 100)}
                />
              </div>
            </div>

            {/* Special Import Permit */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">Special Import Permit</Text>
              <Select
                value={sipValue}
                onChange={setSipValue}
                style={{ width: '100%' }}
                options={sipOptions}
              />
            </div>

            {/* Notes */}
            <div className="product-drawer-section">
              <Text type="secondary" className="product-drawer-label">
                Notes <span style={{ fontStyle: 'italic', opacity: 0.7 }}>(Optional)</span>
              </Text>
              <TextArea
                value={packagingNotes}
                onChange={(e) => setPackagingNotes(e.target.value)}
                placeholder="Packaging preferences, brand requirements, delivery instructions..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Footer CTA */}
            <div className="product-drawer-footer">
              <Button
                type="primary"
                size="large"
                block
                onClick={handleSubmitToCart}
              >
                Add to Order
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// Helper function to get unit based on presentation type
function getUnitForPresentation(presentation: string): string {
  const unitMap: Record<string, string> = {
    'Tablet': 'tablets',
    'Tablet - Chewable': 'tablets',
    'Buccal Tablet': 'tablets',
    'Caplet': 'caplets',
    'Capsule': 'capsules',
    'Injection': 'vials',
    'Auto-Injector': 'units',
    'Syrup': 'bottles',
    'Suspension': 'bottles',
    'Solution': 'bottles',
    'Cream': 'tubes',
    'Gel': 'tubes',
    'Ointment': 'tubes',
    'Lotion': 'bottles',
    'Wash': 'bottles',
    'Inhaler': 'inhalers',
    'Nasal Spray': 'sprays',
    'Nebulizer': 'vials',
    'Nebulizer Solution': 'vials',
    'Eye Drops': 'bottles',
    'Suppository': 'units',
    'Patch': 'patches',
    'Analg': 'units',
  };
  return unitMap[presentation] || 'units';
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
    'Hormone Therapy': '#fadb14',
    'Immunological Agents': '#faad14',
    'Maternal, Newborn & Child Health': '#ff85c0',
    'Medical supplies': '#597ef7',
    'Musculoskeletal': '#36cfc9',
    'Oncology': '#9254de',
    'Opthalmological & Otologicals': '#69c0ff',
    'Other services': '#95de64',
    'Reproductive Health': '#ff7875',
    'Respiratory Agents': '#5cdbd3',
    'Supplements': '#b37feb',
    'Vaccines': '#ffc069',
  };
  return colors[category] || '#1890ff';
}

export default Catalogue;
