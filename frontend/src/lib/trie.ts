/**
 * A classic Trie (Prefix Tree) data structure for lightning-fast autocomplete and search.
 * We use this to instantly search through course modules by prefix in O(L) time complexity,
 * where L is the length of the search term, rather than O(N * M) typical array filtering.
 */

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  courseIds: Set<string>; // Store IDs of courses that match this path

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.courseIds = new Set();
  }
}

export class CourseTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Inserts a course title into the Trie along with its ID.
   * We insert every suffix of every word in the title to allow partial matching.
   */
  insert(courseId: string, title: string) {
    // Convert to lowercase and split into words to allow searching by any word
    const words = title.toLowerCase().split(/[\s-]+/);
    
    for (const word of words) {
      let current = this.root;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!current.children.has(char)) {
          current.children.set(char, new TrieNode());
        }
        current = current.children.get(char)!;
        // Every node along the path knows about this course
        current.courseIds.add(courseId);
      }
      current.isEndOfWord = true;
    }
  }

  /**
   * Searches for a prefix and returns a Set of course IDs that match.
   */
  searchPrefix(prefix: string): Set<string> {
    const term = prefix.toLowerCase().trim();
    if (!term) return new Set();

    let current = this.root;
    for (let i = 0; i < term.length; i++) {
      const char = term[i];
      if (!current.children.has(char)) {
        return new Set(); // No matches
      }
      current = current.children.get(char)!;
    }
    
    return current.courseIds;
  }
}
