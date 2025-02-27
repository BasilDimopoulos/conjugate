/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleWordGenerationRequest } from '@/app/_services/word';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestData = req.nextUrl.searchParams;
  const data = {
    word: requestData.get('word'),
    language: requestData.get('language'),
  };
  if (!data.language || !data.word) {
    return NextResponse.json('Invalid Input', { status: 400 });
  }
  const wordData = await handleWordGenerationRequest(data.word, data.language);
  console.log("wordData: ", wordData)
  return NextResponse.json(wordData, { status: 200 });
}

// export async function GET(req: NextRequest) {
//   console.log('Fetching...');
//   const searchParams = req.nextUrl.searchParams;
//   console.log(searchParams.get('articleId'));

//   if (searchParams.get('articleId') === 'none') {
//     console.log('Getting all Articles');
//     const graphData = await getallArticlesAndReferences();
//     return NextResponse.json(graphData, {
//       status: 200,
//     });
//   }

//   if (searchParams.has('articleId')) {
//     const articleId = searchParams.get('articleId');
//     const graphData = await getArticlesAndReferencesById(articleId || '');
//     return NextResponse.json(graphData, {
//       status: 200,
//     });
//   } else if (searchParams.has('articleName')) {
//     const articleName = searchParams.get('articleName');
//     const article = await getArticleByName(articleName || '');
//     return NextResponse.json(article, {
//       status: 200,
//     });
//   } else if (searchParams.has('nodeId')) {
//     const articleData = await getArticleById(searchParams.get('nodeId') || '');
//     return NextResponse.json(articleData, {
//       status: 200,
//     });
//   }
// }
