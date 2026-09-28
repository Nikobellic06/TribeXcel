/**
 * Certificate Metadata Patterns (Number, Registration, Authority, State, District)
 */

export const CERTIFICATE_PATTERNS = {
  labels: [
    /(?:certificate\s+no\.?|cert\s+no\.?|registration\s+no\.?|regn\s+no\.?|case\s+no\.?|application\s+no\.?|praman\s+patra\s+sankhya|sl\.?\s*no\.?)\s*[:\-]?/i
  ],
  numbers: [
    /\b([A-Z]{2,4}\/[A-Z0-9_\-]+\/\d{4}\/\d+)\b/i,
    /\b([A-Z0-9]{2,10}[-/][A-Z0-9_\-/]{4,30})\b/i,
    /(?:certificate\s+no\.?|cert\s+no\.?|regn\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]{4,30})/i
  ],
  issuingAuthorities: [
    /\b(sub-divisional\s+officer|sdo|tahasildar|tehsildar|circle\s+officer|co|deputy\s+commissioner|dc|district\s+magistrate|dm|revenue\s+divisional\s+officer|rdo|block\s+development\s+officer|bdo|executive\s+magistrate)\b/i
  ],
  states: [
    /\b(andhra\s+pradesh|arunachal\s+pradesh|assam|bihar|chhattisgarh|goa|gujarat|haryana|himachal\s+pradesh|jharkhand|karnataka|kerala|madhya\s+pradesh|maharashtra|manipur|meghalaya|mizoram|nagaland|odisha|orissa|punjab|rajasthan|sikkim|tamil\s+nadu|telangana|tripura|uttar\s+pradesh|uttarakhand|west\s+bengal|delhi|jammu\s+and\s+kashmir|ladakh)\b/i
  ],
  districts: [
    /(?:district\s*[:\-]?|dist\.?\s*[:\-]?)\s*([A-Za-z\s]{3,25})(?:,|\.|\n|$)/i,
    /\b(ranchi|dumka|khunti|gumla|simdega|lohardaga|west\s+singhbhum|east\s+singhbhum|bokaro|dhanbad|hazaribagh|mayurbhanj|koraput|sundargarh|keonjhar|rayagada|bastar|dantewada|kanker|mandla|dindori|jhabua|barwani)\b/i
  ]
};
