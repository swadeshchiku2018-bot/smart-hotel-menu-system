import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    await (prisma.order as any).update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update payment status' }, { status: 500 });
  }
}
