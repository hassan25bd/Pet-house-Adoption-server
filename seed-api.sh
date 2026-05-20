#!/bin/bash
API="https://pet-adoption-house-server.vercel.app"
COOKIE_FILE="/tmp/pet_cookies.txt"

# Register shelter user
curl -s -X POST "$API/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"shelter@petadoption.com","name":"Pet Shelter","photo":""}' > /dev/null

# Get JWT cookie
curl -s -c "$COOKIE_FILE" -X POST "$API/jwt" \
  -H "Content-Type: application/json" \
  -d '{"email":"shelter@petadoption.com"}' > /dev/null

echo "Got JWT token. Adding pets..."

add_pet() {
  curl -s -b "$COOKIE_FILE" -X POST "$API/pets" \
    -H "Content-Type: application/json" \
    -d "$1" > /dev/null
  echo "Added: $(echo $1 | grep -o '"name":"[^"]*"' | head -1)"
}

add_pet '{"name":"Buddy","species":"dog","breed":"Golden Retriever","age":2,"gender":"male","location":"New York, NY","adoptionFee":150,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop","description":"Buddy is a friendly and energetic Golden Retriever who loves to play fetch and cuddle. He is great with kids and other dogs. Fully vaccinated and house-trained.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Luna","species":"cat","breed":"Persian","age":3,"gender":"female","location":"Los Angeles, CA","adoptionFee":100,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop","description":"Luna is a calm and affectionate Persian cat who enjoys lounging in sunny spots. She is perfect for apartment living and gets along well with other cats.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Max","species":"dog","breed":"German Shepherd","age":4,"gender":"male","location":"Chicago, IL","adoptionFee":200,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=400&fit=crop","description":"Max is an intelligent and loyal German Shepherd. He has basic obedience training and loves outdoor adventures. Ideal for an active family with a yard.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Bella","species":"cat","breed":"Maine Coon","age":1,"gender":"female","location":"Houston, TX","adoptionFee":120,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&h=400&fit=crop","description":"Bella is a playful and curious Maine Coon kitten. She loves interactive toys and is very social. She would thrive in a home with plenty of playtime and affection.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Charlie","species":"dog","breed":"Beagle","age":3,"gender":"male","location":"Phoenix, AZ","adoptionFee":130,"vaccinationStatus":true,"healthStatus":"good","image":"https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=400&fit=crop","description":"Charlie is a cheerful Beagle who loves walks and sniffing adventures. He is well socialized, friendly with kids, and great with other dogs.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Mango","species":"bird","breed":"African Grey Parrot","age":5,"gender":"male","location":"Miami, FL","adoptionFee":500,"vaccinationStatus":false,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=400&fit=crop","description":"Mango is a highly intelligent African Grey Parrot who can mimic over 50 words. He enjoys social interaction and mental stimulation. Best for experienced bird owners.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Daisy","species":"rabbit","breed":"Holland Lop","age":1,"gender":"female","location":"Seattle, WA","adoptionFee":60,"vaccinationStatus":false,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop","description":"Daisy is an adorable Holland Lop rabbit with floppy ears and a gentle temperament. She loves fresh vegetables and being gently handled. Perfect for a quiet home.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Rocky","species":"dog","breed":"Labrador Retriever","age":5,"gender":"male","location":"Denver, CO","adoptionFee":180,"vaccinationStatus":true,"healthStatus":"good","image":"https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop","description":"Rocky is a laid-back Labrador who loves swimming and fetching balls. Great with families and other pets. Fully house-trained and leash-trained.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Whiskers","species":"cat","breed":"Tabby","age":4,"gender":"male","location":"Boston, MA","adoptionFee":0,"vaccinationStatus":true,"healthStatus":"good","image":"https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=600&h=400&fit=crop","description":"Whiskers is a gentle tabby cat looking for a quiet home. He loves sitting by windows and being petted. Fully litter-trained and very low-maintenance.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Coco","species":"dog","breed":"Poodle","age":2,"gender":"female","location":"San Francisco, CA","adoptionFee":220,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=400&fit=crop","description":"Coco is a charming miniature Poodle who is hypoallergenic and incredibly smart. She has completed obedience training and loves to show off her tricks.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Oliver","species":"cat","breed":"British Shorthair","age":2,"gender":"male","location":"Austin, TX","adoptionFee":150,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=400&fit=crop","description":"Oliver is a plush British Shorthair with a calm and dignified personality. He enjoys quiet environments and is perfectly happy indoors. Great for working professionals.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Simba","species":"cat","breed":"Bengal","age":1,"gender":"male","location":"Nashville, TN","adoptionFee":200,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&h=400&fit=crop","description":"Simba is a stunning Bengal kitten with wild-looking spots and boundless energy. He loves to climb and explore. Needs an active household that can match his enthusiasm.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Cooper","species":"dog","breed":"Border Collie","age":3,"gender":"male","location":"Portland, OR","adoptionFee":175,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600&h=400&fit=crop","description":"Cooper is a brilliant Border Collie happiest when he has a job to do. He excels at agility and frisbee. Best suited for an active owner or family with open space.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Pearl","species":"hamster","breed":"Syrian Hamster","age":1,"gender":"female","location":"Atlanta, GA","adoptionFee":15,"vaccinationStatus":false,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=400&fit=crop","description":"Pearl is a fluffy Syrian hamster who loves running on her wheel and burrowing. She is tame, easy to handle, and the perfect first pet for children.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Zeus","species":"dog","breed":"Siberian Husky","age":2,"gender":"male","location":"Minneapolis, MN","adoptionFee":250,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=400&fit=crop","description":"Zeus is a majestic Husky with striking blue eyes. He is energetic and loves cold weather. Requires daily exercise. An amazing companion for outdoor adventure lovers.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Lily","species":"cat","breed":"Siamese","age":3,"gender":"female","location":"Las Vegas, NV","adoptionFee":110,"vaccinationStatus":true,"healthStatus":"good","image":"https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=400&fit=crop","description":"Lily is a vocal and affectionate Siamese cat who loves conversations with her humans. She bonds deeply with her owner and does best as the only pet in the home.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Ginger","species":"rabbit","breed":"Angora","age":2,"gender":"female","location":"Philadelphia, PA","adoptionFee":75,"vaccinationStatus":false,"healthStatus":"good","image":"https://images.unsplash.com/photo-1518796745738-41048802f99a?w=600&h=400&fit=crop","description":"Ginger is a fluffy Angora rabbit with silky soft fur. She is gentle, loves to be groomed, and is very calm and quiet. Requires regular brushing to maintain her coat.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Duke","species":"dog","breed":"Rottweiler","age":4,"gender":"male","location":"Dallas, TX","adoptionFee":200,"vaccinationStatus":true,"healthStatus":"good","image":"https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop","description":"Duke is a gentle giant Rottweiler who is loyal and protective. He is calm indoors, has completed obedience training, and is great with older children and families.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Kiwi","species":"bird","breed":"Budgerigar","age":1,"gender":"female","location":"Orlando, FL","adoptionFee":35,"vaccinationStatus":false,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600&h=400&fit=crop","description":"Kiwi is a bright and cheerful budgerigar who loves to sing and chirp all day. She is hand-tamed and enjoys sitting on shoulders. A wonderful affordable companion.","ownerEmail":"shelter@petadoption.com"}'

add_pet '{"name":"Biscuit","species":"dog","breed":"Cocker Spaniel","age":2,"gender":"female","location":"Charlotte, NC","adoptionFee":160,"vaccinationStatus":true,"healthStatus":"excellent","image":"https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=600&h=400&fit=crop","description":"Biscuit is a sweet Cocker Spaniel with silky ears and a gentle nature. She loves cuddles, short walks, and playing in the yard. Perfect for families with children of all ages.","ownerEmail":"shelter@petadoption.com"}'

echo ""
echo "All 20 pets added successfully!"

# Verify
COUNT=$(curl -s "$API/stats" | grep -o '"availablePets":[0-9]*' | grep -o '[0-9]*')
echo "Available pets in database: $COUNT"

rm -f "$COOKIE_FILE"
