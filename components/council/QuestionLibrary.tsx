/**
 * Universal Question Library Component
 * 
 * Categorized question presets
 * Brand: Minimal, grounded, clear
 */

'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Question, QuestionCategory } from '@/lib/types/council';
import { QUESTION_CATEGORIES } from '@/lib/types/council';

interface QuestionLibraryProps {
  onSelectQuestion: (question: string) => void;
  selectedCategory?: QuestionCategory | 'all';
}

export function QuestionLibrary({ 
  onSelectQuestion, 
  selectedCategory = 'all' 
}: QuestionLibraryProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | 'all'>(selectedCategory);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [activeCategory]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'all' 
        ? '/api/questions'
        : `/api/questions?category=${activeCategory}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = Array.isArray(questions) ? questions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const handleQuestionClick = async (question: Question) => {
    onSelectQuestion(question.question_text);
    
    // Increment usage count
    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id }),
      });
    } catch (error) {
      console.error('Error updating question usage:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-futurist-muted-text" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-futurist-white border border-futurist-border rounded-council pl-10 pr-4 py-2 text-futurist-dark-text placeholder-futurist-muted-text focus:outline-none focus:border-futurist-teal transition-all duration-council"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`
            px-3 py-1.5 rounded-council text-sm font-medium transition-all duration-council border
            ${activeCategory === 'all'
              ? 'bg-futurist-teal text-white border-futurist-teal'
              : 'bg-futurist-white text-futurist-muted-text hover:text-futurist-teal border-futurist-border hover:border-futurist-teal'
            }
          `}
        >
          All
        </button>
        {Object.entries(QUESTION_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as QuestionCategory)}
            className={`
              px-3 py-1.5 rounded-council text-sm font-medium transition-all duration-council border
              ${activeCategory === key
                ? 'bg-futurist-teal text-white border-futurist-teal'
                : 'bg-futurist-white text-futurist-muted-text hover:text-futurist-teal border-futurist-border hover:border-futurist-teal'
              }
            `}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-futurist-muted-text">
            Loading questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-futurist-muted-text">
            No questions found
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <button
              key={question.id}
              onClick={() => handleQuestionClick(question)}
              className="w-full text-left bg-futurist-white hover:bg-futurist-light border border-futurist-border hover:border-futurist-teal rounded-council p-4 transition-all duration-council group"
            >
              <p className="text-futurist-dark-text group-hover:text-futurist-teal transition-colors">
                {question.question_text}
              </p>
              <div className="flex gap-2 mt-2">
                {question.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-futurist-light px-2 py-0.5 rounded text-futurist-muted-text"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

