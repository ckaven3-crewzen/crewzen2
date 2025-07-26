const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'crewzen'
});

const db = admin.firestore();

async function fixCompanyIds() {
  console.log('Starting to fix company IDs for employees...');
  
  try {
    // Get all employees
    const employeesSnapshot = await db.collection('employees').get();
    console.log(`Found ${employeesSnapshot.size} employees`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const docSnap of employeesSnapshot.docs) {
      const data = docSnap.data();
      const employeeId = docSnap.id;
      
      // Check if employee has companyId
      if (!data.companyId) {
        // Try to determine the company ID based on the company number
        let companyId = null;
        
        if (data.companyNumber && data.companyNumber.startsWith('cz-')) {
          // This is likely a ConnectZen employee, we need to find the company
          // For now, we'll set it to a default or you can specify the company ID
          console.log(`Employee ${employeeId} (${data.firstName} ${data.lastName}) has no companyId`);
          console.log(`Company number: ${data.companyNumber}`);
          
          // You can set a specific company ID here or leave it null
          // companyId = 'YOUR_COMPANY_ID_HERE';
        }
        
        if (companyId) {
          await db.collection('employees').doc(employeeId).update({
            companyId: companyId
          });
          updated++;
          console.log(`Updated employee ${employeeId} with companyId: ${companyId}`);
        } else {
          skipped++;
          console.log(`Skipped employee ${employeeId} - no companyId determined`);
        }
      } else {
        skipped++;
        console.log(`Employee ${employeeId} already has companyId: ${data.companyId}`);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`Updated: ${updated} employees`);
    console.log(`Skipped: ${skipped} employees`);
    
  } catch (error) {
    console.error('Error fixing company IDs:', error);
  }
  
  process.exit(0);
}

fixCompanyIds(); 