import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json();
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক' }, { status: 400 });
    }

    const DBManager = await getDB();
    const existing = DBManager.findUserByPhone(phone.trim());
    if (existing) {
      return NextResponse.json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি আছে' }, { status: 400 });
    }

    const user = DBManager.createUser({
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim()
    });

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ user, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
