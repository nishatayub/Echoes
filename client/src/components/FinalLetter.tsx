import React, { useState, useEffect, useCallback } from 'react';
import { Memory, Conversation, aiAPI } from '../services/api';
import { FaEnvelope, FaDownload, FaEdit, FaSave, FaSpinner, FaMagic } from 'react-icons/fa';
import jsPDF from 'jspdf';

interface FinalLetterProps {
  sessionId: string;
  memories: Memory[];
  conversations: Conversation[];
  personName: string;
  relationshipType?: string;
  existingLetter?: string;
  onSaveLetter: (letter: string) => Promise<void>;
  onBackToChat: () => void;
}

const FinalLetter: React.FC<FinalLetterProps> = ({
  sessionId,
  memories,
  conversations,
  personName,
  relationshipType,
  existingLetter,
  onSaveLetter,
  onBackToChat
}) => {
  const [letterContent, setLetterContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateFallbackLetter = useCallback(() => {
    const content = `Dear ${personName},

I've been carrying so much in my heart that I wanted to share with you. Through my memories and thoughts, I want you to know how much you have meant to me.

${memories.length > 0 ? memories.slice(0, 2).map(memory => memory.content).join('\n\n') + '\n\n' : ''}

Thank you for being part of my life. Even though we may be apart, you live on in my heart and memories. I carry you with me always.

With love and gratitude,
Me`;
    setLetterContent(content);
  }, [personName, memories]);

  const generateAILetter = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await aiAPI.generateFinalLetter(sessionId, relationshipType);
      setLetterContent(result.finalLetter);
    } catch (error) {
      console.error('Error generating AI letter:', error);
      // Fallback to simple letter
      generateFallbackLetter();
    } finally {
      setGenerating(false);
    }
  }, [sessionId, relationshipType, generateFallbackLetter]);

  useEffect(() => {
    if (existingLetter) {
      setLetterContent(existingLetter);
    } else {
      generateAILetter();
    }
  }, [existingLetter, generateAILetter]);

  const regenerateLetter = async () => {
    await generateAILetter();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveLetter(letterContent);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Title
    doc.setFontSize(20);
    doc.text('A Letter of Closure', margin, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString(), margin, 45);
    
    // Letter content
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(letterContent, maxWidth);
    doc.text(lines, margin, 60);
    
    // Download
    doc.save(`Letter-to-${personName}.pdf`);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-5">
            <FaEnvelope size={40} className="text-success mb-3" />
            <h2>Your Letter to {personName}</h2>
            <p className="text-muted">
              {existingLetter ? 'Your personalized letter of closure' : 'Here\'s a letter based on your memories and conversation'}
            </p>
          </div>

          <div className="card">
            <div className="card-body">
              {isEditing ? (
                <textarea
                  className="form-control"
                  rows={20}
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  style={{ fontFamily: 'serif', fontSize: '1.1rem', lineHeight: '1.8' }}
                />
              ) : generating ? (
                <div 
                  className="text-center py-5"
                  style={{ minHeight: '400px' }}
                >
                  <FaSpinner className="fa-spin text-primary mb-3" size={40} />
                  <h5>Generating your personalized letter...</h5>
                  <p className="text-muted">AI is crafting a heartfelt message based on your memories and conversation.</p>
                </div>
              ) : (
                <div 
                  className="letter-content p-4" 
                  style={{ 
                    fontFamily: 'serif', 
                    lineHeight: '1.8', 
                    whiteSpace: 'pre-line',
                    fontSize: '1.1rem',
                    backgroundColor: '#fefefe',
                    borderLeft: '4px solid var(--bs-primary)',
                    minHeight: '400px'
                  }}
                >
                  {letterContent}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            {isEditing ? (
              <div>
                <button 
                  className="btn btn-success me-3"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      Save Letter
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className="btn btn-primary me-3"
                  onClick={downloadPDF}
                >
                  <FaDownload className="me-2" />
                  Download as PDF
                </button>
                <button 
                  className="btn btn-outline-primary me-3"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="me-2" />
                  Edit Letter
                </button>
                {!existingLetter && (
                  <button 
                    className="btn btn-outline-info me-3"
                    onClick={regenerateLetter}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <FaSpinner className="fa-spin me-2" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <FaMagic className="me-2" />
                        Regenerate with AI
                      </>
                    )}
                  </button>
                )}
                <button 
                  className="btn btn-outline-secondary"
                  onClick={onBackToChat}
                >
                  Continue Conversation
                </button>
              </div>
            )}
          </div>

          {/* Letter Statistics */}
          <div className="mt-4 p-3 bg-light rounded">
            <div className="row text-center">
              <div className="col-4">
                <div className="fw-bold text-primary">{memories.length}</div>
                <small className="text-muted">Memories</small>
              </div>
              <div className="col-4">
                <div className="fw-bold text-primary">{conversations.filter(c => c.isUser).length}</div>
                <small className="text-muted">Messages</small>
              </div>
              <div className="col-4">
                <div className="fw-bold text-primary">{letterContent.split(' ').length}</div>
                <small className="text-muted">Words</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalLetter;
