import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema for notice comments
const NoticeCommentSchema = new Schema({
  noticeId: {
    type: Schema.Types.ObjectId,
    ref: 'Notice',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: String // usernames of users who liked the comment
  }]
});

// Schema for notices
const NoticeSchema = new Schema({
  author: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'announcement', 'team-building', 'vacancy'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: String // usernames of users who liked the notice
  }],
  pinned: {
    type: Boolean,
    default: false
  }
});

// Create models
const Notice = mongoose.model('Notice', NoticeSchema);
const NoticeComment = mongoose.model('NoticeComment', NoticeCommentSchema);

export { Notice, NoticeComment };