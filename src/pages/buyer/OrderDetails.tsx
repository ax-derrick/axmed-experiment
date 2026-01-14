import { Typography, Card, Button, Tag, Checkbox } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Timeline step labels (7 steps matching the reference)
const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', description: 'Order has been submitted' },
  { key: 'under_quotation', label: 'Under Quotation', description: 'Finding best prices for your order' },
  { key: 'quotations_ready', label: 'Quotations Ready', description: 'Review supplier quotes' },
  { key: 'under_evaluation', label: 'Under Evaluation', description: 'Evaluating supplier quotes' },
  { key: 'logistics_arrangement', label: 'Logistics Arrangement', description: 'Arranging logistics' },
  { key: 'shipping_partner_confirmed', label: 'Shipping Partner Confirmed', description: 'Shipping partner assigned' },
  { key: 'completed', label: 'Completed', description: 'Order fulfilled' },
];

// Mock order data
const mockOrderData = {
  orderNumber: 'O-20250825000350',
  dateTime: '25-Aug-2025 01:41:40 PM',
  status: 'Submitted' as const,
  billingAddress: 'Samfaith Apartments Asutifi North Ahafo GM123 Ghana',
  shippingAddress: 'Samfaith Apartments Asutifi North Ahafo GM123 Ghana',
  paymentMethod: 'IBAN',
  paymentStatus: 'Pending' as const,
  items: [
    {
      id: '1',
      name: 'Amikacin',
      presentation: 'Injectable Solution',
      dosage: '500Mg/2Ml',
      quantity: 100000,
      units: 'vials/ampoules/cartridges',
      pricePerUnit: 0.04,
      totalPrice: 4400,
    },
    {
      id: '2',
      name: 'Conjugated Estrogens',
      presentation: 'Cream',
      dosage: '0.625Mg',
      quantity: 100000,
      units: 'tube/jar',
      pricePerUnit: 0.00374,
      totalPrice: 374,
    },
  ],
};

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Active step state - default to step 0 (Submitted)
  const [activeStep, setActiveStep] = useState(0);

  const orderData = mockOrderData;

  // State for item selection
  const [selectedItems, setSelectedItems] = useState<string[]>(
    orderData.items.map(item => item.id)
  );

  // Check if we're past the quotations ready stage (step 3 or higher means quotes are being evaluated)
  const hasQuotes = activeStep >= 3;

  // Check if we should show checkboxes and Submit PO (step 4 or higher)
  const showCheckboxes = activeStep >= 4;

  // Check if we're in quotations ready stage
  const isQuotationsReady = activeStep === 2;

  // Calculate totals for selected items
  const calculateTotals = () => {
    let medicationCost = 0;
    orderData.items.forEach(item => {
      medicationCost += item.totalPrice;
    });
    const totalSavings = medicationCost * 0.12;
    return {
      medicationCost: hasQuotes ? medicationCost : null,
      totalSavings: hasQuotes ? totalSavings : null,
      medicationCostAfterSavings: hasQuotes ? medicationCost - totalSavings : null,
    };
  };

  const totals = calculateTotals();

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(orderData.items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual item selection
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };



  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status for each timeline step based on activeStep
  const getStepStatus = (stepIndex: number): 'completed' | 'active' | 'pending' => {
    if (stepIndex < activeStep) return 'completed';
    if (stepIndex === activeStep) return 'active';
    return 'pending';
  };

  // Get icon for timeline step
  const getStepIcon = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircleFilled style={{ fontSize: 20, color: '#52c41a' }} />;
      case 'active':
        return <CheckCircleFilled style={{ fontSize: 20, color: '#1890ff' }} />;
      case 'pending':
        return <ClockCircleFilled style={{ fontSize: 20, color: '#d9d9d9' }} />;
    }
  };

  // Handle step click for demo
  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  // Get item status tag based on current step
  const getItemStatusTag = () => {
    const stepKey = TIMELINE_STEPS[activeStep]?.key;
    switch (stepKey) {
      case 'submitted':
        return <Tag color="gold" style={{ margin: 0 }}>Submitted</Tag>;
      case 'under_quotation':
        return <Tag color="processing" style={{ margin: 0 }}>No quotes yet</Tag>;
      case 'quotations_ready':
        return <Button type="link" style={{ padding: 0, height: 'auto' }}>Select supplier</Button>;
      case 'under_evaluation':
        return <Tag color="orange" style={{ margin: 0 }}>Quotations ready</Tag>;
      case 'logistics_arrangement':
        return <Tag color="cyan" style={{ margin: 0 }}>Logistics</Tag>;
      case 'shipping_partner_confirmed':
        return <Tag color="geekblue" style={{ margin: 0 }}>Shipping</Tag>;
      case 'completed':
        return <Tag color="success" style={{ margin: 0 }}>Completed</Tag>;
      default:
        return <Tag color="gold" style={{ margin: 0 }}>Submitted</Tag>;
    }
  };

  return (
    <div className="order-details-page">
      {/* Back link */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/my-orders?r=buyer')}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Back to Orders
      </Button>

      {/* Order Title Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Order {orderId || orderData.orderNumber}
        </Title>
        <Button danger type="default">
          Cancel Order
        </Button>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left Column - Items, Ship to, Cost */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Order Details Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            marginBottom: 16,
            padding: '16px 0',
          }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Billing address</Text>
              <Text>{orderData.billingAddress}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Shipping address</Text>
              <Text>{orderData.shippingAddress}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Payment method</Text>
              <Text>{orderData.paymentMethod}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Payment status</Text>
              <Text>{orderData.paymentStatus}</Text>
            </div>
          </div>

          {/* Items Card */}
          <Card
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text strong>Items ({orderData.items.length})</Text>
              {showCheckboxes && (
                <Button
                  type="primary"
                  disabled={selectedItems.length === 0}
                >
                  Submit Purchase Order
                </Button>
              )}
            </div>

            {/* Items List */}
            <div>
              {/* Select All - only show when checkboxes enabled */}
              {showCheckboxes && (
                <div style={{
                  padding: '12px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  background: '#fafafa',
                }}>
                  <Checkbox
                    checked={selectedItems.length === orderData.items.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < orderData.items.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>Select all items</Text>
                  </Checkbox>
                </div>
              )}

              {/* Item Rows */}
              {orderData.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: index < orderData.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Checkbox - only when checkboxes enabled */}
                  {showCheckboxes && (
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    />
                  )}

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: 'block' }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.presentation} {item.dosage}
                    </Text>
                  </div>

                  {/* Quantity - always read-only */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <Text>{item.quantity.toLocaleString()} {item.units}</Text>
                  </div>

                  {/* Status / Price / Action */}
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    {hasQuotes ? (
                      <>
                        <Text style={{ display: 'block' }}>${item.totalPrice.toLocaleString()}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>${item.pricePerUnit}/unit</Text>
                      </>
                    ) : isQuotationsReady ? (
                      <Button type="link" style={{ padding: 0, height: 'auto' }}>Select supplier</Button>
                    ) : (
                      getItemStatusTag()
                    )}
                  </div>

                  {/* View details link - only for hasQuotes */}
                  {hasQuotes && (
                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <Button type="link" style={{ padding: 0, height: 'auto' }}>View details</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Cost Summary - Always show */}
          <Card styles={{ body: { padding: '16px 24px' } }} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Medication cost:</Text>
                <Text>{formatCurrency(totals.medicationCost)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Total savings:</Text>
                <Text>{formatCurrency(totals.totalSavings)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Medication cost after savings:</Text>
                <Text>{formatCurrency(totals.medicationCostAfterSavings)}</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline, Ship to, Actions */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Timeline Card */}
            <Card styles={{ body: { padding: '24px' } }} style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>Timeline</Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE_STEPS.map((step, index) => {
                  const status = getStepStatus(index);
                  return (
                    <div
                      key={step.key}
                      style={{ display: 'flex', gap: 16, cursor: 'pointer' }}
                      onClick={() => handleStepClick(index)}
                    >
                      {/* Icon and line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                        {getStepIcon(status)}
                        {index < TIMELINE_STEPS.length - 1 && (
                          <div style={{
                            width: 2,
                            flex: 1,
                            minHeight: 40,
                            background: status === 'completed' ? '#52c41a' : '#e8e8e8',
                            marginTop: 4,
                            marginBottom: 4,
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: index < TIMELINE_STEPS.length - 1 ? 16 : 0 }}>
                        <Text strong style={{
                          color: status === 'pending' ? '#8c8c8c' : '#1f1f1f',
                          fontSize: 13,
                          display: 'block',
                        }}>
                          {step.label}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {step.description}
                        </Text>
                        {status === 'active' && (
                          <Tag color="processing" style={{ margin: '4px 0 0 0', fontSize: 11 }}>Current</Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>


            {/* Actions */}
            <Button
              type="text"
              icon={<QuestionCircleOutlined style={{ color: '#8c8c8c' }} />}
              style={{ justifyContent: 'flex-start', padding: '4px 0', height: 'auto', color: '#8c8c8c' }}
            >
              Need support?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;


