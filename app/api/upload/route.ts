import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToMarkdown } from '@/app/_services/pdf';
import {
  createArticle,
  createUserArticleRelationship,
  retrieveArticleInformation,
  updateArticle,
} from '@/app/_services/article';
import { uploadFileToS3 } from '@/app/_services/s3';
import { createArticleNodeWithReferences } from '@/app/_services/neo4j';
import {
  getPresiseArticleDataFromPerplexity,
  sendArticleForTraining,
} from '@/app/_services/ai';

export async function POST(req: NextRequest, res: NextResponse) {
  console.log('Uploading Artice');
  try {
    const formData = await req.formData();
    const file = formData.getAll('file')[1] as File;
    const userId = formData.get('userId') as string;
    if (!file) {
      return NextResponse.json(
        { error: 'No files received.' },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    // const markdownFile = await convertPdfToMarkdown(buffer);
    // let articleInfo = await retrieveArticleInformation(buffer, file.name);
    // if (!articleInfo) {
    //   return NextResponse.json({ Message: 'Failed', status: 500 });
    // }
    // console.log('received Paper Details: ', articleInfo);
    const articleUrl = await uploadFileToS3(
      buffer,
      file.name.replace(/ /g, '_')
    );
    console.log('Article Url: ', articleUrl);
    const trainAiResponse = await sendArticleForTraining('alex', articleUrl);
    console.log('Train AI Response: ', trainAiResponse);
    // articleInfo = {
    //   ...articleInfo, // Preserve the original references key
    //   ...(await getPresiseArticleDataFromPerplexity(articleInfo)),
    //   pdf_url: articleUrl,
    // };
    // const newArticle = await createArticle({
    //   title: articleInfo?.title || file.name,
    //   markdownUrl: '',
    //   pdfUrl: articleUrl,
    // });
    // createUserArticleRelationship({ userId, articleId: newArticle.id });
    // const nodeId = await createArticleNodeWithReferences(articleInfo);
    // console.log('NodeId: ', nodeId);
    // console.log('Authors: ', articleInfo?.authors);
    // console.log('Authors: ', articleInfo?.abstract);

    // const updatedArticle = await updateArticle(newArticle.id, {
    //   references: articleInfo?.references,
    //   authors: articleInfo?.authors,
    //   abstract: articleInfo?.abstract || '',
    //   mapId: nodeId || '',
    //   creating: false,
    // });

    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      status: 200,
    });
  } catch (error) {
    console.error('Error processing the file:', error);
    return NextResponse.json({ Message: 'Failed', status: 500 });
  }
}
