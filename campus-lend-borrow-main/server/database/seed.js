import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const hash = (p) => bcrypt.hashSync(p, 10);

const USERS = [
  { full_name: "Arjun Mehta",      email: "arjun.mehta@campus.edu",    department: "Computer Science",       role: "student", rating: 4.8, trust_score: 92, borrow_count: 14, is_verified: true },
  { full_name: "Priya Sharma",     email: "priya.sharma@campus.edu",   department: "Electronics Engineering", role: "student", rating: 4.6, trust_score: 85, borrow_count: 9,  is_verified: true },
  { full_name: "Rahul Kumar",      email: "rahul.kumar@campus.edu",    department: "Mechanical Engineering",  role: "student", rating: 4.5, trust_score: 78, borrow_count: 11, is_verified: true },
  { full_name: "Sneha Patel",      email: "sneha.patel@campus.edu",    department: "Civil Engineering",       role: "student", rating: 4.9, trust_score: 95, borrow_count: 7,  is_verified: true },
  { full_name: "Dev Reddy",        email: "dev.reddy@campus.edu",      department: "Computer Science",       role: "student", rating: 4.3, trust_score: 70, borrow_count: 5,  is_verified: true },
  { full_name: "Kavita Nair",      email: "kavita.nair@campus.edu",    department: "Chemical Engineering",   role: "student", rating: 4.7, trust_score: 88, borrow_count: 12, is_verified: true },
  { full_name: "Amit Tiwari",      email: "amit.tiwari@campus.edu",    department: "Electronics Engineering", role: "student", rating: 4.2, trust_score: 65, borrow_count: 6,  is_verified: true },
  { full_name: "Meera Joshi",      email: "meera.joshi@campus.edu",    department: "Architecture",            role: "student", rating: 4.6, trust_score: 82, borrow_count: 8,  is_verified: true },
  { full_name: "Riya Verma",       email: "riya.verma@campus.edu",     department: "Biotechnology",          role: "student", rating: 4.4, trust_score: 74, borrow_count: 4,  is_verified: true },
  { full_name: "Karan Lal",        email: "karan.lal@campus.edu",      department: "Mechanical Engineering",  role: "student", rating: 4.5, trust_score: 80, borrow_count: 10, is_verified: true },
  { full_name: "Neha Singh",       email: "neha.singh@campus.edu",     department: "Computer Science",       role: "student", rating: 4.7, trust_score: 87, borrow_count: 13, is_verified: true },
  { full_name: "Vikram Bose",      email: "vikram.bose@campus.edu",    department: "Physics",                role: "student", rating: 4.1, trust_score: 60, borrow_count: 3,  is_verified: true },
  { full_name: "Ananya Das",       email: "ananya.das@campus.edu",     department: "Mathematics",            role: "student", rating: 4.8, trust_score: 91, borrow_count: 15, is_verified: true },
  { full_name: "Rohan Gupta",      email: "rohan.gupta@campus.edu",    department: "Information Technology", role: "student", rating: 4.3, trust_score: 72, borrow_count: 6,  is_verified: true },
  { full_name: "Pooja Iyer",       email: "pooja.iyer@campus.edu",     department: "Electronics Engineering", role: "student", rating: 4.6, trust_score: 84, borrow_count: 9,  is_verified: true },
  { full_name: "Admin User",       email: "admin@campus.edu",          department: "Administration",         role: "admin",   rating: 5.0, trust_score: 100, borrow_count: 0, is_verified: true },
  { full_name: "Super Admin",      email: "superadmin@campus.edu",     department: "Administration",         role: "admin",   rating: 5.0, trust_score: 100, borrow_count: 0, is_verified: true },
];

const RESOURCES = [
  // Textbooks
  { ownerIdx: 0, title: "Engineering Mathematics — Kreyszig 10th Ed", description: "Advanced engineering mathematics textbook covering ODEs, linear algebra, complex analysis, and numerical methods. Excellent condition with minimal highlighting.", category: "Textbooks", image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 15, buy_price: 350, security_deposit: 100, late_fee_per_day: 5, min_duration: 3, max_duration: 30, condition: "like-new", tags: ["math", "semester-1", "kreyszig"], quantity: 1, status: "available", views_count: 142, request_count: 8 },
  { ownerIdx: 2, title: "Organic Chemistry — Morrison & Boyd", description: "Classic organic chemistry reference. Covers reaction mechanisms, stereochemistry, and functional groups. Good condition with some pencil notes.", category: "Textbooks", image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 12, buy_price: 280, security_deposit: 80, late_fee_per_day: 4, min_duration: 3, max_duration: 21, condition: "good", tags: ["chemistry", "organic"], quantity: 1, status: "available", views_count: 98, request_count: 5 },
  { ownerIdx: 5, title: "GATE Preparation Kit 2026 — CS/IT", description: "Complete GATE prep bundle: 5 subject-wise books, 3 years solved papers, formula sheets. Like-new condition.", category: "Exam Prep", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 25, buy_price: 600, security_deposit: 150, late_fee_per_day: 10, min_duration: 7, max_duration: 30, condition: "like-new", tags: ["gate", "cs", "prep"], quantity: 1, status: "available", views_count: 210, request_count: 14 },
  { ownerIdx: 8, title: "Data Structures & Algorithms — Cormen (CLRS)", description: "The definitive algorithms textbook. 4th edition. Perfect for placements and competitive programming.", category: "Textbooks", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 18, buy_price: 420, security_deposit: 120, late_fee_per_day: 8, min_duration: 3, max_duration: 30, condition: "good", tags: ["dsa", "clrs", "placements"], quantity: 1, status: "available", views_count: 175, request_count: 11 },
  { ownerIdx: 12, title: "Signals & Systems — Oppenheim", description: "Standard reference for signals and systems. Covers Fourier, Laplace, Z-transforms. Good condition.", category: "Textbooks", image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 10, security_deposit: 60, late_fee_per_day: 4, min_duration: 3, max_duration: 21, condition: "good", tags: ["ece", "signals"], quantity: 1, status: "available", views_count: 67, request_count: 3 },
  { ownerIdx: 3, title: "Fluid Mechanics — Frank White", description: "Comprehensive fluid mechanics textbook. 8th edition. Includes solved examples and practice problems.", category: "Textbooks", image_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 14, buy_price: 320, security_deposit: 90, late_fee_per_day: 6, min_duration: 3, max_duration: 30, condition: "good", tags: ["mechanical", "fluids"], quantity: 1, status: "available", views_count: 89, request_count: 4 },

  // Lab Equipment
  { ownerIdx: 1, title: "Oscilloscope — Hantek DSO5102P", description: "100MHz dual-channel digital oscilloscope. Perfect for electronics lab work. Includes probes and USB cable.", category: "Lab Equipment", image_url: "https://images.unsplash.com/photo-1581092160607-ee67df30d1ce?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1581092160607-ee67df30d1ce?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 100, security_deposit: 500, late_fee_per_day: 50, min_duration: 1, max_duration: 14, condition: "good", tags: ["electronics", "lab"], quantity: 1, status: "available", views_count: 203, request_count: 17 },
  { ownerIdx: 9, title: "Vernier Caliper — Mitutoyo Digital", description: "High-precision 150mm digital vernier caliper. Accurate to 0.01mm. Ideal for mechanical measurements.", category: "Lab Equipment", image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 30, security_deposit: 200, late_fee_per_day: 20, min_duration: 1, max_duration: 14, condition: "like-new", tags: ["mechanical", "measurements"], quantity: 1, status: "available", views_count: 115, request_count: 9 },
  { ownerIdx: 2, title: "Soldering Station — Hakko FX-888D", description: "Professional temperature-controlled soldering station. Ideal for PCB work and electronics projects.", category: "Lab Equipment", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 40, security_deposit: 250, late_fee_per_day: 25, min_duration: 1, max_duration: 21, condition: "good", tags: ["soldering", "pcb"], quantity: 1, status: "borrowed", views_count: 156, request_count: 12 },
  { ownerIdx: 6, title: "Multimeter — Fluke 117", description: "True-RMS digital multimeter. Measures voltage, current, resistance, capacitance. Professional grade.", category: "Lab Equipment", image_url: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 25, security_deposit: 150, late_fee_per_day: 15, min_duration: 1, max_duration: 14, condition: "good", tags: ["electronics"], quantity: 1, status: "available", views_count: 134, request_count: 10 },
  { ownerIdx: 14, title: "Function Generator — RIGOL DG1022Z", description: "Dual-channel arbitrary waveform generator. 25MHz bandwidth. Great for signal testing.", category: "Lab Equipment", image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 80, security_deposit: 400, late_fee_per_day: 40, min_duration: 1, max_duration: 14, condition: "good", tags: ["signals", "lab"], quantity: 1, status: "available", views_count: 88, request_count: 6 },

  // Electronics
  { ownerIdx: 1, title: "Arduino Mega 2560 Starter Kit", description: "Complete Arduino kit with Mega 2560 board, breadboard, 65 jumper wires, LEDs, resistors, sensors. Perfect for projects.", category: "Electronics", image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 50, buy_price: 1200, security_deposit: 300, late_fee_per_day: 25, min_duration: 3, max_duration: 21, condition: "good", tags: ["arduino", "iot"], quantity: 1, status: "available", views_count: 287, request_count: 22 },
  { ownerIdx: 6, title: "Breadboard + Jumper Wires Mega Set", description: "830-point solderless breadboard with 120 jumper wires (male-male, male-female, female-female). Essential for prototyping.", category: "Electronics", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 10, buy_price: 180, security_deposit: 50, late_fee_per_day: 5, min_duration: 3, max_duration: 14, condition: "good", tags: ["breadboard", "wires"], quantity: 2, status: "return-due", views_count: 94, request_count: 7 },
  { ownerIdx: 10, title: "Raspberry Pi 4 Model B (4GB)", description: "Raspberry Pi 4 with 4GB RAM, official case, power supply, and 32GB SD card with Raspbian. Great for IoT projects.", category: "Electronics", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop"], listing_type: "rent", rent_price: 120, security_deposit: 600, late_fee_per_day: 60, min_duration: 3, max_duration: 14, condition: "like-new", tags: ["raspberry-pi", "iot"], quantity: 1, status: "available", views_count: 312, request_count: 25 },
  { ownerIdx: 4, title: "ESP32 Development Board Kit", description: "ESP32 with WiFi+Bluetooth, 5 boards, USB cables, and sensor modules. Ideal for IoT and wireless projects.", category: "Electronics", image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=300&fit=crop", images: ["https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=500&fit=crop"], listing_type: "both", rent_price: 35, buy_price: 800, security_deposit: 200, late_fee_per_day: 20, min_duration: 3, max_duration: 21, condition: "good", tags: ["esp32", "wireless"], quantity: 2, status: "available", views_count: 178, request_count: 13 },

  // Project Tools
  { ownerIdx: 4, title: "3D Printer Filament Bundle — PLA 1kg", description: "1kg PLA filament in 5 colors (white, black, red, blue, yellow). 1.75mm diameter. Compatible with most FDM printers.", category: "Project Tools", image_url: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=400&h=300&fit=crop", listing_type: "buy", buy_price: 500, status: "available", views_count: 145, request_count: 8 },
  { ownerIdx: 9, title: "Dremel 3000 Rotary Tool Kit", description: "Variable speed rotary tool with 28 accessories. Perfect for cutting, grinding, engraving, and polishing project parts.", category: "Project Tools", image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop", listing_type: "rent", rent_price: 60, status: "available", views_count: 112, request_count: 7 },
  { ownerIdx: 13, title: "Laser Cutter Access Card (10 hrs)", description: "Pre-paid 10-hour access card for the campus laser cutter. Valid for 3 months. Transfer allowed.", category: "Project Tools", image_url: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=400&h=300&fit=crop", listing_type: "buy", buy_price: 750, status: "available", views_count: 198, request_count: 16 },
  { ownerIdx: 7, title: "Woodworking Hand Tool Set", description: "Complete set: hammer, chisels (4 sizes), hand saw, measuring tape, spirit level, screwdrivers. Good condition.", category: "Project Tools", image_url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop", listing_type: "rent", rent_price: 45, status: "available", views_count: 76, request_count: 4 },

  // Calculators
  { ownerIdx: 3, title: "TI-84 Plus CE Graphing Calculator", description: "Color screen graphing calculator. Pre-loaded with math apps. Ideal for calculus, statistics, and engineering exams.", category: "Calculators", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop", listing_type: "both", rent_price: 20, buy_price: 800, status: "available", views_count: 167, request_count: 11 },
  { ownerIdx: 10, title: "Casio FX-991EX ClassWiz", description: "Advanced scientific calculator with 552 functions, spreadsheet mode, and QR code feature. Perfect for all engineering exams.", category: "Calculators", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop", listing_type: "both", rent_price: 10, buy_price: 400, status: "available", views_count: 223, request_count: 18 },
  { ownerIdx: 11, title: "HP 35s Scientific Calculator", description: "RPN and algebraic entry modes. 800+ built-in functions. Approved for FE/PE exams. Like-new condition.", category: "Calculators", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop", listing_type: "both", rent_price: 15, buy_price: 550, status: "available", views_count: 89, request_count: 5 },

  // Stationery
  { ownerIdx: 7, title: "Drafting Tools & Compass Set — Staedtler", description: "Professional drafting set: compass, divider, ruling pen, 3 set squares, protractor, scale ruler. Excellent for engineering drawing.", category: "Stationery", image_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop", listing_type: "both", rent_price: 8, buy_price: 150, status: "available", views_count: 93, request_count: 6 },
  { ownerIdx: 0, title: "Sticky Notes & Highlighter Mega Pack", description: "100 sticky notes (5 colors), 8 highlighters, 4 gel pens, 2 permanent markers. Perfect for exam prep.", category: "Stationery", image_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", listing_type: "buy", buy_price: 80, status: "available", views_count: 54, request_count: 3 },
  { ownerIdx: 12, title: "Graph Paper Notebook — A4 (200 sheets)", description: "High-quality 1mm grid graph paper notebook. Acid-free, 80gsm. Ideal for engineering drawings and data plots.", category: "Stationery", image_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", listing_type: "buy", buy_price: 60, status: "available", views_count: 41, request_count: 2 },

  // Exam Prep
  { ownerIdx: 5, title: "JEE Advanced PYQ Bundle (2015–2024)", description: "10 years of JEE Advanced previous year questions with detailed solutions. All subjects. Excellent for revision.", category: "Exam Prep", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", listing_type: "both", rent_price: 20, buy_price: 450, status: "available", views_count: 189, request_count: 15 },
  { ownerIdx: 13, title: "UPSC Prelims Study Material Set", description: "Complete UPSC prelims material: GS 1-4 notes, current affairs digest, 5 mock test series. Updated for 2025.", category: "Exam Prep", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", listing_type: "both", rent_price: 30, buy_price: 700, status: "available", views_count: 134, request_count: 9 },
  { ownerIdx: 8, title: "CAT Preparation Books — Complete Set", description: "Arun Sharma QA, Verbal Ability, LRDI books + 3 mock test series. Ideal for MBA aspirants.", category: "Exam Prep", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", listing_type: "both", rent_price: 22, buy_price: 520, status: "available", views_count: 97, request_count: 6 },
  { ownerIdx: 11, title: "GRE Prep — Official ETS + Magoosh", description: "Official GRE guide (3rd ed), Magoosh vocab flashcards (500 cards), Manhattan 5lb practice book.", category: "Exam Prep", image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", listing_type: "both", rent_price: 18, buy_price: 480, status: "available", views_count: 112, request_count: 8 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing data
    await client.query("DELETE FROM notifications");
    await client.query("DELETE FROM ratings");
    await client.query("DELETE FROM borrow_requests");
    await client.query("DELETE FROM resources");
    await client.query("DELETE FROM users");

    // Insert users
    const userIds = [];
    for (const u of USERS) {
      const { rows } = await client.query(
        `INSERT INTO users (full_name, email, password_hash, department, role, rating, trust_score, borrow_count, is_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [u.full_name, u.email, hash("Campus@123"), u.department, u.role, u.rating, u.trust_score, u.borrow_count, u.is_verified]
      );
      userIds.push(rows[0].id);
    }
    console.log(`✅ Inserted ${userIds.length} users`);

    // Insert resources
    const resourceIds = [];
    for (const r of RESOURCES) {
      const { rows } = await client.query(
        `INSERT INTO resources (
           owner_id, title, description, category, image_url, images,
           listing_type, rent_price, buy_price, security_deposit,
           availability_days, min_duration, max_duration, late_fee_per_day,
           status, condition, tags, quantity, views_count, request_count
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING id`,
        [
          userIds[r.ownerIdx],
          r.title,
          r.description,
          r.category,
          r.image_url,
          r.images || null,
          r.listing_type,
          r.rent_price || null,
          r.buy_price || null,
          r.security_deposit || null,
          r.availability_days || null,
          r.min_duration || 1,
          r.max_duration || 30,
          r.late_fee_per_day || null,
          r.status,
          r.condition || "good",
          r.tags || null,
          r.quantity || 1,
          r.views_count,
          r.request_count,
        ]
      );
      resourceIds.push(rows[0].id);
    }
    console.log(`✅ Inserted ${resourceIds.length} resources`);

    // Borrow requests — active borrows
    const borrowData = [
      // active borrows
      { resourceIdx: 8,  borrowerIdx: 0,  ownerIdx: 2,  days: 7,  status: "active",              daysAgo: 3 },
      { resourceIdx: 11, borrowerIdx: 3,  ownerIdx: 1,  days: 14, status: "active",              daysAgo: 5 },
      { resourceIdx: 19, borrowerIdx: 5,  ownerIdx: 3,  days: 7,  status: "active",              daysAgo: 2 },
      // return-due
      { resourceIdx: 12, borrowerIdx: 2,  ownerIdx: 6,  days: 3,  status: "return-due",          daysAgo: 4 },
      { resourceIdx: 6,  borrowerIdx: 7,  ownerIdx: 1,  days: 5,  status: "return-due",          daysAgo: 6 },
      // extension-requested
      { resourceIdx: 9,  borrowerIdx: 4,  ownerIdx: 6,  days: 7,  status: "extension-requested", daysAgo: 8 },
      // extension-approved
      { resourceIdx: 20, borrowerIdx: 10, ownerIdx: 10, days: 7,  status: "extension-approved",  daysAgo: 10 },
      // returned (history)
      { resourceIdx: 0,  borrowerIdx: 8,  ownerIdx: 0,  days: 7,  status: "returned",            daysAgo: 20 },
      { resourceIdx: 3,  borrowerIdx: 9,  ownerIdx: 8,  days: 5,  status: "returned",            daysAgo: 15 },
      { resourceIdx: 21, borrowerIdx: 11, ownerIdx: 7,  days: 3,  status: "returned",            daysAgo: 12 },
    ];

    const borrowIds = [];
    for (const b of borrowData) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - b.daysAgo);
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + b.days);
      const extDate = new Date(dueDate);
      extDate.setDate(extDate.getDate() + 7);

      const { rows } = await client.query(
        `INSERT INTO borrow_requests (resource_id, borrower_id, owner_id, duration_days, status, due_date, extended_due_date, request_type, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [
          resourceIds[b.resourceIdx],
          userIds[b.borrowerIdx],
          userIds[b.ownerIdx],
          b.days,
          b.status,
          dueDate.toISOString().split("T")[0],
          b.status === "extension-approved" ? extDate.toISOString().split("T")[0] : null,
          'rent',
          startDate.toISOString(),
        ]
      );
      borrowIds.push(rows[0].id);
    }
    console.log(`✅ Inserted ${borrowIds.length} borrow requests`);

    // Ratings
    const ratingData = [
      { fromIdx: 8,  toIdx: 0,  borrowIdx: 7, score: 5, feedback: "Arjun was super helpful and the book was in great condition!" },
      { fromIdx: 9,  toIdx: 8,  borrowIdx: 8, score: 5, feedback: "Ananya is a fantastic lender. Highly recommended!" },
      { fromIdx: 11, toIdx: 7,  borrowIdx: 9, score: 4, feedback: "Meera was responsive and the tools were clean." },
      { fromIdx: 0,  toIdx: 2,  borrowIdx: 0, score: 5, feedback: "Rahul's soldering station was in perfect condition." },
      { fromIdx: 3,  toIdx: 1,  borrowIdx: 1, score: 4, feedback: "Priya was punctual and the kit was complete." },
    ];

    for (const r of ratingData) {
      await client.query(
        `INSERT INTO ratings (from_user, to_user, borrow_id, score, feedback) VALUES ($1,$2,$3,$4,$5)`,
        [userIds[r.fromIdx], userIds[r.toIdx], borrowIds[r.borrowIdx], r.score, r.feedback]
      );
    }
    console.log(`✅ Inserted ${ratingData.length} ratings`);

    // Notifications
    const notifData = [
      { userIdx: 0,  message: "Your borrow request for 'Soldering Station' has been approved!", type: "success" },
      { userIdx: 3,  message: "Arduino Mega Kit is due for return in 2 days.", type: "warning" },
      { userIdx: 4,  message: "Extension request for 'Multimeter' is pending owner approval.", type: "info" },
      { userIdx: 2,  message: "Breadboard Set is overdue. Please return it immediately.", type: "error" },
      { userIdx: 10, message: "Your extension for 'HP 35s Calculator' has been approved!", type: "success" },
      { userIdx: 1,  message: "New borrow request received for 'Oscilloscope'.", type: "info" },
      { userIdx: 5,  message: "Ananya Das has returned 'GATE Preparation Kit'. Please confirm.", type: "info" },
      { userIdx: 7,  message: "Your listing 'Drafting Tools Set' has received 3 new requests.", type: "info" },
    ];

    for (const n of notifData) {
      await client.query(
        `INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)`,
        [userIds[n.userIdx], n.message, n.type]
      );
    }
    console.log(`✅ Inserted ${notifData.length} notifications`);

    await client.query("COMMIT");
    console.log("\n🎉 Seed completed successfully!");
    console.log("📧 Login credentials (all users): password = Campus@123");
    console.log("👤 Admin: admin@campus.edu / Campus@123");
    console.log("👤 Student: arjun.mehta@campus.edu / Campus@123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
