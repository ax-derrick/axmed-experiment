import { Typography, Button, Upload, Modal, Select, Table, Input, message, Space, Alert } from 'antd';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  InboxOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  RightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { InputRef } from 'antd';
import { parseExcelFile, autoMatchColumns, applyColumnMapping, OUR_FIELDS } from '../../utils/excelParser';
import { useDraftOrder } from '../../context/DraftOrderContext';

const { Title, Text } = Typography;
const { Dragger } = Upload;

// SIP options
const SIP_OPTIONS = [
  { value: 'does_not_apply', label: 'N/A' },
  { value: 'has_been_issued', label: 'Issued' },
  { value: 'is_being_processed', label: 'Processing' },
  { value: 'to_be_requested', label: 'To Request' },
];

// Empty row template
const createEmptyRow = (id: number) => ({
  id: String(id),
  medicineName: '',
  presentation: '',
  dosage: '',
  quantity: '',
  units: '',
  sip: 'does_not_apply',
  packagingNotes: '',
});

// Initial empty rows
const createInitialRows = () => Array.from({ length: 10 }, (_, i) => createEmptyRow(i + 1));

interface RowData {
  id: string;
  medicineName: string;
  presentation: string;
  dosage: string;
  quantity: string;
  units: string;
  sip: string;
  packagingNotes: string;
}

function BulkUpload() {
  const navigate = useNavigate();
  const { addItem, saveBulkUploadDraft, bulkUploadDraft, clearBulkUploadDraft, pendingBulkUpload, setPendingBulkUpload } = useDraftOrder();

  // Table data - initialize from draft if available
  const [rows, setRows] = useState<RowData[]>(() => {
    if (bulkUploadDraft && bulkUploadDraft.rows.length > 0) {
      // Restore from draft and add empty rows
      const draftRows = [...bulkUploadDraft.rows];
      const totalRows = Math.max(draftRows.length + 5, 10);
      while (draftRows.length < totalRows) {
        draftRows.push(createEmptyRow(draftRows.length + 1));
      }
      return draftRows;
    }
    return createInitialRows();
  });
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const inputRef = useRef<InputRef>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Column mapping modal
  const [mappingModalVisible, setMappingModalVisible] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Get fields that are already mapped (for disabling in dropdowns)
  const usedFields = Object.values(columnMapping).filter(Boolean);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const { headers, rows: parsedRows } = await parseExcelFile(file);

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

    return false; // Prevent default upload behavior
  };

  // Apply column mapping and populate table
  const handleApplyMapping = () => {
    const mappedData = applyColumnMapping(uploadedRows, columnMapping);

    // Convert to our row format with IDs
    const newRows: RowData[] = mappedData.map((row, index) => ({
      id: String(index + 1),
      medicineName: row.medicineName || '',
      presentation: row.presentation || '',
      dosage: row.dosage || '',
      quantity: row.quantity || '',
      units: row.units || '',
      sip: row.sip || 'does_not_apply',
      packagingNotes: row.packagingNotes || '',
    }));

    // Add some empty rows at the end
    const totalRows = Math.max(newRows.length + 5, 10);
    while (newRows.length < totalRows) {
      newRows.push(createEmptyRow(newRows.length + 1));
    }

    setRows(newRows);
    setMappingModalVisible(false);
    message.success(`Imported ${mappedData.length} items`);
  };

  // Update a cell value
  const updateCell = (rowId: string, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
    // Reset draft saved state when user makes changes
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

  // Count valid rows (has at least medicine name and quantity)
  const validRows = rows.filter((row) => row.medicineName.trim() && row.quantity.trim());

  // Save as draft
  const handleSaveDraft = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one item with medicine name and quantity');
      return;
    }
    // Save to global context
    saveBulkUploadDraft(rows);
    setDraftSaved(true);
  };

  // Submit bulk order for processing
  const handleSubmit = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one item with medicine name and quantity');
      return;
    }

    if (pendingBulkUpload) {
      message.warning('You already have a bulk upload being processed. Please wait for it to complete.');
      return;
    }

    // Add items to draft order (they will be processed by back office)
    validRows.forEach((row) => {
      addItem({
        medicineName: row.medicineName,
        presentation: row.presentation || 'Tablet',
        dosage: row.dosage || '',
        quantity: parseInt(row.quantity, 10) || 0,
        units: row.units || 'tablets',
        sip: row.sip,
        packagingNotes: row.packagingNotes || undefined,
      });
    });

    // Set pending bulk upload state
    setPendingBulkUpload({
      itemCount: validRows.length,
      submittedAt: new Date(),
    });

    // Clear the bulk upload draft
    clearBulkUploadDraft();

    // Navigate to confirmation page with item count
    navigate(`/bulk-upload-confirmation?r=buyer&items=${validRows.length}`);
  };

  // Download template
  const handleDownloadTemplate = () => {
    // Create a simple CSV template
    const headers = ['Medicine Name', 'Form', 'Dosage', 'Quantity', 'Units', 'SIP Status', 'Notes'];
    const exampleRow = ['Amoxicillin', 'Tablet', '500mg', '1000', 'tablets', 'N/A', ''];
    const csv = [headers.join(','), exampleRow.join(',')].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'order_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render editable cell
  const renderEditableCell = (text: string, record: RowData, field: keyof RowData) => {
    const isEditing = editingCell?.rowId === record.id && editingCell?.field === field;

    if (field === 'sip') {
      return (
        <Select
          size="small"
          value={text}
          onChange={(value) => updateCell(record.id, field, value)}
          options={SIP_OPTIONS}
          style={{ width: '100%' }}
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

  // Table columns - clean headers without column letters
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
      width: 220,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'medicineName'),
    },
    {
      title: 'Form',
      dataIndex: 'presentation',
      key: 'presentation',
      width: 100,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'presentation'),
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      width: 100,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'dosage'),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'quantity'),
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      width: 90,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'units'),
    },
    {
      title: 'SIP',
      dataIndex: 'sip',
      key: 'sip',
      width: 110,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'sip'),
    },
    {
      title: 'Notes',
      dataIndex: 'packagingNotes',
      key: 'packagingNotes',
      width: 160,
      render: (text: string, record: RowData) => renderEditableCell(text, record, 'packagingNotes'),
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

  return (
    <div className="bulk-upload-page">
      {/* Pending Upload Alert */}
      {pendingBulkUpload && (
        <Alert
          message="You have a bulk upload being processed"
          description={`Your order with ${pendingBulkUpload.itemCount} item${pendingBulkUpload.itemCount !== 1 ? 's' : ''} is being processed. You cannot submit another bulk upload until this one is complete.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Header with actions */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 8, padding: 0 }}
        >
          Back
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Title level={4} style={{ margin: 0 }}>Bulk Order Entry</Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {validRows.length} item{validRows.length !== 1 ? 's' : ''} ready
            </Text>
            <Space>
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
                disabled={validRows.length === 0 || !!pendingBulkUpload}
              >
                Submit
                <RightOutlined />
              </Button>
            </Space>
          </div>
        </div>
      </div>

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
          scroll={{ x: 960 }}
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
                  // Check if this field is already used by another header
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

export default BulkUpload;
