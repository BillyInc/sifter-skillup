/**
 * Python Mastery Program — Simulator Definitions
 * 65 simulators covering every level that lacks one.
 * All feed into SimulatorFactory (mcq | build | match).
 */
import type { SimulatorDef } from '../components/simulators/SimulatorFactory';

export const PYTHON_SIM_DEFS: Record<string, SimulatorDef> = {

  // ── Ch1: pythonIntro ─────────────────────────────────────────────────────────
  pythonIntro: {
    key: 'pythonIntro', title: 'Python Fundamentals', icon: '🐍',
    subtitle: 'Match each Python feature to what it means',
    type: 'match',
    pairs: [
      { left: 'Interpreted', right: 'Executes line-by-line, no compile step' },
      { left: 'Dynamically typed', right: 'Variable types resolved at runtime' },
      { left: 'GIL', right: 'Prevents true multi-thread CPU parallelism' },
      { left: 'CPython', right: 'The reference Python runtime in C' },
      { left: 'pip', right: 'Python package installer' },
    ],
  },

  // ── Ch1: arithmeticOps ───────────────────────────────────────────────────────
  arithmeticOps: {
    key: 'arithmeticOps', title: 'Arithmetic Operators', icon: '🔢',
    subtitle: 'Predict the output — focus on /, //, **, %',
    type: 'mcq',
    questions: [
      { prompt: 'print(7 / 2)', isCode: true, options: ['3', '3.5', '3.0', 'Error'], correct: '3.5', explain: 'In Python 3, / always produces a float. 7/2 = 3.5.' },
      { prompt: 'print(7 // 2)', isCode: true, options: ['3', '3.5', '4', 'Error'], correct: '3', explain: '// is floor division — rounds toward −∞. 7//2 = 3.' },
      { prompt: 'print(-7 // 2)', isCode: true, options: ['-3', '-4', '-3.5', 'Error'], correct: '-4', explain: '// floors toward −∞. -7/2 = -3.5, floor = -4.' },
      { prompt: 'print(10 % 3)', isCode: true, options: ['1', '3', '0', '3.33'], correct: '1', explain: '% is modulo (remainder). 10 = 3×3 + 1, so 10%3 = 1.' },
      { prompt: 'r = (105 - 100) / 100\nprint(r)', isCode: true, options: ['5', '0.05', '0.5', '5.0'], correct: '0.05', explain: 'Simple return formula. (105-100)/100 = 5/100 = 0.05.' },
    ],
  },

  // ── Ch1: stringMethods ──────────────────────────────────────────────────────
  stringMethods: {
    key: 'stringMethods', title: 'String Methods', icon: '📝',
    subtitle: 'Predict the output of each string operation',
    type: 'mcq',
    questions: [
      { prompt: 's = "  AAPL  "\nprint(s.strip().lower())', isCode: true, options: ['AAPL', 'aapl', '  aapl  ', 'aapl '], correct: 'aapl', explain: '.strip() removes surrounding whitespace, .lower() converts to lowercase.' },
      { prompt: 's = "open,high,low,close"\nprint(s.split(",")[2])', isCode: true, options: ['"high"', '"low"', '"close"', 'Error'], correct: '"low"', explain: 'split(",") → ["open","high","low","close"]. Index 2 = "low".' },
      { prompt: 'price = 150.5\nprint(f"${price:.2f}")', isCode: true, options: ['$150.5', '$150.50', '$150', 'Error'], correct: '$150.50', explain: ':.2f formats to exactly 2 decimal places.' },
      { prompt: 'r = 0.0523\nprint(f"{r:.1%}")', isCode: true, options: ['5.2%', '5.23%', '0.1%', '5.3%'], correct: '5.2%', explain: ':.1% multiplies by 100 and shows 1 decimal place. 0.0523 → 5.2%.' },
      { prompt: 's = "Bloomberg"\nprint(s[0], s[-1], len(s))', isCode: true, options: ['B g 9', 'B G 9', 'b g 9', 'Error'], correct: 'B g 9', explain: 's[0]="B", s[-1]="g" (last char), len("Bloomberg")=9.' },
    ],
  },

  // ── Ch1: loopTracer ──────────────────────────────────────────────────────────
  loopTracer: {
    key: 'loopTracer', title: 'Loop Tracer', icon: '🔄',
    subtitle: 'Trace for/while loops and predict output',
    type: 'mcq',
    questions: [
      { prompt: 'for i in range(3):\n    print(i)', isCode: true, options: ['1 2 3', '0 1 2', '0 1 2 3', '1 2'], correct: '0 1 2', explain: 'range(3) produces 0,1,2. Stop value (3) is excluded.' },
      { prompt: 'prices = [100, 102, 98]\nfor i, p in enumerate(prices, 1):\n    print(i)', isCode: true, options: ['0 1 2', '1 2 3', '100 102 98', '1 2 3 4'], correct: '1 2 3', explain: 'enumerate(prices, 1) starts counting from 1.' },
      { prompt: 'total = 0\nfor x in [1,2,3,4,5]:\n    if x % 2 == 0: continue\n    total += x\nprint(total)', isCode: true, options: ['15', '6', '9', '10'], correct: '9', explain: 'continue skips even numbers. Odd numbers: 1+3+5 = 9.' },
      { prompt: 'for x in [1,2,3,4,5]:\n    if x == 3: break\nprint(x)', isCode: true, options: ['3', '5', '2', 'Error'], correct: '3', explain: 'break exits when x==3. The loop variable x retains its last value: 3.' },
      { prompt: 'print([x**2 for x in range(4) if x%2==0])', isCode: true, options: ['[0, 4]', '[0, 1, 4, 9]', '[4, 16]', '[1, 9]'], correct: '[0, 4]', explain: 'Even x in range(4): 0 and 2. Squares: 0²=0, 2²=4.' },
    ],
  },

  // ── Ch1: functionCallTracer ──────────────────────────────────────────────────
  functionCallTracer: {
    key: 'functionCallTracer', title: 'Function Call Tracer', icon: '📞',
    subtitle: 'Predict what each function call returns or prints',
    type: 'mcq',
    questions: [
      { prompt: 'def add(x, y=10):\n    return x + y\nprint(add(5))', isCode: true, options: ['5', '10', '15', 'Error'], correct: '15', explain: 'y defaults to 10. add(5) → 5+10 = 15.' },
      { prompt: 'def greet(name):\n    print(f"Hi {name}")\n\nx = greet("Alice")\nprint(x)', isCode: true, options: ['Hi Alice\nNone', 'Hi Alice\nHi Alice', 'None', 'Hi Alice'], correct: 'Hi Alice\nNone', explain: 'greet() uses print (side effect) but has no return → returns None. print(x) prints None.' },
      { prompt: 'def calc(a, b, c=1):\n    return a * b + c\nprint(calc(2, 3, c=5))', isCode: true, options: ['11', '7', '10', '6'], correct: '11', explain: '2*3 + 5 = 6 + 5 = 11.' },
      { prompt: 'def stats(data):\n    return min(data), max(data)\nlo, hi = stats([3,1,4,1,5])\nprint(lo, hi)', isCode: true, options: ['1 5', '3 4', '1 4', 'Error'], correct: '1 5', explain: 'Function returns a tuple (1, 5) which unpacks to lo=1, hi=5.' },
      { prompt: 'def annualise(r, n=252):\n    return (1 + r)**n - 1\nprint(round(annualise(0, 252), 4))', isCode: true, options: ['0.0', '1.0', '-1.0', 'Error'], correct: '0.0', explain: '(1+0)^252 - 1 = 1-1 = 0. A daily return of 0 gives 0 annualised.' },
    ],
  },

  // ── Ch1: lambdaTracer ────────────────────────────────────────────────────────
  lambdaTracer: {
    key: 'lambdaTracer', title: 'Lambda & sorted()', icon: 'λ',
    subtitle: 'Predict outputs — focus on the key= pattern',
    type: 'mcq',
    questions: [
      { prompt: 'f = lambda x: x ** 2\nprint(f(4))', isCode: true, options: ['4', '8', '16', 'Error'], correct: '16', explain: 'Lambda squares its argument. f(4) = 4² = 16.' },
      { prompt: 'data = [("AAPL", 0.05), ("GOOG", 0.12), ("TSLA", -0.03)]\nbest = max(data, key=lambda x: x[1])\nprint(best[0])', isCode: true, options: ['AAPL', 'GOOG', 'TSLA', 'Error'], correct: 'GOOG', explain: 'max() uses key=lambda x: x[1] (the return). GOOG has the highest return (0.12).' },
      { prompt: 'tickers = ["NVDA","AAPL","MSFT","TSLA"]\nprint(sorted(tickers, key=len))', isCode: true, options: ['["AAPL","MSFT","NVDA","TSLA"]', '["NVDA","AAPL","MSFT","TSLA"]', 'Error', '["TSLA","MSFT","NVDA","AAPL"]'], correct: '["NVDA","AAPL","MSFT","TSLA"]', explain: 'All have length 4. sorted is stable — equal elements keep original order.' },
      { prompt: 'strikes = [90, 100, 110, 120]\nspot = 107\nclosest = min(strikes, key=lambda k: abs(k-spot))\nprint(closest)', isCode: true, options: ['100', '107', '110', '90'], correct: '110', explain: '|90-107|=17, |100-107|=7, |110-107|=3, |120-107|=13. Minimum distance is 110.' },
      { prompt: 'add = lambda x, y=0: x + y\nprint(add(5), add(5, 3))', isCode: true, options: ['5 8', '0 8', '5 5', 'Error'], correct: '5 8', explain: 'Lambdas support default arguments. add(5)=5+0=5, add(5,3)=5+3=8.' },
    ],
  },

  // ── Ch1: ch1BossBuilder ──────────────────────────────────────────────────────
  ch1BossBuilder: {
    key: 'ch1BossBuilder', title: 'Ch1 Boss: Write It', icon: '🏆',
    subtitle: 'Write Python from spec — functions, control flow, lambda',
    type: 'build',
    buildQuestions: [
      { prompt: 'Write annualise(r, n=252): converts daily return r to annualised return.', answer: 'return (1 + r) ** n - 1', hint: 'return (1 + r) ** n - 1', explain: 'Compound interest formula. (1+daily)^trading_days - 1.' },
      { prompt: 'Write is_weekday(dow) returning True for Monday–Friday (0=Mon, 6=Sun).', answer: 'return dow < 5', hint: 'return dow < 5', explain: 'Mon=0 to Fri=4 are all < 5. One comparison covers all five days.' },
      { prompt: 'Using sorted() and a lambda, sort this list by last character:\n["TSLA","AAPL","GOOG","MSFT"]\nWrite the expression.', answer: 'sorted(["TSLA","AAPL","GOOG","MSFT"], key=lambda x: x[-1])', hint: 'sorted(["TSLA","AAPL","GOOG","MSFT"], key=lambda x: x[-1])', explain: 'x[-1] accesses the last character. Sorts by A, G, L, T → AAPL, GOOG, MSFT, TSLA.' },
      { prompt: 'Write clamp(x, lo, hi) that returns x clamped between lo and hi.', answer: 'return max(lo, min(hi, x))', hint: 'return max(lo, min(hi, x))', explain: 'min(hi, x) caps at upper bound. max(lo, ...) floors at lower bound.' },
      { prompt: 'Fix this function:\ndef withdraw(amount):\n    balance -= amount\n\nWrite the corrected version with balance as a parameter.', answer: 'def withdraw(balance, amount):\n    return balance - amount', hint: 'def withdraw(balance, amount):\n    return balance - amount', explain: 'Pass balance as argument, return the new value. Avoids the global/scope bug entirely.' },
    ],
  },

  // ── Ch2: tupleTracer ─────────────────────────────────────────────────────────
  tupleTracer: {
    key: 'tupleTracer', title: 'Tuple Tracer', icon: '📦',
    subtitle: 'Tuples, unpacking, and immutability',
    type: 'mcq',
    questions: [
      { prompt: 't = (1, 2, 3)\nt[0] = 99', isCode: true, options: ['t is now (99,2,3)', 'TypeError', 'Works silently', 'AttributeError'], correct: 'TypeError', explain: 'Tuples are immutable. Any attempt to modify raises TypeError.' },
      { prompt: 'a, *b = (1, 2, 3, 4)\nprint(a, b)', isCode: true, options: ['1 [2,3,4]', '1 (2,3,4)', '[1] [2,3,4]', 'Error'], correct: '1 [2,3,4]', explain: 'Extended unpacking: a=1, *b captures the rest as a list [2,3,4].' },
      { prompt: 'a, b = 10, 20\na, b = b, a\nprint(a, b)', isCode: true, options: ['10 20', '20 10', '10 10', 'Error'], correct: '20 10', explain: 'Tuple swap: right side creates tuple (20,10), then unpacks. No temp variable needed.' },
      { prompt: 't = (1, [2, 3])\nt[1].append(4)\nprint(t)', isCode: true, options: ['(1,[2,3])', '(1,[2,3,4])', 'TypeError', '(1,2,3,4)'], correct: '(1,[2,3,4])', explain: 'Tuple is immutable but the list inside it is mutable. You cannot replace t[1], but you can mutate the list t[1] points to.' },
      { prompt: 'from collections import namedtuple\nBar = namedtuple("Bar",["open","close"])\nb = Bar(100.0, 103.5)\nprint(b.close - b.open)', isCode: true, options: ['3.5', '-3.5', 'Error', '203.5'], correct: '3.5', explain: 'Named tuples allow attribute access. close=103.5, open=100.0. Difference = 3.5.' },
    ],
  },

  // ── Ch2: setOpsTracer ────────────────────────────────────────────────────────
  setOpsTracer: {
    key: 'setOpsTracer', title: 'Set Operations', icon: '🔵',
    subtitle: 'Set algebra on instrument universes',
    type: 'mcq',
    questions: [
      { prompt: 's = {1, 2, 2, 3, 3, 3}\nprint(len(s))', isCode: true, options: ['6', '3', '1', 'Error'], correct: '3', explain: 'Sets store unique elements only. {1,2,3}.' },
      { prompt: 'a = {"AAPL","GOOG"}\nb = {"GOOG","MSFT"}\nprint(a & b)', isCode: true, options: ["{'GOOG'}", "{'AAPL','MSFT'}", "{'AAPL','GOOG','MSFT'}", 'Error'], correct: "{'GOOG'}", explain: '& is intersection — elements in both sets. Only GOOG is in both.' },
      { prompt: 'a = {"AAPL","GOOG"}\nb = {"GOOG","MSFT"}\nprint(a - b)', isCode: true, options: ["{'AAPL'}", "{'MSFT'}", "{'AAPL','MSFT'}", "{}"], correct: "{'AAPL'}", explain: 'a - b is difference — elements in a but not b. AAPL is in a but not b.' },
      { prompt: 'universe = {"AAPL","GOOG","TSLA"}\nprint("NVDA" in universe)', isCode: true, options: ['True', 'False', 'None', 'Error'], correct: 'False', explain: 'NVDA is not in the set. O(1) membership test.' },
      { prompt: 's = set()\nprint(type(s), type({}))', isCode: true, options: ["set dict", "set set", "dict set", "dict dict"], correct: "set dict", explain: 'set() creates an empty set. {} creates an empty dict. There is no {} literal for empty set.' },
    ],
  },

  // ── Ch2: generatorTracer ─────────────────────────────────────────────────────
  generatorTracer: {
    key: 'generatorTracer', title: 'Generators & Iterators', icon: '⏩',
    subtitle: 'Lazy evaluation — predict what gets produced',
    type: 'mcq',
    questions: [
      { prompt: 'def gen():\n    yield 1\n    yield 2\n    yield 3\ng = gen()\nprint(next(g), next(g))', isCode: true, options: ['1 2', '1 3', '2 3', 'Error'], correct: '1 2', explain: 'Each next() advances the generator to the next yield. First two calls give 1, then 2.' },
      { prompt: 'gen = (x**2 for x in range(5))\nprint(sum(gen))', isCode: true, options: ['30', '25', '10', 'Error'], correct: '30', explain: 'Generator expression: 0+1+4+9+16=30. Computed lazily, never builds a list.' },
      { prompt: 'def counter():\n    n = 0\n    while True:\n        yield n\n        n += 1\ng = counter()\nprint([next(g) for _ in range(4)])', isCode: true, options: ['[0,1,2,3]', '[1,2,3,4]', '[0,0,0,0]', 'Error'], correct: '[0,1,2,3]', explain: 'Infinite generator. Each next() resumes from where yield paused. Gives 0,1,2,3.' },
      { prompt: 'r = range(10)\nprint(type(r), len(r))', isCode: true, options: ['range 10', 'list 10', 'generator 10', 'Error'], correct: 'range 10', explain: 'range() returns a range object (not a list). It supports len() and is memory efficient.' },
      { prompt: 'prices = [100, 102, 101]\ntotal = sum(p for p in prices if p > 100)\nprint(total)', isCode: true, options: ['303', '203', '201', '102'], correct: '203', explain: 'Generator expression filters prices > 100: [102, 101]. Sum = 203.' },
    ],
  },

  // ── Ch2: collectionsTracer ───────────────────────────────────────────────────
  collectionsTracer: {
    key: 'collectionsTracer', title: 'collections Module', icon: '🗃️',
    subtitle: 'deque, defaultdict, Counter — predict the output',
    type: 'mcq',
    questions: [
      { prompt: 'from collections import deque\nd = deque([1,2,3], maxlen=3)\nd.append(4)\nprint(list(d))', isCode: true, options: ['[1,2,3,4]', '[2,3,4]', '[1,2,3]', '[4,1,2]'], correct: '[2,3,4]', explain: 'maxlen=3: when full, appending right drops leftmost element. 1 is dropped.' },
      { prompt: 'from collections import defaultdict\nd = defaultdict(int)\nd["x"] += 5\nd["x"] += 3\nprint(d["x"])', isCode: true, options: ['5', '3', '8', 'KeyError'], correct: '8', explain: 'defaultdict(int) initialises missing keys to 0. 0+5=5, 5+3=8.' },
      { prompt: 'from collections import Counter\nc = Counter(["A","B","A","C","A","B"])\nprint(c.most_common(1))', isCode: true, options: ["[('A',3)]", "[('A',3),('B',2)]", "[('B',2)]", "('A',3)"], correct: "[('A',3)]", explain: 'most_common(1) returns the single most frequent element as a list of one tuple.' },
      { prompt: 'from collections import deque\nd = deque([1,2,3])\nd.appendleft(0)\nprint(d[0])', isCode: true, options: ['0', '1', '3', 'Error'], correct: '0', explain: 'appendleft() adds to the left end. d becomes [0,1,2,3]. d[0] = 0.' },
      { prompt: 'from collections import defaultdict\nd = defaultdict(list)\nfor t,v in [("A",1),("B",2),("A",3)]: d[t].append(v)\nprint(d["A"])', isCode: true, options: ['[1,3]', '[1,2,3]', '[3]', 'KeyError'], correct: '[1,3]', explain: 'Groups values by key. "A" appears twice with values 1 and 3.' },
    ],
  },

  // ── Ch2: sortingTracer ───────────────────────────────────────────────────────
  sortingTracer: {
    key: 'sortingTracer', title: 'Sorting & bisect', icon: '📊',
    subtitle: 'sorted(), bisect, and multi-key sorts',
    type: 'mcq',
    questions: [
      { prompt: 'data = [(3,"c"),(1,"a"),(2,"b")]\nprint(sorted(data))', isCode: true, options: ['[(1,"a"),(2,"b"),(3,"c")]', '[(3,"c"),(1,"a"),(2,"b")]', 'Error', '["a","b","c"]'], correct: '[(1,"a"),(2,"b"),(3,"c")]', explain: 'Tuples sort lexicographically — first by element 0, then element 1.' },
      { prompt: 'import bisect\nstrikes = [90,95,100,105,110]\nprint(bisect.bisect_left(strikes, 103))', isCode: true, options: ['2', '3', '4', '5'], correct: '3', explain: 'bisect_left finds insertion point for 103. It goes between 100 (index 2) and 105 (index 3), so index 3.' },
      { prompt: 'strategies = [{"name":"A","sharpe":1.2},{"name":"B","sharpe":2.1}]\nbest = sorted(strategies, key=lambda s: s["sharpe"], reverse=True)\nprint(best[0]["name"])', isCode: true, options: ['A', 'B', 'Error', 'None'], correct: 'B', explain: 'Sorted descending by Sharpe. B (2.1) > A (1.2). best[0] is B.' },
      { prompt: 'lst = [3,1,4,1,5]\nlst.sort()\nprint(lst)', isCode: true, options: ['[1,1,3,4,5]', '[3,1,4,1,5]', '[5,4,3,1,1]', 'None'], correct: '[1,1,3,4,5]', explain: '.sort() sorts in place and returns None. The list itself is now sorted.' },
      { prompt: 'import heapq\ndata = [5,1,3,2,4]\nprint(heapq.nsmallest(3, data))', isCode: true, options: ['[1,2,3]', '[1,3,5]', '[5,4,3]', '[2,3,4]'], correct: '[1,2,3]', explain: 'nsmallest(3) returns the 3 smallest values in sorted order.' },
    ],
  },

  // ── Ch2: fileIOBuilder ───────────────────────────────────────────────────────
  fileIOBuilder: {
    key: 'fileIOBuilder', title: 'File I/O Patterns', icon: '📂',
    subtitle: 'Choose the right open mode and method',
    type: 'match',
    pairs: [
      { left: '"r"', right: 'Read only — raises FileNotFoundError if missing' },
      { left: '"w"', right: 'Write — creates file or truncates existing' },
      { left: '"a"', right: 'Append — writes to end of existing file' },
      { left: 'f.readlines()', right: 'Returns list of all lines including \\n' },
      { left: 'json.load(f)', right: 'Parses JSON from open file object' },
    ],
  },

  // ── Ch2: ch2BossBuilder ──────────────────────────────────────────────────────
  ch2BossBuilder: {
    key: 'ch2BossBuilder', title: 'Ch2 Boss: Data Structures', icon: '🏆',
    subtitle: 'Write data structure operations from spec',
    type: 'build',
    buildQuestions: [
      { prompt: 'Given prices = [100,102,101,105,103], write a one-liner using zip to compute simple daily returns as a list.', answer: '[(p2-p1)/p1 for p1,p2 in zip(prices, prices[1:])]', hint: '[(p2-p1)/p1 for p1,p2 in zip(prices, prices[1:])]', explain: 'zip(prices, prices[1:]) pairs consecutive elements. Comprehension computes each return.' },
      { prompt: 'Use defaultdict to count trades per ticker from:\ntrades = [("AAPL",100),("GOOG",50),("AAPL",75)]\nWrite the count dict expression.', answer: "from collections import defaultdict\nd=defaultdict(int)\nfor t,_ in trades: d[t]+=1", hint: "from collections import defaultdict\nd=defaultdict(int)\nfor t,_ in trades: d[t]+=1", explain: 'defaultdict(int) initialises missing keys to 0. Increment on each occurrence.' },
      { prompt: 'Write one expression: tickers in holdings but NOT in universe.\nholdings = {"AAPL","NVDA","TSLA"}\nuniverse = {"AAPL","GOOG","MSFT","TSLA"}', answer: 'holdings - universe', hint: 'holdings - universe', explain: 'Set difference: elements in holdings that are not in universe. Result: {"NVDA"}.' },
      { prompt: 'A deque(maxlen=3) receives appendages: 1,2,3,4,5. What does list(d) return after all appends?', answer: '[3, 4, 5]', hint: '[3, 4, 5]', explain: 'maxlen=3 drops the oldest (leftmost) on each new append. After 1,2,3,4,5: only last 3 remain.' },
      { prompt: 'Write a set comprehension of active tickers from:\ntrades = [("AAPL","open"),("GOOG","closed"),("TSLA","open")]\nwhere status is "open".', answer: '{t for t,s in trades if s=="open"}', hint: '{t for t,s in trades if s=="open"}', explain: 'Set comprehension with filter. Produces {"AAPL","TSLA"} (unordered).' },
    ],
  },

  // ── Ch3: closureTracer ───────────────────────────────────────────────────────
  closureTracer: {
    key: 'closureTracer', title: 'Closure Tracer', icon: '🔒',
    subtitle: 'Closures capture enclosing scope — trace the values',
    type: 'mcq',
    questions: [
      { prompt: 'def make_adder(n):\n    return lambda x: x + n\nadd5 = make_adder(5)\nprint(add5(3))', isCode: true, options: ['3', '5', '8', 'Error'], correct: '8', explain: 'make_adder(5) returns a lambda that adds 5 to its argument. add5(3) = 3+5 = 8.' },
      { prompt: 'def counter():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\nc = counter()\nprint(c(), c(), c())', isCode: true, options: ['1 2 3', '0 1 2', '1 1 1', 'Error'], correct: '1 2 3', explain: 'nonlocal allows inc() to modify counter\'s count. Each call increments and returns.' },
      { prompt: 'funcs = [lambda x: x+i for i in range(3)]\nprint(funcs[0](0))', isCode: true, options: ['0', '2', '1', 'Error'], correct: '2', explain: 'Classic closure trap. All lambdas capture the same i, which is 2 after the loop finishes.' },
      { prompt: 'def make_signal(lookback, threshold):\n    def signal(prices):\n        ret = prices[-1]/prices[-lookback]-1\n        return 1 if ret > threshold else -1\n    return signal\ns = make_signal(2, 0.02)\nprint(s([100, 103]))', isCode: true, options: ['1', '-1', '0', 'Error'], correct: '1', explain: '103/100-1=0.03 > 0.02 threshold. Returns 1 (buy signal).' },
      { prompt: 'def outer(x):\n    def inner():\n        return x * 2\n    return inner\nf = outer(10)\nx = 99\nprint(f())', isCode: true, options: ['198', '20', '99', 'Error'], correct: '20', explain: 'The closure captures x=10 from outer\'s scope at creation time. The global x=99 is irrelevant.' },
    ],
  },

  // ── Ch3: functoolsTracer ─────────────────────────────────────────────────────
  functoolsTracer: {
    key: 'functoolsTracer', title: 'functools Tracer', icon: '⚙️',
    subtitle: 'cache, partial, reduce — predict the results',
    type: 'mcq',
    questions: [
      { prompt: 'from functools import cache\n@cache\ndef fib(n):\n    if n<2: return n\n    return fib(n-1)+fib(n-2)\nprint(fib(7))', isCode: true, options: ['13', '21', '8', '34'], correct: '13', explain: 'fib(7)=13. With @cache each value is computed once. fib: 0,1,1,2,3,5,8,13.' },
      { prompt: 'from functools import partial\ndef power(base, exp):\n    return base**exp\nsquare = partial(power, exp=2)\nprint(square(5))', isCode: true, options: ['10', '25', '5', 'Error'], correct: '25', explain: 'partial fixes exp=2. square(5) = power(5, exp=2) = 5²=25.' },
      { prompt: 'from functools import reduce\nresult = reduce(lambda a,b: a*b, [1,2,3,4,5])\nprint(result)', isCode: true, options: ['15', '120', '24', '5'], correct: '120', explain: 'reduce applies cumulatively: 1*2=2, 2*3=6, 6*4=24, 24*5=120.' },
      { prompt: 'from functools import lru_cache\n@lru_cache(maxsize=2)\ndef f(x): return x**2\nf(1); f(2); f(3)\nprint(f.cache_info().currsize)', isCode: true, options: ['1', '2', '3', 'Error'], correct: '2', explain: 'maxsize=2 keeps at most 2 cached results. After 3 calls, cache evicted 1 (LRU). currsize=2.' },
      { prompt: 'from functools import partial\nlog_ret = partial(lambda s,e: (e-s)/s, e=105)\nprint(round(log_ret(s=100), 4))', isCode: true, options: ['0.05', '0.5', '5.0', 'Error'], correct: '0.05', explain: 'partial fixes e=105. log_ret(s=100) = (105-100)/100 = 0.05.' },
    ],
  },

  // ── Ch3: mapFilterZipTracer ──────────────────────────────────────────────────
  mapFilterZipTracer: {
    key: 'mapFilterZipTracer', title: 'map / filter / zip', icon: '🔗',
    subtitle: 'Higher-order functions — predict the output',
    type: 'mcq',
    questions: [
      { prompt: 'prices = [100, 102, 98, 105]\nreturns = list(map(lambda p: (p-100)/100, prices))\nprint(returns[1])', isCode: true, options: ['0.02', '2.0', '-0.02', '102'], correct: '0.02', explain: '(102-100)/100 = 0.02. map applies the lambda to every element.' },
      { prompt: 'data = [-0.02, 0.05, -0.01, 0.08]\npos = list(filter(lambda x: x>0, data))\nprint(len(pos))', isCode: true, options: ['2', '3', '4', '1'], correct: '2', explain: 'filter keeps elements where function returns True. 0.05 and 0.08 are positive. len=2.' },
      { prompt: 'a = [1,2,3]\nb = [10,20]\nprint(list(zip(a,b)))', isCode: true, options: ['[(1,10),(2,20),(3,None)]', '[(1,10),(2,20)]', '[(1,10,2,20)]', 'Error'], correct: '[(1,10),(2,20)]', explain: 'zip stops at the shortest iterable. a has 3 elements, b has 2. Result has 2 pairs.' },
      { prompt: 'p = [100,101,102]\nfor i,(a,b) in enumerate(zip(p,p[1:])):\n    print(i, b-a)', isCode: true, options: ['0 1\n1 1', '1 1\n2 1', '0 101\n1 102', 'Error'], correct: '0 1\n1 1', explain: 'zip(p, p[1:]) pairs (100,101),(101,102). enumerate starts at 0. Differences are both 1.' },
      { prompt: 'print(all(x>0 for x in [1,2,0,4]))', isCode: true, options: ['True', 'False', 'None', 'Error'], correct: 'False', explain: 'all() returns True only if every element is truthy. 0 is falsy, so all() returns False.' },
    ],
  },

  // ── Ch3: errorHandlingBuilder ────────────────────────────────────────────────
  errorHandlingBuilder: {
    key: 'errorHandlingBuilder', title: 'Error Handling', icon: '🛡️',
    subtitle: 'Match the situation to the correct exception and pattern',
    type: 'match',
    pairs: [
      { left: 'Key not found in dict', right: 'KeyError' },
      { left: 'Wrong type passed to function', right: 'TypeError' },
      { left: 'Value out of valid range', right: 'ValueError' },
      { left: 'Cleanup that must ALWAYS run', right: 'finally block' },
      { left: 'Catch any non-system exception', right: 'except Exception' },
    ],
  },

  // ── Ch3: exceptionDesigner ───────────────────────────────────────────────────
  exceptionDesigner: {
    key: 'exceptionDesigner', title: 'Exception Design', icon: '🏗️',
    subtitle: 'Design a custom exception hierarchy for a trading system',
    type: 'mcq',
    questions: [
      { prompt: 'Which base class should all your custom exceptions inherit from?', options: ['BaseException', 'Exception', 'RuntimeError', 'object'], correct: 'Exception', explain: 'Exception is the right base for application-level errors. BaseException includes SystemExit and KeyboardInterrupt which you should not catch accidentally.' },
      { prompt: 'class InsufficientMargin(ExecutionError): ...\nYou write: except ExecutionError:\nDoes this catch InsufficientMargin?', options: ['Yes', 'No', 'Only with super()', 'Depends on Python version'], correct: 'Yes', explain: 'Python exception handling catches the specified class AND all its subclasses. InsufficientMargin IS-A ExecutionError.' },
      { prompt: 'You write: except Exception: pass\nIn a trade execution function. What is the risk?', options: ['Slower execution', 'Silent failure — errors are hidden', 'Memory leak', 'No risk'], correct: 'Silent failure — errors are hidden', explain: 'Swallowing exceptions hides bugs. A failed order submission looks like success. Always log or re-raise.' },
      { prompt: 'To add context to a custom exception (e.g., required vs available), you should:', options: ['Use a global variable', 'Add __init__ with extra attributes', 'Use a string format', 'Use a dict'], correct: 'Add __init__ with extra attributes', explain: 'def __init__(self, required, available): self.required=required; super().__init__(f"Need {required}, have {available}"). Caller can access e.required.' },
      { prompt: 'To re-raise an exception after logging it:\ntry:\n    ...\nexcept Exception as e:\n    log(e)\n    ???', options: ['raise e', 'raise', 'raise Exception(e)', 'pass'], correct: 'raise', explain: 'Bare raise re-raises the caught exception with its original traceback intact. raise e creates a new exception, losing the original traceback context.' },
    ],
  },

  // ── Ch3: contextManagerTracer ────────────────────────────────────────────────
  contextManagerTracer: {
    key: 'contextManagerTracer', title: 'Context Managers', icon: '📋',
    subtitle: 'Predict execution order and cleanup behaviour',
    type: 'mcq',
    questions: [
      { prompt: 'with open("f.txt","w") as f:\n    f.write("hello")\n# f is now?', options: ['Still open', 'Closed automatically', 'None', 'Error'], correct: 'Closed automatically', explain: '__exit__ is called on leaving the with block, closing the file. Even if an exception occurs.' },
      { prompt: 'from contextlib import contextmanager\n@contextmanager\ndef cm():\n    print("enter")\n    yield\n    print("exit")\nwith cm():\n    print("body")', isCode: true, options: ['enter\nbody\nexit', 'body\nenter\nexit', 'enter\nexit\nbody', 'Error'], correct: 'enter\nbody\nexit', explain: 'Code before yield runs on entry. yield pauses for the with body. Code after yield runs on exit.' },
      { prompt: 'with open("a") as f1, open("b") as f2:\n# is equivalent to:', options: ['with open("a") as f1:\n    with open("b") as f2:', 'with open("a","b") as f:', 'open("a"); open("b")', 'Error'], correct: 'with open("a") as f1:\n    with open("b") as f2:', explain: 'Multiple context managers in one with are nested automatically. Syntactic sugar for nested withs.' },
      { prompt: 'try:\n    with open("missing.txt") as f:\n        data = f.read()\nexcept FileNotFoundError:\n    data = ""\nprint(data)', isCode: true, options: ['""', 'Error', 'None', 'Crashes'], correct: '""', explain: 'FileNotFoundError is caught. data="" from except block. with block never completes but exception propagates to try/except.' },
      { prompt: 'What does __exit__ return True vs False mean?', options: ['True=success, False=failure', 'True=suppress exception, False=propagate it', 'True=close, False=keep open', 'No difference'], correct: 'True=suppress exception, False=propagate it', explain: 'If __exit__ returns True, any exception that occurred in the with block is suppressed. Return False (or None) to let it propagate.' },
    ],
  },

  // ── Ch3: recursionTracer ─────────────────────────────────────────────────────
  recursionTracer: {
    key: 'recursionTracer', title: 'Recursion Tracer', icon: '🔁',
    subtitle: 'Trace recursive calls and memoisation',
    type: 'mcq',
    questions: [
      { prompt: 'def fact(n):\n    if n<=1: return 1\n    return n * fact(n-1)\nprint(fact(5))', isCode: true, options: ['24', '120', '5', 'Error'], correct: '120', explain: '5×4×3×2×1 = 120.' },
      { prompt: 'Without @cache, how many calls does fib(6) make?', options: ['6', '13', '25', '63'], correct: '25', explain: 'Naive fib has exponential call tree. fib(6) makes 25 calls — many values recomputed multiple times.' },
      { prompt: 'With @cache, how many unique fib() calls are made for fib(100)?', options: ['100', '101', '200', '2^100'], correct: '101', explain: '@cache memoises results. Each of fib(0) through fib(100) is computed exactly once = 101 calls.' },
      { prompt: 'What is Python\'s default recursion limit?', options: ['100', '1000', '10000', 'Unlimited'], correct: '1000', explain: 'sys.getrecursionlimit() = 1000 by default. Deep recursion raises RecursionError (stack overflow).' },
      { prompt: 'def binary_search(arr, t, lo=0, hi=None):\n    if hi is None: hi=len(arr)-1\n    if lo>hi: return -1\n    mid=(lo+hi)//2\n    if arr[mid]==t: return mid\n    elif arr[mid]<t: return binary_search(arr,t,mid+1,hi)\n    else: return binary_search(arr,t,lo,mid-1)\nprint(binary_search([1,3,5,7,9], 5))', isCode: true, options: ['2', '3', '1', '-1'], correct: '2', explain: 'Index of 5 in [1,3,5,7,9] is 2.' },
    ],
  },

  // ── Ch3: argsKwargsTracer ────────────────────────────────────────────────────
  argsKwargsTracer: {
    key: 'argsKwargsTracer', title: '*args & **kwargs', icon: '📦',
    subtitle: 'Argument packing and unpacking',
    type: 'mcq',
    questions: [
      { prompt: 'def f(*args):\n    return sum(args)\nprint(f(1,2,3,4))', isCode: true, options: ['Error', '10', '[1,2,3,4]', '(1,2,3,4)'], correct: '10', explain: '*args collects positional args as a tuple. sum((1,2,3,4)) = 10.' },
      { prompt: 'def f(**kwargs):\n    return kwargs\nprint(f(a=1, b=2))', isCode: true, options: ["{'a':1,'b':2}", "(a=1,b=2)", "[1,2]", "Error"], correct: "{'a':1,'b':2}", explain: '**kwargs collects keyword arguments as a dict.' },
      { prompt: 'args = (3, 4)\nprint(max(*args))', isCode: true, options: ['(3,4)', '4', '3', 'Error'], correct: '4', explain: '*args unpacks the tuple as positional arguments. max(3, 4) = 4.' },
      { prompt: 'def f(a, *, b):\n    return a + b\nprint(f(1, 2))', isCode: true, options: ['3', 'Error', '(1,2)', '12'], correct: 'Error', explain: '* forces b to be keyword-only. f(1, 2) passes 2 as positional but b must be a keyword arg. TypeError.' },
      { prompt: 'def log(*msgs, sep=" "):\n    print(sep.join(str(m) for m in msgs))\nlog("price", 150.5, sep=": ")', isCode: true, options: ['price 150.5', 'price: 150.5', 'Error', 'price,150.5'], correct: 'price: 150.5', explain: '*msgs captures ("price",150.5). sep=": " is keyword-only. join produces "price: 150.5".' },
    ],
  },

  // ── Ch3: ch3BossBuilder ──────────────────────────────────────────────────────
  ch3BossBuilder: {
    key: 'ch3BossBuilder', title: 'Ch3 Boss: Functional Patterns', icon: '🏆',
    subtitle: 'Write decorators, closures, and error handling from spec',
    type: 'build',
    buildQuestions: [
      { prompt: 'Write a decorator @validate_positive that raises ValueError if any positional argument <= 0.', answer: 'def validate_positive(func):\n    def wrapper(*args, **kwargs):\n        if any(a <= 0 for a in args if isinstance(a,(int,float))):\n            raise ValueError("All args must be positive")\n        return func(*args, **kwargs)\n    return wrapper', hint: 'def validate_positive(func):\n    def wrapper(*args, **kwargs):\n        if any(a<=0 for a in args if isinstance(a,(int,float))): raise ValueError(...)\n        return func(*args,**kwargs)\n    return wrapper', explain: 'Decorator wraps the function. Iterates args, checks numeric ones. Raises before calling original.' },
      { prompt: 'Write make_threshold_filter(threshold) — a closure that returns a function filtering a list to values above threshold.', answer: 'def make_threshold_filter(t):\n    return lambda data: [x for x in data if x > t]', hint: 'def make_threshold_filter(t):\n    return lambda data: [x for x in data if x > t]', explain: 'Closure captures t from enclosing scope. Returned lambda uses it in the filter comprehension.' },
      { prompt: 'Using partial, create log_return from:\ndef compute_return(start, end, method="simple"):\n    if method=="log": return math.log(end/start)\n    return (end-start)/start', answer: 'from functools import partial\nlog_return = partial(compute_return, method="log")', hint: 'from functools import partial\nlog_return = partial(compute_return, method="log")', explain: 'partial fixes method="log". log_return(100, 105) calls compute_return(100, 105, method="log").' },
      { prompt: 'Write a context manager using @contextmanager that prints "start" on enter and "end" on exit, suppressing any ValueError raised inside.', answer: 'from contextlib import contextmanager\n@contextmanager\ndef guarded():\n    print("start")\n    try: yield\n    except ValueError: pass\n    finally: print("end")', hint: 'from contextlib import contextmanager\n@contextmanager\ndef guarded():\n    print("start")\n    try: yield\n    except ValueError: pass\n    finally: print("end")', explain: 'try/except inside the generator suppresses ValueError. finally ensures "end" always prints.' },
      { prompt: 'Why does @lru_cache fail on a function that takes a pandas DataFrame? Write the fix using a hashable key.', answer: 'DataFrames are unhashable. Fix: cache on a hashable id instead.\ndef cached_fn(df_id): # use string or tuple key\n    return _compute(lookup[df_id])', hint: 'DataFrames are unhashable. Cache on df id (string/tuple), not the DataFrame itself.', explain: 'lru_cache stores args as dict keys. Dict keys must be hashable. DataFrames are not hashable.' },
    ],
  },

  // ── Ch4: classAttrTracer ─────────────────────────────────────────────────────
  classAttrTracer: {
    key: 'classAttrTracer', title: 'Class vs Instance Attributes', icon: '🏛️',
    subtitle: 'Class-level vs instance-level — predict the behaviour',
    type: 'mcq',
    questions: [
      { prompt: 'class A:\n    x = 0\na1 = A(); a2 = A()\na1.x = 10\nprint(a2.x)', isCode: true, options: ['0', '10', 'Error', 'None'], correct: '0', explain: 'a1.x = 10 creates an instance attribute on a1, shadowing the class attr. a2 still reads the class attr x=0.' },
      { prompt: 'class A:\n    count = 0\n    def __init__(self):\n        A.count += 1\nA(); A(); A()\nprint(A.count)', isCode: true, options: ['0', '1', '3', 'Error'], correct: '3', explain: 'Each __init__ increments the class attribute. Three instances created → count=3.' },
      { prompt: 'class Bad:\n    items = []\nb1 = Bad(); b2 = Bad()\nb1.items.append(99)\nprint(b2.items)', isCode: true, options: ['[]', '[99]', 'Error', 'None'], correct: '[99]', explain: 'Mutable class attr trap: items is shared across all instances. Mutating via b1 affects b2.' },
      { prompt: 'class T:\n    @staticmethod\n    def is_valid(side):\n        return side in {"buy","sell"}\nprint(T.is_valid("buy"), T().is_valid("hold"))', isCode: true, options: ['True True', 'True False', 'False True', 'Error'], correct: 'True False', explain: '@staticmethod — no self/cls. Callable on class or instance. "buy" is valid, "hold" is not.' },
      { prompt: 'class C:\n    @classmethod\n    def create(cls, val):\n        obj = cls()\n        obj.val = val\n        return obj\nprint(C.create(42).val)', isCode: true, options: ['42', 'Error', 'None', 'cls'], correct: '42', explain: '@classmethod receives cls (the class). cls() instantiates it. obj.val = 42. Returns the configured instance.' },
    ],
  },

  // ── Ch4: dungerMethodTracer ──────────────────────────────────────────────────
  dungerMethodTracer: {
    key: 'dungerMethodTracer', title: 'Magic Methods', icon: '✨',
    subtitle: 'Which dunder method handles each operation?',
    type: 'match',
    pairs: [
      { left: 'len(obj)', right: '__len__' },
      { left: 'obj[key]', right: '__getitem__' },
      { left: 'obj + other', right: '__add__' },
      { left: 'print(obj)', right: '__str__ (falls back to __repr__)' },
      { left: 'obj() — calling instance', right: '__call__' },
    ],
  },

  // ── Ch4: abcTracer ───────────────────────────────────────────────────────────
  abcTracer: {
    key: 'abcTracer', title: 'Abstract Base Classes', icon: '📐',
    subtitle: 'ABCs enforce interfaces — predict what happens',
    type: 'mcq',
    questions: [
      { prompt: 'from abc import ABC, abstractmethod\nclass S(ABC):\n    @abstractmethod\n    def signal(self): ...\n\nS()', isCode: true, options: ['Works fine', 'TypeError', 'NotImplementedError', 'AttributeError'], correct: 'TypeError', explain: 'Abstract classes cannot be instantiated directly. TypeError: Can\'t instantiate abstract class.' },
      { prompt: 'class M(S):\n    def signal(self): return 1\nM()', isCode: true, options: ['Works', 'TypeError', 'AttributeError', 'Error'], correct: 'Works', explain: 'M implements all abstract methods. It can be instantiated.' },
      { prompt: 'class Bad(S):\n    pass  # no signal() implementation\nBad()', isCode: true, options: ['Works', 'TypeError at instantiation', 'TypeError at definition', 'AttributeError when calling signal'], correct: 'TypeError at instantiation', explain: 'Missing abstract method caught at instantiation time, not at class definition.' },
      { prompt: 'class S(ABC):\n    @abstractmethod\n    def signal(self): ...\n    def backtest(self, prices):\n        return sum(self.signal(p) for p in prices)\nCan subclasses call backtest()?', options: ['No — abstract class', 'Yes — concrete methods are inherited', 'Only if they override backtest', 'Error'], correct: 'Yes — concrete methods are inherited', explain: 'Abstract classes can have concrete methods. Subclasses inherit backtest() and it calls their signal().' },
      { prompt: 'from collections.abc import Sequence\nprint(isinstance([1,2,3], Sequence))', isCode: true, options: ['True', 'False', 'Error', 'None'], correct: 'True', explain: 'List implements the Sequence ABC (has __getitem__, __len__, etc.). isinstance check works via ABC.' },
    ],
  },

  // ── Ch4: dataclassBuilder ────────────────────────────────────────────────────
  dataclassBuilder: {
    key: 'dataclassBuilder', title: 'Dataclasses', icon: '📋',
    subtitle: 'Build correct @dataclass definitions from requirements',
    type: 'build',
    buildQuestions: [
      { prompt: 'Write a frozen @dataclass Trade with fields: symbol (str), price (float), qty (int), side defaults to "buy".', answer: '@dataclass(frozen=True)\nclass Trade:\n    symbol: str\n    price: float\n    qty: int\n    side: str = "buy"', hint: '@dataclass(frozen=True)\nclass Trade:\n    symbol: str\n    price: float\n    qty: int\n    side: str = "buy"', explain: 'frozen=True makes the instance immutable (hashable). Default values go after required fields.' },
      { prompt: 'Why can\'t you write tags: list = [] in a @dataclass? Write the correct version.', answer: 'from dataclasses import field\ntags: list = field(default_factory=list)', hint: 'tags: list = field(default_factory=list)', explain: 'Mutable defaults are shared across instances. field(default_factory=list) creates a fresh list per instance.' },
      { prompt: 'Add a method notional() to Trade that returns price * qty.', answer: 'def notional(self) -> float:\n    return self.price * self.qty', hint: 'def notional(self) -> float:\n    return self.price * self.qty', explain: '@dataclass classes are regular classes. You add methods exactly as you would in any class.' },
    ],
  },

  // ── Ch4: propertyBuilder ─────────────────────────────────────────────────────
  propertyBuilder: {
    key: 'propertyBuilder', title: 'Properties & Descriptors', icon: '🔧',
    subtitle: 'Predict property getter/setter behaviour',
    type: 'mcq',
    questions: [
      { prompt: 'class P:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def radius(self): return self._r\np = P(5)\np.radius = 10', isCode: true, options: ['Sets _r to 10', 'AttributeError', 'Works silently', 'TypeError'], correct: 'AttributeError', explain: '@property with no setter makes the attribute read-only. Assignment raises AttributeError.' },
      { prompt: 'class A:\n    def __init__(self): self._v = 0\n    @property\n    def value(self): return self._v\n    @value.setter\n    def value(self, v):\n        if v<0: raise ValueError\n        self._v = v\na = A(); a.value = 5\nprint(a.value)', isCode: true, options: ['0', '5', 'Error', '-5'], correct: '5', explain: 'Setter validates (no negative), then stores. a.value = 5 passes validation.' },
      { prompt: 'Why use @property for market_value instead of storing self.market_value?', options: ['Faster access', 'Always computes from latest price — never stale', 'Required for dataclasses', 'Saves memory'], correct: 'Always computes from latest price — never stale', explain: 'A stored attribute goes stale when price changes. A @property recomputes on every access from the current price and shares attributes.' },
    ],
  },

  // ── Ch4: mroTracer ───────────────────────────────────────────────────────────
  mroTracer: {
    key: 'mroTracer', title: 'MRO — Method Resolution Order', icon: '🔍',
    subtitle: 'Python searches classes in C3 linearisation order',
    type: 'mcq',
    questions: [
      { prompt: 'class A:\n    def f(self): return "A"\nclass B(A):\n    def f(self): return "B"\nclass C(A): pass\nprint(C().f())', isCode: true, options: ['A', 'B', 'C', 'Error'], correct: 'A', explain: 'C has no f(). MRO: C → A. Found in A. Returns "A".' },
      { prompt: 'class A:\n    def f(self): return "A"\nclass B(A):\n    def f(self): return "B"\nclass D(B, A): pass\nprint(D().f())', isCode: true, options: ['A', 'B', 'D', 'Error'], correct: 'B', explain: 'MRO: D → B → A. B.f() is found first.' },
      { prompt: 'class LogMixin:\n    def log(self): print("logged")\nclass Base:\n    pass\nclass MyClass(LogMixin, Base): pass\nMyClass().log()', isCode: true, options: ['logged', 'Error', 'Nothing', 'AttributeError'], correct: 'logged', explain: 'Mixin pattern: LogMixin adds log() to MyClass via multiple inheritance.' },
      { prompt: 'print(int.__mro__)', isCode: true, options: ['(int, object)', '(int,)', '(int, float, object)', '(object, int)'], correct: '(int, object)', explain: 'int inherits directly from object. MRO is (int, object).' },
    ],
  },

  // ── Ch4: compositionBuilder ──────────────────────────────────────────────────
  compositionBuilder: {
    key: 'compositionBuilder', title: 'Composition vs Inheritance', icon: '🏗️',
    subtitle: 'Choose the right design — is-a vs has-a',
    type: 'mcq',
    questions: [
      { prompt: 'class Portfolio(list): ...\nWhat is wrong with this design?', options: ['list is too slow', 'Portfolio inherits 30+ list methods (pop, sort, insert) that make no sense for a portfolio', 'Cannot add custom methods', 'Works fine'], correct: 'Portfolio inherits 30+ list methods (pop, sort, insert) that make no sense for a portfolio', explain: 'IS-A is wrong here. Portfolio HAS positions. Use composition: self._positions = [].' },
      { prompt: 'Backtester has a Strategy as a dependency. Which design allows you to swap strategies?', options: ['class Backtester(Strategy)', 'def __init__(self, strategy: Strategy)', 'strategy = MomentumStrategy() at module level', 'None — always hardcode'], correct: 'def __init__(self, strategy: Strategy)', explain: 'Dependency injection — pass the strategy in. Swap by passing a different object. Loose coupling.' },
      { prompt: 'class Order(LogMixin, TimestampMixin, BaseOrder): ...\nThis is an example of:', options: ['Deep inheritance abuse', 'Mixin pattern — correct multiple inheritance use', 'Composition', 'Abstract base class'], correct: 'Mixin pattern — correct multiple inheritance use', explain: 'Mixins add focused, reusable behaviour (logging, timestamps) without deep IS-A hierarchies.' },
      { prompt: 'How do you check if a design is IS-A or HAS-A?', options: ['Check if it compiles', 'Sentence test: "Portfolio IS positions" vs "Portfolio HAS positions"', 'Count the methods', 'Use isinstance'], correct: 'Sentence test: "Portfolio IS positions" vs "Portfolio HAS positions"', explain: 'If "X IS A Y" reads naturally, inheritance is appropriate. If "X HAS Y", use composition. Portfolio HAS positions → composition.' },
    ],
  },

  // ── Ch4: ch4BossBuilder ──────────────────────────────────────────────────────
  ch4BossBuilder: {
    key: 'ch4BossBuilder', title: 'Ch4 Boss: OOP Design', icon: '🏆',
    subtitle: 'Design class hierarchies for real systems',
    type: 'build',
    buildQuestions: [
      { prompt: 'Write a frozen @dataclass Position with: symbol, shares, avg_price. Add a @property unrealised_pnl(self, current_price) — wait, properties can\'t take args. How do you expose this?', answer: 'def unrealised_pnl(self, current_price: float) -> float:\n    return (current_price - self.avg_price) * self.shares', hint: 'def unrealised_pnl(self, current_price: float) -> float:\n    return (current_price - self.avg_price) * self.shares', explain: 'Properties don\'t take arguments. Make it a regular method instead. Only stateless computed values (from stored fields) use @property.' },
      { prompt: 'Write a Strategy ABC with abstract method generate_signals(prices: list) -> list. Add a concrete method returns_from_signals(prices, signals) = list of position-weighted returns.', answer: 'from abc import ABC, abstractmethod\nclass Strategy(ABC):\n    @abstractmethod\n    def generate_signals(self, prices: list) -> list: ...\n    def returns_from_signals(self, prices, signals):\n        return [(signals[i]*((prices[i+1]-prices[i])/prices[i])) for i in range(len(signals)-1)]', hint: 'class Strategy(ABC):\n    @abstractmethod\n    def generate_signals(self, prices): ...\n    def returns_from_signals(self, prices, signals): ...', explain: 'ABC enforces generate_signals. Concrete returns_from_signals uses it internally — subclasses get this for free.' },
      { prompt: 'Add LogMixin to Order. LogMixin has def log(self, msg): print(f"{self.__class__.__name__}: {msg}"). Write the Order class header.', answer: 'class Order(LogMixin, BaseOrder):\n    pass', hint: 'class Order(LogMixin, BaseOrder):', explain: 'Mixin goes first in the MRO. Order inherits log() from LogMixin without coupling to it.' },
    ],
  },

  // ── Ch5: typeHintBuilder ─────────────────────────────────────────────────────
  typeHintBuilder: {
    key: 'typeHintBuilder', title: 'Type Hints', icon: '🏷️',
    subtitle: 'Match the annotation to what it means',
    type: 'match',
    pairs: [
      { left: 'Optional[float]', right: 'float or None' },
      { left: 'list[tuple[str, float]]', right: 'List of (ticker, price) pairs' },
      { left: 'Callable[[float], float]', right: 'Function taking float, returning float' },
      { left: 'dict[str, list[float]]', right: 'Dict mapping string to list of floats' },
      { left: 'float | None', right: 'Python 3.10+ shorthand for Optional[float]' },
    ],
  },

  // ── Ch5: loggingBuilder ──────────────────────────────────────────────────────
  loggingBuilder: {
    key: 'loggingBuilder', title: 'Logging Levels', icon: '📋',
    subtitle: 'Choose the right log level for each situation',
    type: 'mcq',
    questions: [
      { prompt: 'A trade was executed successfully at the expected price.', options: ['DEBUG', 'INFO', 'WARNING', 'ERROR'], correct: 'INFO', explain: 'INFO is for normal operational events. Trade execution is expected — log it for the audit trail.' },
      { prompt: 'Portfolio value is 90% of its position limit.', options: ['DEBUG', 'INFO', 'WARNING', 'ERROR'], correct: 'WARNING', explain: 'WARNING signals something unusual that may need attention but is not yet an error.' },
      { prompt: 'An API call returned unexpected data structure.', options: ['DEBUG', 'INFO', 'WARNING', 'ERROR'], correct: 'ERROR', explain: 'ERROR: something went wrong that requires investigation. The program can continue but data integrity is compromised.' },
      { prompt: 'Processing row 1,247 of 50,000 in a batch job.', options: ['DEBUG', 'INFO', 'WARNING', 'ERROR'], correct: 'DEBUG', explain: 'DEBUG: granular detail useful only during development/troubleshooting. Filter out in production.' },
      { prompt: 'An unexpected exception escaped the top-level handler.', options: ['DEBUG', 'INFO', 'WARNING', 'CRITICAL'], correct: 'CRITICAL', explain: 'CRITICAL: system may be unable to continue. Unexpected top-level exception is the most severe log event.' },
    ],
  },

  // ── Ch5: venvBuilder ─────────────────────────────────────────────────────────
  venvBuilder: {
    key: 'venvBuilder', title: 'Virtual Environments', icon: '📦',
    subtitle: 'Match the command to what it does',
    type: 'match',
    pairs: [
      { left: 'python -m venv .venv', right: 'Create a virtual environment in .venv/' },
      { left: 'source .venv/bin/activate', right: 'Activate venv on Unix/Mac' },
      { left: 'pip freeze > requirements.txt', right: 'Save current package versions to file' },
      { left: 'pip install -r requirements.txt', right: 'Install all packages from requirements file' },
      { left: 'deactivate', right: 'Exit the active virtual environment' },
    ],
  },

  // ── Ch5: secretsBuilder ──────────────────────────────────────────────────────
  secretsBuilder: {
    key: 'secretsBuilder', title: 'Secrets & Config', icon: '🔐',
    subtitle: 'Identify safe vs unsafe secret handling',
    type: 'mcq',
    questions: [
      { prompt: 'api_key = "sk-live-abc123xyz"\n# in source code committed to git', options: ['Safe — it\'s a private repo', 'Unsafe — secrets must never be in source code', 'Safe if in a comment', 'Safe if variable name starts with _'], correct: 'Unsafe — secrets must never be in source code', explain: 'Private repos get leaked. Git history persists. Secrets in code = credential exposure risk.' },
      { prompt: 'The correct way to load an API key in production:', options: ['Hardcode it', 'os.environ["API_KEY"]', 'config.py file committed to git', 'print() then copy-paste'], correct: 'os.environ["API_KEY"]', explain: 'Environment variables are the minimum standard. They stay outside the codebase entirely.' },
      { prompt: 'You accidentally committed .env to git. What do you do FIRST?', options: ['Delete the file and commit again', 'Rotate the credentials immediately', 'Make the repo private', 'Add .env to .gitignore'], correct: 'Rotate the credentials immediately', explain: 'The credentials are compromised — assume they are public. Rotate (generate new) first. git history cleanup comes after.' },
      { prompt: 'python-dotenv load_dotenv() does what?', options: ['Creates .env file', 'Loads .env file into os.environ', 'Validates env var format', 'Encrypts secrets'], correct: 'Loads .env file into os.environ', explain: 'load_dotenv() reads KEY=VALUE pairs from .env and sets them as environment variables for the current process.' },
    ],
  },

  // ── Ch5: gitBuilder ──────────────────────────────────────────────────────────
  gitBuilder: {
    key: 'gitBuilder', title: 'Git Essentials', icon: '🌿',
    subtitle: 'Match git command to what it does',
    type: 'match',
    pairs: [
      { left: 'git add .', right: 'Stage all changed files' },
      { left: 'git commit -m "msg"', right: 'Save snapshot with message' },
      { left: 'git checkout -b feature/x', right: 'Create and switch to new branch' },
      { left: 'git merge feature/x', right: 'Merge branch into current branch' },
      { left: 'git log --oneline', right: 'View compact commit history' },
    ],
  },

  // ── Ch5: profilingBuilder ────────────────────────────────────────────────────
  profilingBuilder: {
    key: 'profilingBuilder', title: 'Profiling & Optimisation', icon: '⚡',
    subtitle: 'Identify bottlenecks and the right tool for each',
    type: 'mcq',
    questions: [
      { prompt: 'Your backtest takes 45s. Before optimising, you should:', options: ['Rewrite in C', 'Profile first with cProfile', 'Add @jit to everything', 'Switch to multiprocessing'], correct: 'Profile first with cProfile', explain: 'Rule 1: profile before optimising. You will optimise the wrong thing without data. cProfile shows exactly where time is spent.' },
      { prompt: 'cProfile shows 80% of time is in a for loop computing np.sum() over a numpy array.', options: ['Use Numba @jit', 'Remove the loop — use array.sum() directly', 'Use multiprocessing', 'Use asyncio'], correct: 'Remove the loop — use array.sum() directly', explain: 'Vectorisation: replace the Python loop with a numpy operation. 100× speedup, zero complexity added.' },
      { prompt: 'A recursive option pricing function is called with the same (S,K,T,r,σ) repeatedly.', options: ['Rewrite iteratively', 'Add @lru_cache', 'Use multiprocessing', 'Use asyncio'], correct: 'Add @lru_cache', explain: '@lru_cache memoises results. Same inputs → instant cache hit. Pay computation cost once per unique input.' },
      { prompt: 'You need to backtest 500 strategies independently. Each takes 5 seconds.', options: ['asyncio', 'multiprocessing Pool', 'threading', 'Sequential — no alternative'], correct: 'multiprocessing Pool', explain: 'CPU-bound parallel work → multiprocessing. 500 × 5s sequential = 2500s. With 8 cores: ~315s.' },
      { prompt: 'You want to add Numba @njit to a function that uses a pandas DataFrame internally.', options: ['Works fine', 'Fails — numba cannot compile pandas', 'Works with nopython=False', 'Works after import'], correct: 'Fails — numba cannot compile pandas', explain: 'Numba nopython mode only handles numpy and basic Python. Extract pandas ops outside; pass numpy arrays into the @njit function.' },
    ],
  },

  // ── Ch5: asyncTracer ─────────────────────────────────────────────────────────
  asyncTracer: {
    key: 'asyncTracer', title: 'asyncio Tracer', icon: '⚡',
    subtitle: 'async/await execution — concurrent not parallel',
    type: 'mcq',
    questions: [
      { prompt: 'import asyncio\nasync def f():\n    return 42\nresult = asyncio.run(f())\nprint(result)', isCode: true, options: ['42', 'coroutine object', 'Error', 'None'], correct: '42', explain: 'asyncio.run() runs the coroutine to completion and returns its result.' },
      { prompt: 'asyncio is best for:', options: ['CPU-bound numpy computation', 'Parallel ML training', 'Concurrent network I/O', 'True multi-core parallelism'], correct: 'Concurrent network I/O', explain: 'asyncio gives concurrency (not parallelism). While awaiting I/O, other tasks run. Not for CPU-bound work.' },
      { prompt: 'await asyncio.gather(f1(), f2(), f3()) means:', options: ['f1,f2,f3 run sequentially', 'f1,f2,f3 run concurrently on different cores', 'f1,f2,f3 run concurrently on one thread', 'Error'], correct: 'f1,f2,f3 run concurrently on one thread', explain: 'gather schedules all coroutines concurrently. One thread switches between them while they await I/O.' },
      { prompt: 'Fetching 100 stock prices with asyncio.gather vs sequential:\nExpected speedup?', options: ['No speedup', '~100×', '~10×', '2×'], correct: '~100×', explain: 'All 100 requests fire simultaneously. Total time ≈ slowest single request instead of sum of all requests.' },
    ],
  },

  // ── Ch5: multiprocessingBuilder ─────────────────────────────────────────────
  multiprocessingBuilder: {
    key: 'multiprocessingBuilder', title: 'Multiprocessing', icon: '🔀',
    subtitle: 'When to use Pool, ThreadPool, or asyncio',
    type: 'mcq',
    questions: [
      { prompt: 'Running 20 backtests in parallel, each takes 30 seconds of CPU.', options: ['asyncio', 'ThreadPool', 'ProcessPool', 'Sequential'], correct: 'ProcessPool', explain: 'CPU-bound work: use multiprocessing. Threads are blocked by the GIL. Processes bypass it.' },
      { prompt: 'Fetching current prices for 500 tickers from an API.', options: ['ProcessPool', 'ThreadPool or asyncio', 'Sequential', 'Numba'], correct: 'ThreadPool or asyncio', explain: 'I/O-bound: threads are fine (GIL releases during I/O). asyncio is more efficient but either works.' },
      { prompt: 'pool.map(backtest, strategies) fails with "Can\'t pickle lambda". Fix:', options: ['Use pool.imap', 'Define backtest at module level (not as lambda/nested)', 'Use ThreadPool', 'Use asyncio'], correct: 'Define backtest at module level (not as lambda/nested)', explain: 'multiprocessing pickles functions to send to workers. Lambdas and locally-defined functions cannot be pickled.' },
      { prompt: 'With 8 cores, 40 tasks each taking 10s, using Pool(8): expected time?', options: ['400s', '80s', '~50s', '10s'], correct: '~50s', explain: '40 tasks / 8 cores = 5 rounds of 8. Each round takes 10s. Total ≈ 50s (vs 400s sequential).' },
    ],
  },

  // ── Ch5: ch5BossBuilder ──────────────────────────────────────────────────────
  ch5BossBuilder: {
    key: 'ch5BossBuilder', title: 'Ch5 Boss: Production Python', icon: '🏆',
    subtitle: 'Production scenarios — choose the right tool',
    type: 'mcq',
    questions: [
      { prompt: 'A data-fetch function is called 1000x/second for the same 50 tickers. First optimisation?', options: ['asyncio', '@lru_cache', 'multiprocessing', 'Numba'], correct: '@lru_cache', explain: 'Cache eliminates most calls immediately. Same ticker → instant cache hit. Apply cache before async/parallel.' },
      { prompt: 'assert result == 0.3 fails for 0.1+0.2. Fix:', options: ['Use == with round()', 'assert result == pytest.approx(0.3)', 'Use int comparison', 'Add tolerance manually'], correct: 'assert result == pytest.approx(0.3)', explain: 'Floating point cannot represent 0.3 exactly. pytest.approx handles the tolerance automatically.' },
      { prompt: 'Your API key was committed to GitHub 3 days ago. Steps in order?', options: ['1.gitignore 2.rotate 3.history-clean', '1.rotate 2.history-clean 3.gitignore', '1.make-private 2.gitignore 3.rotate', '1.delete-repo 2.recreate'], correct: '1.rotate 2.history-clean 3.gitignore', explain: 'Rotate first (credentials compromised immediately). Clean git history. Then add to .gitignore to prevent recurrence.' },
      { prompt: 'Type hint for: function taking list[float] and Callable[[float],float], returning list[float]:', options: ['def f(data, fn): ...', 'def f(data: list, fn: callable) -> list: ...', 'def f(data: list[float], fn: Callable[[float],float]) -> list[float]: ...', 'def f(data: List, fn: Function) -> List: ...'], correct: 'def f(data: list[float], fn: Callable[[float],float]) -> list[float]: ...', explain: 'Specific generic types. list[float] not just list. Callable[[float],float] specifies signature.' },
      { prompt: 'cProfile shows 95% of time in numpy operations. What do you do?', options: ['Add @njit to numpy calls', 'Profile at line level to find specific hot spot', 'Rewrite in C', 'Nothing — numpy is already compiled'], correct: 'Profile at line level to find specific hot spot', explain: 'cProfile is function-level. If numpy is the hotspot, use line_profiler to find which numpy call. Then consider algorithmic improvement or memory layout.' },
    ],
  },

  // ── Ch6: vectorOpsTracer ─────────────────────────────────────────────────────
  vectorOpsTracer: {
    key: 'vectorOpsTracer', title: 'Vectorised Operations', icon: '⚡',
    subtitle: 'numpy array operations — predict shape and values',
    type: 'mcq',
    questions: [
      { prompt: 'import numpy as np\na = np.array([1.,2.,3.,4.])\nprint(a * 2 + 1)', isCode: true, options: ['[3. 5. 7. 9.]', '[2. 4. 6. 8.]', '[2. 3. 4. 5.]', 'Error'], correct: '[3. 5. 7. 9.]', explain: 'Element-wise: each element × 2 then + 1. [1,2,3,4] → [2,4,6,8] → [3,5,7,9].' },
      { prompt: 'a = np.array([1.,4.,9.,16.])\nprint(np.sqrt(a))', isCode: true, options: ['[1. 2. 3. 4.]', '[0.5 1. 1.5 2.]', 'Error', '[1. 4. 9. 16.]'], correct: '[1. 2. 3. 4.]', explain: 'np.sqrt is a ufunc — applied element-wise. √1=1, √4=2, √9=3, √16=4.' },
      { prompt: 'prices = np.array([100.,102.,101.,105.])\nreturns = prices[1:]/prices[:-1] - 1\nprint(len(returns))', isCode: true, options: ['4', '3', '2', 'Error'], correct: '3', explain: 'prices[1:] has 3 elements, prices[:-1] has 3 elements. Division is element-wise. 3 returns.' },
      { prompt: 'm = np.array([[1.,2.],[3.,4.]])\nprint(m.sum(axis=0))', isCode: true, options: ['[3. 7.]', '[4. 6.]', '[1. 2. 3. 4.]', '[10.]'], correct: '[4. 6.]', explain: 'axis=0 sums across rows (down the columns). Col0: 1+3=4, Col1: 2+4=6.' },
      { prompt: 'a = np.array([-2.,-1.,0.,1.,2.])\nprint(a[a>0])', isCode: true, options: ['[1. 2.]', '[0. 1. 2.]', '[-1. 0. 1. 2.]', 'Error'], correct: '[1. 2.]', explain: 'Boolean indexing: a>0 is [F,F,F,T,T]. a[mask] returns [1., 2.].' },
    ],
  },

  // ── Ch6: linAlgTracer ────────────────────────────────────────────────────────
  linAlgTracer: {
    key: 'linAlgTracer', title: 'np.linalg Operations', icon: '🔢',
    subtitle: 'Linear algebra in finance — match operation to use case',
    type: 'match',
    pairs: [
      { left: 'weights @ cov @ weights', right: 'Portfolio variance' },
      { left: 'np.linalg.solve(A, b)', right: 'Solve Ax=b (preferred over inv)' },
      { left: 'np.linalg.eigh(cov)', right: 'Eigendecomposition of symmetric matrix' },
      { left: 'np.corrcoef(returns.T)', right: 'Correlation matrix of return series' },
      { left: 'A @ B', right: 'Matrix multiplication' },
    ],
  },

  // ── Ch6: randomSeedTracer ────────────────────────────────────────────────────
  randomSeedTracer: {
    key: 'randomSeedTracer', title: 'numpy Random & Seeds', icon: '🎲',
    subtitle: 'Reproducibility and the modern random API',
    type: 'mcq',
    questions: [
      { prompt: 'rng = np.random.default_rng(42)\na = rng.standard_normal(3)\nrng2 = np.random.default_rng(42)\nb = rng2.standard_normal(3)\nprint(np.array_equal(a,b))', isCode: true, options: ['True', 'False', 'Error', 'Sometimes'], correct: 'True', explain: 'Same seed → identical sequence. This is what reproducibility means.' },
      { prompt: 'np.random.seed(42) vs np.random.default_rng(42): difference?', options: ['No difference', 'Different algorithms: MT vs PCG64', 'default_rng is slower', 'seed() is for integers only'], correct: 'Different algorithms: MT vs PCG64', explain: 'seed() uses legacy Mersenne Twister. default_rng uses PCG64 (better statistics, thread-safe). Same seed ≠ same output across the two.' },
      { prompt: 'To simulate correlated stock returns with correlation ρ=0.8:', options: ['rng.standard_normal((n,2)) then multiply', 'rng.multivariate_normal([0,0], [[1,0.8],[0.8,1]], n)', 'rng.normal(0,1,n) twice', 'Not possible with numpy'], correct: 'rng.multivariate_normal([0,0], [[1,0.8],[0.8,1]], n)', explain: 'multivariate_normal takes a covariance matrix. [[1,0.8],[0.8,1]] gives var=1, cov=0.8.' },
      { prompt: 'Why must Monte Carlo simulations for regulatory use always set a seed?', options: ['Faster computation', 'Required by hardware', 'Results must be reproducible and verifiable', 'Reduces variance'], correct: 'Results must be reproducible and verifiable', explain: 'Regulators may ask to reproduce specific simulations. Audit trails require identical results from the same inputs.' },
    ],
  },

  // ── Ch6: aggregationTracer ───────────────────────────────────────────────────
  aggregationTracer: {
    key: 'aggregationTracer', title: 'numpy Aggregations', icon: '📊',
    subtitle: 'np.where, argmax, cumsum — predict the output',
    type: 'mcq',
    questions: [
      { prompt: 'a = np.array([-0.02, 0.05, -0.01, 0.08, 0.03])\nprint(np.where(a>0, a, 0))', isCode: true, options: ['[0. 0.05 0. 0.08 0.03]', '[0.05 0.08 0.03]', '[0. 0. 0. 0. 0.]', 'Error'], correct: '[0. 0.05 0. 0.08 0.03]', explain: 'np.where(condition, x, y): where True return x, else y. Negative returns → 0.' },
      { prompt: 'prices = np.array([100,98,103,99,107])\nprint(np.argmax(prices))', isCode: true, options: ['107', '4', '0', '3'], correct: '4', explain: 'argmax returns the INDEX of the maximum value. Max is 107 at index 4.' },
      { prompt: 'r = np.array([0.01, -0.02, 0.03])\nprint(np.cumprod(1+r) - 1)', isCode: true, options: ['[0.01 -0.01 0.02]', '[0.01 -0.0098 0.02094]', '[0.0 0.0 0.0]', 'Error'], correct: '[0.01 -0.0098 0.02094]', explain: 'Cumulative product of (1+r): 1.01, 1.01×0.98=0.9898, 0.9898×1.03=1.02009. Subtract 1.' },
      { prompt: 'a = np.array([3,1,4,1,5])\nprint(np.unique(a, return_counts=True))', isCode: true, options: ['([1,3,4,5],[2,1,1,1])', '([1,1,3,4,5],[1,1,1,1,1])', 'Error', '([5,4,3,1,1],[1,1,1,2])'], correct: '([1,3,4,5],[2,1,1,1])', explain: 'unique returns sorted unique values and their counts. 1 appears twice, others once.' },
    ],
  },

  // ── Ch6: dtypeMemoryCalc ─────────────────────────────────────────────────────
  dtypeMemoryCalc: {
    key: 'dtypeMemoryCalc', title: 'dtype & Memory', icon: '💾',
    subtitle: 'Calculate memory usage and choose the right dtype',
    type: 'mcq',
    questions: [
      { prompt: '500 stocks × 252 days × float64 (8 bytes). Memory in MB?', options: ['0.5 MB', '1.0 MB', '2.0 MB', '4.0 MB'], correct: '1.0 MB', explain: '500 × 252 × 8 = 1,008,000 bytes ≈ 1.0 MB.' },
      { prompt: 'Same data in float32 (4 bytes). Memory?', options: ['0.5 MB', '1.0 MB', '2.0 MB', '0.25 MB'], correct: '0.5 MB', explain: '500 × 252 × 4 = 504,000 bytes ≈ 0.5 MB. Half the memory for half the precision.' },
      { prompt: 'float32 gives ~7 significant digits. For stock price $150.2345, is this adequate?', options: ['No — too imprecise', 'Yes — more than enough for prices', 'Only for integers', 'Depends on currency'], correct: 'Yes — more than enough for prices', explain: '7 digits covers $150.2345 with 4 decimal places to spare. float32 is fine for prices; use float64 for long multiplication chains.' },
      { prompt: 'np.array([1,2,3]).dtype', options: ['int32', 'int64', 'float64', 'object'], correct: 'int64', explain: 'Default integer dtype on most platforms is int64 (64-bit integer).' },
    ],
  },

  // ── Ch6: numbaSpeedCalc ──────────────────────────────────────────────────────
  numbaSpeedCalc: {
    key: 'numbaSpeedCalc', title: 'Numba JIT', icon: '🚀',
    subtitle: 'When does @njit help? Match scenario to outcome',
    type: 'match',
    pairs: [
      { left: 'Loop over numpy array doing arithmetic', right: '10–200× speedup with @njit' },
      { left: 'df.groupby().mean() (pandas)', right: 'Cannot be compiled — pandas not supported' },
      { left: 'First call to @njit function', right: 'Slow — compilation happens' },
      { left: 'Subsequent calls same args', right: 'Near C speed — uses compiled code' },
      { left: 'Path-dependent option pricing loop', right: 'Best use case for @njit' },
    ],
  },

  // ── Ch6: numpyWorkflowBuilder ────────────────────────────────────────────────
  numpyWorkflowBuilder: {
    key: 'numpyWorkflowBuilder', title: 'numpy Finance Workflow', icon: '📈',
    subtitle: 'Fill in the numpy financial pipeline',
    type: 'build',
    buildQuestions: [
      { prompt: 'Given prices array of shape (252, 5), compute log returns in one line.', answer: 'np.diff(np.log(prices), axis=0)', hint: 'np.diff(np.log(prices), axis=0)', explain: 'np.log element-wise, then np.diff takes consecutive differences along axis=0 (rows/time).' },
      { prompt: 'Given returns of shape (251, 5) and weights of shape (5,), compute portfolio returns.', answer: 'port_returns = returns @ weights', hint: 'port_returns = returns @ weights', explain: 'Matrix-vector multiply. Each row of returns (one day) dot weights gives that day\'s portfolio return.' },
      { prompt: 'Given port_returns (shape 251,), compute max drawdown.', answer: 'cum = np.cumprod(1+port_returns)\ndd = (cum - np.maximum.accumulate(cum)) / np.maximum.accumulate(cum)\nmax_dd = dd.min()', hint: 'cum=np.cumprod(1+r); dd=(cum-np.maximum.accumulate(cum))/np.maximum.accumulate(cum); max_dd=dd.min()', explain: 'Cumulative wealth, rolling max, drawdown = (current-peak)/peak. Min of that is max drawdown.' },
    ],
  },

  // ── Ch6: ch6BossBuilder ──────────────────────────────────────────────────────
  ch6BossBuilder: {
    key: 'ch6BossBuilder', title: 'Ch6 Boss: numpy Gauntlet', icon: '🏆',
    subtitle: 'numpy one-liners from spec',
    type: 'build',
    buildQuestions: [
      { prompt: 'Write a one-liner to compute daily log returns from prices array (1D).', answer: 'np.diff(np.log(prices))', hint: 'np.diff(np.log(prices))', explain: 'Equivalent to np.log(prices[1:]/prices[:-1]). Both correct.' },
      { prompt: 'Given returns matrix (252,5), compute annualised Sharpe for each asset as one expression.', answer: '(returns.mean(axis=0) * 252) / (returns.std(axis=0) * np.sqrt(252))', hint: '(returns.mean(axis=0)*252) / (returns.std(axis=0)*np.sqrt(252))', explain: 'mean(axis=0) gives per-column mean. Annualise by ×252 (mean) and ×√252 (std). Divide.' },
      { prompt: 'Compute excess returns: subtract each column\'s mean from the (252,5) returns matrix.', answer: 'returns - returns.mean(axis=0)', hint: 'returns - returns.mean(axis=0)', explain: 'returns.mean(axis=0) has shape (5,). Broadcasting (252,5) - (5,) subtracts column-wise.' },
      { prompt: 'Write the correct way to seed for reproducibility in modern numpy.', answer: 'rng = np.random.default_rng(seed=42)', hint: 'rng = np.random.default_rng(seed=42)', explain: 'default_rng is the modern API (PCG64). Avoid legacy np.random.seed().' },
    ],
  },

  // ── Ch7: dataframeBuilder ────────────────────────────────────────────────────
  dataframeBuilder: {
    key: 'dataframeBuilder', title: 'DataFrame Basics', icon: '🐼',
    subtitle: 'Series and DataFrame construction and access',
    type: 'mcq',
    questions: [
      { prompt: 'df = pd.DataFrame({"a":[1,2,3],"b":[4,5,6]})\nprint(df.shape)', isCode: true, options: ['(2, 3)', '(3, 2)', '(6,)', '(2,)'], correct: '(3, 2)', explain: '3 rows, 2 columns. shape is (rows, columns).' },
      { prompt: 'df["a"]  returns a:', options: ['DataFrame', 'Series', 'ndarray', 'list'], correct: 'Series', explain: 'Single column access returns a Series.' },
      { prompt: 'df[["a","b"]]  returns a:', options: ['Series', 'DataFrame', 'ndarray', 'dict'], correct: 'DataFrame', explain: 'Double bracket (list of columns) returns a DataFrame.' },
      { prompt: 'df.dtypes  shows:', options: ['Shape of DataFrame', 'Data type of each column', 'Index type', 'Memory usage'], correct: 'Data type of each column', explain: 'dtypes is a Series of dtype objects, one per column.' },
      { prompt: 'pd.read_csv("prices.csv", index_col=0, parse_dates=True)\nWhat does parse_dates=True do?', options: ['Converts all columns to dates', 'Parses the index column as datetime', 'Formats dates as strings', 'Raises error on non-date columns'], correct: 'Parses the index column as datetime', explain: 'When combined with index_col=0, parse_dates=True parses that index column as DatetimeIndex.' },
    ],
  },

  // ── Ch7: dataCleaner ─────────────────────────────────────────────────────────
  dataCleaner: {
    key: 'dataCleaner', title: 'Data Cleaning', icon: '🧹',
    subtitle: 'Identify and fix data quality issues in financial data',
    type: 'mcq',
    questions: [
      { prompt: 'Stock price data is missing for weekends and holidays.\nBest approach for a price series?', options: ['dropna()', 'fillna(0)', 'fillna(method="ffill")', 'interpolate()'], correct: 'fillna(method="ffill")', explain: 'Forward fill: missing price = last known price. Asset didn\'t trade — use last close. Never fill with 0.' },
      { prompt: 'df["price"].min() returns -9999.0 in a stock price dataset. This is:', options: ['A very cheap stock', 'A sentinel value / bad print — filter it out', 'Normal', 'Rounding error'], correct: 'A sentinel value / bad print — filter it out', explain: '-9999 is a sentinel value used by some data vendors for missing data. Filter before analysis.' },
      { prompt: 'To check how many missing values per column:', options: ['df.isnull().count()', 'df.isna().sum()', 'df.describe()', 'df.info()'], correct: 'df.isna().sum()', explain: 'isna() returns boolean DataFrame. .sum() counts True values per column.' },
      { prompt: 'Removing duplicate (date, ticker) pairs keeping most recent entry:', options: ['df.drop_duplicates()', 'df.drop_duplicates(subset=["date","ticker"], keep="last")', 'df.dropna()', 'df.reset_index()'], correct: 'df.drop_duplicates(subset=["date","ticker"], keep="last")', explain: 'subset specifies which columns define a duplicate. keep="last" retains the most recent.' },
      { prompt: 'pd.to_numeric(df["volume"], errors="coerce") — what does errors="coerce" do?', options: ['Raises error on non-numeric', 'Converts non-numeric to NaN', 'Skips non-numeric rows', 'Uses 0 for non-numeric'], correct: 'Converts non-numeric to NaN', explain: '"coerce" replaces unconvertible values with NaN instead of raising an error.' },
    ],
  },

  // ── Ch7: groupbyBuilder ──────────────────────────────────────────────────────
  groupbyBuilder: {
    key: 'groupbyBuilder', title: 'GroupBy Operations', icon: '📊',
    subtitle: 'Predict groupby results — agg, transform, apply',
    type: 'mcq',
    questions: [
      { prompt: 'df.groupby("sector")["return"].mean()\nResult shape?', options: ['Same as df', '(n_sectors,)', '(n_sectors, n_cols)', 'Scalar'], correct: '(n_sectors,)', explain: 'groupby().mean() returns one value per group — a Series indexed by the group key.' },
      { prompt: 'df.groupby("sector")["return"].transform("mean")\nResult shape?', options: ['(n_sectors,)', 'Same as df', '(n_rows, n_cols)', 'Scalar'], correct: 'Same as df', explain: 'transform() returns same-shape result. Each row gets its sector\'s mean return.' },
      { prompt: 'What is transform("mean") used for?', options: ['Replace df with group means', 'Add group stats as a new column', 'Filter groups', 'Sort within groups'], correct: 'Add group stats as a new column', explain: 'df["sector_mean"] = df.groupby("sector")["return"].transform("mean"). Adds sector mean beside each row.' },
      { prompt: 'df.groupby("ticker").filter(lambda g: len(g) > 252)\nWhat does this return?', options: ['Tickers with >252 rows', 'All rows where ticker appears >252 times', 'Aggregated values', 'Empty DataFrame'], correct: 'All rows where ticker appears >252 times', explain: 'filter() keeps or discards entire groups. Keeps all rows of tickers with more than 252 data points.' },
    ],
  },

  // ── Ch7: mergePredictor ──────────────────────────────────────────────────────
  mergePredictor: {
    key: 'mergePredictor', title: 'Merge & Join', icon: '🔗',
    subtitle: 'Predict the result of different join types',
    type: 'mcq',
    questions: [
      { prompt: 'df1 has 100 rows, df2 has 80 rows. Inner join on "ticker".\nResult has:', options: ['100 rows', '80 rows', '≤80 rows', '≤180 rows'], correct: '≤80 rows', explain: 'Inner join keeps only rows with matching keys in BOTH DataFrames. At most min(100,80)=80.' },
      { prompt: 'Left join: df1 has tickers [A,B,C], df2 has [A,C]. Result for ticker B?', options: ['Dropped', 'Kept with NaN for df2 columns', 'Duplicated', 'Error'], correct: 'Kept with NaN for df2 columns', explain: 'Left join keeps all rows from left DataFrame. B has no match in df2 → df2 columns are NaN.' },
      { prompt: 'pd.merge result has 3× more rows than either input. Cause?', options: ['Bug in pandas', 'Duplicate keys — cartesian product', 'Outer join effect', 'Index mismatch'], correct: 'Duplicate keys — cartesian product', explain: 'If the join key has duplicates in both DataFrames, each left row matches multiple right rows.' },
      { prompt: 'To detect duplicates before merging on "ticker":', options: ['df.shape', 'df["ticker"].duplicated().any()', 'df.info()', 'df.describe()'], correct: 'df["ticker"].duplicated().any()', explain: 'Returns True if any ticker appears more than once — warning sign for cartesian product.' },
    ],
  },

  // ── Ch7: applyVsVectorised ───────────────────────────────────────────────────
  applyVsVectorised: {
    key: 'applyVsVectorised', title: 'apply vs Vectorised', icon: '⚡',
    subtitle: 'Choose the right approach — performance matters',
    type: 'mcq',
    questions: [
      { prompt: 'Compute ratio of two columns:\ndf["a"] / df["b"]  vs  df.apply(lambda r: r["a"]/r["b"], axis=1)\nWhich is faster?', options: ['apply is faster', 'vectorised is faster (100×+)', 'Same speed', 'Depends on data type'], correct: 'vectorised is faster (100×+)', explain: 'Vectorised operations run in C. apply(axis=1) iterates rows in Python — near-loop speed.' },
      { prompt: 'df["ticker"].str.upper() vs df["ticker"].apply(str.upper):\nWhich is preferred?', options: ['.str accessor — vectorised string method', '.apply — more explicit', 'Same — use either', '.map — fastest'], correct: '.str accessor — vectorised string method', explain: '.str accessor uses vectorised string operations. apply() is slower for simple string operations.' },
      { prompt: 'When is apply(axis=1) acceptable?', options: ['Never', 'When genuinely complex row-wise logic cannot be vectorised', 'Always — it\'s most readable', 'For numeric operations only'], correct: 'When genuinely complex row-wise logic cannot be vectorised', explain: 'If you truly need cross-column logic that cannot be expressed vectorially, apply is a valid last resort. Always profile.' },
      { prompt: 'df["sector"].map({"Tech":1,"Finance":2,"Energy":3}) — what does this do?', options: ['Filters by sector', 'Replaces sector names with codes using a dict', 'Sorts by sector', 'Groups by sector'], correct: 'Replaces sector names with codes using a dict', explain: '.map() on a Series with a dict replaces each value with its mapping. Sectors → integer codes.' },
    ],
  },

  // ── Ch7: reshapeBuilder ──────────────────────────────────────────────────────
  reshapeBuilder: {
    key: 'reshapeBuilder', title: 'Reshape: stack/unstack/pivot', icon: '🔄',
    subtitle: 'Wide vs long — predict the output shape',
    type: 'match',
    pairs: [
      { left: 'df.pivot_table(values="price", index="date", columns="ticker")', right: 'Long → wide: rows=dates, cols=tickers' },
      { left: 'pd.melt(df, id_vars=["date"], value_vars=["AAPL","GOOG"])', right: 'Wide → long: one row per date-ticker' },
      { left: 'df.stack()', right: 'Column labels become inner index level' },
      { left: 'df.unstack()', right: 'Inner index level becomes column labels' },
      { left: 'df.groupby("sector").transform("mean")', right: 'Same shape as df, each row gets group mean' },
    ],
  },

  // ── Ch7: pandasWorkflowBuilder ───────────────────────────────────────────────
  pandasWorkflowBuilder: {
    key: 'pandasWorkflowBuilder', title: 'pandas Finance Workflow', icon: '📈',
    subtitle: 'Fill in the pandas financial analysis pipeline',
    type: 'build',
    buildQuestions: [
      { prompt: 'Given a prices DataFrame (DatetimeIndex × tickers), compute daily simple returns.', answer: 'returns = prices.pct_change().dropna()', hint: 'returns = prices.pct_change().dropna()', explain: 'pct_change() computes (p_t - p_{t-1})/p_{t-1}. dropna() removes the first NaN row.' },
      { prompt: 'Compute trailing 252-day annualised Sharpe for each asset.', answer: "returns.rolling(252).apply(lambda x: x.mean()/x.std()*252**0.5)", hint: "returns.rolling(252).apply(lambda x: x.mean()/x.std()*252**0.5)", explain: 'rolling(252) window. Mean/std×√252 gives annualised Sharpe. apply runs per column.' },
      { prompt: 'Get the top 5 tickers by most recent trailing Sharpe.', answer: 'rolling_sharpe.iloc[-1].nlargest(5).index.tolist()', hint: 'rolling_sharpe.iloc[-1].nlargest(5).index.tolist()', explain: 'iloc[-1] is the most recent row. nlargest(5) returns top 5 values with their ticker index.' },
      { prompt: 'Convert daily returns to monthly (last value of each month).', answer: 'monthly = returns.resample("ME").apply(lambda x: (1+x).prod()-1)', hint: 'returns.resample("ME").apply(lambda x: (1+x).prod()-1)', explain: 'resample("ME") groups by month end. Compound daily returns within each month.' },
    ],
  },

  // ── Ch7: ch7BossBuilder ──────────────────────────────────────────────────────
  ch7BossBuilder: {
    key: 'ch7BossBuilder', title: 'Ch7 Boss: pandas Gauntlet', icon: '🏆',
    subtitle: 'pandas scenarios — the hard ones',
    type: 'mcq',
    questions: [
      { prompt: 'df.loc["2023-01-01":"2023-01-31"] returns empty despite data existing for Jan 2023. Most likely cause?', options: ['No data for that period', 'Index is not DatetimeIndex', 'loc uses exclusive end', 'Wrong column name'], correct: 'Index is not DatetimeIndex', explain: 'Date string slicing with .loc requires DatetimeIndex. Fix: df.index = pd.to_datetime(df.index).' },
      { prompt: 'Forward filling RETURNS (not prices) is usually wrong. Why?', options: ['Too slow', 'Missing return ≠ repeat of yesterday\'s return', 'Returns must be 0 for missing days', 'pandas does not support it'], correct: 'Missing return ≠ repeat of yesterday\'s return', explain: 'A missing return means no data — not that the return was the same. ffill prices, then compute returns from clean prices.' },
      { prompt: 'groupby().mean() vs groupby().transform("mean") — choose for: "add sector average return as a column beside each row\'s own return"', options: ['groupby().mean()', 'groupby().transform("mean")', 'Either works', 'Neither — use apply()'], correct: 'groupby().transform("mean")', explain: 'transform() returns same-shape result, aligning back to original rows. mean() collapses to one row per sector.' },
      { prompt: 'pd.merge result has 5× more rows than expected. Most targeted diagnostic:', options: ['df.shape before and after', 'df["key"].duplicated().sum() on both frames before merging', 'df.info()', 'df.describe()'], correct: 'df["key"].duplicated().sum() on both frames before merging', explain: 'Cartesian product from duplicate keys. Check both DataFrames for duplicates before merging.' },
      { prompt: 'df.apply(complex_func, axis=1) is very slow on 10M rows. First attempt to speed up:', options: ['Use asyncio', 'Rewrite complex_func in Cython', 'Vectorise: express logic using numpy/pandas operations on columns', 'Use multiprocessing'], correct: 'Vectorise: express logic using numpy/pandas operations on columns', explain: 'apply(axis=1) is Python-speed row iteration. The vectorised rewrite is usually possible and 10–100× faster.' },
    ],
  },

  // ── Ch8: scipyStatsQuiz ──────────────────────────────────────────────────────
  scipyStatsQuiz: {
    key: 'scipyStatsQuiz', title: 'scipy.stats Distributions', icon: '📊',
    subtitle: 'Distributions and their parameters — finance applications',
    type: 'match',
    pairs: [
      { left: 'norm.ppf(0.01)', right: '1% VaR threshold (z-score ≈ -2.33)' },
      { left: 'norm.cdf(1.96)', right: 'P(Z ≤ 1.96) ≈ 0.975' },
      { left: 't.fit(returns)', right: 'MLE fit of Student-t to return data' },
      { left: 'stats.skew(returns)', right: 'Measure of return distribution asymmetry' },
      { left: 'stats.kurtosis(returns)', right: 'Excess kurtosis — fat tail measure' },
    ],
  },

  // ── Ch8: hypothesisTestingQuiz ───────────────────────────────────────────────
  hypothesisTestingQuiz: {
    key: 'hypothesisTestingQuiz', title: 'Hypothesis Testing', icon: '🔬',
    subtitle: 'p-values, significance, and the multiple comparisons trap',
    type: 'mcq',
    questions: [
      { prompt: 'ttest_1samp(returns, 0) gives p=0.03. At α=0.05, conclusion?', options: ['Accept H0: no alpha', 'Reject H0: alpha is significant', 'Cannot conclude — need more data', 'Depends on t-statistic sign'], correct: 'Reject H0: alpha is significant', explain: 'p=0.03 < α=0.05. Reject the null hypothesis (zero mean return). Evidence of non-zero alpha.' },
      { prompt: 'You test 100 strategies at α=0.05. How many false positives expected by chance?', options: ['0', '1', '5', '10'], correct: '5', explain: '100 tests × 0.05 significance level = 5 expected false positives from random chance alone.' },
      { prompt: 'Bonferroni correction for 100 tests at α=0.05 gives new threshold:', options: ['0.05', '0.005', '0.0005', '0.5'], correct: '0.0005', explain: 'Bonferroni: α/n = 0.05/100 = 0.0005. Very conservative — controls family-wise error rate.' },
      { prompt: 'stats.jarque_bera(returns) — what does it test?', options: ['Autocorrelation', 'Stationarity', 'Normality via skewness and kurtosis', 'Heteroskedasticity'], correct: 'Normality via skewness and kurtosis', explain: 'Jarque-Bera tests whether skewness and excess kurtosis match a normal distribution. Common in finance.' },
      { prompt: 'p=0.021 after testing 150 parameter combinations. Is this significant after Bonferroni?', options: ['Yes — p<0.05', 'No — threshold is 0.05/150=0.00033', 'Marginally', 'Depends on effect size'], correct: 'No — threshold is 0.05/150=0.00033', explain: 'Bonferroni: 0.05/150 = 0.000333. p=0.021 >> 0.000333. Not significant after correction.' },
    ],
  },

  // ── Ch8: optimisationQuiz ────────────────────────────────────────────────────
  optimisationQuiz: {
    key: 'optimisationQuiz', title: 'scipy.optimize', icon: '🎯',
    subtitle: 'Minimisation, root finding, and their finance applications',
    type: 'match',
    pairs: [
      { left: 'scipy.optimize.minimize', right: 'Sharpe maximisation with constraints' },
      { left: 'scipy.optimize.brentq(f, a, b)', right: 'Find root of f — used for implied vol' },
      { left: 'scipy.optimize.curve_fit', right: 'Fit parametric model to observed data' },
      { left: 'method="SLSQP"', right: 'Handles equality and inequality constraints' },
      { left: 'bounds=[(0,1)]*n', right: 'Long-only constraint (weights ≥ 0)' },
    ],
  },

  // ── Ch8: interpolationQuiz ───────────────────────────────────────────────────
  interpolationQuiz: {
    key: 'interpolationQuiz', title: 'scipy.interpolate', icon: '📉',
    subtitle: 'Interpolation for vol surfaces and yield curves',
    type: 'mcq',
    questions: [
      { prompt: 'You have implied vol at 5 strikes. Need it at 100 strikes. Best approach?', options: ['Linear extrapolation', 'CubicSpline interpolation', 'Use the nearest known strike', 'Average all 5'], correct: 'CubicSpline interpolation', explain: 'CubicSpline passes through all known points with smooth derivatives. Linear creates kinks causing unrealistic Greeks.' },
      { prompt: 'Linear vs cubic interpolation for a yield curve?', options: ['Linear — simpler', 'Cubic spline — no kinks at knot points', 'Nearest neighbour', 'No interpolation needed'], correct: 'Cubic spline — no kinks at knot points', explain: 'Kinks in a yield curve imply arbitrage opportunities. Cubic spline is smooth — standard in fixed income.' },
      { prompt: 'interp1d(x, y)(x_new) where x_new is outside [min(x), max(x)]:', options: ['Returns NaN', 'Returns nearest boundary value', 'Raises ValueError by default', 'Extrapolates linearly'], correct: 'Raises ValueError by default', explain: 'bounds_error=True by default. Set bounds_error=False, fill_value="extrapolate" to allow extrapolation.' },
      { prompt: 'Nearest use case for scipy.interpolate in options trading:', options: ['Option pricing', 'Vol surface — interpolate IV between known strikes/expiries', 'Order routing', 'Risk limits'], correct: 'Vol surface — interpolate IV between known strikes/expiries', explain: 'Market provides IV at discrete strikes and expiries. CubicSpline/griddata gives IV at any point on the surface.' },
    ],
  },

  // ── Ch8: matplotlibAnatomy ───────────────────────────────────────────────────
  matplotlibAnatomy: {
    key: 'matplotlibAnatomy', title: 'matplotlib Anatomy', icon: '📊',
    subtitle: 'Figure, Axes, and the OO interface',
    type: 'match',
    pairs: [
      { left: 'fig, ax = plt.subplots()', right: 'Create Figure and Axes objects (OO interface)' },
      { left: 'ax.set_xlabel("Date")', right: 'Label the x-axis' },
      { left: 'plt.tight_layout()', right: 'Prevent label overlap / clipping' },
      { left: 'fig.savefig("chart.pdf")', right: 'Save as vector PDF — infinitely scalable' },
      { left: 'ax.twinx()', right: 'Add second y-axis sharing same x-axis' },
    ],
  },

  // ── Ch8: seabornQuiz ─────────────────────────────────────────────────────────
  seabornQuiz: {
    key: 'seabornQuiz', title: 'seaborn Plots', icon: '🎨',
    subtitle: 'Match the chart to the question it answers',
    type: 'match',
    pairs: [
      { left: 'sns.histplot(x="return", kde=True)', right: 'Distribution shape + density estimate' },
      { left: 'sns.heatmap(corr, annot=True)', right: 'Correlation matrix visualisation' },
      { left: 'sns.pairplot(df)', right: 'All pairwise scatter plots at once' },
      { left: 'sns.boxplot(x="sector", y="return")', right: 'Return distribution by sector' },
      { left: 'sns.lineplot(x="date", y="price", hue="ticker")', right: 'Multi-ticker price history' },
    ],
  },

  // ── Ch8: plotlyQuiz ──────────────────────────────────────────────────────────
  plotlyQuiz: {
    key: 'plotlyQuiz', title: 'Plotly Interactive Charts', icon: '📱',
    subtitle: 'Plotly Express vs Graph Objects and their use cases',
    type: 'mcq',
    questions: [
      { prompt: 'Key advantage of Plotly over matplotlib?', options: ['Faster rendering', 'Interactive: hover tooltips, zoom, pan', 'Better default colours', 'Smaller file size'], correct: 'Interactive: hover tooltips, zoom, pan', explain: 'Plotly renders to HTML with JavaScript interactivity. Hover shows exact values. matplotlib is static.' },
      { prompt: 'px.scatter(df, x="factor", y="return", hover_data=["ticker"]) — hovering shows:', options: ['Only x,y values', 'ticker name plus x,y', 'Full row data', 'Nothing extra'], correct: 'ticker name plus x,y', explain: 'hover_data adds extra columns to the tooltip. Critical for identifying outlier points.' },
      { prompt: 'go.Candlestick requires:', options: ['open, close only', 'open, high, low, close', 'high, low, volume', 'open, close, volume'], correct: 'open, high, low, close', explain: 'OHLC data defines a candlestick. Body is open-close, wicks are high-low.' },
      { prompt: 'fig.write_html("chart.html") vs fig.write_image("chart.png"):', options: ['Same output', 'HTML is interactive; PNG is static', 'PNG is higher quality', 'HTML requires server'], correct: 'HTML is interactive; PNG is static', explain: 'write_html produces a self-contained interactive file. write_image exports a static raster image.' },
    ],
  },

  // ── Ch8: fullStackBuilder ────────────────────────────────────────────────────
  fullStackBuilder: {
    key: 'fullStackBuilder', title: 'Full Stack Workflow', icon: '🔬',
    subtitle: 'Data → Analysis → Visualisation pipeline',
    type: 'build',
    buildQuestions: [
      { prompt: 'Given a returns DataFrame, write the one-liner for a 3×1 figure with GridSpec (top full-width, two bottom charts).', answer: 'fig = plt.figure(figsize=(15,10))\ngs = GridSpec(2, 2, figure=fig)\nax1 = fig.add_subplot(gs[0, :])\nax2 = fig.add_subplot(gs[1, 0])\nax3 = fig.add_subplot(gs[1, 1])', hint: 'GridSpec(2,2); gs[0,:] spans full width; gs[1,0] and gs[1,1] are bottom panels', explain: 'GridSpec allows mixed-size subplots. gs[0,:] spans all columns. gs[1,0] and gs[1,1] share the bottom row.' },
      { prompt: 'Write the drawdown fill_between call for a portfolio drawdown Series dd (values ≤ 0).', answer: 'ax.fill_between(dd.index, dd, 0, alpha=0.6, color="red")', hint: 'ax.fill_between(dd.index, dd, 0, alpha=0.6, color="red")', explain: 'fill_between fills the area between the drawdown series and 0. Red with alpha for transparency.' },
      { prompt: 'Overlay a fitted normal distribution on a return histogram.', answer: 'x = np.linspace(returns.min(), returns.max(), 100)\nax.plot(x, stats.norm.pdf(x, *stats.norm.fit(returns)), "r-")', hint: 'x=np.linspace(...); ax.plot(x, stats.norm.pdf(x, *stats.norm.fit(returns)))', explain: 'stats.norm.fit fits mu and sigma by MLE. norm.pdf generates the density curve. Overlaid on histogram.' },
    ],
  },

  // ── Ch8: ch8FinalBoss ────────────────────────────────────────────────────────
  ch8FinalBoss: {
    key: 'ch8FinalBoss', title: 'Final Boss: Python Mastery', icon: '👑',
    subtitle: 'Spanning all 8 chapters — the complete test',
    type: 'mcq',
    questions: [
      { prompt: 'Fastest way to get top 20 tickers by trailing 252-day Sharpe (most recent date)?', options: ['Loop over tickers', 'rolling_sharpe.iloc[-1].nlargest(20).index.tolist()', 'Sort then slice', 'groupby().rank()'], correct: 'rolling_sharpe.iloc[-1].nlargest(20).index.tolist()', explain: 'iloc[-1] = most recent row. nlargest(20) = top 20 without full sort. .index = ticker names.' },
      { prompt: 'ttest_1samp(returns, 0) gives p=0.021 after testing 150 params. Significant?', options: ['Yes — p<0.05', 'No — Bonferroni threshold is 0.0003', 'Borderline', 'Need effect size'], correct: 'No — Bonferroni threshold is 0.0003', explain: 'Bonferroni: 0.05/150=0.000333. p=0.021 >> 0.000333. False positive from searching 150 combinations.' },
      { prompt: 'pool.map(fn, args) fails with \'Can\\\'t pickle lambda\'. Fix?', options: ['Use ProcessPoolExecutor', 'Define fn at module level, not as lambda', 'Use asyncio instead', 'Use starmap'], correct: 'Define fn at module level, not as lambda', explain: 'multiprocessing pickles functions. Lambdas and local functions cannot be pickled. Module-level functions can.' },
      { prompt: 'apply(axis=1) is very slow on 1M rows. Best first step?', options: ['Numba', 'Vectorise using numpy/pandas column operations', 'multiprocessing', 'asyncio'], correct: 'Vectorise using numpy/pandas column operations', explain: 'apply(axis=1) = Python-speed row loop. Vectorised column ops = C-speed. 10–100× speedup.' },
      { prompt: 'Type hint for: takes list[float], a Callable[[float],float], returns list[float]:', options: ['def f(d,fn): ...', 'def f(d: list, fn: callable) -> list: ...', 'def f(d: list[float], fn: Callable[[float],float]) -> list[float]: ...', 'No annotation possible'], correct: 'def f(d: list[float], fn: Callable[[float],float]) -> list[float]: ...', explain: 'Specific generics. list[float] not list. Callable[[float],float] specifies exact signature.' },
    ],
  },
};
