'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Search, HelpCircle } from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '@/lib/config';
import { toast } from 'react-toastify';
import ContactForm from './ContactForm';

interface FAQ {
  question: string;
  answer: string;
}

interface ChatSupportProps {
  onClose: () => void;
}

export default function ChatSupport({ onClose }: ChatSupportProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot'; message: string }>>([]);
  const [shuffledFAQs, setShuffledFAQs] = useState<FAQ[]>([]);
  const [shownFAQIndex, setShownFAQIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserQuestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFAQQuestions();
  }, []);

  useEffect(() => {
    // Scroll to the last user question so both question and answer are visible
    if (lastUserQuestionRef.current) {
      setTimeout(() => {
        lastUserQuestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // Fallback to bottom if no question ref
      scrollToBottom();
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchFAQQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/web/enquiries/faq'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedFAQs = data.data || [];
        setFaqs(fetchedFAQs);
        // Shuffle FAQs once when loaded
        const shuffled = [...fetchedFAQs].sort(() => 0.5 - Math.random());
        setShuffledFAQs(shuffled);
        setShownFAQIndex(0);
      } else {
        toast.error('Failed to load FAQ questions');
      }
    } catch (error) {
      toast.error('Failed to load FAQ questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQClick = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setChatHistory(prev => [
      ...prev,
      { type: 'user', message: faq.question },
      { type: 'bot', message: faq.answer }
    ]);
    // Move to next set of FAQs after clicking
    setShownFAQIndex(prev => {
      const nextIndex = prev + 5;
      // If we've shown all FAQs, reset to beginning
      return nextIndex >= shuffledFAQs.length ? 0 : nextIndex;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get next set of FAQs from shuffled list
  const getNextFAQs = (count: number) => {
    if (shuffledFAQs.length === 0) return [];
    const nextFAQs = shuffledFAQs.slice(shownFAQIndex, shownFAQIndex + count);
    // If we don't have enough FAQs, wrap around to the beginning
    if (nextFAQs.length < count && shownFAQIndex + count > shuffledFAQs.length) {
      const remaining = count - nextFAQs.length;
      return [...nextFAQs, ...shuffledFAQs.slice(0, remaining)];
    }
    return nextFAQs;
  };

  const handleContactClick = () => {
    setShowContactForm(true);
    setSelectedFAQ(null);
  };

  const handleContactSubmit = () => {
    setShowContactForm(false);
    setChatHistory([]);
    setSelectedFAQ(null);
    // Toast is already shown by ContactForm component
  };

  if (showContactForm) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Contact Support
          </h3>
          <button
            onClick={() => {
              setShowContactForm(false);
              setChatHistory([]);
            }}
            className="text-white hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ContactForm onSubmit={handleContactSubmit} onCancel={() => setShowContactForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat Support
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {chatHistory.map((chat, index) => {
            const isLastBotMessage = chat.type === 'bot' && index === chatHistory.length - 1;
            // Check if this is the user question just before the last bot message
            const isLastUserQuestion = chat.type === 'user' && 
              index < chatHistory.length - 1 && 
              chatHistory[index + 1]?.type === 'bot' && 
              index + 1 === chatHistory.length - 1;
            
            return (
              <div key={index}>
                <div
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    ref={isLastUserQuestion ? lastUserQuestionRef : null}
                    className={`max-w-[80%] rounded-lg p-3 ${
                      chat.type === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                  </div>
                </div>
                {/* Show FAQs after bot response */}
                {isLastBotMessage && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 px-1">Related Questions:</h4>
                    <div className="space-y-2">
                      {getNextFAQs(5).map((faq, faqIndex) => (
                        <button
                          key={`${faq.question}-${shownFAQIndex}-${faqIndex}`}
                          onClick={() => handleFAQClick(faq)}
                          className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-800">{faq.question}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* FAQ Section or Contact Form */}
      {chatHistory.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Frequently Asked Questions</h4>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredFAQs.length > 0 ? (
              <div className="space-y-2">
                {filteredFAQs.slice(0, 10).map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => handleFAQClick(faq)}
                    className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">{faq.question}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No FAQs found</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Contact Support Button */}
      <div className="p-4 border-t bg-gray-50">
        {chatHistory.length === 0 ? (
          <button
            onClick={handleContactClick}
            className="w-full bg-red-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Still need help? Contact us
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setChatHistory([]);
                setSelectedFAQ(null);
                setShownFAQIndex(0); // Reset FAQ index for new chat
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              New Chat
            </button>
            <button
              onClick={handleContactClick}
              className="flex-1 bg-red-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



