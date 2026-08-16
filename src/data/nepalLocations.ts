import { Province } from '../types';

export const NEPAL_PROVINCES: Province[] = [
  {
    id: 1,
    name: 'Koshi Province (Province 1)',
    nepaliName: 'कोशी प्रदेश',
    districts: ['Morang (Biratnagar)', 'Sunsari (Dharan/Itahari)', 'Jhapa (Birtamod/Damak)', 'Ilam', 'Dhankuta', 'Udayapur', 'Bhojpur', 'Sankhuwasabha', 'Taplejung', 'Panchthar', 'Terhathum', 'Okhaldhunga', 'Khotang', 'Solukhumbu'],
    deliveryFee: 150,
    estimatedDays: '2-4 Days',
  },
  {
    id: 2,
    name: 'Madhesh Province',
    nepaliName: 'मधेश प्रदेश',
    districts: ['Dhanusha (Janakpur)', 'Parsa (Birgunj)', 'Siraha (Lahan)', 'Saptari (Rajbiraj)', 'Bara', 'Rautahat', 'Sarlahi', 'Mahottari'],
    deliveryFee: 140,
    estimatedDays: '2-3 Days',
  },
  {
    id: 3,
    name: 'Bagmati Province (Kathmandu Valley & Surroundings)',
    nepaliName: 'बागमती प्रदेश (काठमाडौँ उपत्यका)',
    districts: ['Kathmandu (Inside Ringroad)', 'Kathmandu (Outside Ringroad)', 'Lalitpur (Patan)', 'Bhaktapur', 'Kavrepalanchok (Banepa/Dhulikhel)', 'Chitwan (Bharatpur)', 'Makwanpur (Hetauda)', 'Sindhupalchok', 'Nuwakot', 'Dhading', 'Rasuwa', 'Sindhuli', 'Ramechhap'],
    deliveryFee: 80, // Same-day or Next-day in Valley
    estimatedDays: '1-2 Days (Same Day in Valley)',
  },
  {
    id: 4,
    name: 'Gandaki Province',
    nepaliName: 'गण्डकी प्रदेश',
    districts: ['Kaski (Pokhara)', 'Gorkha', 'Tanahun (Damauli/Bandipur)', 'Syangja', 'Nawalpur (Kawasoti)', 'Lamjung (Besishahar)', 'Baglung', 'Parbat', 'Myagdi', 'Mustang', 'Manang'],
    deliveryFee: 120,
    estimatedDays: '1-3 Days',
  },
  {
    id: 5,
    name: 'Lumbini Province',
    nepaliName: 'लुम्बिनी प्रदेश',
    districts: ['Rupandehi (Butwal/Bhairahawa)', 'Banke (Nepalgunj)', 'Dang (Ghorahi/Tulsipur)', 'Kapilvastu', 'Palpa (Tansen)', 'Nawalparasi West', 'Bardiya', 'Pyuthan', 'Arghakhanchi', 'Gulmi', 'Rolpa', 'Eastern Rukum'],
    deliveryFee: 150,
    estimatedDays: '2-4 Days',
  },
  {
    id: 6,
    name: 'Karnali Province',
    nepaliName: 'कर्णाली प्रदेश',
    districts: ['Surkhet (Birendranagar)', 'Jumla', 'Dailekh', 'Jajarkot', 'Salyan', 'Kalikot', 'Mugu', 'Dolpa', 'Humla', 'Western Rukum'],
    deliveryFee: 200,
    estimatedDays: '3-6 Days',
  },
  {
    id: 7,
    name: 'Sudurpashchim Province',
    nepaliName: 'सुदूरपश्चिम प्रदेश',
    districts: ['Kailali (Dhangadhi/Tikapur)', 'Kanchanpur (Mahendranagar)', 'Dadeldhura', 'Doti', 'Achham', 'Baitadi', 'Darchula', 'Bajhang', 'Bajura'],
    deliveryFee: 180,
    estimatedDays: '3-5 Days',
  },
];

export const POPULAR_COUPONS: Record<string, { discountPercent?: number; discountFlat?: number; minAmount: number; description: string }> = {
  FONEPAY10: {
    discountPercent: 10,
    minAmount: 1000,
    description: '10% OFF on payments via Fonepay Dynamic QR (Min रू 1,000)',
  },
  DASHAIN500: {
    discountFlat: 500,
    minAmount: 3000,
    description: 'Flat रू 500 Festive Discount on orders over रू 3,000',
  },
  HAMROPASAL: {
    discountPercent: 5,
    minAmount: 500,
    description: '5% Welcome discount for new shoppers',
  },
};
