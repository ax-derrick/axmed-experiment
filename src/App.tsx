import { Layout, Menu, Badge, Avatar, Button, Typography, Space, Dropdown, Drawer, Tag, Checkbox, Input } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
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
} from '@ant-design/icons';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedTenders, setExpandedTenders] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
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

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
              <div className="draft-bids-btn" onClick={() => setDrawerOpen(true)} style={{ cursor: 'pointer' }}>
                <FileTextOutlined className="draft-bids-icon" />
                <span className="draft-bids-text">Draft Bids</span>
                <Badge count={totalBidsCount} size="small" className="draft-bids-badge" />
              </div>
            </Space>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Content>

      </Layout>

      {/* Draft Bids Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Draft bids ({totalBidsCount})</span>
          </div>
        }
        placement="right"
        width={720}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
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
            navigate(key);
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
                </div>
                <DownOutlined className="caret-icon" />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

export default App;
