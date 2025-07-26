'use client';

import React from 'react';
import WorkerCard from '@/app/(modules)/connectzen/components/cards/WorkerCard';
import { WorkerProfile } from '@/lib/types';

// Simple mock worker data for testing
const mockWorker: WorkerProfile = {
  id: 'test-worker-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+27 123 456 789',
  photoUrl: '',
  availability: 'available',
  skills: [
    { name: 'Carpentry', level: 'expert', yearsExperience: 5, verified: true }
  ],
  tradeTags: ['Carpentry', 'Plumbing'],
  yearsExperience: 8,
  preferredRate: 450,
  bio: 'Experienced construction worker.',
  location: {
    city: 'Cape Town',
    province: 'Western Cape'
  },
  willingToTravel: true,
  ratings: [],
  averageRating: 4.5,
  totalRatings: 0,
  workHistory: [],
  portfolio: [],
  isVerified: true,
  verificationDocuments: {
    idCopy: true,
    medicalCertificate: true
  },
  isPublic: true,
  allowDirectContact: true,
  autoAcceptJobs: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastActive: Date.now()
};

export default function TestWorkerCardPage() {
  const handleViewProfile = () => {
    console.log('View Profile clicked');
    alert('View Profile clicked!');
  };

  const handleContact = () => {
    console.log('Contact clicked');
    alert('Contact clicked!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">WorkerCard Component Test</h1>
        <p className="text-muted-foreground mb-6">
          Testing the isolated WorkerCard component to diagnose the React error.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test 1: With all data */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 1: Full Data</h3>
          <WorkerCard 
            worker={mockWorker}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        </div>

        {/* Test 2: Without handlers */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Test 2: No Handlers</h3>
          <WorkerCard 
            worker={mockWorker}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p className="text-sm">
          • If you see this page, React is working<br/>
          • If WorkerCard renders above, the component is functional<br/>
          • If there's an error, check the browser console
        </p>
      </div>
    </div>
  );
}
