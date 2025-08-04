export function isValidJsonString(jsonString: string): boolean {
  const allowedKeys = new Set([
    "keyword",
    "city",
    "country",
    "startDateTime",
    "endDateTime",
    "genres",
  ]);

  // Regular expression to match keys and values in JSON
  const keyPattern = /"([^"]+)":/g;
  const keyCounts = new Map<string, number>();
  let match: RegExpExecArray | null;

  // Check for duplicate keys and validity of keys
  while ((match = keyPattern.exec(jsonString)) !== null) {
    const key = match[1];
    if (keyCounts.has(key)) {
      return false;
    }
    keyCounts.set(key, 1);
    if (!allowedKeys.has(key)) {
      return false;
    }
  }

  try {
    const parsedObject = JSON.parse(jsonString);
    if (typeof parsedObject !== "object" || parsedObject === null) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

//function that capitalizing every word on string, optional use
export function capitalizeEveryWord(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
