import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of ['0001_private_editorial_store.sql','0002_authoring_media_publications.sql']) sqlite.exec(readFileSync(new URL(`../migrations/${file}`,import.meta.url),'utf8'));
  const db = {
    sqlite,
    prepare(sql) {
      let args = [];
      const statement = {
        bind(...values){args=values;return statement;},
        async first(){return sqlite.prepare(sql).get(...args) || null;},
        async all(){return {results:sqlite.prepare(sql).all(...args)};},
        async run(){const result=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)},results:[]};},
        execute(){const stmt=sqlite.prepare(sql);if(stmt.columns().length){const results=stmt.all(...args);return {results,meta:{changes:results.length}};}const result=stmt.run(...args);return {results:[],meta:{changes:Number(result.changes)}};}
      };
      return statement;
    },
    async batch(statements){
      sqlite.exec('BEGIN');
      try {const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results;} catch(error){sqlite.exec('ROLLBACK');throw error;}
    }
  };
  return db;
}
