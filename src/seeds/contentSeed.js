import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import News from '../models/News.js';
import Initiative from '../models/Initiative.js';
import Report from '../models/Report.js';
import Career from '../models/Career.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedContent = async () => {
  try {
    // 1. Seed Initiatives
    const initiativeCount = await Initiative.countDocuments();
    if (initiativeCount === 0) {
      await Initiative.insertMany([
        {
          title: 'Digital Classrooms for Remote Bangladesh',
          slug: 'digital-classrooms-remote-bangladesh',
          summary: 'Bringing interactive smartboards and digital literacy to rural primary schools in 12 flood-prone districts.',
          description: 'Leveraging modern connectivity and tablet learning tools to overcome the rural-urban education divide in vulnerable riverine communities across northern Bangladesh.',
          category: 'Education',
          bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
          targetAmount: 5000000,
          raisedAmount: 3850000,
          donorCount: 420,
          status: 'active',
          isFeatured: true,
          location: 'Sunamganj, Habiganj & Kurigram',
          targetReach: '12,500 Rural Primary Students',
          updates: [
            {
              title: 'Phase 1 Deployment: 45 Solar Smartboards Installed',
              date: new Date('2026-09-20'),
              snippet: 'Classrooms in 8 riverine char schools in Sunamganj are now fully powered by off-grid solar kits and interactive tablets.',
            },
            {
              title: 'Teacher Tele-Education Workshop Concluded',
              date: new Date('2026-10-15'),
              snippet: 'Over 60 rural primary instructors completed Cambridge-aligned interactive digital lesson module training.',
            },
          ],
        },
        {
          title: 'Warm Winter Smile 2026',
          slug: 'warm-winter-smile-2026',
          summary: 'Distributing warm winter clothes, thermal blankets, and nutrition packs to 25,000 cold-wave affected children in northern districts.',
          description: 'Winter temperatures in northern border districts plunge dangerously each year. Our annual drive provides thermal jackets, blankets, and hot meals to ensure zero school dropouts during winter.',
          category: 'Disaster Relief',
          bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
          targetAmount: 3000000,
          raisedAmount: 2600000,
          donorCount: 310,
          status: 'active',
          isFeatured: true,
          location: 'Panchagarh, Dinajpur & Nilphamari',
          targetReach: '25,000 Children & Elders',
          updates: [
            {
              title: '15,000 High-Grade Thermal Fleece Jackets Procured',
              date: new Date('2026-10-10'),
              snippet: 'Local cooperative textile partners delivered the first shipment of thermal windbreakers for border schools.',
            },
          ],
        },
        {
          title: 'Youth Leadership & Vocational Fellowship',
          slug: 'youth-leadership-fellowship',
          summary: 'Empowering 5,000 university and vocational students with climate adaptation and grassroots civic leadership training.',
          description: 'Our youth wing drives national civic awareness, disaster emergency volunteering, and localized community improvement projects across all divisions of Bangladesh.',
          category: 'Youth Empowerment',
          bannerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
          targetAmount: 2500000,
          raisedAmount: 1950000,
          donorCount: 180,
          status: 'active',
          isFeatured: false,
          location: 'Dhaka, Chattogram, Sylhet & Khulna',
          targetReach: '5,000 Youth Civic Leaders',
          updates: [
            {
              title: 'Fellowship Cohort 2026 Orientation Launched',
              date: new Date('2026-09-01'),
              snippet: 'Selected fellows from 24 public universities joined introductory climate advocacy sessions in Dhaka.',
            },
          ],
        },
        {
          title: 'Safe Water & Hygiene for Slum Schools',
          slug: 'safe-water-hygiene-slum-schools',
          summary: 'Installing deep-tube filtration units and gender-segregated sanitation blocks in informal settlements.',
          description: 'Waterborne diseases are the single greatest cause of chronic absenteeism in urban slums. This project delivers clean drinking water filtration and sanitation awareness.',
          category: 'Healthcare & Hygiene',
          bannerImage: 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1200&q=80',
          targetAmount: 1800000,
          raisedAmount: 1800000,
          donorCount: 220,
          status: 'completed',
          isFeatured: false,
        },
      ]);
      console.log('[ContentSeed] Seeded foundational initiatives.');
    }

    // 2. Seed Blogs
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany([
        {
          title: 'From Korail Slum to Public University: Sumon’s Journey of Resilience',
          slug: 'from-korail-slum-to-public-university-sumon',
          excerpt: 'Meet Sumon, who enrolled in Hdfd Foundation’s first batch of sponsored students and just earned admission to Dhaka University’s Computer Science Department.',
          content: 'Thirteen years ago, Sumon walked into our modest one-room community school in Rayerbazar with torn sandals and an unstoppable curiosity. Today, supported by his steadfast monthly sponsor and dedicated volunteer mentors, Sumon has achieved what was once considered impossible: securing a merit seat at Dhaka University. In this in-depth interview, Sumon shares his study habits, the hurdles his family overcame, and his commitment to returning as a volunteer mentor for the next generation of Hdfd scholars.',
          coverImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
          category: 'Impact Stories',
          tags: ['Education', 'Success Story', 'Dhaka'],
          isPublished: true,
          publishedAt: new Date('2026-09-15'),
          views: 1240,
        },
        {
          title: 'Hdfd Foundation Recognized with Global Grassroots Leadership Award',
          slug: 'hdfd-foundation-recognized-global-award',
          excerpt: 'Our transparent direct-giving and community education model was honored by the International Civic Forum in Geneva.',
          content: 'We are profoundly honored to share that Hdfd Foundation has been awarded the 2026 Global Grassroots Leadership Prize. The jury commended our 100% transparent audit mechanisms, direct bKash tokenized sponsorship reconciliation, and our nationwide network of 12,000 active youth volunteers across 28 districts in Bangladesh.',
          coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          category: 'Awards & Recognition',
          tags: ['Recognition', 'Global Award', 'Transparency'],
          isPublished: true,
          publishedAt: new Date('2026-10-01'),
          views: 890,
        },
        {
          title: 'Emergency Flood Relief 2026: Restoring Classrooms in Sylhet and Sunamganj',
          slug: 'emergency-flood-relief-sylhet-sunamganj',
          excerpt: 'How our emergency response team distributed over 45 tons of emergency rations and refurbished 18 submerged primary schools.',
          content: 'Flash floods devastated riverbanks across the Haor region earlier this season, cutting off communities and swamping school facilities. Within 48 hours of donor mobilization, our local volunteer battalions deployed rescue boats, distributed hygiene kits, and initiated post-flood restoration so classes could safely resume without prolonged learning gaps.',
          coverImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
          category: 'Field Updates',
          tags: ['Disaster Relief', 'Sylhet', 'Volunteer Network'],
          isPublished: true,
          publishedAt: new Date('2026-10-18'),
          views: 650,
        },
      ]);
      console.log('[ContentSeed] Seeded impact stories and news.');
    }

    // 2B. Seed Press & Media News
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      await News.insertMany([
        {
          title: 'Hdfd Foundation Expands Digital Primary Education to Haor Districts',
          externalUrl: 'https://www.thedailystar.net',
          source: 'The Daily Star',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
          publishedDate: new Date('2026-10-12'),
          summary: 'A special feature highlighting Hdfd Foundation’s solar-powered tablet classroom initiatives bridging rural digital disparities in Sunamganj and Habiganj.',
          status: 'published',
        },
        {
          title: 'Direct-Impact Philanthropy: How Hdfd Foundation Eliminates Overhead with Instant bKash Reconciliations',
          externalUrl: 'https://www.tbsnews.net',
          source: 'The Business Standard',
          image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
          publishedDate: new Date('2026-10-04'),
          summary: 'In-depth financial analysis detailing the foundation’s 100% auditable student adoption model ensuring transparent funding to student nutrition and uniforms.',
          status: 'published',
        },
        {
          title: 'Youth Battalions on the Frontline: Flood Relief Mobilization Across Eastern Bangladesh',
          externalUrl: 'https://en.prothomalo.com',
          source: 'Prothom Alo',
          image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
          publishedDate: new Date('2026-09-28'),
          summary: 'National daily covers Hdfd youth volunteers delivering drinking water and emergency medical kits to marooned families in Feni and Noakhali.',
          status: 'published',
        },
        {
          title: 'From Street Children to National Olympiad Finalists: Inside Hdfd Classrooms',
          externalUrl: 'https://www.dhakatribune.com',
          source: 'Dhaka Tribune',
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
          publishedDate: new Date('2026-09-10'),
          summary: 'Profile of three sponsored students from Dhaka slum branches who represented Bangladesh in international junior STEM competitions.',
          status: 'published',
        },
      ]);
      console.log('[ContentSeed] Seeded press and media news items.');
    }

    // 3. Seed Reports
    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      await Report.insertMany([
        {
          title: 'Annual Audited Financial Report 2025-2026',
          year: 2025,
          category: 'Annual Audit',
          summary: 'Statutory independent audit conducted by A. Qasem & Co. Chartered Accountants verifying 100% compliant fund utilization.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSize: '4.8 MB',
          downloads: 384,
        },
        {
          title: 'Nationwide Child Sponsorship Impact Assessment 2025',
          year: 2025,
          category: 'Impact Assessment',
          summary: 'Comprehensive quantitative analysis of literacy gains, student retention rates, and nutritional milestones across 28 branch schools.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSize: '6.2 MB',
          downloads: 512,
        },
        {
          title: 'Yearbook & Transparency Disclosure 2024',
          year: 2024,
          category: 'Governance Report',
          summary: 'Full governance framework disclosure, executive compensation policies, and regional school operational benchmarks.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSize: '5.1 MB',
          downloads: 298,
        },
      ]);
      console.log('[ContentSeed] Seeded audit reports.');
    }

    // 4. Seed Careers
    const careerCount = await Career.countDocuments();
    if (careerCount === 0) {
      await Career.insertMany([
        {
          title: 'Primary School Teacher (English & Mathematics)',
          department: 'Teaching & Education',
          location: 'Banani Branch, Dhaka',
          type: 'Full-Time',
          deadline: new Date('2026-12-31'),
          description: 'Deliver engaging, activity-based primary curriculum in our flagship community school in Banani for students in grades 1 through 5.',
          requirements: [
            'Bachelor degree in English, Education, or Mathematics from a recognized university',
            'Strong empathy and enthusiasm for teaching children from marginalized backgrounds',
            'Minimum 1 year of teaching experience preferred',
          ],
          responsibilities: [
            'Prepare weekly lesson plans and interactive teaching aids',
            'Maintain student progress records and attend parent-teacher review sessions',
            'Participate in monthly educator development workshops',
          ],
          status: 'active',
        },
        {
          title: 'Regional Field Coordinator',
          department: 'Operations & Field Management',
          location: 'Chattogram Division',
          type: 'Full-Time',
          deadline: new Date('2026-12-15'),
          description: 'Oversee school logistics, teacher rosters, local community engagement, and supply chain distribution across Chattogram division branches.',
          requirements: [
            'Master or Bachelor degree in Social Work, Public Administration, or Development Studies',
            'Proven track record in NGO field operations or school administration',
            'Fluency in Bengali with working knowledge of Chittagonian dialect is a plus',
          ],
          responsibilities: [
            'Ensure timely delivery of nutritious school meals and academic supplies',
            'Coordinate with local education officers and community elders',
            'Supervise emergency relief drills and infrastructure maintenance',
          ],
          status: 'active',
        },
        {
          title: 'Monitoring & Evaluation (M&E) Specialist',
          department: 'Monitoring & Evaluation',
          location: 'Headquarters, Dhaka',
          type: 'Full-Time',
          deadline: new Date('2026-12-20'),
          description: 'Design and manage data collection frameworks measuring student learning outcomes and donor project compliance.',
          requirements: [
            'Degree in Statistics, Economics, or Development Studies',
            'Proficiency in KoboToolbox, SPSS, Excel, and data visualization tools',
            'Minimum 2 years of relevant experience in donor-funded projects',
          ],
          responsibilities: [
            'Conduct quarterly field assessments and verify child attendance data',
            'Prepare analytical impact reports for institutional partners',
          ],
          status: 'active',
        },
      ]);
      console.log('[ContentSeed] Seeded career circulars.');
    }
  } catch (error) {
    console.error('[ContentSeed Error]:', error.message);
  }
};

const runStandalone = async () => {
  try {
    await connectDB();
    await seedContent();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('contentSeed.js')) {
  runStandalone();
}
