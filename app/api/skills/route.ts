import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const availableSkills = await prisma.skill.findMany();
    return NextResponse.json(availableSkills, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to fetch skills: ${error}` },
      { status: 500 }
    );
  }
}
