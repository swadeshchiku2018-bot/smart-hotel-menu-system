import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const settings = await (prisma as any).settings.findFirst({
      select: { loginBgUrl: true },
    });

    if (!settings || !settings.loginBgUrl || !settings.loginBgUrl.startsWith('data:image/')) {
      return new NextResponse('Background Image not found', { status: 404 });
    }

    const matches = settings.loginBgUrl.match(/^data:(image\/[A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse('Invalid image data', { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error fetching bg image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
