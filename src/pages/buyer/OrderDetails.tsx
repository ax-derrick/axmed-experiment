import { Typography, Card, Button, Tag, Checkbox, InputNumber, Divider } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  LoadingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock order data - simulating "Submitted" state (awaiting quotes)
const mockOrderAwaitingQuotes = {
  orderNumber: 'O-20251203000426',
  dateTime: '03-Dec-2025 06:06:43 AM',
  status: 'Submitted' as const,
  billingAddress: 'Samfaith Apartments GM123',
  shippingAddress: 'Samfaith Apartments GM123',
  paymentMethod: 'IBAN',
  paymentStatus: 'Pending' as const,
  items: [
    {
      id: '1',
      name: 'Abiraterone',
      presentation: 'Tablet',
      dosage: '250Mg',
      quantity: 100,
      units: 'tablets',
      pricePerUnit: null,
    },
  ],
};

// Mock order data - simulating "Quotes Received" state
const mockOrderWithQuotes = {
  orderNumber: 'O-20251019000395',
  dateTime: '19-Oct-2025 02:18:58 PM',
  status: 'In progress' as const,
  billingAddress: 'Samfaith Apartments GM123',
  shippingAddress: 'Samfaith Apartments GM123',
  paymentMethod: 'IBAN',
  paymentStatus: 'Pending' as const,
  items: [
    {
      id: '1',
      name: 'Abiraterone',
      presentation: 'Tablet',
      dosage: '250Mg',
      quantity: 100,
      units: 'tablets',
      pricePerUnit: 45.50,
    },
    {
      id: '2',
      name: 'Amoxicillin',
      presentation: 'Capsule',
      dosage: '500Mg',
      quantity: 500,
      units: 'capsules',
      pricePerUnit: 0.85,
    },
    {
      id: '3',
      name: 'Metformin',
      presentation: 'Tablet',
      dosage: '850Mg',
      quantity: 200,
      units: 'tablets',
      pricePerUnit: 1.20,
    },
  ],
};

// Timeline step type
interface TimelineStep {
  key: string;
  label: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
}

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Determine which mock data to use based on orderId
  const isAwaitingQuotes = orderId === 'O-20251203000426';
  const orderData = isAwaitingQuotes ? mockOrderAwaitingQuotes : mockOrderWithQuotes;

  // State for item selection and quantities
  const [selectedItems, setSelectedItems] = useState<string[]>(
    orderData.items.map(item => item.id)
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(orderData.items.map(item => [item.id, item.quantity]))
  );

  // Check if any items have quotes (prices filled in)
  const hasQuotes = orderData.items.some(item => item.pricePerUnit !== null);

  // Calculate totals for selected items
  const calculateTotals = () => {
    let medicationCost = 0;
    orderData.items.forEach(item => {
      if (selectedItems.includes(item.id) && item.pricePerUnit !== null) {
        medicationCost += item.pricePerUnit * quantities[item.id];
      }
    });
    return {
      medicationCost,
      logisticsCost: hasQuotes ? 150 : null,
      totalSavings: hasQuotes ? medicationCost * 0.12 : null,
      total: hasQuotes ? medicationCost + 150 - (medicationCost * 0.12) : null,
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

  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: number | null) => {
    if (value !== null) {
      setQuantities({ ...quantities, [itemId]: value });
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Timeline steps
  const getTimelineSteps = (): TimelineStep[] => {
    if (isAwaitingQuotes) {
      return [
        {
          key: 'placed',
          label: 'Order Placed',
          description: `${orderData.items.length} item • ${orderData.shippingAddress}`,
          status: 'completed',
          timestamp: orderData.dateTime,
        },
        {
          key: 'matching',
          label: 'Matching Suppliers',
          description: 'Finding best prices for your order',
          status: 'active',
        },
        {
          key: 'quotes',
          label: 'Quotes Ready',
          description: 'Review supplier quotes',
          status: 'pending',
        },
        {
          key: 'review',
          label: 'Review & Submit PO',
          description: 'Confirm your purchase order',
          status: 'pending',
        },
        {
          key: 'confirmed',
          label: 'Order Confirmed',
          description: 'Order is being fulfilled',
          status: 'pending',
        },
      ];
    } else {
      return [
        {
          key: 'placed',
          label: 'Order Placed',
          description: `${orderData.items.length} items • ${orderData.shippingAddress}`,
          status: 'completed',
          timestamp: orderData.dateTime,
        },
        {
          key: 'matching',
          label: 'Matching Suppliers',
          description: 'Found qualified suppliers',
          status: 'completed',
        },
        {
          key: 'quotes',
          label: 'Quotes Ready',
          description: 'Review and select items below',
          status: 'active',
        },
        {
          key: 'review',
          label: 'Review & Submit PO',
          description: 'Confirm your purchase order',
          status: 'pending',
        },
        {
          key: 'confirmed',
          label: 'Order Confirmed',
          description: 'Order is being fulfilled',
          status: 'pending',
        },
      ];
    }
  };

  const timelineSteps = getTimelineSteps();

  // Get icon for timeline step
  const getStepIcon = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircleFilled style={{ fontSize: 20, color: '#52c41a' }} />;
      case 'active':
        return <LoadingOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
      case 'pending':
        return <ClockCircleFilled style={{ fontSize: 20, color: '#d9d9d9' }} />;
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
          Order {orderData.orderNumber}
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
              {hasQuotes && (
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
              {/* Select All - only show when quotes available */}
              {hasQuotes && (
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
                  {/* Checkbox - only when quotes available */}
                  {hasQuotes && (
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

                  {/* Quantity */}
                  <div style={{ textAlign: 'center', minWidth: 100 }}>
                    {hasQuotes ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <InputNumber
                          size="small"
                          min={1}
                          value={quantities[item.id]}
                          onChange={(value) => handleQuantityChange(item.id, value)}
                          style={{ width: 70 }}
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.units}</Text>
                      </div>
                    ) : (
                      <Text>{item.quantity} {item.units}</Text>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    {hasQuotes ? (
                      <>
                        <Text style={{ display: 'block' }}>
                          {formatCurrency(item.pricePerUnit! * quantities[item.id])}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatCurrency(item.pricePerUnit)}/unit
                        </Text>
                      </>
                    ) : (
                      <Tag color="default" style={{ margin: 0 }}>Awaiting quote</Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost Summary - Only show when quotes available */}
          {hasQuotes && (
            <Card styles={{ body: { padding: '16px 24px' } }} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Medication cost:</Text>
                  <Text>{formatCurrency(totals.medicationCost)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Logistics cost:</Text>
                  <Text>{formatCurrency(totals.logisticsCost)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total savings:</Text>
                  <Text style={{ color: '#52c41a' }}>
                    -{formatCurrency(totals.totalSavings)}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>TOTAL:</Text>
                  <Text strong style={{ fontSize: 16 }}>{formatCurrency(totals.total)}</Text>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline, Ship to, Actions */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Timeline Card */}
            <Card styles={{ body: { padding: '24px' } }} style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 20 }}>Timeline</Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timelineSteps.map((step, index) => (
                  <div key={step.key} style={{ display: 'flex', gap: 16 }}>
                    {/* Icon and line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      {getStepIcon(step.status)}
                      {index < timelineSteps.length - 1 && (
                        <div style={{
                          width: 2,
                          flex: 1,
                          minHeight: 40,
                          background: step.status === 'completed' ? '#52c41a' : '#e8e8e8',
                          marginTop: 4,
                          marginBottom: 4,
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: index < timelineSteps.length - 1 ? 16 : 0 }}>
                      <Text strong style={{
                        color: step.status === 'pending' ? '#8c8c8c' : '#1f1f1f',
                        fontSize: 13,
                        display: 'block',
                      }}>
                        {step.label}
                      </Text>
                      {step.timestamp && (
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{step.timestamp}</Text>
                      )}
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        {step.description}
                      </Text>
                      {step.status === 'active' && (
                        <Tag color="processing" style={{ margin: '4px 0 0 0', fontSize: 11 }}>In progress</Tag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ship to Card */}
            <Card styles={{ body: { padding: '16px 20px' } }} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <EnvironmentOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ship to</Text>
                  <Text>{orderData.shippingAddress}</Text>
                </div>
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
