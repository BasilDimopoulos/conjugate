// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server';


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
