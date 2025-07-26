
"use client";
// Force refresh 2025-07-26
import React, { useState, useEffect } from 'react';
import WorkersTab from '@/app/(modules)/connectzen/components/tabs/WorkersTab';
import CompaniesTab from '@/app/(modules)/connectzen/components/tabs/CompaniesTab';
import SuppliersTab from '@/app/(modules)/connectzen/components/tabs/SuppliersTab';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TABS = [
  { key: 'workers', label: 'Workers' },
  { key: 'companies', label: 'Companies' },
  { key: 'suppliers', label: 'Suppliers' },
];

const mockSuppliers = [
  { id: '1', name: 'SupplyPro', logoUrl: '', services: ['Cement', 'Bricks'], location: { city: 'Port Elizabeth', province: 'Eastern Cape' }, description: 'Top building materials supplier.' },
  { id: '2', name: 'Tools4U', logoUrl: '', services: ['Tools', 'Equipment'], location: { city: 'Bloemfontein', province: 'Free State' }, description: 'All your tool needs.' },
];

const BusinessMarketplacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workers');
  const [workers, setWorkers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [suppliers] = useState<any[]>(mockSuppliers);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingSuppliers] = useState(false); // mock data, not loading
  const [workerSearch, setWorkerSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        // Show all workers by default - workers can opt-out by setting isPublic: false
        const q = query(collection(db, 'workerProfiles'));
        const snapshot = await getDocs(q);
        const workersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter out workers who explicitly set isPublic: false
        const visibleWorkers = workersData.filter((worker: any) => worker.isPublic !== false);
        
        console.log(`Total workers: ${workersData.length}, Visible workers: ${visibleWorkers.length}`);
        setWorkers(visibleWorkers);
      } catch (error) {
        console.error('Error fetching workers:', error);
        setWorkers([]);
      }
      setLoadingWorkers(false);
    };
    fetchWorkers();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const q = query(collection(db, 'connectZenCompanies'), where('isPublic', '==', true));
      const snapshot = await getDocs(q);
      const companiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companiesData);
      setLoadingCompanies(false);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Business Marketplace</h1>
        <div className="flex gap-4 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex-1 px-4 py-2 rounded-t-md transition-colors duration-200 
                ${activeTab === tab.key 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-neutral-800 text-gray-300 hover:text-white'}
              `}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          {activeTab === 'workers' && (
            <WorkersTab
              workers={workers}
              loading={loadingWorkers}
              searchTerm={workerSearch}
              onSearch={setWorkerSearch}
            />
          )}
          {activeTab === 'companies' && (
            <CompaniesTab
              companies={companies}
              loading={loadingCompanies}
              searchTerm={companySearch}
              onSearch={setCompanySearch}
            />
          )}
          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              loading={loadingSuppliers}
              searchTerm={supplierSearch}
              onSearch={setSupplierSearch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessMarketplacePage;