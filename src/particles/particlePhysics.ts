// Using a single default image for now
import defaultParticle from '../../assets/icon.png';
import musicNote1 from '../../assets/particles/musicNotes/musicNote1.png';
import musicNote2 from '../../assets/particles/musicNotes/musicNote2.png';
import bubble1 from '../../assets/particles/bubbles/bubbles1.png';
import star1 from '../../assets/particles/stars/star1.png';
import star2 from '../../assets/particles/stars/star2.png';
import crown1 from '../../assets/particles/crowns/crown1.png';
import animal1 from '../../assets/particles/animals/animal1.png';
import animal2 from '../../assets/particles/animals/animal2.png';
import animal3 from '../../assets/particles/animals/animal3.png';
import animal4 from '../../assets/particles/animals/animal4.png';
import animal5 from '../../assets/particles/animals/animal5.png';
import animal6 from '../../assets/particles/animals/animal6.png';


export interface ParticlePhysics {
  name: string;
  weight: number;
  gravity: number;
  bounce: number;
  airResistance: number;
  lifespan: number;
  glow?: boolean;
  images: string[];
  moods?: string[]; // Add moods attribute
}

// Example storage structure
export const particlePhysics: Record<string, ParticlePhysics> = {
  musicNote: { 
    name: "musicNote", 
    weight: 1.0, gravity: 0.15, bounce: 0.6, airResistance: 0.01, lifespan: 5000, 
    images: [musicNote1, musicNote2],
    moods: ['happy', 'energetic']
  },
  bubble: { 
    name: "bubble", 
    weight: 0.3, gravity: 0.05, bounce: 0.8, airResistance: 0.02, lifespan: 4000, 
    images: [bubble1],
    moods: ['calm', 'happy']
  },
  star: { 
    name: "star", 
    weight: 2.8, gravity: 0.1, bounce: 0.7, airResistance: 0.015, lifespan: 6000, glow: true,
    images: [star1, star2],
    moods: ['happy', 'magical', 'festive']
  },
  balloon: {
    name: "balloon",
    weight: 0.2,
    gravity: -0.05, // Negative gravity makes it float up
    bounce: 0.3,
    airResistance: 0.02,
    lifespan: 8000,
    images: [defaultParticle], // Replace with actual balloon images
    moods: ['happy', 'celebratory', 'playful']
  },
  butterfly: {
    name: "butterfly",
    weight: 0.1,
    gravity: 0.02,
    bounce: 0.4,
    airResistance: 0.03,
    lifespan: 7000,
    images: [defaultParticle], // Replace with actual butterfly images
    moods: ['peaceful', 'gentle', 'romantic']
  },
  confetti: {
    name: "confetti",
    weight: 0.05,
    gravity: 0.08,
    bounce: 0.5,
    airResistance: 0.02,
    lifespan: 4000,
    images: [defaultParticle], // Replace with actual confetti images
    moods: ['celebratory', 'festive', 'energetic']
  },
  flower: {
    name: "flower",
    weight: 0.4,
    gravity: 0.12,
    bounce: 0.3,
    airResistance: 0.015,
    lifespan: 5000,
    images: [defaultParticle], // Replace with actual flower images
    moods: ['peaceful', 'romantic', 'gentle']
  },
  heart: {
    name: "heart",
    weight: 0.3,
    gravity: 0.1,
    bounce: 0.4,
    airResistance: 0.02,
    lifespan: 4500,
    glow: true,
    images: [defaultParticle], // Replace with actual heart images
    moods: ['romantic', 'loving', 'gentle']
  },
  leaf: {
    name: "leaf",
    weight: 0.2,
    gravity: 0.07,
    bounce: 0.3,
    airResistance: 0.025,
    lifespan: 6000,
    images: [defaultParticle], // Replace with actual leaf images
    moods: ['calm', 'peaceful', 'melancholic']
  },
  raindrop: {
    name: "raindrop",
    weight: 0.6,
    gravity: 0.2,
    bounce: 0.7,
    airResistance: 0.01,
    lifespan: 3000,
    images: [defaultParticle], // Replace with actual raindrop images
    moods: ['sad', 'melancholic', 'calm']
  },
  snowflake: {
    name: "snowflake",
    weight: 0.15,
    gravity: 0.05,
    bounce: 0.2,
    airResistance: 0.03,
    lifespan: 5500,
    images: [defaultParticle], // Replace with actual snowflake images
    moods: ['peaceful', 'gentle', 'magical']
  },
  firework: {
    name: "firework",
    weight: 0.8,
    gravity: 0.15,
    bounce: 0.6,
    airResistance: 0.01,
    lifespan: 2000,
    glow: true,
    images: [defaultParticle], // Replace with actual firework images
    moods: ['celebratory', 'festive', 'energetic']
  },
  crown: {
    name: "crown",
    weight: 0.5,
    gravity: 0.1,
    bounce: 0.4,
    airResistance: 0.02,
    lifespan: 5000,
    images: [crown1],
    moods: ['royal', 'festive', 'celebratory']
  },
  animal: {
    name: "animal",
    weight: 1.0,
    gravity: 0.15,
    bounce: 0.6,
    airResistance: 0.01,
    lifespan: 5000,
    images: [animal1, animal2, animal3, animal4, animal5, animal6],
    moods: ['happy', 'energetic']
  }
  
};

// Function to get a random image for a given particle type
export const getRandomParticleImage = async (type: string): Promise<string> => {
    console.log(`Getting image for particle type: ${type}`);
    
    // Map particle types to their directory names and number of images
    const particleConfig: { [key: string]: { dir: string, count: number } } = {
        musicNote: { dir: 'musicNotes', count: 2 }, // Assuming you have 4 music note images
        star: { dir: 'stars', count: 2 },
        bubble: { dir: 'bubbles', count: 1 },
        snowflake: { dir: 'snowflakes', count: 1 },
        heart: { dir: 'hearts', count: 2},
        leaves: { dir: 'leaves', count: 1 },
        butterfly: { dir: 'butterflies', count: 1 },
        confetti: { dir: 'confetti', count: 1 },
        raindrop: { dir: 'raindrops', count: 1 },
        firefly: { dir: 'fireflies', count: 1 },
        balloon: { dir: 'balloons', count: 2},
        flower: { dir: 'flowers', count: 1 },
        firework: { dir: 'fireworks', count: 1 },
        crown: { dir: 'crowns', count: 1 },
        animal: { dir: 'animals', count: 6 }
    };

    const config = particleConfig[type] || particleConfig.musicNote;
    
    // Get random image number
    const imageNumber = Math.floor(Math.random() * config.count) + 1;
    
    // Construct the relative path
    const imageName = type === 'bubble' ? 'bubbles1.png' : `${type}${imageNumber}.png`;
    const relativePath = `particles/${config.dir}/${imageName}`;
    
    try {
        // Use electron to get the correct absolute path
        const fullPath = await window.electron.fileSystem.mergeAssetPath(relativePath);
        console.log(`Selected image path: ${fullPath}`);
        return fullPath;
    } catch (error) {
        console.error(`Error loading image: ${relativePath}`, error);
        // Return a default image path if the requested one fails
        return await window.electron.fileSystem.mergeAssetPath('particles/musicNotes/musicNote1.png');
    }
};
