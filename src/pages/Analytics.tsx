import { Typography, Card, Row, Col, Statistic, Spin, Segmented, theme } from 'antd';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowUpOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

// Metabase embed URLs (tokens expire 2025-12-05)
const MARKETPLACE_IFRAME_URL =
  'https://axmed.metabaseapp.com/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjE4NDl9LCJwYXJhbXMiOnt9LCJleHAiOjE3NjQ5Mzk2MjMsImlhdCI6MTc2NDMzNDgyMn0.J1RtFbwp15EP5mCdDJs77HpVGZYmt6s1Wt8AeDvXtR8#bordered=false&titled=false&refresh=3600&downloads=false';

const MY_COUNTRY_IFRAME_URL =
  'https://axmed.metabaseapp.com/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjE4NDl9LCJwYXJhbXMiOnsiY291bnRyeSI6Ik5pZ2VyaWEifSwiZXhwIjoxNzY0OTM5NjIzLCJpYXQiOjE3NjQzMzQ4MjJ9.XVWBg3vRdzP6RqRpX0F3ovqaEC2Go1Y2Ing5Vf6-q9Q#bordered=false&titled=false&refresh=3600&downloads=false';

// Metabase iframe resizer script URL
const METABASE_RESIZER_URL = 'https://axmed.metabaseapp.com/app/iframeResizer.js';

type DataView = 'marketplace' | 'my-country';

function Analytics() {
  const { useToken } = theme;
  const { token } = useToken();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [dataView, setDataView] = useState<DataView>('marketplace');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = dataView === 'marketplace' ? MARKETPLACE_IFRAME_URL : MY_COUNTRY_IFRAME_URL;

  // Load Metabase iframeResizer script
  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${METABASE_RESIZER_URL}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = METABASE_RESIZER_URL;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleViewChange = (value: DataView) => {
    setIframeLoading(true);
    setDataView(value);
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
    // Initialize iframeResizer when iframe loads
    if (iframeRef.current && (window as any).iFrameResize) {
      (window as any).iFrameResize({}, iframeRef.current);
    }
  };

  return (
    <div>
      {/* Header with title and segmented control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Analytics</Title>
        <Segmented
          options={[
            { label: 'Marketplace Data', value: 'marketplace' },
            { label: 'My Country', value: 'my-country' },
          ]}
          value={dataView}
          onChange={(value) => handleViewChange(value as DataView)}
        />
      </div>

      {/* KPI Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Total Revenue"
              value={1234567}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Active Tenders"
              value={42}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Win Rate"
              value={68.5}
              precision={1}
              valueStyle={{ color: token.colorSuccess }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Pending Bids"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: token.colorError }}
            />
          </Card>
        </Col>
      </Row>

      {/* Metabase Dashboard Embed */}
      <div style={{ marginTop: 24, position: 'relative', minHeight: 400 }}>
        {iframeLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: 8,
            zIndex: 1,
          }}>
            <Spin size="large" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={dataView}
          src={iframeUrl}
          width="100%"
          style={{
            border: 'none',
            borderRadius: 8,
            display: 'block',
            minHeight: 400,
          }}
          onLoad={handleIframeLoad}
          title="Supplier Analytics Dashboard"
        />
      </div>
    </div>
  );
}

export default Analytics;
