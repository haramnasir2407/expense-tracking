# Expense Tracking Implementation Plan

## Overview

This document outlines the implementation plan for the expense capture and listing features.

---

## **Phase 1: Database & Types Setup**

### 1.1 Supabase Schema

Create these tables in your Supabase project via SQL Editor:

```sql
-- Expenses table
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10,2) not null,
  category text not null,
  date timestamptz not null default now(),
  notes text,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table expenses enable row level security;

-- Policies: users can only see their own expenses
create policy "Users can view own expenses"
  on expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expenses for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index expenses_user_id_date_idx on expenses(user_id, date desc);

-- Categories table (optional - for predefined categories)
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- Insert default categories
insert into categories (name, icon, color) values
  ('Food & Dining', 'restaurant', '#FF6B6B'),
  ('Transportation', 'car', '#4ECDC4'),
  ('Shopping', 'cart', '#95E1D3'),
  ('Entertainment', 'game-controller', '#F38181'),
  ('Bills & Utilities', 'receipt', '#AA96DA'),
  ('Healthcare', 'medical', '#FCBAD3'),
  ('Travel', 'airplane', '#A8D8EA'),
  ('Other', 'ellipsis-horizontal', '#999999');
```

#### Schema Explanation

**Expenses Table:**
- `id` - Unique identifier (auto-generated UUID)
- `user_id` - Links expense to user (foreign key with cascade delete)
- `amount` - Expense amount (decimal with 2 decimal places)
- `category` - Category name (text)
- `date` - When expense occurred (timestamp with timezone)
- `notes` - Optional notes
- `receipt_url` - URL to receipt image in Supabase Storage
- `created_at` / `updated_at` - Audit timestamps

**Row Level Security (RLS):**
- Ensures users can only access their own expenses
- Four policies: SELECT, INSERT, UPDATE, DELETE
- Security enforced at database level

**Index:**
- Speeds up queries for user's expenses sorted by date
- Critical for performance as expense count grows

**Categories Table:**
- Predefined expense categories
- Each has name, icon (Ionicons name), and color

---

### 1.2 TypeScript Types

Create `types/expense.ts`:

```typescript
export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseFormData {
  amount: string;
  category: string;
  date: Date;
  notes: string;
  receipt_url?: string;
}

export interface GroupedExpenses {
  date: string;
  total: number;
  expenses: Expense[];
}
```

---

## **Phase 2: File Structure**

```
app/
├── (tabs)/
│   └── index.tsx                 # Home screen with expense list
├── expenses/
│   ├── add.tsx                   # Add expense screen (modal)
│   └── [id].tsx                  # Edit/view expense details
components/
├── expenses/
│   ├── ExpenseCard.tsx           # Individual expense card
│   ├── ExpenseListSection.tsx    # Grouped by date section
│   ├── ExpenseForm.tsx           # Form for add/edit
│   ├── CategoryPicker.tsx        # Category selector
│   ├── ReceiptUpload.tsx         # Receipt upload component
│   └── ExpenseSummary.tsx        # Summary stats
lib/
├── expenses.ts                   # Expense CRUD operations
└── storage.ts                    # Receipt upload to Supabase Storage
hooks/
└── useExpenses.ts                # Hook for expense data & optimistic updates
types/
└── expense.ts                    # Expense types
```

---

## **Phase 3: Implementation Steps**

### **Step 1: Create Expense Service (`lib/expenses.ts`)**

Functions for:
- `getExpenses(userId)` - Fetch all expenses for a user
- `addExpense(expense)` - Create new expense
- `updateExpense(id, data)` - Update existing expense
- `deleteExpense(id)` - Delete expense
- `getCategories()` - Fetch all categories

```typescript
import { supabase } from './supabase';
import { Expense, Category, ExpenseFormData } from '@/types/expense';

export async function getExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  return { data, error };
}

export async function addExpense(expense: ExpenseFormData, userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...expense,
      user_id: userId,
    })
    .select()
    .single();
  
  return { data, error };
}

export async function updateExpense(id: string, updates: Partial<ExpenseFormData>) {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  return { error };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  return { data, error };
}
```

---

### **Step 2: Create Storage Service (`lib/storage.ts`)**

Functions for:
- `uploadReceipt(file, userId)` - Upload receipt to Supabase Storage
- `deleteReceipt(url)` - Delete receipt from storage
- `getReceiptUrl(path)` - Get public URL for receipt

```typescript
import { supabase } from './supabase';

const BUCKET_NAME = 'receipts';

export async function uploadReceipt(
  fileUri: string,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.jpg`;
    
    // Convert file URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      return { url: null, error };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteReceipt(url: string): Promise<{ error: Error | null }> {
  try {
    // Extract file path from URL
    const path = url.split(`${BUCKET_NAME}/`)[1];
    
    if (!path) {
      return { error: new Error('Invalid receipt URL') };
    }
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

export function getReceiptUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
```

**Note:** You'll need to create a `receipts` bucket in Supabase Storage with public read access.

---

### **Step 3: Create Custom Hook (`hooks/useExpenses.ts`)**

Features:
- Fetch expenses with loading/error states
- Optimistic updates for add/edit/delete
- Group expenses by date
- Calculate totals

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Expense, GroupedExpenses } from '@/types/expense';
import * as expenseService from '@/lib/expenses';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses
  useEffect(() => {
    if (user?.id) {
      loadExpenses();
    }
  }, [user?.id]);

  async function loadExpenses() {
    if (!user?.id) return;
    
    setLoading(true);
    const { data, error } = await expenseService.getExpenses(user.id);
    
    if (error) {
      setError(error.message);
    } else {
      setExpenses(data || []);
    }
    
    setLoading(false);
  }

  // Add expense with optimistic update
  async function addExpense(expenseData: any) {
    if (!user?.id) return { error: 'Not authenticated' };
    
    const tempId = `temp-${Date.now()}`;
    const optimisticExpense: Expense = {
      ...expenseData,
      id: tempId,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Optimistically add to state
    setExpenses(prev => [optimisticExpense, ...prev]);
    
    // Call API
    const { data, error } = await expenseService.addExpense(expenseData, user.id);
    
    if (error) {
      // Rollback on error
      setExpenses(prev => prev.filter(e => e.id !== tempId));
      return { error: error.message };
    }
    
    // Replace temp with real data
    setExpenses(prev => 
      prev.map(e => e.id === tempId ? data : e)
    );
    
    return { error: null };
  }

  // Update expense
  async function updateExpense(id: string, updates: any) {
    const { data, error } = await expenseService.updateExpense(id, updates);
    
    if (error) {
      return { error: error.message };
    }
    
    setExpenses(prev => 
      prev.map(e => e.id === id ? data : e)
    );
    
    return { error: null };
  }

  // Delete expense
  async function deleteExpense(id: string) {
    // Optimistically remove
    const backup = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    
    const { error } = await expenseService.deleteExpense(id);
    
    if (error && backup) {
      // Rollback on error
      setExpenses(prev => [...prev, backup].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      return { error: error.message };
    }
    
    return { error: null };
  }

  // Group expenses by date
  function getGroupedExpenses(): GroupedExpenses[] {
    const groups: { [key: string]: Expense[] } = {};
    
    expenses.forEach(expense => {
      const dateKey = new Date(expense.date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });
    
    return Object.entries(groups).map(([date, expenseList]) => ({
      date,
      total: expenseList.reduce((sum, e) => sum + Number(e.amount), 0),
      expenses: expenseList,
    }));
  }

  return {
    expenses,
    groupedExpenses: getGroupedExpenses(),
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
  };
}
```

---

### **Step 4: Build UI Components**

**Priority order:**

1. **ExpenseCard** - Display single expense
2. **ExpenseListSection** - Grouped section with date header
3. **ExpenseForm** - Form with all fields
4. **CategoryPicker** - Category selector (modal/bottom sheet)
5. **ReceiptUpload** - Image picker & upload
6. **ExpenseSummary** - Stats at top of list

---

### **Step 5: Build Screens**

#### 1. **Home screen (`app/(tabs)/index.tsx`)**

Features:
- Virtualized list with FlashList
- Pull-to-refresh
- FAB (Floating Action Button) to add expense
- Summary header

```typescript
import { FlashList } from '@shopify/flash-list';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseSummary } from '@/components/expenses/ExpenseSummary';

export default function HomeScreen() {
  const { groupedExpenses, loading, refresh } = useExpenses();
  
  return (
    <View style={styles.container}>
      <ExpenseSummary />
      
      <FlashList
        data={groupedExpenses}
        renderItem={({ item }) => (
          <ExpenseListSection
            date={item.date}
            total={item.total}
            expenses={item.expenses}
          />
        )}
        estimatedItemSize={100}
        refreshing={loading}
        onRefresh={refresh}
      />
      
      <FAB onPress={() => router.push('/expenses/add')} />
    </View>
  );
}
```

#### 2. **Add expense modal (`app/expenses/add.tsx`)**

Features:
- Full-screen modal with form
- Image picker for receipts
- Save & cancel buttons

#### 3. **Expense detail screen (`app/expenses/[id].tsx`)**

Features:
- View/edit individual expense
- Delete option
- Receipt preview

---

## **Phase 4: Features Breakdown**

### **4.1 Expense Listing (Home Screen)**

```
┌─────────────────────────────┐
│  Summary Card               │
│  Total: $1,234.56          │
│  This Month                 │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Today                      │
│  ┌───────────────────────┐ │
│  │ 🍔 Food & Dining     │ │
│  │ $25.50              │ │
│  │ Lunch at cafe       │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │ 🚗 Transportation    │ │
│  │ $15.00              │ │
│  └───────────────────────┘ │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Yesterday                  │
│  ...                        │
└─────────────────────────────┘
         [+ FAB]
```

### **4.2 Add Expense Flow**

1. Tap FAB
2. Modal opens with form
3. Fill amount (required)
4. Select category (required)
5. Pick date/time (default now)
6. Add notes (optional)
7. Upload receipt (optional)
8. Save → Optimistic update → API call

### **4.3 Optimistic UI Pattern**

```typescript
// Add expense optimistically
const addExpense = async (data) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticExpense = { ...data, id: tempId, pending: true };
  
  // 1. Add to local state immediately
  setExpenses(prev => [optimisticExpense, ...prev]);
  
  // 2. Call API
  try {
    const realExpense = await supabase.from('expenses').insert(data);
    // 3. Replace temp with real data
    setExpenses(prev => prev.map(e => 
      e.id === tempId ? realExpense : e
    ));
  } catch (error) {
    // 4. Rollback on error
    setExpenses(prev => prev.filter(e => e.id !== tempId));
    Alert.alert('Error', 'Failed to add expense');
  }
};
```

---

## **Phase 5: Performance Optimizations**

1. **Use FlashList** instead of FlatList (10x faster)
2. **Memoize components** with `React.memo`
3. **Virtualized sections** for date groups
4. **Paginated loading** (load 50 at a time, infinite scroll)
5. **Image optimization** (compress receipts before upload)
6. **Debounce search/filters**

---

## **Recommended Order of Implementation**

- [x] Set up Supabase tables & RLS policies
- [x] Create TypeScript types
- [ ] Build `lib/expenses.ts` service
- [ ] Build `hooks/useExpenses.ts` with basic fetch
- [ ] Create `ExpenseCard` component
- [ ] Update home screen with FlashList
- [ ] Build `ExpenseForm` component
- [ ] Create add expense modal
- [ ] Add optimistic updates to hook
- [ ] Build `CategoryPicker`
- [ ] Add receipt upload functionality
- [ ] Build expense detail screen
- [ ] Add edit/delete features
- [ ] Polish UI & animations

---

## **Dependencies to Install**

```bash
# FlashList for better performance
npm install @shopify/flash-list

# Image picker for receipts
npx expo install expo-image-picker

# Optional: Date picker
npm install react-native-date-picker
```

---

## **Supabase Storage Setup**

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `receipts`
3. Set to **Public** (so users can view their receipts)
4. Set RLS policies:

```sql
-- Users can upload to their own folder
create policy "Users can upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own receipts
create policy "Users can view own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own receipts
create policy "Users can delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## **Next Steps**

1. Complete database setup in Supabase
2. Start with Step 1: Create expense service
3. Build UI components incrementally
4. Test with real data
5. Add polish & animations
