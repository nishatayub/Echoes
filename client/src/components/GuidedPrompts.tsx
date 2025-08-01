import React, { useState, useEffect, useCallback } from 'react';
import { aiAPI } from '../services/api';
import { FaLightbulb, FaSpinner } from 'react-icons/fa';

interface GuidedPromptsProps {
  relationshipType?: string;
  sessionStage?: 'beginning' | 'middle' | 'closure';
  onSelectPrompt: (prompt: string) => void;
}

const GuidedPrompts: React.FC<GuidedPromptsProps> = ({
  relationshipType,
  sessionStage = 'beginning',
  onSelectPrompt
}) => {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(sessionStage);

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getGuidedPrompts(relationshipType, currentStage);
      setPrompts(response.prompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
      // Fallback prompts
      setPrompts([
        "What's the first memory that comes to mind?",
        "What would you want to tell them if they were here?",
        "What do you miss most about them?",
        "Is there something you wish you had said?"
      ]);
    } finally {
      setLoading(false);
    }
  }, [relationshipType, currentStage]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const stageDescriptions = {
    beginning: "Getting started - exploring your feelings",
    middle: "Going deeper - understanding your relationship", 
    closure: "Finding peace - preparing to say goodbye"
  };

  return (
    <div className="guided-prompts-container">
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <FaLightbulb className="text-warning me-2" />
            <h6 className="mb-0">Guided Conversation</h6>
          </div>
          
          {/* Stage selector */}
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={currentStage}
            onChange={(e) => setCurrentStage(e.target.value as 'beginning' | 'middle' | 'closure')}
          >
            <option value="beginning">Beginning</option>
            <option value="middle">Exploring</option>
            <option value="closure">Closure</option>
          </select>
        </div>
        
        <div className="card-body">
          <p className="text-muted small mb-3">
            {stageDescriptions[currentStage]}
          </p>
          
          {loading ? (
            <div className="text-center py-3">
              <FaSpinner className="fa-spin me-2" />
              Loading prompts...
            </div>
          ) : (
            <div className="row">
              {prompts.map((prompt, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <button
                    className="btn btn-outline-primary btn-sm w-100 text-start"
                    onClick={() => onSelectPrompt(prompt)}
                    style={{ 
                      minHeight: '60px',
                      fontSize: '0.9rem',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    {prompt}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted">
              💡 These prompts are designed to help you express your feelings. 
              Choose one that resonates with you, or use your own words.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedPrompts;
