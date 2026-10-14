import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding EventConnector database...");

  // 1. Create demo users
  const organizerUser = await prisma.user.upsert({
    where: { firebaseUid: "dev-organizer-uid-1" },
    update: {},
    create: {
      email: "organizer@college.edu",
      firebaseUid: "dev-organizer-uid-1",
      name: "IIT Bombay Techfest Council",
      role: "ORGANIZER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      bio: "Official technical festival committee organizing premier student hackathons and research workshops.",
      skills: ["Event Management", "Full Stack", "System Architecture"],
      interests: ["Hackathons", "Robotics", "Web3", "AI"],
      city: "Mumbai",
      latitude: 19.1334,
      longitude: 72.9133,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { firebaseUid: "dev-student-uid-1" },
    update: {},
    create: {
      email: "student@example.com",
      firebaseUid: "dev-student-uid-1",
      name: "Alex Dev",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      bio: "Undergraduate Computer Science hacker passionate about AI agents and decentralized systems.",
      skills: ["React", "TypeScript", "Node.js", "Python", "PyTorch"],
      interests: ["AI/ML", "Web3", "Cloud Computing"],
      preferredDomains: ["AI/ML", "Web Development", "Robotics"],
      city: "Mumbai",
      latitude: 19.1334,
      longitude: 72.9133,
    },
  });

  console.log("✓ Seeded demo users");

  // 2. Create Institutions with rich Campus Map markers
  const iitb = await prisma.institution.create({
    data: {
      name: "Indian Institute of Technology Bombay (IIT Bombay)",
      address: "Main Gate Rd, IIT Area, Powai, Mumbai, Maharashtra 400076",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      latitude: 19.1334,
      longitude: 72.9133,
      websiteUrl: "https://www.iitb.ac.in",
      campusMapImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",
      createdById: organizerUser.id,
      campusMapMarkers: [
        {
          id: "m1",
          label: "Convocation Hall / Grand Auditorium",
          category: "AUDITORIUM",
          latitude: 19.1338,
          longitude: 72.9135,
          description: "Main stage for inaugural ceremony and grand finale pitches.",
          floor: "Ground Floor",
        },
        {
          id: "m2",
          label: "Tinkerer's Laboratory & Maker Space",
          category: "LAB",
          latitude: 19.1328,
          longitude: 72.9142,
          description: "24/7 3D printers, laser cutters, oscilloscope stations, and hardware kits.",
          floor: "Building 3, 1st Floor",
        },
        {
          id: "m3",
          label: "KReSIT - Computer Science & Engineering",
          category: "MAIN_BUILDING",
          latitude: 19.1345,
          longitude: 72.9150,
          description: "Hackathon coding arenas, high-speed Gigabit LAN, mentor breakout rooms.",
          floor: "Floors 1-4",
        },
        {
          id: "m4",
          label: "Student Activity Center (SAC)",
          category: "GROUND",
          latitude: 19.1315,
          longitude: 72.9120,
          description: "Midnight food trucks, rest lounge, VR gaming arcade, relaxation zones.",
          floor: "Complex",
        },
        {
          id: "m5",
          label: "Main Security Gate & Registration Check-in",
          category: "GATE",
          latitude: 19.1305,
          longitude: 72.9100,
          description: "Participant badge distribution and identity verification counter.",
          floor: "Entry",
        },
      ],
    },
  });

  const dtu = await prisma.institution.create({
    data: {
      name: "Delhi Technological University (DTU)",
      address: "Shahbad Daulatpur, Main Bawana Road, Delhi 110042",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      latitude: 28.7501,
      longitude: 77.1177,
      websiteUrl: "http://dtu.ac.in",
      campusMapImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200",
      createdById: organizerUser.id,
      campusMapMarkers: [
        {
          id: "dtu1",
          label: "Dr. B.R. Ambedkar Auditorium",
          category: "AUDITORIUM",
          latitude: 28.7505,
          longitude: 77.1180,
          description: "Keynote talks, corporate sponsor booths, and prize distribution.",
          floor: "Ground Floor",
        },
        {
          id: "dtu2",
          label: "Computer Center Lab 1 & 2",
          category: "LAB",
          latitude: 28.7495,
          longitude: 77.1170,
          description: "High-performance GPU cluster access and team hacking bays.",
          floor: "2nd Floor",
        },
      ],
    },
  });

  console.log("✓ Seeded institutions with interactive campus maps");

  // 3. Create Events (Both Organizer-Listed and Scraped/External)
  const eventsData = [
    // Organizer-Listed Event 1
    {
      title: "HackNova 2026 — 36-Hour National AI & Robotics Hackathon",
      description:
        "India's premier student-run hackathon bringing together 800+ top hackers. Build bleeding-edge autonomous drones, multimodal AI assistants, or smart campus systems. Features $15k cloud credits, real hardware testbeds, and direct interview fast-tracks.",
      source: "ORGANIZER" as const,
      eventType: "HACKATHON" as const,
      mode: "OFFLINE" as const,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      venueName: "IIT Bombay - KReSIT & Tinkerer's Lab",
      venueAddress: "Powai, Mumbai, Maharashtra 400076",
      latitude: 19.1334,
      longitude: 72.9133,
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      domains: ["AI/ML", "Robotics", "IoT", "Cloud Computing"],
      requiredSkills: ["React", "Python", "PyTorch", "ROS", "OpenCV"],
      registrationUrl: "https://eventconnector.dev/events/hacknova-2026/apply",
      websiteUrl: "https://hacknova2026.iitb.ac.in",
      bannerImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000",
      teamSizeMin: 2,
      teamSizeMax: 4,
      prizePool: "₹5,00,000",
      isFeatured: true,
      isApproved: true,
      organizerId: organizerUser.id,
      eligibility: {
        minYear: 1,
        maxYear: 4,
        branches: ["Computer Science", "Electrical", "Mechanical", "Any Engineering/Science"],
        notes: "Open to all enrolled university/college students with valid college ID.",
      },
      institutionId: iitb.id,
    },
    // Organizer-Listed Event 2
    {
      title: "DevIgnite 2026 National CodeFest & Web3 Sprint",
      description:
        "Join 500+ builders in Delhi for a 24-hour sprint focused on verifiable computing, decentralized identity, and high-performance Web apps. Organized with industry tech mentors from Polygon, Google, and Microsoft.",
      source: "ORGANIZER" as const,
      eventType: "HACKATHON" as const,
      mode: "HYBRID" as const,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      venueName: "DTU Dr. B.R. Ambedkar Auditorium",
      venueAddress: "Main Bawana Road, Delhi 110042",
      latitude: 28.7501,
      longitude: 77.1177,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      domains: ["Web Development", "Web3", "Cybersecurity"],
      requiredSkills: ["Solidity", "Rust", "Next.js", "TypeScript"],
      registrationUrl: "https://eventconnector.dev/events/devignite-2026",
      websiteUrl: "https://dtu.ac.in/devignite",
      bannerImageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000",
      teamSizeMin: 1,
      teamSizeMax: 3,
      prizePool: "₹3,50,000",
      isFeatured: true,
      isApproved: true,
      organizerId: organizerUser.id,
      eligibility: {
        notes: "Open to all undergraduate and postgraduate students.",
      },
      institutionId: dtu.id,
    },
    // Organizer-Listed Workshop
    {
      title: "Hands-on GenAI & Multimodal Agents Masterclass",
      description:
        "Intensive full-day workshop covering prompt caching, function calling, agentic loops, and vector database retrieval. Led by senior AI researchers.",
      source: "ORGANIZER" as const,
      eventType: "WORKSHOP" as const,
      mode: "OFFLINE" as const,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venueName: "IIT Bombay - Seminar Hall 1",
      venueAddress: "Powai, Mumbai, Maharashtra 400076",
      latitude: 19.1334,
      longitude: 72.9133,
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      domains: ["AI/ML", "Data Science"],
      requiredSkills: ["Python", "API Integration"],
      registrationUrl: "https://eventconnector.dev/events/genai-masterclass",
      bannerImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000",
      prizePool: "Certificates & Swag Kits",
      isFeatured: false,
      isApproved: true,
      organizerId: organizerUser.id,
      institutionId: iitb.id,
    },
    // External Event 1: Unstop
    {
      title: "Smart India Hackathon 2026 (Grand Finale)",
      description:
        "Nationwide initiative by the Ministry of Education & AICTE to provide students with a platform to solve critical real-world challenges faced by Government Ministries and Industry.",
      source: "UNSTOP" as const,
      externalUrl: "https://unstop.com/hackathons/smart-india-hackathon-2026",
      externalPlatform: "Unstop",
      eventType: "HACKATHON" as const,
      mode: "HYBRID" as const,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      venueName: "IIT Delhi / Central Nodal Centers",
      venueAddress: "Hauz Khas, New Delhi 110016",
      latitude: 28.5450,
      longitude: 77.1926,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      domains: ["Smart Automation", "CleanTech", "MedTech", "Disaster Management"],
      requiredSkills: ["Full Stack", "IoT", "Machine Learning", "System Design"],
      registrationUrl: "https://unstop.com/hackathons/smart-india-hackathon-2026",
      websiteUrl: "https://www.sih.gov.in",
      bannerImageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000",
      teamSizeMin: 6,
      teamSizeMax: 6,
      prizePool: "₹1,00,00,000",
      isFeatured: true,
      isApproved: true,
    },
    // External Event 2: Devpost
    {
      title: "Google Cloud Gemini Multimodal Global Hackathon",
      description:
        "Push the boundaries of AI with Google's flagship Gemini models. Build applications that understand audio, video, text, and code seamlessly.",
      source: "DEVPOST" as const,
      externalUrl: "https://gemini.devpost.com",
      externalPlatform: "Devpost",
      eventType: "HACKATHON" as const,
      mode: "ONLINE" as const,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      venueName: "Virtual / Google Cloud Worldwide",
      city: "Online Global",
      country: "Global",
      latitude: 37.7749,
      longitude: -122.4194,
      domains: ["AI/ML", "Cloud Computing", "LLMs"],
      requiredSkills: ["Python", "TypeScript", "Gemini API", "FastAPI"],
      registrationUrl: "https://gemini.devpost.com",
      websiteUrl: "https://gemini.devpost.com",
      bannerImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000",
      teamSizeMin: 1,
      teamSizeMax: 4,
      prizePool: "$100,000",
      isFeatured: true,
      isApproved: true,
    },
    // External Event 3: Unstop (Flipkart GRiD)
    {
      title: "Flipkart GRiD 7.0 — Autonomous Robotics Challenge",
      description:
        "Flipkart's premier engineering campus challenge inviting top tier engineering minds to tackle warehouse automation, autonomous pallet rovers, and drone deliveries.",
      source: "UNSTOP" as const,
      externalUrl: "https://unstop.com/competitions/flipkart-grid-70",
      externalPlatform: "Unstop",
      eventType: "COMPETITION" as const,
      mode: "ONLINE" as const,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      venueName: "Flipkart Tech Hub & Virtual Arena",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      latitude: 12.9716,
      longitude: 77.5946,
      domains: ["Robotics", "E-Commerce", "High Scale Systems"],
      requiredSkills: ["Algorithms", "ROS", "Computer Vision", "C++"],
      registrationUrl: "https://unstop.com/competitions/flipkart-grid-70",
      websiteUrl: "https://unstop.com",
      bannerImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000",
      teamSizeMin: 2,
      teamSizeMax: 3,
      prizePool: "₹5,25,000 + PPI",
      isFeatured: false,
      isApproved: true,
    },
    // External Event 4: Devpost (HackMIT)
    {
      title: "HackMIT 2026: The Paradigm Shift",
      description:
        "MIT's annual student hackathon welcoming 1,000+ enthusiastic hackers from across the globe for 36 hours of technological invention and exploration.",
      source: "DEVPOST" as const,
      externalUrl: "https://hackmit2026.devpost.com",
      externalPlatform: "Devpost",
      eventType: "HACKATHON" as const,
      mode: "HYBRID" as const,
      startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      venueName: "MIT Stata Center",
      venueAddress: "77 Massachusetts Ave, Cambridge, MA",
      city: "Cambridge",
      state: "MA",
      country: "USA",
      latitude: 42.3601,
      longitude: -71.0942,
      domains: ["AI/ML", "BioTech", "Quantum Computing", "Open Source"],
      requiredSkills: ["React", "Python", "C++", "PyTorch"],
      registrationUrl: "https://hackmit2026.devpost.com",
      websiteUrl: "https://hackmit.org",
      bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000",
      teamSizeMin: 2,
      teamSizeMax: 4,
      prizePool: "$40,000",
      isFeatured: true,
      isApproved: true,
    },
  ];

  for (const item of eventsData) {
    const { institutionId, ...eventDetails } = item;
    const createdEvent = await prisma.event.create({
      data: eventDetails,
    });

    if (institutionId) {
      await prisma.eventInstitution.create({
        data: {
          eventId: createdEvent.id,
          institutionId,
        },
      });
    }
  }

  console.log(`✓ Seeded ${eventsData.length} events (Organizer-listed and external Unstop/Devpost platforms)`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
