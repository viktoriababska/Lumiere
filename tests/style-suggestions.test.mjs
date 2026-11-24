import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestStyles,catalog} from '../js/style-matcher.mjs';
test('mini evening style falls back to real mini dress in budget',()=>{
 const result=suggestStyles({occasion:'evening',length:'mini',silhouette:'a-line',budget:'7000'});
 assert.equal(result.relaxed,true);
 assert.equal(result.relaxedBy,'occasion');
 assert.equal(result.count,5);
 assert.ok(result.matches.every(d=>d.length==='mini'&&d.silhouette==='a-line'&&d.price<=7000));
});
test('strict match preserves exact filters',()=>{
 const result=suggestStyles({occasion:'cocktail',length:'mini',silhouette:'a-line',budget:'7000'});
 assert.equal(result.relaxed,false);
 assert.ok(result.count>0);
});
test('no dress above budget is suggested',()=>{
 const result=suggestStyles({occasion:'evening',length:'mini',silhouette:'fitted',budget:'1000'});
 assert.equal(result.count,0);
});
test('invalid and negative budgets rejected',()=>{
 for(const budget of ['-10','word','','999999999']) assert.throws(()=>suggestStyles({budget}),RangeError);
});
test('suggested items all belong to the real catalog',()=>{
 const result=suggestStyles({occasion:'evening',length:'mini',silhouette:'fitted',budget:'6600'});
 assert.ok(result.count>0);
 const realIds=new Set(catalog.map(d=>d.id));
 for(const item of result.matches)assert.ok(realIds.has(item.id));
});

for (const length of ['mini','maxi']) {
  for (const occasion of ['any','evening','cocktail']) {
    for (const silhouette of ['any','fitted','a-line','corset']) {
      test(`selected ${length} NEVER changes (${occasion},${silhouette})`, () => {
        const result = suggestStyles({occasion,length,silhouette,budget:'50000'});
        assert.ok(result.matches.every(item => item.length === length));
        assert.notEqual(result.relaxedBy, 'length');
      });
    }
  }
}
