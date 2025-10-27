import { prisma } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const availableSkills = await prisma.skill.findMany();
    return NextResponse.json(availableSkills, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch skills: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, skills, reasons } = await req.json();
    console.log("UserReasons: ", reasons)

    if (!userId || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. userId and skills array are required.' },
        { status: 400 }
      );
    }

    // Create skills for the user
    const createdSkills = await prisma.usersSkills.createMany({
      data: skills.map((skillId) => ({
        userId,
        skillId,
        reasons
      })),
      skipDuplicates: true, // Avoid inserting duplicates
    });

    await prisma.user.update({
      where: {id: userId},
      data: {
        mostRecentSkill: skills[0],
      },
    });

    return NextResponse.json(
      { message: 'Skills added successfully', createdSkills },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to create skills: ${errorMessage}` },
      { status: 500 }
    );
  }
}
