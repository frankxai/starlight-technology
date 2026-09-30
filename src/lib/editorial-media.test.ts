import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { allEditorial } from './content';
import visuals from './editorial-visuals.json';
import { editorialRecommendations, recommendationDestination } from './editorial-recommendations';

describe('article media references', () => {
  it('resolves every published figure and recommendation', () => {
    for (const article of allEditorial) for (const section of article.sections) {
      if (section.visualId) {
        const visual = visuals[section.visualId];
        expect(visual.alt.length).toBeGreaterThan(20);
        expect(visual.credit).toBeTruthy();
        expect(visual.rights).toBe('original');
        expect(existsSync(`public${visual.src}`)).toBe(true);
      }
      if (section.recommendationId) expect(editorialRecommendations[section.recommendationId]).toBeDefined();
    }
  });
  it('keeps editorial links ordinary until a valid partner URL is configured', () => {
    const item = editorialRecommendations['gpu-comparison'];
    expect(recommendationDestination(item)).toEqual({ href: item.url, sponsored: false });
    expect(recommendationDestination({ ...item, partner: { status: 'active', url: 'javascript:alert(1)', verifiedOn: '2026-09-16' } })).toEqual({ href: item.url, sponsored: false });
    const url = 'https://partner.example/?ref=issued%2Bvalue';
    expect(recommendationDestination({ ...item, partner: { status: 'active', url, verifiedOn: '2026-09-16' } })).toEqual({ href: url, sponsored: true });
  });
});
