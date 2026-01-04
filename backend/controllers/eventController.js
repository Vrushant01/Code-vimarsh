const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { type, upcoming, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };

    if (type) {
      query.type = type;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    } else if (upcoming === 'false') {
      query.date = { $lt: new Date() };
    }

    const events = await Event.find(query)
      .populate('organizer', 'username avatar')
      .sort({ date: upcoming === 'false' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username avatar')
      .populate('participants', 'username avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (admin/moderator)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, location, type, registrationLink, maxParticipants } = req.body;

    // Debug logging
    console.log('Create event request body:', req.body);
    console.log('Create event file:', req.file);

    // Validation
    if (!title || !description || !date || !location) {
      return res.status(400).json({ 
        message: 'Title, description, date, and location are required',
        received: { title: !!title, description: !!description, date: !!date, location: !!location }
      });
    }

    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Validate endDate if provided
    let eventEndDate = undefined;
    if (endDate) {
      eventEndDate = new Date(endDate);
      if (isNaN(eventEndDate.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }
      if (eventEndDate < eventDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    // Validate type
    const validTypes = ['workshop', 'hackathon', 'meetup', 'competition', 'webinar', 'other'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      endDate: eventEndDate,
      location: location.trim(),
      type: type || 'other',
      registrationLink: registrationLink ? registrationLink.trim() : '',
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : 0,
      organizer: req.user._id
    };

    if (req.file) {
      eventData.image = '/uploads/images/' + req.file.filename;
    }

    const event = await Event.create(eventData);
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'username avatar');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Event with this title already exists' });
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (admin/moderator)
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, description, date, endDate, location, type, registrationLink, maxParticipants, isPublished } = req.body;

    const updateData = {
      title: title || event.title,
      description: description || event.description,
      date: date ? new Date(date) : event.date,
      endDate: endDate ? new Date(endDate) : event.endDate,
      location: location !== undefined ? location : event.location,
      type: type || event.type,
      registrationLink: registrationLink !== undefined ? registrationLink : event.registrationLink,
      maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants) : event.maxParticipants,
      isPublished: isPublished !== undefined ? isPublished : event.isPublished
    };

    if (req.file) {
      // Delete old image if exists
      if (event.image) {
        const oldPath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = '/uploads/images/' + req.file.filename;
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'username avatar');

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (admin only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete associated image
    if (event.image) {
      const imagePath = path.join(__dirname, '..', event.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Check if already registered
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check max participants
    if (event.maxParticipants > 0 && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: 'Successfully registered for event', participantCount: event.participants.length });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participantIndex = event.participants.indexOf(req.user._id);

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    res.json({ message: 'Successfully unregistered from event', participantCount: event.participants.length });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
};
