import uploadFileToS3 from '@/app/_services/s3';
import { prisma } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log('REceived: ', payload);
  const generationId = payload.data.object.id as string;
  const image = payload.data.object.images[0];
  const imageResponse = await fetch(image?.url);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const url = await uploadFileToS3(imageBuffer, generationId);
  await prisma.word.update({
    where: { generationId: generationId },
    data: { imageUrl: url },
  });
  return NextResponse.json('Healthy', { status: 200 });
}

export async function GET() {
  return NextResponse.json('Healthy', { status: 200 });
}
