import React from "react";
import { ModuleInstance } from "../dashboardStore";
import { useVisualizationData } from "./useVisualizationData";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface CompanyNewsData {
  company: string;
  timeRange: string;
  articles: NewsArticle[];
  timestamp: string;
}

function getSentimentColor(sentiment: NewsArticle["sentiment"]): string {
  switch (sentiment) {
    case "positive":
      return "text-green-400";
    case "negative":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

async function loadCompanyNewsData(
  module: ModuleInstance
): Promise<CompanyNewsData> {
  const company = (module.config?.company as string) || "Apple";
  const timeRange = (module.config?.timeRange as string) || "1W";

  // Mock news data
  const mockNews: NewsArticle[] = [
    {
      id: "1",
      title: `${company} Reports Record Quarter with Strong Product Sales`,
      summary: `${company} announced its quarterly earnings, exceeding analyst expectations with record revenue driven by strong product sales across all categories.`,
      source: "Financial Times",
      url: "#",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: "positive",
    },
    {
      id: "2",
      title: `${company} Faces Regulatory Scrutiny Over New Service Launch`,
      summary: `Regulators are examining ${company}'s latest service offering amid concerns about market competition and data privacy.`,
      source: "Reuters",
      url: "#",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sentiment: "negative",
    },
    {
      id: "3",
      title: `${company} Announces New Partnership for Sustainable Technology`,
      summary: `In a move towards environmental sustainability, ${company} partners with leading clean energy providers for its operations.`,
      source: "Bloomberg",
      url: "#",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sentiment: "positive",
    },
    {
      id: "4",
      title: `${company} Updates Product Line with New Features`,
      summary: `${company} releases software updates across its product line, introducing new features and security improvements.`,
      source: "TechCrunch",
      url: "#",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      sentiment: "neutral",
    },
  ];

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        company,
        timeRange,
        articles: mockNews,
        timestamp: new Date().toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZoneName: "short",
        }),
      });
    }, 500);
  });
}

const NewsArticleCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <h4 className="text-white font-medium flex-grow">{article.title}</h4>
      <span className={`ml-4 ${getSentimentColor(article.sentiment)}`}>
        {article.sentiment === "positive"
          ? "↑"
          : article.sentiment === "negative"
          ? "↓"
          : "→"}
      </span>
    </div>
    <p className="text-gray-300 text-sm mb-3">{article.summary}</p>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{article.source}</span>
      <span className="text-gray-400">{formatDate(article.publishedAt)}</span>
    </div>
  </div>
);

interface Props {
  module: ModuleInstance;
}

export const CompanyNews: React.FC<Props> = ({ module }) => {
  const { data, isLoading, error } = useVisualizationData<CompanyNewsData>(
    module,
    loadCompanyNewsData
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-red-400">Error loading news</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-300">
          {data?.company} News
        </h2>
        <span className="text-sm text-gray-400">Last {data?.timeRange}</span>
      </div>

      <div className="flex-grow space-y-4 overflow-auto">
        {data?.articles.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-700">
        <p className="text-sm text-gray-400">As of: {data?.timestamp}</p>
      </div>
    </div>
  );
};
