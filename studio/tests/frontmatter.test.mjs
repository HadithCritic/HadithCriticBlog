import test from 'node:test';
import assert from 'node:assert/strict';
import { patchYamlField,parseYaml } from '../src/editor.mjs';
test('metadata edits replace complete YAML fields without rewriting unrelated citation strings',()=>{
  const before='title: "Exact title"\ndescription: >-\n  First line\n  Second line\ntags:\n  - Arabic\n  - إِنَّ\ncategory: "Transmission & Narrators"\ncustomCitation: "Exact vol. 1, p. 2"\n';
  const after=patchYamlField(before,'description','New description');
  assert.equal(parseYaml(after).description,'New description');
  assert.ok(after.includes('tags:\n  - Arabic\n  - إِنَّ\n'));
  assert.ok(after.includes('customCitation: "Exact vol. 1, p. 2"\n'));
  const tags=patchYamlField(after,'tags',['Exact','ʿĀʾisha']);assert.deepEqual(parseYaml(tags).tags,['Exact','ʿĀʾisha']);
  assert.ok(!tags.includes('  - Arabic'));
});
