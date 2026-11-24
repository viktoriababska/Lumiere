/** LAB 11 — Pure match engine from real Lumiere catalog data. Strict input checking. */
export const catalog = Object.freeze([{"id": "flora", "name": "Сукня FLORA", "price": 5200, "image": "assets/images/dress-flora.webp", "occasion": "cocktail", "length": "mini", "silhouette": "a-line"}, {"id": "lirienna", "name": "Сукня LIRIENNA", "price": 9100, "image": "assets/images/dress-lirienna.webp", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "antoinetta", "name": "Костюм-сукня ANTOINETTA", "price": 5900, "image": "assets/images/dress-antoinetta-yellow.webp", "occasion": "cocktail", "length": "mini", "silhouette": "a-line"}, {"id": "dalila", "name": "Сукня DALILA", "price": 4600, "image": "assets/images/dress-dalila.webp", "occasion": "cocktail", "length": "mini", "silhouette": "fitted"}, {"id": "emma", "name": "Сукня EMMA", "price": 5700, "image": "assets/images/dress-emma.webp", "occasion": "cocktail", "length": "mini", "silhouette": "corset"}, {"id": "erika", "name": "Сукня ERIKA", "price": 5300, "image": "assets/images/dress-erika.webp", "occasion": "cocktail", "length": "mini", "silhouette": "fitted"}, {"id": "leola", "name": "Сукня LEOLA", "price": 2800, "image": "assets/images/dress-leola.webp", "occasion": "cocktail", "length": "mini", "silhouette": "fitted"}, {"id": "lolita", "name": "Сукня LOLITA", "price": 5200, "image": "assets/images/dress-lolita.webp", "occasion": "cocktail", "length": "mini", "silhouette": "a-line"}, {"id": "lucrezia", "name": "Сукня LUCREZIA", "price": 4500, "image": "assets/images/dress-lucrezia.webp", "occasion": "cocktail", "length": "mini", "silhouette": "a-line"}, {"id": "monaco", "name": "Сукня MONACO", "price": 5200, "image": "assets/images/dress-monaco.webp", "occasion": "cocktail", "length": "mini", "silhouette": "a-line"}, {"id": "monica", "name": "Сукня MONICA", "price": 3900, "image": "assets/images/dress-monica.webp", "occasion": "cocktail", "length": "mini", "silhouette": "corset"}, {"id": "molly", "name": "Сукня MOLLY", "price": 4800, "image": "assets/images/dress-molly.webp", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "napoli", "name": "Сукня NAPOLI", "price": 7600, "image": "assets/images/dress-napoli.webp", "occasion": "evening", "length": "maxi", "silhouette": "a-line"}, {"id": "angelica", "name": "Сукня ANGELICA", "price": 6900, "image": "assets/images/dress-angelica.webp", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "elizabeth", "name": "Сукня ELIZABETH", "price": 4800, "image": "assets/images/dress-elizabeth.jpg", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "amour", "name": "Сукня AMOUR", "price": 5100, "image": "assets/images/dress-amour.jpg", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "emanuela", "name": "Сукня EMANUELA", "price": 5700, "image": "assets/images/dress-emanuela.jpg", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}, {"id": "antibes", "name": "Сукня ANTIBES", "price": 3600, "image": "assets/images/dress-antibes.jpg", "occasion": "cocktail", "length": "mini", "silhouette": "fitted"}, {"id": "francesca", "name": "Сукня FRANCESCA", "price": 4300, "image": "assets/images/dress-francesca.jpg", "occasion": "evening", "length": "maxi", "silhouette": "fitted"}].map(item => Object.freeze(item)));
export function findStyles({occasion='any', length='any', silhouette='any', budget='10000'} = {}) {
 const VALID={occasion:['any','evening','cocktail'],length:['any','mini','maxi'],silhouette:['any','fitted','a-line','corset']};
 for (const [key,allowed] of Object.entries(VALID)) if(!allowed.includes(arguments[0]?.[key] ?? 'any')) throw new RangeError('Оберіть варіант із доступного списку.');
 const raw=String(budget??'');
 if(!/^\d+$/.test(raw)) throw new RangeError('Бюджет потрібно вказати цілим числом.');
 const limit=Number(raw);
 if(!Number.isSafeInteger(limit)||limit<1000||limit>50000) throw new RangeError('Вкажіть бюджет від 1 000 до 50 000 ₴.');
 const matches=catalog.filter(item => item.price<=limit && (occasion==='any'||item.occasion===occasion) && (length==='any'||item.length===length) && (silhouette==='any'||item.silhouette===silhouette));
 // Preference for an appropriate product closest to the requested budget, not a made-up price.
 matches.sort((a,b)=> b.price-a.price || a.name.localeCompare(b.name,'uk'));
 return Object.freeze({count:matches.length, first:matches[0]??null, matches:Object.freeze(matches)});
}

/** Nearby real catalog choices when exact occasion or silhouette are unavailable.
 *  Selected LENGTH and BUDGET are always hard constraints and NEVER relaxed.
 */
export function suggestStyles(filters) {
 const strict = findStyles(filters);
 if (strict.count) return Object.freeze({ ...strict, relaxed: false, relaxedBy: '' });
 const stages = [
  { relaxedBy:'occasion', filters: {...filters, occasion:'any'} },
  { relaxedBy:'silhouette', filters:{...filters, occasion:'any', silhouette:'any'} }
 ];
 for (const stage of stages) {
   const options = findStyles(stage.filters);
   if (options.count) return Object.freeze({...options, relaxed:true, relaxedBy:stage.relaxedBy});
 }
 return Object.freeze({...strict, relaxed:false, relaxedBy:'budget'});
}
