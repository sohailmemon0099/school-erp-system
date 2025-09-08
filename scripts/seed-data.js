const { 
  User, 
  Student, 
  Teacher, 
  Class, 
  Subject, 
  Attendance, 
  Grade, 
  Fee 
} = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample classes
    const class1 = await Class.create({
      name: 'Grade 1',
      section: 'A',
      capacity: 30,
      academicYear: '2024-2025',
      description: 'First grade class A'
    });

    const class2 = await Class.create({
      name: 'Grade 2',
      section: 'A',
      capacity: 30,
      academicYear: '2024-2025',
      description: 'Second grade class A'
    });

    console.log('✅ Sample classes created');

    // Create sample subjects
    const math = await Subject.create({
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Basic mathematics for primary students',
      credits: 4
    });

    const english = await Subject.create({
      name: 'English',
      code: 'ENG101',
      description: 'English language and literature',
      credits: 4
    });

    const science = await Subject.create({
      name: 'Science',
      code: 'SCI101',
      description: 'General science for primary students',
      credits: 3
    });

    console.log('✅ Sample subjects created');

    // Create sample teacher users
    const teacher1User = await User.create({
      email: 'teacher1@school.com',
      password: await bcrypt.hash('teacher123', 12),
      firstName: 'John',
      lastName: 'Smith',
      role: 'teacher',
      phone: '1234567891',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      isActive: true
    });

    const teacher2User = await User.create({
      email: 'teacher2@school.com',
      password: await bcrypt.hash('teacher123', 12),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'teacher',
      phone: '1234567892',
      dateOfBirth: '1988-08-20',
      gender: 'female',
      isActive: true
    });

    // Create sample teachers
    const teacher1 = await Teacher.create({
      userId: teacher1User.id,
      employeeId: 'T001',
      hireDate: '2020-01-15',
      qualification: 'M.Ed Mathematics',
      specialization: 'Mathematics',
      salary: 50000
    });

    const teacher2 = await Teacher.create({
      userId: teacher2User.id,
      employeeId: 'T002',
      hireDate: '2019-08-01',
      qualification: 'B.Ed English',
      specialization: 'English Literature',
      salary: 48000
    });

    console.log('✅ Sample teachers created');

    // Create sample student users
    const student1User = await User.create({
      email: 'student1@school.com',
      password: await bcrypt.hash('student123', 12),
      firstName: 'Alice',
      lastName: 'Brown',
      role: 'student',
      phone: '1234567893',
      dateOfBirth: '2015-03-10',
      gender: 'female',
      isActive: true
    });

    const student2User = await User.create({
      email: 'student2@school.com',
      password: await bcrypt.hash('student123', 12),
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'student',
      phone: '1234567894',
      dateOfBirth: '2015-07-22',
      gender: 'male',
      isActive: true
    });

    // Create sample students
    const student1 = await Student.create({
      userId: student1User.id,
      studentId: 'S001',
      admissionDate: '2024-01-15',
      classId: class1.id,
      parentName: 'Robert Brown',
      parentPhone: '1234567895',
      parentEmail: 'robert.brown@email.com',
      emergencyContact: '1234567896',
      medicalInfo: 'No known allergies'
    });

    const student2 = await Student.create({
      userId: student2User.id,
      studentId: 'S002',
      admissionDate: '2024-01-15',
      classId: class1.id,
      parentName: 'Mary Wilson',
      parentPhone: '1234567897',
      parentEmail: 'mary.wilson@email.com',
      emergencyContact: '1234567898',
      medicalInfo: 'Asthma - inhaler required'
    });

    console.log('✅ Sample students created');

    // Create sample attendance records
    const today = new Date().toISOString().split('T')[0];
    
    await Attendance.create({
      studentId: student1.id,
      classId: class1.id,
      subjectId: math.id,
      date: today,
      status: 'present',
      remarks: 'On time'
    });

    await Attendance.create({
      studentId: student2.id,
      classId: class1.id,
      subjectId: math.id,
      date: today,
      status: 'present',
      remarks: 'On time'
    });

    console.log('✅ Sample attendance records created');

    // Create sample grades
    await Grade.create({
      studentId: student1.id,
      subjectId: math.id,
      examType: 'Mid-term',
      marks: 85,
      maxMarks: 100,
      examDate: '2024-10-15',
      remarks: 'Good performance'
    });

    await Grade.create({
      studentId: student2.id,
      subjectId: math.id,
      examType: 'Mid-term',
      marks: 92,
      maxMarks: 100,
      examDate: '2024-10-15',
      remarks: 'Excellent work'
    });

    console.log('✅ Sample grades created');

    // Create sample fees
    await Fee.create({
      studentId: student1.id,
      feeType: 'Tuition Fee',
      amount: 5000,
      dueDate: '2024-12-31',
      academicYear: '2024-2025',
      description: 'Annual tuition fee',
      status: 'pending'
    });

    await Fee.create({
      studentId: student2.id,
      feeType: 'Tuition Fee',
      amount: 5000,
      dueDate: '2024-12-31',
      academicYear: '2024-2025',
      description: 'Annual tuition fee',
      status: 'paid',
      paymentDate: '2024-01-15',
      paymentMethod: 'bank_transfer'
    });

    console.log('✅ Sample fees created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log('- 2 Classes created');
    console.log('- 3 Subjects created');
    console.log('- 2 Teachers created');
    console.log('- 2 Students created');
    console.log('- Sample attendance, grades, and fees created');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher 1: teacher1@school.com / teacher123');
    console.log('Teacher 2: teacher2@school.com / teacher123');
    console.log('Student 1: student1@school.com / student123');
    console.log('Student 2: student2@school.com / student123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = seedDatabase;
