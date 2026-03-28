import React from 'react';

interface MessageContentProps {
  content: string;
  isUser?: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, isUser = false }) => {
  if (!content) return null;

  // For user messages, return plain text
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // For assistant messages, format markdown
  const formatContent = () => {
    const lines = content.split('\n');
    const formattedElements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let tableRows: string[] = [];
    let inTable = false;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        if (listType === 'ul') {
          formattedElements.push(
            <ul key={formattedElements.length} className="list-disc ml-6 my-2 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-gray-800">{formatInlineStyles(item)}</li>
              ))}
            </ul>
          );
        } else {
          formattedElements.push(
            <ol key={formattedElements.length} className="list-decimal ml-6 my-2 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-gray-800">{formatInlineStyles(item)}</li>
              ))}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const separatorRow = tableRows[1];
        const bodyRows = tableRows.slice(2);
        
        // Parse headers - keep consistent parsing for all rows
        const parseTableRow = (row: string) => {
          const cells = row.split('|').map(cell => cell.trim());
          // Remove empty first and last elements if they exist (from leading/trailing |)
          if (cells[0] === '') cells.shift();
          if (cells[cells.length - 1] === '') cells.pop();
          return cells;
        };
        
        const headers = parseTableRow(headerRow);
        
        // Parse alignment from separator row
        const alignmentCells = parseTableRow(separatorRow || '');
        const alignments = alignmentCells.map(s => {
          if (s.startsWith(':') && s.endsWith(':')) return 'center';
          if (s.endsWith(':')) return 'right';
          return 'left';
        });
        
        // Parse body rows using the same parsing method
        const rows = bodyRows.map(row => parseTableRow(row));
        
        // Helper function to get alignment class
        const getAlignmentClass = (alignment: string) => {
          switch (alignment) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
          }
        };
        
        formattedElements.push(
          <div key={formattedElements.length} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  {headers.map((header, i) => (
                    <th 
                      key={i} 
                      className={`px-4 py-2 ${getAlignmentClass(alignments[i] || 'left')} font-semibold text-gray-700 text-sm`}
                    >
                      {formatInlineStyles(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50 border-b border-gray-200">
                    {headers.map((_, cellIdx) => (
                      <td 
                        key={cellIdx} 
                        className={`px-4 py-2 ${getAlignmentClass(alignments[cellIdx] || 'left')} text-gray-600 text-sm`}
                      >
                        {formatInlineStyles(row[cellIdx] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
        tableRows = [];
        inTable = false;
      }
    };

    const formatInlineStyles = (text: string): React.ReactNode => {
      // First handle bold text (**text**)
      const boldParts = text.split(/\*\*(.*?)\*\*/g);
      
      return boldParts.map((part, i) => {
        if (i % 2 === 1) {
          // This is bold text
          return <strong key={i} className="font-semibold">{part}</strong>;
        } else {
          // Now handle italic text (*text*) in non-bold parts
          // Use negative lookbehind/ahead to avoid matching ** patterns
          const italicParts = part.split(/(?<!\*)\*([^*]+?)\*(?!\*)/g);
          
          if (italicParts.length === 1) {
            return part; // No italics found
          }
          
          return italicParts.map((italicPart, j) => 
            j % 2 === 1 
              ? <em key={`${i}-${j}`} className="italic text-gray-600">{italicPart}</em>
              : italicPart
          );
        }
      });
    };

    lines.forEach((line, idx) => {
      // Check if this line is part of a table
      const isTableRow = line.includes('|') && (line.startsWith('|') || line.match(/^\s*\|/));
      const isSeparatorRow = line.match(/^\s*\|?\s*:?-+:?\s*\|/);
      
      if (isTableRow || isSeparatorRow) {
        // Start or continue table
        if (!inTable) {
          flushList();
          inTable = true;
        }
        tableRows.push(line);
      } else if (inTable) {
        // End of table, flush it
        flushTable();
        // Process the current line normally
        processNonTableLine(line, idx);
      } else {
        // Normal line processing
        processNonTableLine(line, idx);
      }
    });

    function processNonTableLine(line: string, idx: number) {
      // Handle headers
      if (line.startsWith('## ')) {
        flushList();
        formattedElements.push(
          <h2 key={idx} className="font-bold text-lg text-gray-900 mt-3 mb-2">
            {formatInlineStyles(line.substring(3))}
          </h2>
        );
      } else if (line.startsWith('#### ')) {
        flushList();
        formattedElements.push(
          <h4 key={idx} className="font-medium text-sm text-gray-800 mt-2 mb-1">
            {formatInlineStyles(line.substring(5))}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        formattedElements.push(
          <h3 key={idx} className="font-semibold text-base text-gray-900 mt-2 mb-1">
            {formatInlineStyles(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        formattedElements.push(
          <h1 key={idx} className="font-bold text-xl text-gray-900 mt-3 mb-2">
            {formatInlineStyles(line.substring(2))}
          </h1>
        );
      }
      // Handle bullet lists
      else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.substring(2));
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(line.replace(/^\d+\.\s/, ''));
      }
      // Handle horizontal rule
      else if (line === '---' || line === '***') {
        flushList();
        formattedElements.push(
          <hr key={idx} className="my-3 border-gray-300" />
        );
      }
      // Handle empty lines
      else if (!line.trim()) {
        flushList();
        formattedElements.push(<div key={idx} className="h-2" />);
      }
      // Regular paragraphs
      else {
        flushList();
        formattedElements.push(
          <p key={idx} className="text-gray-800 mb-1">
            {formatInlineStyles(line)}
          </p>
        );
      }
    }

    // Flush any remaining list or table
    flushList();
    flushTable();

    return formattedElements;
  };

  return <div className="space-y-1">{formatContent()}</div>;
};