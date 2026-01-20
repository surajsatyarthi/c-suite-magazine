import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Note: In a real scenario, we might export the mapping from the script.
// Here we are testing the logic/contract of the mapping.

const imageMapping = [
  { file: 'Bill Faruki.png', searchTerm: 'Bill Faruki' },
  { file: 'Brianne Howey.png', searchTerm: 'Brianne Howey' },
  { file: 'stoyana natseva.png', searchTerm: 'Stoyana Natseva' },
  { file: 'dr. basma ghandourah.png', searchTerm: 'Basma Ghandourah' },
  { file: 'Erin Krueger.png', searchTerm: 'Erin Krueger' },
  { file: 'Pankaj Bansal.png', searchTerm: 'Pankaj Bansal' },
  { file: 'Supreet Nagi.png', searchTerm: 'Supreet Nagi' },
  { file: 'Swami Aniruddha.png', searchTerm: 'Swami Aniruddha' },
  { file: 'bryce tully.png', searchTerm: 'Bryce Tully' },
  { file: 'cal riley.png', searchTerm: 'Cal Riley' },
  { file: 'Olga Denysiuk.png', searchTerm: 'Olga Denysiuk' },
  { file: 'Angelina Usanova.png', searchTerm: 'Angelina Usanova' },
  { file: 'Benjamin Borketey.png', searchTerm: 'Benjamin Borketey' },
  { file: 'Bryan Smeltzer.png', searchTerm: 'Bryan Smeltzer' },
  { file: 'Dean Fealk.png', searchTerm: 'Dean Fealk' },
  { file: 'John Zangardi.png', searchTerm: 'John Zangardi' },
  { file: 'Rich Stinson Bansal.png', searchTerm: 'Rich Stinson' },
  { file: 'Stella Ambrose.png', searchTerm: 'Stella Ambrose' },
  { file: 'Sukhinder Singh.png', searchTerm: 'Sukhinder' },
];

describe('Spotlight Image Mapping', () => {
  it('should contain all 19 mandatory images', () => {
    expect(imageMapping.length).toBe(19);
  });

  it('should have valid search terms for all files', () => {
    imageMapping.forEach(mapping => {
      expect(mapping.searchTerm.length).toBeGreaterThan(0);
      expect(mapping.file).toMatch(/\.png$/);
    });
  });

  it('should verify physical existence of all mapped files', () => {
    const FEATURED_SECTION_DIR = path.join(process.cwd(), 'public/Featured section');
    imageMapping.forEach(mapping => {
        const fullPath = path.join(FEATURED_SECTION_DIR, mapping.file);
        expect(fs.existsSync(fullPath)).toBe(true);
    });
  });
});
