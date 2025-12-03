import { Layout, Menu, Badge, Avatar, Button, Typography, Space, Dropdown, Drawer, Tag, Checkbox, Input, Spin, Select, Popover } from 'antd';
import type { MenuProps } from 'antd';
import { useState, useEffect, useRef } from 'react';
import {
  HomeOutlined,
  FolderOutlined,
  TeamOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  BarChartOutlined,
  MenuOutlined,
  DownOutlined,
  ClockCircleOutlined,
  EditOutlined,
  CloseOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SwapOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  GithubOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined as NoteIcon,
} from '@ant-design/icons';
import { HashRouter, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierAnalytics from './pages/supplier/Analytics';
import SupplierPortfolio from './pages/supplier/Portfolio';
import SupplierPortfolioBulkUpload from './pages/supplier/PortfolioBulkUpload';
import SupplierOpenTenders from './pages/supplier/OpenTenders';
import SupplierMyBids from './pages/supplier/MyBids';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerAnalytics from './pages/buyer/Analytics';
import Catalogue from './pages/buyer/Catalogue';
import ReviewOrder from './pages/buyer/ReviewOrder';
import MyOrders from './pages/buyer/MyOrders';
import OrderDetails from './pages/buyer/OrderDetails';
import BulkUpload from './pages/buyer/BulkUpload';
import BulkUploadConfirmation from './pages/buyer/BulkUploadConfirmation';
import { DraftOrderProvider, useDraftOrder } from './context/DraftOrderContext';
import './App.css';

// Draft bids organized by tender
const draftBidsByTender = [
  {
    tenderId: 211,
    tenderName: 'Tender 211',
    closingSoon: true,
    bids: [
      {
        id: 1,
        medication: 'Abiraterone',
        form: 'Tablet',
        dose: '250Mg',
        volume: '100,000 Tablets',
        packSize: 233,
        prodLeadTime: '44 weeks',
        typeOfStock: 'new',
        countries: ['Ghana'],
        standardShelfLife: '44 months',
        incoterms: 'Cost Paid To, Austria',
        packPriceLow: '$1',
        packPriceMid: '$1',
        packPriceHigh: '$1',
        packagingNotes: 'dvd',
        createdOn: '08 Oct 2025',
        bidValidity: '44 days',
      },
      {
        id: 2,
        medication: 'Abiraterone',
        form: 'Tablet',
        dose: '250Mg',
        volume: '400 Tablets',
        packSize: 233,
        prodLeadTime: '44 weeks',
        typeOfStock: 'new',
        countries: ['Ghana'],
        standardShelfLife: '44 months',
        incoterms: 'Cost Paid To, Austria',
        packPriceLow: '$1',
        packPriceMid: '$1',
        packPriceHigh: '$1',
        packagingNotes: 'dvd',
        createdOn: '08 Oct 2025',
        bidValidity: '44 days',
      },
      {
        id: 3,
        medication: 'Abiraterone',
        form: 'Tablet',
        dose: '250Mg',
        volume: '200 Tablets',
        packSize: 233,
        prodLeadTime: '44 weeks',
        typeOfStock: 'new',
        countries: ['Ghana'],
        standardShelfLife: '44 months',
        incoterms: 'Cost Paid To, Austria',
        packPriceLow: '$1',
        packPriceMid: '$1',
        packPriceHigh: '$1',
        packagingNotes: 'dvd',
        createdOn: '08 Oct 2025',
        bidValidity: '44 days',
      },
    ],
  },
  {
    tenderId: 198,
    tenderName: 'Tender 198',
    closingSoon: false,
    bids: [
      {
        id: 4,
        medication: 'Metformin',
        form: 'Tablet',
        dose: '500Mg',
        volume: '50,000 Tablets',
        packSize: 100,
        prodLeadTime: '12 weeks',
        typeOfStock: 'existing',
        countries: ['Kenya', 'Uganda'],
        standardShelfLife: '36 months',
        incoterms: 'CIF Mombasa',
        packPriceLow: '$0.80',
        packPriceMid: '$0.75',
        packPriceHigh: '$0.70',
        packagingNotes: 'Blister pack',
        createdOn: '15 Oct 2025',
        bidValidity: '30 days',
      },
      {
        id: 5,
        medication: 'Amoxicillin',
        form: 'Capsule',
        dose: '500Mg',
        volume: '25,000 Capsules',
        packSize: 500,
        prodLeadTime: '8 weeks',
        typeOfStock: 'new',
        countries: ['Nigeria'],
        standardShelfLife: '24 months',
        incoterms: 'FOB Lagos',
        packPriceLow: '$2.50',
        packPriceMid: '$2.30',
        packPriceHigh: '$2.10',
        packagingNotes: 'Bottle',
        createdOn: '18 Oct 2025',
        bidValidity: '45 days',
      },
    ],
  },
  {
    tenderId: 175,
    tenderName: 'Tender 175',
    closingSoon: true,
    bids: [
      {
        id: 6,
        medication: 'Paracetamol',
        form: 'Tablet',
        dose: '500Mg',
        volume: '200,000 Tablets',
        packSize: 1000,
        prodLeadTime: '6 weeks',
        typeOfStock: 'existing',
        countries: ['Tanzania', 'Rwanda'],
        standardShelfLife: '48 months',
        incoterms: 'DDP Dar es Salaam',
        packPriceLow: '$0.50',
        packPriceMid: '$0.45',
        packPriceHigh: '$0.40',
        packagingNotes: 'Strip pack',
        createdOn: '20 Oct 2025',
        bidValidity: '60 days',
      },
    ],
  },
];

// Calculate total bids count
const totalBidsCount = draftBidsByTender.reduce((acc, tender) => acc + tender.bids.length, 0);

const BASE_URL = import.meta.env.BASE_URL || '/';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [drawerOpen, setDrawerOpen] = useState(false); // Moved to context
  const [expandedTenders, setExpandedTenders] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<'supplier' | 'buyer' | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [shakeNotification, setShakeNotification] = useState(false);
  const prevItemCountRef = useRef<number>(0);

  // Draft order context for buyer
  const { items: draftOrderItems, updateItem, removeItem, isDrawerOpen, openDrawer, closeDrawer, notification, dismissNotification, bulkUploadDraft, clearBulkUploadDraft } = useDraftOrder();

  // Track item count changes
  useEffect(() => {
    prevItemCountRef.current = draftOrderItems.length;
  }, [draftOrderItems.length]);

  // Shake notification when it becomes visible (if there were previous items, it means a new item was added)
  useEffect(() => {
    if (notification.visible && prevItemCountRef.current > 1) {
      // Small delay to ensure the slide-up animation completes first
      const timer = setTimeout(() => {
        setShakeNotification(true);
        setTimeout(() => setShakeNotification(false), 400);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [notification.visible, notification.itemName]);

  // Get role from URL, default to 'supplier'
  const roleParam = searchParams.get('r');
  const userRole: 'supplier' | 'buyer' = roleParam === 'buyer' ? 'buyer' : 'supplier';

  const setUserRole = (role: 'supplier' | 'buyer') => {
    setSwitchingRole(role);
    setTimeout(() => {
      setSearchParams({ r: role });
      setSwitchingRole(null);
    }, 800);
  };

  // Menu items based on role
  const supplierMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/portfolio',
      icon: <FolderOutlined />,
      label: 'Portfolio',
    },
    {
      key: '/open-tenders',
      icon: <TeamOutlined />,
      label: (
        <Space>
          Open Tenders
          <Badge count={9} size="small" />
        </Space>
      ),
    },
    {
      key: '/my-bids',
      icon: <FileTextOutlined />,
      label: 'My Bids',
    },
  ];

  const buyerMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/catalogue',
      icon: <AppstoreOutlined />,
      label: 'Catalogue',
    },
    {
      key: '/my-orders',
      icon: <ShoppingCartOutlined />,
      label: 'My Orders',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
  ];

  const menuItems = userRole === 'buyer' ? buyerMenuItems : supplierMenuItems;

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`${key}?r=${userRole}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Role Switching Overlay */}
      {switchingRole && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: 16,
        }}>
          <Spin size="large" />
          <Text style={{ fontSize: 16, color: '#595959' }}>
            Switching to {switchingRole.charAt(0).toUpperCase() + switchingRole.slice(1)}...
          </Text>
        </div>
      )}
      {/* Sidebar - Hidden on mobile */}
      <Sider
        theme="light"
        width={200}
        collapsedWidth={64}
        collapsed={sidebarCollapsed}
        className="desktop-sider"
        style={{
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Logo */}
        <div className={`logo ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {sidebarCollapsed ? (
            <span className="logo-collapsed-text">A</span>
          ) : (
            <img src={`${BASE_URL}axmed-logo.png`} alt="Axmed" height="28" />
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 'none', flex: 1 }}
        />

        {/* Impact Report Card - Above divider */}
        <a
          href="https://axmed.com/impact-report"
          target="_blank"
          rel="noopener noreferrer"
          className={`impact-report-card ${sidebarCollapsed ? 'collapsed' : ''}`}
        >
          <div className="impact-report-icon">
            <HeartOutlined />
          </div>
          {!sidebarCollapsed && (
            <div className="impact-report-content">
              <span className="impact-report-title">Impact Report</span>
              <span className="impact-report-subtitle">See how Axmed is making a difference</span>
            </div>
          )}
        </a>

        {/* Bottom section of sidebar */}
        <div className={`sidebar-bottom ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Switch Role Button */}
          <div
            className={`sidebar-switch-role ${sidebarCollapsed ? 'collapsed' : ''}`}
            onClick={() => setUserRole(userRole === 'supplier' ? 'buyer' : 'supplier')}
          >
            <SwapOutlined />
            {!sidebarCollapsed && <span>Switch to {userRole === 'supplier' ? 'Buyer' : 'Supplier'}</span>}
          </div>

          {/* Support Link */}
          <a
            href="https://form.asana.com/?k=syQQO9QJls5IRuUzlbUDTQ&d=1207382794046065"
            target="_blank"
            rel="noopener noreferrer"
            className={`sidebar-support-link ${sidebarCollapsed ? 'collapsed' : ''}`}
          >
            <QuestionCircleOutlined />
            {!sidebarCollapsed && <span>Support</span>}
          </a>

          {/* Profile Dropdown */}
          <div className={`sidebar-profile ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile' },
                  { key: 'settings', label: 'Settings' },
                  { type: 'divider' },
                  { key: 'logout', label: 'Logout' },
                ] as MenuProps['items'],
              }}
              trigger={['click']}
              placement="topRight"
            >
              <Space className={`profile-trigger sidebar-profile-trigger ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Avatar
                  src="https://axmed-demo-static-files.s3.eu-west-1.amazonaws.com/uploads/CIPLA-logo381353.png"
                  size={32}
                />
                {!sidebarCollapsed && (
                  <>
                    <div className="profile-info">
                      <span className="org-name">Cipla Pharmaceuticals</span>
                      <span className="role-label" style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'capitalize' }}>{userRole}</span>
                    </div>
                    <DownOutlined className="caret-icon" />
                  </>
                )}
              </Space>
            </Dropdown>
          </div>

        </div>
      </Sider>

      <Layout className="main-layout" style={{ marginLeft: sidebarCollapsed ? 64 : 200, background: '#fafafa', transition: 'margin-left 0.2s ease' }}>
        {/* Header */}
        <Header className="header">
          <div className="header-content">
            {/* Desktop: Collapse toggle */}
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="sidebar-toggle-btn desktop-only"
            />
            {/* Mobile: Menu toggle + Logo */}
            <div className="mobile-header-left">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                className="mobile-menu-toggle"
              />
              <img src={`${BASE_URL}axmed-logo.png`} alt="Axmed" height="24" className="mobile-logo" />
            </div>
            {/* Right side menu items */}
            <Space size="large" className="header-menu">
              <div className="draft-bids-btn" onClick={openDrawer} style={{ cursor: 'pointer' }}>
                <ShoppingCartOutlined className="draft-bids-icon" />
                <span className="draft-bids-text">{userRole === 'buyer' ? 'Draft Orders' : 'Draft Bids'}</span>
                <Badge count={userRole === 'buyer' ? draftOrderItems.length : totalBidsCount} size="small" className="draft-bids-badge" />
              </div>
            </Space>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content className="content">
          <Routes>
            <Route path="/" element={userRole === 'supplier' ? <SupplierDashboard /> : <BuyerDashboard />} />
            <Route path="/analytics" element={userRole === 'supplier' ? <SupplierAnalytics /> : <BuyerAnalytics />} />
            <Route path="/portfolio" element={<SupplierPortfolio />} />
            <Route path="/portfolio/bulk-upload" element={<SupplierPortfolioBulkUpload />} />
            <Route path="/open-tenders" element={<SupplierOpenTenders />} />
            <Route path="/my-bids" element={<SupplierMyBids />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/review-order" element={<ReviewOrder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order/:orderId" element={<OrderDetails />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
            <Route path="/bulk-upload-confirmation" element={<BulkUploadConfirmation />} />
          </Routes>
        </Content>

      </Layout>

      {/* GitHub Link */}
      <a
        href="https://github.com/ax-derrick/axmed-experiment"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
      >
        <GithubOutlined />
      </a>

      {/* Draft Bids/Orders Drawer */}
      {userRole === 'buyer' ? (
        <Drawer
          title={`Draft Order (${draftOrderItems.length} items)`}
          placement="right"
          width={820}
          onClose={closeDrawer}
          open={isDrawerOpen}
          footer={
            draftOrderItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    closeDrawer();
                    navigate(`/catalogue?r=buyer`);
                  }}
                >
                  Add more medicines
                </Button>
                <Button
                  type="primary"
                  loading={submittingOrder}
                  onClick={() => {
                    setSubmittingOrder(true);
                    setTimeout(() => {
                      setSubmittingOrder(false);
                      closeDrawer();
                      navigate('/review-order?r=buyer');
                    }, 800);
                  }}
                >
                  Review Order
                </Button>
              </div>
            )
          }
        >
          {/* Info Banner */}
          <div style={{
            background: '#f0f5ff',
            border: '1px solid #d6e4ff',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Review your draft order and submit when ready. We'll share it with suppliers to get you competitive bids.
            </Text>
          </div>

          {draftOrderItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Your draft order is empty
              </Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  closeDrawer();
                  navigate(`/catalogue?r=buyer`);
                }}
              >
                Browse Catalogue
              </Button>
            </div>
          ) : (
            <div className="draft-order-table">
              {/* Table Header */}
              <div className="draft-order-table-header">
                <div className="draft-order-col medicine-col">Medicine</div>
                <div className="draft-order-col sip-col">SIP</div>
                <div className="draft-order-col volume-col">Volume</div>
                <div className="draft-order-col notes-col">Notes</div>
                <div className="draft-order-col action-col"></div>
              </div>
              {/* Table Rows */}
              {draftOrderItems.map((item) => (
                <div key={item.id} className="draft-order-table-row">
                  <div className="draft-order-col medicine-col">
                    <div className="medicine-info">
                      <span className="medicine-name">{item.medicineName}</span>
                      <Text type="secondary" className="medicine-dosage">{item.presentation} · {item.dosage}</Text>
                    </div>
                  </div>
                  <div className="draft-order-col sip-col">
                    <Select
                      size="small"
                      value={item.sip}
                      onChange={(value) => updateItem(item.id, { sip: value })}
                      style={{ width: '100%' }}
                      options={[
                        { label: 'Does not apply', value: 'does_not_apply' },
                        { label: 'Has been issued', value: 'has_been_issued' },
                        { label: 'Is being processed', value: 'is_being_processed' },
                        { label: 'To be requested', value: 'to_be_requested' },
                      ]}
                    />
                  </div>
                  <div className="draft-order-col volume-col">
                    <Input
                      size="small"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          updateItem(item.id, { quantity: val });
                        }
                      }}
                      style={{ width: 70, textAlign: 'right' }}
                    />
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{item.units}</Text>
                  </div>
                  <div className="draft-order-col notes-col">
                    <Popover
                      trigger="click"
                      placement="bottomRight"
                      arrow={{ pointAtCenter: true }}
                      content={
                        <div style={{ width: 280 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            <NoteIcon style={{ marginRight: 6 }} />
                            Packaging Notes
                          </Text>
                          <Input.TextArea
                            value={item.packagingNotes || ''}
                            onChange={(e) => updateItem(item.id, { packagingNotes: e.target.value })}
                            placeholder="Add special packaging requirements, delivery instructions, or other notes..."
                            rows={4}
                            style={{ marginBottom: 8 }}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            These notes will be shared with suppliers
                          </Text>
                        </div>
                      }
                    >
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, height: 'auto', fontSize: 12 }}
                      >
                        {item.packagingNotes ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <NoteIcon style={{ color: '#1890ff' }} />
                            <span>View note</span>
                          </span>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>+ Add note</span>
                        )}
                      </Button>
                    </Popover>
                  </div>
                  <div className="draft-order-col action-col">
                    <Popover
                      trigger="click"
                      placement="left"
                      content={
                        <div style={{ textAlign: 'center' }}>
                          <Text style={{ display: 'block', marginBottom: 8 }}>Remove this item?</Text>
                          <Button
                            size="small"
                            danger
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                      />
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Drawer>
      ) : (
        <Drawer
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Draft bids ({totalBidsCount})</span>
            </div>
          }
          placement="right"
          width={720}
          onClose={closeDrawer}
          open={isDrawerOpen}
          extra={
            <Space>
              <Input placeholder="Search for medicine" prefix={<SearchOutlined />} style={{ width: 200 }} />
              <Button icon={<FilterOutlined />}>Filter</Button>
            </Space>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Please review and submit your draft bids for us to share with the different buyers</Text>
          </div>

          {/* Tender Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {draftBidsByTender.map((tender) => (
              <div key={tender.tenderId} className="tender-group">
                <div
                  className="tender-group-header"
                  onClick={() => setExpandedTenders(prev =>
                    prev.includes(tender.tenderId) ? prev.filter(id => id !== tender.tenderId) : [...prev, tender.tenderId]
                  )}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tender-group-title">
                    <DownOutlined
                      className="collapse-icon"
                      style={{
                        transform: expandedTenders.includes(tender.tenderId) ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s'
                      }}
                    />
                    <Text strong>{tender.tenderName}</Text>
                    <Text type="secondary">({tender.bids.length} bids)</Text>
                    {tender.closingSoon && <Tag color="error" icon={<ClockCircleOutlined />}>Closing soon</Tag>}
                  </div>
                  <div className="tender-group-actions" onClick={(e) => e.stopPropagation()}>
                    <Checkbox>Select All</Checkbox>
                    <Button size="small" icon={<DownloadOutlined />}>Export to xls</Button>
                    <Button type="primary" size="small">Submit</Button>
                  </div>
                </div>

                {expandedTenders.includes(tender.tenderId) && (
                  <div className="draft-bids-list">
                    {tender.bids.map((bid) => (
                      <div key={bid.id} className="draft-bid-card">
                        <div className="draft-bid-header">
                          <div>
                            <Text strong>{bid.medication}</Text>
                            <Tag color="blue" style={{ marginLeft: 8 }}>{bid.form}</Tag>
                          </div>
                          <Space>
                            <Button type="text" size="small" icon={<EditOutlined />} />
                            <Button type="text" size="small" icon={<CloseOutlined />} danger />
                            <Button type="link" size="small">View Tender</Button>
                          </Space>
                        </div>

                        <div className="draft-bid-details">
                          <div className="detail-row">
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Dose:</Text>
                              <Text>{bid.dose}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Volume:</Text>
                              <Text>{bid.volume}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Pack size:</Text>
                              <Text>{bid.packSize}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Countries:</Text>
                              <Text>{bid.countries.join(', ')}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Pack price (&lt;40%):</Text>
                              <Text>{bid.packPriceLow}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Pack price (40-75%):</Text>
                              <Text>{bid.packPriceMid}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Pack price (&gt;75%):</Text>
                              <Text>{bid.packPriceHigh}</Text>
                            </div>
                          </div>
                          <div className="detail-row">
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Created on:</Text>
                              <Text>{bid.createdOn}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Bid validity:</Text>
                              <Text>{bid.bidValidity}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Type of stock:</Text>
                              <Text>{bid.typeOfStock}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Prod. lead time:</Text>
                              <Text>{bid.prodLeadTime}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Standard shelf life:</Text>
                              <Text>{bid.standardShelfLife}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Incoterms:</Text>
                              <Text>{bid.incoterms}</Text>
                            </div>
                            <div className="detail-item">
                              <Text type="secondary" className="detail-label">Packaging notes:</Text>
                              <Text>{bid.packagingNotes}</Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Drawer>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        placement="left"
        width={280}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-nav-drawer"
        styles={{ body: { padding: 0 } }}
      >
        {/* Logo */}
        <div className="mobile-drawer-logo">
          <img src={`${BASE_URL}axmed-logo.png`} alt="Axmed" height="28" />
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(`${key}?r=${userRole}`);
            setMobileMenuOpen(false);
          }}
          style={{ borderRight: 'none' }}
        />

        {/* Impact Report Card */}
        <div style={{ padding: '16px 12px' }}>
          <a
            href="https://axmed.com/impact-report"
            target="_blank"
            rel="noopener noreferrer"
            className="impact-report-card"
            style={{ position: 'relative', bottom: 'auto', left: 'auto', right: 'auto', margin: 0 }}
          >
            <div className="impact-report-icon">
              <HeartOutlined />
            </div>
            <div className="impact-report-content">
              <span className="impact-report-title">Impact Report</span>
              <span className="impact-report-subtitle">See how Axmed is making a difference</span>
            </div>
          </a>
        </div>

        {/* Bottom section */}
        <div className="mobile-drawer-bottom">
          {/* Switch Role Button */}
          <div
            className="sidebar-switch-role"
            onClick={() => setUserRole(userRole === 'supplier' ? 'buyer' : 'supplier')}
          >
            <SwapOutlined />
            <span>Switch to {userRole === 'supplier' ? 'Buyer' : 'Supplier'}</span>
          </div>

          {/* Support Link */}
          <a
            href="https://form.asana.com/?k=syQQO9QJls5IRuUzlbUDTQ&d=1207382794046065"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-support-link"
          >
            <QuestionCircleOutlined />
            <span>Support</span>
          </a>

          {/* Profile */}
          <div className="sidebar-profile">
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Profile' },
                  { key: 'settings', label: 'Settings' },
                  { type: 'divider' },
                  { key: 'logout', label: 'Logout' },
                ] as MenuProps['items'],
              }}
              trigger={['click']}
              placement="topRight"
            >
              <Space className="profile-trigger sidebar-profile-trigger">
                <Avatar
                  src="https://axmed-demo-static-files.s3.eu-west-1.amazonaws.com/uploads/CIPLA-logo381353.png"
                  size={32}
                />
                <div className="profile-info">
                  <span className="org-name">Cipla Pharmaceuticals</span>
                  <span className="role-label" style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'capitalize' }}>{userRole}</span>
                </div>
                <DownOutlined className="caret-icon" />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Drawer>

      {/* Draft Order Notification - Bottom Sheet Style */}
      {userRole === 'buyer' && notification.visible && (
        <div className={`draft-notification-bottom-sheet${shakeNotification ? ' shake' : ''}`}>
          <div className="draft-notification-bottom-sheet-handle" />
          <div className="draft-notification-bottom-sheet-content">
            <div className="draft-notification-bottom-sheet-left">
              <img src={`${BASE_URL}images/medication-placeholder.svg`} alt="" style={{ width: 32, height: 32, flexShrink: 0 }} />
              <div className="draft-notification-bottom-sheet-info">
                <div className="draft-notification-bottom-sheet-row">
                  {notification.itemName && (
                    <Text strong style={{ fontSize: 14 }}>{notification.itemName}</Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>added to draft</Text>
                </div>
                <div className="draft-notification-bottom-sheet-meta">
                  <Badge count={draftOrderItems.length} showZero style={{ backgroundColor: '#1890ff' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {draftOrderItems.length === 1 ? 'item' : 'items'} in order
                  </Text>
                </div>
              </div>
            </div>
            <div className="draft-notification-bottom-sheet-actions">
              <Button
                type="primary"
                onClick={() => {
                  dismissNotification();
                  openDrawer();
                }}
              >
                Review Order
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={dismissNotification}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Draft Notification - hide when on bulk upload page */}
      {userRole === 'buyer' && bulkUploadDraft && bulkUploadDraft.rows.length > 0 && !location.pathname.includes('/bulk-upload') && (
        <div className="bulk-draft-notification">
          <div className="bulk-draft-notification-left">
            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div className="bulk-draft-notification-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ fontSize: 14 }}>Bulk order draft</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>saved</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: '#1890ff',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '0 6px',
                }}>
                  {bulkUploadDraft.rows.length}
                </span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  item{bulkUploadDraft.rows.length !== 1 ? 's' : ''} pending
                </Text>
              </div>
            </div>
          </div>
          <div className="bulk-draft-notification-actions">
            <Button
              type="primary"
              onClick={() => navigate('/bulk-upload?r=buyer')}
            >
              Continue
            </Button>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={clearBulkUploadDraft}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

function App() {
  return (
    <DraftOrderProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </DraftOrderProvider>
  );
}

export default App;
