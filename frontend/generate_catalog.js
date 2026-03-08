import fs from 'fs';
import path from 'path';

// THE ABSOLUTE FINAL CURATED CATALOG OF JHARKHAND HANDMADE CRAFTS
// Compiled from the provided screenshots and regional specialties.
const items = [
    // METAL CRAFTS (DHOKRA - Lost Wax Casting)
    { id: 1, name: "Dhokra Antique Horse", desc: "Traditional lost-wax bell metal horse figurine from Khunti.", price: 1450, category: "Metal Crafts", wikiQuery: "Dhokra", manualUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600" },
    { id: 2, name: "Dhokra Tribal Musician Set", desc: "Set of 3 brass musicians playing traditional Jharkhandi instruments.", price: 2800, category: "Metal Crafts", wikiQuery: "Dhokra", manualUrl: "https://images.unsplash.com/photo-1614362705324-8da063f66903?q=80&w=600" },
    { id: 3, name: "Dhokra Tortoise Incense Holder", desc: "Auspicious metal tortoise handcrafted by Malhar artisans.", price: 850, category: "Metal Crafts", wikiQuery: "Dhokra", manualUrl: "https://images.unsplash.com/photo-1599385552309-8d770c32549e?q=80&w=600" },
    { id: 4, name: "Dhokra Wall Relief (Framed)", desc: "Intricate bell metal artwork telling the story of the forest.", price: 3200, category: "Metal Crafts", wikiQuery: "Dhokra", manualUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=601" },

    // PAINTINGS (SOHRAI, KHOVAR, PAITKAR, JADOPATIA)
    { id: 5, name: "Sohrai Animal Mural", desc: "Hand-painted Sohrai art using natural earth pigments on canvas.", price: 2100, category: "Paintings", wikiQuery: "Sohrai", manualUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600" },
    { id: 6, name: "Khovar Linear Wedding Art", desc: "Monochrome comb-cut art traditionally used for wedding chambers.", price: 1850, category: "Paintings", wikiQuery: "Indian folk art", manualUrl: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600" },
    { id: 7, name: "Paitkar Scroll Painting", desc: "Ancient storyteller scroll depicting Santhal tribal life.", price: 2400, category: "Paintings", wikiQuery: "Scroll painting", manualUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600" },
    { id: 8, name: "Jadopatia Tribal Scroll", desc: "Spiritual scroll painting capturing the myths of the Santhal people.", price: 1950, category: "Paintings", wikiQuery: "Folk art", manualUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600" },
    { id: 9, name: "Painted Tribal Frame Set", desc: "Set of 2 miniature framed artworks with traditional motifs.", price: 999, category: "Paintings", wikiQuery: "Miniature painting", manualUrl: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?q=80&w=600" },

    // BAMBOO & CANE HANDICRAFT
    { id: 10, name: "Jharkhandi Bamboo Basket", desc: "Sturdy, eco-friendly round basket woven from forest bamboo.", price: 550, category: "Bamboo Handicraft", wikiQuery: "Bamboo weaving", manualUrl: "https://images.unsplash.com/photo-1590736910113-2d179678e763?q=80&w=600" },
    { id: 11, name: "Geometric Bamboo Lamp", desc: "Contemporary lamp shade inspired by tribal geometric patterns.", price: 1200, category: "Bamboo Handicraft", wikiQuery: "Lampshade", manualUrl: "https://images.unsplash.com/photo-1534073828943-f801091bb24f?q=80&w=600" },
    { id: 12, name: "Tribal Hand Fan (Pankha)", desc: "Vibrantly colored large hand fan for home decor.", price: 250, category: "Bamboo Handicraft", wikiQuery: "Hand fan", manualUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600" },
    { id: 13, name: "Sabai Grass Table Mat Set", desc: "Durable mats woven from natural Sabai grass by tribal women.", price: 650, category: "Bamboo Handicraft", wikiQuery: "Wicker", manualUrl: "https://images.unsplash.com/photo-1622391038558-750974ed1734?q=80&w=600" },
    { id: 14, name: "Hand-tuned Bamboo Flute", desc: "Professional quality Bansuri used in local folk music.", price: 350, category: "Bamboo Handicraft", wikiQuery: "Bansuri", manualUrl: "https://images.unsplash.com/photo-1511018556340-d16906a10ff3?q=80&w=600" },

    // TERRACOTTA & POTTERY
    { id: 15, name: "Maluti Temple Replica", desc: "Miniature clay model of the historic terracotta temples of Maluti.", price: 1100, category: "Terracotta", wikiQuery: "Terracotta", manualUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600" },
    { id: 16, name: "Painted Terracotta Mask", desc: "Decorative wall mask with vibrant tribal facial art.", price: 750, category: "Terracotta", wikiQuery: "Mask", manualUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=600" },
    { id: 17, name: "Mini Santhali Deities", desc: "Clay idols of tribal gods handcrafted for household shrines.", price: 500, category: "Terracotta", wikiQuery: "Statuette", manualUrl: "https://images.unsplash.com/photo-1590001158193-79013c7c7f02?q=80&w=600" },
    { id: 18, name: "Terracotta Horse (Maluti Style)", desc: "Strong, upright horse figurine symbolizing strength and faith.", price: 1250, category: "Terracotta", wikiQuery: "Horse", manualUrl: "https://images.unsplash.com/photo-1589412190130-9b69b6058e72?q=80&w=600" },

    // TEXTILES (Silk & Cotton)
    { id: 19, name: "Tussar Silk Handloom Saree", desc: "Pure wild silk saree woven with traditional Santhal motifs.", price: 5500, category: "Textiles", wikiQuery: "Sari", manualUrl: "https://images.unsplash.com/photo-1610030469629-23f03b538058?q=80&w=600" },
    { id: 20, name: "Tribal Motif Gamcha", desc: "Woven cotton towel with symbolic red and white tribal borders.", price: 300, category: "Textiles", wikiQuery: "Cotton", manualUrl: "https://images.unsplash.com/photo-1524492458922-5518d4572253?q=80&w=600" },
    { id: 21, name: "Hand-spun Woollen Shawl", desc: "Authentic heavy shawl for protection against Chotanagpur winters.", price: 2100, category: "Textiles", wikiQuery: "Shawl", manualUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600" },

    // OTHER SPECIALTY CRAFTS
    { id: 22, name: "Seraikela Chhau Mask", desc: "Full-sized paper-mache mask used in the UNESCO-listed Chhau dance.", price: 3200, category: "Other Crafts", wikiQuery: "Chhau dance", manualUrl: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=600" },
    { id: 23, name: "Handcrafted Lac Bangles", desc: "Glossy, colorful bangles made from natural resin in Ranchi.", price: 450, category: "Other Crafts", wikiQuery: "Bangle", manualUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=600" },
    { id: 24, name: "Pathar Katti Stone Mortar", desc: "Heavy solid black stone mortar and pestle for traditional cooking.", price: 1100, category: "Other Crafts", wikiQuery: "Mortar and pestle", manualUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600" },
    { id: 25, name: "Sal Leaf Bundle (Pattal)", desc: "Set of 100 organic, biodegradable plates stitched with twigs.", price: 350, category: "Other Crafts", wikiQuery: "Leaf", manualUrl: "https://images.unsplash.com/photo-1594732832278-abd644401416?q=80&w=600" },
    { id: 26, name: "Tribal Silver Anklets (Paidri)", desc: "Solid oxidized silver anklets worn with traditional tribal attire.", price: 3800, category: "Other Crafts", wikiQuery: "Anklet", manualUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600" }
];

async function main() {
    const outputJsPath = path.join(process.cwd(), 'src', 'data', 'productsData.js');
    if (!fs.existsSync(path.dirname(outputJsPath))) {
        fs.mkdirSync(path.dirname(outputJsPath), { recursive: true });
    }

    const finalProducts = [];

    for (const item of items) {
        let imageUrl = '';
        const filename = `item_${item.id}.jpg`;
        const filepath = path.join(process.cwd(), 'public', 'crafts', filename);

        try {
            console.log(`Processing ${item.name}...`);
            let fetchUrl = item.manualUrl;

            // Wikipedia logic as secondary fallback (improved headers)
            if (!fetchUrl) {
                const wikiApi = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(item.wikiQuery)}`;
                const wikiRes = await fetch(wikiApi, { headers: { 'User-Agent': 'JharkhandTourism/1.0' } });
                const wikiData = await wikiRes.json();
                const pages = wikiData.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== '-1' && pages[pageId].original) {
                    fetchUrl = pages[pageId].original.source;
                }
            }

            if (fetchUrl) {
                console.log(`Downloading ${fetchUrl} for ${item.name}...`);
                const imgRes = await fetch(fetchUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JharkhandTourismApp/1.0' }
                });
                if (imgRes.ok) {
                    const buffer = Buffer.from(await imgRes.arrayBuffer());
                    fs.writeFileSync(filepath, buffer);
                    imageUrl = `/crafts/${filename}`;
                } else {
                    throw new Error("HTTP Fetch Error");
                }
            } else {
                throw new Error("No URL identified");
            }
        } catch (e) {
            console.log(`Fallback UI-stable placeholder for ${item.name}: ${e.message}`);
            // Use keyword-curated placeholder
            imageUrl = `https://loremflickr.com/600/400/${encodeURIComponent(item.category.toLowerCase().replace(' ', ','))},${encodeURIComponent(item.name.toLowerCase().split(' ')[0])}/all`;
        }

        const rating = (Math.random() * (5.0 - 4.6) + 4.6).toFixed(1); // Premium ratings for elite crafts
        const reviews = Math.floor(Math.random() * 300) + 50;
        const off = Math.floor(Math.random() * 15) + 5; // Moderate discounts
        const oldPrice = Math.floor(item.price * (1 + (off / 100)));

        finalProducts.push({
            id: item.id,
            name: item.name,
            desc: item.desc,
            category: item.category,
            rating: String(rating),
            reviews: reviews,
            price: `₹${item.price.toLocaleString()}`,
            oldPrice: `₹${oldPrice.toLocaleString()}`,
            off: `${off}%`,
            img: imageUrl
        });
    }

    const fileContent = `export const productsData = ${JSON.stringify(finalProducts, null, 4)};\n`;
    fs.writeFileSync(outputJsPath, fileContent);
    console.log("Success! Pure Jharkhand Craft Catalog Generated.");
}

main();
