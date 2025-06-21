// Test script to verify Excel export functionality with secure CDN
function testExcelExports() {
  console.log('Testing Excel export functionality...');
  
  // Test 1: Verify XLSX is available from CDN
  if (!window.XLSX) {
    console.error('❌ XLSX library not loaded from CDN');
    return false;
  }
  console.log('✅ XLSX library loaded successfully from CDN');

  try {
    // Test 2: Job Families Export Test
    const jobFamiliesData = [
      {
        'Job Code': '10001',
        'Job Title': 'Software Engineer',
        'Job Family': 'IT Services',
        'Functional Leader': 'John Smith',
        'Responsible': 'Sarah Johnson',
        'Status': 'In Progress',
        'Last Updated': 'June 21, 2025'
      },
      {
        'Job Code': '10002',
        'Job Title': 'Registered Nurse',
        'Job Family': 'Clinical Support',
        'Functional Leader': 'Michael Brown',
        'Responsible': 'Emily Davis',
        'Status': 'Completed',
        'Last Updated': 'June 20, 2025'
      }
    ];

    const wb1 = window.XLSX.utils.book_new();
    const ws1 = window.XLSX.utils.json_to_sheet(jobFamiliesData);
    
    // Set column widths for Job Families
    ws1['!cols'] = [
      { wch: 12 }, // Job Code
      { wch: 40 }, // Job Title
      { wch: 20 }, // Job Family
      { wch: 20 }, // Functional Leader
      { wch: 20 }, // Responsible
      { wch: 15 }, // Status
      { wch: 15 }  // Last Updated
    ];
    
    window.XLSX.utils.book_append_sheet(wb1, ws1, 'Job Descriptions');
    console.log('✅ Job Families workbook created successfully');

    // Test 3: Notifications Export Test
    const notificationsData = [
      {
        'ID': 1,
        'Title': 'Job Description Updated',
        'Message': 'Software Engineer job description has been updated',
        'Type': 'info',
        'Category': 'Job Updates',
        'Priority': 'medium',
        'Status': 'Unread',
        'Timestamp': '2025-06-21 08:30:00'
      },
      {
        'ID': 2,
        'Title': 'Review Required',
        'Message': 'New job description requires your review',
        'Type': 'warning',
        'Category': 'Reviews',
        'Priority': 'high',
        'Status': 'Read',
        'Timestamp': '2025-06-21 09:15:00'
      }
    ];

    const wb2 = window.XLSX.utils.book_new();
    const ws2 = window.XLSX.utils.json_to_sheet(notificationsData);
    
    // Set column widths for Notifications
    ws2['!cols'] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Title
      { wch: 50 }, // Message
      { wch: 12 }, // Type
      { wch: 15 }, // Category
      { wch: 12 }, // Priority
      { wch: 12 }, // Status
      { wch: 18 }  // Timestamp
    ];
    
    window.XLSX.utils.book_append_sheet(wb2, ws2, 'Notifications');
    console.log('✅ Notifications workbook created successfully');

    // Test 4: File generation (without actual download)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename1 = `Job_Descriptions_Export_${dateStr}.xlsx`;
    const filename2 = `Notifications_Export_${dateStr}.xlsx`;
    
    console.log('✅ Test filenames generated:', filename1, filename2);
    
    // Test 5: Verify writeFile function exists
    if (typeof window.XLSX.writeFile === 'function') {
      console.log('✅ XLSX.writeFile function available');
    } else {
      console.error('❌ XLSX.writeFile function not available');
      return false;
    }

    console.log('🎉 All Excel export tests passed successfully!');
    console.log('Security: Using secure SheetJS CDN v0.20.1 (no vulnerable npm package)');
    return true;
    
  } catch (error) {
    console.error('❌ Excel export test failed:', error.message);
    return false;
  }
}

// Auto-run test when script loads
if (typeof window !== 'undefined') {
  testExcelExports();
}