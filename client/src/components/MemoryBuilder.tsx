import React, { useState } from 'react';
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

  const handleAddMemory = async () => {
    if (!currentMemory.trim()) return;
    
    setAdding(true);
    try {
      await onAddMemory(currentMemory);
      setCurrentMemory('');
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-5">
            <FaFeatherAlt size={40} className="text-primary mb-3" />
            <h2>Share Your Memories</h2>
            <p className="text-muted">Tell me about {personName}. What moments do you cherish? What would you want to say?</p>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <textarea
                className="form-control mb-3"
                rows={4}
                placeholder="Write a memory, thought, or something you wish you could say..."
                value={currentMemory}
                onChange={(e) => setCurrentMemory(e.target.value)}
              />
              
              {memories.length === 0 && (
                <div className="mb-3">
                  <small className="text-muted mb-2 d-block">Some ideas to get you started:</small>
                  <div className="d-flex flex-wrap gap-2">
                    {memoryPrompts.map((prompt, index) => (
                      <button 
                        key={index}
                        className="btn btn-outline-info btn-sm"
                        onClick={() => setCurrentMemory(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                className="btn btn-outline-primary" 
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
            <div className="mb-4">
              <h5>Your Memories</h5>
              {memories.map((memory, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{memory.content}</p>
                    <small className="text-muted">
                      {new Date(memory.timestamp).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button 
              className="btn btn-primary"
              onClick={onNext}
              disabled={memories.length === 0}
            >
              Begin Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryBuilder;
