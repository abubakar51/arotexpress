import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

function maskPhoneNumber(phone?: string) {
  if (!phone) return '';
  const clean = String(phone).trim();
  if (clean.length <= 5) return clean;
  return clean.substring(0, 3) + '*****' + clean.substring(clean.length - 2);
}

function maskName(name?: string) {
  if (!name) return '';
  const clean = String(name).trim();
  const parts = clean.split(' ');
  return parts
    .map((p) => {
      if (p.length <= 2) return p;
      return p[0] + '*'.repeat(p.length - 2) + p[p.length - 1];
    })
    .join(' ');
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const DBManager = await getDB();
  const rawCode = (await params).code;
  let order = DBManager.findOrderByCode(rawCode);
  let isPackage = false;
  if (!order) {
    order = DBManager.findPackageOrderByCode(rawCode);
    if (order) isPackage = true;
  }
  if (!order) {
    return NextResponse.json({ error: 'অর্ডার কোডটি সঠিক নয় অথবা কোনো অর্ডার পাওয়া যায়নি' }, { status: 404 });
  }

  // Check if requester is authenticated as the owner or an admin
  const authResult = await authenticateToken(req);
  const user = !authResult.error ? (authResult.user as any) : null;
  const isOwnerOrAdmin = user && (user.role === 'admin' || (order.user_id && user.id === order.user_id));

  if (isOwnerOrAdmin) {
    return NextResponse.json({ ...order, is_package_order: isPackage });
  }

  // Sanitize sensitive PII for unauthenticated or public guest tracking
  const sanitizedOrder = {
    id: order.id,
    order_code: order.order_code,
    is_package_order: isPackage,
    created_at: order.created_at,
    status: order.status,
    total_amount: order.total_amount,
    subtotal: order.subtotal,
    delivery_fee: order.delivery_fee,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    items_json: order.items_json,
    // Masked customer details to protect privacy while confirming identity to user
    customer_name: maskName(order.customer_name),
    customer_phone: maskPhoneNumber(order.customer_phone),
    delivery_address: order.delivery_address,
    delivery_area: order.delivery_area,
    // Rider info needed for delivery communication
    delivery_rider_name: order.delivery_rider_name,
    delivery_rider_phone: order.delivery_rider_phone,
    delivery_rider_vehicle: order.delivery_rider_vehicle,
    delivery_note: order.delivery_note
  };

  return NextResponse.json(sanitizedOrder);
}
