import { Typography, Card, Row, Col, Button, Spin, Progress, Tag, theme, Steps, List, Avatar, Tooltip, Table, Dropdown } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileTextOutlined,
  TrophyOutlined,
  RightOutlined,
  PlusOutlined,
  UploadOutlined,
  BarChartOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  userData,
  journeySteps,
  quickActions,
  availableOpportunities,
} from '../data/dashboardData';

const { Title, Text } = Typography;

// Metabase embed URL for dashboard snapshot
const DASHBOARD_SNAPSHOT_URL =
  'https://axmed.metabaseapp.com/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjE4NDl9LCJwYXJhbXMiOnt9LCJleHAiOjE3NjQ5Mzk2MjMsImlhdCI6MTc2NDMzNDgyMn0.J1RtFbwp15EP5mCdDJs77HpVGZYmt6s1Wt8AeDvXtR8#bordered=false&titled=false&refresh=3600&downloads=false&hide_parameters=country';

const METABASE_RESIZER_URL = 'https://axmed.metabaseapp.com/app/iframeResizer.js';

function Dashboard() {
  const { useToken } = theme;
  const { token } = useToken();
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(() =>
    journeySteps.findIndex(s => s.status === 'current')
  );

  // Icon mapping with token colors
  const iconMap: Record<string, React.ReactNode> = {
    FileTextOutlined: <FileTextOutlined />,
    TrophyOutlined: <TrophyOutlined />,
    PlusOutlined: <PlusOutlined />,
    UploadOutlined: <UploadOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    MedicineBoxOutlined: <MedicineBoxOutlined style={{ color: token.colorPrimary }} />,
    HeartOutlined: <HeartOutlined style={{ color: token.colorError }} />,
    ExperimentOutlined: <ExperimentOutlined style={{ color: token.colorSuccess }} />,
    UserOutlined: <UserOutlined />,
    RocketOutlined: <RocketOutlined />,
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
    if (iframeRef.current && (window as any).iFrameResize) {
      (window as any).iFrameResize({}, iframeRef.current);
    }
  };

  // Calculate journey completion percentage based on selected step
  const completedSteps = selectedStepIndex;
  const journeyProgress = Math.round(((completedSteps + 0.5) / journeySteps.length) * 100);

  // Determine supplier tier based on selected step
  const getSupplierTier = () => {
    if (selectedStepIndex === 0) return { label: 'New Supplier', color: 'default' };
    if (selectedStepIndex === 1) return { label: 'Verified', color: 'blue' };
    if (selectedStepIndex === 2) return { label: 'Active', color: 'green' };
    if (selectedStepIndex >= 3) return { label: 'Trusted Partner', color: 'purple' };
    return { label: 'New Supplier', color: 'default' };
  };
  const supplierTier = getSupplierTier();



  return (
    <div className="dashboard-merged">
      <Row gutter={24}>
        {/* ============ MAIN CONTENT COLUMN (LEFT) ============ */}
        <Col xs={24} lg={16}>
          {/* Header with Score */}
          <Card className="welcome-header-card" style={{ marginBottom: 12 }}>
            <Row align="middle" gutter={24}>
              <Col>
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Journey Progress</div>
                      <div>Your score is based on your procurement journey completion:</div>
                      <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                        {journeySteps.map((step) => (
                          <li key={step.key} style={{ marginBottom: 4 }}>
                            {step.title}: {step.status === 'completed' ? 'Complete' : step.status === 'current' ? 'In Progress' : 'Pending'}
                          </li>
                        ))}
                      </ul>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Complete all steps to reach 100%</div>
                    </div>
                  }
                  trigger="click"
                  placement="bottom"
                >
                  <div style={{ cursor: 'pointer', position: 'relative' }}>
                    <Progress
                      type="circle"
                      percent={journeyProgress}
                      width={80}
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
                  Welcome back, {userData.name}!
                </Title>
                <Text type="secondary" className="welcome-org">{userData.organization}</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={supplierTier.color}>{supplierTier.label}</Tag>
                </div>
              </Col>
              <Col style={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}>
                <img
                  src="https://axmed-demo-static-files.s3.eu-west-1.amazonaws.com/uploads/CIPLA-logo381353.png"
                  alt="Company Logo"
                  style={{
                    height: 192,
                    opacity: 0.15,
                    filter: 'grayscale(100%)',
                  }}
                />
              </Col>
            </Row>
          </Card>

          {/* Procurement Journey */}
          <Card className="journey-card" style={{ marginBottom: 12, padding: 0 }} bodyStyle={{ padding: '16px 48px 16px 24px' }}>
            {/* Desktop: Full steps view */}
            <List
              itemLayout="horizontal"
              dataSource={[journeySteps[selectedStepIndex] || journeySteps[0]]}
              className="journey-desktop"
              renderItem={(item) => (
                <List.Item style={{ padding: 0, border: 'none' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: token.colorPrimary }} icon={item.icon ? iconMap[item.icon] : <TrophyOutlined />} />}
                    title={<span style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</span>}
                    description={
                      <div>
                        <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {item.description}
                        </div>
                        <Link to="/tenders" style={{ fontSize: 12 }}>{item.cta || 'View Details'} <RightOutlined style={{ fontSize: 10 }} /></Link>
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
                      items={journeySteps.map((step, index) => ({
                        title: <span style={{ fontSize: 12 }}>{step.title}</span>,
                        status: index < selectedStepIndex ? 'finish' : index === selectedStepIndex ? 'process' : 'wait',
                      }))}
                    />
                  </div>
                </List.Item>
              )}
            />
            {/* Mobile: Current step focus */}
            <div className="journey-mobile">
              <div className="journey-mobile-header">
                <Avatar
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={journeySteps[selectedStepIndex]?.icon ? iconMap[journeySteps[selectedStepIndex].icon!] : <TrophyOutlined />}
                />
                <div className="journey-mobile-info">
                  <Text strong style={{ fontSize: 14 }}>{journeySteps[selectedStepIndex]?.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{journeySteps[selectedStepIndex]?.description}</Text>
                </div>
              </div>
              <div className="journey-mobile-progress">
                <div className="journey-mobile-dots">
                  {journeySteps.map((_, index) => (
                    <div
                      key={index}
                      className={`journey-dot ${index < selectedStepIndex ? 'completed' : ''} ${index === selectedStepIndex ? 'current' : ''}`}
                      onClick={() => setSelectedStepIndex(index)}
                    />
                  ))}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>Step {selectedStepIndex + 1} of {journeySteps.length}</Text>
              </div>
              <Link to="/tenders" className="journey-mobile-cta">
                {journeySteps[selectedStepIndex]?.cta || 'View Details'} <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            </div>
          </Card>

          {/* Available Opportunities */}
          <Card
            title={<span><FileTextOutlined style={{ marginRight: 8 }} />Available Opportunities</span>}
            extra={<Link to="/open-tenders"><Button type="link" size="small" style={{ padding: 0 }}>See all <RightOutlined /></Button></Link>}
            className="opportunities-list-card"
            style={{ marginBottom: 12 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={availableOpportunities}
              rowKey="id"
              pagination={false}
              size="small"
              showHeader={false}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: '12px 0 12px 16px' }}>
                    {/* Tender Table Info */}
                    <div style={{
                      background: '#fafafa',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr 1.2fr',
                      gap: 16,
                      alignItems: 'start',
                      fontSize: 12
                    }}>
                      <div>
                        <Text type="secondary" style={{ fontSize: 10 }}>Tender no.</Text>
                        <div><Text style={{ fontSize: 12 }}>{record.tenderNo}</Text></div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 10 }}>Tender description</Text>
                        <div><Text style={{ fontSize: 12 }}>{record.tenderDescription}</Text></div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 10 }}>Total volume</Text>
                        <div><Text style={{ fontSize: 12 }}>{record.totalVolume}</Text></div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 10 }}>Countries</Text>
                        <div>
                          {record.countries.slice(0, 2).map((country) => (
                            <Tag key={country} style={{ fontSize: 10, marginBottom: 2, marginRight: 4 }}>{country}</Tag>
                          ))}
                          {record.countries.length > 2 && (
                            <Tag style={{ fontSize: 10, marginBottom: 2 }}>+{record.countries.length - 2}</Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
                expandRowByClick: true,
              }}
              columns={[
                {
                  title: 'Medication',
                  dataIndex: 'medication',
                  key: 'medication',
                  render: (text, record) => (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>{text}</Text>
                        {record.badge === 'first_to_bid' && (
                          <Tag color="orange" style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>Be first to bid!</Tag>
                        )}
                        {record.badge === 'suppliers_active' && (
                          <Tag color="purple" style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>{record.suppliersActive} active</Tag>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{record.form}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Deadline',
                  dataIndex: 'daysUntilClose',
                  key: 'deadline',
                  width: 120,
                  align: 'right' as const,
                  render: (days) => (
                    <Text
                      style={{
                        fontSize: 11,
                        color: days <= 1 ? token.colorError : token.colorTextSecondary,
                        fontWeight: days <= 1 ? 500 : 400
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {days <= 1 ? 'Closes in 1 day' : `Closes in ${days} days`}
                    </Text>
                  ),
                },
                {
                  title: 'Action',
                  key: 'action',
                  width: 80,
                  render: (_, record) => (
                    <Button
                      size="small"
                      type={record.hasActiveBid ? 'default' : 'primary'}
                      style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {record.hasActiveBid ? 'Edit bid' : 'Bid now'}
                    </Button>
                  ),
                },
              ]}
            />
          </Card>

          {/* RFQ Metrics - Mobile Only */}
          <Row gutter={[8, 8]} style={{ marginBottom: 12 }} className="rfq-metrics-mobile">
            <Col span={12}>
              <Tooltip title="Total number of active RFQs available on the platform that you can submit bids for">
                <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Available RFQs to bid</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>387</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="RFQs that match products in your portfolio - these are your best opportunities to win">
                <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>RFQs matching Portfolio</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>342</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="RFQs for products not currently in your portfolio - consider adding these products to expand your opportunities">
                <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>RFQs not in Portfolio</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>45</div>
                </Card>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Tooltip title="Total number of unique products (SKUs) you have added to your portfolio">
                <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total SKUs in Portfolio</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>500</div>
                </Card>
              </Tooltip>
            </Col>
          </Row>

          {/* Marketplace Pulse */}
          <Card title="Marketplace Pulse" style={{ marginBottom: 12 }} bodyStyle={{ padding: 8 }}>
            <div style={{ position: 'relative', height: 240, overflow: 'hidden', borderRadius: 8 }}>
              {iframeLoading && (
                <div className="iframe-loading">
                  <Spin size="large" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={DASHBOARD_SNAPSHOT_URL}
                width="100%"
                height="240"
                style={{ border: 'none', borderRadius: 8, display: 'block' }}
                onLoad={handleIframeLoad}
                title="Marketplace Pulse"
              />
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Link to="/analytics">
                <Button type="link" style={{ padding: 0 }}>
                  View full analytics <RightOutlined />
                </Button>
              </Link>
            </div>
          </Card>
        </Col>

        {/* ============ SIDEBAR COLUMN (RIGHT) ============ */}
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: 76 }}>
            {/* Quick Actions (QABs) */}
            <Card title="Quick Actions" className="quick-actions-card" style={{ marginBottom: 12 }}>
              {/* Primary CTA - Add Products (hidden on mobile, shown in sticky footer) */}
              <Dropdown
                menu={{
                  items: [
                    { key: 'bulk', label: 'Bulk Upload', icon: <UploadOutlined /> },
                    { key: 'single', label: 'Add Single Item', icon: <PlusOutlined /> },
                  ],
                  onClick: ({ key }) => {
                    if (key === 'bulk') {
                      window.location.href = '/portfolio';
                    } else {
                      window.location.href = '/portfolio/add';
                    }
                  }
                }}
                trigger={['click']}
                className="add-products-desktop"
              >
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  block
                  size="large"
                  style={{ marginBottom: 12, height: 48 }}
                >
                  Add Products
                </Button>
              </Dropdown>

              {/* Secondary Actions */}
              <Row gutter={[8, 8]}>
                {quickActions.filter(a => a.key !== 'upload').map((action) => (
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

            {/* RFQ Metrics - Desktop Only */}
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }} className="rfq-metrics-desktop">
              <Col span={12}>
                <Tooltip title="Total number of active RFQs available on the platform that you can submit bids for">
                  <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Available RFQs to bid</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>387</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="RFQs that match products in your portfolio - these are your best opportunities to win">
                  <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>RFQs matching Portfolio</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>342</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="RFQs for products not currently in your portfolio - consider adding these products to expand your opportunities">
                  <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>RFQs not in Portfolio</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>45</div>
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Total number of unique products (SKUs) you have added to your portfolio">
                  <Card className="rfq-metric-card" bodyStyle={{ padding: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Total SKUs in Portfolio</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#0a1929', marginTop: 4 }}>500</div>
                  </Card>
                </Tooltip>
              </Col>
            </Row>

            {/* Resources & Help */}
            <Card className="resources-card" bodyStyle={{ padding: 16 }}>
              <div className="resource-links">
                <a href="/profile" className="resource-link">
                  <UserOutlined className="resource-icon" />
                  <div className="resource-content">
                    <Text strong>Complete Your Profile</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Improve your visibility to buyers</Text>
                  </div>
                  <RightOutlined className="resource-arrow" />
                </a>
                <a href="/handbook" className="resource-link">
                  <RocketOutlined className="resource-icon" />
                  <div className="resource-content">
                    <Text strong>New Supplier Handbook</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Get started guide & best practices</Text>
                  </div>
                  <RightOutlined className="resource-arrow" />
                </a>
                <a href="/tips" className="resource-link">
                  <InfoCircleOutlined className="resource-icon" />
                  <div className="resource-content">
                    <Text strong>Bidding Tips</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Win more tenders with these strategies</Text>
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

      {/* Mobile Sticky Footer - Add Products + Quick Actions */}
      <div className="mobile-sticky-footer">
        <div className="mobile-sticky-footer-content">
          <Dropdown
            menu={{
              items: [
                { key: 'bulk', label: 'Bulk Upload', icon: <UploadOutlined /> },
                { key: 'single', label: 'Add Single Item', icon: <PlusOutlined /> },
              ],
              onClick: ({ key }) => {
                if (key === 'bulk') {
                  window.location.href = '/portfolio';
                } else {
                  window.location.href = '/portfolio/add';
                }
              }
            }}
            trigger={['click']}
            placement="topRight"
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{ flex: 1 }}
            >
              Add Products
            </Button>
          </Dropdown>
          <Dropdown
            menu={{
              items: quickActions.filter(a => a.key !== 'upload').map(action => ({
                key: action.key,
                label: action.label,
                icon: iconMap[action.icon],
              })),
              onClick: ({ key }) => {
                const action = quickActions.find(a => a.key === key);
                if (action) {
                  window.location.href = action.link;
                }
              }
            }}
            trigger={['click']}
            placement="topRight"
          >
            <Button
              icon={<ThunderboltOutlined />}
              style={{ width: 40 }}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
