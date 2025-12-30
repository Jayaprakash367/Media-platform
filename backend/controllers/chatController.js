const { Op } = require('sequelize');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all chats for current user
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 20, 10);
    const offset = (page - 1) * limit;

    const chats = await Chat.findAll({
      where: {
        isArchived: false,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      },
      order: [['lastMessageAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, as: 'participant1', attributes: ['id', 'username', 'fullName', 'profilePicture', 'lastSeen'] },
        { model: User, as: 'participant2', attributes: ['id', 'username', 'fullName', 'profilePicture', 'lastSeen'] }
      ]
    });

    const totalChats = await Chat.count({
      where: {
        isArchived: false,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipant = chat.participant1Id === userId ? chat.participant2 : chat.participant1;

        const lastMessage = await Message.findOne({
          where: { chatId: chat.id },
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'profilePicture'] }]
        });

        const unreadCount = await Message.count({
          where: { chatId: chat.id, senderId: { [Op.ne]: userId }, isRead: false }
        });

        return {
          id: chat.id,
          _id: chat.id,
          participant: otherParticipant,
          lastMessage,
          lastMessageAt: chat.lastMessageAt,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        chats: formattedChats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalChats / limit),
          totalItems: totalChats,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching chats' });
  }
};

// Get or create chat with user
const getOrCreateChat = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (otherUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot chat with yourself' });
    }

    const otherUser = await User.findByPk(otherUserId, {
      attributes: ['id', 'username', 'fullName', 'profilePicture']
    });
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { participant1Id: currentUserId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: currentUserId }
        ]
      }
    });

    if (!chat) {
      chat = await Chat.create({ participant1Id: currentUserId, participant2Id: otherUserId });
    }

    const lastMessage = await Message.findOne({
      where: { chatId: chat.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'profilePicture'] }]
    });

    const unreadCount = await Message.count({
      where: { chatId: chat.id, senderId: { [Op.ne]: currentUserId }, isRead: false }
    });

    res.json({
      success: true,
      data: {
        chat: {
          id: chat.id,
          _id: chat.id,
          participant: otherUser,
          lastMessage,
          lastMessageAt: chat.lastMessageAt,
          unreadCount
        }
      }
    });
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching/creating chat' });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 50, 10);
    const userId = req.user.id;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    const messages = await Message.findAll({
      where: { chatId },
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'profilePicture'] }]
    });

    await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { chatId, senderId: { [Op.ne]: userId }, isRead: false } }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, messageType = 'text', mediaUrl } = req.body;
    const userId = req.user.id;

    if (messageType === 'text' && (!text || text.trim().length === 0)) {
      return res.status(400).json({ success: false, message: 'Message text is required for text messages' });
    }

    if (messageType !== 'text' && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Media URL is required for non-text messages' });
    }

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    const message = await Message.create({
      chatId,
      senderId: userId,
      text: text || '',
      messageType,
      mediaUrl: mediaUrl || null
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    const recipientId = chat.participant1Id === userId ? chat.participant2Id : chat.participant1Id;

    try {
      await Notification.create({
        recipientId,
        senderId: userId,
        type: 'message',
        relatedChatId: chat.id,
        message: `New message from ${req.user.username || 'someone'}`
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    const io = req.app.get('io');
    const activeUsers = req.app.get('activeUsers');
    const recipientSocketId = activeUsers && activeUsers.get(recipientId);

    if (recipientSocketId && io) {
      io.to(recipientSocketId).emit('new-message', {
        chatId,
        message,
        sender: {
          id: req.user.id,
          username: req.user.username,
          fullName: req.user.fullName,
          profilePicture: req.user.profilePicture
        }
      });
    }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: { message } });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    const [updated] = await Message.update(
      { isRead: true, readAt: new Date() },
      { where: { chatId, senderId: { [Op.ne]: userId }, isRead: false } }
    );

    res.json({ success: true, message: 'Messages marked as read', data: { updated } });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ success: false, message: 'Server error marking messages as read' });
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    const message = await Message.findOne({ where: { id: messageId, chatId } });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting message' });
  }
};

// Archive chat
const archiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found or access denied' });
    }

    chat.isArchived = true;
    await chat.save();

    res.json({ success: true, message: 'Chat archived successfully' });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ success: false, message: 'Server error archiving chat' });
  }
};

// Get total unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all chats for the user
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }]
      }
    });

    // Count total unread messages
    let totalUnread = 0;
    for (const chat of chats) {
      const unreadCount = await Message.count({
        where: {
          chatId: chat.id,
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      });
      totalUnread += unreadCount;
    }

    res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error getting unread count' });
  }
};

module.exports = {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  archiveChat,
  getUnreadCount
};
