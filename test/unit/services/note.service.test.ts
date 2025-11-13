import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { NoteService } from '../../../src/services/note.service'
import {
  mockNoteInDb,
  mockNoteInDb2,
  mockNoteFromAnotherUser,
  testNotes,
} from '../../fixtures/notes'
import { mockUserInDb, mockUserInDb2 } from '../../fixtures/users'

// Mock prisma module
const mockPrisma = {
  note: {
    create: mock(),
    findMany: mock(),
    findFirst: mock(),
    update: mock(),
    delete: mock(),
  },
}

mock.module('../../../src/db', () => ({
  prisma: mockPrisma,
}))

describe('NoteService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockPrisma.note.create.mockReset()
    mockPrisma.note.findMany.mockReset()
    mockPrisma.note.findFirst.mockReset()
    mockPrisma.note.update.mockReset()
    mockPrisma.note.delete.mockReset()
  })

  describe('createNote', () => {
    it('TC-NOTE-001: should create note successfully', async () => {
      mockPrisma.note.create.mockResolvedValue(mockNoteInDb)

      const result = await NoteService.createNote(
        mockUserInDb.id,
        testNotes.validNote.title,
        testNotes.validNote.content
      )

      expect(result.id).toBe(mockNoteInDb.id)
      expect(result.title).toBe(mockNoteInDb.title)
      expect(mockPrisma.note.create).toHaveBeenCalledWith({
        data: {
          title: testNotes.validNote.title,
          content: testNotes.validNote.content,
          userId: mockUserInDb.id,
        },
      })
    })

    it('TC-EDGE-004: should handle long content', async () => {
      const longNote = {
        ...mockNoteInDb,
        content: testNotes.longContentNote.content,
      }
      mockPrisma.note.create.mockResolvedValue(longNote)

      const result = await NoteService.createNote(
        mockUserInDb.id,
        testNotes.longContentNote.title,
        testNotes.longContentNote.content
      )

      expect(result.content).toBe(testNotes.longContentNote.content)
    })

    it('TC-EDGE-005: should handle Unicode and special characters', async () => {
      const unicodeNote = {
        ...mockNoteInDb,
        title: testNotes.unicodeNote.title,
        content: testNotes.unicodeNote.content,
      }
      mockPrisma.note.create.mockResolvedValue(unicodeNote)

      const result = await NoteService.createNote(
        mockUserInDb.id,
        testNotes.unicodeNote.title,
        testNotes.unicodeNote.content
      )

      expect(result.title).toBe(testNotes.unicodeNote.title)
      expect(result.content).toBe(testNotes.unicodeNote.content)
    })
  })

  describe('getNotes', () => {
    it('TC-NOTE-002: should get all user notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([
        mockNoteInDb,
        mockNoteInDb2,
      ])

      const results = await NoteService.getNotes(mockUserInDb.id)

      expect(results).toHaveLength(2)
      expect(results[0].id).toBe(mockNoteInDb.id)
      expect(results[1].id).toBe(mockNoteInDb2.id)
      expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserInDb.id },
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('TC-NOTE-003: should return empty array when user has no notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([])

      const results = await NoteService.getNotes(mockUserInDb.id)

      expect(results).toHaveLength(0)
    })

    it('TC-INT-004: should only return notes owned by the user', async () => {
      // User should only see their notes, not other users' notes
      mockPrisma.note.findMany.mockResolvedValue([mockNoteInDb])

      const results = await NoteService.getNotes(mockUserInDb.id)

      expect(results.every((note) => note.userId === mockUserInDb.id)).toBe(
        true
      )
    })
  })

  describe('getNoteById', () => {
    it('TC-NOTE-004: should get note by ID successfully', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNoteInDb)

      const result = await NoteService.getNoteById(
        mockNoteInDb.id,
        mockUserInDb.id
      )

      expect(result.id).toBe(mockNoteInDb.id)
      expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: { id: mockNoteInDb.id, userId: mockUserInDb.id },
      })
    })

    it('TC-NOTE-005: should throw error for non-existent note', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null)

      await expect(
        NoteService.getNoteById('non-existent-id', mockUserInDb.id)
      ).rejects.toThrow('Note not found')
    })

    it('TC-NOTE-006: should throw error when accessing other users note', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null)

      await expect(
        NoteService.getNoteById(mockNoteFromAnotherUser.id, mockUserInDb.id)
      ).rejects.toThrow('Note not found')

      expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockNoteFromAnotherUser.id,
          userId: mockUserInDb.id,
        },
      })
    })
  })

  describe('updateNote', () => {
    it('TC-NOTE-007: should update note successfully', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNoteInDb)
      mockPrisma.note.update.mockResolvedValue({
        ...mockNoteInDb,
        title: 'Updated Title',
      })

      const result = await NoteService.updateNote(
        mockNoteInDb.id,
        mockUserInDb.id,
        { title: 'Updated Title' }
      )

      expect(result.title).toBe('Updated Title')
      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: mockNoteInDb.id },
        data: { title: 'Updated Title' },
      })
    })

    it('TC-NOTE-008: should verify ownership before update', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null)

      await expect(
        NoteService.updateNote(mockNoteFromAnotherUser.id, mockUserInDb.id, {
          title: 'Hacked',
        })
      ).rejects.toThrow('Note not found')

      expect(mockPrisma.note.update).not.toHaveBeenCalled()
    })

    it('TC-NOTE-009: should update only provided fields', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNoteInDb)
      mockPrisma.note.update.mockResolvedValue({
        ...mockNoteInDb,
        title: 'Updated Title',
      })

      await NoteService.updateNote(mockNoteInDb.id, mockUserInDb.id, {
        title: 'Updated Title',
      })

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: mockNoteInDb.id },
        data: { title: 'Updated Title' },
      })
    })

    it('TC-EDGE-006: should handle empty string in update', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNoteInDb)
      mockPrisma.note.update.mockResolvedValue({
        ...mockNoteInDb,
        content: '',
      })

      const result = await NoteService.updateNote(
        mockNoteInDb.id,
        mockUserInDb.id,
        { content: '' }
      )

      expect(result.content).toBe('')
    })
  })

  describe('deleteNote', () => {
    it('TC-NOTE-010: should delete note successfully', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNoteInDb)
      mockPrisma.note.delete.mockResolvedValue(mockNoteInDb)

      await NoteService.deleteNote(mockNoteInDb.id, mockUserInDb.id)

      expect(mockPrisma.note.delete).toHaveBeenCalledWith({
        where: { id: mockNoteInDb.id },
      })
    })

    it('TC-NOTE-011: should verify ownership before delete', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null)

      await expect(
        NoteService.deleteNote(mockNoteFromAnotherUser.id, mockUserInDb.id)
      ).rejects.toThrow('Note not found')

      expect(mockPrisma.note.delete).not.toHaveBeenCalled()
    })

    it('TC-NOTE-012: should throw error when deleting non-existent note', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null)

      await expect(
        NoteService.deleteNote('non-existent-id', mockUserInDb.id)
      ).rejects.toThrow('Note not found')
    })
  })
})
