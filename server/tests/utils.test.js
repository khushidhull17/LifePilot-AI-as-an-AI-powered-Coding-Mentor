import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonFromText } from '../utils/parseJson.js';
import { computeRoadmapStats } from '../utils/roadmap.js';
import { daysBetween, dayKey, lastNDays } from '../utils/date.js';
import { roadmapPlanSchema, updateTopicArgsSchema } from '../utils/schemas.js';

test('parseJsonFromText handles plain JSON, fences and commentary', () => {
  assert.deepEqual(parseJsonFromText('{"ok":true}'), { ok: true });
  assert.deepEqual(parseJsonFromText('```json\n{"ok":true}\n```'), { ok: true });
  assert.deepEqual(
    parseJsonFromText('Here is your plan:\n{"title":"Path","phases":[]}\nHope it helps!'),
    { title: 'Path', phases: [] }
  );
  assert.deepEqual(parseJsonFromText('Result: [1,2,3]'), [1, 2, 3]);
  assert.throws(() => parseJsonFromText('not json at all'), /invalid JSON/i);
  assert.throws(() => parseJsonFromText(''), /empty response/i);
});

test('computeRoadmapStats reports totals, next topic and percentages', () => {
  const roadmap = {
    phases: [
      {
        _id: 'phase1',
        title: 'Phase One',
        topics: [
          { _id: 't1', title: 'Topic 1', completed: true, estimatedMinutes: 30, explanation: 'x', exercises: [] },
          { _id: 't2', title: 'Topic 2', completed: false, estimatedMinutes: 45, explanation: 'x', exercises: [] },
        ],
      },
      {
        _id: 'phase2',
        title: 'Phase Two',
        topics: [
          { _id: 't3', title: 'Topic 3', completed: false, estimatedMinutes: 60, explanation: 'x', exercises: [] },
        ],
      },
    ],
  };

  const stats = computeRoadmapStats(roadmap);
  assert.equal(stats.totalTopics, 3);
  assert.equal(stats.completedTopics, 1);
  assert.equal(stats.pendingTopics, 2);
  assert.equal(stats.completionPercent, 33);
  assert.equal(stats.totalMinutes, 135);
  assert.equal(stats.remainingMinutes, 105);
  assert.equal(stats.nextTopic.topicId, 't2');
  assert.equal(stats.nextTopic.phaseTitle, 'Phase One');

  const empty = computeRoadmapStats(null);
  assert.equal(empty.totalTopics, 0);
  assert.equal(empty.completionPercent, 0);
  assert.equal(empty.nextTopic, null);
});

test('date helpers use UTC day boundaries', () => {
  const first = new Date('2026-11-17T23:30:00Z');
  const second = new Date('2026-11-18T00:10:00Z');

  assert.equal(dayKey(first), '2026-11-17');
  assert.equal(daysBetween(first, second), 1);
  assert.equal(daysBetween(second, first), -1);
  assert.equal(lastNDays(7, second).length, 7);
  assert.equal(dayKey(lastNDays(7, second)[6]), '2026-11-18');
});

test('roadmapPlanSchema validates and normalizes AI output', () => {
  const plan = roadmapPlanSchema.parse({
    title: 'Web Basics',
    description: 'A beginner roadmap that starts with HTML and ends with a small project.',
    phases: [
      {
        title: 'HTML',
        description: 'Structure pages with semantic HTML.',
        estimatedHours: '6.6',
        topics: [
          {
            title: 'Semantic tags',
            explanation: 'Semantic tags describe what content means, not just how it looks.',
            estimatedMinutes: '30.7',
            exercises: ['Build a section'],
            miniProject: 'Profile page',
          },
        ],
      },
    ],
  });

  assert.equal(plan.phases[0].estimatedHours, 7);
  assert.equal(plan.phases[0].topics[0].estimatedMinutes, 31);
});

test('roadmapPlanSchema rejects malformed plans', () => {
  assert.throws(() =>
    roadmapPlanSchema.parse({
      title: 'Broken',
      description: 'Too short',
      phases: [],
    })
  );

  assert.throws(() =>
    updateTopicArgsSchema.parse({ topicId: 'not-an-object-id', completed: true })
  );
});
