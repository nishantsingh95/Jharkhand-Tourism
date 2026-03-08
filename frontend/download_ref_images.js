import fs from 'fs';
import path from 'path';

// Using hyper-stable Wikipedia common images that closely match the video references
const urls = {
    'prod1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Turmeric_Powder.jpg/400px-Turmeric_Powder.jpg', // Turmeric
    'prod2.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Kullu_Shawl.jpg/400px-Kullu_Shawl.jpg', // Woollen Shawl
    'prod3.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Bamboo_Lampshade.jpg/400px-Bamboo_Lampshade.jpg', // Bamboo Lamp
    'prod4.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ragi_Cookies.jpg/400px-Ragi_Cookies.jpg', // Millet cookies (if 404s, it will fall back to a random biscuit or I will use placehold.co)
    // Guides in action (using stable picsum seeds that look like outdoors/tourism)
    'guide1.jpg': 'https://picsum.photos/seed/guide1/600/400',
    'guide2.jpg': 'https://picsum.photos/seed/guide2/600/400',
    'guide3.jpg': 'https://picsum.photos/seed/guide3/600/400',
    'guide4.jpg': 'https://picsum.photos/seed/guide4/600/400',
    // Homestays (lodges, houses in nature)
    'stay1.jpg': 'https://picsum.photos/seed/lodge1/600/400',
    'stay2.jpg': 'https://picsum.photos/seed/lodge2/600/400',
    'stay3.jpg': 'https://picsum.photos/seed/lodge3/600/400',
    'stay4.jpg': 'https://picsum.photos/seed/lodge4/600/400'
};

const fallbackUrls = {
    'prod1.jpg': 'https://picsum.photos/seed/turmeric/600/400',
    'prod2.jpg': 'https://picsum.photos/seed/shawl/600/400',
    'prod3.jpg': 'https://picsum.photos/seed/lamp/600/400',
    'prod4.jpg': 'https://picsum.photos/seed/cookies/600/400'
}

async function download() {
    for (const [filename, url] of Object.entries(urls)) {
        const file = path.join(process.cwd(), 'public', 'crafts', filename);
        try {
            let res = await fetch(url);
            if (!res.ok && fallbackUrls[filename]) {
                console.log(`Fallback for ${filename}`);
                res = await fetch(fallbackUrls[filename]);
            }
            if (!res.ok) {
                res = await fetch(`https://picsum.photos/seed/${filename}/600/400`);
            }
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(file, buffer);
            console.log(`Downloaded ${filename}`);
        } catch (e) {
            console.error(`Failed ${filename}:`, e.message);
        }
    }
}
download();
