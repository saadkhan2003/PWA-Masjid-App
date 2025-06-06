'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const islamicQuotes = [
  {
    text: "And Allah will surely reward the doers of good.",
    urdu: "اور اللہ تعالیٰ نیک عمل کرنے والوں کو ضرور اجر دے گا۔",
    source: "Quran 3:148",
    urduSource: "قرآن مجید ۳:۱۴۸",
    arabic: "وَسَيَجْزِي اللَّهُ الشَّاكِرِينَ"
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him.",
    urdu: "اور جو شخص اللہ پر بھروسہ کرے تو وہ اس کے لیے کافی ہے۔",
    source: "Quran 65:3",
    urduSource: "قرآن مجید ۶۵:۳",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ"
  },
  {
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    urdu: "وہ مومن نہیں جو پیٹ بھر کر کھائے جبکہ اس کا پڑوسی بھوکا ہو۔",
    source: "Prophet Muhammad (ﷺ)",
    urduSource: "حضرت محمد ﷺ",
    arabic: "ليس المؤمن الذي يشبع وجاره جائع"
  },
  {
    text: "Give charity without delay, for it stands in the way of calamity.",
    urdu: "صدقہ میں جلدی کریں کیونکہ یہ آفات کے سامنے حائل ہوتا ہے۔",
    source: "Prophet Muhammad (ﷺ)",
    urduSource: "حضرت محمد ﷺ",
    arabic: "بادروا بالصدقة فإنها تقي مصارع السوء"
  },
  {
    text: "The upper hand is better than the lower hand.",
    urdu: "اوپر والا ہاتھ نیچے والے ہاتھ سے بہتر ہے۔",
    source: "Prophet Muhammad (ﷺ)",
    urduSource: "حضرت محمد ﷺ",
    arabic: "اليد العليا خير من اليد السفلى"
  }
];

export function IslamicQuote() {
  const [currentQuote, setCurrentQuote] = useState(islamicQuotes[0]);

  useEffect(() => {
    // Change quote daily based on date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % islamicQuotes.length;
    setCurrentQuote(islamicQuotes[quoteIndex]);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-islamic-green/10 to-islamic-green-light/10 border-islamic-green/20">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Arabic Text */}
          <div className="text-lg font-arabic text-islamic-green-dark leading-relaxed">
            {currentQuote.arabic}
          </div>
          
          {/* Urdu Translation with Urdu-style quotes */}
          <blockquote className="text-gray-700 urdu-text text-base leading-relaxed">
            ‹‹ {currentQuote.urdu} ››
          </blockquote>
          
          {/* Source in Urdu only */}
          <p className="text-sm text-islamic-green font-medium urdu-text">
            — {currentQuote.urduSource}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
