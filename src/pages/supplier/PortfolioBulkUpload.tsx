import { Typography, Button, Upload, Modal, Select, Table, Input, message, Space, Alert, Card, Spin, Tooltip } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  InboxOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  RightOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  MailOutlined,
  FilePdfOutlined,
  CheckCircleFilled,
  QuestionCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { InputRef } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;

// Available countries for registration
const availableCountries = [
  'Armenia', 'Aruba', 'Austria', 'Azerbaijan', 'Barbados', 'Botswana',
  'Burkina Faso', 'Cameroon', 'Chad', 'DR Congo', 'Ethiopia', 'Ghana',
  'Guinea', 'Ivory Coast', 'Kenya', 'Liberia', 'Madagascar', 'Malawi',
  'Mali', 'Mozambique', 'Niger', 'Nigeria', 'Rwanda', 'Senegal',
  'Sierra Leone', 'South Africa', 'Tanzania', 'Togo', 'Uganda', 'Zambia', 'Zimbabwe',
];

// Our fields for mapping
const OUR_FIELDS = [
  { key: 'medicineName', label: 'Medicine Name' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'countries', label: 'Countries' },
];

// Availability status type
type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable';

// Empty row template
const createEmptyRow = (id: number) => ({
  id: String(id),
  medicineName: '',
  presentation: '',
  dosage: '',
  countries: '',
  availabilityStatus: 'idle' as AvailabilityStatus,
});

// Initial empty rows
const createInitialRows = () => Array.from({ length: 10 }, (_, i) => createEmptyRow(i + 1));

interface RowData {
  id: string;
  medicineName: string;
  presentation: string;
  dosage: string;
  countries: string;
  availabilityStatus: AvailabilityStatus;
}

// Simple column matching function
function autoMatchColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  const patterns: Record<string, RegExp[]> = {
    medicineName: [/medicine/i, /drug/i, /product/i, /name/i, /item/i],
    presentation: [/presentation/i, /form/i, /type/i, /format/i],
    dosage: [/dosage/i, /dose/i, /strength/i, /concentration/i],
    countries: [/countr/i, /region/i, /market/i, /registration/i],
  };

  headers.forEach(header => {
    for (const [field, regexes] of Object.entries(patterns)) {
      if (regexes.some(regex => regex.test(header))) {
        if (!Object.values(mapping).includes(field)) {
          mapping[header] = field;
        }
        break;
      }
    }
  });

  return mapping;
}

// Parse a CSV line handling quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Parse CSV/Excel file (simplified - in real app would use xlsx library)
async function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        resolve({ headers, rows });
      } catch {
        reject(new Error('Failed to parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

const DRAFT_STORAGE_KEY = 'portfolio_bulk_upload_draft';

function PortfolioBulkUpload() {
  const navigate = useNavigate();

  // Load draft from localStorage on mount
  const loadDraftFromStorage = (): RowData[] | null => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  };

  // Table data - initialize from localStorage if available
  const [rows, setRows] = useState<RowData[]>(() => {
    const draft = loadDraftFromStorage();
    return draft || createInitialRows();
  });
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const inputRef = useRef<InputRef>(null);
  const [draftSaved, setDraftSaved] = useState(() => {
    // Check if we loaded from a draft
    return loadDraftFromStorage() !== null;
  });

  // Show notification if draft was restored
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft) {
      const validCount = draft.filter(r => r.medicineName.trim()).length;
      if (validCount > 0) {
        message.info(`Restored draft with ${validCount} item${validCount !== 1 ? 's' : ''}`);
      }
    }
  }, []);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedItems, setSubmittedItems] = useState<RowData[]>([]);

  // Column mapping modal
  const [mappingModalVisible, setMappingModalVisible] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Get fields that are already mapped
  const usedFields = Object.values(columnMapping).filter(Boolean);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const { headers, rows: parsedRows } = await parseFile(file);

      if (headers.length === 0) {
        message.error('No data found in file');
        return false;
      }

      setUploadedHeaders(headers);
      setUploadedRows(parsedRows);

      // Auto-match columns
      const autoMapping = autoMatchColumns(headers);
      setColumnMapping(autoMapping);

      // Show mapping modal
      setMappingModalVisible(true);
    } catch {
      message.error('Failed to parse file');
    }

    return false;
  };

  // Apply column mapping and populate table
  const handleApplyMapping = () => {
    const newRows: RowData[] = uploadedRows.map((row, index) => {
      const mappedRow: RowData = {
        id: String(index + 1),
        medicineName: '',
        presentation: '',
        dosage: '',
        countries: '',
        availabilityStatus: 'idle',
      };

      // Apply mapping
      Object.entries(columnMapping).forEach(([header, field]) => {
        if (field && row[header] && field in mappedRow) {
          (mappedRow as unknown as Record<string, string>)[field] = row[header];
        }
      });

      return mappedRow;
    });

    // Add some empty rows at the end
    const totalRows = Math.max(newRows.length + 5, 10);
    while (newRows.length < totalRows) {
      newRows.push(createEmptyRow(newRows.length + 1));
    }

    setRows(newRows);
    setMappingModalVisible(false);
    message.success(`Imported ${uploadedRows.length} items`);

    // Trigger availability check after 2 seconds
    setTimeout(() => {
      // Set all rows with medicine names to 'checking' status
      setRows(prev => prev.map(row => ({
        ...row,
        availabilityStatus: row.medicineName.trim() ? 'checking' : 'idle',
      })));

      // After 5 seconds, randomly assign availability status
      setTimeout(() => {
        setRows(prev => prev.map(row => {
          if (row.availabilityStatus !== 'checking') return row;
          // Randomly assign ~60% as available, 40% as unavailable
          const isAvailable = Math.random() > 0.4;
          return {
            ...row,
            availabilityStatus: isAvailable ? 'available' : 'unavailable',
          };
        }));
      }, 5000);
    }, 2000);
  };

  // Update a cell value
  const updateCell = (rowId: string, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
    if (draftSaved) setDraftSaved(false);
  };

  // Add new row
  const addRow = () => {
    const newId = rows.length + 1;
    setRows((prev) => [...prev, createEmptyRow(newId)]);
  };

  // Delete row
  const deleteRow = (rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  // Count valid rows (has at least medicine name)
  const validRows = rows.filter((row) => row.medicineName.trim());

  // Save as draft to localStorage
  const handleSaveDraft = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one medicine');
      return;
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(rows));
    setDraftSaved(true);
    message.success('Draft saved');
  };

  // Clear draft from localStorage
  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setRows(createInitialRows());
    setDraftSaved(false);
    message.info('Draft cleared');
  };

  // Submit for processing
  const handleSubmit = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one medicine');
      return;
    }

    // In a real app, this would upload to backend
    console.log('Submitting portfolio items:', validRows);

    // Show loading state
    setIsSubmitting(true);

    // After 2 seconds, show confirmation
    setTimeout(() => {
      setSubmittedItems(validRows);
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }, 2000);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const headers = ['Medicine Name', 'Presentation', 'Dosage', 'Countries'];
    const sampleRows = [
      ['Amoxicillin', 'Capsule', '500mg', '"Ghana, Nigeria, Kenya, Tanzania, Uganda"'],
      ['Metformin', 'Tablet', '500mg', '"Ghana, Uganda, Rwanda, Senegal"'],
      ['Paracetamol', 'Tablet', '500mg', '"Nigeria, Tanzania, Kenya, Ethiopia, Malawi, Zambia"'],
      ['Azithromycin', 'Tablet', '250mg', '"Ghana, Ethiopia, Ivory Coast"'],
      ['Ciprofloxacin', 'Tablet', '500mg', '"Nigeria, Ghana, Senegal, Mali, Burkina Faso"'],
      ['Omeprazole', 'Capsule', '20mg', '"Kenya, Uganda, Rwanda, Tanzania"'],
      ['Ibuprofen', 'Tablet', '400mg', '"Ghana, Nigeria, Cameroon"'],
      ['Metronidazole', 'Tablet', '400mg', '"Tanzania, Malawi, Zambia, Mozambique, Zimbabwe"'],
      ['Atorvastatin', 'Tablet', '20mg', '"Ghana, Nigeria, Kenya, South Africa"'],
      ['Amlodipine', 'Tablet', '5mg', '"Uganda, Rwanda, Kenya"'],
      ['Losartan', 'Tablet', '50mg', '"Ghana, Senegal, Ivory Coast, Guinea"'],
      ['Doxycycline', 'Capsule', '100mg', '"Nigeria, Kenya, Ethiopia, Tanzania, Uganda"'],
      ['Albendazole', 'Tablet', '400mg', '"Ghana, Tanzania, Malawi"'],
      ['Ceftriaxone', 'Injectable Solution', '1g', '"Nigeria, Ghana, Kenya, Uganda, Ethiopia"'],
      ['Artemether/Lumefantrine', 'Tablet', '20mg/120mg', '"Ghana, Nigeria, Uganda, Tanzania, Kenya, Malawi, Zambia"'],
    ];
    const csv = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render editable cell
  const renderEditableCell = (text: string, record: RowData, field: keyof RowData) => {
    const isEditing = editingCell?.rowId === record.id && editingCell?.field === field;

    if (field === 'countries') {
      // Multi-select for countries
      const selectedCountries = text ? text.split(',').map(c => c.trim()).filter(Boolean) : [];
      return (
        <Select
          mode="multiple"
          size="small"
          value={selectedCountries}
          onChange={(value) => updateCell(record.id, field, value.join(', '))}
          options={availableCountries.map(c => ({ label: c, value: c }))}
          style={{ width: '100%', minWidth: 150 }}
          maxTagCount={2}
          placeholder="Select countries"
          bordered={false}
        />
      );
    }

    if (isEditing) {
      return (
        <Input
          ref={inputRef}
          size="small"
          defaultValue={text}
          onBlur={(e) => {
            updateCell(record.id, field, e.target.value);
            setEditingCell(null);
          }}
          onPressEnter={(e) => {
            updateCell(record.id, field, (e.target as HTMLInputElement).value);
            setEditingCell(null);
          }}
          autoFocus
          style={{ margin: -4, padding: '4px 8px' }}
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell({ rowId: record.id, field })}
        style={{
          cursor: 'text',
          minHeight: 22,
          padding: '0 4px',
        }}
      >
        {text || <span style={{ color: '#bfbfbf' }}>-</span>}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'rowNum',
      width: 48,
      className: 'row-number-cell',
      render: (id: string) => <span>{id}</span>,
    },
    {
      title: 'Medicine Name',
      dataIndex: 'medicineName',
      key: 'medicineName',
      width: 250,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'medicineName'),
    },
    {
      title: 'Presentation',
      dataIndex: 'presentation',
      key: 'presentation',
      width: 130,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'presentation'),
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      width: 120,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'dosage'),
    },
    {
      title: 'Countries',
      dataIndex: 'countries',
      key: 'countries',
      width: 250,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'countries'),
    },
    {
      title: 'Available',
      dataIndex: 'availabilityStatus',
      key: 'available',
      width: 90,
      align: 'center' as const,
      render: (status: AvailabilityStatus, record: RowData) => {
        // Only show status if there's a medicine name
        if (!record.medicineName.trim()) {
          return <span style={{ color: '#d9d9d9' }}>-</span>;
        }

        if (status === 'idle') {
          return <span style={{ color: '#d9d9d9' }}>-</span>;
        }

        if (status === 'checking') {
          return (
            <Tooltip title="Checking availability...">
              <LoadingOutlined style={{ color: '#1890ff', fontSize: 16 }} spin />
            </Tooltip>
          );
        }

        if (status === 'available') {
          return (
            <Tooltip title="Already available in the Axmed marketplace">
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />
            </Tooltip>
          );
        }

        // unavailable
        return (
          <Tooltip title="This SKU is not available in the marketplace yet. It will be reviewed and added within 24-48 hours.">
            <QuestionCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
          </Tooltip>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: (_: unknown, record: RowData) => (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.id)}
          style={{ color: '#bfbfbf' }}
        />
      ),
    },
  ];

  // Loading screen while submitting
  if (isSubmitting) {
    return (
      <div
        className="bulk-upload-loading-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          maxWidth: 700,
          margin: '0 auto',
        }}
      >
        <Spin size="large" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#595959' }}>
          Submitting your portfolio...
        </Text>
        <Text type="secondary" style={{ marginTop: 8, fontSize: 14 }}>
          Uploading {validRows.length} item{validRows.length !== 1 ? 's' : ''} for review
        </Text>
      </div>
    );
  }

  // Confirmation screen after submission
  if (isSubmitted) {
    const totalItems = submittedItems.length;

    // Progress steps for portfolio upload - all items go to review
    const progressSteps = [
      { label: 'Uploaded', completed: true },
      { label: 'Under Review', active: true },
      { label: 'Added to Portfolio', completed: false },
    ];

    return (
      <div className="bulk-upload-confirmation-page" style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Main Status Card */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '32px' } }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} submitted
          </Text>
          <Title level={3} style={{ margin: '4px 0 24px 0', fontWeight: 600 }}>
            Your portfolio is being reviewed.
          </Title>

          {/* Progress Stepper */}
          <div style={{ marginBottom: 16 }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {progressSteps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: 4,
                    background: step.completed ? '#73d13d' : step.active ? '#ffc53d' : '#f0f0f0',
                    marginRight: index < progressSteps.length - 1 ? 4 : 0,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            {/* Step Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {progressSteps.map((step, index) => (
                <Text
                  key={index}
                  style={{
                    fontSize: 12,
                    color: step.completed || step.active ? '#262626' : '#8c8c8c',
                    fontWeight: step.completed || step.active ? 600 : 400,
                    textAlign: index === 0 ? 'left' : index === progressSteps.length - 1 ? 'right' : 'center',
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
            Our team will match your products to our catalogue and add them to your portfolio within 24-48 hours. You'll receive an email when it's ready.
          </Text>
        </Card>

        {/* Upload Details Card */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '24px' } }}>
          <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 15 }}>
            Submitted items
          </Text>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <ClockCircleOutlined style={{ fontSize: 18, color: '#faad14', marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 14 }}>
                {submittedItems.length} item{submittedItems.length !== 1 ? 's' : ''} pending review
              </Text>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {submittedItems.slice(0, 8).map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#fffbe6',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#595959'
                    }}
                  >
                    {item.medicineName}
                  </span>
                ))}
                {submittedItems.length > 8 && (
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                    +{submittedItems.length - 8} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions Card */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
            }}
            onClick={() => message.success('Confirmation email sent')}
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
            onClick={() => message.info('Downloading summary...')}
          >
            <Text>Download upload summary (PDF)</Text>
            <FilePdfOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
          </div>
        </Card>

        {/* Bottom Buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            size="large"
            onClick={() => {
              setIsSubmitted(false);
              setRows(createInitialRows());
              setSubmittedItems([]);
            }}
            style={{ flex: 1, height: 48 }}
          >
            Upload More
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/portfolio?r=supplier')}
            style={{ flex: 1, height: 48 }}
          >
            View Portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-upload-page">
      {/* Header with actions */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/portfolio?r=supplier')}
          style={{ marginBottom: 8, padding: 0 }}
        >
          Back to Portfolio
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Title level={4} style={{ margin: 0 }}>Bulk Portfolio Upload</Title>
            <Text type="secondary">
              Add multiple products by uploading a spreadsheet or entering them directly in the table below.
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {validRows.length} item{validRows.length !== 1 ? 's' : ''} ready
            </Text>
            <Space>
              {draftSaved && (
                <Button
                  onClick={handleClearDraft}
                  type="text"
                  style={{ color: '#8c8c8c' }}
                >
                  Clear Draft
                </Button>
              )}
              <Button
                onClick={handleSaveDraft}
                disabled={validRows.length === 0 || draftSaved}
                icon={draftSaved ? <CheckOutlined /> : undefined}
                style={draftSaved ? { color: '#52c41a', borderColor: '#52c41a' } : undefined}
              >
                {draftSaved ? 'Draft Saved' : 'Save as Draft'}
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={validRows.length === 0}
              >
                Submit for Review
                <RightOutlined />
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert
        message="Our team will match your products to our catalogue and add them to your portfolio within 24-48 hours. You'll receive an email notification when your portfolio is updated."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Upload Drop Zone */}
      <div style={{ marginBottom: 24 }}>
        <Dragger
          accept=".xlsx,.xls,.csv"
          showUploadList={false}
          beforeUpload={handleFileUpload}
          style={{ padding: '20px 0' }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">
            Drop your Excel or CSV file here, or click to browse
          </p>
          <p className="ant-upload-hint" style={{ marginBottom: 8 }}>
            Supports .xlsx, .xls, and .csv files
          </p>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadTemplate();
            }}
            size="small"
          >
            Download Template
          </Button>
        </Dragger>
      </div>

      {/* Table */}
      <div className="excel-table" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 850 }}
        />
      </div>

      {/* Add Row Button */}
      <div style={{ textAlign: 'right' }}>
        <Button icon={<PlusOutlined />} onClick={addRow}>
          Add Row
        </Button>
      </div>

      {/* Column Mapping Modal */}
      <Modal
        title="Map Your Columns"
        open={mappingModalVisible}
        onCancel={() => setMappingModalVisible(false)}
        onOk={handleApplyMapping}
        okText="Apply Mapping"
        width={520}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          We found {uploadedHeaders.length} columns in your file. Match them to our fields:
        </Text>

        {/* Column headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Text type="secondary" style={{ flex: 1, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Your File
          </Text>
          <div style={{ width: 24 }} />
          <Text type="secondary" style={{ width: 160, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Our Fields
          </Text>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {uploadedHeaders.map((header) => (
            <div
              key={header}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ flex: 1, fontWeight: 500, color: '#262626' }}>"{header}"</div>
              <span style={{ color: '#bfbfbf' }}>→</span>
              <Select
                style={{ width: 160 }}
                value={columnMapping[header] || undefined}
                onChange={(value) =>
                  setColumnMapping((prev) => ({ ...prev, [header]: value }))
                }
                placeholder="Select field"
                allowClear
              >
                {OUR_FIELDS.map((field) => {
                  const isUsedByOther = usedFields.includes(field.key) && columnMapping[header] !== field.key;
                  return (
                    <Select.Option
                      key={field.key}
                      value={field.key}
                      disabled={isUsedByOther}
                    >
                      {field.label}
                      {isUsedByOther && ' (already mapped)'}
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default PortfolioBulkUpload;
