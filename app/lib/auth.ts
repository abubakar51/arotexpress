import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'arot_express_secret_key_2026';

export async function authenticateToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'লগইন করুন', status: 401 };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { user, token };
  } catch (err) {
    return { error: 'মেয়াদোত্তীর্ণ বা অবৈধ টোকেন', status: 403 };
  }
}
