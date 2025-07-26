const admin = require('firebase-admin');

// Initialize Firebase Admin using the existing configuration
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'crewzen'
  });
}

const db = admin.firestore();

async function fixAdminRole() {
  console.log('🔧 Fixing admin role issue...');
  
  try {
    // Your UID (replace with your actual UID)
    const yourUid = 'Vqh1PQ2NSCzjirt1qADaALbYYYh2'; // Dynamic Dimensions UID
    
    // Check if you exist as a company
    const companyDocRef = db.collection('connectZenCompanies').doc(yourUid);
    const companyDoc = await companyDocRef.get();
    
    if (companyDoc.exists) {
      const companyData = companyDoc.data();
      console.log('Current company data:', companyData);
      
      // Update the role to 'admin' instead of 'company'
      await companyDocRef.update({
        role: 'admin',
        userRole: 'admin' // Add this field as well
      });
      
      console.log('✅ Successfully updated role to admin');
      console.log('Now when you sign in, you should see all employees (admin view)');
    } else {
      console.log('❌ Company document not found');
    }
    
  } catch (error) {
    console.error('Error fixing admin role:', error);
  }
}

fixAdminRole(); 