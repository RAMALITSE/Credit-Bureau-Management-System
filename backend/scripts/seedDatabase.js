// backend/scripts/seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const CreditProfile = require('../src/models/CreditProfile');
const CreditAccount = require('../src/models/CreditAccount');
const Inquiry = require('../src/models/Inquiry');
const PublicRecord = require('../src/models/PublicRecord');
const Collection = require('../src/models/Collection');
const Report = require('../src/models/Report');
const Dispute = require('../src/models/Dispute');

// Sample data
const sampleData = {
  // Sample users
  users: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      phoneNumber: '123-456-7890',
      dateOfBirth: '1985-05-15',
      nationalId: 'ABC123456',
      userType: 'consumer',
      address: {
        street: '123 Main St',
        city: 'Maseru',
        state: 'Maseru',
        postalCode: '100',
        country: 'Lesotho'
      },
      employmentInfo: {
        employer: 'ABC Company',
        position: 'Manager',
        yearEmployed: 2019,
        monthlyIncome: 5000
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'Password123!',
      phoneNumber: '234-567-8901',
      dateOfBirth: '1990-08-20',
      nationalId: 'DEF789012',
      userType: 'consumer',
      address: {
        street: '456 Oak Ave',
        city: 'Maseru',
        state: 'Maseru',
        postalCode: '101',
        country: 'Lesotho'
      },
      employmentInfo: {
        employer: 'XYZ Corporation',
        position: 'Developer',
        yearEmployed: 2020,
        monthlyIncome: 4500
      }
    },
    {
      firstName: 'First',
      lastName: 'Bank',
      email: 'first.bank@example.com',
      password: 'Password123!',
      phoneNumber: '345-678-9012',
      dateOfBirth: '1975-03-10',
      nationalId: 'GHI345678',
      userType: 'lender',
      address: {
        street: '789 Finance St',
        city: 'Maseru',
        state: 'Maseru',
        postalCode: '100',
        country: 'Lesotho'
      }
    }
  ]
};

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Clear all existing data
    await User.deleteMany({ userType: { $ne: 'admin' } }); // Preserve admin users
    await CreditProfile.deleteMany({});
    await CreditAccount.deleteMany({});
    await Inquiry.deleteMany({});
    await PublicRecord.deleteMany({});
    await Collection.deleteMany({});
    await Report.deleteMany({});
    await Dispute.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const users = [];
    for (const userData of sampleData.users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash: hashedPassword,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        nationalId: userData.nationalId,
        userType: userData.userType,
        address: userData.address,
        employmentInfo: userData.userType === 'consumer' ? userData.employmentInfo : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
      
      users.push(user);
      
      // Create credit profile for consumers
      if (userData.userType === 'consumer') {
        const profile = await CreditProfile.create({
          userId: user._id,
          nationalId: user.nationalId,
          creditScore: Math.floor(Math.random() * (850 - 580)) + 580, // Random score between 580-850
          scoreHistory: [
            {
              score: Math.floor(Math.random() * (850 - 580)) + 580,
              calculatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
            },
            {
              score: Math.floor(Math.random() * (850 - 580)) + 580,
              calculatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
            },
            {
              score: Math.floor(Math.random() * (850 - 580)) + 580,
              calculatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            }
          ],
          status: 'active',
          fraudAlert: false,
          lastUpdated: new Date()
        });
        
        console.log(`Created credit profile for ${user.firstName} ${user.lastName}`);
      }
    }
    
    // Create credit accounts
    const lender = users.find(user => user.userType === 'lender');
    
    for (const user of users) {
      if (user.userType === 'consumer') {
        const profile = await CreditProfile.findOne({ userId: user._id });
        
        // Create a credit card account
        await CreditAccount.create({
          profileId: profile._id,
          accountType: 'credit_card',
          lenderId: lender._id,
          lenderName: `${lender.firstName} ${lender.lastName}`,
          accountNumber: `XXXX-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
          openDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
          creditLimit: 5000,
          currentBalance: 1500,
          paymentHistory: [
            {
              dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              amountDue: 100,
              amountPaid: 100,
              datePaid: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
              status: 'on_time',
              reportedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000)
            },
            {
              dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              amountDue: 150,
              amountPaid: 150,
              datePaid: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
              status: 'on_time',
              reportedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
            }
          ],
          status: 'current',
          lastReportDate: new Date()
        });
        
        // Create a loan account
        await CreditAccount.create({
          profileId: profile._id,
          accountType: 'loan',
          lenderId: lender._id,
          lenderName: `${lender.firstName} ${lender.lastName}`,
          accountNumber: `LOAN-${Math.floor(10000 + Math.random() * 90000)}`,
          openDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
          originalAmount: 10000,
          currentBalance: 6000,
          paymentHistory: [
            {
              dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              amountDue: 500,
              amountPaid: 500,
              datePaid: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
              status: 'on_time',
              reportedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000)
            },
            {
              dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              amountDue: 500,
              amountPaid: 500,
              datePaid: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
              status: 'on_time',
              reportedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
            }
          ],
          status: 'current',
          lastReportDate: new Date()
        });
        
        console.log(`Created accounts for ${user.firstName} ${user.lastName}`);
        
        // Create inquiries
        await Inquiry.create({
          profileId: profile._id,
          inquiringEntity: {
            id: lender._id,
            name: `${lender.firstName} ${lender.lastName}`
          },
          inquiryType: 'hard',
          inquiryPurpose: 'new_credit',
          inquiryDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          expiresAt: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000) // 2 years from now
        });
        
        console.log(`Created inquiries for ${user.firstName} ${user.lastName}`);
        
        // Generate a credit report
        const accounts = await CreditAccount.find({ profileId: profile._id });
        const inquiries = await Inquiry.find({ profileId: profile._id });
        
        await Report.create({
          profileId: profile._id,
          requestedBy: user._id,
          generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          reportType: 'full',
          reportFormat: 'json',
          reportData: {
            personalInfo: {
              name: `${user.firstName} ${user.lastName}`,
              address: user.address,
              dateOfBirth: user.dateOfBirth,
              nationalId: user.nationalId
            },
            creditScore: profile.creditScore,
            accounts: accounts.map(account => ({
              lenderName: account.lenderName,
              accountType: account.accountType,
              accountStatus: account.status,
              openDate: account.openDate,
              lastReportDate: account.lastReportDate,
              currentBalance: account.currentBalance,
              paymentHistory: account.paymentHistory
            })),
            inquiries: inquiries.map(inquiry => ({
              inquiringEntity: inquiry.inquiringEntity.name,
              inquiryType: inquiry.inquiryType,
              inquiryPurpose: inquiry.inquiryPurpose,
              inquiryDate: inquiry.inquiryDate
            })),
            publicRecords: [],
            collections: []
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          accessToken: require('crypto').randomBytes(20).toString('hex'),
          accessLog: [
            {
              userId: user._id,
              accessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              ipAddress: '127.0.0.1'
            }
          ]
        });
        
        console.log(`Created report for ${user.firstName} ${user.lastName}`);
      }
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the function
seedDatabase();