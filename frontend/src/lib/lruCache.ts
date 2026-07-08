/**
 * A custom LRU (Least Recently Used) Cache implementation.
 * This utilizes two classic Data Structures:
 * 1. A Hash Map (Map) for O(1) fast lookups.
 * 2. A Doubly Linked List for O(1) fast evictions of the oldest data.
 * 
 * We use this to cache AI-generated content (like Flashcards) in the browser
 * so we don't waste time or API rate-limits re-generating content the user has already seen.
 */

class Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, Node<K, V>>;
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  // Get item from cache and move it to the front (most recently used)
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const node = this.cache.get(key)!;
    this.moveToHead(node);
    return node.value;
  }

  // Put item into cache. If it exceeds capacity, evict the tail (least recently used)
  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      this.moveToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);

      if (this.cache.size > this.capacity) {
        this.removeTail();
      }
    }
  }

  private addToHead(node: Node<K, V>): void {
    node.prev = null;
    node.next = this.head;
    
    if (this.head) {
      this.head.prev = node;
    }
    
    this.head = node;
    
    if (!this.tail) {
      this.tail = node;
    }
  }

  private moveToHead(node: Node<K, V>): void {
    if (node === this.head) return;

    // Remove node from its current position
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;

    // Add back to head
    this.addToHead(node);
  }

  private removeTail(): void {
    if (!this.tail) return;

    this.cache.delete(this.tail.key);
    this.tail = this.tail.prev;
    
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null; // Cache is now empty
    }
  }
}
