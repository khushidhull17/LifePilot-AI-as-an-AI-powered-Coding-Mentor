/**
 * Curated practice challenges. This is static learning content, not an AI
 * response. Users write their own answer in the browser; nothing is executed
 * on the server.
 */
export const challenges = [
  {
    id: 'html-semantic-section',
    title: 'Build a semantic portfolio section',
    difficulty: 'beginner',
    topic: 'HTML',
    language: 'HTML, CSS & JavaScript',
    points: 10,
    estimatedMinutes: 20,
    prompt:
      'Create a portfolio "About me" section with a heading, a short paragraph, and a list of three skills. Use semantic HTML only (no CSS needed).',
    requirements: [
      'Use a <section> element',
      'Include one <h2> heading',
      'Include a paragraph and an unordered list with three skills',
    ],
    hints: [
      'Semantic tags describe the meaning of content to browsers and screen readers.',
      'A <ul> contains <li> items. Put it inside the <section>.',
    ],
    starterCode: '<section>\n  <!-- Build your about section here -->\n</section>',
    solution:
      '<section aria-labelledby="about-heading">\n  <h2 id="about-heading">About me</h2>\n  <p>I am a beginner developer learning to build for the web.</p>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n  </ul>\n</section>',
    explanation:
      'A <section> groups related content, <h2> gives it a heading, and the <ul> creates a list of skills. The aria-labelledby attribute connects the heading to the section, which helps screen-reader users.',
  },
  {
    id: 'css-flex-profile-card',
    title: 'Center a profile card with Flexbox',
    difficulty: 'beginner',
    topic: 'CSS',
    language: 'HTML, CSS & JavaScript',
    points: 10,
    estimatedMinutes: 20,
    prompt:
      'Given a page with a .card element inside .wrapper, center the card both horizontally and vertically and give it 24px of padding, rounded corners and a soft shadow.',
    requirements: [
      'Center .card in .wrapper using Flexbox',
      'Add padding, border-radius and box-shadow to the card',
      'Explain why min-height is useful for vertical centering',
    ],
    hints: [
      'display: flex is applied to the parent container.',
      'Use align-items and justify-content on .wrapper.',
      'min-height: 100vh makes the wrapper as tall as the viewport.',
    ],
    starterCode:
      '.wrapper {\n  /* add layout rules */\n}\n\n.card {\n  /* add card styles */\n}',
    solution:
      '.wrapper {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n}\n\n.card {\n  padding: 24px;\n  border-radius: 16px;\n  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);\n}',
    explanation:
      'Flexbox centers children on both axes when justify-content and align-items are set. min-height: 100vh gives the wrapper a full viewport of space so vertical centering is visible.',
  },
  {
    id: 'js-reverse-string',
    title: 'Reverse a string',
    difficulty: 'beginner',
    topic: 'JavaScript Basics',
    language: 'HTML, CSS & JavaScript',
    points: 10,
    estimatedMinutes: 15,
    prompt:
      'Write a function reverseString(text) that returns the input string reversed. For example, reverseString("pilot") should return "tolip".',
    requirements: [
      'Handle an empty string',
      'Do not change the original string',
      'Return a string, not an array',
    ],
    hints: [
      'Strings have a split method that turns them into an array.',
      'Arrays can be reversed and joined back into a string.',
    ],
    starterCode: 'function reverseString(text) {\n  // your code here\n}',
    solution:
      'function reverseString(text) {\n  return text.split("").reverse().join("");\n}',
    explanation:
      'split("") converts the string to an array of characters. reverse() reverses the array in place, and join("") combines it back into a string. Strings are immutable, so the original value is unchanged.',
  },
  {
    id: 'js-fizzbuzz',
    title: 'FizzBuzz warm-up',
    difficulty: 'beginner',
    topic: 'Loops & Conditions',
    language: 'HTML, CSS & JavaScript',
    points: 10,
    estimatedMinutes: 20,
    prompt:
      'Print the numbers 1 to 30. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
    requirements: [
      'Use a loop from 1 to 30 inclusive',
      'Check multiples of 15 before multiples of 3 or 5',
      'Print one value per line',
    ],
    hints: [
      'The modulo operator (%) returns the remainder of a division.',
      'A number is a multiple of 3 when number % 3 === 0.',
    ],
    starterCode: 'for (let i = 1; i <= 30; i += 1) {\n  // your code here\n}',
    solution:
      'for (let i = 1; i <= 30; i += 1) {\n  if (i % 15 === 0) console.log("FizzBuzz");\n  else if (i % 3 === 0) console.log("Fizz");\n  else if (i % 5 === 0) console.log("Buzz");\n  else console.log(i);\n}',
    explanation:
      'The order of conditions matters. If you checked i % 3 first, numbers like 15 would print "Fizz" and never reach the FizzBuzz branch. Checking 15 first catches both conditions.',
  },
  {
    id: 'python-temperature',
    title: 'Celsius to Fahrenheit converter',
    difficulty: 'beginner',
    topic: 'Python Basics',
    language: 'Python',
    points: 10,
    estimatedMinutes: 15,
    prompt:
      'Write a function celsius_to_fahrenheit(celsius) that converts a temperature and returns the result rounded to one decimal place.',
    requirements: [
      'Use the formula F = C × 9/5 + 32',
      'Return a float rounded to one decimal place',
      'Handle negative temperatures',
    ],
    hints: [
      'Python 3 uses / for true division.',
      'The built-in round(value, 1) rounds to one decimal place.',
    ],
    starterCode: 'def celsius_to_fahrenheit(celsius):\n    # your code here\n    pass',
    solution:
      'def celsius_to_fahrenheit(celsius):\n    fahrenheit = (celsius * 9 / 5) + 32\n    return round(fahrenheit, 1)',
    explanation:
      'The formula combines multiplication, division and addition. Wrapping the result in round(..., 1) avoids messy floating-point output such as 98.60000000001.',
  },
  {
    id: 'java-even-odd',
    title: 'Even or odd classifier',
    difficulty: 'beginner',
    topic: 'Java Basics',
    language: 'Java',
    points: 10,
    estimatedMinutes: 15,
    prompt:
      'Write a Java method classify(int number) that returns "even" when the number is even and "odd" otherwise. Handle negative numbers correctly.',
    requirements: [
      'Use the modulo operator',
      'Return a String',
      'Add a main method with two example calls',
    ],
    hints: [
      'In Java, n % 2 gives 0 for even numbers.',
      'The remainder can be negative for negative inputs, so compare with 0.',
    ],
    starterCode:
      'public class Main {\n  static String classify(int number) {\n    // your code here\n    return "";\n  }\n\n  public static void main(String[] args) {\n    // print two examples\n  }\n}',
    solution:
      'public class Main {\n  static String classify(int number) {\n    return number % 2 == 0 ? "even" : "odd";\n  }\n\n  public static void main(String[] args) {\n    System.out.println(classify(4));\n    System.out.println(classify(-7));\n  }\n}',
    explanation:
      'For -7, -7 % 2 is -1, which is not 0, so it is correctly classified as odd. Testing with zero is also useful because 0 % 2 is 0.',
  },
  {
    id: 'c-sum-array',
    title: 'Sum an array in C',
    difficulty: 'beginner',
    topic: 'Arrays & Functions',
    language: 'C',
    points: 10,
    estimatedMinutes: 20,
    prompt:
      'Write a C function int sum(int numbers[], int length) that returns the sum of an integer array, then print the result from main.',
    requirements: [
      'Loop exactly length times',
      'Start the accumulator at 0',
      'Print the result with printf',
    ],
    hints: [
      'Arrays are zero-indexed, so the last valid index is length - 1.',
      'Declare total as int total = 0; before the loop.',
    ],
    starterCode:
      '#include <stdio.h>\n\nint sum(int numbers[], int length) {\n  // your code here\n  return 0;\n}\n\nint main(void) {\n  int values[] = {4, 8, 15, 16, 23, 42};\n  // call sum and print\n  return 0;\n}',
    solution:
      '#include <stdio.h>\n\nint sum(int numbers[], int length) {\n  int total = 0;\n  for (int i = 0; i < length; i++) {\n    total += numbers[i];\n  }\n  return total;\n}\n\nint main(void) {\n  int values[] = {4, 8, 15, 16, 23, 42};\n  printf("Sum: %d\\n", sum(values, 6));\n  return 0;\n}',
    explanation:
      'Passing the array and its length is a standard C pattern because a function cannot know how many elements an array has. The loop reads each element once for O(n) time.',
  },
  {
    id: 'cpp-largest-number',
    title: 'Find the largest number',
    difficulty: 'beginner',
    topic: 'Vectors & Loops',
    language: 'C++',
    points: 10,
    estimatedMinutes: 15,
    prompt:
      'Write a C++ function int largest(const std::vector<int>& numbers) that returns the largest value. Assume the vector is never empty.',
    requirements: [
      'Use a range-based for loop',
      'Initialize the answer with the first element',
      'Return an int',
    ],
    hints: [
      'Initialize with numbers[0] rather than 0, otherwise all-negative lists fail.',
      'The syntax for a range loop is: for (int value : numbers)',
    ],
    starterCode:
      '#include <iostream>\n#include <vector>\n\nint largest(const std::vector<int>& numbers) {\n  // your code here\n  return 0;\n}',
    solution:
      '#include <iostream>\n#include <vector>\n\nint largest(const std::vector<int>& numbers) {\n  int best = numbers[0];\n  for (int value : numbers) {\n    if (value > best) best = value;\n  }\n  return best;\n}',
    explanation:
      'Starting with the first element handles negative-only lists. Passing the vector by const reference avoids copying it, which keeps the function efficient.',
  },
  {
    id: 'js-debounce',
    title: 'Implement debounce',
    difficulty: 'intermediate',
    topic: 'Closures & Timers',
    language: 'HTML, CSS & JavaScript',
    points: 20,
    estimatedMinutes: 30,
    prompt:
      'Write a debounce(fn, delay) function. It should return a new function that runs fn only after delay milliseconds have passed without another call.',
    requirements: [
      'Preserve the latest arguments',
      'Use setTimeout and clearTimeout',
      'Explain a real use case such as a search box',
    ],
    hints: [
      'Closures let the inner function remember a timer variable.',
      'Use a regular function or rest parameters so the arguments are collected.',
    ],
    starterCode:
      'function debounce(fn, delay) {\n  // your code here\n}\n\nconst search = debounce((query) => console.log(query), 300);',
    solution:
      'function debounce(fn, delay) {\n  let timerId;\n  return function debounced(...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delay);\n  };\n}',
    explanation:
      'Each call cancels the previous timer and starts a new one. This is perfect for search inputs: the API is called only after the user pauses typing, which saves requests.',
  },
  {
    id: 'js-async-fetch',
    title: 'Fetch and handle API errors',
    difficulty: 'intermediate',
    topic: 'Async/Await',
    language: 'HTML, CSS & JavaScript',
    points: 20,
    estimatedMinutes: 30,
    prompt:
      'Write an async function loadUser(id) that fetches https://api.example.com/users/{id}, checks response.ok, and returns the JSON. Throw a helpful error when the request fails.',
    requirements: [
      'Use try/catch or let the caller handle errors',
      'Check response.ok before parsing',
      'Include the status code in the error message',
    ],
    hints: [
      'fetch only rejects for network errors, not for 404 responses.',
      'response.json() returns a Promise, so it needs await.',
    ],
    starterCode:
      'async function loadUser(id) {\n  // your code here\n}',
    solution:
      'async function loadUser(id) {\n  const response = await fetch(`https://api.example.com/users/${id}`);\n  if (!response.ok) {\n    throw new Error(`Could not load user (status ${response.status})`);\n  }\n  return response.json();\n}',
    explanation:
      'A 404 from fetch still resolves, so response.ok must be checked manually. Throwing inside an async function becomes a rejected promise that the caller can catch.',
  },
  {
    id: 'react-todo-state',
    title: 'Build a todo list with state',
    difficulty: 'intermediate',
    topic: 'React State',
    language: 'React.js',
    points: 20,
    estimatedMinutes: 40,
    prompt:
      'Build a TodoList component with an input, an add button, and a list of todos. Support adding items and toggling them as complete.',
    requirements: [
      'Use useState for the input text and todos',
      'Never mutate the todos array directly',
      'Include a unique key for each rendered item',
    ],
    hints: [
      'Use [todos, setTodos] = useState([]).',
      'Toggle with todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo).',
      'crypto.randomUUID() creates a unique id in modern browsers.',
    ],
    starterCode:
      'import { useState } from "react";\n\nexport default function TodoList() {\n  // your code here\n  return null;\n}',
    solution:
      'import { useState } from "react";\n\nexport default function TodoList() {\n  const [text, setText] = useState("");\n  const [todos, setTodos] = useState([]);\n\n  function addTodo() {\n    if (!text.trim()) return;\n    setTodos((current) => [...current, { id: crypto.randomUUID(), text, done: false }]);\n    setText("");\n  }\n\n  function toggle(id) {\n    setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo));\n  }\n\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <button onClick={addTodo}>Add</button>\n      <ul>\n        {todos.map((todo) => (\n          <li key={todo.id} onClick={() => toggle(todo.id)}>\n            {todo.done ? "✓ " : ""}{todo.text}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}',
    explanation:
      'React state must be updated immutably. Spreading the array and mapping to new objects lets React see the change. A stable key helps React update the correct list item.',
  },
  {
    id: 'python-word-count',
    title: 'Count word frequencies',
    difficulty: 'intermediate',
    topic: 'Dictionaries',
    language: 'Python',
    points: 20,
    estimatedMinutes: 25,
    prompt:
      'Write word_count(text) that returns a dictionary mapping each lowercase word to how many times it appears. Ignore punctuation.',
    requirements: [
      'Lowercase all words',
      'Remove punctuation',
      'Use a dictionary or collections.Counter',
    ],
    hints: [
      'text.lower().split() is a quick first step.',
      'string.punctuation lists all punctuation characters.',
      'dict.get(word, 0) returns a default when a key is missing.',
    ],
    starterCode:
      'def word_count(text):\n    # your code here\n    return {}',
    solution:
      'import re\n\n\ndef word_count(text):\n    words = re.findall(r"[a-z0-9\']+", text.lower())\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return counts',
    explanation:
      'The regular expression extracts word characters and drops punctuation. Using get with a default avoids a KeyError when a word is seen for the first time.',
  },
  {
    id: 'java-palindrome',
    title: 'Check a palindrome',
    difficulty: 'intermediate',
    topic: 'Strings',
    language: 'Java',
    points: 20,
    estimatedMinutes: 25,
    prompt:
      'Write isPalindrome(String text) that ignores spaces, punctuation and letter case. For example, "A man, a plan, a canal: Panama" is a palindrome.',
    requirements: [
      'Ignore non-letter characters',
      'Compare without case sensitivity',
      'Use two pointers or a reversed string',
    ],
    hints: [
      'replaceAll("[^a-zA-Z]", "") removes non-letters.',
      'StringBuilder has a reverse() method.',
      'Two pointers compare characters from the outside in.',
    ],
    starterCode:
      'public class Main {\n  static boolean isPalindrome(String text) {\n    // your code here\n    return false;\n  }\n}',
    solution:
      'public class Main {\n  static boolean isPalindrome(String text) {\n    String clean = text.toLowerCase().replaceAll("[^a-z0-9]", "");\n    int left = 0;\n    int right = clean.length() - 1;\n    while (left < right) {\n      if (clean.charAt(left) != clean.charAt(right)) return false;\n      left++;\n      right--;\n    }\n    return true;\n  }\n}',
    explanation:
      'Normalizing the string first makes the comparison simple. The two-pointer loop checks mirrored characters and stops early at the first mismatch, using O(n) time and O(n) extra space for the normalized string.',
  },
  {
    id: 'c-pointer-swap',
    title: 'Swap two numbers with pointers',
    difficulty: 'intermediate',
    topic: 'Pointers',
    language: 'C',
    points: 20,
    estimatedMinutes: 25,
    prompt:
      'Write void swap(int *a, int *b) that swaps the values pointed to by a and b. Call it from main and print the values before and after.',
    requirements: [
      'Use pointer parameters',
      'Use a temporary variable',
      'Call swap with the addresses of two ints',
    ],
    hints: [
      'Dereference with *a to read or write the pointed-to value.',
      'Call the function as swap(&x, &y).',
    ],
    starterCode:
      '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n  // your code here\n}\n\nint main(void) {\n  int x = 3, y = 9;\n  // call swap and print\n  return 0;\n}',
    solution:
      '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n  int temp = *a;\n  *a = *b;\n  *b = temp;\n}\n\nint main(void) {\n  int x = 3, y = 9;\n  printf("Before: %d %d\\n", x, y);\n  swap(&x, &y);\n  printf("After: %d %d\\n", x, y);\n  return 0;\n}',
    explanation:
      'C passes arguments by value, so a function needs addresses to modify the caller variables. Copying *a to temp prevents losing the first value when assigning *a = *b.',
  },
  {
    id: 'react-search-filter',
    title: 'Live search filter',
    difficulty: 'intermediate',
    topic: 'React Lists',
    language: 'React.js',
    points: 20,
    estimatedMinutes: 30,
    prompt:
      'Create a SearchableList component that filters a list of names as the user types. Show a friendly message when no matches are found.',
    requirements: [
      'Use a controlled input',
      'Filter case-insensitively',
      'Show an empty state',
    ],
    hints: [
      'Store the raw query in state and derive filtered results during render.',
      'name.toLowerCase().includes(query.toLowerCase()) is enough for this exercise.',
    ],
    starterCode:
      'const NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Rohan"];\n\nexport default function SearchableList() {\n  // your code here\n  return null;\n}',
    solution:
      'import { useState } from "react";\n\nconst NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Rohan"];\n\nexport default function SearchableList() {\n  const [query, setQuery] = useState("");\n  const filtered = NAMES.filter((name) => name.toLowerCase().includes(query.toLowerCase()));\n\n  return (\n    <div>\n      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names" />\n      {filtered.length === 0 ? (\n        <p>No names match "{query}".</p>\n      ) : (\n        <ul>{filtered.map((name) => <li key={name}>{name}</li>)}</ul>\n      )}\n    </div>\n  );\n}',
    explanation:
      'The filtered list is derived from state instead of stored separately. That avoids duplicated state getting out of sync when the query changes.',
  },
  {
    id: 'js-memoize',
    title: 'Write a memoize helper',
    difficulty: 'advanced',
    topic: 'Functional JavaScript',
    language: 'HTML, CSS & JavaScript',
    points: 30,
    estimatedMinutes: 40,
    prompt:
      'Implement memoize(fn) that caches results by the first argument. Include a cache.clear() method and explain when memoization is unsafe.',
    requirements: [
      'Return a function with the same behaviour as fn',
      'Cache by the first argument using a Map',
      'Expose cache.clear()',
    ],
    hints: [
      'A Map is safer than a plain object for arbitrary keys.',
      'Use fn.apply(this, args) to preserve the calling context.',
      'Memoization is unsafe for functions with side effects or changing inputs.',
    ],
    starterCode:
      'function memoize(fn) {\n  // your code here\n}',
    solution:
      'function memoize(fn) {\n  const cache = new Map();\n  function memoized(...args) {\n    const key = args[0];\n    if (cache.has(key)) return cache.get(key);\n    const value = fn.apply(this, args);\n    cache.set(key, value);\n    return value;\n  }\n  memoized.cache = {\n    clear: () => cache.clear(),\n  };\n  return memoized;\n}',
    explanation:
      'The closure keeps the cache private. cache.has is important because a cached value could legitimately be undefined. Avoid memoizing functions that depend on time, network calls, or mutable objects not represented by the key.',
  },
  {
    id: 'python-lru-cache',
    title: 'Build an LRU cache',
    difficulty: 'advanced',
    topic: 'Data Structures',
    language: 'Python',
    points: 30,
    estimatedMinutes: 50,
    prompt:
      'Implement an LRUCache class with get(key) and put(key, value) methods and a fixed capacity. Evict the least recently used item when full. Both operations should be O(1).',
    requirements: [
      'Use a dictionary plus a doubly linked list, or OrderedDict',
      'get should mark the key as recently used',
      'put should evict the least recently used key when capacity is exceeded',
    ],
    hints: [
      'Python collections.OrderedDict has move_to_end and popitem(last=False).',
      'Think about what "recently used" means for both get and put.',
    ],
    starterCode:
      'class LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass',
    solution:
      'from collections import OrderedDict\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.items = OrderedDict()\n\n    def get(self, key):\n        if key not in self.items:\n            return -1\n        self.items.move_to_end(key)\n        return self.items[key]\n\n    def put(self, key, value):\n        if key in self.items:\n            self.items.move_to_end(key)\n        self.items[key] = value\n        if len(self.items) > self.capacity:\n            self.items.popitem(last=False)',
    explanation:
      'OrderedDict remembers insertion order and supports O(1) moves and pops. A successful get must move the key to the end so the least recently used key stays at the front. The same applies when a key is updated with put.',
  },
];

export const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

export const challengeTopics = [...new Set(challenges.map((challenge) => challenge.topic))].sort();
