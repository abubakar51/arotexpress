import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/app/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting: Max 5 attempts per minute
    const rateCheck = checkRateLimit(req, 'admin_login', 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `অনেক বেশি ব্যর্থ চেষ্টা করা হয়েছে। দয়া করে ${rateCheck.resetInSeconds} সেকেন্ড অপেক্ষা করুন।` },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'অ্যাডমিন ইউজারনেম এবং পাসওয়ার্ড দিন' }, { status: 400 });
    }

    const DBManager = await getDB();
    const admin = DBManager.findAdminByUsername(username.trim());
    if (!admin) {
      return NextResponse.json({ error: 'শুধুমাত্র অনুমোদিত অ্যাডমিন লগইন করতে পারবেন' }, { status: 401 });
    }

    // 2. Secure async bcrypt check without any plaintext backdoor passwords
    const validPassword = await bcrypt.compare(password.trim(), admin.password_hash);
    
    if (!validPassword) {
      return NextResponse.json({ error: 'ভুল অ্যাডমিন পাসওয়ার্ড' }, { status: 401 });
    }

    const { password_hash, ...safeAdmin } = admin;
    const token = jwt.sign({ id: safeAdmin.id, username: safeAdmin.username, role: 'admin', name: safeAdmin.name }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ user: { ...safeAdmin, role: 'admin', phone: safeAdmin.username }, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
