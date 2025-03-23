"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { analysisReportData } from "@/lib/data"
import { getCategoryColor, getCategoryBackground } from "@/lib/utils"
import type { Comment } from "@/lib/types"
import ReactMarkdown from 'react-markdown'

// Function to generate AI replies based on user comments
const generateAIReply = (comment: string) => {
  // Sample AI reply templates
  const aiReplies = [
    "Thank you for your insightful comment. Your point about {TOPIC} adds an important dimension to this analysis. Have you considered how this might influence future developments in this domain?",
    "Your perspective is valuable. I'd like to add that recent developments in {TOPIC} seem to align with your assessment. Our analysts have been monitoring similar patterns.",
    "Interesting observation. While there's merit to your view on {TOPIC}, our data suggests some nuance might be needed regarding the timeframe and scale of impact. Would you agree?",
    "Your expertise in {TOPIC} is evident. I'd be interested to hear more about how you see this evolving over the next 6-12 months given the current geopolitical landscape.",
    "Your comment highlights an often overlooked aspect of {TOPIC}. This is precisely the kind of critical thinking that enhances our collective understanding of complex issues."
  ];
  
  // Extract potential topics from the comment
  const topics = [
    "strategic partnerships", "military cooperation", "economic implications",
    "diplomatic relations", "regional stability", "technological advancement",
    "security concerns", "climate impact", "policy development", "international dynamics"
  ];
  
  // Select a random topic that appears in the comment or default to a general one
  let selectedTopic = "this issue";
  for (const topic of topics) {
    if (comment.toLowerCase().includes(topic.toLowerCase())) {
      selectedTopic = topic;
      break;
    }
  }
  
  // Select a random reply template and insert the topic
  const replyTemplate = aiReplies[Math.floor(Math.random() * aiReplies.length)];
  const reply = replyTemplate.replace("{TOPIC}", selectedTopic);
  
  return reply;
};

export default function ArticlePage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const [article, setArticle] = useState(analysisReportData.find(report => report.slug === slug));
  const [comments, setComments] = useState<Comment[]>(article?.commentsList || []);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Redirect to 404 if article not found
  useEffect(() => {
    if (!article) {
      router.push("/404");
    }
  }, [article, router]);

  if (!article) {
    return <div>Loading...</div>;
  }

  const handleCommentSubmit = () => {
    // Basic validation
    if (!newComment.trim()) {
      setCommentError("Please enter a comment");
      return;
    }
    
    if (!userName.trim()) {
      setCommentError("Please enter your name");
      return;
    }
    
    setCommentError("");
    setIsSubmitting(true);
    
    // Create new user comment
    const userComment: Comment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      authorName: userName,
      authorImage: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      content: newComment,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      isAI: false
    };
    
    // Add user comment
    setComments(prev => [...prev, userComment]);
    setNewComment("");
    
    // Generate AI reply after a short delay
    setTimeout(() => {
      // Create AI reply
      const aiComment: Comment = {
        id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 2 : 2,
        authorName: "IntelligenceAnalyst",
        authorImage: "https://i.pravatar.cc/150?img=68",
        content: generateAIReply(newComment),
        date: new Date().toISOString().slice(0, 10),
        likes: Math.floor(Math.random() * 10),
        isAI: true
      };
      
      setComments(prev => [...prev, aiComment]);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-[#0a0e14] text-[#f0f2f5] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/analysis" className="text-xs bg-[#1c2433] hover:bg-[#232d3f] px-3 py-2 rounded flex items-center gap-1 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK TO ALL ANALYSIS
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-[#141a24] border border-[#2a3548] rounded-lg overflow-hidden">
              <div className="h-[300px] overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=300&width=800"
                  }}
                />
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                  <span
                    className="category-badge text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: getCategoryBackground(article.category),
                      color: getCategoryColor(article.category),
                    }}
                  >
                    {article.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                      </svg>
                      <span>{article.likes}</span>
                    </div>
                    <div className="engagement-item flex items-center text-xs text-[#8c95a6]">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                      </svg>
                      <span>{comments.length}</span>
                    </div>
                    <div className="text-xs text-[#8c95a6]">{article.readTime} min read</div>
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
                
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                    <img 
                      src={`https://i.pravatar.cc/150?img=${article.id + 20}`} 
                      alt={article.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{article.author}</div>
                    <div className="text-xs text-[#8c95a6] flex items-center">
                      <span>{article.position}</span>
                      <span className="mx-2">•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="article-content prose prose-invert max-w-none">
                  <ReactMarkdown>{article.content || ""}</ReactMarkdown>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-[#8c95a6] mr-2">TAGS:</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded">{article.category}</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded">analysis</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded">intelligence</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded">geopolitics</span>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="bg-[#141a24] border border-[#2a3548] rounded-lg overflow-hidden mt-8 p-6">
              <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>
              
              {/* Comment Form */}
              <div className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment-name" className="block text-xs text-[#8c95a6] mb-1">Your Name</label>
                  <input 
                    id="comment-name"
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="comment-content" className="block text-xs text-[#8c95a6] mb-1">Your Comment</label>
                  <textarea 
                    id="comment-content"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-[#1c2433] border border-[#2a3548] rounded px-3 py-2 text-sm h-24"
                    placeholder="Share your thoughts on this analysis..."
                  ></textarea>
                </div>
                
                {commentError && (
                  <div className="text-[#e63946] text-xs mb-2">{commentError}</div>
                )}
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting}
                    className={`bg-[#3a7bd5] px-4 py-2 rounded text-sm font-medium hover:bg-[#2d62b3] flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="space-y-6">
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className={`comment p-4 border ${comment.isAI ? 'border-[#3a7bd5] bg-[#1c2433]' : 'border-[#2a3548]'} rounded-lg`}>
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full mr-3 overflow-hidden flex-shrink-0">
                        <img 
                          src={comment.authorImage}
                          alt={comment.authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="font-medium">{comment.authorName}</div>
                          {comment.isAI && (
                            <span className="ml-2 px-1.5 py-0.5 bg-[#3a7bd5] bg-opacity-20 text-[#3a7bd5] text-[10px] rounded">ANALYST</span>
                          )}
                        </div>
                        <div className="text-xs text-[#8c95a6] mb-2">{comment.date}</div>
                        <div className="text-sm">{comment.content}</div>
                        <div className="mt-2 flex items-center gap-4">
                          <button className="flex items-center text-xs text-[#8c95a6] hover:text-[#3a7bd5]">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                            </svg>
                            {comment.likes} Likes
                          </button>
                          <button className="flex items-center text-xs text-[#8c95a6] hover:text-[#3a7bd5]">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                            </svg>
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-[#8c95a6]">
                    <div className="text-3xl mb-2">💬</div>
                    <div>Be the first to comment on this analysis</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-[#141a24] border border-[#2a3548] rounded-lg overflow-hidden p-6">
              <h3 className="text-xl font-bold mb-4">Related Analysis</h3>
              
              <div className="space-y-4">
                {analysisReportData
                  .filter(report => report.id !== article.id && report.category === article.category)
                  .slice(0, 3)
                  .map(report => (
                    <Link 
                      href={`/analysis/${report.slug}`} 
                      key={report.id} 
                      className="flex gap-3 p-2 hover:bg-[#1c2433] rounded"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={report.imageUrl} 
                          alt={report.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <div className="text-xs text-[#8c95a6] mt-1">{report.date}</div>
                      </div>
                    </Link>
                  ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">security</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">economy</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">geopolitics</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">analysis</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">technology</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">intelligence</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">military</span>
                  <span className="tag px-2 py-1 bg-[#1c2433] text-xs rounded hover:bg-[#232d3f] cursor-pointer">climate</span>
                </div>
              </div>
              
              <div className="mt-6 bg-[#1c2433] p-4 rounded border border-[#2a3548]">
                <h3 className="font-bold mb-2">Subscribe to Intelligence Updates</h3>
                <p className="text-sm text-[#8c95a6] mb-3">Get expert analysis delivered to your inbox</p>
                <div className="flex">
                  <input 
                    type="email" 
                    className="flex-1 bg-[#141a24] border border-[#2a3548] rounded-l px-3 py-2 text-sm"
                    placeholder="Your email"
                  />
                  <button className="bg-[#3a7bd5] px-3 py-2 rounded-r text-sm font-medium hover:bg-[#2d62b3]">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 