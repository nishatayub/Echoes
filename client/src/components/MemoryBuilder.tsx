import React, { useState, useEffect } from 'react';
import { Memory } from '../services/api';
import { FaFeatherAlt, FaPlus } from 'react-icons/fa';

interface MemoryBuilderProps {
  memories: Memory[];
  personName: string;
  onAddMemory: (content: string) => Promise<void>;
  onNext: () => void;
}

const MemoryBuilder: React.FC<MemoryBuilderProps> = ({
  memories,
  personName,
  onAddMemory,
  onNext
}) => {
  const [currentMemory, setCurrentMemory] = useState('');
  const [adding, setAdding] = useState(false);

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .memory-container {
        font-family: 'Fredoka', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: #f8f6f3;
        min-height: calc(100vh - 200px);
        padding: 2rem 0;
      }
      
      .memory-card {
        background: white;
        border: none;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        margin-bottom: 1rem;
        transition: all 0.3s ease;
      }
      
      .memory-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      }
      
      .memory-title {
        font-family: 'Prosto One', cursive;
        color: #2c2c2c;
        font-weight: 400;
      }
      
      .memory-input {
        border: 2px solid #e5e5e5;
        border-radius: 8px;
        padding: 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        resize: vertical;
        min-height: 120px;
      }
      
      .memory-input:focus {
        border-color: #2c2c2c;
        box-shadow: 0 0 0 0.2rem rgba(44, 44, 44, 0.25);
        outline: none;
      }
      
      .btn-memory {
        background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
        border: none;
        border-radius: 8px;
        color: white;
        padding: 12px 24px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .btn-memory:hover {
        background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(44, 44, 44, 0.3);
        color: white;
      }
      
      .btn-memory:disabled {
        opacity: 0.6;
        transform: none;
        box-shadow: none;
      }
      
      .btn-outline-memory {
        border: 2px solid #2c2c2c;
        color: #2c2c2c;
        background: transparent;
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .btn-outline-memory:hover {
        background: #2c2c2c;
        color: white;
        transform: translateY(-2px);
      }
      
      .memory-item {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        transition: all 0.3s ease;
      }
      
      .memory-item:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }
      
      .prompt-card {
        background: #f8f6f3;
        border: 2px dashed #d6d6d6;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .prompt-card:hover {
        border-color: #2c2c2c;
        background: #f0f0f0;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAddMemory = async () => {
    if (!currentMemory.trim()) return;
    
    setAdding(true);
    try {
      await onAddMemory(currentMemory);
      setCurrentMemory('');
      // Show success feedback briefly
      setTimeout(() => {
        // Optional: Add toast notification here
      }, 100);
    } catch (error) {
      console.error('Failed to add memory:', error);
      // Optional: Add error toast notification here
    } finally {
      setAdding(false);
    }
  };

  const memoryPrompts = [
    "I remember when we...",
    "I always admired how you...",
    "You taught me...",
    "I wish I had told you..."
  ];

  return (
    <div className="memory-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center mb-5">
              <FaFeatherAlt size={32} style={{ color: '#2c2c2c' }} className="mb-3" />
              <h2 className="memory-title mb-3">Share Your Memories</h2>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                Tell me about {personName}. What moments do you cherish? What would you want to say?
              </p>
            </div>

            <div className="memory-card mb-4">
              <div className="card-body p-4">
                <textarea
                  className="memory-input form-control mb-3"
                  rows={5}
                  placeholder="Write a memory, thought, or something you wish you could say..."
                  value={currentMemory}
                  onChange={(e) => setCurrentMemory(e.target.value)}
                />
                
                {memories.length === 0 && (
                  <div className="mb-4">
                    <small style={{ color: '#6c757d' }} className="mb-3 d-block">Some ideas to get you started:</small>
                    <div className="row">
                      {memoryPrompts.map((prompt, index) => (
                        <div key={index} className="col-md-6 mb-2">
                          <div 
                            className="prompt-card"
                            onClick={() => setCurrentMemory(prompt)}
                          >
                            <small style={{ color: '#2c2c2c' }}>{prompt}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn btn-memory" 
                  onClick={handleAddMemory} 
                  disabled={!currentMemory.trim() || adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" />
                      Add Memory
                    </>
                  )}
                </button>
              </div>
            </div>

            {memories.length > 0 && (
              <div className="mb-5">
                <h5 className="memory-title mb-4">Your Memories ({memories.length})</h5>
                {memories.map((memory, index) => (
                  <div key={index} className="memory-item">
                    <p style={{ whiteSpace: 'pre-line', color: '#2c2c2c', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                      {memory.content}
                    </p>
                    <small style={{ color: '#6c757d' }}>
                      {new Date(memory.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <button 
                className={`btn ${memories.length === 0 ? 'btn-outline-memory' : 'btn-memory'}`}
                onClick={onNext}
                disabled={memories.length === 0}
              >
                {memories.length === 0 ? 'Add at least one memory to continue' : 'Begin Conversation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryBuilder;
