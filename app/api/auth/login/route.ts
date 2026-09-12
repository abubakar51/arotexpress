import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড দিন' }, { status: 400 });
    }

    const DBManager = await getDB();
    const user = DBManager.findUserByPhone(phone.trim());
    if (!user) {
      return NextResponse.json({ error: 'ভুল নম্বর বা পাসওয়ার্ড' }, { status: 401 });
    }

    const validPassword = bcrypt.compareSync(password.trim(), user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'ভুল নম্বর বা পাসওয়ার্ড' }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;
    const token = jwt.sign({ id: safeUser.id, phone: safeUser.phone, role: 'user', name: safeUser.name }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ user: safeUser, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
