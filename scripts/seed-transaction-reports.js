const { TransactionReport, Student, User, Class } = require('../models');

const seedTransactionReports = async () => {
  try {
    console.log('🌱 Seeding transaction reports...');

    // Get some students and users for seeding
    const students = await Student.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }],
      limit: 10
    });

    const users = await User.findAll({
      where: { role: 'admin' },
      limit: 3
    });

    if (students.length === 0 || users.length === 0) {
      console.log('❌ No students or users found. Please seed students and users first.');
      return;
    }

    // Sample transaction data
    const transactionTypes = ['fee_payment', 'transport_payment', 'library_fine', 'cafeteria_payment', 'other'];
    const paymentModes = ['cash', 'cheque', 'card', 'online', 'bank_transfer'];
    const statuses = ['completed', 'pending', 'failed', 'refunded'];

    const transactions = [];

    // Generate 50 sample transactions
    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate random date within last 6 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

      // Generate random amount based on transaction type
      let amount;
      switch (transactionType) {
        case 'fee_payment':
          amount = Math.floor(Math.random() * 50000) + 10000; // ₹10,000 - ₹60,000
          break;
        case 'transport_payment':
          amount = Math.floor(Math.random() * 5000) + 2000; // ₹2,000 - ₹7,000
          break;
        case 'library_fine':
          amount = Math.floor(Math.random() * 500) + 50; // ₹50 - ₹550
          break;
        case 'cafeteria_payment':
          amount = Math.floor(Math.random() * 2000) + 100; // ₹100 - ₹2,100
          break;
        default:
          amount = Math.floor(Math.random() * 10000) + 500; // ₹500 - ₹10,500
      }

      const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      transactions.push({
        studentId: student.id,
        transactionType,
        amount,
        paymentMode,
        transactionDate: randomDate,
        receiptNumber,
        description: `Payment for ${transactionType.replace('_', ' ')}`,
        status,
        processedBy: user.id
      });
    }

    // Bulk create transactions
    await TransactionReport.bulkCreate(transactions);

    console.log(`✅ Successfully seeded ${transactions.length} transaction reports`);
    
    // Show summary
    const summary = await TransactionReport.findAll({
      attributes: [
        'transactionType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount']
      ],
      group: ['transactionType'],
      raw: true
    });

    console.log('\n📊 Transaction Summary:');
    summary.forEach(item => {
      console.log(`  ${item.transactionType}: ${item.count} transactions, ₹${parseFloat(item.totalAmount).toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error seeding transaction reports:', error);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedTransactionReports()
    .then(() => {
      console.log('🎉 Transaction reports seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedTransactionReports;
