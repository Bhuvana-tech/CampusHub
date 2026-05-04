const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const seedData = require('./seed');

const http = require('http');
const { Server } = require('socket.io');

const User = require('./models/User');
const Note = require('./models/Note');
const Event = require('./models/Event');
const CafeteriaItem = require('./models/CafeteriaItem');
const CafeteriaStatus = require('./models/CafeteriaStatus');
const LostAndFound = require('./models/LostAndFound');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Track connected users for direct messaging
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`Registered user ${userId} to socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from map (we'd iterate or map reverse to find it)
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Helper to emit to specific user
const notifyUser = (userId, eventName, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Users API
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, branch, semester, interests } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, branch, semester, interests });
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('connections', 'name branch')
    .populate('connectionRequests', 'name branch');
  res.json(user);
});

app.post('/api/users/:userId/request/:targetId', async (req, res) => {
  const { userId, targetId } = req.params;
  await User.findByIdAndUpdate(targetId, {
    $addToSet: { connectionRequests: userId }
  });
  
  // Create notification
  const notification = await Notification.create({
    user: targetId,
    type: 'request',
    content: 'You have a new connection request.',
    relatedUser: userId
  });
  
  // Real-time alert
  notifyUser(targetId, 'new_notification', notification);
  
  res.json({ success: true });
});

app.post('/api/users/:userId/accept/:requesterId', async (req, res) => {
  const { userId, requesterId } = req.params;
  
  await User.findByIdAndUpdate(userId, {
    $addToSet: { connections: requesterId },
    $pull: { connectionRequests: requesterId }
  });
  
  await User.findByIdAndUpdate(requesterId, {
    $addToSet: { connections: userId }
  });
  
  // Create notification for requester
  const notification = await Notification.create({
    user: requesterId,
    type: 'accept',
    content: 'Your connection request was accepted.',
    relatedUser: userId
  });
  
  notifyUser(requesterId, 'new_notification', notification);
  
  res.json({ success: true });
});

// Messaging API
app.get('/api/messages/:userId/:peerId', async (req, res) => {
  const { userId, peerId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: peerId },
      { sender: peerId, receiver: userId }
    ]
  }).sort({ timestamp: 1 });
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const { sender, receiver, content } = req.body;
  const message = await Message.create({ sender, receiver, content });
  
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name')
    .populate('receiver', 'name');
    
  notifyUser(receiver, 'new_message', populatedMessage);
  res.json(populatedMessage);
});

// Notifications API
app.get('/api/notifications/:userId', async (req, res) => {
  const notifs = await Notification.find({ user: req.params.userId })
    .populate('relatedUser', 'name')
    .sort({ timestamp: -1 });
  res.json(notifs);
});

app.put('/api/notifications/:notifId/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.notifId, { isRead: true });
  res.json({ success: true });
});

// AI Assistant API — context-aware with note support
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, noteContext, userContext } = req.body;
  const q = (prompt || '').toLowerCase();

  let reply = '';

  // ── NOTE CONTEXT MODE ──────────────────────────────────────────────────────
  if (noteContext && noteContext.trim().length > 0) {
    const text = noteContext.trim();
    const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 20);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);

    // Word frequency for key topics
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w);

    const keyTopics = topWords.join(', ');
    const firstSentences = sentences.slice(0, 5).join('. ');
    const midSentences = sentences.slice(Math.floor(sentences.length / 3), Math.floor(sentences.length / 3) + 4).join('. ');

    if (q.includes('summarize') || q.includes('summary') || q.includes('overview') || q.includes('key points')) {
      reply = `📋 **Summary of your notes:**\n\n${firstSentences}.\n\n**Main topics covered:** ${keyTopics}.\n\nYour notes contain ${sentences.length} key statements across ${Math.ceil(text.length / 500)} sections.`;
    } else if (q.includes('quiz') || q.includes('test me') || q.includes('question')) {
      const q1 = sentences[Math.floor(sentences.length * 0.2)];
      const q2 = sentences[Math.floor(sentences.length * 0.5)];
      const q3 = sentences[Math.floor(sentences.length * 0.8)];
      reply = `🧠 **Quick Quiz based on your notes:**\n\n1. Based on your notes, explain: "${q1?.slice(0, 80)}..."\n\n2. What does this statement mean: "${q2?.slice(0, 80)}..."\n\n3. Can you elaborate on: "${q3?.slice(0, 80)}..."\n\nTry answering these and ask me to explain any one in detail!`;
    } else if (q.includes('important') || q.includes('key') || q.includes('main') || q.includes('topic')) {
      reply = `🔑 **Key topics in your notes:**\n\n${topWords.map((w, i) => `${i + 1}. **${w}**`).join('\n')}\n\nThe most discussed concept appears to be **${topWords[0]}**. Want me to explain any of these?`;
    } else if (q.includes('explain') || q.includes('what is') || q.includes('what are') || q.includes('how')) {
      // Find relevant sentences
      const queryWords = q.split(/\W+/).filter(w => w.length > 3);
      const relevant = sentences.filter(s => queryWords.some(w => s.toLowerCase().includes(w))).slice(0, 4);
      if (relevant.length > 0) {
        reply = `📖 **From your notes, here's what I found:**\n\n${relevant.join('. ')}.\n\nWould you like me to elaborate further?`;
      } else {
        reply = `📖 **From your notes:**\n\n${midSentences}.\n\nI couldn't find an exact match for your question, but the above is from the middle section of your notes. Try rephrasing?`;
      }
    } else if (q.includes('how many') || q.includes('count') || q.includes('number')) {
      reply = `📊 **Note stats:** Your uploaded notes contain approximately ${sentences.length} sentences, ${words.length} meaningful words, and cover around ${topWords.length} main topics.`;
    } else {
      // Generic context-aware response
      const queryWords = q.split(/\W+/).filter(w => w.length > 3);
      const relevant = sentences.filter(s => queryWords.some(w => s.toLowerCase().includes(w))).slice(0, 3);
      if (relevant.length > 0) {
        reply = `🔍 **Relevant section from your notes:**\n\n${relevant.join('. ')}.\n\nIs this what you were looking for? You can also ask me to summarize, quiz you, or find key topics!`;
      } else {
        reply = `I searched your notes but couldn't find content directly related to that. Try asking me to:\n• **Summarize** the notes\n• **Quiz** you on the content\n• Find **key topics**\n• **Explain** a specific term`;
      }
    }

  // ── GENERAL CAMPUS MODE ────────────────────────────────────────────────────
  } else {
    if (q.includes('event') || q.includes('hackathon') || q.includes('workshop')) {
      reply = "📅 There are exciting events this week! Check the **Event Radar** page to see upcoming hackathons, tech talks, and workshops. You can register and invite your connections directly!";
    } else if (q.includes('cafeteria') || q.includes('food') || q.includes('menu') || q.includes('eat')) {
      reply = "🍽️ Today's special is the **Grilled Chicken Salad** — high protein, low carb, perfect post-workout! Check the **Cafeteria** page for the full menu and live crowd status.";
    } else if (q.includes('note') || q.includes('study') || q.includes('upload')) {
      reply = "📚 You can upload your notes (PDF or .txt) using the 📎 button below! Once uploaded, I can summarize them, quiz you, or answer specific questions about the content.";
    } else if (q.includes('connect') || q.includes('friend') || q.includes('teammate') || q.includes('skill')) {
      reply = "👥 Head to **Skill Connect** to find teammates and send connection requests. You can filter by branch, skills, or interests!";
    } else if (q.includes('lost') || q.includes('found') || q.includes('item')) {
      reply = "🔍 Check the **Lost & Found** page to report a lost item or see what's been found around campus.";
    } else if (q.includes('chat') || q.includes('message')) {
      reply = "💬 Go to the **Chat** section to send direct messages to your connections in real time!";
    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      const name = userContext?.name ? `, ${userContext.name}` : '';
      reply = `Hey${name}! 👋 I'm your Smart Campus AI. Ask me about events, food, study notes, or upload your own notes for personalized Q&A!`;
    } else {
      reply = "I'm here to help! You can ask me about:\n• 📅 **Events** on campus\n• 🍽️ **Cafeteria** menu\n• 📚 **Notes** — upload yours for Q&A!\n• 👥 **Skill Connect** for teammates\n• 💬 **Chat** with connections";
    }
  }

  setTimeout(() => res.json({ reply }), 600);
});

// Notes API
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/api/notes/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, uploader, tags } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '/mock-url';
    const newNote = await Note.create({
      title,
      subject,
      uploader,
      tags: tags ? JSON.parse(tags) : [],
      fileUrl,
      rating: 0
    });
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Events API
app.get('/api/events', async (req, res) => {
  const events = await Event.find().populate('attendees', 'name');
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
});

app.post('/api/events/:eventId/register', async (req, res) => {
  const { userId } = req.body;
  const event = await Event.findByIdAndUpdate(req.params.eventId, {
    $addToSet: { attendees: userId }
  }, { new: true }).populate('attendees', 'name');
  res.json(event);
});

app.post('/api/events/:eventId/invite/:targetId', async (req, res) => {
  const { userId } = req.body; // Inviter
  
  const notification = await Notification.create({
    user: req.params.targetId,
    type: 'invite',
    content: 'You have been invited to an event!',
    relatedUser: userId,
    relatedEvent: req.params.eventId
  });
  
  notifyUser(req.params.targetId, 'new_notification', notification);
  res.json({ success: true });
});

// Cafeteria API
app.get('/api/cafeteria/menu', async (req, res) => {
  const menu = await CafeteriaItem.find();
  res.json(menu);
});

app.post('/api/cafeteria/menu', async (req, res) => {
  const item = await CafeteriaItem.create(req.body);
  res.json(item);
});

app.delete('/api/cafeteria/menu/:id', async (req, res) => {
  await CafeteriaItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/cafeteria/status', async (req, res) => {
  const status = await CafeteriaStatus.findOne();
  res.json(status);
});

app.post('/api/cafeteria/vote', async (req, res) => {
  const { voteType } = req.body;
  if (!['notCrowded', 'moderate', 'crowded'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }
  let status = await CafeteriaStatus.findOne();
  if (!status) status = new CafeteriaStatus();
  status[voteType] += 1;
  await status.save();
  res.json(status);
});

app.post('/api/cafeteria/reaction', async (req, res) => {
  const { reactionType } = req.body;
  let status = await CafeteriaStatus.findOne();
  if (status) {
    const reaction = status.reactions.find(r => r.type === reactionType);
    if (reaction) {
      reaction.count += 1;
    } else {
      status.reactions.push({ type: reactionType, count: 1 });
    }
    await status.save();
  }
  res.json(status);
});

// Lost & Found API
app.get('/api/lost-found', async (req, res) => {
  const items = await LostAndFound.find();
  res.json(items);
});

app.post('/api/lost-found', async (req, res) => {
  const item = await LostAndFound.create(req.body);
  res.json(item);
});

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    const dbPath = path.join(__dirname, 'local-db-data');
    
    // Create the directory if it doesn't exist to prevent errors
    const fs = require('fs');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath);
    }

    const mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('Connected to Local Persistent MongoDB');
    
    // Only seed if the database is completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await seedData();
    } else {
      console.log(`Database already contains ${userCount} users. Skipping seed.`);
    }
    
    server.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT} with WebSockets enabled`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
