import dotenv from 'dotenv';
import SchoolBranch from '../models/SchoolBranch.js';

dotenv.config();

export const seedSchoolBranches = async () => {
  try {
    const count = await SchoolBranch.countDocuments();
    if (count === 0) {
      await SchoolBranch.insertMany([
        {
          name: 'Banani School, Dhaka',
          location: 'Road 11, Block D, Banani, Dhaka',
          district: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-banani/viewform',
          secondaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-secondary-banani/viewform',
          description: 'Flagship English-medium community school branch educating over 450 underprivileged students in central Dhaka.',
          status: 'active',
        },
        {
          name: 'Rayer Bazar School, Dhaka',
          location: 'Rayer Bazar Embankment, Dhanmondi, Dhaka',
          district: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-rayerbazar/viewform',
          secondaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-secondary-rayerbazar/viewform',
          description: 'Largest slum-impact branch with modern computer labs, teacher training center, and midday meal facilities.',
          status: 'active',
        },
        {
          name: 'Chattogram Coastal Branch',
          location: 'Bayezid Bostami Road, Chattogram',
          district: 'Chattogram',
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-ctg/viewform',
          secondaryFormUrl: '', // Missing on purpose to test conditional rendering!
          description: 'Dedicated primary education campus serving children of garment workers and port laborers.',
          status: 'active',
        },
        {
          name: 'Dinajpur Rural School',
          location: 'Kaharole, Dinajpur District',
          district: 'Dinajpur',
          image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-dinajpur/viewform',
          secondaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-secondary-dinajpur/viewform',
          description: 'Empowering first-generation indigenous and rural agrarian scholars in northern Bangladesh.',
          status: 'active',
        },
        {
          name: 'Bandarban Hill Tracts Branch',
          location: 'Ruma Upazila, Bandarban',
          district: 'Bandarban',
          image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-bandarban/viewform',
          secondaryFormUrl: '', // Missing secondary on purpose to test conditional rendering!
          description: 'Solar-powered remote learning branch bridging educational accessibility in the Chittagong Hill Tracts.',
          status: 'active',
        },
        {
          name: 'Habiganj Haor School',
          location: 'Nabiganj, Habiganj District, Sylhet Division',
          district: 'Habiganj',
          image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
          primaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-primary-habiganj/viewform',
          secondaryFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-secondary-habiganj/viewform',
          description: 'Flood-resilient community school providing year-round primary & junior secondary learning.',
          status: 'active',
        },
      ]);
      console.log('[SchoolSeed] Seeded foundational school branches with Google Form tracks.');
    }
  } catch (error) {
    console.error('[SchoolSeed Error]:', error.message);
  }
};

export default seedSchoolBranches;
