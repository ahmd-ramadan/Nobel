import { checkDatabaseHealth } from './dbConnection';
import { logger } from './index';

export const diagnoseConnection = async () => {
    console.log('🔍 Diagnosing MongoDB Atlas connection...\n');
    
    try {
        // Check if we can resolve the connection
        const isHealthy = await checkDatabaseHealth();
        
        if (isHealthy) {
            console.log('✅ Database connection is healthy');
        } else {
            console.log('❌ Database connection is not healthy');
        }
        
        // Additional diagnostics
        console.log('\n📊 Connection Status:');
        console.log('- Ready State:', require('mongoose').connection.readyState);
        console.log('- Host:', require('mongoose').connection.host);
        console.log('- Port:', require('mongoose').connection.port);
        console.log('- Name:', require('mongoose').connection.name);
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    }
};

// Run diagnostics if this file is executed directly
if (require.main === module) {
    diagnoseConnection().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    });
} 