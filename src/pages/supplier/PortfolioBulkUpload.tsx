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

// Empty row template
const createEmptyRow = (id: number) => ({
  id: String(id),
  medicineName: '',
  presentation: '',
  dosage: '',
  countries: '',
});

// Initial empty rows
const createInitialRows = () => Array.from({ length: 10 }, (_, i) => createEmptyRow(i + 1));

interface RowData {
  id: string;
  medicineName: string;
  presentation: string;
  dosage: string;
  countries: string;
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

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
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

function PortfolioBulkUpload() {
  const navigate = useNavigate();

  // Table data
  const [rows, setRows] = useState<RowData[]>(createInitialRows());
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const inputRef = useRef<InputRef>(null);
  const [draftSaved, setDraftSaved] = useState(false);

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

  // Save as draft
  const handleSaveDraft = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one medicine');
      return;
    }
    setDraftSaved(true);
    message.success('Draft saved');
  };

  // Submit for processing
  const handleSubmit = () => {
    if (validRows.length === 0) {
      message.warning('Please add at least one medicine');
      return;
    }

    // In a real app, this would upload to backend
    console.log('Submitting portfolio items:', validRows);

    message.success(`${validRows.length} items submitted for processing`);
    navigate('/portfolio?r=supplier');
  };

  // Download template
  const handleDownloadTemplate = () => {
    const headers = ['Medicine Name', 'Presentation', 'Dosage', 'Countries'];
    const exampleRow = ['Amoxicillin', 'Tablet', '500mg', 'Ghana, Nigeria'];
    const csv = [headers.join(','), exampleRow.join(',')].join('\n');

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
        message="Our team will review your submission and match products to our catalogue within 24-48 hours. You'll receive an email notification once your portfolio is updated."
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
