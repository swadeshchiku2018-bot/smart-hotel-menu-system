import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: params.id },
      select: { imageUrl: true },
    });

    if (!dish || !dish.imageUrl || !dish.imageUrl.startsWith('data:image/')) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const matches = dish.imageUrl.match(/^data:(image\/[A-Za-z-+\/]+);base64,(.+)$/);
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
    console.error('Error fetching image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
