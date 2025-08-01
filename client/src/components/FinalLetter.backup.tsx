import React, { useState, useEffect, useCallback } from 'react';
import { Memory, Conversation, aiAPI } from '../services/api';
import { FaDownload, FaEdit, FaSave, FaMagic } from 'react-icons/fa';
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
      generateFallbackLetter();
    } finally {
      setGenerating(false);
    }
  }, [sessionId, relationshipType, generateFallbackLetter]);

  useEffect(() => {
    if (existingLetter) {
      setLetterContent(existingLetter);
    } else if (letterContent === '') {
      generateAILetter();
    }
  }, [existingLetter, letterContent, generateAILetter]);

  const saveLetter = async () => {
    setSaving(true);
    try {
      await onSaveLetter(letterContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving letter:', error);
    } finally {
      setSaving(false);
    }
  };

  const regenerateLetter = () => {
    setLetterContent('');
    generateAILetter();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    
    // Title
    doc.setFontSize(16);
    doc.text(`Letter to ${personName}`, 20, 30);
    
    // Content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(letterContent, 170);
    doc.text(splitText, 20, 50);
    
    // Download
    doc.save(`Letter-to-${personName}.pdf`);
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f6f3', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 
                className="display-4 mb-4" 
                style={{ 
                  fontFamily: 'Aldrich, sans-serif', 
                  color: '#2c2c2c',
                  fontWeight: 'normal',
                  letterSpacing: '1px'
                }}
              >
                Your Final Letter
              </h1>
              <p 
                className="lead" 
                style={{ 
                  fontFamily: 'Fredoka, sans-serif',
                  color: '#666',
                  fontSize: '1.2rem',
                  fontWeight: '300'
                }}
              >
                A heartfelt message crafted from your memories and conversation with {personName}
              </p>
            </div>

            {/* Letter Content */}
            <div className="row">
              <div className="col-12">
                <div 
                  className="card border-0 shadow-sm mb-5"
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="card-body p-5">
                    {isEditing ? (
                      <div>
                        <textarea
                          className="form-control border-0"
                          rows={20}
                          value={letterContent}
                          onChange={(e) => setLetterContent(e.target.value)}
                          style={{ 
                            fontFamily: 'Fredoka, sans-serif', 
                            fontSize: '1.1rem', 
                            lineHeight: '1.8',
                            resize: 'vertical',
                            minHeight: '500px',
                            backgroundColor: '#fafafa',
                            borderRadius: '12px',
                            padding: '2rem'
                          }}
                          placeholder="Write your letter here..."
                        />
                      </div>
                    ) : generating ? (
                      <div 
                        className="text-center d-flex flex-column justify-content-center align-items-center"
                        style={{ minHeight: '500px' }}
                      >
                        <div 
                          className="spinner-border text-primary mb-4" 
                          role="status"
                          style={{ width: '3rem', height: '3rem' }}
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4 
                          className="mb-3"
                          style={{ 
                            fontFamily: 'Prosto One, cursive',
                            color: '#2c2c2c',
                            fontWeight: 'normal'
                          }}
                        >
                          Crafting Your Letter
                        </h4>
                        <p 
                          className="text-muted"
                          style={{ 
                            fontFamily: 'Fredoka, sans-serif',
                            fontSize: '1rem',
                            maxWidth: '400px'
                          }}
                        >
                          Creating a heartfelt message based on your memories and conversation...
                        </p>
                      </div>
                    ) : (
                      <div 
                        className="letter-content" 
                        style={{ 
                          fontFamily: 'Fredoka, sans-serif', 
                          lineHeight: '1.8', 
                          whiteSpace: 'pre-line',
                          fontSize: '1.1rem',
                          color: '#2c2c2c',
                          minHeight: '500px',
                          padding: '2rem',
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          borderLeft: '4px solid #2c2c2c'
                        }}
                      >
                        {letterContent || "Your letter will appear here once generated..."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mb-5">
              {isEditing ? (
                <div className="d-flex justify-content-center flex-wrap gap-3">
                  <button 
                    className="btn btn-primary px-4 py-2"
                    onClick={saveLetter}
                    disabled={saving}
                    style={{
                      fontFamily: 'Aldrich, sans-serif',
                      backgroundColor: '#2c2c2c',
                      borderColor: '#2c2c2c',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'normal',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() => {
                      setIsEditing(false);
                      setLetterContent(existingLetter || letterContent);
                    }}
                    style={{
                      fontFamily: 'Aldrich, sans-serif',
                      borderColor: '#2c2c2c',
                      color: '#2c2c2c',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'normal',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-center flex-wrap gap-3">
                  <button 
                    className="btn btn-primary px-4 py-2"
                    onClick={downloadPDF}
                    style={{
                      fontFamily: 'Aldrich, sans-serif',
                      backgroundColor: '#2c2c2c',
                      borderColor: '#2c2c2c',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'normal',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <FaDownload className="me-2" />
                    Download PDF
                  </button>
                  <button 
                    className="btn btn-outline-primary px-4 py-2"
                    onClick={() => setIsEditing(true)}
                    style={{
                      fontFamily: 'Aldrich, sans-serif',
                      borderColor: '#2c2c2c',
                      color: '#2c2c2c',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'normal',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <FaEdit className="me-2" />
                    Edit Letter
                  </button>
                  {!existingLetter && (
                    <button 
                      className="btn btn-outline-info px-4 py-2"
                      onClick={regenerateLetter}
                      disabled={generating}
                      style={{
                        fontFamily: 'Aldrich, sans-serif',
                        borderColor: '#2c2c2c',
                        color: '#2c2c2c',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'normal',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {generating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <FaMagic className="me-2" />
                          Regenerate
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={onBackToChat}
                    style={{
                      fontFamily: 'Aldrich, sans-serif',
                      borderColor: '#666',
                      color: '#666',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'normal',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Continue Chat
                  </button>
                </div>
              )}
            </div>

            {/* Letter Statistics */}
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div 
                  className="card border-0 shadow-sm"
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px'
                  }}
                >
                  <div className="card-body p-4">
                    <div className="row text-center">
                      <div className="col-4">
                        <div 
                          className="display-6 mb-2"
                          style={{ 
                            fontFamily: 'Aldrich, sans-serif',
                            color: '#2c2c2c',
                            fontWeight: 'normal'
                          }}
                        >
                          {memories.length}
                        </div>
                        <small 
                          className="text-muted"
                          style={{ 
                            fontFamily: 'Fredoka, sans-serif',
                            fontSize: '0.9rem'
                          }}
                        >
                          Memories
                        </small>
                      </div>
                      <div className="col-4">
                        <div 
                          className="display-6 mb-2"
                          style={{ 
                            fontFamily: 'Aldrich, sans-serif',
                            color: '#2c2c2c',
                            fontWeight: 'normal'
                          }}
                        >
                          {conversations.filter(c => c.isUser).length}
                        </div>
                        <small 
                          className="text-muted"
                          style={{ 
                            fontFamily: 'Fredoka, sans-serif',
                            fontSize: '0.9rem'
                          }}
                        >
                          Messages
                        </small>
                      </div>
                      <div className="col-4">
                        <div 
                          className="display-6 mb-2"
                          style={{ 
                            fontFamily: 'Aldrich, sans-serif',
                            color: '#2c2c2c',
                            fontWeight: 'normal'
                          }}
                        >
                          {letterContent ? letterContent.split(' ').filter(word => word.trim()).length : 0}
                        </div>
                        <small 
                          className="text-muted"
                          style={{ 
                            fontFamily: 'Fredoka, sans-serif',
                            fontSize: '0.9rem'
                          }}
                        >
                          Words
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalLetter;
