import { Typography, Card, Row, Col, Spin, Segmented } from 'antd';
import { useState, useEffect, useRef } from 'react';

const { Title, Text } = Typography;

// Metabase embed URLs for buyer analytics
const PROCUREMENT_OVERVIEW_URL =
  'https://axmed.metabaseapp.com/public/dashboard/e32a226c-b319-42e4-a640-a48e3b2ddbb5#titled=false&downloads=false';

const SPEND_ANALYSIS_URL =
  'https://axmed.metabaseapp.com/public/dashboard/e32a226c-b319-42e4-a640-a48e3b2ddbb5#titled=false&downloads=false';

// Metabase iframe resizer script URL
const METABASE_RESIZER_URL = 'https://axmed.metabaseapp.com/app/iframeResizer.js';

type DataView = 'overview' | 'spend';

// Buyer KPI data
const buyerKpiData = [
  { title: 'Total Spend (YTD)', value: '$2.4M' },
  { title: 'Active Orders', value: '18' },
  { title: 'Pending Deliveries', value: '7' },
  { title: 'Completed Orders', value: '156' },
];

function BuyerAnalytics() {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [dataView, setDataView] = useState<DataView>('overview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const iframeUrl = dataView === 'overview' ? PROCUREMENT_OVERVIEW_URL : SPEND_ANALYSIS_URL;

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
    if (iframeRef.current && (window as unknown as { iFrameResize?: (options: object, element: HTMLIFrameElement) => void }).iFrameResize) {
      (window as unknown as { iFrameResize: (options: object, element: HTMLIFrameElement) => void }).iFrameResize({}, iframeRef.current);
    }
  };

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Procurement Analytics</Title>
        <Segmented
          options={[
            { label: 'Overview', value: 'overview' },
            { label: 'Spend Analysis', value: 'spend' },
          ]}
          value={dataView}
          onChange={(value) => handleViewChange(value as DataView)}
        />
      </div>

      {/* KPI Summary Cards */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }} className="analytics-kpi-row">
        {buyerKpiData.map((kpi, index) => (
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

      {/* Metabase Dashboard Embed */}
      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ position: 'relative', minHeight: 500, borderRadius: 8, overflow: 'hidden' }}>
          {iframeLoading && (
            <div className="iframe-loading">
              <Spin size="large" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={dataView}
            src={iframeUrl}
            width="100%"
            style={{ border: 'none', display: 'block', minHeight: 500, borderRadius: 8 }}
            onLoad={handleIframeLoad}
            title="Buyer Analytics Dashboard"
          />
        </div>
      </Card>
    </div>
  );
}

export default BuyerAnalytics;
