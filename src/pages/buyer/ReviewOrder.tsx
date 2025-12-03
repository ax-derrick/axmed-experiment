import { Typography, Card, Button, Select, Input, DatePicker, Space, Checkbox, Row, Col, Tag, Divider } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  PlusOutlined,
  CheckOutlined,
  ShoppingOutlined,
  TagOutlined,
  MailOutlined,
  FilePdfOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useDraftOrder } from '../../context/DraftOrderContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Incoterms options
const incotermsOptions = [
  { label: 'Cost and Freight', value: 'cfr' },
  { label: 'Cost, Insurance & Freight', value: 'cif' },
  { label: 'Cost Paid To', value: 'cpt' },
  { label: 'DAP (Delivered at Place)', value: 'dap' },
  { label: 'DDP (Delivered Duty Paid)', value: 'ddp' },
  { label: 'DPU (Delivered at Place Unloaded)', value: 'dpu' },
  { label: 'Ex Works', value: 'exw' },
  { label: 'Free Alongside Ship', value: 'fas' },
];

// Mock saved addresses
const initialAddresses = [
  { id: 1, label: 'Nairobi Warehouse', address: '123 Industrial Area, Nairobi, Kenya' },
  { id: 2, label: 'Mombasa Port Office', address: '45 Port Road, Mombasa, Kenya' },
];

function ReviewOrder() {
  const navigate = useNavigate();
  const { items: draftOrderItems, clearItems, openDrawer } = useDraftOrder();

  // Order-level state
  const [incoterm, setIncoterm] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<number | null>(null);
  const [, setIdealDate] = useState<string | null>(null);
  const [, setLatestDate] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressName, setNewAddressName] = useState('');
  const [newCountry, setNewCountry] = useState<string | null>(null);
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCity, setNewCity] = useState<string | null>(null);
  const [newAddressLine, setNewAddressLine] = useState('');
  const [isBillingAddress, setIsBillingAddress] = useState(false);

  const handleAddAddress = () => {
    if (newAddressName.trim() && newAddressLine.trim() && newCountry && newCity && newPostalCode) {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      const fullAddress = `${newAddressLine}, ${newCity}, ${newPostalCode}, ${newCountry}`;
      const newAddress = {
        id: newId,
        label: newAddressName.trim(),
        address: fullAddress,
      };
      setAddresses([...addresses, newAddress]);
      setShippingAddress(newId);

      // Reset form
      setNewAddressName('');
      setNewCountry(null);
      setNewPostalCode('');
      setNewCity(null);
      setNewAddressLine('');
      setIsBillingAddress(false);
      setShowAddressForm(false);
    }
  };

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        clearItems();
      }, 500);
    }, 1500);
  };

  const canSubmit = incoterm && shippingAddress;

  // SIP label helper
  const getSipStatus = (sip: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'does_not_apply': { label: 'N/A', color: 'default' },
      'has_been_issued': { label: 'Issued', color: 'success' },
      'is_being_processed': { label: 'Processing', color: 'warning' },
      'to_be_requested': { label: 'To Request', color: 'processing' },
    };
    return statusMap[sip] || { label: sip, color: 'default' };
  };

  // Track item count before clearing for success state
  const submittedItemCount = draftOrderItems.length || 3; // fallback to 3 for demo

  // Scroll indicator state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const hasMoreContent = container.scrollHeight > container.clientHeight;
      const isNotAtBottom = container.scrollTop + container.clientHeight < container.scrollHeight - 10;
      setShowScrollIndicator(hasMoreContent && isNotAtBottom);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [draftOrderItems]);

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollBy({ top: 150, behavior: 'smooth' });
  };

  // Order progress steps
  const orderSteps = [
    { label: 'Order Placed', completed: true, active: true },
    { label: 'Matching Suppliers', completed: false, active: false },
    { label: 'Quotes Received', completed: false, active: false },
    { label: 'Review & Select', completed: false, active: false },
    { label: 'Confirmed', completed: false, active: false },
  ];

  if (isSubmitted) {
    // Get selected address for display
    const selectedAddr = addresses.find(a => a.id === shippingAddress);
    const selectedIncoterm = incotermsOptions.find(i => i.value === incoterm);

    return (
      <div className="review-order-page" style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Main Order Card */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '32px' } }}>
          <Text type="secondary" style={{ fontSize: 13 }}>Order O-20251203000426</Text>
          <Title level={3} style={{ margin: '4px 0 16px 0', fontWeight: 600 }}>
            Thanks for placing your order. <br/> Expect supplier quotes within 3 - 5 days.
          </Title>
          

          {/* Progress Stepper */}
          <div style={{ marginBottom: 16 }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {orderSteps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: 4,
                    background: step.completed ? '#52c41a' : '#e8e8e8',
                    marginRight: index < orderSteps.length - 1 ? 4 : 0,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            {/* Step Labels */}
            <div style={{ display: 'flex' }}>
              {orderSteps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    textAlign: index === 0 ? 'left' : index === orderSteps.length - 1 ? 'right' : 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: step.completed ? '#1f1f1f' : '#8c8c8c',
                      fontWeight: step.active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          <Text type="secondary" style={{ fontSize: 14 }}>
            We've received your order and are now matching you with qualified suppliers.
          </Text>
        </Card>

        {/* Order Details Card */}
        <Card
          style={{ textAlign: 'left', marginBottom: 16 }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 15 }}>
            Order details
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <ShoppingOutlined style={{ fontSize: 18, color: '#52c41a' }} />
            <Text>{submittedItemCount} products ordered</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <TagOutlined style={{ fontSize: 18, color: '#52c41a' }} />
            <Text>{selectedIncoterm?.label || 'FOB'}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <EnvironmentOutlined style={{ fontSize: 18, color: '#52c41a' }} />
            <Text>{selectedAddr?.label || 'Shipping address'}</Text>
          </div>
        </Card>

        {/* Actions Card */}
        <Card
          style={{ textAlign: 'left', marginBottom: 16 }}
          styles={{ body: { padding: 0 } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Text>Send confirmation email</Text>
            <MailOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
          </div>
          <Divider style={{ margin: 0 }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Text>Download order summary (PDF)</Text>
            <FilePdfOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            size="large"
            onClick={() => navigate('/catalogue?r=buyer')}
            style={{ flex: 1, height: 48 }}
          >
            Continue Shopping
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/order/O-20251203000426?r=buyer')}
            style={{ flex: 1, height: 48 }}
          >
            Track Order
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (draftOrderItems.length === 0) {
    return (
      <div className="review-order-page">
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Title level={4}>No items to review</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Add medicines to your draft order before reviewing.
          </Text>
          <Button type="primary" onClick={() => navigate('/catalogue?r=buyer')}>
            Browse Catalogue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="review-order-page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 8, padding: 0 }}
        >
          Back
        </Button>
        <Title level={4} style={{ margin: 0 }}>Review & Submit Order</Title>
        <Text type="secondary">Please complete all required fields before submitting</Text>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column - Order Details */}
        <div style={{ flex: 1 }}>
          {/* Section 1: Incoterms */}
          <Card
            size="small"
            title={
              <Space>
                <span>1. Incoterms</span>
                <Text type="danger">*</Text>
                {incoterm && <CheckCircleFilled style={{ color: '#52c41a' }} />}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Please select the Incoterms accepted for this order:
            </Text>
            <Select
              value={incoterm}
              onChange={setIncoterm}
              options={incotermsOptions}
              placeholder="Select"
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
              We will share this information with bidding manufacturers for quoting and logistics scheduling purposes.
            </Text>
          </Card>

          {/* Section 2: Shipping Address */}
          <Card
            size="small"
            title={
              <Space>
                <span>2. Shipping Address</span>
                <Text type="danger">*</Text>
                {shippingAddress && <CheckCircleFilled style={{ color: '#52c41a' }} />}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div className="address-grid">
              {/* Existing addresses */}
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setShippingAddress(addr.id)}
                  className={`address-option ${shippingAddress === addr.id ? 'selected' : ''}`}
                >
                  {shippingAddress === addr.id && (
                    <CheckOutlined className="address-check" />
                  )}
                  <EnvironmentOutlined className="address-icon" />
                  <div className="address-details">
                    <Text strong style={{ fontSize: 13 }}>{addr.label}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{addr.address}</Text>
                  </div>
                </div>
              ))}

              {/* Add new address option */}
              {!showAddressForm ? (
                <div
                  onClick={() => setShowAddressForm(true)}
                  className="address-option add-new"
                >
                  <PlusOutlined className="address-icon" />
                  <Text type="secondary">Add new address</Text>
                </div>
              ) : (
                <div className="address-form">
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Address Name*</Text>
                    <Input
                      placeholder=""
                      value={newAddressName}
                      onChange={(e) => setNewAddressName(e.target.value)}
                    />
                  </div>

                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Country*</Text>
                      <Select
                        placeholder=""
                        style={{ width: '100%' }}
                        value={newCountry}
                        onChange={setNewCountry}
                        options={[
                          { label: 'Kenya', value: 'Kenya' },
                          { label: 'Uganda', value: 'Uganda' },
                          { label: 'Tanzania', value: 'Tanzania' },
                          { label: 'Rwanda', value: 'Rwanda' },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Postal Code*</Text>
                      <Input
                        placeholder=""
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                      />
                    </Col>
                  </Row>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>City*</Text>
                    <Select
                      placeholder=""
                      style={{ width: '100%' }}
                      value={newCity}
                      onChange={setNewCity}
                      options={[
                        { label: 'Nairobi', value: 'Nairobi' },
                        { label: 'Mombasa', value: 'Mombasa' },
                        { label: 'Kisumu', value: 'Kisumu' },
                        { label: 'Nakuru', value: 'Nakuru' },
                      ]}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Address*</Text>
                    <Input
                      placeholder=""
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <Checkbox
                      checked={isBillingAddress}
                      onChange={(e) => setIsBillingAddress(e.target.checked)}
                    >
                      Set as billing address
                    </Checkbox>
                  </div>

                  <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Button onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleAddAddress}
                      disabled={!newAddressName.trim() || !newAddressLine.trim() || !newCountry || !newCity || !newPostalCode}
                    >
                      Add address
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </Card>

          {/* Section 3: Fulfillment Preferences */}
          <Card
            size="small"
            title="3. Help us get you the best deal, on time"
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  When would you ideally like this order fulfilled?
                </Text>
                <DatePicker
                  placeholder="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  onChange={(_, dateString) => setIdealDate(dateString as string)}
                  format="DD/MM/YYYY"
                />
              </div>

              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  By when would a delivery be too late to be useful?
                </Text>
                <DatePicker
                  placeholder="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  onChange={(_, dateString) => setLatestDate(dateString as string)}
                  format="DD/MM/YYYY"
                />
              </div>

              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Is there anything else you want us to know about your order?
                </Text>
                <TextArea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Please share any extra details to help us get your order right. e.g. Delivery notes, storage instructions..."
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <Card
          title={
            <Space>
              <span>Order Summary</span>
              <Text type="secondary" style={{ fontWeight: 'normal', fontSize: 14 }}>
                ({draftOrderItems.length} items)
              </Text>
            </Space>
          }
          extra={
            <Button
              type="link"
              size="small"
              onClick={openDrawer}
              style={{ padding: 0 }}
            >
              Edit
            </Button>
          }
          style={{ width: 360, position: 'sticky', top: 90, height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}
          styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
          className="order-summary-card"
        >
          {/* Item List */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div ref={scrollContainerRef} className="order-summary-items" style={{ flex: 1, overflowY: 'auto' }}>
              {draftOrderItems.map((item) => {
              const sipStatus = getSipStatus(item.sip);
              return (
                <div key={item.id} className="order-summary-item" style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <div className="order-summary-item-header" style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>{item.medicineName}</Text>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {item.presentation} • {item.dosage} • {item.quantity.toLocaleString()} {item.units}
                    </Text>
                  </div>

                  <div>
                    <Tag color={sipStatus.color} style={{ margin: 0, fontSize: 11 }}>
                      SIP {sipStatus.label}
                    </Tag>
                  </div>

                  {item.packagingNotes && (
                    <div className="order-summary-item-notes" style={{ marginTop: 12, padding: '8px', background: '#fff', borderRadius: 4, border: '1px dashed #d9d9d9' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <Text strong style={{ fontSize: 11 }}>Note: </Text>
                        {item.packagingNotes}
                      </Text>
                    </div>
                  )}
                </div>
              );
            })}
            </div>

            {/* Scroll Indicator */}
            {showScrollIndicator && (
              <div
                onClick={scrollToBottom}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <DownOutlined style={{ fontSize: 14, color: '#595959' }} />
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="primary"
              size="large"
              block
              disabled={!canSubmit}
              loading={isSubmitting}
              onClick={handleSubmitOrder}
            >
              Submit Order
            </Button>

            {!canSubmit && (
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 12 }}>
                Please complete all required fields
              </Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReviewOrder;
