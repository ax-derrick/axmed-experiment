import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

// Draft order item type
export interface DraftOrderItem {
  id: string;
  medicineName: string;
  presentation: string;
  dosage: string;
  sip: string;
  quantity: number;
  units: string;
  packagingNotes?: string;
}

// Notification state type
export interface NotificationState {
  visible: boolean;
  itemName: string | null;
}

// Bulk upload draft state type
export interface BulkUploadDraft {
  rows: BulkUploadRow[];
  savedAt: Date;
}

export interface BulkUploadRow {
  id: string;
  medicineName: string;
  presentation: string;
  dosage: string;
  quantity: string;
  units: string;
  sip: string;
  packagingNotes: string;
}

// Pending bulk upload type
export interface PendingBulkUpload {
  itemCount: number;
  submittedAt: Date;
}

// Context type
interface DraftOrderContextType {
  items: DraftOrderItem[];
  addItem: (item: Omit<DraftOrderItem, 'id'>, showNotification?: boolean) => void;
  updateItem: (id: string, updates: Partial<DraftOrderItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  notification: NotificationState;
  dismissNotification: () => void;
  showItemNotification: (itemName: string) => void;
  // Bulk upload draft
  bulkUploadDraft: BulkUploadDraft | null;
  saveBulkUploadDraft: (rows: BulkUploadRow[]) => void;
  clearBulkUploadDraft: () => void;
  // Pending bulk upload (being processed)
  pendingBulkUpload: PendingBulkUpload | null;
  setPendingBulkUpload: (upload: PendingBulkUpload | null) => void;
}

// Create context
const DraftOrderContext = createContext<DraftOrderContextType | undefined>(undefined);

// Provider component
export function DraftOrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DraftOrderItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    itemName: null,
  });
  const notificationTimeoutRef = useRef<number | null>(null);

  // Bulk upload draft state
  const [bulkUploadDraft, setBulkUploadDraft] = useState<BulkUploadDraft | null>(null);

  // Pending bulk upload (being processed by back office)
  const [pendingBulkUpload, setPendingBulkUpload] = useState<PendingBulkUpload | null>(null);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const dismissNotification = () => {
    setNotification({ visible: false, itemName: null });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
  };

  const showItemNotification = (itemName: string) => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ visible: true, itemName });

    // Auto-dismiss after 60 seconds (1 minute)
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification({ visible: false, itemName: null });
    }, 60000);
  };

  const addItem = (item: Omit<DraftOrderItem, 'id'>, showNotification = false) => {
    const newItem: DraftOrderItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setItems((prev) => [...prev, newItem]);

    // Only show notification if explicitly requested
    if (showNotification) {
      showItemNotification(item.medicineName);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const updateItem = (id: string, updates: Partial<DraftOrderItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  // Bulk upload draft functions
  const saveBulkUploadDraft = (rows: BulkUploadRow[]) => {
    const validRows = rows.filter(row => row.medicineName.trim() && row.quantity.trim());
    if (validRows.length > 0) {
      setBulkUploadDraft({
        rows: validRows,
        savedAt: new Date(),
      });
    }
  };

  const clearBulkUploadDraft = () => {
    setBulkUploadDraft(null);
  };

  return (
    <DraftOrderContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearItems,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        notification,
        dismissNotification,
        showItemNotification,
        bulkUploadDraft,
        saveBulkUploadDraft,
        clearBulkUploadDraft,
        pendingBulkUpload,
        setPendingBulkUpload,
      }}
    >
      {children}
    </DraftOrderContext.Provider>
  );
}

// Hook to use the context
export function useDraftOrder() {
  const context = useContext(DraftOrderContext);
  if (context === undefined) {
    throw new Error('useDraftOrder must be used within a DraftOrderProvider');
  }
  return context;
}
