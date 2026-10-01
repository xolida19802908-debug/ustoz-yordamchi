import React from 'react';

interface Props {
  documentTitle: string;
  subject?: string;
  grade?: number;
  topic?: string;
}

export const PrintHeader: React.FC<Props> = ({
  documentTitle,
  subject,
  grade,
  topic,
}) => {
  return (
    <div className="print-only mb-6 border-b-2 border-black pb-4 text-black">
      <div className="text-center mb-3">
        <p className="text-[11pt] font-bold uppercase tracking-wider">
          O‘zbekiston Respublikasi Maktabgacha va maktab ta’limi vazirligi
        </p>
        <p className="text-[10pt] italic">
          Umumiy o‘rta ta’lim muassasasi uchun o‘quv-metodik material
        </p>
      </div>

      <div className="flex justify-between items-end text-[10pt] border-t border-black/40 pt-2 mb-2">
        <div>
          <span>Maktab: ____________________________</span>
        </div>
        <div>
          <span>Sinf: {grade ? `${grade}-sinf` : '________'}</span>
        </div>
        <div>
          <span>Sana: "___" ____________ 2026-y.</span>
        </div>
      </div>

      <div className="flex justify-between items-end text-[10pt] mb-3">
        <div>
          <span>Fan: {subject || '_________________________'}</span>
        </div>
        <div>
          <span>O‘qituvchi: ___________________________</span>
        </div>
      </div>

      <div className="text-center border-t border-b border-black py-2 bg-gray-50">
        <h2 className="text-[13pt] font-bold uppercase">{documentTitle}</h2>
        {topic && <p className="text-[11pt] font-semibold mt-0.5">Mavzu: {topic}</p>}
      </div>
    </div>
  );
};
