import { Typography, Card, Row, Col, Button, Spin, Progress, Tag, theme, Steps, List, Avatar, Tooltip, Table, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  RightOutlined,
  PlusOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  BookOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Metabase embed URL for buyer analytics
const DASHBOARD_SNAPSHOT_URL = "https://axmed.metabaseapp.com/public/dashboard/e32a226c-b319-42e4-a640-a48e3b2ddbb5#titled=false&downloads=false";
const METABASE_RESIZER_URL = "https://axmed.metabaseapp.com/app/iframeResizer.js";

// Buyer user data
const buyerData = {
  name: 'Derrick',
  organization: 'Ministry of Health Kenya',
};

// Order Journey Steps
const orderJourneySteps = [
  {
    key: 'create',
    title: 'Create Order',
    description: 'Browse catalogue and create your order',
    icon: 'PlusOutlined',
    cta: 'Browse Catalogue',
    status: 'completed',
  },
  {
    key: 'review',
    title: 'Review Quotes',
    description: 'Compare supplier quotes and pricing',
    icon: 'FileTextOutlined',
    cta: 'View Quotes',
    status: 'current',
  },
  {
    key: 'track',
    title: 'Track Delivery',
    description: 'Monitor your order shipment',
    icon: 'CarOutlined',
    cta: 'Track Orders',
    status: 'pending',
  },
  {
    key: 'receive',
    title: 'Receive & Review',
    description: 'Confirm delivery and rate supplier',
    icon: 'CheckCircleOutlined',
    cta: 'View Deliveries',
    status: 'pending',
  },
];

// Quick Actions for Buyer
const quickActions = [
  { key: 'catalogue', label: 'Browse Catalogue', icon: 'AppstoreOutlined', link: '/catalogue?r=buyer' },
  { key: 'orders', label: 'My Orders', icon: 'ShoppingCartOutlined', link: '/my-orders?r=buyer' },
  { key: 'profile', label: 'Organization Profile', icon: 'UserOutlined', link: '/profile?r=buyer' },
  { key: 'reports', label: 'Reports', icon: 'FileTextOutlined', link: '/reports?r=buyer' },
];

// Sample Recent Orders Data
const recentOrders = [
  {
    id: 'ORD-2024-001',
    product: 'Amoxicillin 500mg',
    supplier: 'Cipla Ltd',
    quantity: '10,000 units',
    status: 'in_transit',
    date: '2024-01-15',
    amount: '$12,500',
    eta: '3 days',
  },
  {
    id: 'ORD-2024-002',
    product: 'Paracetamol 250mg',
    supplier: 'Sun Pharma',
    quantity: '25,000 units',
    status: 'processing',
    date: '2024-01-18',
    amount: '$8,200',
    eta: '7 days',
  },
  {
    id: 'ORD-2024-003',
    product: 'Metformin 500mg',
    supplier: 'Lupin Ltd',
    quantity: '15,000 units',
    status: 'delivered',
    date: '2024-01-10',
    amount: '$15,800',
    eta: null,
  },
  {
    id: 'ORD-2024-004',
    product: 'Azithromycin 250mg',
    supplier: 'Dr. Reddy\'s',
    quantity: '5,000 units',
    status: 'pending',
    date: '2024-01-20',
    amount: '$6,400',
    eta: '10 days',
  },
];

function BuyerDashboard() {
  const { useToken } = theme;
  const { token } = useToken();
  const navigate = useNavigate();
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(() =>
    orderJourneySteps.findIndex(s => s.status === 'current')
  );

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

  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    PlusOutlined: <PlusOutlined />,
    FileTextOutlined: <FileTextOutlined />,
    CarOutlined: <CarOutlined />,
    CheckCircleOutlined: <CheckCircleOutlined />,
    AppstoreOutlined: <AppstoreOutlined />,
    ShoppingCartOutlined: <ShoppingCartOutlined />,
    UserOutlined: <UserOutlined />,
  };

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${METABASE_RESIZER_URL}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = METABASE_RESIZER_URL;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  // Calculate journey progress
  const completedSteps = selectedStepIndex;
  const journeyProgress = Math.round(((completedSteps + 0.5) / orderJourneySteps.length) * 100);

  // Buyer tier based on activity
  const getBuyerTier = () => {
    if (selectedStepIndex === 0) return { label: 'New Buyer', color: 'default' };
    if (selectedStepIndex === 1) return { label: 'Active Buyer', color: 'blue' };
    if (selectedStepIndex === 2) return { label: 'Regular Buyer', color: 'green' };
    if (selectedStepIndex >= 3) return { label: 'Premium Buyer', color: 'purple' };
    return { label: 'New Buyer', color: 'default' };
  };
  const buyerTier = getBuyerTier();

  // Order Metrics
  const orderMetrics = {
    pendingOrders: 3,
    inProgress: 5,
    inTransit: 2,
    delivered: 28,
  };

  // Status tag renderer
  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { color: 'default', icon: <ClockCircleOutlined />, label: 'Pending' },
      processing: { color: 'blue', icon: <SyncOutlined spin />, label: 'Processing' },
      in_transit: { color: 'orange', icon: <CarOutlined />, label: 'In Transit' },
      delivered: { color: 'green', icon: <CheckCircleOutlined />, label: 'Delivered' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  return (
    <div className="dashboard-merged">
      <Row gutter={24}>
        {/* ============ MAIN CONTENT COLUMN (LEFT) ============ */}
        <Col xs={24} lg={16}>
          {/* Welcome Header with Progress */}
          <Card className="welcome-header-card" style={{ marginBottom: 12 }} styles={{ body: { padding: 16 } }}>
            <Row align="middle" gutter={24}>
              <Col>
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Order Journey Progress</div>
                      <div>Track your procurement progress:</div>
                      <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                        {orderJourneySteps.map((step) => (
                          <li key={step.key} style={{ marginBottom: 4 }}>
                            {step.title}: {step.status === 'completed' ? 'Complete' : step.status === 'current' ? 'In Progress' : 'Pending'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                  trigger="click"
                  placement="bottom"
                >
                  <div style={{ cursor: 'pointer', position: 'relative' }}>
                    <Progress
                      type="circle"
                      percent={journeyProgress}
                      size={80}
                      strokeColor={token.colorPrimary}
                      strokeWidth={8}
                      format={(percent) => (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: token.colorPrimary }}>{percent}%</div>
                        </div>
                      )}
                    />
                    <InfoCircleOutlined
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 14,
                        color: token.colorTextSecondary,
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        padding: 2
                      }}
                    />
                  </div>
                </Tooltip>
              </Col>
              <Col flex={1} className="welcome-text-col">
                <Title level={3} className="welcome-title" style={{ margin: 0 }}>
                  Welcome back, {buyerData.name}!
                </Title>
                <Text type="secondary" className="welcome-org">{buyerData.organization}</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={buyerTier.color}>{buyerTier.label}</Tag>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Order Journey */}
          <Card className="journey-card" style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
            <List
              itemLayout="horizontal"
              dataSource={[orderJourneySteps[selectedStepIndex] || orderJourneySteps[0]]}
              className="journey-desktop"
              renderItem={(item) => (
                <List.Item style={{ padding: 0, border: 'none' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: token.colorPrimary }} icon={item.icon ? iconMap[item.icon] : <ShoppingCartOutlined />} />}
                    title={<span style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</span>}
                    description={
                      <div>
                        <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {item.description}
                        </div>
                        <Link to="/catalogue?r=buyer" style={{ fontSize: 12 }}>{item.cta} <RightOutlined style={{ fontSize: 10 }} /></Link>
                      </div>
                    }
                  />
                  <div className="journey-steps-container">
                    <Steps
                      current={selectedStepIndex}
                      size="small"
                      labelPlacement="vertical"
                      style={{ width: '100%' }}
                      onChange={(current) => setSelectedStepIndex(current)}
                      items={orderJourneySteps.map((step, index) => ({
                        title: <span style={{ fontSize: 12 }}>{step.title}</span>,
                        status: index < selectedStepIndex ? 'finish' : index === selectedStepIndex ? 'process' : 'wait',
                      }))}
                    />
                  </div>
                </List.Item>
              )}
            />
            {/* Mobile Journey View */}
            <div className="journey-mobile">
              <div className="journey-mobile-header">
                <Avatar
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={orderJourneySteps[selectedStepIndex]?.icon ? iconMap[orderJourneySteps[selectedStepIndex].icon!] : <ShoppingCartOutlined />}
                />
                <div className="journey-mobile-info">
                  <Text strong style={{ fontSize: 14 }}>{orderJourneySteps[selectedStepIndex]?.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{orderJourneySteps[selectedStepIndex]?.description}</Text>
                </div>
              </div>
              <div className="journey-mobile-progress">
                <div className="journey-mobile-dots">
                  {orderJourneySteps.map((_, index) => (
                    <div
                      key={index}
                      className={`journey-dot ${index < selectedStepIndex ? 'completed' : ''} ${index === selectedStepIndex ? 'current' : ''}`}
                      onClick={() => setSelectedStepIndex(index)}
                    />
                  ))}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>Step {selectedStepIndex + 1} of {orderJourneySteps.length}</Text>
              </div>
              <Link to="/catalogue?r=buyer" className="journey-mobile-cta">
                {orderJourneySteps[selectedStepIndex]?.cta || 'View Details'} <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card
            title={<span>Recent Orders <span style={{ fontSize: 14, fontWeight: 'normal', color: '#999' }}>({recentOrders.length})</span></span>}
            extra={<Link to="/my-orders?r=buyer"><Button type="link" size="small" style={{ padding: 0 }}>See all <RightOutlined /></Button></Link>}
            className="opportunities-list-card recent-orders-card"
            style={{ marginBottom: 12 }}
            styles={{ body: { padding: 0 } }}
          >
            <Table
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              showHeader={false}
              style={{ padding: '0 16px' }}
              columns={[
                {
                  title: 'Order',
                  dataIndex: 'product',
                  key: 'product',
                  render: (text, record) => (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>{text}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{record.id} • {record.supplier}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  width: 120,
                  render: (status) => getStatusTag(status),
                },
                {
                  title: 'ETA',
                  dataIndex: 'eta',
                  key: 'eta',
                  width: 100,
                  align: 'right' as const,
                  render: (eta) => (
                    eta ? (
                      <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {eta}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 11, color: token.colorSuccess }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        Delivered
                      </Text>
                    )
                  ),
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  width: 90,
                  align: 'right' as const,
                  render: (amount) => (
                    <Text strong style={{ fontSize: 12 }}>{amount}</Text>
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
                  width: 80,
                  align: 'center' as const,
                  render: (_, record) => (
                    <Link to={`/order/${record.id}?r=buyer`}>
                      <Button type="text" size="small" icon={<EyeOutlined />}>
                        View
                      </Button>
                    </Link>
                  ),
                },
              ]}
            />
          </Card>

          {/* Order Metrics - Mobile Only */}
          <Row gutter={[8, 8]} style={{ marginBottom: 12 }} className="rfq-metrics-mobile">
            <Col span={12}>
              <Tooltip title="Orders awaiting processing or approval">
                <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Pending Orders</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.pendingOrders}</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="Orders currently being processed by suppliers">
                <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>In Progress</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.inProgress}</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="Orders shipped and on the way to you">
                <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>In Transit</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.inTransit}</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="Total orders successfully delivered">
                <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Delivered</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.delivered}</div>
                </Card>
              </Tooltip>
            </Col>
          </Row>

          {/* Procurement Analytics */}
          <Card
            title="Procurement Analytics"
            extra={<Link to="/analytics?r=buyer"><Button type="link" size="small" style={{ padding: 0 }}>View full analytics <RightOutlined /></Button></Link>}
            style={{ marginBottom: 12 }}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ position: 'relative', minHeight: 400, overflow: 'hidden', borderRadius: 8 }}>
              {iframeLoading && (
                <div className="iframe-loading">
                  <Spin size="large" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={DASHBOARD_SNAPSHOT_URL}
                width="100%"
                style={{ border: 'none', borderRadius: 8, display: 'block', minHeight: 400 }}
                onLoad={handleIframeLoad}
                title="Procurement Analytics"
              />
            </div>
          </Card>
        </Col>

        {/* ============ SIDEBAR COLUMN (RIGHT) ============ */}
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: 76 }}>
            {/* Quick Actions */}
            <Card title="Quick Actions" className="quick-actions-card" style={{ marginBottom: 12 }} styles={{ body: { padding: 16 } }}>
              {/* Primary CTA - Create Order */}
              <Dropdown menu={{ items: newOrderMenuItems }} trigger={['click']}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  block
                  size="large"
                  style={{ marginBottom: 12, height: 48 }}
                >
                  Create New Order
                </Button>
              </Dropdown>

              {/* Secondary Actions */}
              <Row gutter={[8, 8]}>
                {quickActions.map((action) => (
                  <Col span={12} key={action.key}>
                    <Link to={action.link}>
                      <Button
                        block
                        style={{
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          height: 70,
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          border: 'none'
                        }}
                      >
                        <div style={{ fontSize: 18, color: token.colorPrimary }}>
                          {iconMap[action.icon]}
                        </div>
                        <span style={{ fontSize: 11, whiteSpace: 'normal', lineHeight: 1.1, textAlign: 'center' }}>
                          {action.label}
                        </span>
                      </Button>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Order Metrics - Desktop Only */}
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }} className="rfq-metrics-desktop">
              <Col span={12}>
                <Tooltip title="Orders awaiting processing or approval">
                  <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Pending Orders</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.pendingOrders}</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Orders currently being processed by suppliers">
                  <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>In Progress</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.inProgress}</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Orders shipped and on the way to you">
                  <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>In Transit</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.inTransit}</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Total orders successfully delivered">
                  <Card className="rfq-metric-card" styles={{ body: { padding: 16 } }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Delivered</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>{orderMetrics.delivered}</div>
                  </Card>
                </Tooltip>
              </Col>
            </Row>

            {/* Resources & Help */}
            <Card className="resources-card" style={{ marginBottom: 12 }} styles={{ body: { padding: 16 } }}>
              <div className="resource-links">
                <a href="#/profile?r=buyer" className="resource-link">
                  <UserOutlined className="resource-icon" />
                  <div className="resource-content">
                    <Text strong>Organization Profile</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Update your organization details</Text>
                  </div>
                  <RightOutlined className="resource-arrow" />
                </a>
                <a href="#/handbook?r=buyer" className="resource-link">
                  <BookOutlined className="resource-icon" />
                  <div className="resource-content">
                    <Text strong>Buyer Handbook</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Procurement guide & best practices</Text>
                  </div>
                  <RightOutlined className="resource-arrow" />
                </a>
              </div>
            </Card>

            {/* Footer Links */}
            <div className="dashboard-footer-links">
              <span className="copyright">© 2025 Axmed</span>
              <span>|</span>
              <a href="/terms">Terms</a>
              <span>|</span>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default BuyerDashboard;
