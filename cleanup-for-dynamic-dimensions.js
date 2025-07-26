const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAid5pJTNJ7BPXSIee2czPC5epvIHB4Kr4",
  authDomain: "crewzen.firebaseapp.com",
  projectId: "crewzen",
  storageBucket: "crewzen.firebasestorage.app",
  messagingSenderId: "274536388714",
  appId: "1:274536388714:web:7e3d7b6b5d73c220cb5213"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupForDynamicDimensions() {
  console.log('🚀 Starting cleanup for Dynamic Dimensions...\n');

  try {
    // 1. Clean up workers
    console.log('📋 Cleaning up workers...');
    const workersSnapshot = await getDocs(collection(db, 'connectZenWorkers'));
    let workerCount = 0;
    for (const workerDoc of workersSnapshot.docs) {
      await deleteDoc(doc(db, 'connectZenWorkers', workerDoc.id));
      workerCount++;
    }
    console.log(`✅ Removed ${workerCount} workers`);

    // 2. Clean up employees
    console.log('👥 Cleaning up employees...');
    const employeesSnapshot = await getDocs(collection(db, 'crewZenEmployees'));
    let employeeCount = 0;
    for (const employeeDoc of employeesSnapshot.docs) {
      await deleteDoc(doc(db, 'crewZenEmployees', employeeDoc.id));
      employeeCount++;
    }
    console.log(`✅ Removed ${employeeCount} employees`);

    // 3. Clean up projects
    console.log('🏗️ Cleaning up projects...');
    const projectsSnapshot = await getDocs(collection(db, 'crewZenProjects'));
    let projectCount = 0;
    for (const projectDoc of projectsSnapshot.docs) {
      await deleteDoc(doc(db, 'crewZenProjects', projectDoc.id));
      projectCount++;
    }
    console.log(`✅ Removed ${projectCount} projects`);

    // 4. Clean up tasks
    console.log('📝 Cleaning up tasks...');
    const tasksSnapshot = await getDocs(collection(db, 'crewZenTasks'));
    let taskCount = 0;
    for (const taskDoc of tasksSnapshot.docs) {
      await deleteDoc(doc(db, 'crewZenTasks', taskDoc.id));
      taskCount++;
    }
    console.log(`✅ Removed ${taskCount} tasks`);

    // 5. Clean up attendance records
    console.log('⏰ Cleaning up attendance records...');
    const attendanceSnapshot = await getDocs(collection(db, 'crewZenAttendance'));
    let attendanceCount = 0;
    for (const attendanceDoc of attendanceSnapshot.docs) {
      await deleteDoc(doc(db, 'crewZenAttendance', attendanceDoc.id));
      attendanceCount++;
    }
    console.log(`✅ Removed ${attendanceCount} attendance records`);

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Workers removed: ${workerCount}`);
    console.log(`   - Employees removed: ${employeeCount}`);
    console.log(`   - Projects removed: ${projectCount}`);
    console.log(`   - Tasks removed: ${taskCount}`);
    console.log(`   - Attendance records removed: ${attendanceCount}`);
    console.log('\n✨ Your database is now ready for Dynamic Dimensions!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupForDynamicDimensions(); 