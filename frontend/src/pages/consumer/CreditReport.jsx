// frontend/src/pages/consumer/CreditReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CreditReport = () => {
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/my-reports`);
      setReports(response.data.data.reports);
      
      // Set the most recent report as current if available
      if (response.data.data.reports.length > 0) {
        setCurrentReport(response.data.data.reports[0]);
      }
    } catch (err) {
      setError('Failed to load credit reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reports/generate`, {
        reportType: 'full'
      });
      
      // Add the new report to the list and set as current
      setReports([response.data.data.report, ...reports]);
      setCurrentReport(response.data.data.report);
    } catch (err) {
      setError('Failed to generate credit report');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Credit Report</h1>
        <button
          onClick={generateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={generating}
        >
          {generating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate New Report'
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">My Reports</h2>
          
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports generated yet</p>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => setCurrentReport(report)}
                  className={`w-full text-left p-3 rounded ${
                    currentReport?._id === report._id 
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">
                    {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:col-span-3">
          {currentReport ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {currentReport.reportType.charAt(0).toUpperCase() + currentReport.reportType.slice(1)} Credit Report
                  </h2>
                  <div className="text-sm text-gray-600">
                    Generated on {new Date(currentReport.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div>{currentReport.reportData.personalInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Address</div>
                      <div>{currentReport.reportData.personalInfo.address.street}</div>
                      <div>
                        {currentReport.reportData.personalInfo.address.city}, {currentReport.reportData.personalInfo.address.state} {currentReport.reportData.personalInfo.address.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Credit Score</h3>
                  <div className="flex items-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 mr-4">
                      <span className="text-2xl font-bold">
                        {currentReport.reportData.creditScore}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-lg">
                        {currentReport.reportData.scoreCategory}
                      </div>
                      <div className="text-sm text-gray-600">
                        Credit Score Range: 300-850
                      </div>
                      <Link to="/credit-score" className="text-blue-600 hover:text-blue-800 text-sm">
                        View Score Details
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Accounts ({currentReport.reportData.accounts.length})</h3>
                  {currentReport.reportData.accounts.length === 0 ? (
                    <p className="text-gray-500">No accounts on file</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Reported
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentReport.reportData.accounts.map((account, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {account.lenderName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {account.accountType.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  account.accountStatus === 'current' 
                                    ? 'bg-green-100 text-green-800'
                                    : account.accountStatus === 'closed'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {account.accountStatus.charAt(0).toUpperCase() + account.accountStatus.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${account.currentBalance.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(account.lastReportDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Inquiries ({currentReport.reportData.inquiries.length})</h3>
                  {currentReport.reportData.inquiries.length === 0 ? (
                    <p className="text-gray-500">No inquiries on file</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Inquiring Entity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentReport.reportData.inquiries.map((inquiry, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {inquiry.inquiringEntity}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  inquiry.inquiryType === 'hard' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {inquiry.inquiryType.charAt(0).toUpperCase() + inquiry.inquiryType.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {inquiry.inquiryPurpose.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(inquiry.inquiryDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Public Records ({currentReport.reportData.publicRecords.length})</h3>
                  {currentReport.reportData.publicRecords.length === 0 ? (
                    <p className="text-gray-500">No public records on file</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Court
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Filed Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentReport.reportData.publicRecords.map((record, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {record.recordType.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.courtName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(record.filedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  ['discharged', 'dismissed', 'satisfied'].includes(record.status)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${record.liabilityAmount ? record.liabilityAmount.toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Collections ({currentReport.reportData.collections.length})</h3>
                  {currentReport.reportData.collections.length === 0 ? (
                    <p className="text-gray-500">No collections on file</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Collection Agency
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Original Creditor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentReport.reportData.collections.map((collection, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {collection.collectionAgency}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {collection.originalCreditor}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${collection.currentAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  collection.status === 'active' 
                                    ? 'bg-red-100 text-red-800'
                                    : collection.status === 'disputed'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(collection.collectionDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Credit Report Available</h2>
              <p className="text-gray-600 mb-6">
                You haven't generated any credit reports yet. Generate your first report to view your credit information.
              </p>
              <button
                onClick={generateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditReport;