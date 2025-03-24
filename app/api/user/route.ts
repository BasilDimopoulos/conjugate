/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const requestData = req.nextUrl.searchParams;
    const userId = requestData.get("userId");
  
    if (!userId) {
      return NextResponse.json("Invalid Input", { status: 400 });
    }
  
    const usersSkills = await prisma.usersSkills.findMany({
      where: { userId },
      include: { skill: true }, // Assuming you want skill details
    });
  
    return NextResponse.json(usersSkills, { status: 200 });
  }
  