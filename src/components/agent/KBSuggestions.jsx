import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Keyword → KB articles mapping
const KB_ARTICLES = [
  {
    id: 'kb-1',
    title: 'How to Request a Prescription Refill',
    category: 'prescription_refill',
    keywords: ['refill', 'prescription', 'request refill', 'medication refill'],
    summary: 'Step-by-step process for requesting refills online, by phone, or via the patient portal.',
  },
  {
    id: 'kb-2',
    title: 'Managing Side Effects of GLP-1 Medications',
    category: 'side_effects',
    keywords: ['side effects', 'nausea', 'semaglutide', 'tirzepatide', 'ozempic', 'vomiting', 'dizzy'],
    summary: 'Common side effects of GLP-1 medications and how to manage them effectively.',
  },
  {
    id: 'kb-3',
    title: 'Delivery & Shipping Timelines',
    category: 'delivery_status',
    keywords: ['delivery', 'shipping', 'tracking', 'transit', 'in progress', 'delayed', 'late'],
    summary: 'Expected delivery windows, how to track orders, and what to do if a package is delayed.',
  },
  {
    id: 'kb-4',
    title: 'Billing & Payment FAQ',
    category: 'billing_question',
    keywords: ['billing', 'invoice', 'charge', 'payment', 'unpaid', 'dispute', 'outstanding'],
    summary: 'How billing works, how to pay invoices, and how to dispute charges.',
  },
  {
    id: 'kb-5',
    title: 'Insurance Coverage for Compounded Medications',
    category: 'insurance_question',
    keywords: ['insurance', 'coverage', 'blue cross', 'aetna', 'united', 'prior auth', 'authorization'],
    summary: 'What is covered, how to submit prior authorizations, and how to appeal denials.',
  },
  {
    id: 'kb-6',
    title: 'Damaged or Missing Package Policy',
    category: 'delivery_status',
    keywords: ['damaged', 'broken', 'missing', 'lost', 'not received', 'replacement'],
    summary: 'Steps to take when a package arrives damaged or is reported missing.',
  },
  {
    id: 'kb-7',
    title: 'Medication Dosage & Administration Guide',
    category: 'medication_inquiry',
    keywords: ['dosage', 'dose', 'how to take', 'administration', 'inject', 'injection', 'lisinopril', 'metformin'],
    summary: 'Dosage instructions and proper administration techniques for common medications.',
  },
];

function getSuggestedArticles(communications) {
  if (!communications || communications.length === 0) return [];
  const allText = communications
    .slice(0, 5)
    .map(c => `${c.subject} ${c.summary || ''}`.toLowerCase())
    .join(' ');

  const scored = KB_ARTICLES.map(article => {
    const matches = article.keywords.filter(kw => allText.includes(kw));
    return { ...article, score: matches.length };
  }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
}

const CATEGORY_COLORS = {
  prescription_refill: 'bg-blue-100 text-blue-700',
  side_effects: 'bg-red-100 text-red-700',
  delivery_status: 'bg-green-100 text-green-700',
  billing_question: 'bg-yellow-100 text-yellow-700',
  insurance_question: 'bg-purple-100 text-purple-700',
  medication_inquiry: 'bg-teal-100 text-teal-700',
};

export default function KBSuggestions({ communications }) {
  const [expanded, setExpanded] = useState(true);
  const [expandedArticle, setExpandedArticle] = useState(null);

  const suggestions = getSuggestedArticles(communications);

  if (suggestions.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Suggested Knowledge Base</span>
          <Badge className="bg-amber-200 text-amber-800 text-xs px-1.5 py-0">{suggestions.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-amber-600" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-600" />}
      </button>

      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">
          {suggestions.map(article => (
            <div key={article.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    className="flex items-center gap-1.5 text-left group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-900 group-hover:text-[#8B1F1F] transition-colors">
                      {article.title}
                    </span>
                  </button>
                  <Badge className={`mt-1 text-xs px-1.5 py-0 ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'}`}>
                    {article.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              {expandedArticle === article.id && (
                <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                  {article.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}