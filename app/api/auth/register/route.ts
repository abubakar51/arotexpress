import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/app/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function POST(req: NextRequest) {
  try {
    const rateCheck = checkRateLimit(req, 'auth_register', 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `অনেক বেশি অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে ${rateCheck.resetInSeconds} সেকেন্ড অপেক্ষা করুন।` },
        { status: 429 }
      );
    }

    const { name, phone, password } = await req.json();
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক' }, { status: 400 });
    }

    const trimmedPhone = phone.trim().replace(/[^0-9+]/g, '');
    const cleanDigits = trimmedPhone.replace(/[^0-9]/g, '');

    // Validate Bangladeshi phone number: 11 digits starting with 01
    const isValidBdPhone = /^(?:\+?88)?01[3-9]\d{8}$/.test(trimmedPhone) || (cleanDigits.length === 11 && cleanDigits.startsWith('01'));
    if (!isValidBdPhone) {
      return NextResponse.json({ error: 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)' }, { status: 400 });
    }

    if (password.trim().length < 6) {
      return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }, { status: 400 });
    }

    const DBManager = await getDB();
    const existing = DBManager.findUserByPhone(cleanDigits) || DBManager.findUserByPhone(phone.trim());
    if (existing) {
      return NextResponse.json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি আছে' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const user = await DBManager.createUser({
      name: name.trim(),
      phone: cleanDigits,
      password: password.trim(),
      password_hash: passwordHash
    });

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ user, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

