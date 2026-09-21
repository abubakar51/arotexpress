import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/app/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function POST(req: NextRequest) {
  try {
    const rateCheck = checkRateLimit(req, 'rider_login', 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `অনেক বেশি ব্যর্থ চেষ্টা করা হয়েছে। দয়া করে ${rateCheck.resetInSeconds} সেকেন্ড অপেক্ষা করুন।` },
        { status: 429 }
      );
    }

    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড দিন' }, { status: 400 });
    }

    const DBManager = await getDB();
    const rider = DBManager.findRiderByPhone(phone.trim());
    if (!rider) {
      return NextResponse.json({ error: 'রাইডার খুঁজে পাওয়া যায়নি' }, { status: 401 });
    }

    if (!rider.is_active) {
      return NextResponse.json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password.trim(), rider.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: rider.id, name: rider.name, phone: rider.phone, role: 'rider' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicle: rider.vehicle,
        area: rider.area,
        address: rider.address,
        is_active: rider.is_active
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'লগইনে সমস্যা হয়েছে' }, { status: 500 });
  }
}
