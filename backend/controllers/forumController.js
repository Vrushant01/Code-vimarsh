const Topic = require('../models/Topic');

// @desc    Get all topics
// @route   GET /api/forum
// @access  Public
const getTopics = async (req, res) => {
  try {
    const { category, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const topics = await Topic.find(query)
      .populate('author', 'username avatar')
      .select('-replies')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Topic.countDocuments(query);

    res.json({
      topics,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single topic with replies
// @route   GET /api/forum/:id
// @access  Public
const getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('replies.author', 'username avatar');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Increment views
    topic.views += 1;
    await topic.save();

    res.json(topic);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create topic
// @route   POST /api/forum
// @access  Private
const createTopic = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const topic = await Topic.create({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      author: req.user._id
    });

    const populatedTopic = await Topic.findById(topic._id)
      .populate('author', 'username avatar');

    res.status(201).json(populatedTopic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update topic
// @route   PUT /api/forum/:id
// @access  Private (owner only)
const updateTopic = async (req, res) => {
  try {
    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check ownership
    if (topic.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this topic' });
    }

    const { title, content, category, tags } = req.body;

    topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json(topic);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete topic
// @route   DELETE /api/forum/:id
// @access  Private (owner or admin)
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check ownership or admin
    if (topic.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this topic' });
    }

    await Topic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reply to topic
// @route   POST /api/forum/:id/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.isLocked) {
      return res.status(403).json({ message: 'This topic is locked' });
    }

    const { content } = req.body;

    topic.replies.push({
      content,
      author: req.user._id
    });

    await topic.save();

    const updatedTopic = await Topic.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('replies.author', 'username avatar');

    res.status(201).json(updatedTopic);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete reply from topic
// @route   DELETE /api/forum/:id/replies/:replyId
// @access  Private (owner or admin)
const deleteReply = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const reply = topic.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check ownership or admin
    if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    reply.deleteOne();
    await topic.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle pin topic (admin only)
// @route   PUT /api/forum/:id/pin
// @access  Private (admin only)
const togglePin = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.isPinned = !topic.isPinned;
    await topic.save();

    res.json({ isPinned: topic.isPinned });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle lock topic (admin only)
// @route   PUT /api/forum/:id/lock
// @access  Private (admin only)
const toggleLock = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.isLocked = !topic.isLocked;
    await topic.save();

    res.json({ isLocked: topic.isLocked });
  } catch (error) {
    console.error('Toggle lock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  addReply,
  deleteReply,
  togglePin,
  toggleLock
};
