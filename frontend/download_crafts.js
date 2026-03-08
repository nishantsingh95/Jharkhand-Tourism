import fs from 'fs';
import path from 'path';

const urls = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Dhokra.jpg/400px-Dhokra.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Tasarsilk.jpg/400px-Tasarsilk.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bamboo_Basket_in_Haikou_03.jpg/400px-Bamboo_Basket_in_Haikou_03.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Madhubani_Art.jpg/400px-Madhubani_Art.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Terracotta_horse_from_Bankura.jpg/400px-Terracotta_horse_from_Bankura.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ritual_Mukhota_Mask_%28Nepalese%29.jpg/400px-Ritual_Mukhota_Mask_%28Nepalese%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Indian_tribal_jewellery.jpg/400px-Indian_tribal_jewellery.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/A_hand_fan_made_by_Palm_leaf.JPG/400px-A_hand_fan_made_by_Palm_leaf.JPG'
];

async function download() {
    for (let i = 0; i < urls.length; i++) {
        const file = path.join(process.cwd(), 'public', 'crafts', `${i + 1}.jpg`);
        try {
            const res = await fetch(urls[i]);
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(file, buffer);
            console.log(`Downloaded ${i + 1}.jpg`);
        } catch (e) {
            console.error(`Failed ${i + 1}:`, e.message);
        }
    }
}
download();
