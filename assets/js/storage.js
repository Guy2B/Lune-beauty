export const DB={ get records(){return JSON.parse(localStorage.getItem('lune_records')||'[]');}, save(r){const a=DB.records;a.unshift(r);localStorage.setItem('lune_records',JSON.stringify(a));} };
