export interface Product {
  _id: string;
  name: string;
  category: 'Vegetables' | 'Fruits';
  price: number;
  unit: string;
  image: string;
}

export interface ParsedCommand {
  action: 'ADD' | 'REMOVE' | 'SHOW_CART' | 'PLACE_ORDER' | 'CONFIRM_YES' | 'CONFIRM_NO' | 'UNKNOWN';
  productName: string | null;
  product: Product | null;
  quantity: number;
  unit: string | null;
  rawText: string;
}

// Synonyms map for fruits and vegetables (English, Hindi, Kannada, Telugu, Telugu script)
const SYNONYMS: Record<string, string[]> = {
  'Tomato': ['tomato', 'tomatoes', 'tamatar', 'tomatada', 'tomaato', 'tamota', 'thamota', 'tamata', 'ramamulaga', 'టమాటాలు', 'టమాటో', 'టమోటా', 'తమోటా'],
  'Potato': ['potato', 'potatoes', 'aalu', 'aloo', 'eele', 'batata', 'alugadda', 'bangaladumpa', 'aalugadda', 'ఆలుగడ్డలు', 'బంగాళాదుంపలు', 'ఆలుగడ్డ', 'బంగాళాదుంప'],
  'Onion': ['onion', 'onions', 'pyaaz', 'pyaz', 'eerulli', 'ullipaya', 'yellipaya', 'eragadda', 'ఉల్లిపాయలు', 'ఉల్లిపాయ', 'ఎర్రగడ్డ'],
  'Carrot': ['carrot', 'carrots', 'gajar', 'gaajar', 'carrotu', 'gajjara', 'క్యారట్', 'క్యారట్లు'],
  'Beans': ['bean', 'beans', 'phalli', 'hurulikayi', 'chicudu', 'chicudukaya', 'చిక్కుడుకాయలు', 'చిక్కుడు'],
  'Cabbage': ['cabbage', 'cabbages', 'patta gobhi', 'gobi', 'kosu', 'kobis', 'క్యాబేజీ', 'క్యాబేజి'],
  'Cauliflower': ['cauliflower', 'phool gobhi', 'haookosu', 'caulifloweru', 'కాలీఫ్లవర్'],
  'Spinach': ['spinach', 'palak', 'paalak', 'palya', 'palakura', 'akukura', 'పాలకూర'],
  'Brinjal': ['brinjal', 'brinjals', 'eggplant', 'baingan', 'badanekayi', 'vankaya', 'vaankaya', 'వంకాయలు', 'వంకాయ'],
  'Capsicum': ['capsicum', 'bell pepper', 'shimla mirch', 'donne menasinakayi', 'bengaluru mirapa', 'donne mirapa', 'క్యాప్సికమ్'],
  'Apple': ['apple', 'apples', 'seb', 'sebu', 'seema regu', 'యాపిల్', 'యాపిల్స్', 'ఆపిల్'],
  'Banana': ['banana', 'bananas', 'kela', 'kele', 'baalehanu', 'baale', 'arativandu', 'arati pandu', 'ariti', 'అరటిపండ్లు', 'అరటిపండు'],
  'Orange': ['orange', 'oranges', 'santra', 'kithale', 'kamlapandu', 'narinja', 'నారింజ', 'నారింజపండు'],
  'Grapes': ['grape', 'grapes', 'angoor', 'drakshi', 'drakshalu', 'ద్రాక్ష', 'ద్రాక్షపండ్లు'],
  'Mango': ['mango', 'mangoes', 'aam', 'maavina', 'mamidipandu', 'mamidi', 'మామిడిపండ్లు', 'మామిడి'],
  'Papaya': ['papaya', 'papitas', 'papita', 'parangi', 'boppayi', 'bobbayi', 'బొప్పాయి'],
  'Watermelon': ['watermelon', 'watermelons', 'tarbooz', 'kallangadi', 'puchakaya', 'పుచ్చకాయ'],
  'Pomegranate': ['pomegranate', 'pomegranates', 'anar', 'dalimbe', 'danimma', 'దానిమ్మ']
};

// Quantity word dictionary (English, Hindi, Kannada, Telugu, Telugu script)
const QUANTITY_WORDS: Record<string, number> = {
  'one': 1, 'a': 1, 'an': 1, 'ek': 1, 'ondu': 1, 'okati': 1, 'vokati': 1, 'oka': 1, 'ఒక': 1, 'ఒకటి': 1,
  'two': 2, 'do': 2, 'eradu': 2, 'rendu': 2, 'renddo': 2, 'రెండు': 2,
  'three': 3, 'teen': 3, 'mooru': 3, 'moodu': 3, 'muudu': 3, 'మూడు': 3,
  'four': 4, 'char': 4, 'naalku': 4, 'nalugu': 4, 'naalugu': 4, 'నాలుగు': 4,
  'five': 5, 'paanch': 5, 'aidhu': 5, 'aidu': 5, 'ఐదు': 5,
  'six': 6, 'chhe': 6, 'aaru': 6, 'ఆరు': 6,
  'seven': 7, 'saat': 7, 'aelu': 7, 'yedu': 7, 'aedu': 7, 'ఏడు': 7,
  'eight': 8, 'aath': 8, 'entu': 8, 'enimidi': 8, 'ఎనిమిది': 8,
  'nine': 9, 'nau': 9, 'ombattu': 9, 'tommidi': 9, 'తొమ్మిది': 9,
  'ten': 10, 'das': 10, 'hatthu': 10, 'padi': 10, 'పది': 10,
  'half': 1
};

export function parseVoiceCommand(text: string, availableProducts: Product[]): ParsedCommand {
  const rawText = text.trim();
  const lower = rawText.toLowerCase();

  // Confirmation Yes / No words across English, Hindi, Kannada, Telugu, Telugu script
  const yesWords = [
    'yes', 'yeah', 'yep', 'confirm', 'place order', 'place the order', 'haan', 'ha', 'ji haan',
    'houdhu', 'saaku', 'ok', 'okay', 'avunu', 'avunandi', 'sare', 'cheyandi', 'thokasa',
    'అవును', 'అవునండి', 'సరే', 'ప్లేస్ చెయ్యి', 'ఓకే'
  ];
  const noWords = [
    'no', 'nope', 'cancel', 'don\'t', 'nahi', 'na', 'illa', 'bedi', 'kadu', 'ledu', 'vaddu',
    'కాదు', 'లేదు', 'వద్దు'
  ];

  // Check place order / confirm my order / checkout (English, Hindi, Telugu, Telugu script)
  if (
    lower.includes('confirm my cart') || lower.includes('confirm my order') ||
    lower.includes('confirm order') || lower.includes('place my order') ||
    lower.includes('place order') || lower.includes('place the order') ||
    lower.includes('checkout') || lower.includes('i want to checkout') ||
    lower.includes('order place karo') || lower.includes('order maadi') ||
    lower.includes('order ivvandi') || lower.includes('aadesam ivvandi') ||
    lower.includes('order confirm cheyi') || lower.includes('aadesam confirm cheyi') ||
    lower.includes('order confirm') || lower.includes('ఆర్డర్ ప్లేస్ చెయ్యి') ||
    lower.includes('నా ఆర్డర్ కన్ఫర్మ్ చెయ్యి') || lower.includes('ఆర్డర్ కన్ఫర్మ్')
  ) {
    return { action: 'PLACE_ORDER', productName: null, product: null, quantity: 1, unit: null, rawText };
  }

  // Check show / read / summarize cart (English, Hindi, Telugu, Telugu script)
  if (
    lower.includes('what\'s in my cart') || lower.includes('what is in my cart') ||
    lower.includes('what is in my basket') || lower.includes('what\'s in my basket') ||
    lower.includes('tell me what is in my basket') || lower.includes('tell me what is in my cart') ||
    lower.includes('read my cart') || lower.includes('read cart') ||
    lower.includes('summarize cart') || lower.includes('how much is my total') ||
    lower.includes('show my cart') || lower.includes('show cart') ||
    lower.includes('view cart') || lower.includes('cart dikhao') ||
    lower.includes('cart torasi') || lower.includes('cart chupinchu') ||
    lower.includes('cart choodu') || lower.includes('cart lo em unnai') ||
    lower.includes('cart lo em unnayi') || lower.includes('na cart lo em unnayi') ||
    lower.includes('na basket lo em unnayi') || lower.includes('cart chaduvumu') ||
    lower.includes('cart lo unnavi cheppu') || lower.includes('open cart') ||
    lower.includes('my cart') || lower.includes('నా కార్ట్లో ఏమున్నాయి') ||
    lower.includes('నా బాస్కెట్లో ఏమున్నాయి') || lower.includes('కార్ట్ చూపించు')
  ) {
    return { action: 'SHOW_CART', productName: null, product: null, quantity: 1, unit: null, rawText };
  }

  // Exact single word confirmation checks
  if (yesWords.some(w => lower === w || lower.startsWith(w + ' '))) {
    return { action: 'CONFIRM_YES', productName: null, product: null, quantity: 1, unit: null, rawText };
  }

  if (noWords.some(w => lower === w || lower.startsWith(w + ' '))) {
    return { action: 'CONFIRM_NO', productName: null, product: null, quantity: 1, unit: null, rawText };
  }

  // Determine if Remove action
  const isRemove = (
    lower.includes('remove') || lower.includes('delete') ||
    lower.includes('hatao') || lower.includes('nikalo') ||
    lower.includes('tegedukolli') || lower.includes('thesiveyandi') ||
    lower.includes('teeseyi') || lower.includes('తీసేయి') || lower.includes('తీసివేయి')
  );

  // Match Product in speech text
  let matchedProduct: Product | null = null;
  let matchedName: string | null = null;

  for (const prod of availableProducts) {
    const key = prod.name;
    const synonymsList = SYNONYMS[key] || [key.toLowerCase()];
    for (const syn of synonymsList) {
      if (lower.includes(syn.toLowerCase())) {
        matchedProduct = prod;
        matchedName = prod.name;
        break;
      }
    }
    if (matchedProduct) break;
  }

  // If no product matched and user just said "yes" or "no" somewhere inside text
  if (!matchedProduct) {
    if (yesWords.some(w => lower.includes(w))) {
      return { action: 'CONFIRM_YES', productName: null, product: null, quantity: 1, unit: null, rawText };
    }
    if (noWords.some(w => lower.includes(w))) {
      return { action: 'CONFIRM_NO', productName: null, product: null, quantity: 1, unit: null, rawText };
    }
    return { action: 'UNKNOWN', productName: null, product: null, quantity: 1, unit: null, rawText };
  }

  // If remove action matched
  if (isRemove) {
    return {
      action: 'REMOVE',
      productName: matchedName,
      product: matchedProduct,
      quantity: 1,
      unit: matchedProduct.unit,
      rawText
    };
  }

  // Extract Quantity (Digit numbers or word numbers)
  let quantity = 1;

  // Check digit numbers in string (e.g. 2, 3, 5, 2kg, 1kg)
  const digitMatch = lower.match(/\b(\d+)\b/);
  if (digitMatch) {
    quantity = parseInt(digitMatch[1], 10);
  } else {
    // Check word numbers
    for (const [word, num] of Object.entries(QUANTITY_WORDS)) {
      if (lower.includes(word.toLowerCase())) {
        quantity = num;
        break;
      }
    }
  }

  // Extract Unit
  let unit = matchedProduct.unit;
  if (lower.includes('kg') || lower.includes('kilo') || lower.includes('kilos') || lower.includes('kilogram') || lower.includes('కిలో')) {
    unit = 'kg';
  } else if (lower.includes('dozen') || lower.includes('dozens') || lower.includes('darjan')) {
    unit = 'dozen';
  } else if (lower.includes('pc') || lower.includes('piece') || lower.includes('pieces')) {
    unit = 'pc';
  } else if (lower.includes('bunch') || lower.includes('bunches')) {
    unit = 'bunch';
  }

  // Default action is ADD
  return {
    action: 'ADD',
    productName: matchedName,
    product: matchedProduct,
    quantity,
    unit,
    rawText
  };
}
