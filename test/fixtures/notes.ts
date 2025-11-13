export const testNotes = {
  validNote: {
    title: 'Test Note',
    content: 'This is a test note content.',
  },
  anotherNote: {
    title: 'Another Note',
    content: 'Another test note content.',
  },
  emptyContentNote: {
    title: 'Empty Content',
    content: '',
  },
  longTitleNote: {
    title: 'A'.repeat(256), // 256 characters
    content: 'Long title test',
  },
  longContentNote: {
    title: 'Long Content Note',
    content: 'A'.repeat(10000), // 10000 characters
  },
  unicodeNote: {
    title: 'Unicode Note',
    content: 'ทดสอบ Unicode 中文 日本語 🎉 Emoji test',
  },
  specialCharsNote: {
    title: 'Special Characters',
    content: '<script>alert("XSS")</script> & "quotes" \'single\'',
  },
}

export const mockNoteInDb = {
  id: 'note-123',
  title: 'Test Note',
  content: 'This is a test note content.',
  userId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

export const mockNoteInDb2 = {
  id: 'note-456',
  title: 'Another Note',
  content: 'Another test note content.',
  userId: 'user-123',
  createdAt: new Date('2024-01-02T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
}

export const mockNoteFromAnotherUser = {
  id: 'note-789',
  title: 'Other User Note',
  content: 'This note belongs to another user.',
  userId: 'user-456',
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
}
