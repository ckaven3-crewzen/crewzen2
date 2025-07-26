import type { Project } from '@/lib/types';
import { db } from './firebase';
import { setDoc, doc } from 'firebase/firestore';
import type { WorkerProfile } from './types';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Downtown Office Building',
    status: 'In Progress',
  },
  {
    id: 'p2',
    name: 'Suburb Residential Complex',
    status: 'In Progress',
  },
  {
    id: 'p3',
    name: 'City Mall Renovation',
    status: 'Completed',
  },
  {
    id: 'p4',
    name: 'Coastal Bridge Construction',
    status: 'On Hold',
  },
    {
    id: 'p5',
    name: 'Highway Expansion Project',
    status: 'In Progress',
  },
  {
    id: 'p6',
    name: 'Greenwood Park Development',
    status: 'Completed',
  },
];

export async function generateImaginaryWorkers() {
  const names = [
    ['John', 'Smith'], ['Mary', 'Johnson'], ['David', 'Brown'], ['Linda', 'Williams'], ['James', 'Jones'],
    ['Patricia', 'Garcia'], ['Robert', 'Miller'], ['Jennifer', 'Davis'], ['Michael', 'Martinez'], ['Elizabeth', 'Lopez']
  ];
  const cities = ['Durban', 'Cape Town', 'Johannesburg', 'Pretoria', 'Port Elizabeth'];
  const provinces = ['KwaZulu-Natal', 'Western Cape', 'Gauteng', 'Gauteng', 'Eastern Cape'];
  const trades = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'General Labor'];
  for (let i = 0; i < 10; i++) {
    const id = `testworker${i+1}`;
    const [firstName, lastName] = names[i];
    const city = cities[i % cities.length];
    const province = provinces[i % provinces.length];
    const trade = trades[i % trades.length];
    const worker: WorkerProfile = {
      id,
      firstName,
      lastName,
      phone: `+27 60 000 00${i+1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      photoUrl: '',
      idNumber: `900101000${i+1}`,
      idCopyUrl: '',
      medicalCertificateUrl: '',
      availability: 'available',
      currentEmployerId: '',
      currentProjectId: '',
      skills: [{ name: trade, level: 'intermediate', yearsExperience: 2 + i, verified: true }],
      tradeTags: [trade],
      yearsExperience: 2 + i,
      preferredRate: 100 + i * 10,
      bio: `Experienced ${trade.toLowerCase()} worker.`,
      location: { city, province },
      willingToTravel: true,
      maxTravelDistance: 50,
      ratings: [],
      averageRating: 4.0 + (i % 2) * 0.5,
      totalRatings: 5 + i,
      workHistory: [],
      portfolio: [],
      isVerified: true,
      verificationDocuments: { idCopy: true, medicalCertificate: false },
      isPublic: true,
      allowDirectContact: true,
      autoAcceptJobs: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActive: Date.now(),
    };
    await setDoc(doc(db, 'workerProfiles', id), worker);
  }
}
