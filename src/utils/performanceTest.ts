// import { modelService } from '../services/model.service';
// import { nativeModelService } from '../services/nativeModel.service';

// export const performanceTest = async () => {
//     console.log('🚀 Starting Performance Test: Mongoose vs Native MongoDB Driver\n');
    
//     const testData = {
//         name: "PerformanceTest",
//         startRpmNumber: 100,
//         endRpmNumber: 150, // 50 RPMs for testing
//         points: Array.from({ length: 1000 }, (_, i) => ({
//             x: i,
//             y: Math.random() * 100,
//             z: Math.random() * 100
//         }))
//     };

//     // Test Mongoose
//     console.log('📊 Testing Mongoose Performance...');
//     const mongooseStart = Date.now();
//     try {
//         const mongooseModel = await modelService.addModel(testData);
//         const mongooseTime = Date.now() - mongooseStart;
//         console.log(`✅ Mongoose completed in ${mongooseTime}ms`);
        
//         // Clean up
//         await modelService.deleteModel({ modelId: mongooseModel._id });
        
//         // Wait a bit before next test
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//     } catch (error) {
//         console.error('❌ Mongoose test failed:', error);
//     }

//     // Test Native Driver
//     console.log('\n📊 Testing Native MongoDB Driver Performance...');
//     const nativeStart = Date.now();
//     try {
//         const nativeModel = await nativeModelService.addModel(testData);
//         const nativeTime = Date.now() - nativeStart;
//         console.log(`✅ Native Driver completed in ${nativeTime}ms`);
        
//         // Clean up
//         await nativeModelService.deleteModel({ modelId: nativeModel._id });
        
//     } catch (error) {
//         console.error('❌ Native Driver test failed:', error);
//     }

//     console.log('\n🎯 Performance Test Complete!');
// };

// // Run test if executed directly
// if (require.main === module) {
//     performanceTest().then(() => {
//         process.exit(0);
//     }).catch((error) => {
//         console.error('Performance test failed:', error);
//         process.exit(1);
//     });
// } 