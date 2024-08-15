const BASE_URL = 'http://192.168.1.19:1337/api/propertieses'; // Update this URL with your Strapi backend URL
const TOKEN = '5ff1241930b7a621861d6669add31486f94201f22c9c0e4457b4ee3cc8fa1092c9df121d8416a676fce8bc04c2e19fd37d1ebe21ad58b5d3a89868ecd21cae9289d46196fbf4f584932e79e66921c82fb3127670c6b015e261629eace5184f5dd5d15829ed65cd86113984a7160a83f901ea5ef74e0c26b6e963be8679d7a884'; // Replace 'YOUR_AUTH_TOKEN' with your actual authentication token

// Function to fetch properties from Strapi
export const fetchProperty = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    throw error;
  }
};

// Add more functions as needed to interact with your Strapi backend
