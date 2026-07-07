import { forwardRef } from 'react';
import { Award, Sparkles, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  date: string;
}

const CertificateRenderer = forwardRef<HTMLDivElement, CertificateProps>(({ studentName, courseTitle, date }, ref) => {
  return (
    <div 
      ref={ref} 
      className="w-[1000px] h-[707px] bg-[#fdfbf7] relative flex flex-col p-10 overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Background Patterns & Gradients */}
      <div className="absolute top-0 left-0 w-full h-full border-[16px] border-[#1C1C28]" />
      <div className="absolute top-3 left-3 w-[calc(100%-24px)] h-[calc(100%-24px)] border-[2px] border-[#d4af37]" />
      <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-[#8B1972]/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[80px]" />
      
      {/* Header */}
      <div className="flex justify-between items-start z-10 w-full mb-4">
        <div className="flex items-center gap-3">
           <div className="w-14 h-14 rounded-xl bg-[#1C1C28] flex items-center justify-center shadow-xl">
             <Sparkles size={28} className="text-[#d4af37]" />
           </div>
           <div>
             <span className="font-display font-bold text-3xl tracking-tight text-[#1C1C28]">Satya<span className="text-[#8B1972]">Academy</span></span>
             <p className="text-[#6B7280] text-sm font-semibold tracking-widest uppercase">Excellence in AI Education</p>
           </div>
        </div>
        
        {/* Certificate Number / Official Stamp */}
        <div className="text-right">
          <p className="text-[#6B7280] text-sm uppercase tracking-widest font-semibold mb-1">Certificate ID</p>
          <p className="font-mono text-[#1C1C28] font-bold">SA-{Math.random().toString(36).substring(2, 8).toUpperCase()}-{new Date().getFullYear()}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
        <h1 className="text-5xl font-display font-black text-[#1C1C28] tracking-tight uppercase mb-3" style={{ letterSpacing: '0.1em' }}>
          Certificate of Excellence
        </h1>

        <p className="text-xl text-[#6B7280] mb-4 font-medium italic">
          This is proudly presented to
        </p>

        <h2 className="text-5xl font-display font-bold text-[#8B1972] mb-4 pb-2 inline-block" style={{ borderBottom: '3px solid #d4af37' }}>
          {studentName}
        </h2>

        <p className="text-lg text-[#4B5563] mb-5 max-w-3xl leading-relaxed">
          For demonstrating exceptional dedication, technical proficiency, and successfully mastering all comprehensive requirements and projects in the following advanced curriculum:
        </p>

        {/* Badge & Course Name */}
        <div className="bg-[#1C1C28] rounded-2xl p-4 px-8 shadow-xl flex items-center gap-5 transform hover:scale-105 transition-transform max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0 border border-[#d4af37]">
            <Award size={24} className="text-[#d4af37]" />
          </div>
          <div className="text-left">
            <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest mb-1">Official Module Completion</p>
            <h3 className="text-xl font-display font-bold text-white tracking-wide">
              {courseTitle}
            </h3>
          </div>
        </div>
      </div>

      {/* Footer / Signatures */}
      <div className="flex w-full justify-between items-end px-10 z-10 mt-4 mb-2">
        <div className="text-center relative">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-20">
            <ShieldCheck size={80} className="text-[#8B1972]" />
          </div>
          <div className="w-56 border-b-2 border-[#1C1C28] mb-3 relative z-10">
            <p className="text-lg font-bold text-[#1C1C28] pb-1">{date}</p>
          </div>
          <p className="text-sm font-bold text-[#4B5563] uppercase tracking-widest">Date of Issuance</p>
        </div>

        {/* Gold Seal */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#d4af37] flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
             <div className="w-20 h-20 rounded-full border-2 border-white/40 flex flex-col items-center justify-center text-white">
               <Award size={24} className="mb-0.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
             </div>
          </div>
          <div className="absolute w-24 h-24 bg-[#d4af37] rotate-45 rounded-xl z-0" />
        </div>
        
        <div className="text-center relative">
          {/* Signature SVG */}
          <div className="w-56 h-16 flex items-end justify-center mb-1">
             <svg viewBox="0 0 200 50" className="w-48 h-auto opacity-80" stroke="#1C1C28" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 20 40 Q 30 10 40 30 T 60 20 T 70 35 Q 90 5 110 25 T 140 15 T 160 35 Q 170 20 180 30" />
             </svg>
          </div>
          <div className="w-56 border-b-2 border-[#1C1C28] mb-2"></div>
          <p className="text-base font-bold text-[#1C1C28] tracking-wide mb-0.5">Satyanarayana Sidda</p>
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-widest">Satya Academy Director</p>
        </div>
      </div>
    </div>
  );
});

CertificateRenderer.displayName = 'CertificateRenderer';

export default CertificateRenderer;
