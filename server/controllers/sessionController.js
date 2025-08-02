const Session = require('../models/Session');

// Create new session
const createSession = async (req, res) => {
  try {
    const { personName, relationshipType } = req.body;

    if (!personName || !personName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Person name is required' 
      });
    }
    
    const session = new Session({
      userId: req.user.userId,
      personName: personName.trim(),
      relationshipType: relationshipType || 'other',
      memories: [],
      conversations: []
    });

    await session.save();
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all user sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 })
      .select('personName isCompleted createdAt updatedAt');
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get specific session
const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update session
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { memories, conversations, finalLetter, isCompleted } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };

    if (memories !== undefined) updateData.memories = memories;
    if (conversations !== undefined) updateData.conversations = conversations;
    if (finalLetter !== undefined) updateData.finalLetter = finalLetter;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const session = await Session.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
      session
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add memory to session
const addMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Memory content is required'
      });
    }

    const session = await Session.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    // Add new memory
    const newMemory = {
      content: content.trim(),
      timestamp: new Date()
    };
    
    session.memories.push(newMemory);
    await session.save();
    
    res.json({
      success: true,
      message: 'Memory added successfully',
      memory: newMemory,
      session
    });
  } catch (error) {
    console.error('Add memory error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error adding memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update memory in session
const updateMemory = async (req, res) => {
  try {
    const { id, memoryId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Memory content is required'
      });
    }

    const session = await Session.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    // Find and update the memory
    const memory = session.memories.id(memoryId);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    memory.content = content.trim();
    await session.save();
    
    res.json({
      success: true,
      message: 'Memory updated successfully',
      memory,
      session
    });
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete memory from session
const deleteMemory = async (req, res) => {
  try {
    const { id, memoryId } = req.params;

    const session = await Session.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    // Find and remove the memory
    const memory = session.memories.id(memoryId);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    session.memories.pull(memoryId);
    await session.save();
    
    res.json({
      success: true,
      message: 'Memory deleted successfully',
      session
    });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting memory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  addMemory,
  updateMemory,
  deleteMemory
};
