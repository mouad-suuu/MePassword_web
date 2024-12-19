export function getAvatarUrl(name: string, fallback?: string) {
  // If no name is provided, use the fallback or a default
  const seed = name || fallback || 'User';
  
  // You can customize the style - options include:
  // 'adventurer', 'avataaars', 'bottts', 'initials', 'micah', 'miniavs', 'pixel-art'
  const style = 'initials';
  
  // Generate the URL using DiceBear API
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
