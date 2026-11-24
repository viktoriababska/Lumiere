import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateOutfit } from '../js/outfit-calculator.mjs';

const data = [
  ['initial amount', { dressPrice:'5200',accessory:'none',delivery:'pickup',wrapping:false },5200],
  ['all options', { dressPrice:'5200',accessory:'clutch',delivery:'courier',wrapping:true },7150],
  ['min price', { dressPrice:'1000',accessory:'none',delivery:'pickup' },1000],
  ['max price', { dressPrice:'50000',accessory:'earrings',delivery:'post' },51050],
];
for (const [name,input,expected] of data) {
  test(name,()=>assert.equal(estimateOutfit(input).total,expected));
}
const invalid = [
  ['', 'empty'], ['0', 'zero'], ['-5', 'negative'], ['50001', 'too big'],
  ['2.5', 'fractional'], ['2501', 'wrong step'], ['NaN', 'NaN'],
  ['Infinity', 'Infinity'], ['1e4', 'scientific notation'], ['text', 'letters'],
  ['999999999999999999999', 'overflow'], [' 5200 ', 'spaces']
];
for (const [price,name] of invalid) {
  test(`reject ${name}`,()=>assert.throws(()=>estimateOutfit({dressPrice:price}),RangeError));
}
test('invalid accessory',()=>assert.throws(()=>estimateOutfit({dressPrice:'5200',accessory:'fake'}),RangeError));
test('invalid delivery',()=>assert.throws(()=>estimateOutfit({dressPrice:'5200',delivery:'fake'}),RangeError));
test('invalid checkbox value',()=>assert.throws(()=>estimateOutfit({dressPrice:'5200',wrapping:'yes'}),TypeError));
test('rapid changes are deterministic',()=>{
  for (let n=1000;n<=50000;n+=100) assert.equal(estimateOutfit({dressPrice:String(n)}).total,n);
});
