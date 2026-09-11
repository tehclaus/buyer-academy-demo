import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  getAllQuizQuestions,
  getAllVideos,
  getQuestionPoolForDayRange,
  getVideoById,
} from './curriculum';
import { CHECKPOINT_ANCHOR_DAYS, CHECKPOINT_SPAN_DAYS, TOTAL_DAYS } from '../types';

describe('curriculum data integrity', () => {
  it('has exactly 20 days', () => {
    expect(CURRICULUM).toHaveLength(TOTAL_DAYS);
    CURRICULUM.forEach((day, i) => expect(day.day).toBe(i + 1));
  });

  it('has exactly 5 videos per day (100 total)', () => {
    CURRICULUM.forEach((day) => expect(day.videos).toHaveLength(5));
    expect(getAllVideos()).toHaveLength(100);
  });

  it('has exactly 10 quiz questions per day (200 total)', () => {
    CURRICULUM.forEach((day) => expect(day.quiz).toHaveLength(10));
    expect(getAllQuizQuestions()).toHaveLength(200);
  });

  it('has approximately 7 knowledge and 3 situational questions per day', () => {
    for (const day of CURRICULUM) {
      const knowledge = day.quiz.filter((q) => q.type === 'knowledge').length;
      const situational = day.quiz.filter((q) => q.type === 'situational').length;
      expect(knowledge + situational).toBe(10);
      expect(situational).toBeGreaterThanOrEqual(2);
      expect(situational).toBeLessThanOrEqual(4);
    }
  });

  it('every question has a valid correctIndex and a review video that exists on the same day', () => {
    for (const day of CURRICULUM) {
      const dayVideoIds = new Set(day.videos.map((v) => v.id));
      for (const q of day.quiz) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
        expect(q.options).toHaveLength(4);
        expect(dayVideoIds.has(q.reviewVideoId)).toBe(true);
        expect(getVideoById(q.reviewVideoId)).toBeDefined();
        expect(q.sourceDay).toBe(day.day);
      }
    }
  });

  it('has no duplicate question text within a single day (not superficial duplicates)', () => {
    for (const day of CURRICULUM) {
      const questionTexts = day.quiz.map((q) => q.question);
      expect(new Set(questionTexts).size).toBe(questionTexts.length);
    }
  });

  it('has globally unique video ids and question ids', () => {
    const videoIds = getAllVideos().map((v) => v.id);
    expect(new Set(videoIds).size).toBe(videoIds.length);

    const questionIds = getAllQuizQuestions().map((q) => q.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it('provides a 50-question pool (5 days x 10) for each weekly checkpoint range', () => {
    for (const anchorDay of CHECKPOINT_ANCHOR_DAYS) {
      const pool = getQuestionPoolForDayRange(anchorDay - CHECKPOINT_SPAN_DAYS + 1, anchorDay);
      expect(pool).toHaveLength(CHECKPOINT_SPAN_DAYS * 10);
    }
  });

  it('provides the full 200-question pool for certification', () => {
    expect(getQuestionPoolForDayRange(1, TOTAL_DAYS)).toHaveLength(200);
  });
});
