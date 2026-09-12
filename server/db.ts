import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Clean & Simple Supabase Session Pooler Configuration (Discrete Credentials)
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL pool notice:', err.message);
});

let isPgConnected = false;

export interface CategoryBrand {
  id?: number;
  name: string;
  unit: string;
  price: number;
  cost_price?: number;
  image?: string;
  weekly_prices?: Record<string, number>;
  stock?: number;
  force_stock_out?: boolean;
}

export interface Category {
  id: number;
  group: string;
  en: string;
  bn: string;
  icon: string;
  brands: CategoryBrand[];
}

export interface DeliveryArea {
  id: number;
  name: string;
  charge: number;
  is_active: boolean;
}

export interface DeliveryRider {
  id: number;
  name: string;
  phone: string;
  password_hash?: string;
  vehicle: string;
  area: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  notes?: string;
  created_at?: string;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name_bn: string;
  name_en: string;
  number: string;
  instructions_bn: string;
  is_active: boolean;
}

export interface DBUser {
  id: number;
  name: string;
  phone: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface DBAdmin {
  id: number;
  name: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface DBGroup {
  id?: number;
  key: string;
  en: string;
  bn: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

// Clean Default State Structure (Data is loaded dynamically from PostgreSQL)
export const initialData = {
  settings: {
    site_name: 'আড়ৎ এক্সপ্রেস',
    site_tagline: 'Arot Express — তাজা পাইকারি ও খুচরা মুদি বাজার',
    site_address: 'ঢাকা, বাংলাদেশ',
    site_helpline: '০১৭১২-৩৪৫৬৭৮',
    header_title: 'মুদি বাজারের পুরো লিস্ট, এক জায়গায়।',
    header_subtitle: 'চাল-ডাল থেকে মাছ-মসলা — আড়তের মতো দরে, ঘরে বসে অর্ডার করুন। ব্র্যান্ড বেছে নিন, কার্টে যোগ করুন, ডেলিভারি নিশ্চিত করুন।',
    footer_text: '© 2026 Arot Express — আপনার আড়ৎ, এক ক্লিকে।',
    footer_address: 'ঢাকা, বাংলাদেশ',
    default_delivery_fee: 60,
    payment_verify_enabled: false,
    payment_verify_api_url: '',
    payment_verify_api_key: '',
    featured_products: [] as { category_id: number; brand_name: string }[]
  },
  delivery_areas: [] as DeliveryArea[],
  delivery_riders: [] as DeliveryRider[],
  expenses: [] as Expense[],
  groups: [
    { key: 'staples', en: 'Pantry Staples', bn: 'নিত্যপ্রয়োজনীয়', is_active: true, sort_order: 1, icon: '' },
    { key: 'fresh', en: 'Fresh Market', bn: 'তাজা বাজার', is_active: true, sort_order: 2, icon: '' },
    { key: 'spices', en: 'Spices', bn: 'মসলা', is_active: true, sort_order: 3, icon: '' },
    { key: 'breakfast', en: 'Dairy & Breakfast', bn: 'দুগ্ধ ও নাস্তা', is_active: true, sort_order: 4, icon: '' },
    { key: 'drinks', en: 'Snacks & Drinks', bn: 'নাস্তা ও পানীয়', is_active: true, sort_order: 5, icon: '' },
    { key: 'household', en: 'Household', bn: 'গৃহস্থালি', is_active: true, sort_order: 6, icon: '' }
  ] as DBGroup[],
  categories: [] as Category[],
  paymentMethods: [] as PaymentMethod[],
  users: [] as DBUser[],
  admins: [
    {
      id: 1,
      name: 'সুপার অ্যাডমিন',
      username: 'admin',
      password_hash: bcrypt.hashSync('admin', 10),
      created_at: new Date().toISOString()
    }
  ] as DBAdmin[],
  orders: [] as any[],
  carts: {} as Record<string, any>
};

// Database Store Manager
export class DBManager {
  static data = initialData;
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const client = await pool.connect();
        isPgConnected = true;
        console.log('✅ PostgreSQL Database connected successfully!');

        // Create Tables if not exist
        await client.query(`
          CREATE TABLE IF NOT EXISTS site_settings (
            id SERIAL PRIMARY KEY,
            key VARCHAR(100) UNIQUE NOT NULL,
            value TEXT NOT NULL
          );

        -- Separate Table for Dedicated Admins
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Customer Users Table (Standard customers only)
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          phone VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS groups (
          id SERIAL PRIMARY KEY,
          key VARCHAR(50) UNIQUE NOT NULL,
          en VARCHAR(100) NOT NULL,
          bn VARCHAR(100) NOT NULL,
          icon VARCHAR(255) DEFAULT '',
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          group_key VARCHAR(150) NOT NULL,
          en_name VARCHAR(150) NOT NULL,
          bn_name VARCHAR(150) NOT NULL,
          icon TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS product_brands (
          id SERIAL PRIMARY KEY,
          category_id INT REFERENCES categories(id) ON DELETE CASCADE,
          name VARCHAR(150) NOT NULL,
          unit VARCHAR(100) NOT NULL,
          price NUMERIC(10, 2) NOT NULL,
          image_url TEXT,
          weekly_prices JSONB,
          stock INT DEFAULT 100,
          force_stock_out BOOLEAN DEFAULT FALSE
        );

        ALTER TABLE product_brands ADD COLUMN IF NOT EXISTS weekly_prices JSONB;
        ALTER TABLE product_brands ADD COLUMN IF NOT EXISTS stock INT DEFAULT 100;
        ALTER TABLE product_brands ADD COLUMN IF NOT EXISTS force_stock_out BOOLEAN DEFAULT FALSE;
        ALTER TABLE product_brands ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0;

        -- Alter existing columns to avoid value too long error for categories
        ALTER TABLE categories ALTER COLUMN icon TYPE TEXT;
        ALTER TABLE categories ALTER COLUMN group_key TYPE VARCHAR(150);
        ALTER TABLE categories ALTER COLUMN en_name TYPE VARCHAR(150);
        ALTER TABLE categories ALTER COLUMN bn_name TYPE VARCHAR(150);

        CREATE TABLE IF NOT EXISTS payment_methods (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          name_bn VARCHAR(100) NOT NULL,
          name_en VARCHAR(100) NOT NULL,
          number VARCHAR(50),
          instructions_bn TEXT,
          is_active BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_code VARCHAR(50) UNIQUE NOT NULL,
          user_id INT,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          delivery_address TEXT NOT NULL,
          delivery_area VARCHAR(100) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          sender_number VARCHAR(50),
          trx_id VARCHAR(100),
          subtotal NUMERIC(10, 2) NOT NULL,
          delivery_fee NUMERIC(10, 2) NOT NULL,
          total_amount NUMERIC(10, 2) NOT NULL,
          items_json JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'পেন্ডিং',
          payment_status VARCHAR(50) DEFAULT 'unverified',
          payment_verified_at TIMESTAMP,
          payment_verified_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unverified';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_data JSONB;

        CREATE TABLE IF NOT EXISTS user_carts (
          id SERIAL PRIMARY KEY,
          user_id INT UNIQUE NOT NULL,
          cart_json JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS delivery_areas (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          charge NUMERIC(10, 2) DEFAULT 60,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS delivery_riders (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          password_hash TEXT,
          vehicle VARCHAR(50) DEFAULT 'মোটরসাইকেল',
          area VARCHAR(100) DEFAULT 'ঢাকা',
          address TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          category VARCHAR(100) NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          expense_date DATE DEFAULT CURRENT_DATE,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE delivery_riders ADD COLUMN IF NOT EXISTS password_hash TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_rider_id INT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_rider_name VARCHAR(150);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_rider_phone VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_rider_vehicle VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_note TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
      `);

      // Ensure default super admin exists in admins table only if no admin exists
      const adminCountRes = await client.query(`SELECT COUNT(*) as count FROM admins`);
      if (parseInt(adminCountRes.rows[0].count, 10) === 0) {
        const defaultAdminHash = bcrypt.hashSync('admin', 10);
        await client.query(
          `INSERT INTO admins (name, username, password_hash) VALUES ($1, $2, $3)`,
          ['সুপার অ্যাডমিন', 'admin', defaultAdminHash]
        );
      }

      // Fetch all existing data from PostgreSQL sequentially to avoid overlapping queries on a single client
      const catRes = await client.query(`SELECT * FROM categories ORDER BY id ASC`);
      const brandRes = await client.query(`SELECT * FROM product_brands ORDER BY id ASC`);
      const payRes = await client.query(`SELECT * FROM payment_methods ORDER BY id ASC`);
      const areaRes = await client.query(`SELECT * FROM delivery_areas ORDER BY id ASC`);
      const setRes = await client.query(`SELECT * FROM site_settings`);
      const usersRes = await client.query(`SELECT * FROM users WHERE role != 'admin' AND phone != 'admin' ORDER BY id ASC`);
      const adminsRes = await client.query(`SELECT * FROM admins ORDER BY id ASC`);
      const ordersRes = await client.query(`SELECT * FROM orders ORDER BY id DESC`);
      const groupRes = await client.query(`SELECT * FROM groups ORDER BY sort_order ASC, id ASC`);
      const ridersRes = await client.query(`SELECT * FROM delivery_riders ORDER BY id ASC`);
      const expensesRes = await client.query(`SELECT * FROM expenses ORDER BY expense_date DESC, id DESC`);

      // Hydrate groups if available
      if (groupRes.rows.length > 0) {
        DBManager.data.groups = groupRes.rows.map((g) => ({
          id: g.id,
          key: g.key,
          en: g.en,
          bn: g.bn,
          icon: g.icon || '',
          is_active: g.is_active !== undefined ? g.is_active : true,
          sort_order: g.sort_order || 0
        }));
      } else {
        // Seed default groups
        for (let i = 0; i < DBManager.data.groups.length; i++) {
          const g = DBManager.data.groups[i];
          await client.query(
            `INSERT INTO groups (key, en, bn, icon, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (key) DO NOTHING`,
            [g.key, g.en, g.bn, g.icon || '', g.is_active !== false, g.sort_order || (i + 1)]
          );
        }
        console.log(`🌱 Seeded ${DBManager.data.groups.length} default groups to PostgreSQL.`);
      }

      // Hydrate categories & brands if available in PostgreSQL
      if (catRes.rows.length > 0) {
        const brandMap: Record<number, any[]> = {};
        for (const b of brandRes.rows) {
          if (!brandMap[b.category_id]) brandMap[b.category_id] = [];
          brandMap[b.category_id].push({
            id: b.id,
            name: b.name,
            unit: b.unit,
            price: parseFloat(b.price) || 0,
            cost_price: parseFloat(b.cost_price) || 0,
            image: b.image_url || '',
            weekly_prices: typeof b.weekly_prices === 'string' ? JSON.parse(b.weekly_prices) : b.weekly_prices,
            stock: b.stock !== undefined && b.stock !== null ? parseInt(b.stock) : 100,
            force_stock_out: b.force_stock_out || false
          });
        }

        DBManager.data.categories = catRes.rows.map((c) => ({
          id: c.id,
          group: c.group_key,
          en: c.en_name,
          bn: c.bn_name,
          icon: c.icon,
          brands: brandMap[c.id] || []
        }));
      } else {
        // Seed initial categories with weekly prices
        const initialSeedCategories = [
          {
            id: 1,
            group: 'staples',
            en: 'Rice',
            bn: 'চাল',
            icon: '🌾',
            brands: [
              { name: 'মিনিকেট', unit: 'প্রতি কেজি', price: 72, weekly_prices: { sat: 72, sun: 73, mon: 72, tue: 74, wed: 72, thu: 75, fri: 72 } },
              { name: 'নাজিরশাইল', unit: 'প্রতি কেজি', price: 80, weekly_prices: { sat: 80, sun: 82, mon: 80, tue: 81, wed: 80, thu: 82, fri: 80 } },
              { name: 'বাসমতি চাল', unit: 'প্রতি কেজি', price: 310, weekly_prices: { sat: 310, sun: 310, mon: 310, tue: 315, wed: 310, thu: 310, fri: 310 } }
            ]
          },
          {
            id: 2,
            group: 'staples',
            en: 'Lentils',
            bn: 'ডাল',
            icon: '🥣',
            brands: [
              { name: 'মুগ ডাল', unit: 'প্রতি কেজি', price: 135, weekly_prices: { sat: 135, sun: 138, mon: 135, tue: 136, wed: 135, thu: 140, fri: 135 } },
              { name: 'মসুর ডাল (দেশি)', unit: 'প্রতি কেজি', price: 130, weekly_prices: { sat: 130, sun: 132, mon: 130, tue: 130, wed: 130, thu: 135, fri: 130 } },
              { name: 'খেসারি ডাল', unit: 'প্রতি কেজি', price: 85, weekly_prices: { sat: 85, sun: 85, mon: 85, tue: 88, wed: 85, thu: 85, fri: 85 } }
            ]
          },
          {
            id: 5,
            group: 'staples',
            en: 'Cooking Oil',
            bn: 'ভোজ্য তেল',
            icon: '🛢️',
            brands: [
              { name: 'ফ্রেশ সয়াবিন তেল', unit: '৫ লিটার বোতল', price: 890, weekly_prices: { sat: 890, sun: 895, mon: 890, tue: 885, wed: 890, thu: 895, fri: 890 } },
              { name: 'তীর সয়াবিন তেল', unit: '১ লিটার', price: 190, weekly_prices: { sat: 190, sun: 192, mon: 190, tue: 190, wed: 190, thu: 195, fri: 190 } },
              { name: 'সুরেশ সরিষার তেল', unit: '১ লিটার', price: 260, weekly_prices: { sat: 260, sun: 260, mon: 260, tue: 265, wed: 260, thu: 260, fri: 260 } }
            ]
          },
          {
            id: 7,
            group: 'fresh',
            en: 'Onion & Garlic',
            bn: 'পেঁয়াজ ও রসুন',
            icon: '🧅',
            brands: [
              { name: 'দেশি পেঁয়াজ', unit: 'প্রতি কেজি', price: 55, weekly_prices: { sat: 55, sun: 56, mon: 55, tue: 58, wed: 55, thu: 54, fri: 55 } },
              { name: 'ভারতীয় পেঁয়াজ', unit: 'প্রতি কেজি', price: 50, weekly_prices: { sat: 50, sun: 52, mon: 50, tue: 50, wed: 50, thu: 52, fri: 50 } },
              { name: 'দেশি রসুন', unit: 'প্রতি কেজি', price: 180, weekly_prices: { sat: 180, sun: 185, mon: 180, tue: 180, wed: 180, thu: 185, fri: 180 } }
            ]
          }
        ];

        DBManager.data.categories = initialSeedCategories;

        // Persist to Postgres
        for (const cat of initialSeedCategories) {
          await client.query(
            `INSERT INTO categories (id, group_key, en_name, bn_name, icon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
            [cat.id, cat.group, cat.en, cat.bn, cat.icon]
          );
          for (const brand of cat.brands) {
            await client.query(
              `INSERT INTO product_brands (category_id, name, unit, price, weekly_prices) VALUES ($1, $2, $3, $4, $5)`,
              [cat.id, brand.name, brand.unit, brand.price, JSON.stringify(brand.weekly_prices)]
            );
          }
        }
        console.log(`🌱 Seeded ${initialSeedCategories.length} default categories with weekly prices.`);
      }

      // Hydrate delivery areas
      if (areaRes.rows.length > 0) {
        DBManager.data.delivery_areas = areaRes.rows.map((a) => ({
          id: a.id,
          name: a.name,
          charge: parseFloat(a.charge) || 0,
          is_active: a.is_active
        }));
      }

      // Hydrate payment methods
      if (payRes.rows.length > 0) {
        DBManager.data.paymentMethods = payRes.rows.map((p) => ({
          id: p.id,
          code: p.code,
          name_bn: p.name_bn,
          name_en: p.name_en,
          number: p.number || '',
          instructions_bn: p.instructions_bn || '',
          is_active: p.is_active !== undefined ? p.is_active : true
        }));
      } else {
        const defaultPaymentMethods = [
          { code: 'cod', name_bn: 'ক্যাশ অন ডেলিভারি', name_en: 'Cash on Delivery', number: '', instructions_bn: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।', is_active: true },
          { code: 'bkash', name_bn: 'বিকাশ', name_en: 'bKash', number: '01711000000', instructions_bn: 'বিকাশ পার্সোনাল/মার্চেন্ট নম্বরে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি দিন।', is_active: true },
          { code: 'nagad', name_bn: 'নগদ', name_en: 'Nagad', number: '01811000000', instructions_bn: 'নগদ নম্বরে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি দিন।', is_active: true },
          { code: 'rocket', name_bn: 'রকেট', name_en: 'Rocket', number: '01911000000', instructions_bn: 'রকেট নম্বরে সেন্ড মানি করুন এবং ট্রানজেকশন আইডি দিন।', is_active: true }
        ];
        for (const pm of defaultPaymentMethods) {
          await client.query(
            `INSERT INTO payment_methods (code, name_bn, name_en, number, instructions_bn, is_active) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING`,
            [pm.code, pm.name_bn, pm.name_en, pm.number, pm.instructions_bn, pm.is_active]
          );
        }
        const recheckPay = await client.query(`SELECT * FROM payment_methods ORDER BY id ASC`);
        DBManager.data.paymentMethods = recheckPay.rows.map((p) => ({
          id: p.id,
          code: p.code,
          name_bn: p.name_bn,
          name_en: p.name_en,
          number: p.number || '',
          instructions_bn: p.instructions_bn || '',
          is_active: p.is_active !== undefined ? p.is_active : true
        }));
        console.log(`🌱 Seeded ${DBManager.data.paymentMethods.length} default payment methods to PostgreSQL.`);
      }

      // Hydrate site settings
      if (setRes.rows.length > 0) {
        const loadedSettings: any = {};
        for (const row of setRes.rows) {
          try {
            loadedSettings[row.key] = JSON.parse(row.value);
          } catch {
            loadedSettings[row.key] = row.value;
          }
        }
        DBManager.data.settings = { ...DBManager.data.settings, ...loadedSettings };
        console.log(`⚙️ Loaded site settings from PostgreSQL.`);
      }

      // Hydrate customers (users)
      if (usersRes.rows.length > 0) {
        DBManager.data.users = usersRes.rows.map((u) => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
          password_hash: u.password_hash,
          role: u.role || 'user',
          created_at: u.created_at
        }));
      }

      // Hydrate dedicated admins
      if (adminsRes.rows.length > 0) {
        DBManager.data.admins = adminsRes.rows.map((a) => ({
          id: a.id,
          name: a.name,
          username: a.username,
          password_hash: a.password_hash,
          created_at: a.created_at
        }));
      }

      // Hydrate delivery riders
      if (ridersRes.rows.length > 0) {
        const defaultRiderPass = bcrypt.hashSync('123456', 10);
        DBManager.data.delivery_riders = ridersRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          password_hash: r.password_hash || defaultRiderPass,
          vehicle: r.vehicle || 'মোটরসাইকেল',
          area: r.area || 'ঢাকা',
          address: r.address || '',
          is_active: r.is_active !== undefined ? r.is_active : true,
          created_at: r.created_at
        }));
      } else {
        // Seed default delivery riders
        const defaultHash = bcrypt.hashSync('123456', 10);
        const seedRiders = [
          { name: 'করিম আহমেদ', phone: '01711223344', password_hash: defaultHash, vehicle: 'মোটরসাইকেল', area: 'ধানমন্ডি, মিরপুর ও মোহাম্মদপুর', address: 'মিরপুর-১০, ঢাকা', is_active: true },
          { name: 'রফিকুল ইসলাম', phone: '01811223344', password_hash: defaultHash, vehicle: 'সাইকেল', area: 'গুলশান, বনানী ও বাড্ডা', address: 'বাড্ডা, ঢাকা', is_active: true },
          { name: 'তানভীর হাসান', phone: '01911223344', password_hash: defaultHash, vehicle: 'ভ্যান', area: 'উত্তরা ও টঙ্গী', address: 'উত্তরা সেক্টর ৭, ঢাকা', is_active: true }
        ];
        for (const sr of seedRiders) {
          const ins = await client.query(
            `INSERT INTO delivery_riders (name, phone, password_hash, vehicle, area, address, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [sr.name, sr.phone, sr.password_hash, sr.vehicle, sr.area, sr.address, sr.is_active]
          );
          if (ins.rows[0]) {
            DBManager.data.delivery_riders.push(ins.rows[0]);
          }
        }
        console.log(`🌱 Seeded ${DBManager.data.delivery_riders.length} default delivery riders.`);
      }

      // Hydrate expenses
      if (expensesRes.rows.length > 0) {
        DBManager.data.expenses = expensesRes.rows.map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          amount: parseFloat(e.amount) || 0,
          expense_date: e.expense_date ? new Date(e.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: e.notes || '',
          created_at: e.created_at
        }));
      } else {
        // Seed sample expenses
        const todayStr = new Date().toISOString().split('T')[0];
        const seedExpenses = [
          { title: 'দোকান ও গোডাউন ভাড়া (চলতি মাস)', category: 'দোকান ভাড়া', amount: 15000, expense_date: todayStr, notes: 'মাসিক নির্ধারিত ভাড়া' },
          { title: 'প্যাকেজিং ব্যাগ ও কার্টন ক্রয়', category: 'প্যাকেজিং সামগ্রী', amount: 2400, expense_date: todayStr, notes: '৫০০ পিস পরিবেশবান্ধব ব্যাগ' },
          { title: 'রাইডার জ্বালানি ও যাতায়াত বিল', category: 'ডেলিভারি খরচ', amount: 850, expense_date: todayStr, notes: 'দৈনিক জ্বালানি বিল' }
        ];
        for (const se of seedExpenses) {
          const ins = await client.query(
            `INSERT INTO expenses (title, category, amount, expense_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [se.title, se.category, se.amount, se.expense_date, se.notes]
          );
          if (ins.rows[0]) {
            DBManager.data.expenses.push({
              id: ins.rows[0].id,
              title: ins.rows[0].title,
              category: ins.rows[0].category,
              amount: parseFloat(ins.rows[0].amount) || 0,
              expense_date: ins.rows[0].expense_date ? new Date(ins.rows[0].expense_date).toISOString().split('T')[0] : todayStr,
              notes: ins.rows[0].notes || '',
              created_at: ins.rows[0].created_at
            });
          }
        }
        console.log(`🌱 Seeded ${DBManager.data.expenses.length} sample expenses.`);
      }

      // Hydrate orders
      if (ordersRes.rows.length > 0) {
        DBManager.data.orders = ordersRes.rows.map((o) => ({
          id: o.id,
          order_code: o.order_code,
          user_id: o.user_id,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          delivery_address: o.delivery_address,
          delivery_area: o.delivery_area,
          payment_method: o.payment_method,
          sender_number: o.sender_number,
          trx_id: o.trx_id,
          subtotal: parseFloat(o.subtotal) || 0,
          delivery_fee: parseFloat(o.delivery_fee) || 0,
          total_amount: parseFloat(o.total_amount) || 0,
          items_json: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json,
          status: o.status,
          delivery_rider_id: o.delivery_rider_id || null,
          delivery_rider_name: o.delivery_rider_name || null,
          delivery_rider_phone: o.delivery_rider_phone || null,
          delivery_rider_vehicle: o.delivery_rider_vehicle || null,
          delivery_note: o.delivery_note || null,
          payment_status: o.payment_status || (o.payment_method === 'ক্যাশ অন ডেলিভারি' ? 'unpaid' : 'pending'),
          payment_verified_at: o.payment_verified_at || null,
          payment_verified_data: typeof o.payment_verified_data === 'string' ? JSON.parse(o.payment_verified_data) : (o.payment_verified_data || null),
          created_at: o.created_at
        }));
      }

      // Hydrate user carts
      try {
        const cartsRes = await client.query(`SELECT * FROM user_carts`);
        if (cartsRes.rows.length > 0) {
          if (!DBManager.data.carts) DBManager.data.carts = {};
          for (const row of cartsRes.rows) {
            DBManager.data.carts[String(row.user_id)] = typeof row.cart_json === 'string' ? JSON.parse(row.cart_json) : (row.cart_json || {});
          }
        }
      } catch (cartErr: any) {
        // Table might not have records yet, continue safely
      }

      // Ensure PostgreSQL primary key sequences match the max IDs so auto-increment never generates duplicates or collides
      try {
        await client.query(`SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1), true)`);
        await client.query(`SELECT setval('product_brands_id_seq', COALESCE((SELECT MAX(id) FROM product_brands), 1), true)`);
        await client.query(`SELECT setval('groups_id_seq', COALESCE((SELECT MAX(id) FROM groups), 1), true)`);
        await client.query(`SELECT setval('payment_methods_id_seq', COALESCE((SELECT MAX(id) FROM payment_methods), 1), true)`);
        await client.query(`SELECT setval('delivery_areas_id_seq', COALESCE((SELECT MAX(id) FROM delivery_areas), 1), true)`);
        await client.query(`SELECT setval('delivery_riders_id_seq', COALESCE((SELECT MAX(id) FROM delivery_riders), 1), true)`);
        await client.query(`SELECT setval('expenses_id_seq', COALESCE((SELECT MAX(id) FROM expenses), 1), true)`);
        await client.query(`SELECT setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 1), true)`);
      } catch (seqErr: any) {
        console.warn('Notice syncing sequences:', seqErr.message);
      }

      client.release();
      this.isInitialized = true;
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL direct connection not active yet, using active high-performance resilient storage:', err.message);
      isPgConnected = false;
    } finally {
      this.initPromise = null;
    }
  })();

  return this.initPromise;
}

  static getTodayDayKey(): string {
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return dayMap[new Date().getDay()] || 'sat';
  }

  static snapshotDailyPrices() {
    const todayKey = this.getTodayDayKey();
    for (const cat of this.data.categories) {
      if (!cat.brands) continue;
      for (const brand of cat.brands) {
        if (!brand.weekly_prices || typeof brand.weekly_prices !== 'object') {
          brand.weekly_prices = {};
        }
        brand.weekly_prices[todayKey] = Number(brand.price) || 0;
        if (isPgConnected) {
          pool.query(
            `UPDATE product_brands SET weekly_prices = $1 WHERE category_id = $2 AND name = $3`,
            [JSON.stringify(brand.weekly_prices), cat.id, brand.name]
          ).catch((e) => console.warn('PG sync error (daily price snapshot):', e.message));
        }
      }
    }
    console.log(`🕒 [Auto-Snapshot] Synchronized daily closing prices for ${todayKey.toUpperCase()}`);
  }

  // Get Settings
  static getSettings() {
    return this.data.settings;
  }

  static updateSettings(newSettings: Partial<typeof initialData.settings>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    if (isPgConnected) {
      for (const [key, val] of Object.entries(newSettings)) {
        pool.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, JSON.stringify(val)]
        ).catch((e) => console.warn('PG sync error (settings):', e.message));
      }
    }
    return this.data.settings;
  }

  // ==========================================
  // GROUPS MANAGEMENT
  // ==========================================
  static getGroups() {
    return [...this.data.groups].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  static addGroup(groupData: { key?: string; en: string; bn: string; icon?: string; is_active?: boolean }) {
    // Generate clean slug key if not given
    let key = (groupData.key || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!key) {
      key = (groupData.en || 'group').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') + '_' + Date.now().toString().slice(-4);
    }
    
    // Ensure uniqueness
    let finalKey = key;
    let counter = 1;
    while (this.data.groups.some(g => g.key === finalKey)) {
      finalKey = `${key}_${counter++}`;
    }

    const maxSort = this.data.groups.reduce((max, g) => Math.max(max, g.sort_order || 0), 0);
    const newGroup: DBGroup = {
      key: finalKey,
      en: groupData.en.trim(),
      bn: groupData.bn.trim(),
      icon: groupData.icon ? groupData.icon.trim() : '',
      is_active: groupData.is_active !== undefined ? Boolean(groupData.is_active) : true,
      sort_order: maxSort + 1
    };

    this.data.groups.push(newGroup);

    if (isPgConnected) {
      pool.query(
        `INSERT INTO groups (key, en, bn, icon, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE SET en = EXCLUDED.en, bn = EXCLUDED.bn, icon = EXCLUDED.icon, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order`,
        [newGroup.key, newGroup.en, newGroup.bn, newGroup.icon, newGroup.is_active, newGroup.sort_order]
      ).catch((e) => console.warn('PG sync error (group add):', e.message));
    }

    return newGroup;
  }

  static updateGroup(oldKey: string, updates: { key?: string; en?: string; bn?: string; icon?: string; is_active?: boolean; sort_order?: number }) {
    const idx = this.data.groups.findIndex(g => g.key === oldKey);
    if (idx === -1) return null;

    const currentGroup = this.data.groups[idx];
    const newKey = updates.key && updates.key.trim() !== oldKey ? updates.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') : oldKey;

    const updatedGroup: DBGroup = {
      ...currentGroup,
      key: newKey,
      en: updates.en !== undefined ? updates.en.trim() : currentGroup.en,
      bn: updates.bn !== undefined ? updates.bn.trim() : currentGroup.bn,
      icon: updates.icon !== undefined ? updates.icon.trim() : (currentGroup.icon || ''),
      is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : currentGroup.is_active,
      sort_order: updates.sort_order !== undefined ? Number(updates.sort_order) : currentGroup.sort_order
    };

    this.data.groups[idx] = updatedGroup;

    // If key changed, update all categories in this group
    if (newKey !== oldKey) {
      for (const cat of this.data.categories) {
        if (cat.group === oldKey) {
          cat.group = newKey;
        }
      }
    }

    if (isPgConnected) {
      if (newKey !== oldKey) {
        // Update key in groups and categories
        pool.query(
          `UPDATE groups SET key = $1, en = $2, bn = $3, icon = $4, is_active = $5, sort_order = $6 WHERE key = $7`,
          [updatedGroup.key, updatedGroup.en, updatedGroup.bn, updatedGroup.icon, updatedGroup.is_active, updatedGroup.sort_order, oldKey]
        ).catch((e) => console.warn('PG sync error (group update key):', e.message));

        pool.query(
          `UPDATE categories SET group_key = $1 WHERE group_key = $2`,
          [newKey, oldKey]
        ).catch((e) => console.warn('PG sync error (cat group_key update):', e.message));
      } else {
        pool.query(
          `UPDATE groups SET en = $1, bn = $2, icon = $3, is_active = $4, sort_order = $5 WHERE key = $6`,
          [updatedGroup.en, updatedGroup.bn, updatedGroup.icon, updatedGroup.is_active, updatedGroup.sort_order, oldKey]
        ).catch((e) => console.warn('PG sync error (group update):', e.message));
      }
    }

    return updatedGroup;
  }

  static deleteGroup(groupKey: string) {
    // 1. Find all categories belonging to this group
    const categoriesToDelete = this.data.categories.filter(c => c.group === groupKey);
    const catIdsToDelete = categoriesToDelete.map(c => c.id);

    // 2. Cascade delete categories & products from in-memory store
    this.data.categories = this.data.categories.filter(c => c.group !== groupKey);
    this.data.groups = this.data.groups.filter(g => g.key !== groupKey);

    // 3. Cascade delete in PostgreSQL
    if (isPgConnected) {
      // Deleting categories will CASCADE to product_brands due to REFERENCES categories(id) ON DELETE CASCADE
      if (catIdsToDelete.length > 0) {
        pool.query(`DELETE FROM categories WHERE group_key = $1`, [groupKey])
          .catch((e) => console.warn('PG sync error (cascade cat delete):', e.message));
      }
      pool.query(`DELETE FROM groups WHERE key = $1`, [groupKey])
        .catch((e) => console.warn('PG sync error (group delete):', e.message));
    }

    return {
      success: true,
      deletedGroupKey: groupKey,
      deletedCategoriesCount: categoriesToDelete.length
    };
  }

  static toggleGroupActive(groupKey: string, isActive: boolean) {
    const group = this.data.groups.find(g => g.key === groupKey);
    if (group) {
      group.is_active = Boolean(isActive);
      if (isPgConnected) {
        pool.query(`UPDATE groups SET is_active = $1 WHERE key = $2`, [group.is_active, groupKey])
          .catch((e) => console.warn('PG sync error (group toggle):', e.message));
      }
      return group;
    }
    return null;
  }

  static reorderGroups(orderedKeys: string[]) {
    orderedKeys.forEach((key, index) => {
      const g = this.data.groups.find(item => item.key === key);
      if (g) {
        g.sort_order = index + 1;
        if (isPgConnected) {
          pool.query(`UPDATE groups SET sort_order = $1 WHERE key = $2`, [g.sort_order, key])
            .catch((e) => console.warn('PG sync error (group reorder):', e.message));
        }
      }
    });
    return this.getGroups();
  }

  // Categories and Brands
  static getCategories() {
    return this.data.categories;
  }

  static async addCategory(cat: any) {
    let newId = Math.max(0, ...this.data.categories.map(c => c.id)) + 1;
    if (isPgConnected) {
      try {
        const res = await pool.query(
          `INSERT INTO categories (group_key, en_name, bn_name, icon) VALUES ($1, $2, $3, $4) RETURNING id`,
          [cat.group || '', cat.en || '', cat.bn || '', cat.icon || '📦']
        );
        if (res.rows[0]?.id) {
          newId = res.rows[0].id;
        }
      } catch (e: any) {
        console.warn('PG sync error (cat add):', e.message);
        try {
          // If sequence was collided, sync sequence and retry
          await pool.query(`SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1), true)`);
          const res2 = await pool.query(
            `INSERT INTO categories (group_key, en_name, bn_name, icon) VALUES ($1, $2, $3, $4) RETURNING id`,
            [cat.group || '', cat.en || '', cat.bn || '', cat.icon || '📦']
          );
          if (res2.rows[0]?.id) {
            newId = res2.rows[0].id;
          }
        } catch (e2: any) {
          console.warn('PG sync retry error (cat add):', e2.message);
          // Insert with explicit id if auto-increment fails
          try {
            await pool.query(
              `INSERT INTO categories (id, group_key, en_name, bn_name, icon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET group_key = EXCLUDED.group_key, en_name = EXCLUDED.en_name, bn_name = EXCLUDED.bn_name, icon = EXCLUDED.icon`,
              [newId, cat.group || '', cat.en || '', cat.bn || '', cat.icon || '📦']
            );
          } catch (e3: any) {
            console.warn('PG sync explicit id error (cat add):', e3.message);
          }
        }
      }
    }
    const newCat = { ...cat, id: newId, brands: cat.brands || [] };
    this.data.categories.push(newCat);
    return newCat;
  }

  static updateCategory(id: number, updated: any) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...updated };
      if (isPgConnected) {
        pool.query(
          `UPDATE categories SET group_key = $1, en_name = $2, bn_name = $3, icon = $4 WHERE id = $5`,
          [this.data.categories[idx].group, this.data.categories[idx].en, this.data.categories[idx].bn, this.data.categories[idx].icon, id]
        ).catch((e) => console.warn('PG sync error (cat update):', e.message));
      }
      return this.data.categories[idx];
    }
    return null;
  }

  static deleteCategory(id: number) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (isPgConnected) {
      pool.query(`DELETE FROM categories WHERE id = $1`, [id]).catch((e) => console.warn('PG sync error (cat del):', e.message));
    }
    return true;
  }

  static async addBrandToCategory(categoryId: number, brand: any) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (cat) {
      const newBrandId = Math.floor(1000 + Math.random() * 9000);
      const priceNum = Number(brand.price) || 0;
      const todayKey = this.getTodayDayKey();
      
      const defaultWeekly: Record<string, number> = {
        sat: priceNum,
        sun: priceNum,
        mon: priceNum,
        tue: priceNum,
        wed: priceNum,
        thu: priceNum,
        fri: priceNum,
        ...(brand.weekly_prices || {})
      };
      defaultWeekly[todayKey] = priceNum;

      const newBrand = {
        id: newBrandId,
        name: brand.name,
        unit: brand.unit,
        price: priceNum,
        cost_price: brand.cost_price !== undefined ? Number(brand.cost_price) : 0,
        image: brand.image || '',
        weekly_prices: defaultWeekly,
        stock: brand.stock !== undefined ? Number(brand.stock) : 100,
        force_stock_out: brand.force_stock_out || false
      };

      cat.brands.push(newBrand);
      if (isPgConnected) {
        try {
          // CRITICAL: Ensure parent category exists in Postgres first so foreign key constraint "product_brands_category_id_fkey" is never violated!
          await pool.query(
            `INSERT INTO categories (id, group_key, en_name, bn_name, icon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
            [cat.id, cat.group || '', cat.en || '', cat.bn || '', cat.icon || '📦']
          );

          const pbRes = await pool.query(
            `INSERT INTO product_brands (category_id, name, unit, price, cost_price, image_url, weekly_prices, stock, force_stock_out) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [categoryId, newBrand.name, newBrand.unit, newBrand.price, newBrand.cost_price, newBrand.image, JSON.stringify(newBrand.weekly_prices), newBrand.stock, newBrand.force_stock_out]
          );
          if (pbRes.rows[0]?.id) {
            newBrand.id = pbRes.rows[0].id;
          }
        } catch (e: any) {
          console.warn('PG sync error (brand add):', e.message);
        }
      }
      return newBrand;
    }
    return null;
  }

  static getBrandById(productId: number) {
    for (const cat of this.data.categories) {
      const brand = cat.brands.find(b => b.id === productId);
      if (brand) {
        return {
          ...brand,
          category_id: cat.id,
          category_name: cat.bn,
          category_en: cat.en,
          group: cat.group
        };
      }
    }
    return null;
  }

  static getAllProducts(options?: { category_id?: number; search?: string }) {
    const products: any[] = [];
    const searchLower = options?.search ? options.search.toLowerCase().trim() : null;

    for (const cat of this.data.categories) {
      if (options?.category_id && cat.id !== options.category_id) {
        continue;
      }
      for (const brand of cat.brands) {
        if (searchLower) {
          const match = brand.name.toLowerCase().includes(searchLower) ||
                        (cat.bn && cat.bn.toLowerCase().includes(searchLower)) ||
                        (cat.en && cat.en.toLowerCase().includes(searchLower));
          if (!match) continue;
        }
        products.push({
          ...brand,
          category_id: cat.id,
          category_name: cat.bn,
          category_en: cat.en,
          group: cat.group
        });
      }
    }
    return products;
  }

  static updateBrandById(productId: number, updated: any) {
    for (const cat of this.data.categories) {
      const bIdx = cat.brands.findIndex(b => b.id === productId);
      if (bIdx !== -1) {
        const currentBrand = cat.brands[bIdx];
        const newPrice = updated.price !== undefined ? Number(updated.price) : currentBrand.price;
        const todayKey = this.getTodayDayKey();

        const updatedWeekly = {
          ...(currentBrand.weekly_prices || {
            sat: currentBrand.price,
            sun: currentBrand.price,
            mon: currentBrand.price,
            tue: currentBrand.price,
            wed: currentBrand.price,
            thu: currentBrand.price,
            fri: currentBrand.price
          }),
          ...(updated.weekly_prices || {})
        };

        if (updated.price !== undefined) {
          updatedWeekly[todayKey] = newPrice;
        }

        cat.brands[bIdx] = {
          ...currentBrand,
          ...updated,
          price: newPrice,
          cost_price: updated.cost_price !== undefined ? Number(updated.cost_price) : currentBrand.cost_price,
          weekly_prices: updatedWeekly,
          stock: updated.stock !== undefined ? Number(updated.stock) : currentBrand.stock,
          force_stock_out: updated.force_stock_out !== undefined ? Boolean(updated.force_stock_out) : currentBrand.force_stock_out
        };

        if (isPgConnected) {
          pool.query(
            `UPDATE product_brands SET name = $1, unit = $2, price = $3, cost_price = $4, image_url = $5, weekly_prices = $6, stock = $7, force_stock_out = $8 WHERE id = $9`,
            [cat.brands[bIdx].name, cat.brands[bIdx].unit, cat.brands[bIdx].price, cat.brands[bIdx].cost_price, cat.brands[bIdx].image || '', JSON.stringify(cat.brands[bIdx].weekly_prices), cat.brands[bIdx].stock, cat.brands[bIdx].force_stock_out, productId]
          ).catch((e) => console.warn('PG sync error (brand update by ID):', e.message));
        }
        return cat.brands[bIdx];
      }
    }
    return null;
  }

  static deleteBrandById(productId: number) {
    for (const cat of this.data.categories) {
      const bIdx = cat.brands.findIndex(b => b.id === productId);
      if (bIdx !== -1) {
        cat.brands.splice(bIdx, 1);
        if (isPgConnected) {
          pool.query(`DELETE FROM product_brands WHERE id = $1`, [productId]).catch((e) => console.warn('PG sync error (brand del by ID):', e.message));
        }
        return true;
      }
    }
    return false;
  }

  static updateBrand(categoryId: number, brandName: string, updated: any) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (cat) {
      const bIdx = cat.brands.findIndex(b => b.name === brandName);
      if (bIdx !== -1) {
        const currentBrand = cat.brands[bIdx];
        const newPrice = updated.price !== undefined ? Number(updated.price) : currentBrand.price;
        const todayKey = this.getTodayDayKey();

        const updatedWeekly = {
          ...(currentBrand.weekly_prices || {
            sat: currentBrand.price,
            sun: currentBrand.price,
            mon: currentBrand.price,
            tue: currentBrand.price,
            wed: currentBrand.price,
            thu: currentBrand.price,
            fri: currentBrand.price
          }),
          ...(updated.weekly_prices || {})
        };

        if (updated.price !== undefined) {
          updatedWeekly[todayKey] = newPrice;
        }

        cat.brands[bIdx] = {
          ...currentBrand,
          ...updated,
          price: newPrice,
          cost_price: updated.cost_price !== undefined ? Number(updated.cost_price) : currentBrand.cost_price,
          weekly_prices: updatedWeekly,
          stock: updated.stock !== undefined ? Number(updated.stock) : currentBrand.stock,
          force_stock_out: updated.force_stock_out !== undefined ? Boolean(updated.force_stock_out) : currentBrand.force_stock_out
        };

        if (isPgConnected) {
          pool.query(
            `UPDATE product_brands SET name = $1, unit = $2, price = $3, cost_price = $4, image_url = $5, weekly_prices = $6, stock = $7, force_stock_out = $8 WHERE category_id = $9 AND name = $10`,
            [cat.brands[bIdx].name, cat.brands[bIdx].unit, cat.brands[bIdx].price, cat.brands[bIdx].cost_price, cat.brands[bIdx].image || '', JSON.stringify(cat.brands[bIdx].weekly_prices), cat.brands[bIdx].stock, cat.brands[bIdx].force_stock_out, categoryId, brandName]
          ).catch((e) => console.warn('PG sync error (brand update):', e.message));
        }
        return cat.brands[bIdx];
      }
    }
    return null;
  }

  static deleteBrand(categoryId: number, brandName: string) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (cat) {
      cat.brands = cat.brands.filter(b => b.name !== brandName);
      if (isPgConnected) {
        pool.query(`DELETE FROM product_brands WHERE category_id = $1 AND name = $2`, [categoryId, brandName]).catch((e) => console.warn('PG sync error (brand del):', e.message));
      }
      return true;
    }
    return false;
  }

  static updateBrandWeeklyPrices(categoryId: number, brandName: string, weeklyPrices: Record<string, number>) {
    const cat = this.data.categories.find(c => c.id === categoryId);
    if (cat) {
      const bIdx = cat.brands.findIndex(b => b.name === brandName);
      if (bIdx !== -1) {
        const currentBrand = cat.brands[bIdx] as any;
        currentBrand.weekly_prices = {
          ...(currentBrand.weekly_prices || {}),
          ...weeklyPrices
        };
        if (isPgConnected) {
          pool.query(
            `UPDATE product_brands SET weekly_prices = $1 WHERE category_id = $2 AND name = $3`,
            [JSON.stringify(currentBrand.weekly_prices), categoryId, brandName]
          ).catch((e) => console.warn('PG sync error (weekly prices):', e.message));
        }
        return currentBrand;
      }
    }
    return null;
  }

  // ==========================================
  // CUSTOMER USERS (Separate from Admins)
  // ==========================================
  static getUsers() {
    return this.data.users.map(({ password_hash, ...u }) => u);
  }

  static findUserByPhone(phone: string) {
    return this.data.users.find(u => u.phone === phone);
  }

  static findUserById(id: number) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...rest } = user;
    return rest;
  }

  static createUser(user: { name: string; phone: string; password: string }) {
    const newId = Math.max(0, ...this.data.users.map(u => u.id)) + 1;
    const passwordHash = bcrypt.hashSync(user.password, 10);
    const newUser = {
      id: newId,
      name: user.name,
      phone: user.phone,
      password_hash: passwordHash,
      role: 'user',
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    if (isPgConnected) {
      pool.query(
        `INSERT INTO users (name, phone, password_hash, role) VALUES ($1, $2, $3, $4)`,
        [newUser.name, newUser.phone, newUser.password_hash, 'user']
      ).catch((e) => console.warn('PG sync error (user create):', e.message));
    }
    const { password_hash, ...rest } = newUser;
    return rest;
  }

  static updateUserProfile(id: number, updates: { name?: string; password?: string }) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.password) user.password_hash = bcrypt.hashSync(updates.password, 10);
    if (isPgConnected) {
      pool.query(
        `UPDATE users SET name = $1, password_hash = $2 WHERE id = $3`,
        [user.name, user.password_hash, user.id]
      ).catch((e) => console.warn('PG sync error (user update):', e.message));
    }
    const { password_hash, ...rest } = user;
    return rest;
  }

  // ==========================================
  // DEDICATED ADMINS (Separate from Users)
  // ==========================================
  static findAdminByUsername(username: string) {
    if (!username) return null;
    const lower = username.trim().toLowerCase();
    return this.data.admins.find(a => a.username && a.username.toLowerCase() === lower);
  }

  static findAdminById(id: number) {
    const admin = this.data.admins.find(a => a.id === id);
    if (!admin) return null;
    const { password_hash, ...rest } = admin;
    return { ...rest, role: 'admin' };
  }

  static async updateAdminProfile(id: number, updates: { name?: string; username?: string; password?: string }) {
    const admin = this.data.admins.find(a => a.id === id);
    if (!admin) return null;
    if (updates.name !== undefined && updates.name.trim()) admin.name = updates.name.trim();
    if (updates.username !== undefined && updates.username.trim()) admin.username = updates.username.trim();
    if (updates.password !== undefined && updates.password.trim()) {
      admin.password_hash = bcrypt.hashSync(updates.password.trim(), 10);
    }

    if (isPgConnected) {
      try {
        await pool.query(
          `UPDATE admins SET name = $1, username = $2, password_hash = $3 WHERE id = $4`,
          [admin.name, admin.username, admin.password_hash, admin.id]
        );
      } catch (e: any) {
        console.warn('PG sync error (admin update):', e.message);
      }
    }
    const { password_hash, ...rest } = admin;
    return { ...rest, role: 'admin' };
  }

  // Payment Methods
  static getPaymentMethods() {
    return this.data.paymentMethods;
  }

  static updatePaymentMethod(id: number | string, update: any) {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const idx = this.data.paymentMethods.findIndex(p => (Number.isInteger(numId) && p.id === numId) || (p.code && p.code === String(id)));
    if (idx !== -1) {
      this.data.paymentMethods[idx] = { ...this.data.paymentMethods[idx], ...update };
      const current = this.data.paymentMethods[idx];
      if (isPgConnected) {
        pool.query(
          `UPDATE payment_methods SET name_bn = $1, name_en = $2, number = $3, instructions_bn = $4, is_active = $5 WHERE id = $6 OR code = $7`,
          [current.name_bn, current.name_en, current.number || '', current.instructions_bn || '', current.is_active !== false, current.id, current.code]
        ).catch((e) => console.warn('PG sync error (payment update):', e.message));
      }
      return this.data.paymentMethods[idx];
    }
    return null;
  }

  static async addPaymentMethod(method: any) {
    const code = (method.code || '').trim().toLowerCase();
    // Check if a payment method with this code or id already exists in memory
    const existingIndex = this.data.paymentMethods.findIndex(
      p => (code && p.code.toLowerCase() === code) || (method.id && p.id === method.id)
    );

    if (existingIndex !== -1) {
      const existing = this.data.paymentMethods[existingIndex];
      const updated = {
        ...existing,
        ...method,
        id: existing.id,
        code: existing.code
      };
      this.data.paymentMethods[existingIndex] = updated;

      if (isPgConnected) {
        pool.query(
          `INSERT INTO payment_methods (code, name_bn, name_en, number, instructions_bn, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (code) DO UPDATE SET
             name_bn = EXCLUDED.name_bn,
             name_en = EXCLUDED.name_en,
             number = EXCLUDED.number,
             instructions_bn = EXCLUDED.instructions_bn,
             is_active = EXCLUDED.is_active`,
          [updated.code, updated.name_bn, updated.name_en, updated.number || '', updated.instructions_bn || '', updated.is_active !== undefined ? updated.is_active : true]
        ).catch((e) => console.warn('PG sync error (payment upsert):', e.message));
      }
      return updated;
    }

    const newId = Math.max(0, ...this.data.paymentMethods.map(p => p.id)) + 1;
    const newMethod = {
      ...method,
      id: newId,
      code: code || `pm_${Date.now()}`,
      is_active: method.is_active !== undefined ? method.is_active : true
    };
    this.data.paymentMethods.push(newMethod);

    if (isPgConnected) {
      try {
        const res = await pool.query(
          `INSERT INTO payment_methods (code, name_bn, name_en, number, instructions_bn, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (code) DO UPDATE SET
             name_bn = EXCLUDED.name_bn,
             name_en = EXCLUDED.name_en,
             number = EXCLUDED.number,
             instructions_bn = EXCLUDED.instructions_bn,
             is_active = EXCLUDED.is_active
           RETURNING *`,
          [newMethod.code, newMethod.name_bn, newMethod.name_en, newMethod.number || '', newMethod.instructions_bn || '', newMethod.is_active]
        );
        if (res.rows[0]) {
          newMethod.id = res.rows[0].id;
        }
      } catch (e: any) {
        console.warn('PG sync error (payment add):', e.message);
      }
    }
    return newMethod;
  }

  // Delivery Areas & Charge
  static getDeliveryAreas() {
    return this.data.delivery_areas || [];
  }

  static addDeliveryArea(area: { name: string; charge?: number; is_active?: boolean }) {
    if (!this.data.delivery_areas) this.data.delivery_areas = [];
    const newId = Math.max(0, ...this.data.delivery_areas.map(a => a.id || 0)) + 1;
    const newArea = {
      id: newId,
      name: area.name,
      charge: typeof area.charge === 'number' && !isNaN(area.charge) ? area.charge : (this.data.settings.default_delivery_fee || 60),
      is_active: area.is_active !== undefined ? area.is_active : true
    };
    this.data.delivery_areas.push(newArea);
    if (isPgConnected) {
      pool.query(
        `INSERT INTO delivery_areas (name, charge, is_active) VALUES ($1, $2, $3)`,
        [newArea.name, newArea.charge, newArea.is_active]
      ).catch((e) => console.warn('PG sync error (area add):', e.message));
    }
    return newArea;
  }

  static updateDeliveryArea(id: number, update: any) {
    if (!this.data.delivery_areas) this.data.delivery_areas = [];
    const idx = this.data.delivery_areas.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.delivery_areas[idx] = { ...this.data.delivery_areas[idx], ...update };
      if (isPgConnected) {
        pool.query(
          `UPDATE delivery_areas SET name = $1, charge = $2, is_active = $3 WHERE id = $4`,
          [this.data.delivery_areas[idx].name, this.data.delivery_areas[idx].charge, this.data.delivery_areas[idx].is_active, id]
        ).catch((e) => console.warn('PG sync error (area update):', e.message));
      }
      return this.data.delivery_areas[idx];
    }
    return null;
  }

  static deleteDeliveryArea(id: number) {
    if (!this.data.delivery_areas) this.data.delivery_areas = [];
    const initialLen = this.data.delivery_areas.length;
    this.data.delivery_areas = this.data.delivery_areas.filter(a => a.id !== id);
    if (isPgConnected) {
      pool.query(`DELETE FROM delivery_areas WHERE id = $1`, [id]).catch((e) => console.warn('PG sync error (area del):', e.message));
    }
    return this.data.delivery_areas.length < initialLen;
  }

  // Orders
  static getOrders() {
    return this.data.orders;
  }

  static getOrdersByUserId(userId: number) {
    return this.data.orders.filter(o => o.user_id === userId);
  }

  static createOrder(order: any) {
    // 1. Verify stock and populate cost_price
    for (let i = 0; i < order.items_json.length; i++) {
      const item = order.items_json[i];
      let brand: any = null;
      // Match by product ID first, then category & name fallback
      if (item.productId || item.product_id || item.id) {
        const pId = item.productId || item.product_id || item.id;
        for (const cat of this.data.categories) {
          const b = cat.brands.find((b: any) => b.id === pId);
          if (b) {
            brand = b;
            break;
          }
        }
      }
      if (!brand) {
        for (const cat of this.data.categories) {
          if (cat.id === item.catId) {
            const b = cat.brands.find((b: any) => b.name === item.brand);
            if (b) {
              brand = b;
              break;
            }
          }
        }
      }

      if (brand) {
        if (brand.force_stock_out || (brand.stock !== undefined && brand.stock < item.qty)) {
          throw new Error(`'${item.brand || brand.name}' এর স্টক পর্যাপ্ত নয় (বর্তমান স্টক: ${brand.stock || 0})`);
        }
        order.items_json[i].cost_price = brand.cost_price || 0; // Populate cost price
        if (brand.id) order.items_json[i].productId = brand.id;
      } else {
        throw new Error(`'${item.brand}' পণ্যটি পাওয়া যায়নি`);
      }
    }

    // 2. Deduct stock
    for (const item of order.items_json) {
      let brand: any = null;
      let matchedCat: any = null;
      const pId = item.productId || item.product_id || item.id;
      if (pId) {
        for (const cat of this.data.categories) {
          const b = cat.brands.find((b: any) => b.id === pId);
          if (b) {
            brand = b;
            matchedCat = cat;
            break;
          }
        }
      }
      if (!brand) {
        for (const cat of this.data.categories) {
          if (cat.id === item.catId) {
            const b = cat.brands.find((b: any) => b.name === item.brand);
            if (b) {
              brand = b;
              matchedCat = cat;
              break;
            }
          }
        }
      }

      if (brand && brand.stock !== undefined) {
        brand.stock -= item.qty;
        if (isPgConnected) {
          if (brand.id) {
            pool.query(`UPDATE product_brands SET stock = stock - $1 WHERE id = $2`, [item.qty, brand.id]).catch((e: any) => console.warn('PG sync error (stock decrement by id):', e.message));
          } else if (matchedCat) {
            pool.query(`UPDATE product_brands SET stock = stock - $1 WHERE category_id = $2 AND name = $3`, [item.qty, matchedCat.id, brand.name]).catch((e: any) => console.warn('PG sync error (stock decrement):', e.message));
          }
        }
      }
    }

    const newId = Math.max(0, ...this.data.orders.map(o => o.id || 0)) + 1;
    const orderCode = 'AE-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: newId,
      order_code: orderCode,
      ...order,
      status: 'পেন্ডিং',
      payment_status: order.payment_status || (order.payment_method === 'ক্যাশ অন ডেলিভারি' ? 'unpaid' : 'pending'),
      payment_verified_at: order.payment_verified_at || null,
      payment_verified_data: order.payment_verified_data || null,
      created_at: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    if (isPgConnected) {
      pool.query(
        `INSERT INTO orders (order_code, user_id, customer_name, customer_phone, delivery_address, delivery_area, payment_method, sender_number, trx_id, subtotal, delivery_fee, total_amount, items_json, status, payment_status, payment_verified_at, payment_verified_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          newOrder.order_code,
          newOrder.user_id || null,
          newOrder.customer_name,
          newOrder.customer_phone,
          newOrder.delivery_address,
          newOrder.delivery_area,
          newOrder.payment_method,
          newOrder.sender_number || '',
          newOrder.trx_id || '',
          newOrder.subtotal,
          newOrder.delivery_fee,
          newOrder.total_amount,
          JSON.stringify(newOrder.items_json),
          newOrder.status,
          newOrder.payment_status,
          newOrder.payment_verified_at,
          newOrder.payment_verified_data ? JSON.stringify(newOrder.payment_verified_data) : null
        ]
      ).catch((e) => console.warn('PG sync error (order create):', e.message));
    }
    return newOrder;
  }

  static updateOrderStatus(orderId: number, status: string, riderInfo?: { rider_id?: number; rider_name?: string; rider_phone?: string; rider_vehicle?: string; delivery_note?: string }) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      if (status) {
        order.status = status;
      }
      
      if (riderInfo) {
        if (riderInfo.rider_id !== undefined) {
          order.delivery_rider_id = riderInfo.rider_id || null;
          if (riderInfo.rider_id) {
            const foundRider = this.data.delivery_riders.find(r => r.id === Number(riderInfo.rider_id));
            if (foundRider) {
              if (!riderInfo.rider_name) order.delivery_rider_name = foundRider.name;
              if (!riderInfo.rider_phone) order.delivery_rider_phone = foundRider.phone;
              if (!riderInfo.rider_vehicle) order.delivery_rider_vehicle = foundRider.vehicle;
            }
          } else {
            order.delivery_rider_name = null;
            order.delivery_rider_phone = null;
            order.delivery_rider_vehicle = null;
          }
        }
        if (riderInfo.rider_name !== undefined) order.delivery_rider_name = riderInfo.rider_name;
        if (riderInfo.rider_phone !== undefined) order.delivery_rider_phone = riderInfo.rider_phone;
        if (riderInfo.rider_vehicle !== undefined) order.delivery_rider_vehicle = riderInfo.rider_vehicle;
        if (riderInfo.delivery_note !== undefined) order.delivery_note = riderInfo.delivery_note;
      }

      if (isPgConnected) {
        pool.query(
          `UPDATE orders SET status = $1, delivery_rider_id = $2, delivery_rider_name = $3, delivery_rider_phone = $4, delivery_rider_vehicle = $5, delivery_note = $6 WHERE id = $7`,
          [
            order.status,
            order.delivery_rider_id || null,
            order.delivery_rider_name || null,
            order.delivery_rider_phone || null,
            order.delivery_rider_vehicle || null,
            order.delivery_note || null,
            orderId
          ]
        ).catch((e) => console.warn('PG sync error (order status & rider):', e.message));
      }
      
      // Stock Restoration if Cancelled
      if (status === 'বাতিল' && oldStatus !== 'বাতিল') {
        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        for (const item of items) {
          let brand: any = null;
          let matchedCat: any = null;
          const pId = item.productId || item.product_id || item.id;
          if (pId) {
            for (const cat of this.data.categories) {
              const b = cat.brands.find((b: any) => b.id === pId);
              if (b) {
                brand = b;
                matchedCat = cat;
                break;
              }
            }
          }
          if (!brand) {
            for (const cat of this.data.categories) {
              if (cat.id === item.catId) {
                const b = cat.brands.find((b: any) => b.name === item.brand);
                if (b) {
                  brand = b;
                  matchedCat = cat;
                  break;
                }
              }
            }
          }

          if (brand && brand.stock !== undefined) {
            brand.stock += item.qty;
            if (isPgConnected) {
              if (brand.id) {
                pool.query(`UPDATE product_brands SET stock = stock + $1 WHERE id = $2`, [item.qty, brand.id]).catch((e: any) => console.warn('PG sync error (stock increment by id):', e.message));
              } else if (matchedCat) {
                pool.query(`UPDATE product_brands SET stock = stock + $1 WHERE category_id = $2 AND name = $3`, [item.qty, matchedCat.id, brand.name]).catch((e: any) => console.warn('PG sync error (stock increment):', e.message));
              }
            }
          }
        }
      } else if (oldStatus === 'বাতিল' && status !== 'বাতিল') {
        // If un-cancelled, deduct stock again
        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        for (const item of items) {
          let brand: any = null;
          let matchedCat: any = null;
          const pId = item.productId || item.product_id || item.id;
          if (pId) {
            for (const cat of this.data.categories) {
              const b = cat.brands.find((b: any) => b.id === pId);
              if (b) {
                brand = b;
                matchedCat = cat;
                break;
              }
            }
          }
          if (!brand) {
            for (const cat of this.data.categories) {
              if (cat.id === item.catId) {
                const b = cat.brands.find((b: any) => b.name === item.brand);
                if (b) {
                  brand = b;
                  matchedCat = cat;
                  break;
                }
              }
            }
          }

          if (brand && brand.stock !== undefined) {
            brand.stock -= item.qty;
            if (isPgConnected) {
              if (brand.id) {
                pool.query(`UPDATE product_brands SET stock = stock - $1 WHERE id = $2`, [item.qty, brand.id]).catch((e: any) => console.warn('PG sync error (stock decrement by id):', e.message));
              } else if (matchedCat) {
                pool.query(`UPDATE product_brands SET stock = stock - $1 WHERE category_id = $2 AND name = $3`, [item.qty, matchedCat.id, brand.name]).catch((e: any) => console.warn('PG sync error (stock decrement):', e.message));
              }
            }
          }
        }
      }

      return order;
    }
    return null;
  }

  static assignRiderToOrder(orderId: number, riderId: number) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    const rider = this.data.delivery_riders.find(r => r.id === riderId);
    if (!rider) return null;

    order.delivery_rider_id = rider.id;
    order.delivery_rider_name = rider.name;
    order.delivery_rider_phone = rider.phone;
    order.delivery_rider_vehicle = rider.vehicle;

    if (isPgConnected) {
      pool.query(
        `UPDATE orders SET delivery_rider_id = $1, delivery_rider_name = $2, delivery_rider_phone = $3, delivery_rider_vehicle = $4 WHERE id = $5`,
        [rider.id, rider.name, rider.phone, rider.vehicle, orderId]
      ).catch((e) => console.warn('PG sync error (assign rider):', e.message));
    }
    return order;
  }

  static findOrderByCode(code: string) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    return this.data.orders.find(o => 
      (o.order_code && o.order_code.toUpperCase() === cleanCode) || 
      `#ORD-${o.id}`.toUpperCase() === cleanCode || 
      String(o.id) === cleanCode
    ) || null;
  }

  // Delivery Riders CRUD
  static getDeliveryRiders() {
    return this.data.delivery_riders;
  }

  static findRiderByPhone(phone: string) {
    if (!phone) return null;
    const clean = phone.trim();
    const cleanDigits = clean.replace(/[^0-9]/g, '');
    return this.data.delivery_riders.find(r => 
      r.phone === clean || 
      (cleanDigits && r.phone.replace(/[^0-9]/g, '') === cleanDigits)
    ) || null;
  }

  static findRiderById(id: number) {
    return this.data.delivery_riders.find(r => r.id === id) || null;
  }

  static async addDeliveryRider(rider: { name: string; phone: string; password?: string; vehicle?: string; area?: string; address?: string; is_active?: boolean }) {
    const newId = Math.max(0, ...this.data.delivery_riders.map(r => r.id || 0)) + 1;
    const rawPass = rider.password && rider.password.trim().length > 0 ? rider.password.trim() : '123456';
    const password_hash = bcrypt.hashSync(rawPass, 10);

    const newRider: DeliveryRider = {
      id: newId,
      name: rider.name.trim(),
      phone: rider.phone.trim(),
      password_hash,
      vehicle: rider.vehicle?.trim() || 'মোটরসাইকেল',
      area: rider.area?.trim() || 'ঢাকা',
      address: rider.address?.trim() || '',
      is_active: rider.is_active !== undefined ? rider.is_active : true,
      created_at: new Date().toISOString()
    };

    if (isPgConnected) {
      try {
        const res = await pool.query(
          `INSERT INTO delivery_riders (name, phone, password_hash, vehicle, area, address, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [newRider.name, newRider.phone, newRider.password_hash, newRider.vehicle, newRider.area, newRider.address, newRider.is_active]
        );
        if (res.rows[0]) {
          newRider.id = res.rows[0].id;
        }
      } catch (err: any) {
        console.warn('PG error (insert rider):', err.message);
      }
    }

    this.data.delivery_riders.push(newRider);
    return newRider;
  }

  static async updateDeliveryRider(id: number, updates: Partial<DeliveryRider> & { password?: string }) {
    const index = this.data.delivery_riders.findIndex(r => r.id === id);
    if (index === -1) return null;

    const existing = this.data.delivery_riders[index];
    let password_hash = existing.password_hash || bcrypt.hashSync('123456', 10);
    if (updates.password && updates.password.trim().length > 0) {
      password_hash = bcrypt.hashSync(updates.password.trim(), 10);
    }

    const updated: DeliveryRider = {
      ...existing,
      ...updates,
      password_hash,
      id: existing.id
    };

    this.data.delivery_riders[index] = updated;

    if (isPgConnected) {
      try {
        await pool.query(
          `UPDATE delivery_riders SET name = $1, phone = $2, password_hash = $3, vehicle = $4, area = $5, address = $6, is_active = $7 WHERE id = $8`,
          [updated.name, updated.phone, updated.password_hash, updated.vehicle, updated.area, updated.address, updated.is_active, id]
        );
      } catch (err: any) {
        console.warn('PG error (update rider):', err.message);
      }
    }
    return updated;
  }

  static async updateRiderPassword(id: number, oldPass: string, newPass: string) {
    const rider = this.data.delivery_riders.find(r => r.id === id);
    if (!rider) throw new Error('রাইডার পাওয়া যায়নি');
    
    if (rider.password_hash && !bcrypt.compareSync(oldPass, rider.password_hash)) {
      throw new Error('বর্তমান পাসওয়ার্ড সঠিক নয়');
    }

    const newHash = bcrypt.hashSync(newPass, 10);
    rider.password_hash = newHash;

    if (isPgConnected) {
      try {
        await pool.query(`UPDATE delivery_riders SET password_hash = $1 WHERE id = $2`, [newHash, id]);
      } catch (err: any) {
        console.warn('PG error (update rider pass):', err.message);
      }
    }
    return true;
  }

  static getRiderOrders(riderId: number) {
    const rider = this.data.delivery_riders.find(r => r.id === riderId);
    const cleanPhone = rider?.phone ? rider.phone.replace(/[^0-9]/g, '') : '';
    return this.data.orders.filter(o => {
      if (o.delivery_rider_id && Number(o.delivery_rider_id) === Number(riderId)) return true;
      if (cleanPhone && o.delivery_rider_phone && o.delivery_rider_phone.replace(/[^0-9]/g, '') === cleanPhone) return true;
      return false;
    });
  }

  static async updateRiderOrderStatus(riderId: number, orderId: number, status: string, note?: string) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    const rider = this.data.delivery_riders.find(r => r.id === riderId);
    const cleanPhone = rider?.phone ? rider.phone.replace(/[^0-9]/g, '') : '';
    const isAssigned = (order.delivery_rider_id && Number(order.delivery_rider_id) === Number(riderId)) ||
      (cleanPhone && order.delivery_rider_phone && order.delivery_rider_phone.replace(/[^0-9]/g, '') === cleanPhone);

    if (!isAssigned) {
      throw new Error('এই অর্ডারটি আপনার আইডিতে অ্যাসাইন করা নেই');
    }

    order.status = status;
    if (note !== undefined) {
      order.delivery_note = note;
    }
    if (status === 'delivered' || status === 'ডেলিভার্ড') {
      order.delivered_at = new Date().toISOString();
    }

    if (isPgConnected) {
      try {
        await pool.query(
          `UPDATE orders SET status = $1, delivery_note = $2, delivered_at = $3 WHERE id = $4`,
          [order.status, order.delivery_note || null, order.delivered_at || null, orderId]
        );
      } catch (e: any) {
        console.warn('PG sync error (rider order status):', e.message);
      }
    }
    return order;
  }

  static async deleteDeliveryRider(id: number) {
    const index = this.data.delivery_riders.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.data.delivery_riders.splice(index, 1);

    if (isPgConnected) {
      try {
        await pool.query(`DELETE FROM delivery_riders WHERE id = $1`, [id]);
      } catch (err: any) {
        console.warn('PG error (delete rider):', err.message);
      }
    }
    return true;
  }

  // Expenses CRUD
  static getExpenses() {
    return this.data.expenses;
  }

  static async addExpense(expense: { title: string; category: string; amount: number; expense_date?: string; notes?: string }) {
    const newId = Math.max(0, ...this.data.expenses.map(e => e.id || 0)) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: newId,
      title: expense.title.trim(),
      category: expense.category.trim(),
      amount: Number(expense.amount) || 0,
      expense_date: expense.expense_date || todayStr,
      notes: expense.notes?.trim() || '',
      created_at: new Date().toISOString()
    };

    if (isPgConnected) {
      try {
        const res = await pool.query(
          `INSERT INTO expenses (title, category, amount, expense_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [newExpense.title, newExpense.category, newExpense.amount, newExpense.expense_date, newExpense.notes]
        );
        if (res.rows[0]) {
          newExpense.id = res.rows[0].id;
        }
      } catch (err: any) {
        console.warn('PG error (insert expense):', err.message);
      }
    }

    this.data.expenses.unshift(newExpense);
    return newExpense;
  }

  static async updateExpense(id: number, updates: Partial<Expense>) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    const existing = this.data.expenses[index];
    const updated: Expense = {
      ...existing,
      ...updates,
      id: existing.id
    };

    this.data.expenses[index] = updated;

    if (isPgConnected) {
      try {
        await pool.query(
          `UPDATE expenses SET title = $1, category = $2, amount = $3, expense_date = $4, notes = $5 WHERE id = $6`,
          [updated.title, updated.category, updated.amount, updated.expense_date, updated.notes, id]
        );
      } catch (err: any) {
        console.warn('PG error (update expense):', err.message);
      }
    }
    return updated;
  }

  static async deleteExpense(id: number) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return false;

    this.data.expenses.splice(index, 1);

    if (isPgConnected) {
      try {
        await pool.query(`DELETE FROM expenses WHERE id = $1`, [id]);
      } catch (err: any) {
        console.warn('PG error (delete expense):', err.message);
      }
    }
    return true;
  }

  // Bulk Product Stock & Price Updates
  static async bulkUpdateProducts(updates: Array<{ product_id?: number; category_id?: number; category_name?: string; brand_name?: string; unit?: string; price?: number; cost_price?: number; stock?: number; force_stock_out?: boolean }>) {
    let updatedCount = 0;
    const todayKey = this.getTodayDayKey();

    for (const item of updates) {
      let matchedBrand: any = null;
      let matchedCat: any = null;

      // 1. Precise Match by product_id
      const pId = item.product_id ? Number(item.product_id) : null;
      if (pId && !isNaN(pId)) {
        for (const cat of this.data.categories) {
          matchedBrand = cat.brands.find((b: any) => b.id === pId);
          if (matchedBrand) {
            matchedCat = cat;
            break;
          }
        }
      }

      // 2. Fallback Match by name and category
      if (!matchedBrand && item.brand_name) {
        for (const cat of this.data.categories) {
          const catMatch = (item.category_id && cat.id === item.category_id) ||
                           (item.category_name && (cat.bn.toLowerCase() === item.category_name.toLowerCase() || cat.en.toLowerCase() === item.category_name.toLowerCase())) ||
                           (!item.category_id && !item.category_name);
          if (!catMatch) continue;

          const brand = cat.brands.find((b: any) => b.name.trim().toLowerCase() === item.brand_name!.trim().toLowerCase());
          if (brand) {
            matchedBrand = brand;
            matchedCat = cat;
            break;
          }
        }
      }

      if (matchedBrand && matchedCat) {
        // If the brand name or unit changed in CSV/Excel, update them
        if (item.brand_name && item.brand_name.trim() && item.brand_name.trim() !== matchedBrand.name) {
          matchedBrand.name = item.brand_name.trim();
        }
        if (item.unit && item.unit.trim()) {
          matchedBrand.unit = item.unit.trim();
        }

        if (item.price !== undefined && !isNaN(Number(item.price))) {
          matchedBrand.price = Number(item.price);
          if (!matchedBrand.weekly_prices || typeof matchedBrand.weekly_prices !== 'object') matchedBrand.weekly_prices = {};
          matchedBrand.weekly_prices[todayKey] = matchedBrand.price;
        }
        if (item.cost_price !== undefined && !isNaN(Number(item.cost_price))) {
          matchedBrand.cost_price = Number(item.cost_price);
        }
        if (item.stock !== undefined && !isNaN(Number(item.stock))) {
          matchedBrand.stock = Math.max(0, Number(item.stock));
        }
        if (item.force_stock_out !== undefined) {
          matchedBrand.force_stock_out = Boolean(item.force_stock_out);
        }

        if (isPgConnected) {
          if (matchedBrand.id) {
            pool.query(
              `UPDATE product_brands SET name = $1, unit = $2, price = $3, cost_price = $4, stock = $5, force_stock_out = $6, weekly_prices = $7 WHERE id = $8`,
              [matchedBrand.name, matchedBrand.unit || 'প্রতি কেজি', matchedBrand.price, matchedBrand.cost_price || 0, matchedBrand.stock ?? 100, matchedBrand.force_stock_out || false, JSON.stringify(matchedBrand.weekly_prices || {}), matchedBrand.id]
            ).catch((e: any) => console.warn('PG sync error (bulk product update by ID):', e.message));
          } else {
            pool.query(
              `UPDATE product_brands SET unit = $1, price = $2, cost_price = $3, stock = $4, force_stock_out = $5, weekly_prices = $6 WHERE category_id = $7 AND name = $8`,
              [matchedBrand.unit || 'প্রতি কেজি', matchedBrand.price, matchedBrand.cost_price || 0, matchedBrand.stock ?? 100, matchedBrand.force_stock_out || false, JSON.stringify(matchedBrand.weekly_prices || {}), matchedCat.id, matchedBrand.name]
            ).catch((e: any) => console.warn('PG sync error (bulk product update by Name):', e.message));
          }
        }
        updatedCount++;
      }
    }
    return { success: true, updatedCount };
  }

  // Cart syncing
  static getUserCart(userId: number) {
    if (!this.data) this.data = {} as any;
    if (!this.data.carts) this.data.carts = {};
    return this.data.carts[String(userId)] || {};
  }

  static saveUserCart(userId: number, cartData: any) {
    if (!this.data) this.data = {} as any;
    if (!this.data.carts) this.data.carts = {};
    const safeData = cartData || {};
    this.data.carts[String(userId)] = safeData;

    if (isPgConnected && pool && userId) {
      pool.query(
        `INSERT INTO user_carts (user_id, cart_json, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (user_id) 
         DO UPDATE SET cart_json = EXCLUDED.cart_json, updated_at = CURRENT_TIMESTAMP`,
        [userId, JSON.stringify(safeData)]
      ).catch((e: any) => console.warn('PG sync error (user_carts):', e.message));
    }
    return safeData;
  }
}

