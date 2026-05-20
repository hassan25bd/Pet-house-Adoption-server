const https = require('https');
const crypto = require('crypto');

const API_BASE = 'pet-adoption-house-server.vercel.app';
const JWT_SECRET = 'pet-adoption-house-super-secret-jwt-key-2024-abcdef123456';
const OWNER_EMAIL = 'shelter@petadoption.com';

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }));
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}

const token = signJWT({ email: OWNER_EMAIL }, JWT_SECRET);

function post(path, data, cookieHeader) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: API_BASE, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => resolve({ status: res.statusCode, body: raw, setCookie: res.headers['set-cookie'] }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const MORE_PETS = [
  // Fish
  { name: 'Nemo',    species: 'fish',    breed: 'Clownfish',        age: 1, gender: 'male',   location: 'San Diego, CA',    adoptionFee: 20,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', description: 'Nemo is a vibrant clownfish living in a healthy saltwater tank. Mesmerizing to watch and very low maintenance. Perfect starter pet for families.' },
  { name: 'Goldie',  species: 'fish',    breed: 'Goldfish',         age: 1, gender: 'female', location: 'Austin, TX',       adoptionFee: 10,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1520302519878-8e2baf43af50?w=600&h=400&fit=crop', description: 'Goldie is a beautiful orange and white goldfish. Easy to care for and very peaceful. Comes with feeding instructions. Great for beginners.' },
  { name: 'Splash',  species: 'fish',    breed: 'Betta Fish',       age: 1, gender: 'male',   location: 'Miami, FL',        adoptionFee: 15,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&h=400&fit=crop', description: 'Splash is a stunning blue and red Betta fish with flowing fins. He thrives in a small tank and is the perfect desk companion. Low maintenance.' },
  // Reptile
  { name: 'Rex',     species: 'reptile', breed: 'Bearded Dragon',   age: 2, gender: 'male',   location: 'Phoenix, AZ',      adoptionFee: 120, vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=600&h=400&fit=crop', description: 'Rex is a friendly Bearded Dragon who loves being handled and basking under his UV lamp. He is tame, eats well, and is great for first-time reptile owners.' },
  { name: 'Jade',    species: 'reptile', breed: 'Green Iguana',     age: 3, gender: 'female', location: 'Tampa, FL',        adoptionFee: 80,  vaccinationStatus: false, healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600&h=400&fit=crop', description: 'Jade is a striking Green Iguana who has been hand-raised and is comfortable with humans. She requires a large enclosure and UVB lighting. For experienced owners.' },
];

async function run() {
  const jwtRes = await post('/jwt', { email: OWNER_EMAIL });
  let cookieHeader = `token=${token}`;
  if (jwtRes.setCookie) {
    const match = jwtRes.setCookie[0]?.match(/token=([^;]+)/);
    if (match) cookieHeader = `token=${match[1]}`;
  }

  let success = 0;
  for (const pet of MORE_PETS) {
    const res = await post('/pets', { ...pet, ownerEmail: OWNER_EMAIL }, cookieHeader);
    if (res.status === 200 && res.body.includes('insertedId')) {
      success++;
      console.log(`✓ ${pet.name} (${pet.species})`);
    } else {
      console.log(`✗ ${pet.name} [${res.status}]: ${res.body.slice(0, 80)}`);
    }
  }
  console.log(`\nAdded ${success}/${MORE_PETS.length} pets`);

  const stats = await new Promise((resolve) => {
    https.get(`https://${API_BASE}/stats`, (res) => {
      let raw = ''; res.on('data', d => raw += d); res.on('end', () => resolve(raw));
    });
  });
  console.log('Total stats:', stats);
}

run().catch(console.error);
