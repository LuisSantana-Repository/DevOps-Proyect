// ./seed/seed.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGO_URI || "mongodb://root:example@mongo:27017";
const dbName = process.env.MONGO_DB || process.env.MONGO_INITDB_DATABASE || "app";
const seedsDir = path.resolve(__dirname, "./seeds"); // ← mapea ./db/seeds del host a /seed/seeds en el contenedor

function toArray(x) { return Array.isArray(x) ? x : [x]; }

// Recorre el objeto y convierte { $oid: "…" } → ObjectId("…")
function reviveMongoIds(value) {
  if (Array.isArray(value)) return value.map(reviveMongoIds);
  if (value && typeof value === "object") {
    if (value.$oid && typeof value.$oid === "string") return new ObjectId(value.$oid);
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveMongoIds(v);
    return out;
  }
  return value;
}

(async () => {
  console.log(`Seed | Conectando a ${uri}, DB=${dbName}`);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  try {
    await client.connect();
    const db = client.db(dbName);

    if (!fs.existsSync(seedsDir)) {
      console.log(`Seed | No existe carpeta: ${seedsDir} — nada que hacer.`);
      process.exit(0);
    }

    const files = fs.readdirSync(seedsDir).filter(f => f.toLowerCase().endsWith(".json"));
    if (files.length === 0) {
      console.log("Seed | No hay archivos .json en seeds — nada que insertar.");
      process.exit(0);
    }

    for (const file of files) {
      const full = path.join(seedsDir, file);
      const collName = path.basename(file).replace(/\.json$/i, "");
      const raw = fs.readFileSync(full, "utf8").trim();
      if (!raw) continue;

      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (e) {
        console.error(`Seed | JSON inválido en ${file}: ${e.message}`);
        process.exit(1);
      }

      const docs = toArray(parsed).map(reviveMongoIds);
      console.log(`Seed | ${collName}: borrando colección…`);
      await db.collection(collName).deleteMany({});
      console.log(`Seed | ${collName}: insertando ${docs.length} documento(s)…`);
      const res = await db.collection(collName).insertMany(docs);
      console.log(`Seed | ${collName}: insertados ${res.insertedCount}.`);
    }

    console.log("Seed | Completado ✅");
  } catch (err) {
    console.error("Seed | Falló ❌", err);
    process.exit(2);
  } finally {
    await client.close();
  }
})();
