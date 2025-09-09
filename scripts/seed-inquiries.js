const { sequelize } = require('../models');
const { Inquiry } = require('../models');

const seedInquiries = async () => {
  try {
    console.log('🌱 Seeding database with sample inquiries...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create sample inquiries
    const sampleInquiries = [
      {
        inquiryId: 'INQ001',
        studentFirstName: 'John',
        studentLastName: 'Doe',
        studentDateOfBirth: '2010-05-15',
        studentGender: 'male',
        studentBloodGroup: 'O+',
        studentPreviousSchool: 'ABC Elementary',
        studentPreviousClass: 'Grade 4',
        parentFirstName: 'Jane',
        parentLastName: 'Doe',
        parentPhone: '+1234567890',
        parentEmail: 'jane.doe@email.com',
        parentOccupation: 'Teacher',
        parentAddress: '123 Main St, City, State',
        emergencyContactName: 'Bob Smith',
        emergencyContactPhone: '+1234567891',
        emergencyContactRelation: 'Uncle',
        desiredClass: 'Grade 5',
        desiredAcademicYear: '2024-2025',
        preferredSubjects: 'Math, Science, English',
        inquirySource: 'website',
        inquiryNotes: 'Interested in STEM program',
        status: 'new',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: null
      },
      {
        inquiryId: 'INQ002',
        studentFirstName: 'Sarah',
        studentLastName: 'Johnson',
        studentDateOfBirth: '2009-08-22',
        studentGender: 'female',
        studentBloodGroup: 'A+',
        studentPreviousSchool: 'XYZ Middle School',
        studentPreviousClass: 'Grade 6',
        parentFirstName: 'Michael',
        parentLastName: 'Johnson',
        parentPhone: '+1234567892',
        parentEmail: 'michael.johnson@email.com',
        parentOccupation: 'Engineer',
        parentAddress: '456 Oak Ave, City, State',
        emergencyContactName: 'Lisa Johnson',
        emergencyContactPhone: '+1234567893',
        emergencyContactRelation: 'Aunt',
        desiredClass: 'Grade 7',
        desiredAcademicYear: '2024-2025',
        preferredSubjects: 'Art, Music, Literature',
        inquirySource: 'walk-in',
        inquiryNotes: 'Looking for arts-focused curriculum',
        status: 'follow-up',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedTo: null
      },
      {
        inquiryId: 'INQ003',
        studentFirstName: 'Alex',
        studentLastName: 'Brown',
        studentDateOfBirth: '2011-12-10',
        studentGender: 'male',
        studentBloodGroup: 'B+',
        studentPreviousSchool: 'Local Elementary',
        studentPreviousClass: 'Grade 3',
        parentFirstName: 'Emily',
        parentLastName: 'Brown',
        parentPhone: '+1234567894',
        parentEmail: 'emily.brown@email.com',
        parentOccupation: 'Doctor',
        parentAddress: '789 Pine St, City, State',
        emergencyContactName: 'David Brown',
        emergencyContactPhone: '+1234567895',
        emergencyContactRelation: 'Grandfather',
        desiredClass: 'Grade 4',
        desiredAcademicYear: '2024-2025',
        preferredSubjects: 'Science, Math, Sports',
        inquirySource: 'referral',
        inquiryNotes: 'Referred by current parent',
        status: 'admitted',
        followUpDate: null,
        assignedTo: null
      }
    ];

    // Clear existing inquiries
    await Inquiry.destroy({ where: {} });
    console.log('🗑️ Cleared existing inquiries');

    // Create new inquiries
    for (const inquiryData of sampleInquiries) {
      await Inquiry.create(inquiryData);
    }
    console.log('✅ Sample inquiries created');

    console.log('🎉 Inquiry seeding completed successfully!');
    console.log(`📊 Created ${sampleInquiries.length} sample inquiries`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await sequelize.close();
  }
};

seedInquiries();
