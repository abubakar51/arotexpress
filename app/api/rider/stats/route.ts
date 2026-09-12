import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/app/lib/db';
import { authenticateToken } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await authenticateToken(req);
  if (authResult.error || (authResult.user as any).role !== 'rider') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const DBManager = await getDB();
    const orders = DBManager.getRiderOrders((authResult.user as any).id);
    const totalAssigned = orders.length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'delivered' || o.status === 'ডেলিভার্ড');
    const activeOrders = orders.filter((o: any) => o.status === 'shipped' || o.status === 'processing' || o.status === 'pending' || o.status === 'প্রসেসিং' || o.status === 'পেন্ডিং');
    
    const totalDelivered = deliveredOrders.length;
    const totalActive = activeOrders.length;
    
    const totalCashCollected = deliveredOrders.reduce((sum: number, o: any) => {
      const isCOD = !o.payment_method || o.payment_method.toLowerCase().includes('cash') || o.payment_method.includes('ক্যাশ');
      return isCOD ? sum + (Number(o.total_amount) || 0) : sum;
    }, 0);
    const totalDeliveredValue = deliveredOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    
    return NextResponse.json({
      totalAssigned,
      totalDelivered,
      totalActive,
      totalCashCollected,
      totalDeliveredValue
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
