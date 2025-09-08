# Transaction Reports Feature

## Overview
The Transaction Reports feature provides comprehensive financial transaction tracking and reporting capabilities for the School ERP system. It allows administrators to view, filter, and analyze all financial transactions including fee payments, transport payments, library fines, and other financial activities.

## Features

### 🎯 Core Functionality
- **Transaction Tracking**: Record and track all financial transactions
- **Advanced Filtering**: Filter by date range, payment mode, transaction type, class, student, and status
- **Real-time Analytics**: View transaction summaries and payment mode breakdowns
- **Export Capabilities**: Export transaction data to CSV format
- **Receipt Management**: Generate and track receipt numbers

### 📊 Analytics & Reporting
- **Summary Dashboard**: Total transactions, amounts, and averages
- **Payment Mode Breakdown**: Visual breakdown of payment methods
- **Transaction Type Analysis**: Categorized transaction analysis
- **Date Range Filtering**: Flexible date range selection
- **Status Tracking**: Monitor transaction status (completed, pending, failed, refunded)

### 🔍 Filtering Options
- **Date Range**: Start and end date selection
- **Payment Mode**: Cash, Cheque, Card, Online, Bank Transfer
- **Transaction Type**: Fee Payment, Transport Payment, Library Fine, Cafeteria Payment, Other
- **Class/Standard**: Filter by specific classes
- **Student**: Filter by individual students
- **Status**: Filter by transaction status
- **View Options**: Receipt Transaction, Daily Summary, Monthly Summary

## Database Schema

### TransactionReport Model
```javascript
{
  id: UUID (Primary Key)
  studentId: UUID (Foreign Key to Student)
  transactionType: ENUM (fee_payment, transport_payment, library_fine, cafeteria_payment, other)
  amount: DECIMAL(10,2)
  paymentMode: ENUM (cash, cheque, card, online, bank_transfer)
  transactionDate: DATE
  receiptNumber: STRING (Unique)
  description: TEXT
  status: ENUM (pending, completed, failed, refunded)
  referenceId: UUID (Optional - Reference to related records)
  referenceType: STRING (Optional - Type of reference)
  processedBy: UUID (Foreign Key to User)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

## API Endpoints

### GET /api/transaction-reports
Get transaction reports with filtering options
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `startDate`: Start date filter (ISO format)
- `endDate`: End date filter (ISO format)
- `paymentMode`: Payment mode filter
- `transactionType`: Transaction type filter
- `classId`: Class filter
- `studentId`: Student filter
- `status`: Status filter
- `viewBy`: View type (receipt_transaction, daily_summary, monthly_summary)

### GET /api/transaction-reports/:id
Get specific transaction report by ID

### POST /api/transaction-reports
Create new transaction report
**Body:**
```json
{
  "studentId": "uuid",
  "transactionType": "fee_payment",
  "amount": 15000.00,
  "paymentMode": "online",
  "transactionDate": "2024-01-15T10:30:00Z",
  "receiptNumber": "RCP-20240115-001",
  "description": "Monthly fee payment",
  "status": "completed"
}
```

### PUT /api/transaction-reports/:id
Update existing transaction report

### DELETE /api/transaction-reports/:id
Delete transaction report

### GET /api/transaction-reports/summary/dashboard
Get transaction summary for dashboard

### GET /api/transaction-reports/export/csv
Export transaction reports to CSV format

## Frontend Components

### TransactionReports.js
Main component for transaction reports with:
- **Filter Panel**: Comprehensive filtering options
- **Summary Cards**: Key metrics display
- **Payment Mode Breakdown**: Visual payment method analysis
- **Transactions Table**: Detailed transaction listing
- **Export Functionality**: CSV export capability

### Key Features:
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Live data updates
- **Interactive Filters**: Dynamic filtering with immediate results
- **Export Options**: Download data in CSV format
- **Status Indicators**: Visual status representation
- **Payment Mode Icons**: Intuitive payment method icons

## Usage Examples

### 1. View All Transactions
```javascript
// Get all transactions
const response = await fetch('/api/transaction-reports');
const data = await response.json();
```

### 2. Filter by Date Range
```javascript
// Get transactions for specific date range
const response = await fetch('/api/transaction-reports?startDate=2024-01-01&endDate=2024-01-31');
const data = await response.json();
```

### 3. Filter by Payment Mode
```javascript
// Get all online payments
const response = await fetch('/api/transaction-reports?paymentMode=online');
const data = await response.json();
```

### 4. Export to CSV
```javascript
// Export filtered transactions
const response = await fetch('/api/transaction-reports/export/csv?startDate=2024-01-01&endDate=2024-01-31');
const data = await response.json();
```

## Seeding Sample Data

To populate the database with sample transaction data:

```bash
npm run seed-transactions
```

This will create 50 sample transactions with:
- Random transaction types
- Various payment modes
- Different amounts based on transaction type
- Random dates within the last 6 months
- Different statuses

## Integration Points

### With Fee Management
- Automatically creates transaction records when fees are paid
- Links to FeePayment records via referenceId

### With Transport Management
- Tracks transport fee payments
- Links to TransportPayment records

### With Library Management
- Records library fines and payments
- Tracks book-related financial transactions

### With User Management
- Tracks who processed each transaction
- Links to User records for audit trails

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **Role-based Access**: Admin and staff access controls
- **Data Validation**: Comprehensive input validation
- **Audit Trail**: Complete transaction history tracking

## Performance Optimizations

- **Pagination**: Efficient data loading with pagination
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Summary data caching for dashboard
- **Bulk Operations**: Efficient bulk data operations

## Future Enhancements

- **Advanced Analytics**: More detailed financial analytics
- **Scheduled Reports**: Automated report generation
- **Email Notifications**: Transaction status notifications
- **Mobile App Integration**: Mobile transaction tracking
- **Multi-currency Support**: Support for different currencies
- **Integration with Accounting Software**: Export to accounting systems

## Troubleshooting

### Common Issues

1. **No Transactions Showing**
   - Check if students and users are seeded
   - Verify database connection
   - Run the seeder: `npm run seed-transactions`

2. **Filter Not Working**
   - Check date format (should be ISO format)
   - Verify filter parameter names
   - Check browser console for errors

3. **Export Issues**
   - Ensure sufficient data exists
   - Check browser download permissions
   - Verify CSV format compatibility

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.
