export const services = [
        // Photography Services
        { id: 's1', name: 'Photo Session with Naomi Jemison', category: 'photography', hourlyRate: 350, rating: 5.0, reviews: 89, distance: 3.1, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop', verified: true, provider: 'Naomi Jemison Photography', type: 'session' },
        { id: 's2', name: "Capture Life's Moments with Dreamscape Photography", category: 'photography', hourlyRate: 450, rating: 4.9, reviews: 156, distance: 2.5, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop', verified: true, provider: 'Dreamscape Photography', type: 'session' },
        { id: 's3', name: 'Wedding and event portraits by Sterling', category: 'photography', hourlyRate: 250, rating: 4.8, reviews: 203, distance: 4.2, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop', verified: true, provider: 'Sterling Photography', type: 'session' },
        { id: 's4', name: 'Sierra Goodrich Photography', category: 'photography', hourlyRate: 300, rating: 4.9, reviews: 178, distance: 1.8, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop', verified: true, provider: 'Sierra Goodrich', type: 'session' },
        { id: 's5', name: 'Headshots and family portraits by Sterling', category: 'photography', hourlyRate: 500, rating: 5.0, reviews: 234, distance: 2.1, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop', verified: true, provider: 'Sterling Studios', type: 'session' },
        { id: 's6', name: 'Airbnb Photography', category: 'photography', hourlyRate: 125, rating: 4.7, reviews: 145, distance: 3.5, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', verified: true, provider: 'Real Estate Photos Pro', type: 'session' },
        { id: 's7', name: 'Lifestyle Photography by Leticia H', category: 'photography', hourlyRate: 429, rating: 4.9, reviews: 267, distance: 1.2, image: '📷', imageUrl: 'https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?w=400&h=300&fit=crop', verified: true, provider: 'Leticia H Photography', type: 'session' },
        
        // Home Services  
        { id: 's10', name: 'Lawn Mowing Service', category: 'landscape', hourlyRate: 45, rating: 4.9, reviews: 234, distance: 1.5, image: '🌱', imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=300&fit=crop', verified: true, provider: 'GreenCare Pros', type: 'service' },
        { id: 's11', name: 'Handyman Services', category: 'handyman', hourlyRate: 65, rating: 4.8, reviews: 189, distance: 2.3, image: '🔨', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Fix-It Fast', type: 'service' },
        { id: 's12', name: 'Dog Walking', category: 'other', hourlyRate: 25, rating: 5.0, reviews: 412, distance: 0.7, image: '🐕', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop', verified: true, provider: 'Paws & Play', type: 'service' },
        
        // Cleaning Services
        { id: 's13', name: 'House Cleaning Service', category: 'cleaning', hourlyRate: 55, rating: 4.9, reviews: 312, distance: 2.8, image: '🧹', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Sparkle Clean', type: 'service' },
        { id: 's13a', name: 'Deep Cleaning & Sanitization', category: 'cleaning', hourlyRate: 75, rating: 5.0, reviews: 267, distance: 1.9, image: '✨', imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop', verified: true, provider: 'Pro Clean Services', type: 'service' },
        { id: 's13b', name: 'Move-In/Move-Out Cleaning', category: 'cleaning', hourlyRate: 85, rating: 4.8, reviews: 198, distance: 3.1, image: '🏠', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Fresh Start Cleaners', type: 'service' },
        { id: 's13c', name: 'Window & Gutter Cleaning', category: 'cleaning', hourlyRate: 65, rating: 4.7, reviews: 145, distance: 2.5, image: '🪟', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop', verified: true, provider: 'Clear View Cleaning', type: 'service' },
        
        { id: 's14', name: 'Auto Mechanic', category: 'mechanic', hourlyRate: 85, rating: 4.7, reviews: 156, distance: 3.2, image: '🔧', imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop', verified: true, provider: 'Quick Fix Auto', type: 'service' },
        { id: 's15', name: 'Personal Trainer', category: 'health', hourlyRate: 75, rating: 4.9, reviews: 198, distance: 1.9, image: '💪', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop', verified: true, provider: 'Fit Life Training', type: 'service' },
        { id: 's16', name: 'Hair Stylist', category: 'beauty', hourlyRate: 95, rating: 5.0, reviews: 287, distance: 1.1, image: '💇', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop', verified: true, provider: 'Glamour Studio', type: 'service' },
        { id: 's17', name: 'Moving & Relocation', category: 'moving', hourlyRate: 120, rating: 4.8, reviews: 167, distance: 4.5, image: '🚚', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop', verified: true, provider: 'Swift Movers', type: 'service' },
        { id: 's18', name: 'Event Planning', category: 'party', hourlyRate: 150, rating: 4.9, reviews: 223, distance: 2.7, image: '🎉', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop', verified: true, provider: 'Dream Events Co', type: 'service' },
        
        // Pet Care Services
        { id: 's20', name: 'Dog Walking & Pet Sitting', category: 'pet', hourlyRate: 30, rating: 5.0, reviews: 412, distance: 0.7, image: '🐕', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop', verified: true, provider: 'Paws & Play', type: 'service' },
        { id: 's21', name: 'Pet Boarding & Daycare', category: 'pet', hourlyRate: 45, rating: 4.9, reviews: 298, distance: 2.1, image: '🏠', imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop', verified: true, provider: 'Happy Paws Resort', type: 'service' },
        { id: 's22', name: 'Pet Grooming', category: 'pet', hourlyRate: 65, rating: 4.8, reviews: 187, distance: 1.3, image: '✂️', imageUrl: 'https://media.istockphoto.com/id/1349349263/photo/cute-fluffy-friends-a-cat-and-a-dog-catch-a-flying-butterfly-in-a-sunny-summer.jpg?s=612x612&w=0&k=20&c=EnbbU794qwv66XcaDyszShJmRaiOuQ7XzP7XJh7Hyjg=', verified: true, provider: 'Pampered Pets Spa', type: 'service' },
        
        // Notary Services
        { id: 's30', name: 'Mobile Notary Public', category: 'notary', hourlyRate: 75, rating: 5.0, reviews: 234, distance: 2.5, image: '📝', imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', verified: true, provider: 'Certified Notary Pro', type: 'service' },
        { id: 's31', name: 'Document Notarization', category: 'notary', hourlyRate: 65, rating: 4.9, reviews: 178, distance: 1.8, image: '✍️', imageUrl: 'https://plus.unsplash.com/premium_photo-1661693516373-e7df30ef9e4b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fE5vdGFyaXphdGlvbnxlbnwwfHwwfHx8MA%3D%3D', verified: true, provider: 'Notary Express', type: 'service' },
        
        // Mobile Detail Services
        { id: 's35', name: 'Premium Car Detailing', category: 'detail', hourlyRate: 125, rating: 4.9, reviews: 267, distance: 3.2, image: '🚗', imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop', verified: true, provider: 'Shine Mobile Detail', type: 'service' },
        { id: 's36', name: 'Interior & Exterior Detailing', category: 'detail', hourlyRate: 95, rating: 4.8, reviews: 198, distance: 2.1, image: '🧽', imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop', verified: true, provider: 'Elite Auto Spa', type: 'service' },
        
        // Delivery/Courier Services
        { id: 's40', name: 'Same-Day Delivery', category: 'delivery', hourlyRate: 45, rating: 4.7, reviews: 312, distance: 1.5, image: '📦', imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop', verified: true, provider: 'Quick Courier Co', type: 'service' },
        { id: 's41', name: 'Local Delivery Service', category: 'delivery', hourlyRate: 35, rating: 4.8, reviews: 245, distance: 0.9, image: '🚚', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', verified: true, provider: 'City Express', type: 'service' },
        
        // Hauling/Trash Removal Services
        { id: 's45', name: 'Junk Removal & Hauling', category: 'hauling', hourlyRate: 85, rating: 4.9, reviews: 189, distance: 3.8, image: '🗑️', imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop', verified: true, provider: 'Clean Sweep Hauling', type: 'service' },
        { id: 's46', name: 'Debris & Yard Waste Removal', category: 'hauling', hourlyRate: 75, rating: 4.8, reviews: 156, distance: 2.7, image: '🚛', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Haul It Away Pro', type: 'service' },
        
        // Real Estate/Title Services
        { id: 's90', name: 'Real Estate Photography', category: 'realestate', hourlyRate: 150, rating: 5.0, reviews: 234, distance: 2.8, image: '🏡', imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', verified: true, provider: 'Pro Property Photos', type: 'service' },
        { id: 's91', name: 'Home Staging Services', category: 'realestate', hourlyRate: 125, rating: 4.9, reviews: 189, distance: 3.5, image: '🛋️', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', verified: true, provider: 'Stage to Sell', type: 'service' },
        { id: 's92', name: 'Title Search & Research', category: 'realestate', hourlyRate: 95, rating: 4.8, reviews: 167, distance: 1.9, image: '📋', imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', verified: true, provider: 'Precision Title Services', type: 'service' },
        
        // General Contracting Services
        { id: 's50', name: 'Home Remodeling & Renovation', category: 'contractor', hourlyRate: 125, rating: 4.9, reviews: 267, distance: 4.2, image: '👷', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Premier Construction', type: 'service' },
        { id: 's51', name: 'Kitchen & Bathroom Remodel', category: 'contractor', hourlyRate: 135, rating: 5.0, reviews: 198, distance: 3.5, image: '🏗️', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop', verified: true, provider: 'Master Builders LLC', type: 'service' },
        { id: 's52', name: 'Custom Home Building', category: 'contractor', hourlyRate: 150, rating: 4.9, reviews: 145, distance: 5.1, image: '🏡', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop', verified: true, provider: 'Apex Contractors', type: 'service' },
        
        // Plumbing Services
        { id: 's55', name: 'Emergency Plumbing Repair', category: 'plumbing', hourlyRate: 95, rating: 4.8, reviews: 312, distance: 2.1, image: '🚰', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop', verified: true, provider: 'Fast Flow Plumbing', type: 'service' },
        { id: 's56', name: 'Drain Cleaning & Repair', category: 'plumbing', hourlyRate: 85, rating: 4.7, reviews: 234, distance: 1.8, image: '🔧', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop', verified: true, provider: 'Pro Plumbers Co', type: 'service' },
        { id: 's57', name: 'Water Heater Installation', category: 'plumbing', hourlyRate: 105, rating: 4.9, reviews: 178, distance: 3.2, image: '💧', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop', verified: true, provider: 'Reliable Plumbing', type: 'service' },
        
        // Electrical Services
        { id: 's60', name: 'Electrical Repairs & Upgrades', category: 'electrical', hourlyRate: 95, rating: 4.9, reviews: 289, distance: 2.5, image: '⚡', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop', verified: true, provider: 'Bright Spark Electric', type: 'service' },
        { id: 's61', name: 'Panel Upgrades & Rewiring', category: 'electrical', hourlyRate: 110, rating: 5.0, reviews: 201, distance: 3.8, image: '🔌', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop', verified: true, provider: 'Master Electricians', type: 'service' },
        { id: 's62', name: 'Lighting Installation', category: 'electrical', hourlyRate: 85, rating: 4.8, reviews: 167, distance: 1.9, image: '💡', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop', verified: true, provider: 'Illuminate Electric', type: 'service' },
        
        // Roofing Services
        { id: 's65', name: 'Roof Repair & Replacement', category: 'roofing', hourlyRate: 115, rating: 4.9, reviews: 245, distance: 4.5, image: '🏘️', imageUrl: 'https://media.istockphoto.com/id/1328449441/photo/corner-of-house-with-windows-new-gray-metal-tile-roof-and-rain-gutter-metallic-guttering.webp?a=1&b=1&s=612x612&w=0&k=20&c=Au7sUHU7lzcv5IFDk7qcCfnIUw3df4-GJ22vTfKbs4s=', verified: true, provider: 'Summit Roofing', type: 'service' },
        { id: 's66', name: 'Roof Inspection & Maintenance', category: 'roofing', hourlyRate: 75, rating: 4.8, reviews: 198, distance: 3.1, image: '🔨', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', verified: true, provider: 'Top Tier Roofing', type: 'service' },
        { id: 's67', name: 'Gutter Installation & Repair', category: 'roofing', hourlyRate: 65, rating: 4.7, reviews: 156, distance: 2.8, image: '🚿', imageUrl: 'https://media.istockphoto.com/id/865158794/photo/installation-gutter-system.webp?a=1&b=1&s=612x612&w=0&k=20&c=gahRfgZMDZ5v5cTRbiJwNbV-0jZxgFMpuXWZwEvelEE=', verified: true, provider: 'Rain Guard Roofing', type: 'service' },
        
        // HVAC Services
        { id: 's70', name: 'AC Repair & Installation', category: 'hvac', hourlyRate: 105, rating: 4.9, reviews: 312, distance: 2.3, image: '❄️', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Cool Air HVAC', type: 'service' },
        { id: 's71', name: 'Heating System Maintenance', category: 'hvac', hourlyRate: 95, rating: 4.8, reviews: 267, distance: 1.9, image: '🔥', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop', verified: true, provider: 'Warm Home Services', type: 'service' },
        { id: 's72', name: 'Duct Cleaning & Repair', category: 'hvac', hourlyRate: 85, rating: 4.7, reviews: 189, distance: 3.5, image: '💨', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop', verified: true, provider: 'Fresh Air HVAC', type: 'service' },
        
        // Flooring/Carpet Services
        { id: 's75', name: 'Hardwood Floor Installation', category: 'flooring', hourlyRate: 95, rating: 4.9, reviews: 234, distance: 3.8, image: '🪵', imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop', verified: true, provider: 'Premier Flooring', type: 'service' },
        { id: 's76', name: 'Carpet Cleaning & Installation', category: 'flooring', hourlyRate: 75, rating: 4.8, reviews: 298, distance: 2.1, image: '🧹', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', verified: true, provider: 'Clean Floors Co', type: 'service' },
        { id: 's77', name: 'Tile & Laminate Installation', category: 'flooring', hourlyRate: 85, rating: 4.9, reviews: 201, distance: 2.7, image: '⬛', imageUrl: 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=400&h=300&fit=crop', verified: true, provider: 'Master Floor Installers', type: 'service' },
        
        // Painting Services
        { id: 's80', name: 'Interior Painting', category: 'painting', hourlyRate: 65, rating: 4.8, reviews: 345, distance: 1.8, image: '🎨', imageUrl: 'https://images.unsplash.com/photo-1759340875613-070b317265f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEludGVyaW9yJTIwJTJGJTIwRXh0ZXJpb3IlMjBQYWludGluZ3xlbnwwfHwwfHx8MA%3D%3D', verified: true, provider: 'Color Perfect Painters', type: 'service' },
        { id: 's81', name: 'Exterior House Painting', category: 'painting', hourlyRate: 75, rating: 4.9, reviews: 278, distance: 3.2, image: '🖌️', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop', verified: true, provider: 'Brush & Roll Pros', type: 'service' },
        { id: 's82', name: 'Cabinet Refinishing', category: 'painting', hourlyRate: 85, rating: 5.0, reviews: 167, distance: 2.5, image: '🪵', imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop', verified: true, provider: 'Fine Finish Painting', type: 'service' },
        
        // Appliance Repair Services
        { id: 's85', name: 'Refrigerator Repair', category: 'appliance', hourlyRate: 85, rating: 4.9, reviews: 256, distance: 1.5, image: '🔧', imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&h=300&fit=crop', verified: true, provider: 'Appliance Fix Pro', type: 'service' },
        { id: 's86', name: 'Washer & Dryer Repair', category: 'appliance', hourlyRate: 75, rating: 4.8, reviews: 223, distance: 2.3, image: '🌀', imageUrl: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop', verified: true, provider: 'Quick Fix Appliances', type: 'service' },
        { id: 's87', name: 'Dishwasher & Oven Repair', category: 'appliance', hourlyRate: 80, rating: 4.7, reviews: 189, distance: 3.1, image: '🍽️', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', verified: true, provider: 'Home Appliance Experts', type: 'service' },
      ];

        // Categories data
  export const categories = [
  { id: 'all', name: 'All Services', icon: '🔍', active: true },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔧' }, // from servicesData.js (s85)
  { id: 'beauty', name: 'Beauty (Hair, Nails, Makeup)', icon: '💇' }, // from servicesData.js (s16)
  { id: 'childcare', name: 'Childcare', icon: '👶' }, // No direct match, using generic
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' }, // from servicesData.js (s13)
  { id: 'senior', name: 'Senior Care', icon: '👵' }, // No direct match
  { id: 'electrical', name: 'Electrical', icon: '⚡' }, // from servicesData.js (s60)
  { id: 'contracting', name: 'General Contracting', icon: '👷' }, // from servicesData.js (s50)
  { id: 'handyman', name: 'Handyman', icon: '🔨' }, // from servicesData.js (s11)
  { id: 'health', name: 'Health & Fitness/Nutrition', icon: '💪' }, // from servicesData.js (s15)
  { id: 'spa', name: 'Spa/Medical Treatments', icon: '🧖‍♀️' }, // No direct match
  { id: 'hvac', name: 'HVAC', icon: '❄️' }, // from servicesData.js (s70)
  { id: 'painting', name: 'Interior/Exterior Painting', icon: '🎨' }, // from servicesData.js (s80)
  { id: 'lawn', name: 'Lawn Care', icon: '🌱' }, // from servicesData.js (s10)
  { id: 'legal', name: 'Legal Service', icon: '⚖️' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔧' }, // from servicesData.js (s14)
  { id: 'detail', name: 'Mobile Detail', icon: '🚗' }, // from servicesData.js (s35)
  { id: 'moving', name: 'Moving/Relocation', icon: '🚚' }, // from servicesData.js (s17)
  { id: 'notary', name: 'Notarization', icon: '📝' }, // from servicesData.js (s30)
  { id: 'party', name: 'Party/Event Planner', icon: '🎉' }, // from servicesData.js (s18)
  { id: 'pet', name: 'Pet Care/Boarding', icon: '🐕' }, // from servicesData.js (s20)
  { id: 'photography', name: 'Photography', icon: '📷' }, // from servicesData.js (s1)
  { id: 'plumbing', name: 'Plumbing', icon: '🚰' }, // from servicesData.js (s55)
  { id: 'realestate', name: 'Real Estate/Title', icon: '🏡' }, // from servicesData.js (s90)
];

export const categoryMap = {
  photography: "Photography",
  landscape: "Lawn Care",
  handyman: "Handyman",
  other: "Other Services",

  cleaning: "Cleaning",

  mechanic: "Mechanic",
  health: "Health & Fitness",
  beauty: "Beauty (Hair, Nails, Makeup)",
  moving: "Moving / Relocation",
  party: "Party / Event Planner",

  pet: "Pet Care / Boarding",

  notary: "Notarization",

  detail: "Mobile Detail",

  delivery: "Delivery / Courier",

  hauling: "Hauling / Junk Removal",

  realestate: "Real Estate / Title",

  contractor: "General Contracting",

  plumbing: "Plumbing",

  electrical: "Electrical",

  roofing: "Roofing",

  hvac: "HVAC",

  flooring: "Flooring / Carpet",

  painting: "Interior / Exterior Painting",

  appliance: "Appliance Repair",
};
