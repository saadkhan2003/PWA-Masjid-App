'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, Trash2, RefreshCw, Settings, CheckCircle } from 'lucide-react';
import { databaseCleanup, confirmCleanup, schemaVerification } from '@/lib/utils/database-cleanup';
import { supabase } from '@/lib/supabase/client';

export default function DeveloperToolsPage() {
  const [stats, setStats] = useState<any>(null);
  const [sampleData, setSampleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [schemaStatus, setSchemaStatus] = useState<any>(null);

  const checkDatabaseSchema = async () => {
    try {
      setLoading(true);
      // Check if debts table has required columns
      const { data, error } = await supabase.rpc('check_table_columns', {
        table_name: 'debts'
      });
      
      if (error) {
        // Fallback: try to insert a test debt to see what columns exist
        const testDebt = {
          member_id: '00000000-0000-0000-0000-000000000000',
          amount: 0,
          due_date: new Date().toISOString().split('T')[0],
          month: 1,
          year: 2024,
          type: 'monthly_dues',
          description: 'Schema test - will be deleted'
        };
        
        const { error: insertError } = await supabase
          .from('debts')
          .insert(testDebt);
        
        if (insertError) {
          if (insertError.message.includes('month')) {
            setSchemaStatus({
              hasRequiredColumns: false,
              missingColumns: ['month', 'year', 'type'],
              error: insertError.message
            });
          } else {
            setSchemaStatus({
              hasRequiredColumns: true,
              missingColumns: [],
              error: null
            });
          }
        } else {
          // Clean up test record
          await supabase.from('debts').delete().eq('description', 'Schema test - will be deleted');
          setSchemaStatus({
            hasRequiredColumns: true,
            missingColumns: [],
            error: null
          });
        }
      }
    } catch (error) {
      console.error('Error checking schema:', error);
      setMessage('Error checking database schema');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, sampleDataResult] = await Promise.all([
        databaseCleanup.checkDataStats(),
        databaseCleanup.getSampleData()
      ]);
      setStats(statsData);
      setSampleData(sampleDataResult);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading database information');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (action: 'all' | 'payments' | 'debts' | 'members' | 'mock') => {
    try {
      const confirmed = await confirmCleanup(action);
      if (!confirmed) return;

      setLoading(true);
      let result;

      switch (action) {
        case 'all':
          result = await databaseCleanup.clearAllData();
          break;
        case 'payments':
          result = await databaseCleanup.clearPayments();
          break;
        case 'debts':
          result = await databaseCleanup.clearDebts();
          break;
        case 'members':
          result = await databaseCleanup.clearMembers();
          break;
        case 'mock':
          result = await databaseCleanup.clearMockData();
          break;
      }

      setMessage(result.message);
      // Reload stats after cleanup
      await loadStats();
    } catch (error) {
      console.error('Cleanup error:', error);
      setMessage(`Error during cleanup: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSchema = async () => {
    try {
      setLoading(true);
      const status = await schemaVerification.checkDebtsSchema();
      setSchemaStatus(status);
      setMessage(status.message);
    } catch (error) {
      console.error('Schema check error:', error);
      setMessage('Error checking database schema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 sm:px-6 max-w-4xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Developer Tools</h1>
        <p className="text-gray-600">Database management and cleanup utilities</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">Warning: These tools can permanently delete data!</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* Database Schema Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Database Schema Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={checkDatabaseSchema} disabled={loading}>
              <CheckCircle className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check Database Schema
            </Button>

            {schemaStatus && (
              <div className={`p-4 rounded-lg ${schemaStatus.hasRequiredColumns ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {schemaStatus.hasRequiredColumns ? (
                  <div className="text-green-800">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle className="h-5 w-5" />
                      Database schema is correct!
                    </div>
                    <p className="text-sm mt-1">All required columns exist in the debts table.</p>
                  </div>
                ) : (
                  <div className="text-red-800">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="h-5 w-5" />
                      Database schema needs fixing!
                    </div>
                    <p className="text-sm mt-1">Missing columns: {schemaStatus.missingColumns.join(', ')}</p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 text-sm font-medium">To fix this issue:</p>
                      <ol className="text-yellow-700 text-sm mt-1 list-decimal list-inside">
                        <li>Open your Supabase dashboard</li>
                        <li>Go to SQL Editor</li>
                        <li>Run the migration script from: <code>database-fix-complete.sql</code></li>
                        <li>Refresh this page and check schema again</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Schema Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={checkSchema} disabled={loading} className="mb-4">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check Schema
            </Button>

            {schemaStatus && (
              <div className={`p-4 rounded-lg ${schemaStatus.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div className="font-medium">
                  {schemaStatus.valid ? '✅ Schema Valid' : '❌ Schema Invalid'}
                </div>
                <div className="text-sm mt-1">{schemaStatus.message}</div>
                {!schemaStatus.valid && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                    <strong>Fix Instructions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to your Supabase project dashboard</li>
                      <li>Open the SQL Editor</li>
                      <li>Run the contents of: <code>fix-debts-schema.sql</code></li>
                      <li>Come back and click "Check Schema" again</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={loadStats} disabled={loading} className="mb-4">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Load Current Stats'}
            </Button>

            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.members}</div>
                  <div className="text-sm text-blue-800">Members</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.payments}</div>
                  <div className="text-sm text-green-800">Payments</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.debts}</div>
                  <div className="text-sm text-purple-800">Debts</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      {sampleData && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Data Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Sample Members:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                {sampleData.members.slice(0, 3).map((member: any) => (
                  <div key={member.id}>{member.name} - {member.phone}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sample Payments:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                {sampleData.payments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id}>Amount: {payment.amount} - Date: {payment.payment_date}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cleanup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Database Cleanup Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => handleCleanup('mock')}
              disabled={loading}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              Clear Mock Data Only
            </Button>
            
            <Button
              onClick={() => handleCleanup('payments')}
              disabled={loading}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Clear All Payments
            </Button>
            
            <Button
              onClick={() => handleCleanup('debts')}
              disabled={loading}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Clear All Debts
            </Button>
            
            <Button
              onClick={() => handleCleanup('members')}
              disabled={loading}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Clear All Members
            </Button>
            
            <div className="sm:col-span-2">
              <Button
                onClick={() => handleCleanup('all')}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                Clear ALL Data (Complete Reset)
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Cleanup Options:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Mock Data Only:</strong> Removes entries with test/mock patterns in names</li>
              <li><strong>Clear Payments:</strong> Removes all payment records</li>
              <li><strong>Clear Debts:</strong> Removes all debt records</li>
              <li><strong>Clear Members:</strong> Removes all members (will also clear related payments/debts)</li>
              <li><strong>Complete Reset:</strong> Removes all data in proper order</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
