'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';
import { CgClose } from 'react-icons/cg';
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

export const fetchArticlesAndReferencesById = async (articleId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/article?articleId=${articleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched Articles:', data);
    return data;
  } catch (error) {
    console.error('Error fetching articles by name:', error);
  }
};

export const fetchArticleInformationById = async (articleId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/article?nodeId=${articleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched Article:', data);
    return data;
  } catch (error) {
    console.error('Error fetching articles by name:', error);
  }
};
const GraphVisualization = () => {
  const params = useParams();
  let articleId = 'none';
  if (params?.map) {
    articleId = params?.map[1] ? params.map[1] : 'none';
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [graphData, setGraphData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedArticle, setSelectedArticle] = useState<any | null>();
  // const [controls] = useState({ 'DAG Orientation': 'td' });
  // const nodes = [
  //   { id: '1', published: '2020-01-01', parentId: null },
  //   { id: '2', published: '2021-01-01', parentId: '1' },
  //   { id: '3', published: '2022-01-01', parentId: '1' },
  // ];
  // const links = nodes
  //   .filter((node) => node.parentId)
  //   .map((node) => ({ source: node.parentId, target: node.id }));

  useEffect(() => {
    console.log('Selected Article: ', selectedArticle);
  }, [selectedArticle]);

  useEffect(() => {
    console.log('Fetching Data');
    const fetchData = async () => {
      try {
        console.log('Article Id: ', articleId);
        const data = await fetchArticlesAndReferencesById(articleId);
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      fetchData();
    }
  }, [articleId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!graphData) {
    return <div>No data available.</div>;
  }

  return (
    <div className="relative">
      <ForceGraph2D
        onNodeClick={async (e) => {
          setSelectedArticle(await fetchArticleInformationById(e?.id as string));
        }}
        graphData={graphData}
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={0} // Remove the arrow
        linkColor={() => '#FBEDCC'} // Set link color to yellow
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Draw the node (circle)
          const radius = 5;
          ctx.beginPath();
          ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#B1F9F0';
          ctx.fill();

          // Add the label
          const label = node?.displayName;
          const fontSize = 12 / globalScale; // Adjust font size based on zoom
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x || 0, node.y || 0); // Position label above the node
        }}
        nodeLabel={(node) => `${node?.label}: ${node?.title}`}
        linkLabel={(link) => link?.type || ''}
      />
      {/* <ForceGraph2D
        // ref={fgRef}
        graphData={graphData}
        dagMode={controls['DAG Orientation']}
        dagLevelDistance={300}
        backgroundColor="#101020"
        linkColor={() => 'rgba(255,255,255,0.2)'}
        nodeRelSize={1}
        nodeId="path"
        nodeVal={(node) => 100 / (node.level + 1)}
        nodeLabel="path"
        nodeAutoColorBy="module"
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        d3VelocityDecay={0.3}
      /> */}
      ;
      {selectedArticle && (
        <div className="absolute w-1/4 right-5 bottom-5 bg-slate-100 h-full pt-10 px-5 border-l border-gray-400">
          <div className="flex gap-x-2 items-center mt-10">
            <h2 className="font-sans font-medium  uppercase text-slate-800/80 text-sm">
              Article
            </h2>
            <CgClose onClick={() => setSelectedArticle(null)} />
          </div>
          <h2 className="font-sans font-medium text-2xl">
            {selectedArticle?.title}
          </h2>
          <span className="pr-3 text-sm">
            {selectedArticle?.author}
          </span>
          <span className="text-sm">
            {selectedArticle?.publicationDate}
          </span>
          <p className="mt-3">{selectedArticle?.abstract}</p>

          {selectedArticle?.pdfUrl && (
            <button
              onClick={() => {
                window.open(
                  selectedArticle?.pdfUrl,
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              className="bg-slate-700 font-sans font-bold uppercase text-xs text-white px-5 py-2 mt-2"
            >
              Open Pdf
            </button>
          )}

          <input
            type="text"
            id="default-input"
            placeholder="Ask me anything"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-10"
          />
        </div>
      )}
      <div className="absolute right-1/2 bottom-5">
        <button className="bg-slate-600 border-slate-600 border text-white px-5 py-2 rounded-r-none rounded-md text-sm">
          Theological
        </button>
        <button className="border-slate-600 text-slate-600 border px-5 py-2 rounded-l-none rounded-md text-sm">
          Chronological
        </button>
      </div>
    </div>
  );
};

export default GraphVisualization;
