'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { signOut as firebaseSignOut } from 'firebase/auth';

const tradeOptions = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'General Labor'];
const availabilityOptions = ['available', 'working', 'busy', 'not_looking'];

export default function CompleteProfilePage() {
  const { user, auth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    availability: '',
    tradeTags: [] as string[],
    skills: '',
    yearsExperience: '',
    preferredRate: '',
    bio: '',
    city: '',
    province: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sign out button logic
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      setError('Could not sign out.');
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleTradeChange = (trade: string) => {
    setForm(f => ({ ...f, tradeTags: f.tradeTags.includes(trade) ? f.tradeTags.filter(t => t !== trade) : [...f.tradeTags, trade] }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const workerProfileRef = doc(db, 'workerProfiles', user.uid);
      const existing = await getDoc(workerProfileRef);
      const profileData = existing.exists() ? existing.data() : {};
      await setDoc(workerProfileRef, {
        ...profileData,
        id: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        availability: form.availability,
        tradeTags: form.tradeTags,
        skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        yearsExperience: Number(form.yearsExperience),
        preferredRate: Number(form.preferredRate),
        bio: form.bio,
        location: { city: form.city, province: form.province },
        isPublic: true,
        updatedAt: Date.now(),
      }, { merge: true });
      router.push('/connectzen/businessMarketplacePage');
    } catch (err: any) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 relative">
      {/* Sign Out Button (top right) */}
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
      >
        Sign Out
      </button>
      <h1 className="text-2xl font-bold mb-6">Complete Your Public Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded shadow">
        <div>
          <label className="block font-semibold mb-1">Availability</label>
          <select name="availability" value={form.availability} onChange={handleChange} className="w-full p-2 rounded border">
            <option value="">Select availability</option>
            {availabilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Trade Tags</label>
          <div className="flex flex-wrap gap-2">
            {tradeOptions.map(trade => (
              <button
                type="button"
                key={trade}
                className={`px-3 py-1 rounded border ${form.tradeTags.includes(trade) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                onClick={() => handleTradeChange(trade)}
              >
                {trade}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Skills (comma separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange} className="w-full p-2 rounded border" placeholder="e.g. Pipe Fitting, Wiring" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Years Experience</label>
          <input name="yearsExperience" type="number" value={form.yearsExperience} onChange={handleChange} className="w-full p-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preferred Rate (R/hr)</label>
          <input name="preferredRate" type="number" value={form.preferredRate} onChange={handleChange} className="w-full p-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full p-2 rounded border" rows={3} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-semibold mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Province</label>
            <input name="province" value={form.province} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
} 