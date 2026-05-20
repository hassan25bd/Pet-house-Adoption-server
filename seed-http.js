const https = require('https');

const API_BASE = 'pet-adoption-house-server.vercel.app';
const JWT_SECRET = 'pet-adoption-house-super-secret-jwt-key-2024-abcdef123456';
const OWNER_EMAIL = 'shelter@petadoption.com';

// Simple JWT sign (header.payload.signature)
const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }));
  const sig = crypto.createHmac('sha256', secret)
    .update(`${header}.${body}`).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}

const token = signJWT({ email: OWNER_EMAIL }, JWT_SECRET);

function post(path, data, cookieHeader) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: API_BASE,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        resolve({ status: res.statusCode, body: raw, setCookie });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const PETS = [
  { name: 'Buddy',    species: 'dog',     breed: 'Golden Retriever',    age: 2, gender: 'male',   location: 'New York, NY',      adoptionFee: 150, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', description: 'Buddy is a friendly and energetic Golden Retriever who loves to play fetch and cuddle. He is great with kids and other dogs. Fully vaccinated and house-trained.' },
  { name: 'Luna',     species: 'cat',     breed: 'Persian',             age: 3, gender: 'female', location: 'Los Angeles, CA',    adoptionFee: 100, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop', description: 'Luna is a calm and affectionate Persian cat who enjoys lounging in sunny spots. Perfect for apartment living and gets along with other cats.' },
  { name: 'Max',      species: 'dog',     breed: 'German Shepherd',     age: 4, gender: 'male',   location: 'Chicago, IL',        adoptionFee: 200, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=400&fit=crop', description: 'Max is an intelligent and loyal German Shepherd with basic obedience training. He loves outdoor adventures and is ideal for an active family.' },
  { name: 'Bella',    species: 'cat',     breed: 'Maine Coon',          age: 1, gender: 'female', location: 'Houston, TX',        adoptionFee: 120, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&h=400&fit=crop', description: 'Bella is a playful Maine Coon kitten who loves interactive toys. She is very social and thrives in a home with plenty of playtime.' },
  { name: 'Charlie',  species: 'dog',     breed: 'Beagle',              age: 3, gender: 'male',   location: 'Phoenix, AZ',        adoptionFee: 130, vaccinationStatus: true,  healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=400&fit=crop', description: 'Charlie is a cheerful Beagle who loves walks and sniffing adventures. Well socialized and friendly with kids and other dogs.' },
  { name: 'Mango',    species: 'bird',    breed: 'African Grey Parrot', age: 5, gender: 'male',   location: 'Miami, FL',          adoptionFee: 500, vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=400&fit=crop', description: 'Mango is a highly intelligent African Grey Parrot who can mimic over 50 words. Best suited for experienced bird owners who can provide enrichment.' },
  { name: 'Daisy',    species: 'rabbit',  breed: 'Holland Lop',         age: 1, gender: 'female', location: 'Seattle, WA',        adoptionFee: 60,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop', description: 'Daisy is an adorable Holland Lop rabbit with floppy ears and a gentle temperament. She loves fresh vegetables and being gently handled.' },
  { name: 'Rocky',    species: 'dog',     breed: 'Labrador Retriever',  age: 5, gender: 'male',   location: 'Denver, CO',         adoptionFee: 180, vaccinationStatus: true,  healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop', description: 'Rocky is a laid-back Labrador who loves swimming and fetching. Great with families and other pets. Fully house-trained and leash-trained.' },
  { name: 'Whiskers', species: 'cat',     breed: 'Tabby',               age: 4, gender: 'male',   location: 'Boston, MA',         adoptionFee: 0,   vaccinationStatus: true,  healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=600&h=400&fit=crop', description: 'Whiskers is a gentle tabby cat looking for a quiet home. He loves sitting by windows and being petted. Fully litter-trained.' },
  { name: 'Coco',     species: 'dog',     breed: 'Poodle',              age: 2, gender: 'female', location: 'San Francisco, CA',  adoptionFee: 220, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=400&fit=crop', description: 'Coco is a charming miniature Poodle who is hypoallergenic and incredibly smart. She has completed obedience training and loves to show off her tricks.' },
  { name: 'Oliver',   species: 'cat',     breed: 'British Shorthair',   age: 2, gender: 'male',   location: 'Austin, TX',         adoptionFee: 150, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=400&fit=crop', description: 'Oliver is a plush British Shorthair with a calm personality. He enjoys quiet environments and is happy indoors. Great for working professionals.' },
  { name: 'Simba',    species: 'cat',     breed: 'Bengal',              age: 1, gender: 'male',   location: 'Nashville, TN',      adoptionFee: 200, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&h=400&fit=crop', description: 'Simba is a stunning Bengal kitten with wild-looking spots and boundless energy. Needs an active household that can match his enthusiasm.' },
  { name: 'Cooper',   species: 'dog',     breed: 'Border Collie',       age: 3, gender: 'male',   location: 'Portland, OR',       adoptionFee: 175, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600&h=400&fit=crop', description: 'Cooper is a brilliant Border Collie happiest when he has a job to do. He excels at agility and learning tricks. Best for an active owner.' },
  { name: 'Pearl',    species: 'hamster', breed: 'Syrian Hamster',      age: 1, gender: 'female', location: 'Atlanta, GA',        adoptionFee: 15,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=400&fit=crop', description: 'Pearl is a fluffy Syrian hamster who loves running on her wheel and burrowing. She is tame and perfect as a first pet for children.' },
  { name: 'Zeus',     species: 'dog',     breed: 'Siberian Husky',      age: 2, gender: 'male',   location: 'Minneapolis, MN',    adoptionFee: 250, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=400&fit=crop', description: 'Zeus is a majestic Husky with striking blue eyes. Energetic and loves cold weather. An amazing companion for outdoor adventure lovers.' },
  { name: 'Lily',     species: 'cat',     breed: 'Siamese',             age: 3, gender: 'female', location: 'Las Vegas, NV',      adoptionFee: 110, vaccinationStatus: true,  healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=400&fit=crop', description: 'Lily is a vocal and affectionate Siamese cat who loves conversations with her humans. She bonds deeply and does best as the only pet.' },
  { name: 'Ginger',   species: 'rabbit',  breed: 'Angora',              age: 2, gender: 'female', location: 'Philadelphia, PA',   adoptionFee: 75,  vaccinationStatus: false, healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1518796745738-41048802f99a?w=600&h=400&fit=crop', description: 'Ginger is a fluffy Angora rabbit with silky soft fur. She is gentle, loves grooming sessions, and is very calm and quiet.' },
  { name: 'Duke',     species: 'dog',     breed: 'Rottweiler',          age: 4, gender: 'male',   location: 'Dallas, TX',         adoptionFee: 200, vaccinationStatus: true,  healthStatus: 'good',      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop', description: 'Duke is a gentle giant Rottweiler who is loyal and calm indoors. He has had obedience training and is great with older children.' },
  { name: 'Kiwi',     species: 'bird',    breed: 'Budgerigar',          age: 1, gender: 'female', location: 'Orlando, FL',        adoptionFee: 35,  vaccinationStatus: false, healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600&h=400&fit=crop', description: 'Kiwi is a bright and cheerful budgerigar who loves to sing. She is hand-tamed and enjoys sitting on shoulders. A wonderful affordable companion.' },
  { name: 'Biscuit',  species: 'dog',     breed: 'Cocker Spaniel',      age: 2, gender: 'female', location: 'Charlotte, NC',      adoptionFee: 160, vaccinationStatus: true,  healthStatus: 'excellent', image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=600&h=400&fit=crop', description: 'Biscuit is a sweet Cocker Spaniel with silky ears and a gentle nature. She loves cuddles and short walks. Perfect for families with children.' },
];

async function run() {
  console.log('Registering shelter account...');
  await post('/users', { email: OWNER_EMAIL, name: 'Pet Shelter', photo: '' });

  console.log('Getting JWT token...');
  const jwtRes = await post('/jwt', { email: OWNER_EMAIL });
  console.log('JWT response status:', jwtRes.status, jwtRes.body.slice(0, 80));

  // Extract cookie from response or use our own token
  let cookieHeader = `token=${token}`;
  if (jwtRes.setCookie) {
    const match = jwtRes.setCookie[0]?.match(/token=([^;]+)/);
    if (match) cookieHeader = `token=${match[1]}`;
  }
  console.log('Using cookie:', cookieHeader.slice(0, 30) + '...');

  let success = 0;
  for (const pet of PETS) {
    const res = await post('/pets', { ...pet, ownerEmail: OWNER_EMAIL }, cookieHeader);
    if (res.status === 200 && res.body.includes('insertedId')) {
      success++;
      process.stdout.write(`✓ ${pet.name}\n`);
    } else {
      process.stdout.write(`✗ ${pet.name} [${res.status}]: ${res.body.slice(0, 60)}\n`);
    }
  }

  console.log(`\nDone: ${success}/${PETS.length} pets added`);

  // Verify
  const statsRes = await new Promise((resolve) => {
    https.get(`https://${API_BASE}/stats`, (res) => {
      let raw = ''; res.on('data', d => raw += d); res.on('end', () => resolve(raw));
    });
  });
  console.log('Stats:', statsRes);
}

run().catch(console.error);
