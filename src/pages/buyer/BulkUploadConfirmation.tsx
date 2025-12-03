import { Typography, Card, Button } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileExcelOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  MailOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Processing steps for bulk upload - different from manual order flow
const processingSteps = [
  { label: 'Upload Received', completed: true, active: false },
  { label: 'Processing', completed: false, active: true },
  { label: 'Items Verified', completed: false, active: false },
  { label: 'Added to Draft', completed: false, active: false },
];

function BulkUploadConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get item count from URL params
  const itemCount = parseInt(searchParams.get('items') || '0', 10);

  const handleContinueShopping = () => {
    navigate('/catalogue?r=buyer');
  };

  const handleCheckDraftOrder = () => {
    navigate('/review-order?r=buyer');
  };

  return (
    <div className="bulk-upload-confirmation-page" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Main Status Card */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '32px' } }}>
        <Text type="secondary" style={{ fontSize: 13 }}>Bulk Upload BU-{Date.now().toString().slice(-10)}</Text>
        <Title level={3} style={{ margin: '4px 0 16px 0', fontWeight: 600 }}>
          We're processing your upload. <br /> Items will be added to your draft order shortly.
        </Title>

        {/* Progress Stepper */}
        <div style={{ marginBottom: 16 }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', marginBottom: 8 }}>
            {processingSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: 4,
                  background: step.completed ? '#52c41a' : step.active ? '#1890ff' : '#f0f0f0',
                  marginRight: index < processingSteps.length - 1 ? 4 : 0,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
          {/* Step Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {processingSteps.map((step, index) => (
              <Text
                key={index}
                style={{
                  fontSize: 12,
                  color: step.completed || step.active ? '#262626' : '#8c8c8c',
                  fontWeight: step.active ? 600 : 400,
                  textAlign: index === 0 ? 'left' : index === processingSteps.length - 1 ? 'right' : 'center',
                  flex: 1,
                }}
              >
                {step.label}
              </Text>
            ))}
          </div>
        </div>

        {/* Status Text */}
        <Text type="secondary" style={{ fontSize: 14 }}>
          Our team is reviewing your uploaded items. Once verified, they'll appear in your draft order for you to review and submit.
        </Text>
      </Card>

      {/* Upload Details Card */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '24px' } }}>
        <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 15 }}>
          Upload details
        </Text>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <FileExcelOutlined style={{ fontSize: 18, color: '#52c41a' }} />
          <Text>{itemCount} item{itemCount !== 1 ? 's' : ''} uploaded</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <ClockCircleOutlined style={{ fontSize: 18, color: '#1890ff' }} />
          <Text>Processing time: 1-2 business days</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <InboxOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
          <Text>Items will be added to your draft order</Text>
        </div>
      </Card>

      {/* Actions Card */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
          }}
          onClick={() => {}}
        >
          <Text>Send confirmation email</Text>
          <MailOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
        </div>
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => {}}
        >
          <Text>Download upload summary (PDF)</Text>
          <FilePdfOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
        </div>
      </Card>

      {/* Bottom Buttons */}
      <div style={{ display: 'flex', gap: 16 }}>
        <Button
          size="large"
          onClick={handleContinueShopping}
          style={{ flex: 1, height: 48 }}
        >
          Continue Shopping
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleCheckDraftOrder}
          style={{ flex: 1, height: 48 }}
        >
          Check Draft Order
        </Button>
      </div>
    </div>
  );
}

export default BulkUploadConfirmation;
