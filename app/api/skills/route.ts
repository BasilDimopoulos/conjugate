import { prisma } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(req: NextRequest) {
  try {
    const { userId, skills } = await req.json();
    console.log("Skills: ", skills)
    
    if (!userId || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. userId and skills array are required.' },
        { status: 400 }
      );
    }
    
    // Create skills for the user
    const createdSkills = await prisma.usersSkills.createMany({
      data: skills.map(skillId => ({
        userId,
        skillId,
      })),
      skipDuplicates: true, // Avoid inserting duplicates
    });

    return NextResponse.json(
      { message: 'Skills added successfully', createdSkills },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to create skills: ${error.message}` },
      { status: 500 }
    );
  }
}