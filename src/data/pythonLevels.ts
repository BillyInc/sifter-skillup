// ⚡ Sifter Skill_Up — Python Mastery Program
// Standalone shared track: 80 levels across 8 chapters (IDs 2001–2080)
// General concept first → financial application second on every level
// Wires into: Quant Trader, Quant Researcher, Quant Developer, Data Science, and any future track requiring Python

import type { Level } from './levels';
export type { Level };

export type PythonMechanic =
  | 'match3'
  | 'memory'
  | 'chain'
  | 'calibration'
  | 'codeTrace';

export interface PythonLevel extends Omit<Level, 'mechanic'> {
  mechanic: PythonMechanic;
  chapter: number;
  simulatorLesson?: string;
  isBoss?: boolean;
  calibrationData?: {
    scenario: string;
    baseRate: number;
    evidence: string;
    correctPosterior: number;
    tolerance: number;
  };
}

export const PYTHON_LEVELS: Record<number, PythonLevel> = {

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1 — FOUNDATIONS (2001–2010)
// Variables · types · operators · strings · control flow · loops · functions · scope · lambda
// ═══════════════════════════════════════════════════════════════════════════════

  2001: {
    simulatorLesson: 'pythonIntro',
    id: 2001, chapter: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'What Python Is and How It Works',
    fact: `Python is a high-level, interpreted, dynamically-typed language. "Interpreted" means Python executes your code line by line through a runtime called CPython — no compilation step needed. "High-level" means you write in human-readable syntax rather than machine instructions. "Dynamically typed" means variables do not need declared types — Python figures that out at runtime.

How execution works: you write .py files → the Python interpreter reads them top to bottom → each line is compiled to bytecode → CPython executes that bytecode. The REPL (Read-Eval-Print Loop) lets you execute one line at a time interactively.

Python's strengths: readable syntax that looks like pseudocode, enormous standard library, the world's largest ecosystem of third-party packages (pip), and first-class support in every cloud platform and data tool.

Python's weaknesses: slower than compiled languages (C, C++, Rust) for raw CPU-bound computation. The GIL (Global Interpreter Lock) prevents true multi-threading for CPU work. For performance-critical paths, Python calls into C libraries (numpy, pandas) or uses JIT compilation (numba).

In finance and data science: Python is the dominant research language at every major quantitative fund, bank, and tech company. Bloomberg, QuantLib, and every major ML framework expose Python APIs.`,
    plain: `Think of Python as the English of programming languages — not the fastest, but the most widely spoken and the one everyone agrees to use so they can work together. When a quant researcher at Citadel and a data scientist at Google need to share code, they share Python. The speed gap with C++ is real but mostly irrelevant for research — numpy and pandas do their heavy lifting in C under the hood.`,
    stars: [300, 400, 500], target: 500, coins: 25,
  },

  2002: {
    id: 2002, chapter: 1, mechanic: 'memory', tier: 'beginner',
    topic: 'Variables, Types, and Dynamic Typing',
    fact: `Variables are names that point to objects in memory. x = 42 does not declare x as an integer — it creates an integer object 42 and makes x point to it. x = "hello" then makes x point to a string object instead. The integer still exists in memory until garbage-collected.

Core built-in types:
- int: whole numbers — 42, -7, 0
- float: decimal numbers — 3.14, -0.001, 1e6
- str: text — "hello", 'world', """multiline"""
- bool: True or False (subclass of int — True == 1, False == 0)
- NoneType: the singleton None, representing absence of value
- complex: complex numbers — 3+2j (useful in signal processing)

Type introspection: type(x) returns the type object. isinstance(x, float) returns True or False. isinstance handles inheritance correctly — isinstance(True, int) is True because bool subclasses int.

Implicit conversion (coercion): Python does not automatically convert between types in most cases. 1 + "2" raises TypeError. You must be explicit: str(1) + "2" = "12" or int("2") + 1 = 3.

In finance: price = 100 (int) and price = 100.0 (float) behave differently in division edge cases and type checks. Convention: always use float for monetary values and return percentages (0.05 not 5%).`,
    plain: `Dynamic typing is convenient — you never write "int x = 42". The tradeoff: type errors appear at runtime, not compile time. A function that expects a float but receives a string will crash when it runs, not when you write it. This is why production Python code uses type hints (covered in Chapter 5) to get the benefits of dynamic typing during development and static checking before deployment.`,
    stars: [300, 400, 500], target: 500, coins: 25,
    simulatorLesson: 'pythonTypeTracer',
  },

  2003: {
    simulatorLesson: 'arithmeticOps',
    id: 2003, chapter: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'Arithmetic, Comparison, and Logical Operators',
    fact: `Arithmetic operators: + (add), - (subtract), * (multiply), / (true division → always float), // (floor division → rounds toward −∞), % (modulo → remainder), ** (exponentiation).

Key details: 7/2 = 3.5, 7//2 = 3, -7//2 = -4 (floors toward negative infinity). 2**10 = 1024. 10%3 = 1.

Comparison operators return bool: == (equal), != (not equal), < > <= >= (ordered). Critical: = is assignment, == is equality. if x = 5 is a SyntaxError in Python.

Logical operators: and, or, not. Short-circuit: in x and y, if x is False, y is never evaluated. In x or y, if x is True, y is never evaluated. This is used for safe defaults: value = user_input or "default".

Augmented assignment: x += 1 is shorthand for x = x + 1. Works for all arithmetic operators.

Operator precedence (high to low): ** → unary +/- → * / // % → + - → comparisons → not → and → or. Use parentheses to make precedence explicit.

In finance:
- Simple return: (end - start) / start
- Log return: math.log(end / start)  ← requires import math
- Annualised return: (1 + daily_return) ** 252 - 1
- Sharpe approximation: mean_return / std_return * 252**0.5`,
    plain: `The most important thing to memorise: / always gives a float in Python 3. 10/5 = 2.0, not 2. If you need an integer result, use //. The most common bug for beginners: writing if x = 5 (assignment) instead of if x == 5 (comparison). Python's syntax error catches this — unlike C/C++ where it silently creates a bug.`,
    stars: [300, 400, 500], target: 500, coins: 25,
  },

  2004: {
    simulatorLesson: 'stringMethods',
    id: 2004, chapter: 1, mechanic: 'memory', tier: 'beginner',
    topic: 'Strings: Creation, Methods, and Formatting',
    fact: `Strings are immutable sequences of Unicode characters. Created with single quotes, double quotes, or triple quotes (multiline). Escape sequences: \\n (newline), \\t (tab), \\\\ (backslash). Raw strings r"..." ignore escape sequences — useful for file paths on Windows.

Indexing and slicing (same as lists): s[0] first char, s[-1] last char, s[1:4] characters 1–3, s[::-1] reversed.

Common string methods:
- s.upper(), s.lower(), s.title()
- s.strip(), s.lstrip(), s.rstrip() — remove whitespace
- s.split(sep) → list of substrings
- sep.join(list) → single string
- s.replace(old, new)
- s.startswith(prefix), s.endswith(suffix)
- s.find(sub) → index or -1
- s.count(sub) → occurrences
- s.isdigit(), s.isalpha(), s.isspace()

f-strings (Python 3.6+): f"Hello {name}, price is ${price:.2f}". Format specifiers: :.2f (2 decimal float), :,d (integer with commas), :.1% (percentage), :>10 (right-align width 10), :^10 (centre).

In finance: f"Sharpe: {sharpe:.2f} | Max DD: {max_dd:.1%} | Ann Ret: {ann_ret:.1%}" — formatting performance reports. Parsing CSV ticker data uses split() and strip(). Ticker normalisation: ticker.upper().strip().`,
    plain: `f-strings replaced % formatting and .format() — use them exclusively. The two format specifiers you will use most in finance: :.2f for prices (two decimal places) and :.1% for returns and percentages (converts 0.05 to "5.0%"). Memorise those two and every performance report you write will look correct.`,
    stars: [300, 400, 500], target: 500, coins: 25,
  },

  2005: {
    id: 2005, chapter: 1, mechanic: 'codeTrace', tier: 'beginner',
    topic: 'Control Flow: if, elif, else',
    fact: `Python uses indentation (4 spaces, not tabs) to define code blocks. This is not style — it is syntax. A misplaced indent creates a different program.

Structure:
if condition:
    # runs if condition is True
elif other_condition:
    # runs if first condition is False and this is True
else:
    # runs if all conditions are False

Conditions can be any expression that evaluates to truthy or falsy.
Falsy values: 0, 0.0, "", [], {}, set(), None, False.
Everything else is truthy.

Compound conditions: if price > 100 and volume > 1_000_000:
Using parentheses for clarity: if (price > 100) and (price < 200):

Ternary (inline if): result = "buy" if signal > 0 else "sell"

Chained comparisons (Pythonic): if 0 < price < 200: is valid Python and means price > 0 and price < 200.

In finance:
if sharpe > 2.0:
    sizing = "full"
elif sharpe > 1.0:
    sizing = "half"
elif sharpe > 0.5:
    sizing = "quarter"
else:
    sizing = "flat"

Risk checks: if portfolio_value < margin_requirement: trigger_margin_call()`,
    plain: `Indentation is Python's most distinctive feature. The rule: everything inside an if block is indented exactly 4 spaces. When the indentation returns to the same level as if, Python knows the block is over. Most editors handle this automatically. The trap: mixing spaces and tabs — Python 3 raises an error. Configure your editor to insert spaces when you press Tab.`,
    stars: [320, 420, 520], target: 520, coins: 28,
    simulatorLesson: 'pythonControlFlow',
  },

  2006: {
    simulatorLesson: 'loopTracer',
    id: 2006, chapter: 1, mechanic: 'memory', tier: 'beginner',
    topic: 'Loops: for, while, break, continue',
    fact: `for loop iterates over any iterable object:
- for i in range(10): — integers 0 to 9
- for item in my_list: — each element
- for i, item in enumerate(my_list): — index and element together
- for k, v in my_dict.items(): — key-value pairs simultaneously

range(start, stop, step): range(0, 10, 2) gives 0, 2, 4, 6, 8. Stop is exclusive.

while loop runs while condition is True:
while balance > 0 and not margin_called:
    execute_trade()

Loop control:
- break: exit the loop immediately
- continue: skip rest of current iteration, go to next
- else clause on loops: runs if loop completed without a break

Nested loops: the inner loop completes fully for each iteration of the outer loop. O(n²) behaviour — avoid for large data.

zip() pairs elements from two iterables: for price, volume in zip(prices, volumes):

The most important rule in data science: if you are looping over a numpy array to compute something, you are almost certainly doing it wrong. numpy operations work on entire arrays in C — they are 100× faster than Python for-loops over the same data. Python loops are for control flow (iterating over strategies, time periods, files), not for math.

In finance: backtesting loops iterate over time series. Monte Carlo simulations loop over N paths. Portfolio rebalancing loops over positions.`,
    plain: `The numpy rule is worth repeating: never write for price in price_array: total += price when you can write price_array.sum(). The Python loop does one addition at a time in Python. numpy.sum() does all additions at once in C. For 1 million prices, the numpy version is literally 100× faster. You will internalise this rule after the numpy chapter — for now just know it exists.`,
    stars: [320, 420, 520], target: 520, coins: 28,
  },

  2007: {
    simulatorLesson: 'functionCallTracer',
    id: 2007, chapter: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'Functions: Definition, Arguments, and Return Values',
    fact: `Functions are defined with def, called by name with parentheses, and optionally return a value with return. A function without return implicitly returns None.

Argument types:
- Positional: required, order matters — def f(x, y):
- Default: optional, has fallback — def f(x, y=10):
- Keyword: called by name — f(x=5, y=10)
- *args: captures extra positional args as a tuple
- **kwargs: captures extra keyword args as a dict
- Keyword-only (after *): def f(x, *, required_keyword):

def compute_return(start_price, end_price, annualise=False, periods=252):
    r = (end_price - start_price) / start_price
    if annualise:
        r = (1 + r) ** periods - 1
    return r

Multiple return values (actually returns a tuple):
def stats(data):
    return data.mean(), data.std(), len(data)
mean, std, n = stats(returns)  # tuple unpacking

Docstrings: triple-quoted string immediately after def describes what the function does, its arguments, and what it returns. Not optional in professional code.

Functions are first-class objects: they can be stored in variables, passed as arguments, and returned from other functions. This enables powerful patterns covered in Chapter 3.`,
    plain: `The single most important software engineering principle: if you write the same logic twice, put it in a function. A sharpe_ratio() function called 50 times means a bug fix in one place fixes it everywhere. If that logic is copy-pasted 50 times, you have 50 places to fix. Every quant codebase has functions like sharpe, max_drawdown, annualise, rolling_beta — write them once, use them everywhere.`,
    stars: [340, 440, 540], target: 540, coins: 30,
  },

  2008: {
    id: 2008, chapter: 1, mechanic: 'codeTrace', tier: 'intermediate',
    topic: 'Scope: The LEGB Rule',
    fact: `Python resolves variable names using LEGB order:
L — Local: variables defined inside the current function
E — Enclosing: variables in the outer function (for nested functions)
G — Global: variables at module (file) level
B — Built-in: Python's built-in names (len, range, print, etc.)

Python searches these in order and uses the first match found.

x = "global"
def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)  # "local" — found at L
    inner()

Modifying globals: a function can read a global but cannot reassign it without global keyword:
count = 0
def increment(): global count; count += 1  # global keyword needed for reassignment

nonlocal keyword: modifies a variable in the enclosing (not global) scope.

Common mistakes:
- Shadowing a built-in: list = [1,2,3] breaks subsequent list() calls — you overwrote the built-in
- Assuming a variable is global when it is local: if you assign to x anywhere in a function, Python treats x as local throughout that function, even before the assignment line

Best practice for data science: avoid global mutable state entirely. Pass data as function arguments and return results. A function that reads a global portfolio_value gives different results depending on when you call it — that is a hidden dependency that makes code unpredictable.`,
    plain: `The LEGB rule seems academic until you hit the bug it explains. The classic: you write x = 10 inside a function expecting to use a global x, but Python sees the assignment and treats x as local throughout the whole function — so reading x before the assignment raises UnboundLocalError. The fix: either pass x as an argument or use the global keyword. The right answer in almost every case is to pass it as an argument.`,
    stars: [340, 440, 540], target: 540, coins: 30,
    simulatorLesson: 'pythonScopeTracer',
  },

  2009: {
    simulatorLesson: 'lambdaTracer',
    id: 2009, chapter: 1, mechanic: 'memory', tier: 'intermediate',
    topic: 'Lambda Functions and Functional Tools',
    fact: `lambda creates an anonymous single-expression function:
double = lambda x: x * 2
add = lambda x, y: x + y
clamp = lambda x, lo, hi: max(lo, min(hi, x))

Lambdas are most useful as inline arguments to higher-order functions:
- sorted(data, key=lambda x: x["sharpe"], reverse=True)
- max(positions, key=lambda p: p.unrealised_pnl)
- min(strikes, key=lambda k: abs(k - spot_price))

Built-in functional tools:
- map(func, iterable) → iterator applying func to each element
- filter(func, iterable) → iterator keeping elements where func returns True
- zip(iter1, iter2) → iterator of tuples pairing elements
- enumerate(iterable, start=0) → iterator of (index, element) tuples
- any(iterable) → True if any element is truthy
- all(iterable) → True if all elements are truthy

Modern Python preference: list comprehensions are often more readable than map/filter.
# Less Pythonic:
results = list(map(lambda x: x**2, data))
# More Pythonic:
results = [x**2 for x in data]

But sorted() with a lambda key is universally idiomatic and preferred over alternatives.

In finance:
ranked = sorted(strategies, key=lambda s: s.sharpe_ratio, reverse=True)
profitable = list(filter(lambda t: t.pnl > 0, trades))
closest_strike = min(strikes, key=lambda k: abs(k - current_price))`,
    plain: `The lambda + sorted() pattern is the one you will use constantly. Sorting a list of strategy objects by Sharpe ratio, a list of trades by size, a list of positions by unrealised PnL — all done with sorted(data, key=lambda x: x.attribute, reverse=True). Memorise this pattern; it appears everywhere in Python data work.`,
    stars: [360, 460, 560], target: 560, coins: 32,
  },

  2010: {
    simulatorLesson: 'ch1BossBuilder',
    id: 2010, chapter: 1, mechanic: 'calibration', tier: 'intermediate',
    topic: 'Chapter 1 Boss: Foundations Gauntlet',
    fact: `BOSS LEVEL. Five challenges — answer from memory:

(1) Write annualise(r, n=252) that converts a daily return to an annualised return.

(2) Write is_weekday(dow) that returns True for Mon–Fri (dow: 0=Mon, 6=Sun).

(3) What does this produce: sorted(["TSLA","AAPL","GOOG","MSFT"], key=lambda x: x[-1])?

(4) Explain the bug: balance = 1000; def withdraw(amount): balance -= amount. How do you fix it two different ways?

(5) What is the output:
x = 5
def f():
    print(x)
    x = 10
f()

Answers test: function definitions with defaults, control flow, lambda+sorted, scope, and the UnboundLocalError gotcha.`,
    plain: `Answers: (1) return (1 + r)**n - 1. (2) return dow < 5. (3) Sorts by last character → ["TSLA","AAPL","MSFT","GOOG"] (A, L, T, G alphabetically). (4) Fix 1: add global balance inside the function. Fix 2: pass balance as parameter and return the new value (preferred). (5) UnboundLocalError — Python sees x = 10 inside f() and treats x as local throughout, including the print line before the assignment.`,
    stars: [400, 520, 640], target: 640, coins: 40,
    isBoss: true,
    calibrationData: {
      scenario: 'def pct_return(start, end): return (end - start) / start. You call pct_return(0, 100). What happens and what should you do?',
      baseRate: 0,
      evidence: 'ZeroDivisionError — start is 0. Never silently return 0 or None — that hides the error. Correct fix: if start == 0: raise ValueError("start price cannot be zero"). Let the caller handle the error explicitly.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2 — DATA STRUCTURES (2011–2020)
// Lists · tuples · dicts · sets · comprehensions · generators · collections · file I/O
// ═══════════════════════════════════════════════════════════════════════════════

  2011: {
    id: 2011, chapter: 2, mechanic: 'match3', tier: 'beginner',
    topic: 'Lists: The Workhorse Sequence',
    fact: `Lists are ordered, mutable sequences of any objects: items = [1, "hello", 3.14, True].

Creation: [] empty list. list() constructor. list(range(10)).

Indexing: items[0] first. items[-1] last. items[-2] second to last.
Slicing: items[1:4] elements 1–3. items[::2] every other. items[::-1] reversed copy.

Mutation methods:
- append(x): add to end — O(1)
- extend([x,y,z]): add multiple — O(k)
- insert(i, x): insert at index — O(n)
- remove(x): remove first occurrence by value — O(n)
- pop(i): remove and return at index — O(n), pop() from end is O(1)
- sort(): in-place sort. sorted() returns new list.
- reverse(): in-place reverse. reversed() returns iterator.
- clear(): remove all elements

Other: len(lst), x in lst (O(n) search), lst.count(x), lst.index(x), lst1 + lst2 (concatenation — creates new list).

The aliasing trap — the most common beginner bug:
a = [1, 2, 3]
b = a          # b and a point to the SAME list
b.append(4)    # modifies the list both names point to
print(a)       # [1, 2, 3, 4] — surprise!
Fix: b = a.copy() or b = a[:]

In finance: lists store price series, trade logs, position records. Daily close prices for 252 trading days. A sequence of executed orders. Rolling window buffers.`,
    plain: `The aliasing trap is the most common Python bug beginners write and the hardest to debug — because Python doesn't tell you anything is wrong. "b = a" never copies anything. It creates a second name pointing at the same list. This matters enormously in backtesting: if you pass a price list to a function and that function modifies it, your original data is corrupted. Always .copy() when you want independence.`,
    stars: [320, 420, 520], target: 520, coins: 28,
    simulatorLesson: 'pythonListOps',
  },

  2012: {
    simulatorLesson: 'tupleTracer',
    id: 2012, chapter: 2, mechanic: 'memory', tier: 'beginner',
    topic: 'Tuples: Immutable Sequences and Unpacking',
    fact: `Tuples are ordered, immutable sequences. Once created, elements cannot be changed.

Creation: (1, 2, 3) or 1, 2, 3 (parentheses optional). Single-element tuple: (1,) — the trailing comma is required. Empty tuple: ().

Immutability: t[0] = 99 raises TypeError. Tuples themselves are immutable, but mutable objects inside (like lists) can still be modified.

Why use tuples over lists?
1. Immutability signals "this data should not change"
2. Tuples are hashable (can be dict keys or set members) — lists cannot
3. Slightly faster than lists
4. Clearer semantics: (lat, lon) implies a fixed coordinate pair

Tuple unpacking: x, y, z = (1, 2, 3). Extended unpacking: first, *rest = (1, 2, 3, 4) — first=1, rest=[2,3,4]. Swap without temp: a, b = b, a.

Named tuples: from collections import namedtuple
OHLC = namedtuple('OHLC', ['open', 'high', 'low', 'close'])
bar = OHLC(100.0, 105.0, 98.5, 103.2)
bar.high  # 105.0 — named access

Functions returning multiple values use implicit tuples:
def analyse(data): return mean, std, skew
m, s, sk = analyse(returns)  # unpacking

In finance: (price, timestamp) pairs. OHLCV bars. Function return values: (sharpe, max_drawdown, ann_return). Fixed parameters that should never be mutated.`,
    plain: `Convention: use tuples for heterogeneous data where position has meaning — (price, timestamp) means something. Use lists for homogeneous collections you might grow — [price1, price2, price3]. A tuple screams "this is a fixed record". A list screams "this is a growable collection". Named tuples give you the best of both: immutability plus readable attribute access.`,
    stars: [320, 420, 520], target: 520, coins: 28,
  },

  2013: {
    id: 2013, chapter: 2, mechanic: 'match3', tier: 'beginner',
    topic: 'Dictionaries: Key-Value Lookup',
    fact: `Dictionaries store key-value pairs. Keys must be hashable (strings, numbers, tuples). Values can be anything.

Creation: {} or dict(). d = {"AAPL": 150.0, "GOOG": 2800.0}.

Access and mutation:
- d["AAPL"] → 150.0. Raises KeyError if missing.
- d.get("MSFT") → None. d.get("MSFT", 0.0) → 0.0 default. Never raises KeyError.
- d["NVDA"] = 420.0 — add or update
- del d["GOOG"] — delete
- d.pop("AAPL") — delete and return value

Iteration:
- for k in d: — iterates over keys
- for v in d.values(): — iterates over values
- for k, v in d.items(): — iterates over key-value pairs

Other: len(d), k in d (O(1) lookup), d.keys(), d.update(other_dict).

Dict merging: merged = {**d1, **d2} (d2 values win on key conflicts). Python 3.9+: merged = d1 | d2.

Dict comprehension: {k: v*2 for k, v in prices.items() if v > 100}

Why O(1) lookup matters: a dict with 10 million entries finds any key instantly. A list with 10 million items requires scanning up to 10 million items for a membership check.

In finance: position books {ticker: shares}. Price caches {ticker: price}. Strategy parameters {name: value}. Mapping tickers to objects. Configuration dictionaries.`,
    plain: `Dicts are the most used data structure after lists. The O(1) lookup is the key insight: no matter how big the dict, finding a value by key takes constant time. A portfolio of 10,000 positions is as fast to look up as a portfolio of 10. This is why position books, price caches, and index mappings are always dicts — never lists you would need to scan through.`,
    stars: [320, 420, 520], target: 520, coins: 28,
    simulatorLesson: 'pythonDictOps',
  },

  2014: {
    simulatorLesson: 'setOpsTracer',
    id: 2014, chapter: 2, mechanic: 'memory', tier: 'beginner',
    topic: 'Sets: Unique Collections and Fast Membership',
    fact: `Sets are unordered collections of unique hashable elements. Duplicates are automatically removed.

Creation: {1, 2, 3} or set([1, 2, 2, 3]) → {1, 2, 3}. Empty set: set() — never {} (that creates an empty dict).

Mutation: s.add(x), s.remove(x) (KeyError if missing), s.discard(x) (no error if missing), s.pop() (removes arbitrary element).

Set operations (mirror mathematical set theory):
- s1 | s2 or s1.union(s2) — all elements in either
- s1 & s2 or s1.intersection(s2) — elements in both
- s1 - s2 or s1.difference(s2) — elements in s1 not in s2
- s1 ^ s2 or s1.symmetric_difference(s2) — elements in exactly one
- s1 <= s2: s1 is a subset of s2
- s1 >= s2: s1 is a superset of s2

Membership: x in s is O(1) — much faster than x in list for large collections.

Frozenset: immutable set — frozenset({1, 2, 3}). Can be used as dict keys or set members.

In finance:
universe1 = {"AAPL", "GOOG", "TSLA", "NVDA"}
universe2 = {"GOOG", "MSFT", "NVDA", "AMZN"}
overlap = universe1 & universe2          # {"GOOG", "NVDA"}
all_tickers = universe1 | universe2      # 6 tickers
unique_to_u1 = universe1 - universe2    # {"AAPL", "TSLA"}

Deduplication: unique = set(all_tickers_with_duplicates).
Eligibility checks: if ticker in eligible_universe: — instant even for 50,000-ticker universes.`,
    plain: `The practical use case for sets: membership testing on large collections and set algebra on instrument universes. If you have a list of 50,000 eligible tickers and check membership thousands of times during a backtest, list membership is O(n) — potentially 50,000 checks per lookup. Set membership is O(1) — one lookup regardless of size. Convert any collection you only check membership in to a set.`,
    stars: [320, 420, 520], target: 520, coins: 28,
  },

  2015: {
    id: 2015, chapter: 2, mechanic: 'codeTrace', tier: 'intermediate',
    topic: 'Comprehensions: List, Dict, Set, Generator',
    fact: `Comprehensions express "transform this collection" in a single readable expression.

List comprehension: [expression for item in iterable if condition]
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

Dict comprehension: {key_expr: val_expr for item in iterable if condition}
upper_prices = {k.upper(): v for k, v in prices.items()}
weights = {t: v / total for t, v in positions.items()}

Set comprehension: {expression for item in iterable}
active_tickers = {trade.ticker for trade in trades if trade.is_open}

Generator expression: (expression for item in iterable) — lazy, produces one item at a time
total = sum(p * q for p, q in zip(prices, quantities))  # never builds a list

Nested comprehensions:
pairs = [(i, j) for i in range(3) for j in range(3) if i != j]
# Inner loop completes fully for each outer loop iteration

When to use comprehensions vs for loops:
- Use comprehensions: building a new collection by transforming/filtering an existing one
- Use for loops: complex multi-step logic, side effects, multiple appends, code hard to read in one line
- Readability wins — a 3-nested comprehension is clever but unmaintainable

In finance:
log_returns = [math.log(p2/p1) for p1, p2 in zip(prices, prices[1:])]
positive_days = [r for r in daily_returns if r > 0]
pnl_by_ticker = {t: sum(t.pnl for t in trades_by_ticker[t]) for t in tickers}`,
    plain: `Comprehensions are one of Python's most distinctive and loved features. They let you express what you want (a list of squares) rather than how to build it (loop, append, repeat). The readability rule: if you can read the comprehension naturally in one sentence ("squares of x for x in range 10"), use it. If you have to read it three times to understand it, use a loop. Clarity beats cleverness every time.`,
    stars: [360, 460, 560], target: 560, coins: 32,
    simulatorLesson: 'pythonComprehension',
  },

  2016: {
    simulatorLesson: 'generatorTracer',
    id: 2016, chapter: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'Iterators and Generators: Lazy Evaluation',
    fact: `An iterator is an object with __iter__() and __next__(). Calling next() advances it. StopIteration when exhausted. for loops use iterators internally.

Many built-in functions return iterators (lazy): range(), map(), filter(), zip(), enumerate(), reversed(). They produce values on demand rather than building a full list.

Generators: functions that use yield instead of return. Each yield pauses execution and returns a value; the function resumes from that point on the next next() call.

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
first_10 = [next(gen) for _ in range(10)]

Generator expressions: (x**2 for x in range(1000000)) — computes squares lazily, never builds the million-element list.

Why generators matter:
1. Memory: a generator that yields 1 million items uses constant memory. A list of 1 million items stores everything at once.
2. Speed: if you only need the first 100 items of a 1-million-item sequence, the generator stops after 100. The list builds all 1 million.
3. Infinite sequences: generators can yield indefinitely (like fibonacci above).

itertools module: chain, islice, product, combinations, permutations, groupby, accumulate — all return iterators. import itertools.

In finance: streaming real-time price feeds. Generating Monte Carlo paths without storing all of them. Reading large CSV files line by line.`,
    plain: `The generator pattern solves a real problem: you need to process 10 million rows of trade data but it doesn't fit in RAM. A generator reads and yields one row at a time — you process it and move on. Only one row is in memory at any time. The code that consumes the generator looks identical to code that consumes a list, so the change is minimal.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2017: {
    simulatorLesson: 'collectionsTracer',
    id: 2017, chapter: 2, mechanic: 'memory', tier: 'intermediate',
    topic: 'collections: deque, defaultdict, Counter, namedtuple',
    fact: `from collections import deque, defaultdict, Counter, namedtuple, OrderedDict

deque (double-ended queue): O(1) append and pop from both ends. Lists are O(n) for left-side operations.
window = deque(maxlen=20)  # auto-drops oldest when full
window.append(price)       # always at most 20 elements
moving_avg = sum(window) / len(window)
— Perfect for rolling windows.

defaultdict: creates a default value for missing keys automatically.
dd = defaultdict(list)
dd["AAPL"].append(trade)   # no KeyError even if "AAPL" not in dict yet
dd = defaultdict(float)    # missing keys default to 0.0
dd = defaultdict(int)      # missing keys default to 0
— Eliminates if key in d: d[key] = [] boilerplate.

Counter: counts element frequencies.
c = Counter(["AAPL","GOOG","AAPL","TSLA","AAPL"])
# Counter({"AAPL":3, "TSLA":1, "GOOG":1})
c.most_common(2)  # [("AAPL",3), ("TSLA",1)] or ("GOOG",1) tied
Counter supports arithmetic: c1 + c2, c1 - c2.

namedtuple: creates tuple subclasses with named fields.
Trade = namedtuple("Trade", ["symbol","price","quantity","side"])
t = Trade("AAPL", 150.0, 100, "buy")
t.price  # 150.0 — readable attribute access

In finance: deque for rolling metrics (moving averages, rolling Sharpe). defaultdict for grouping trades by ticker. Counter for trade frequency analysis, most traded instruments.`,
    plain: `deque(maxlen=N) is the data structure for any rolling window computation. It automatically manages the window — when it is full, appending a new element drops the oldest from the other end. No index management, no slicing, no off-by-one errors. For a 20-day moving average: append each day's price, compute sum(window)/len(window). That is the entire implementation.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2018: {
    simulatorLesson: 'sortingTracer',
    id: 2018, chapter: 2, mechanic: 'codeTrace', tier: 'intermediate',
    topic: 'Sorting, bisect, and heapq',
    fact: `Sorting:
sorted(iterable, key=None, reverse=False) → new sorted list
list.sort(key=None, reverse=False) → sorts in place, returns None
Both are stable (equal elements maintain original order). O(n log n).

Key function patterns:
sorted(words, key=len)                            # by length
sorted(trades, key=lambda t: t.pnl, reverse=True) # by PnL descending
sorted(stocks, key=lambda s: (s.sector, -s.market_cap)) # multi-key

bisect module — binary search on sorted lists:
import bisect
sorted_strikes = [90, 95, 100, 105, 110]
bisect.bisect_left(sorted_strikes, 103)   # → 3 (insertion point)
bisect.bisect_right(sorted_strikes, 100)  # → 3 (after existing 100)
bisect.insort(sorted_strikes, 103)        # inserts maintaining sort order
O(log n) search — dramatically faster than linear scan for large lists.

heapq — min-heap (priority queue):
import heapq
heap = []
heapq.heappush(heap, (priority, item))
heapq.heappop(heap)  # removes and returns smallest
heapq.nlargest(5, items, key=func)   # top 5 without full sort
heapq.nsmallest(5, items, key=func)  # bottom 5 without full sort

In finance: sorted() for ranking strategies, positions by PnL, instruments by volume. bisect for finding the nearest option strike to spot price, locating a date in a sorted timeline. heapq for order book implementations, scheduling events by timestamp.`,
    plain: `bisect is underused and valuable. If you have a sorted list of option strikes and need the one closest to the current spot price, bisect.bisect_left finds the insertion point in O(log n). For 1,000 strikes this is 10 comparisons instead of 1,000. For a simulation checking this millions of times, the difference is minutes vs hours.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2019: {
    simulatorLesson: 'fileIOBuilder',
    id: 2019, chapter: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'File I/O: Reading, Writing, CSV, JSON',
    fact: `Always use the with statement for file operations — it guarantees the file is closed even if an exception occurs.

Text files:
with open("data.txt", "r") as f:
    content = f.read()       # entire file as string
    lines = f.readlines()    # list of lines
    for line in f:           # one line at a time — memory efficient

Write modes: "r" read, "w" write (overwrites), "a" append, "r+" read+write. "rb"/"wb" for binary.

csv module:
import csv
with open("prices.csv", "r") as f:
    reader = csv.DictReader(f)   # rows as dicts keyed by header
    for row in reader:
        ticker, price = row["ticker"], float(row["price"])

with open("output.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["ticker","price"])
    writer.writeheader()
    writer.writerow({"ticker":"AAPL","price":150.0})

json module:
import json
with open("config.json") as f: config = json.load(f)
with open("results.json","w") as f: json.dump(results, f, indent=2)
json.dumps(obj) → string. json.loads(string) → object.

pathlib (modern path handling):
from pathlib import Path
data_dir = Path("data")
csv_files = list(data_dir.glob("*.csv"))
full_path = data_dir / "prices" / "AAPL.csv"  # cross-platform join

In finance: loading historical price CSVs, reading strategy configuration from JSON, writing backtest results, processing daily data files.`,
    plain: `pathlib.Path is the modern way to handle file paths — use it instead of os.path string manipulation. Path("data") / "prices" / "AAPL.csv" works on Windows (backslash) and Unix (forward slash) automatically. path.exists(), path.is_file(), path.suffix, path.stem — readable attribute access instead of os.path.splitext() gymnastics.`,
    stars: [360, 460, 560], target: 560, coins: 32,
  },

  2020: {
    simulatorLesson: 'ch2BossBuilder',
    id: 2020, chapter: 2, mechanic: 'calibration', tier: 'intermediate',
    topic: 'Chapter 2 Boss: Data Structures Gauntlet',
    fact: `BOSS LEVEL. Five challenges:

(1) prices = [100, 102, 101, 105, 103]. Write a one-liner using zip and a list comprehension to compute simple daily returns [(p2-p1)/p1 for each consecutive pair].

(2) trades = [("AAPL",100),("GOOG",50),("AAPL",75),("TSLA",200)]. Use defaultdict to build total shares per ticker.

(3) You have a deque(maxlen=3) and you append [1,2,3,4,5] one at a time. What does it contain at the end?

(4) universe = {"AAPL","GOOG","MSFT","TSLA"}. holdings = {"AAPL","NVDA","TSLA"}. Write one expression for tickers held but not in universe.

(5) What is the shallow copy trap with d = {"a":[1,2,3]}; e = d.copy(); e["a"].append(4)? What does d["a"] contain?`,
    plain: `Answers: (1) [(p2-p1)/p1 for p1,p2 in zip(prices, prices[1:])]. (2) from collections import defaultdict; totals=defaultdict(int); [totals.__setitem__(t, totals[t]+s) for t,s in trades] — cleaner as a for loop. (3) deque([3,4,5],maxlen=3) — oldest elements drop off left. (4) holdings - universe = {"NVDA"} — in holdings but not universe. (5) d["a"] is [1,2,3,4] — shallow copy only copies the dict structure, not the list inside it. Both d["a"] and e["a"] point to the same list.`,
    stars: [420, 540, 660], target: 660, coins: 42,
    isBoss: true,
    calibrationData: {
      scenario: 'a = [1,2,3]; b = a; b += [4]. What is a? Now: a = [1,2,3]; b = a; b = b + [4]. What is a?',
      baseRate: 0,
      evidence: 'First: a is [1,2,3,4] — += modifies the list in place (extend). Second: a is still [1,2,3] — b + [4] creates a NEW list and b is rebound to it. a is untouched. In-place operators mutate; + creates new objects.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3 — FUNCTIONS AND FUNCTIONAL PATTERNS (2021–2030)
// Closures · decorators · functools · map/filter · error handling · context managers · recursion
// ═══════════════════════════════════════════════════════════════════════════════

  2021: {
    simulatorLesson: 'closureTracer',
    id: 2021, chapter: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'First-Class Functions and Closures',
    fact: `In Python, functions are objects. They can be:
- Assigned to variables: f = print; f("hello")
- Stored in data structures: ops = [add, subtract, multiply]
- Passed as arguments: sorted(data, key=some_function)
- Returned from functions: def make_adder(n): return lambda x: x+n

A closure is a function that captures variables from its enclosing scope, even after that scope has finished executing.

def make_multiplier(factor):
    def multiply(x):
        return x * factor   # factor is captured from enclosing scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
double(5)  # 10 — factor=2 is remembered
triple(5)  # 15 — factor=3 is remembered

Each call to make_multiplier creates a new closure with its own captured factor.

Closures vs classes: closures are lightweight alternatives to single-method classes. Where a class would have __init__ storing state and one __call__ method, a closure does the same in 3 lines.

In finance: factory functions that create configured strategies.
def make_momentum_signal(lookback, threshold):
    def signal(prices):
        ret = prices[-1] / prices[-lookback] - 1
        return 1 if ret > threshold else -1
    return signal

signal_20_5pct = make_momentum_signal(20, 0.05)
signal_60_10pct = make_momentum_signal(60, 0.10)`,
    plain: `Closures feel abstract until you use them to configure behaviour. make_momentum_signal(20, 0.05) returns a function that already "knows" its lookback and threshold. You pass it around, call it, and it behaves as if you had hardcoded those values inside — but you can make as many differently-configured versions as you want. This is the pattern behind strategy factories.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2022: {
    id: 2022, chapter: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'Decorators: Wrapping Functions',
    fact: `A decorator is a function that takes a function and returns a modified version. The @syntax applies it cleanly.

Basic pattern:
def my_decorator(func):
    def wrapper(*args, **kwargs):
        # do something before
        result = func(*args, **kwargs)
        # do something after
        return result
    return wrapper

@my_decorator
def my_function(): ...
# Equivalent to: my_function = my_decorator(my_function)

functools.wraps: preserves the original function's __name__ and __doc__ — always use it.
from functools import wraps
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs): ...
    return wrapper

Useful decorator patterns:
- Timer: log execution time
- Retry: retry on exception with backoff
- Cache: store results (see next level)
- Validate: check arguments before calling
- Log: log inputs and outputs

Built-in decorators:
- @staticmethod: method that doesn't need self or cls
- @classmethod: method receiving the class as first arg
- @property: turns a method into attribute-style access

Decorator factories (decorators with arguments):
@retry(max_attempts=3, delay=1.0)
def fetch_price(ticker): ...

In finance: @timer for profiling slow computations, @retry for flaky data API calls, @validate for risk limit checks before trade execution.`,
    plain: `Decorators add behaviour without touching the function. @timer wraps any function with timing code. @retry wraps any function with retry logic. The decorated function looks and works identically from the outside — the caller never knows the decoration is there. This separation of concerns (the function does its job; the decorator handles cross-cutting concerns like timing, logging, retrying) is powerful.`,
    stars: [400, 500, 600], target: 600, coins: 38,
    simulatorLesson: 'pythonDecorator',
  },

  2023: {
    simulatorLesson: 'functoolsTracer',
    id: 2023, chapter: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'functools: cache, partial, reduce',
    fact: `functools is the standard library module for functional programming tools.

functools.cache (Python 3.9+) / functools.lru_cache:
Memoises a function — stores results for previously seen arguments. Returns cached result on repeat calls.

from functools import cache

@cache
def fibonacci(n):
    if n < 2: return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(100)  # instant — previously exponential recursion

lru_cache(maxsize=128): limits cache size, evicts least-recently-used.
@lru_cache(maxsize=None) is equivalent to @cache.

functools.partial: fixes some arguments of a function, creating a new function.
from functools import partial

def compute_return(start, end, log=False):
    if log: return math.log(end/start)
    return (end-start)/start

log_return = partial(compute_return, log=True)  # log=True is fixed
log_return(100, 105)  # only need to pass start and end

functools.reduce: applies a function cumulatively to a sequence.
from functools import reduce
product = reduce(lambda a, b: a*b, [1,2,3,4,5])  # 120

In finance: @cache for expensive option pricing functions called with the same parameters repeatedly. partial for creating specialised versions of generic functions (annualise = partial(compute_return, periods=252)). reduce for compound returns: total_return = reduce(lambda a,b: a*(1+b), daily_returns, 1.0) - 1.`,
    plain: `@cache is one of the highest-ROI optimisations in Python. An option pricing function called 10 million times in a Monte Carlo simulation with many repeated inputs can be reduced to a fraction of the time. The cache check (is this input in the cache?) costs almost nothing. The option computation (Black-Scholes calculation) costs a lot. Cache it and pay the computation cost once per unique input.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2024: {
    simulatorLesson: 'mapFilterZipTracer',
    id: 2024, chapter: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'map, filter, zip, enumerate — and When to Use Them',
    fact: `Built-in higher-order functions operate on iterables and return lazy iterators.

map(func, iterable): applies func to each element.
squared = list(map(lambda x: x**2, [1,2,3,4]))
# [1, 4, 9, 16]
# Equivalent: [x**2 for x in [1,2,3,4]]

filter(func, iterable): keeps elements where func returns True.
positives = list(filter(lambda x: x>0, returns))
# Equivalent: [x for x in returns if x > 0]

zip(*iterables): pairs elements from multiple iterables. Stops at shortest.
pairs = list(zip([1,2,3], ["a","b","c"]))  # [(1,"a"),(2,"b"),(3,"c")]
# Unzipping: a_list, b_list = zip(*pairs)

enumerate(iterable, start=0): yields (index, element) tuples.
for i, price in enumerate(prices, start=1):
    print(f"Day {i}: ${price:.2f}")

any(iterable): True if at least one element is truthy.
all(iterable): True if all elements are truthy.

any(r > 0.1 for r in returns)  # any return above 10%?
all(p > 0 for p in prices)     # all prices positive?

Modern Python preference: comprehensions are generally more readable than map/filter for simple cases. But zip(), enumerate(), any(), all() are universally idiomatic — use them freely.

In finance:
for (ticker1, ret1), (ticker2, ret2) in zip(portfolio1.items(), portfolio2.items()):
log_returns = list(map(math.log, [p2/p1 for p1,p2 in zip(prices,prices[1:])]))
if all(margin > min_margin for margin in positions): execute_trade()`,
    plain: `zip() is the hidden gem. zip(prices, prices[1:]) pairs each price with the next one — exactly what you need for daily return calculations. zip(tickers, weights, prices) lets you iterate over three lists simultaneously. Without zip, you would use index arithmetic — error-prone and less readable. With zip, the intent is explicit.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2025: {
    simulatorLesson: 'errorHandlingBuilder',
    id: 2025, chapter: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'Error Handling: try, except, else, finally, raise',
    fact: `try:
    risky_operation()
except SpecificError as e:
    handle_it(e)
except (ErrorA, ErrorB):
    handle_either()
else:
    # runs only if NO exception occurred
    success_action()
finally:
    # ALWAYS runs — cleanup here
    close_connection()

Exception hierarchy: BaseException → Exception → (ValueError, TypeError, KeyError, IndexError, ArithmeticError, ...). Catch the most specific type you can handle.

Never: except Exception: pass — this silently swallows all errors. In trading code this is dangerous.
Never: bare except: — catches even KeyboardInterrupt and SystemExit.

Raising exceptions: raise ValueError("price must be positive")
Re-raising (preserving original traceback): 
try:
    do_something()
except Exception:
    log.error("Failed")
    raise  # re-raises the caught exception

Exception chaining: raise RuntimeError("Failed") from original_exception

Best practice — fail loudly and early:
def validate_price(price):
    if not isinstance(price, (int, float)):
        raise TypeError(f"price must be numeric, got {type(price)}")
    if price <= 0:
        raise ValueError(f"price must be positive, got {price}")
    return price

In finance: never silently handle failed data fetches, failed order submissions, or computation errors. A position that could not be priced because an exception was swallowed looks like a zero-value position. That corrupts your risk calculations silently.`,
    plain: `The rule in production financial code: exceptions are either handled (you know exactly what to do when this specific error occurs) or propagated (let it bubble up to a caller that does know). Silent swallowing — except Exception: pass — is never correct. When something goes wrong at 3am and you check the logs, "pass" tells you nothing happened. But something did happen.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2026: {
    simulatorLesson: 'exceptionDesigner',
    id: 2026, chapter: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'Custom Exceptions and Exception Design',
    fact: `Custom exceptions let you create a meaningful error hierarchy for your application.

class AppError(Exception):
    """Base exception for this application."""
    pass

class DataError(AppError):
    """Errors related to data fetching or parsing."""
    pass

class InsufficientDataError(DataError):
    """Not enough data points for computation."""
    def __init__(self, required, available):
        self.required = required
        self.available = available
        super().__init__(f"Need {required} data points, have {available}")

class ExecutionError(AppError):
    """Errors during trade execution."""
    pass

class InsufficientMarginError(ExecutionError):
    pass

Usage:
if len(prices) < lookback:
    raise InsufficientDataError(required=lookback, available=len(prices))

Catching at different levels:
try: compute_sharpe(prices)
except InsufficientDataError as e:
    logger.warning(f"Skipping: {e}")  # handle specific case
except DataError:
    raise  # propagate other data errors up

Why custom exceptions:
1. Caller can catch exactly the error type they care about
2. Meaningful names make code self-documenting
3. Additional context (required, available) on the exception object
4. Hierarchy: catch DataError to handle all data-related errors, or InsufficientDataError for just this case

In finance: RiskLimitBreached, InsufficientMargin, MarketClosed, StaleDataError, OrderRejected, InvalidTicker — all should be distinct exception types.`,
    plain: `Custom exceptions are documentation. When you raise InsufficientMarginError instead of ValueError("not enough margin"), anyone reading the code immediately understands what went wrong. When you catch InsufficientMarginError specifically, you are stating "I know exactly what to do when this happens" — and other exceptions (unexpected ones) still propagate up for someone to handle.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2027: {
    simulatorLesson: 'contextManagerTracer',
    id: 2027, chapter: 3, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Context Managers: with Statements',
    fact: `Context managers define setup and teardown for a block of code. The with statement calls __enter__ on entry and __exit__ on exit — even if an exception occurs.

Protocol:
class ManagedResource:
    def __enter__(self):
        # setup
        return self  # value bound to "as" variable
    def __exit__(self, exc_type, exc_val, exc_tb):
        # cleanup — always runs
        return False  # False: don't suppress exceptions

Using contextlib.contextmanager (simpler):
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    yield  # code inside with block runs here
    elapsed = time.perf_counter() - start
    print(f"{label}: {elapsed:.4f}s")

with timer("Backtest"):
    run_backtest()

Built-in context managers:
- open() — closes file
- threading.Lock() — releases lock (critical for thread safety)
- decimal.localcontext() — restores decimal precision
- unittest.mock.patch() — restores original after test
- database connections — commits or rolls back

Nested context managers:
with open("in.csv") as fin, open("out.csv","w") as fout:
    process(fin, fout)

In finance: database connections (always commit or rollback), file handles (always close), lock acquisition for thread-safe position updates, temporary parameter overrides for what-if analysis.`,
    plain: `The context manager guarantee is important: cleanup runs even if an exception occurs inside the with block. A database connection without a context manager: if your query raises an exception, does your code still commit or rollback the transaction? Maybe. With a context manager: always. That determinism is what makes code safe to run in production.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2028: {
    simulatorLesson: 'recursionTracer',
    id: 2028, chapter: 3, mechanic: 'memory', tier: 'advanced',
    topic: 'Recursion and Memoisation',
    fact: `Recursion: a function that calls itself. Requires a base case (termination condition) and a recursive case that moves toward the base case.

def factorial(n):
    if n <= 1: return 1       # base case
    return n * factorial(n-1) # recursive case

def binary_search(arr, target, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    if lo > hi: return -1
    mid = (lo + hi) // 2
    if arr[mid] == target: return mid
    elif arr[mid] < target: return binary_search(arr, target, mid+1, hi)
    else: return binary_search(arr, target, lo, mid-1)

Python's default recursion limit: 1000 (sys.setrecursionlimit to change). Deep recursion risks stack overflow — use iterative solutions for deep stacks.

Memoisation with @cache (from functools) eliminates redundant recursive calls:
@cache
def fibonacci(n):
    if n < 2: return n
    return fibonacci(n-1) + fibonacci(n-2)
# Without @cache: O(2^n). With @cache: O(n) — each value computed once.

Tail recursion: Python does NOT optimise tail calls (unlike Haskell, Scheme). A recursion 10,000 levels deep will crash. Convert deep recursions to loops.

In finance: recursive data structures (binary trees for option pricing), dynamic programming problems (optimal execution, option valuation), tree traversal for hierarchical risk decomposition. Most DP problems in quant interviews use memoisation.`,
    plain: `The @cache decorator transforms naive recursion from unusable to fast. Without it, fibonacci(50) takes minutes (it recomputes the same values billions of times). With it, fibonacci(50) is instant — each value is computed once and cached. This is the memoisation pattern: the algorithm stays recursive and clean, the caching is handled automatically.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2029: {
    simulatorLesson: 'argsKwargsTracer',
    id: 2029, chapter: 3, mechanic: 'match3', tier: 'advanced',
    topic: '*args, **kwargs, and Argument Unpacking',
    fact: `*args captures any number of positional arguments as a tuple:
def log(*messages):
    for msg in messages:
        print(msg)
log("a", "b", "c")  # messages = ("a","b","c")

**kwargs captures any number of keyword arguments as a dict:
def configure(**settings):
    for key, val in settings.items():
        apply(key, val)
configure(lookback=20, threshold=0.05, rebalance="monthly")

Combined: def f(*args, **kwargs) accepts anything. Used in wrapper functions and decorators to pass through all arguments.

Argument unpacking (calling side):
args = (1, 2, 3)
func(*args)     # equivalent to func(1, 2, 3)

kwargs = {"lookback": 20, "threshold": 0.05}
func(**kwargs)  # equivalent to func(lookback=20, threshold=0.05)

Combining: func(*args, **kwargs) passes everything through.

Keyword-only arguments (after *):
def resample(data, *, freq, method="last"):
    ...
resample(data, freq="D")       # ok — freq passed as keyword
resample(data, "D")            # TypeError — freq must be keyword-only

Positional-only arguments (before /):
def add(x, y, /):
    ...
add(1, 2)          # ok
add(x=1, y=2)     # TypeError — x, y are positional-only

In finance: flexible strategy constructors accepting arbitrary parameters, decorator wrappers that pass through all arguments to the wrapped function, building config systems.`,
    plain: `*args and **kwargs are how Python achieves flexible APIs. A decorator that wraps any function must use *args, **kwargs to forward whatever arguments the caller passed through to the original. Without them, the wrapper would need to know exactly what arguments the function expects — which defeats the purpose of a general-purpose wrapper.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2030: {
    simulatorLesson: 'ch3BossBuilder',
    id: 2030, chapter: 3, mechanic: 'calibration', tier: 'advanced',
    topic: 'Chapter 3 Boss: Functional Patterns Gauntlet',
    fact: `BOSS LEVEL. Five challenges:

(1) Write a decorator @validate_positive that raises ValueError if any argument to the decorated function is ≤ 0.

(2) Using partial, create a function log_return from a general compute_return(start, end, method) function where method is fixed to "log".

(3) Write make_threshold_filter(threshold) — a closure returning a function that filters a list to keep only values above threshold.

(4) Why does @cache fail on a function taking a list argument? How do you fix it?

(5) Write a context manager @contextmanager called suppress_errors that catches all exceptions and logs them instead of raising, then continues execution after the with block.`,
    plain: `Answers: (1) Inspect args and kwargs in the wrapper, raise if any ≤ 0. (2) from functools import partial; log_return = partial(compute_return, method="log"). (3) def make_threshold_filter(t): return lambda data: [x for x in data if x > t]. (4) Lists are unhashable — @cache cannot use them as dict keys. Fix: convert to tuple before calling, or take *args with tuple arguments. (5) @contextmanager def suppress_errors(): try: yield except Exception as e: logger.error(e).`,
    stars: [440, 560, 680], target: 680, coins: 45,
    isBoss: true,
    calibrationData: {
      scenario: 'You write @lru_cache(maxsize=128) on a function that takes a pandas DataFrame. What happens and why?',
      baseRate: 0,
      evidence: 'TypeError: unhashable type "DataFrame". lru_cache requires all arguments to be hashable (usable as dict keys). DataFrames, lists, dicts are not hashable. Fix: convert to a hashable representation before caching, or cache the result externally (e.g. using a dict keyed by a hashable identifier).',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4 — OBJECT-ORIENTED PROGRAMMING (2031–2040)
// Classes · attributes · magic methods · inheritance · ABCs · dataclasses · properties
// ═══════════════════════════════════════════════════════════════════════════════

  2031: {
    id: 2031, chapter: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'Classes and Instances: The Basics',
    fact: `A class is a blueprint. An instance is an object built from that blueprint.

class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner        # instance attribute
        self.balance = balance    # instance attribute

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return amount

    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.balance:.2f})"

acc = BankAccount("Alice", 1000.0)  # instantiation — calls __init__
acc.deposit(500)
acc.withdraw(200)
print(acc)  # calls __repr__

self: the first parameter of every instance method. Python passes the instance automatically — you never pass it explicitly. It is convention (not required) to name it self.

__init__ is the initialiser (not the constructor — that's __new__). It sets up instance attributes. Every instance attribute must be set in __init__ or you get AttributeError on access.

In finance: Position, Order, Trade, Portfolio, Strategy are the natural classes. Each Position has its own ticker, shares, average price. Methods compute market value, PnL.`,
    plain: `A class without __repr__ is miserable to debug. When you print an object and see <__main__.Position object at 0x7f2a3b4c5d6e>, you learn nothing. With __repr__ returning "Position(AAPL: 100 shares @ $150.00)", you see everything. Always write __repr__. It costs 2 minutes and saves hours of debugging.`,
    stars: [380, 480, 580], target: 580, coins: 35,
    simulatorLesson: 'pythonClassBuilder',
  },

  2032: {
    simulatorLesson: 'classAttrTracer',
    id: 2032, chapter: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'Instance vs Class Attributes and Methods',
    fact: `Instance attributes: unique to each instance. Set via self.x = ... in __init__.
Class attributes: shared across ALL instances. Defined at class body level.

class Trade:
    count = 0              # class attribute — shared
    valid_sides = {"buy", "sell"}  # class attribute

    def __init__(self, symbol, price, qty, side):
        Trade.count += 1   # modifying class attribute
        self.symbol = symbol   # instance attributes
        self.price = price
        self.qty = qty
        self.side = side

Accessing class attributes: Trade.count or self.count (reads class attr if instance doesn't have one).

Mutable class attribute trap:
class Bad:
    items = []           # shared mutable class attribute
b1 = Bad(); b2 = Bad()
b1.items.append(1)      # modifies THE shared list
b2.items                # [1] — surprise! Always use def __init__: self.items = []

Static methods: @staticmethod — no self or cls. Utility function that belongs logically to the class.
@staticmethod
def is_valid_side(side): return side in {"buy","sell"}

Class methods: @classmethod — receives cls (the class itself) as first arg. Used for alternative constructors.
@classmethod
def from_dict(cls, d): return cls(d["symbol"], d["price"], d["qty"], d["side"])

In finance: Trade.count tracks how many trades were created. Class-level valid_sides, valid_exchanges, tick_sizes.`,
    plain: `The mutable class attribute trap is one of the most confusing Python bugs. You define items = [] at class level thinking each instance gets its own list. They all share ONE list. The fix is always the same: move it to __init__ as self.items = []. This creates a fresh list for each instance. The rule: never put mutable objects (lists, dicts, sets) as class attributes.`,
    stars: [380, 480, 580], target: 580, coins: 35,
  },

  2033: {
    simulatorLesson: 'dungerMethodTracer',
    id: 2033, chapter: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'Magic (Dunder) Methods',
    fact: `Dunder (double-underscore) methods let your classes integrate with Python's syntax and built-in functions.

String representation:
__repr__(self) → developer-facing string (for debugging). Called by repr(obj) and in REPL.
__str__(self) → user-facing string. Called by str(obj) and print(). Falls back to __repr__ if not defined.

Container behaviour:
__len__(self) → len(obj)
__getitem__(self, key) → obj[key]
__setitem__(self, key, value) → obj[key] = value
__delitem__(self, key) → del obj[key]
__contains__(self, item) → item in obj
__iter__(self) → for item in obj: (return an iterator)

Arithmetic operators:
__add__(self, other) → self + other
__mul__(self, other) → self * other
__neg__(self) → -self

Comparison:
__eq__(self, other) → self == other
__lt__, __le__, __gt__, __ge__ → ordering (or use @functools.total_ordering)
__hash__(self) → hash(obj) — required for objects used as dict keys or set members. If you define __eq__, you must define __hash__ too.

Context manager:
__enter__(self), __exit__(self, exc_type, exc_val, exc_tb) → with obj:

Callable:
__call__(self, *args, **kwargs) → obj() — makes instance callable like a function

In finance: Portfolio with __len__ (number of positions), __getitem__ (portfolio["AAPL"]), __iter__ (for position in portfolio:). Strategy with __call__ (signal = strategy(prices)) makes strategies callable.`,
    plain: `Magic methods are what makes Python objects feel native. A Portfolio that supports len(portfolio), portfolio["AAPL"], and for position in portfolio: works like a built-in container. The user of your Portfolio class doesn't need to know any special methods — it just works the way they expect. That is the goal of good class design.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2034: {
    id: 2034, chapter: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'Inheritance and super()',
    fact: `Inheritance: a subclass inherits all methods and attributes from its parent.

class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self): return "..."

class Dog(Animal):
    def speak(self): return "Woof"  # override

class Cat(Animal):
    def speak(self): return "Meow"  # override

Calling parent methods with super():
class ElectricCar(Car):
    def __init__(self, make, model, battery_kwh):
        super().__init__(make, model)  # call Car.__init__
        self.battery_kwh = battery_kwh

Always call super().__init__() in __init__ when inheriting — ensures parent's initialisation runs.

isinstance(obj, Parent) → True even for subclass instances.
issubclass(Child, Parent) → True.

Method Resolution Order (MRO): Python determines which class's method to call using C3 linearisation. Class.__mro__ shows the order. super() follows MRO.

When to use inheritance:
- True "is-a" relationship: Dog IS-A Animal. ElectricCar IS-A Car.
- Shared behaviour with specialisation in subclasses.

When NOT to use inheritance (prefer composition):
- "has-a" relationships: Portfolio HAS positions (not IS positions).
- Deep inheritance hierarchies become brittle.

In finance: Strategy → MomentumStrategy, MeanReversionStrategy, PairsStrategy. Order → MarketOrder, LimitOrder, StopOrder. Risk model → FactorRiskModel, HistoricalRiskModel.`,
    plain: `The is-a vs has-a test: "MomentumStrategy IS-A Strategy" — use inheritance. "Portfolio HAS positions" — use composition (store a list of positions, not inherit from list). The most common inheritance mistake is treating has-a as is-a — making Portfolio inherit from list just to get list methods. The result: Portfolio unexpectedly has 30+ list methods that have no meaning in the portfolio context.`,
    stars: [400, 500, 600], target: 600, coins: 38,
    simulatorLesson: 'pythonInheritance',
  },

  2035: {
    simulatorLesson: 'abcTracer',
    id: 2035, chapter: 4, mechanic: 'match3', tier: 'advanced',
    topic: 'Abstract Base Classes: Enforcing Interfaces',
    fact: `ABCs define interfaces — what methods a class MUST implement. They cannot be instantiated directly.

from abc import ABC, abstractmethod

class Strategy(ABC):
    @abstractmethod
    def generate_signals(self, prices: list) -> list:
        """Return a list of signals (+1, 0, -1) for each price."""
        ...

    @abstractmethod
    def name(self) -> str:
        """Return the strategy name."""
        ...

    def backtest(self, prices, initial_capital=10000):
        # concrete method — shared implementation
        signals = self.generate_signals(prices)
        ...

class MomentumStrategy(Strategy):
    def generate_signals(self, prices): ...
    def name(self): return "Momentum"

s = Strategy()          # TypeError: can't instantiate abstract class
s = MomentumStrategy()  # works — all abstract methods implemented

If MomentumStrategy doesn't implement name(), instantiating it raises TypeError — catches missing implementations at instantiation, not at call time.

ABCs from collections.abc: Iterable, Iterator, Sequence, Mapping, MutableMapping, Callable — you can isinstance() check against these. isinstance([], Sequence) → True.

Benefits:
1. Enforces interface at instantiation — errors caught early
2. Documents what subclasses must implement
3. Allows shared implementation in concrete methods
4. Enables isinstance checks against the abstract type

In finance: Strategy, RiskModel, DataFeed, ExecutionEngine, PortfolioOptimiser are natural ABCs.`,
    plain: `ABCs solve the documentation problem. Without them, nothing stops you from creating a Strategy subclass that forgets to implement generate_signals(). The code runs fine until you try to call generate_signals() at runtime — possibly during a live trading session. With an ABC, the missing method is caught at instantiation — when you first create the object, before you use it.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2036: {
    simulatorLesson: 'dataclassBuilder',
    id: 2036, chapter: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'Dataclasses: Clean Data Containers',
    fact: `@dataclass auto-generates __init__, __repr__, and __eq__ from annotated fields. Eliminates boilerplate.

from dataclasses import dataclass, field
from typing import ClassVar

@dataclass
class Trade:
    symbol: str
    price: float
    quantity: int
    side: str = "buy"           # default value
    fees: float = field(default=0.0, repr=False)  # excluded from repr
    tags: list = field(default_factory=list)       # mutable default — always use default_factory

    def notional(self) -> float:
        return self.price * self.quantity

trade = Trade("AAPL", 150.0, 100)
# __init__ generated: Trade(symbol, price, quantity, side="buy", fees=0.0, tags=[])
# __repr__ generated: Trade(symbol='AAPL', price=150.0, quantity=100, side='buy')
# __eq__ generated: compares all fields

Options:
@dataclass(frozen=True)   → immutable (and hashable) — raises FrozenInstanceError on mutation
@dataclass(order=True)    → generates __lt__, __le__, __gt__, __ge__ for sorting
@dataclass(slots=True)    → uses __slots__ for memory efficiency (Python 3.10+)

Inheritance: @dataclass works with inheritance — child class gets fields from parent.

When to use over plain class: any class that primarily holds data. When the class is mostly __init__ boilerplate with little logic.

In finance: Trade, Order, OHLC bar, Greeks snapshot, StrategyConfig — all pure data containers that benefit from @dataclass. Use frozen=True for immutable records (historical trades should not be modified).`,
    plain: `The mutable default trap: never write tags: list = [] in a dataclass — all instances share the same list. Always use field(default_factory=list). This is a common bug even for experienced Python developers. The dataclass machinery enforces this — it will raise a TypeError if you try to set a mutable default directly, which is why field(default_factory=...) exists.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2037: {
    simulatorLesson: 'propertyBuilder',
    id: 2037, chapter: 4, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Properties and Descriptors',
    fact: `@property turns a method into attribute-style access — getter without parentheses.

class Circle:
    def __init__(self, radius):
        self._radius = radius  # convention: underscore = "internal"

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value

    @property
    def area(self):
        return math.pi * self._radius ** 2

c = Circle(5)
c.radius        # calls getter → 5
c.radius = 10   # calls setter — validates
c.area          # computed from radius — always consistent

@property with no setter → read-only attribute. Attempting assignment raises AttributeError.

Why not just use public attributes?
- Properties let you add validation later without changing the interface
- Computed properties (like area) look like data but are always up to date
- You can make attributes read-only

Descriptors: the mechanism behind @property. A descriptor is an object with __get__, __set__, __delete__. Properties are just a convenient descriptor implementation. Used to build reusable validation across multiple classes.

In finance:
@property
def market_value(self): return self.shares * self.current_price
@property
def unrealised_pnl(self): return (self.current_price - self.avg_price) * self.shares
# Both look like attributes but always compute fresh values — no stale data.`,
    plain: `Properties solve the "computed attribute" problem. market_value depends on shares and current_price — both can change. If you store it as self.market_value = shares * price, it becomes stale the moment price changes. As a @property, it always computes from the latest values. The caller writes position.market_value and gets a fresh calculation every time — but it looks like a plain attribute access.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2038: {
    simulatorLesson: 'mroTracer',
    id: 2038, chapter: 4, mechanic: 'memory', tier: 'advanced',
    topic: 'Multiple Inheritance and MRO',
    fact: `Python supports inheriting from multiple classes simultaneously.

class A:
    def method(self): print("A")

class B(A):
    def method(self): print("B")

class C(A):
    def method(self): print("C")

class D(B, C):  # multiple inheritance
    pass

D().method()  # prints "B" — why?

Method Resolution Order (MRO): Python uses C3 linearisation to determine which class's method to call. D.__mro__ = (D, B, C, A, object). Python searches in this order.

super() follows MRO — it calls the next class in the MRO, not necessarily the direct parent.

The diamond problem: D inherits from B and C, both inheriting from A. Without MRO, ambiguous which A.method() to call. C3 linearisation resolves this deterministically.

Cooperative multiple inheritance:
class Mixin:
    def extra_feature(self):
        ...

class Position(Mixin, BasePosition):
    ...

Use multiple inheritance sparingly. Prefer composition (storing objects as attributes) over deep inheritance hierarchies. Mixins are the main legitimate use case.

Mixins: small classes that add specific functionality, not meant to stand alone.
class LogMixin:
    def log(self, msg): logging.info(f"{self.__class__.__name__}: {msg}")

class TimestampMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.created_at = datetime.now()

class Order(LogMixin, TimestampMixin, BaseOrder):
    ...`,
    plain: `Multiple inheritance sounds complicated but the practical rule is simple: only use it for mixins — small classes that add one specific capability (logging, timestamps, serialisation). Never use it to combine two fully-fledged classes. The mixin pattern keeps each class focused and the combination predictable.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2039: {
    simulatorLesson: 'compositionBuilder',
    id: 2039, chapter: 4, mechanic: 'match3', tier: 'advanced',
    topic: 'Composition Over Inheritance',
    fact: `"Favour composition over inheritance" is one of software engineering's most important principles. Inheritance creates tight coupling between parent and child. Composition (storing objects as attributes) creates loose coupling.

Inheritance (tightly coupled):
class Portfolio(list):  # Portfolio IS-A list
    def total_value(self): return sum(p.market_value for p in self)
# Problem: Portfolio now has 30+ list methods (pop, sort, ...) that make no sense for a portfolio. Users might call portfolio.pop() accidentally.

Composition (loosely coupled):
class Portfolio:  # Portfolio HAS positions
    def __init__(self):
        self._positions: list[Position] = []
    def add(self, pos: Position): self._positions.append(pos)
    def total_value(self): return sum(p.market_value for p in self._positions)
    def __iter__(self): return iter(self._positions)
    def __len__(self): return len(self._positions)
# Portfolio exposes only what makes sense for a portfolio.

Dependency injection: pass dependencies in rather than hardcoding them.
class Backtester:
    def __init__(self, strategy: Strategy, risk_model: RiskModel, data_feed: DataFeed):
        self.strategy = strategy
        self.risk_model = risk_model
        self.data_feed = data_feed

# Swap any component without changing Backtester:
bt = Backtester(MomentumStrategy(), FactorRisk(), PolygonFeed())
bt = Backtester(MeanReversionStrategy(), HistoricalRisk(), YahooFeed())

In finance: Portfolio has positions (not is positions). Backtester has a strategy (not is a strategy). This lets you swap strategies, risk models, and data sources independently.`,
    plain: `The test for when to use composition vs inheritance: can you replace the parent class with a completely different implementation and still use the child class unchanged? If yes, composition is probably right. Portfolio(list) binds Portfolio forever to the list implementation. Portfolio with self._positions: list allows you to change the internal storage (to a dict, a deque, a database) without changing anything else.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2040: {
    simulatorLesson: 'ch4BossBuilder',
    id: 2040, chapter: 4, mechanic: 'calibration', tier: 'advanced',
    topic: 'Chapter 4 Boss: OOP Design Gauntlet',
    fact: `BOSS LEVEL. Five design challenges:

(1) Design a Position class using @dataclass(frozen=True). Fields: symbol, shares, avg_price. Properties: cost_basis (shares * avg_price), unrealised_pnl(current_price). Why frozen=True?

(2) You have Trade and Order classes. Both need logging and a created_at timestamp. How do you add these without duplicating code and without using inheritance on the full classes?

(3) Write a Strategy ABC with abstract methods generate_signals(prices) and name. Add a concrete backtest(prices, capital) method that calls generate_signals() internally.

(4) class Account: balance = 0. a1 = Account(); a2 = Account(); a1.balance += 1000. What is a2.balance and why?

(5) What does @property allow you to do that a plain attribute cannot? Give a finance example.`,
    plain: `Answers: (1) frozen prevents accidental mutation of historical records. Properties compute from fields dynamically. (2) Mixins: class LogMixin and class TimestampMixin — multiple inheritance for just those behaviours. (3) Abstract methods with @abstractmethod, concrete backtest() calls self.generate_signals(). (4) a2.balance is 0 — a1.balance += 1000 creates an instance attribute on a1, shadowing the class attribute. Class attribute unchanged. (5) Properties compute fresh values on each access — market_value = shares * current_price never goes stale. A plain attribute would be stale the moment price changes.`,
    stars: [460, 580, 700], target: 700, coins: 48,
    isBoss: true,
    calibrationData: {
      scenario: 'class Engine: def __init__(self): self.running = False; def start(self): self.running = True. class Car(Engine): pass. c = Car(); c.start(). What is c.running?',
      baseRate: 0,
      evidence: 'True — Car inherits __init__ from Engine (running=False) and start() from Engine (sets running=True). But Car never called super().__init__() — wait, Car has no __init__ at all, so Python uses Engine.__init__ automatically. c.running is True.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },
};

// ─── Chapter metadata ──────────────────────────────────────────────────────────
export interface PythonChapter {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  start: number;
  end: number;
  bossLevel: number;
  requiredChapter: number | null;
}

export const PYTHON_CHAPTERS: PythonChapter[] = [
  {
    id: 1,
    name: 'Foundations',
    subtitle: 'Variables to Functions',
    description: 'The building blocks every Python program uses. Variables, types, operators, strings, control flow, loops, functions, and scope. Every concept shown in plain Python first, then applied in a real context.',
    icon: '🐍',
    color: '#6366f1',
    start: 2001, end: 2010, bossLevel: 2010,
    requiredChapter: null,
  },
  {
    id: 2,
    name: 'Data Structures',
    subtitle: 'Lists to Generators',
    description: 'How Python organises and stores data. Lists, tuples, dicts, sets, comprehensions, generators, and the collections module. The right data structure for the right job — with the performance implications explained.',
    icon: '📦',
    color: '#8b5cf6',
    start: 2011, end: 2020, bossLevel: 2020,
    requiredChapter: 1,
  },
  {
    id: 3,
    name: 'Functional Patterns',
    subtitle: 'Closures to Context Managers',
    description: 'First-class functions, closures, decorators, functools, error handling, and context managers. The patterns that make Python code clean, composable, and production-ready.',
    icon: '🔧',
    color: '#a855f7',
    start: 2021, end: 2030, bossLevel: 2030,
    requiredChapter: 2,
  },
  {
    id: 4,
    name: 'Object-Oriented Design',
    subtitle: 'Classes to Composition',
    description: 'Classes, inheritance, magic methods, ABCs, dataclasses, properties, and the composition principle. How to model real-world problems in code that is maintainable and extensible.',
    icon: '🏗️',
    color: '#ec4899',
    start: 2031, end: 2040, bossLevel: 2040,
    requiredChapter: 3,
  },
];

export const getPythonChapter = (id: number) => PYTHON_CHAPTERS.find(c => c.id === id);
export const getPythonLevel = (id: number) => PYTHON_LEVELS[id];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5 — PRODUCTION PYTHON (2041–2050)
// Type hints · pytest · logging · venvs · env vars · git · profiling · async · multiprocessing
// ═══════════════════════════════════════════════════════════════════════════════

Object.assign(PYTHON_LEVELS, {

  2041: {
    simulatorLesson: 'typeHintBuilder',
    id: 2041, chapter: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Type Hints and Static Analysis with mypy',
    fact: `Type hints annotate expected types. They are not enforced at runtime — Python ignores them during execution — but tools like mypy check them statically before your code runs.

Basic annotations:
def add(x: int, y: int) -> int: return x + y
name: str = "Alice"
prices: list[float] = [100.0, 101.5]

from typing import Optional, Union, Callable, Any
Optional[float]                    # float or None
Union[int, float]                  # either type
list[tuple[str, float]]            # list of (ticker, price) tuples
dict[str, list[float]]             # dict mapping str to list of float
Callable[[float, float], float]    # function taking two floats, returning float

From Python 3.10+: float | None instead of Optional[float]. list[float] instead of List[float].

Running mypy: pip install mypy; mypy your_file.py. Or mypy . for entire project. Strict mode: mypy --strict catches more issues.

What mypy catches before runtime:
- Passing str where float expected
- Calling a method that doesn't exist on that type
- Returning wrong type from function
- Accessing attributes that don't exist

Gradual typing: you do not need to annotate everything at once. Start with function signatures. Add annotations incrementally.

In finance: def sharpe(returns: list[float], rf: float = 0.0, periods: int = 252) -> float. A mismatched call sharpe("AAPL", rf=0.04) is caught by mypy instantly — not when the function runs.`,
    plain: `Type hints are documentation that can be verified automatically. Without them: a function that expects returns: list[float] might receive a single float, a string, or a DataFrame — and you won't know until it crashes at runtime. With mypy: the wrong type is flagged when you write the call, not when you run it. Adding type hints to existing code also forces you to think clearly about what types your functions actually accept.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2042: {
    id: 2042, chapter: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Testing with pytest',
    fact: `pytest discovers test files matching test_*.py or *_test.py. Test functions start with test_.

def test_add_positive_numbers():
    assert add(2, 3) == 5

assert raises AssertionError with a message on failure. pytest catches this and reports it as a test failure.

Testing exceptions:
import pytest
def test_invalid_price():
    with pytest.raises(ValueError):
        validate_price(-50.0)

Testing approximate equality (floating point):
assert result == pytest.approx(0.05, rel=1e-6)  # relative tolerance
assert result == pytest.approx(3.14159, abs=1e-5)  # absolute tolerance

Fixtures — shared setup code:
@pytest.fixture
def sample_prices():
    return [100.0, 102.5, 101.0, 105.0, 103.5]

def test_returns_length(sample_prices):
    result = compute_returns(sample_prices)
    assert len(result) == len(sample_prices) - 1

Parametrize — run one test with multiple inputs:
@pytest.mark.parametrize("input,expected", [
    ([1.0, 2.0], [1.0]),
    ([100.0, 110.0, 99.0], [0.1, -0.1]),
])
def test_pct_returns(input, expected):
    assert pct_returns(input) == pytest.approx(expected)

Coverage: pip install pytest-cov; pytest --cov=mypackage --cov-report=term-missing.

In finance: every computation function (returns, Sharpe, drawdown, Greeks) should have tests covering normal cases, edge cases (empty list, single element, zeros), and expected exceptions.`,
    plain: `The floating point trap is real: assert 0.1 + 0.2 == 0.3 fails in Python because 0.1 + 0.2 = 0.30000000000000004 in floating point arithmetic. Always use pytest.approx() for financial calculations. The rel=1e-6 tolerance says "within 0.0001%", which is appropriate for prices and returns where exact binary floating point equality is meaningless.`,
    stars: [460, 560, 660], target: 660, coins: 45,
    simulatorLesson: 'pythonTesting',
  },

  2043: {
    simulatorLesson: 'loggingBuilder',
    id: 2043, chapter: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Logging: Structured Output for Production Code',
    fact: `logging is Python's built-in structured logging module. Never use print() in production — logging gives timestamps, levels, filtering, and multiple output destinations.

import logging

# Module-level logger — best practice
logger = logging.getLogger(__name__)

# Configure once, at application entry point:
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()      # also print to console
    ]
)

Log levels (low to high): DEBUG < INFO < WARNING < ERROR < CRITICAL
Setting level=INFO means DEBUG messages are filtered out.

Logging calls:
logger.debug("Processing row %d", i)          # filtered in production
logger.info("Trade executed: %s %d @ %.2f", symbol, qty, price)
logger.warning("Approaching position limit: %.0f%%", pct)
logger.error("Order rejected: %s", reason)
logger.exception("Unexpected error")  # logs ERROR + full traceback

Use % formatting (not f-strings) in logger calls — the string is only formatted if the message is actually emitted. f-strings format eagerly even if the level would filter the message.

RotatingFileHandler: limits log file size, keeps N backup files.
from logging.handlers import RotatingFileHandler

In finance: every trade execution, position change, risk limit breach, and system event should be logged. Logs are your audit trail. When an execution fails at 3am, logs are how you reconstruct exactly what happened.`,
    plain: `The level hierarchy is the key feature. In development: set level=DEBUG to see everything. In production: set level=INFO or WARNING to filter noise. You can change the level without touching any logging.logger.debug() calls in your code — the filtering happens at the handler. And because the message format includes %(name)s (the logger name, which is __name__), you can filter to see only logs from specific modules.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2044: {
    simulatorLesson: 'venvBuilder',
    id: 2044, chapter: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Virtual Environments and Packaging',
    fact: `Virtual environments isolate package installations per project. Without them, all projects share one Python installation — installing a package for Project A might break Project B.

Creating and activating:
python -m venv .venv                  # create
source .venv/bin/activate             # Unix/Mac
.venv\\Scripts\\activate              # Windows
deactivate                            # exit

pip in an activated venv installs to .venv only:
pip install numpy pandas scipy
pip install --upgrade pip
pip freeze > requirements.txt         # save exact versions
pip install -r requirements.txt       # reproduce environment

Modern alternative — Poetry:
pip install poetry
poetry new myproject                  # creates project structure
poetry add numpy pandas              # adds dependency + updates pyproject.toml
poetry install                       # installs all deps from pyproject.toml
poetry run python script.py          # run in poetry's managed venv

pyproject.toml: the modern standard for project metadata and dependencies (replaces setup.py).

Package your own code:
Create src/mypackage/__init__.py — makes the directory a package.
Imports: from mypackage.utils import helper_function

What to put in .gitignore: .venv/, __pycache__/, *.pyc, *.egg-info/, dist/, .env

In finance: every quant project should have a requirements.txt or pyproject.toml. "Works on my machine" because of different package versions is not acceptable in production. The requirements file ensures reproducibility.`,
    plain: `The problem virtual environments solve: pip install pandas installs it globally. Tomorrow you create a new project needing an older pandas version. Conflict. Virtual environments mean each project has its own isolated Python with its own packages at its own versions. The .venv/ folder contains everything — delete it and recreate it from requirements.txt anytime.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2045: {
    simulatorLesson: 'secretsBuilder',
    id: 2045, chapter: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Environment Variables and Configuration',
    fact: `Never hardcode secrets (API keys, passwords, connection strings) in source code. Environment variables are the minimum standard; dedicated secret managers are production best practice.

import os
api_key = os.environ["POLYGON_API_KEY"]        # raises KeyError if missing
api_key = os.environ.get("POLYGON_API_KEY")    # returns None if missing

python-dotenv loads a .env file into environment variables:
pip install python-dotenv
from dotenv import load_dotenv
load_dotenv()  # reads .env file in current directory

.env file (NEVER commit to git):
POLYGON_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host/db
LOG_LEVEL=INFO

.gitignore must include: .env

Pydantic Settings — typed configuration with validation:
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    polygon_api_key: str
    database_url: str
    log_level: str = "INFO"
    max_positions: int = 50
    class Config:
        env_file = ".env"

settings = Settings()
settings.polygon_api_key  # type-checked, validated

Configuration hierarchy: default values → config file → environment variables → CLI arguments. Later sources override earlier ones.

In finance: data provider API keys, broker credentials, database passwords, execution platform tokens — all live in environment variables or a secret manager (AWS Secrets Manager, HashiCorp Vault). A leaked API key that accesses a live trading account is a catastrophic security incident.`,
    plain: `The rule: if it is a secret, it does not go in code. Not in comments. Not in test files. Not in config files that get committed. Exclusively environment variables at minimum; a proper secret manager in production. A surprising number of trading accounts have been compromised by API keys committed to GitHub. Even private repos get leaked. Environment variables are not optional.`,
    stars: [420, 520, 620], target: 620, coins: 40,
  },

  2046: {
    simulatorLesson: 'gitBuilder',
    id: 2046, chapter: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Git: Version Control for Code Projects',
    fact: `Git tracks changes to files over time. Every change is a commit — a snapshot of the entire project at a point in time.

Core workflow:
git init                          # create repo
git add file.py                   # stage changes
git add .                         # stage all changed files
git commit -m "feat: add Sharpe ratio function"  # save snapshot
git log --oneline                 # view history

Branching:
git checkout -b feature/rolling-sharpe   # create and switch to new branch
git checkout main                        # switch back
git merge feature/rolling-sharpe        # merge branch into main
git branch -d feature/rolling-sharpe    # delete branch after merge

Remote (GitHub/GitLab):
git remote add origin <url>
git push origin main
git pull origin main

Conventional commits (enables automated changelogs):
feat: new feature
fix: bug fix
perf: performance improvement
refactor: code restructuring
test: add/update tests
docs: documentation

.gitignore: list of files/directories git ignores.
.venv/        # virtual environment
__pycache__/  # compiled Python bytecode
.env          # secrets
*.pyc
data/         # large data files (use separate storage)

Golden rules for financial code:
1. Never commit to main directly on a production system
2. Every change goes through pull request + code review
3. Write meaningful commit messages (what changed and why, not just "update")
4. Tag releases: git tag v1.2.0
5. git history is your audit trail — regulators can ask "what was the code doing on March 15th"`,
    plain: `Git is not optional in any professional environment. It is how you answer "what changed when the strategy stopped working" — git log shows exactly. It is how you collaborate without overwriting each other. It is how you safely experiment — create a branch, try something, merge it if it works, discard it if it doesn't. The most important habit: write commits that describe why, not just what. "fix: use adjusted close instead of close for return calculation" tells the story. "update" tells nothing.`,
    stars: [400, 500, 600], target: 600, coins: 38,
  },

  2047: {
    simulatorLesson: 'profilingBuilder',
    id: 2047, chapter: 5, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Profiling and Performance Optimisation',
    fact: `Rule: profile first, optimise second. Never optimise code you haven't measured — you will optimise the wrong thing.

cProfile — function-level profiling:
python -m cProfile -s cumtime script.py
# or in code:
import cProfile
cProfile.run("my_function()")

Output shows: ncalls, tottime (time in function excluding callees), cumtime (total including callees). Sort by cumtime to find the worst bottleneck.

line_profiler — line-level profiling:
pip install line_profiler
@profile  # decorator from line_profiler
def slow_function(): ...
kernprof -l -v script.py  # run and display line-by-line times

timeit — accurate micro-benchmarking:
import timeit
timeit.timeit("sum(range(1000))", number=10000)

Optimisation hierarchy (impact, highest first):
1. Algorithm — O(n log n) vs O(n²) dwarfs everything else
2. Vectorise — replace Python loops with numpy/pandas operations (100× speedup)
3. Data structures — set lookup vs list for membership testing
4. Caching — @lru_cache for repeated computations with same inputs
5. Numba @jit — compile numeric Python loops to machine code (10–200× speedup)
6. Multiprocessing — use multiple CPU cores for parallel work
7. C extensions — write performance-critical code in C/Cython as a last resort

Memory profiling:
pip install memory-profiler
@profile
def memory_heavy(): ...
python -m memory_profiler script.py`,
    plain: `The optimisation hierarchy is the most important thing in this level. A O(n²) algorithm running in pure Python that you optimise to run in numba is still O(n²). Replace it with an O(n log n) algorithm and you get the same speedup with zero effort for large inputs. Algorithm choice dominates everything. Only after you have the right algorithm should you think about vectorisation, caching, or compilation.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2048: {
    simulatorLesson: 'asyncTracer',
    id: 2048, chapter: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Async Python: asyncio and Concurrent I/O',
    fact: `asyncio enables concurrent I/O without threads. One thread handles many tasks by switching between them while waiting for I/O.

async def fetch_price(ticker: str) -> float:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"/api/prices/{ticker}")
        return response.json()["price"]

async def fetch_all(tickers: list[str]) -> list[float]:
    return await asyncio.gather(*[fetch_price(t) for t in tickers])

prices = asyncio.run(fetch_all(["AAPL","GOOG","TSLA","NVDA"]))
# All 4 requests fire simultaneously — total time ≈ slowest individual request

Key concepts:
- async def: defines a coroutine function (returns a coroutine object)
- await: pauses current coroutine until the awaitable completes — other coroutines can run
- asyncio.gather(*coros): run multiple coroutines concurrently
- asyncio.run(main()): entry point — runs the event loop

asyncio is concurrent, not parallel:
- Concurrent: one thread, multiple tasks taking turns (task switches while awaiting I/O)
- Parallel: multiple threads/processes doing work simultaneously

Use asyncio for: network requests, database queries, WebSocket feeds, file I/O. Not for CPU-bound computation (numpy, scipy calculations) — use multiprocessing for those.

asyncio with queues for producer-consumer:
queue = asyncio.Queue()
async def producer(): await queue.put(data)
async def consumer(): item = await queue.get()

In finance: fetching prices from multiple APIs simultaneously, streaming WebSocket market data feeds, concurrent database reads for portfolio construction.`,
    plain: `The concurrency vs parallelism distinction is crucial. asyncio gives you concurrency: while waiting for a network response, other tasks can run. But only one task runs at a time — there is no parallelism. For CPU-heavy numpy computation, asyncio gives you nothing — the GIL still prevents true parallel computation. asyncio wins for I/O. multiprocessing wins for CPU.`,
    stars: [480, 580, 680], target: 680, coins: 48,
  },

  2049: {
    simulatorLesson: 'multiprocessingBuilder',
    id: 2049, chapter: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Multiprocessing: True Parallelism',
    fact: `The GIL (Global Interpreter Lock) prevents multiple threads from executing Python bytecode simultaneously. For CPU-bound work, threads give no speedup. multiprocessing spawns separate processes — each has its own GIL and Python interpreter.

from multiprocessing import Pool
from concurrent.futures import ProcessPoolExecutor

# Pool.map — simplest pattern
with Pool(processes=8) as pool:
    results = pool.map(backtest_strategy, strategy_list)
# 8 strategies run truly simultaneously on 8 CPU cores

# ProcessPoolExecutor — more flexible
with ProcessPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(backtest, s, prices) for s in strategies]
    results = [f.result() for f in futures]

Pool.starmap for multiple arguments:
pool.starmap(backtest, [(s, prices, capital) for s in strategies])

Pitfalls:
- Pickling: all arguments and return values must be picklable. DataFrames are picklable; file handles, database connections, and lambda functions are not.
- Overhead: spawning processes and serialising data has cost. Only worthwhile for tasks taking >100ms each.
- Shared state: processes don't share memory. Use multiprocessing.Queue or Manager for communication.
- Start method: "spawn" on Windows (slower but required), "fork" on Unix (faster but unsafe with certain libraries).

multiprocessing.pool.ThreadPool: uses threads, not processes — shares memory but subject to GIL. Good for I/O-bound work; use asyncio instead for modern code.

In finance: parameter sweeps (10,000 strategy configurations), Monte Carlo with independent paths, cross-validation of ML models on different data splits, parallel data loading.`,
    plain: `When does multiprocessing actually help? Rule of thumb: each task should take at least 100ms to justify the overhead of spawning processes. A backtest taking 5 seconds running 16 in parallel takes ~5 seconds instead of 80. A tiny function taking 1ms parallelised across 16 processes takes longer than sequential — the process overhead dominates. Profile first, parallelise targeted tasks.`,
    stars: [480, 580, 680], target: 680, coins: 48,
  },

  2050: {
    simulatorLesson: 'ch5BossBuilder',
    id: 2050, chapter: 5, mechanic: 'calibration', tier: 'advanced',
    topic: 'Chapter 5 Boss: Production Gauntlet',
    fact: `BOSS LEVEL. Five production scenarios:

(1) A data-fetching function is called 1,000 times/second for the same 50 tickers repeatedly. What optimisations do you apply and in what order?

(2) Your backtest runs in 45 seconds on one core. You have 8 cores and 200 strategy configurations to test. What is the minimal code change and expected speedup?

(3) Your colleague pushed a PostgreSQL password to GitHub. What are the immediate steps?

(4) Write the complete type hint for: a function that takes a list of floats and a function (float → float), applies it to each element, and returns a list of floats.

(5) A pytest test fails with AssertionError: 0.15000000000000002 != 0.15. What is wrong and what is the one-line fix?`,
    plain: `Answers: (1) @lru_cache for repeated inputs, asyncio.gather for concurrent fetches, batch API endpoint if available. Order: cache first (eliminates most calls), then async (parallelises remaining). (2) with Pool(8) as p: results = p.map(backtest, configs) — expected ~8× speedup (45s → ~6s). (3) Immediately rotate credential (generate new password, revoke old). git filter-repo to remove from history. Add to .gitignore. Audit access logs. (4) def transform(data: list[float], fn: Callable[[float], float]) -> list[float]. (5) Floating point precision — fix: assert result == pytest.approx(0.15).`,
    stars: [500, 620, 740], target: 740, coins: 52,
    isBoss: true,
    calibrationData: {
      scenario: 'You add @jit(nopython=True) to a function. It fails with: TypingError: Failed in nopython mode. The function contains a pandas DataFrame operation. What do you do?',
      baseRate: 0,
      evidence: 'Numba cannot compile pandas operations — only numpy numeric code. Extract the pandas operations outside the @jit function. Pass numpy arrays (df.values or df["col"].to_numpy()) into the @jit function. The numpy operations inside will compile; the pandas operations outside remain in pure Python.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6 — NUMPY (2051–2060)
// Arrays · vectorisation · broadcasting · linalg · random · aggregations · numba
// ═══════════════════════════════════════════════════════════════════════════════

Object.assign(PYTHON_LEVELS, {

  2051: {
    id: 2051, chapter: 6, mechanic: 'match3', tier: 'advanced',
    topic: 'numpy Arrays: Creation, Indexing, Slicing',
    fact: `import numpy as np

Arrays are stored in contiguous memory — much faster and more memory-efficient than Python lists.

Creation:
np.array([1.0, 2.0, 3.0])           # from list
np.zeros(5)                          # [0. 0. 0. 0. 0.]
np.ones((3, 3))                      # 3x3 matrix of ones
np.eye(4)                            # 4x4 identity matrix
np.arange(0, 10, 2)                  # [0 2 4 6 8]
np.linspace(0, 1, 5)                 # [0. 0.25 0.5 0.75 1.]
np.full((2, 3), 7.0)                 # 2x3 matrix filled with 7.0

Key attributes:
arr.shape    # (rows, cols) or (n,) for 1D
arr.dtype    # data type (float64, int32, etc.)
arr.ndim     # number of dimensions
arr.size     # total number of elements

Indexing: arr[0], arr[-1], matrix[0, 1], matrix[:, 0] (first column), matrix[1, :] (second row).

Slicing: arr[1:4], arr[::2], arr[::-1], matrix[1:3, 0:2].

Boolean indexing: arr[arr > 0] — returns all positive elements as 1D array.
arr[(arr > -2) & (arr < 2)]  # compound conditions — use & | not and or

Fancy indexing: arr[[0, 2, 4]] — select specific indices.

Copy vs view: most slices create views — modifying the slice modifies the original.
arr_copy = arr.copy()  # explicitly create independent copy

In finance: daily returns as 1D array, returns matrix (days × assets) as 2D, OHLCV bars as structured array.`,
    plain: `The view vs copy distinction matters. arr[1:4] creates a view — it shares memory with arr. Modifying the slice changes arr. arr[1:4].copy() creates an independent array. In backtest code, passing a slice to a function and having that function modify it corrupts your original data — exactly the same aliasing problem as Python lists, but subtler because slices look like copies.`,
    stars: [460, 560, 660], target: 660, coins: 45,
    simulatorLesson: 'numpyArrayOps',
  },

  2052: {
    simulatorLesson: 'vectorOpsTracer',
    id: 2052, chapter: 6, mechanic: 'memory', tier: 'advanced',
    topic: 'Vectorised Operations and Universal Functions',
    fact: `Vectorised operations apply to entire arrays at once — executed in C, not Python. This is the fundamental reason to use numpy.

Arithmetic on arrays (element-wise):
a = np.array([1., 2., 3., 4.])
a + 10          # [11. 12. 13. 14.] — scalar broadcast
a * 2           # [2. 4. 6. 8.]
a ** 2          # [1. 4. 9. 16.]
a + a           # [2. 4. 6. 8.] — element-wise with same-shape array

Universal functions (ufuncs) — element-wise math:
np.sqrt(a)      # [1. 1.41 1.73 2.]
np.log(a)       # natural log element-wise
np.exp(a)       # e^x element-wise
np.abs(a)       # absolute value
np.sin, np.cos, np.tan
np.floor, np.ceil, np.round

Aggregations:
a.sum()         # 10.0
a.mean()        # 2.5
a.std()         # standard deviation
a.min(), a.max()
a.cumsum()      # [1. 3. 6. 10.] — cumulative sum
a.cumprod()     # cumulative product

For 2D arrays, specify axis:
matrix.sum(axis=0)   # sum of each column
matrix.sum(axis=1)   # sum of each row
matrix.mean(axis=0)  # mean of each column

Speed comparison:
# Python loop: ~1 second for 1 million elements
total = sum(x**2 for x in python_list)
# numpy: ~1 millisecond
total = (np_array**2).sum()

In finance: daily returns = (prices[1:] / prices[:-1]) - 1. Log returns = np.log(prices[1:] / prices[:-1]). Cumulative return = np.cumprod(1 + returns) - 1.`,
    plain: `The 1000× speedup from numpy is not an exaggeration for large arrays. The difference is where the loop runs: a Python list comprehension runs the loop in Python — slow. numpy runs the loop in compiled C — fast. The syntax looks almost identical. The performance is dramatically different. Any time you see yourself looping over data to compute something numerical, ask: can numpy do this?`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2053: {
    id: 2053, chapter: 6, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Broadcasting: Operations on Different Shapes',
    fact: `Broadcasting allows numpy to perform operations on arrays of different shapes by automatically stretching smaller arrays.

Broadcasting rules (applied dimension by dimension, from the right):
1. If arrays have different ndim, prepend 1s to the shorter shape.
2. Two dimensions are compatible if they are equal or one of them is 1.
3. Arrays are "broadcast" (virtually replicated) along size-1 dimensions.

Examples:
scalar + array:
np.array([1,2,3]) + 10        # [11,12,13] — scalar treated as shape (1,)

row vector + column vector → matrix:
row = np.array([[1,2,3]])      # shape (1,3)
col = np.array([[10],[20]])    # shape (2,1)
row + col                      # shape (2,3): [[11,12,13],[21,22,23]]

subtract column mean from each column of a matrix:
matrix = np.random.randn(252, 5)   # 252 days × 5 assets
means = matrix.mean(axis=0)        # shape (5,)
demeaned = matrix - means          # broadcasting: (252,5) - (5,) → (252,5)

Common error: shapes (3,) and (2,) are not broadcastable — neither dimension is 1. ValueError.

np.newaxis adds a dimension:
arr[:, np.newaxis]   # (n,) → (n,1)
arr[np.newaxis, :]   # (n,) → (1,n)

In finance: subtract risk-free rate from all asset returns. Scale returns by position weights. Compute all pairwise differences between strike prices.
weights = np.array([0.4, 0.3, 0.3])   # shape (3,)
returns_matrix = np.random.randn(252, 3)  # shape (252,3)
weighted_returns = returns_matrix * weights  # (252,3) * (3,) → (252,3)`,
    plain: `Broadcasting is where numpy beginners get confused and numpy experts get power. The rule to memorise: broadcasting works from the right side of the shape tuple. (252,5) and (5,) are compatible because 5==5. (252,5) and (252,) are NOT compatible — you need (252,1) to broadcast along columns. When in doubt: add dimensions with np.newaxis and think through what shape you need.`,
    stars: [480, 580, 680], target: 680, coins: 48,
    simulatorLesson: 'numpyBroadcasting',
  },

  2054: {
    simulatorLesson: 'linAlgTracer',
    id: 2054, chapter: 6, mechanic: 'match3', tier: 'advanced',
    topic: 'numpy Linear Algebra: np.linalg',
    fact: `np.linalg provides linear algebra operations implemented in LAPACK/BLAS — the same libraries used by MATLAB, R, and Julia.

Core operations:
np.linalg.inv(A)         # matrix inverse — O(n³)
np.linalg.det(A)         # determinant
np.linalg.solve(A, b)    # solve Ax=b — more stable and faster than inv(A)@b
np.linalg.eig(A)         # eigenvalues and eigenvectors (may be complex)
np.linalg.eigh(A)        # for symmetric/Hermitian matrices — real eigenvalues guaranteed
np.linalg.svd(A)         # singular value decomposition → U, S, Vh
np.linalg.norm(v)        # vector or matrix norm
np.linalg.matrix_rank(A) # rank of matrix
np.linalg.pinv(A)        # Moore-Penrose pseudoinverse (for rank-deficient matrices)

Matrix operations:
A @ B                    # matrix multiplication (@ operator)
A.T                      # transpose
np.trace(A)              # sum of diagonal elements

Use linalg.solve instead of inv: inv(A)@b involves more floating-point operations and accumulates more numerical error. solve(A,b) uses LU decomposition — more numerically stable.

In finance:
cov = np.cov(returns_matrix.T)           # covariance matrix
port_var = weights @ cov @ weights        # portfolio variance
eigvals, eigvecs = np.linalg.eigh(cov)   # PCA — sort by eigenvalue
corr = np.corrcoef(returns_matrix.T)     # correlation matrix
min_var_weights = np.linalg.solve(cov, np.ones(n)) / (np.ones(n) @ np.linalg.solve(cov, np.ones(n)))`,
    plain: `np.linalg.solve(A, b) over np.linalg.inv(A) @ b is a professional habit worth building early. The math is identical but the numerical properties differ — solve avoids computing the inverse explicitly, which accumulates floating-point errors. For a 100x100 covariance matrix this barely matters. For a 5000x5000 matrix it can mean the difference between a valid result and numerical garbage.`,
    stars: [480, 580, 680], target: 680, coins: 48,
  },

  2055: {
    simulatorLesson: 'randomSeedTracer',
    id: 2055, chapter: 6, mechanic: 'memory', tier: 'advanced',
    topic: 'numpy Random: Reproducible Simulation',
    fact: `Modern numpy random (3.1+): always use np.random.default_rng(seed) instead of np.random.seed(). The new interface is reproducible, thread-safe, and produces better random numbers.

rng = np.random.default_rng(seed=42)  # reproducible generator

Distributions:
rng.standard_normal(size)       # N(0,1)
rng.normal(loc, scale, size)    # N(mu, sigma)
rng.uniform(low, high, size)    # Uniform[low, high)
rng.integers(low, high, size)   # integer in [low, high)
rng.exponential(scale, size)    # Exponential(lambda=1/scale)
rng.choice(arr, size, replace=False)  # sample without replacement

Generating correlated normals:
cov = np.array([[1.0, 0.8], [0.8, 1.0]])
rng.multivariate_normal(mean=[0,0], cov=cov, size=1000)
# 1000 samples of correlated (rho=0.8) bivariate normal

Seed and reproducibility: the same seed produces identical random numbers on every run.
rng = np.random.default_rng(42)
rng.standard_normal(5)  # always: [0.304, 1.765, -0.977, -0.153, 0.596]

Why reproducibility matters: results should be reproducible given the same seed. Debugging requires you to reproduce the exact simulation that caused a problem. Regulatory requirements demand that Monte Carlo methodologies be demonstrably repeatable.

In finance:
rng = np.random.default_rng(seed=42)
Z = rng.standard_normal((n_paths, n_steps))
# GBM paths:
S = S0 * np.exp(np.cumsum((mu - 0.5*sigma**2)*dt + sigma*np.sqrt(dt)*Z, axis=1))
# Bootstrap:
samples = rng.choice(historical_returns, size=(n_sims, len(returns)), replace=True)`,
    plain: `Always set a seed for any simulation used to make decisions. "Our VaR model estimates 2.3% at 99% confidence" — can you reproduce that exact number? With a seeded rng, yes. Without a seed, you have a different random simulation every time, which makes verification impossible. This matters for regulatory submissions and for debugging: "reproduce the simulation that showed the strategy losing 40%" requires a reproducible seed.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2056: {
    simulatorLesson: 'aggregationTracer',
    id: 2056, chapter: 6, mechanic: 'match3', tier: 'advanced',
    topic: 'numpy Aggregations, Sorting, and Set Operations',
    fact: `Aggregation functions (also work along specific axes with axis parameter):
np.sum, np.mean, np.std, np.var       # basic stats
np.min, np.max, np.median, np.percentile([50,95])
np.cumsum, np.cumprod                  # cumulative
np.diff(arr)                           # differences: arr[i+1] - arr[i]
np.gradient(arr)                       # numerical derivative

Sorting:
np.sort(arr)                           # returns sorted copy
arr.sort()                             # in-place sort
np.argsort(arr)                        # indices that would sort arr
np.argmax(arr), np.argmin(arr)         # index of max/min
np.partition(arr, k)                   # k-th smallest at index k, others partitioned

Finding:
np.where(condition, x, y)              # element-wise: x where True, y where False
np.nonzero(arr)                        # indices of non-zero elements
np.searchsorted(sorted_arr, values)    # binary search

Set operations on 1D arrays:
np.unique(arr)                         # unique elements, sorted
np.unique(arr, return_counts=True)     # with frequencies
np.intersect1d(a, b)                   # sorted intersection
np.union1d(a, b)                       # sorted union
np.setdiff1d(a, b)                     # elements in a not in b

In finance:
np.argmax(cumulative_returns) vs np.argmin — find peak and trough for drawdown calculation.
np.percentile(returns, [5, 25, 50, 75, 95]) — return distribution.
np.where(signals > 0, 1, -1) — convert raw signal to ±1 positions.
np.diff(log_prices) — log returns from log prices.`,
    plain: `np.where is one of the most useful numpy functions for finance. np.where(returns > 0, returns, 0) keeps positive returns and sets negative ones to zero — vectorised conditional in one line. np.where(signal > threshold, 1, np.where(signal < -threshold, -1, 0)) creates a three-state signal (long/flat/short) without any loops. Clean, fast, readable.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2057: {
    simulatorLesson: 'dtypeMemoryCalc',
    id: 2057, chapter: 6, mechanic: 'codeTrace', tier: 'expert',
    topic: 'numpy Memory, dtypes, and Structured Arrays',
    fact: `dtype controls how values are stored in memory — affects both size and precision.

Common dtypes:
float64 (default float): 8 bytes, ~15 decimal digits of precision
float32: 4 bytes, ~7 decimal digits — half the memory, less precision
int64: 8 bytes integers
int32: 4 bytes integers
bool: 1 byte (True/False)
complex128: 16 bytes complex numbers

np.array([1.,2.,3.], dtype=np.float32)
arr.astype(np.float64)  # convert dtype

Memory layout:
C-contiguous: row-major (C, Python default). Row elements are adjacent in memory.
F-contiguous: column-major (Fortran). Column elements are adjacent.
arr.flags shows layout. np.ascontiguousarray(arr) ensures C-contiguous.
Operations on contiguous arrays are faster — CPU cache-friendly.

Structured arrays (record arrays):
trade_dtype = np.dtype([
    ('timestamp', 'f8'),   # float64
    ('symbol', 'U10'),     # unicode string, 10 chars max
    ('price', 'f4'),       # float32
    ('quantity', 'i4'),    # int32
])
trades = np.zeros(1000, dtype=trade_dtype)
trades['price']  # access by field name — all prices as array

Memory savings: 252 trading days × 1000 stocks × float64 = 2,016,000 bytes (2 MB). In float32: 1 MB. For 10 years of data: 20 MB vs 10 MB. For tick data with billions of rows, dtype choice is critical.

In finance: tick data storage (int32 timestamps, float32 prices, int32 volumes — much smaller than float64 defaults). Returns matrix — float32 is usually sufficient precision and halves memory.`,
    plain: `float32 vs float64 matters at scale. Daily close prices for 500 stocks over 20 years: 500 × 5000 × 8 bytes = 20 MB in float64, 10 MB in float32. Tick data for a single stock on a busy day: 10 million ticks × several fields. In float32 that is manageable. In float64 it doubles. The precision tradeoff: float32 has ~7 significant digits. For prices like 150.2345, that is plenty. For accumulating many multiplications (compound returns over years), use float64.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2058: {
    simulatorLesson: 'numbaSpeedCalc',
    id: 2058, chapter: 6, mechanic: 'memory', tier: 'expert',
    topic: 'Numba: JIT Compilation for Numeric Loops',
    fact: `Numba compiles Python numeric functions to machine code at runtime using LLVM. Speed is comparable to C/Fortran.

from numba import jit, njit, prange

@njit  # nopython=True — compile to pure machine code, no Python fallback
def monte_carlo_paths(n_paths, n_steps, S0, mu, sigma, dt, seed):
    np.random.seed(seed)
    paths = np.zeros((n_paths, n_steps + 1))
    for i in range(n_paths):
        paths[i, 0] = S0
        for t in range(1, n_steps + 1):
            z = np.random.standard_normal()
            paths[i, t] = paths[i, t-1] * np.exp((mu - 0.5*sigma**2)*dt + sigma*np.sqrt(dt)*z)
    return paths

# First call: compiles (~1s). Subsequent calls: near-C speed (~0.01s for 10000 paths).

@njit(parallel=True)
def parallel_function():
    for i in prange(n):  # prange: parallel range
        ...

What Numba can compile (nopython mode):
- numpy array operations
- Basic Python control flow (for, while, if)
- Math functions (math.log, math.exp, etc.)
- numba-compatible functions

What it cannot compile:
- pandas operations
- Python objects with dynamic dispatch
- Most Python standard library

Ahead-of-time compilation: @njit with cache=True — saves compiled function to disk, avoids recompilation on next run.

Speedup range: typically 10–200× over pure Python loops for numeric code.

In finance: path-dependent option pricing (Asian options, barrier options — each step depends on previous). Monte Carlo simulations. Rolling computations where dependencies prevent vectorisation.`,
    plain: `Numba is magic for the loops that cannot be vectorised. Pure numpy cannot efficiently handle "the payoff at each step depends on the path so far" — that is inherently sequential. But @njit can compile that sequential loop to run as fast as C. The first call compiles (pay once). Every subsequent call runs at machine-code speed. The limitation: only works with numpy-style numeric code inside the function.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2059: {
    simulatorLesson: 'numpyWorkflowBuilder',
    id: 2059, chapter: 6, mechanic: 'match3', tier: 'expert',
    topic: 'numpy in Practice: Full Financial Workflow',
    fact: `A complete numpy workflow: daily prices → returns → portfolio analysis.

import numpy as np

# Simulated price data: 252 days × 5 assets
rng = np.random.default_rng(42)
prices = 100 * np.cumprod(1 + rng.normal(0.0005, 0.015, size=(252, 5)), axis=0)

# Returns
log_returns = np.diff(np.log(prices), axis=0)   # (251, 5)
simple_returns = np.diff(prices, axis=0) / prices[:-1]

# Per-asset statistics
means = log_returns.mean(axis=0) * 252            # annualised mean
stds = log_returns.std(axis=0) * np.sqrt(252)     # annualised vol
sharpes = means / stds

# Portfolio (equal weight)
weights = np.ones(5) / 5
port_returns = log_returns @ weights               # (251,) portfolio returns
port_cumret = np.cumprod(1 + port_returns) - 1    # cumulative return

# Risk: covariance matrix → portfolio variance
cov_matrix = np.cov(log_returns.T) * 252          # annualised
port_var = weights @ cov_matrix @ weights          # portfolio variance
port_vol = np.sqrt(port_var)

# Drawdown
cum_wealth = np.cumprod(1 + port_returns)
rolling_max = np.maximum.accumulate(cum_wealth)
drawdown = (cum_wealth - rolling_max) / rolling_max
max_drawdown = drawdown.min()

# Correlation
corr = np.corrcoef(log_returns.T)

print(f"Portfolio Sharpe: {(port_returns.mean()*252) / (port_returns.std()*np.sqrt(252)):.2f}")
print(f"Max Drawdown: {max_drawdown:.1%}")
print(f"Portfolio Vol: {port_vol:.1%}")`,
    plain: `This workflow — prices to returns to risk metrics — is the foundation of every quantitative analysis. The entire computation runs in milliseconds for 252 days × 5 assets because every operation is vectorised. With 10 years × 500 assets, the same code still runs in under a second. This is why numpy is non-negotiable: the same analysis in pure Python would take minutes.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2060: {
    simulatorLesson: 'ch6BossBuilder',
    id: 2060, chapter: 6, mechanic: 'calibration', tier: 'expert',
    topic: 'Chapter 6 Boss: numpy Gauntlet',
    fact: `BOSS LEVEL. Five challenges:

(1) Given prices = np.array([100,102,101,105,103,107], dtype=float), compute log returns in one line using np.log and slicing.

(2) You have a (252,5) returns matrix. Write one expression to compute the (5,) vector of annualised Sharpe ratios (assume rf=0).

(3) Why does arr[arr > 0].mean() produce a different result than np.where(arr > 0, arr, 0).mean()? Which gives the "average positive return"?

(4) Write the broadcasting operation that computes the (252,5) matrix of excess returns, where each column has its own mean subtracted.

(5) A function computing a path-dependent payoff loops 10 million times. Vectorised numpy is difficult due to path dependencies. What tool do you reach for?`,
    plain: `Answers: (1) np.log(prices[1:] / prices[:-1]) or np.diff(np.log(prices)). (2) (returns.mean(axis=0)*252) / (returns.std(axis=0)*np.sqrt(252)). (3) arr[arr>0].mean() averages ONLY positive values. np.where(...,0).mean() includes zeros in the mean — dilutes the average. Use arr[arr>0].mean() for average positive return. (4) returns - returns.mean(axis=0) — broadcasting (252,5) - (5,) works column-wise. (5) @njit from numba — compiles the sequential loop to machine code.`,
    stars: [520, 640, 760], target: 760, coins: 55,
    isBoss: true,
    calibrationData: {
      scenario: 'np.random.seed(42); a = np.random.randn(5). rng = np.random.default_rng(42); b = rng.standard_normal(5). Are a and b identical?',
      baseRate: 0,
      evidence: 'No. np.random.seed uses the legacy Mersenne Twister algorithm. np.random.default_rng uses PCG64 — a different algorithm producing different sequences. Same seed ≠ same output across different generators. Always use default_rng for new code, and document which generator and seed you used for reproducibility.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7 — PANDAS (2061–2070)
// Series · DataFrame · indexing · cleaning · groupby · merge · time series · apply
// ═══════════════════════════════════════════════════════════════════════════════

Object.assign(PYTHON_LEVELS, {

  2061: {
    simulatorLesson: 'dataframeBuilder',
    id: 2061, chapter: 7, mechanic: 'match3', tier: 'advanced',
    topic: 'Series and DataFrame: Creation and Basics',
    fact: `import pandas as pd

Series: 1D labelled array. Like a numpy array with an index.
s = pd.Series([100.0, 102.5, 101.0], index=["2024-01-01","2024-01-02","2024-01-03"])
s["2024-01-02"]     # 102.5 — label access
s.values            # numpy array underlying the Series
s.index             # the Index object

DataFrame: 2D labelled table — like a dict of Series sharing the same index.
df = pd.DataFrame({
    "open":  [100.0, 102.0, 101.5],
    "close": [102.5, 101.0, 103.0],
    "volume":[1_200_000, 980_000, 1_500_000],
}, index=["2024-01-01","2024-01-02","2024-01-03"])

df.shape         # (3, 3)
df.dtypes        # column dtypes
df.info()        # dtypes + non-null counts + memory
df.describe()    # count, mean, std, min, 25%, 50%, 75%, max
df.head(5)       # first 5 rows
df.tail(5)       # last 5 rows

Column access: df["close"] → Series. df[["open","close"]] → DataFrame.
Adding column: df["return"] = df["close"] / df["open"] - 1

From CSV: pd.read_csv("prices.csv", index_col=0, parse_dates=True)
From dict: pd.DataFrame.from_dict(data)
From records: pd.DataFrame(list_of_dicts)

In finance: price history is a DataFrame with DatetimeIndex rows and ticker columns. Each column is a Series of prices for one asset. Portfolio returns matrix is a DataFrame.`,
    plain: `The mental model: a DataFrame is a spreadsheet with superpowers. Rows are observations (dates, trades, events). Columns are variables (price, volume, return). The index labels the rows — usually dates for time series data. Operations on columns are vectorised like numpy. The index enables powerful time-series alignment that raw numpy arrays cannot do.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2062: {
    id: 2062, chapter: 7, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Indexing: loc, iloc, and Boolean Selection',
    fact: `Three indexing methods for DataFrames:

.loc[row_label, col_label] — label-based indexing:
df.loc["2024-01-02"]                # single row by label → Series
df.loc["2024-01-01":"2024-01-03"]   # slice by label (inclusive both ends)
df.loc[:, "close"]                  # all rows, one column
df.loc["2024-01-02", "close"]       # single cell

.iloc[row_int, col_int] — position-based indexing:
df.iloc[0]           # first row
df.iloc[-1]          # last row
df.iloc[0:3]         # first 3 rows (exclusive like Python slicing)
df.iloc[0:3, 1:3]    # first 3 rows, columns 1–2

Boolean indexing:
df[df["volume"] > 1_000_000]           # rows where volume > 1M
df[(df["close"] > 101) & (df["open"] < 102)]  # compound condition
df[df["ticker"].isin(["AAPL","GOOG"])] # isin for list membership

.at[label, col] and .iat[row, col] — scalar access (faster than .loc/.iloc for single cell).

Common mistakes:
- df["2024-01-02"] fails — use df.loc["2024-01-02"]
- Chained indexing: df["close"][df["close"]>100] = 0 — raises SettingWithCopyWarning. Use df.loc[df["close"]>100, "close"] = 0 instead.
- loc slicing is inclusive on both ends. iloc slicing is exclusive on the end.

In finance: df.loc["2023-01-01":"2023-12-31"] — filter one year of data. df.iloc[-252:] — last 252 trading days. df[df["return"] < -0.05] — identify crash days.`,
    plain: `The chained indexing trap — df["close"][mask] = value — is the most common pandas bug. It might work or it might silently fail to modify the original DataFrame (you are modifying a copy). The pandas documentation explicitly calls this out. Always use df.loc[mask, "close"] = value for assignment — it unambiguously modifies the original. For reads, chaining is fine. For writes, always use .loc.`,
    stars: [460, 560, 660], target: 660, coins: 45,
    simulatorLesson: 'pandasIndexing',
  },

  2063: {
    simulatorLesson: 'dataCleaner',
    id: 2063, chapter: 7, mechanic: 'memory', tier: 'advanced',
    topic: 'Data Cleaning: Missing Values, Duplicates, Types',
    fact: `Missing values in pandas: NaN (float), pd.NaT (datetime), None. Propagate through arithmetic.

Detecting missing values:
df.isna()           # boolean DataFrame of missing values
df.isna().sum()     # count per column
df.isna().any()     # which columns have any missing
df.notna()          # inverse

Handling missing values:
df.dropna()                       # drop rows with any NaN
df.dropna(subset=["close"])       # drop rows where "close" is NaN
df.dropna(thresh=3)               # keep rows with at least 3 non-NaN
df.fillna(0)                      # fill with constant
df.fillna(method="ffill")         # forward fill (last valid value)
df.fillna(method="bfill")         # backward fill
df["close"].interpolate()         # linear interpolation

Duplicates:
df.duplicated()                   # boolean mask of duplicate rows
df.duplicated(subset=["date","ticker"])  # duplicates on subset of columns
df.drop_duplicates()              # keep first occurrence
df.drop_duplicates(keep="last")   # keep last occurrence

Type conversion:
df["price"].astype(float)
df["date"] = pd.to_datetime(df["date"])
df["volume"].astype("Int64")       # nullable integer (handles NaN in int column)
pd.to_numeric(df["price"], errors="coerce")  # convert, NaN for failures

Checking types: df.dtypes. Categoricals: df["sector"].astype("category") — saves memory for low-cardinality columns.

In finance: stock price data has weekends/holidays (gaps), corporate actions causing price discontinuities, bad prints (erroneous ticks). Always inspect df.describe() and df.isna().sum() before analysis.`,
    plain: `Forward fill (ffill) is the standard for financial price data gaps — if a price is missing for a day, use the previous day's price (the asset just didn't trade or data is missing). This is better than interpolation for prices because you cannot know the future. Always check for missing data and outliers before any analysis. df.describe() shows min/max — a price of 0 or 1e10 in stock price data is a bad print.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2064: {
    simulatorLesson: 'groupbyBuilder',
    id: 2064, chapter: 7, mechanic: 'match3', tier: 'advanced',
    topic: 'GroupBy: Split-Apply-Combine',
    fact: `groupby splits a DataFrame into groups, applies a function to each, and combines results.

df.groupby("sector")["return"].mean()        # mean return by sector
df.groupby("ticker").agg({"return":"mean","volume":"sum"})  # multiple aggregations
df.groupby(["year","sector"])["return"].std()  # multi-level groupby

Built-in aggregations: mean, sum, min, max, std, count, nunique, first, last, median, describe.

.agg() for multiple functions per column:
df.groupby("sector").agg(
    avg_return=("return", "mean"),
    total_vol=("volume", "sum"),
    n_stocks=("ticker", "nunique")
)

.transform(): returns result the same shape as input — fills each row with its group's statistic.
df["sector_mean_return"] = df.groupby("sector")["return"].transform("mean")
df["excess_vs_sector"] = df["return"] - df["sector_mean_return"]

.apply(): apply any function to each group — most flexible, slowest.
df.groupby("ticker").apply(lambda g: g.nlargest(5, "return"))

.filter(): keep groups satisfying a condition.
df.groupby("sector").filter(lambda g: len(g) > 50)  # only sectors with 50+ stocks

In finance: compute mean return per sector. Rank stocks within each sector. Compute beta per ticker. Aggregate trade data by day. Compute turnover by strategy.`,
    plain: `transform() is the most underused groupby feature. It returns data the same shape as the input, so you can add group statistics as new columns without losing any rows. "Add each stock's sector-average return alongside its own return" is three lines with transform. Without transform, you would groupby, compute the mean, then merge it back — much more code.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2065: {
    simulatorLesson: 'mergePredictor',
    id: 2065, chapter: 7, mechanic: 'memory', tier: 'advanced',
    topic: 'Merge, Join, and Concat',
    fact: `Three ways to combine DataFrames:

pd.concat: stack DataFrames vertically or horizontally.
pd.concat([df1, df2])              # vertical (stack rows)
pd.concat([df1, df2], axis=1)     # horizontal (stack columns)
pd.concat([df1, df2], ignore_index=True)  # reset index

pd.merge: SQL-style join on columns or index.
pd.merge(trades, prices, on="ticker")           # inner join on common column
pd.merge(trades, prices, on="ticker", how="left")   # left join
pd.merge(trades, prices, on="ticker", how="outer")  # full outer join
pd.merge(df1, df2, left_on="trade_date", right_on="price_date")  # different column names

Join types:
"inner": only rows with matching keys in both (default)
"left": all rows from left, matching from right (NaN if no match)
"right": all rows from right, matching from left
"outer": all rows from both, NaN where no match

df.join: join on index (wrapper around merge for index-based joins).
prices.join(volumes, how="inner")  # join two DataFrames on their indices

Validation:
pd.merge(..., validate="one_to_one")  # raises if duplicates in key

Common merge bugs:
- Duplicate keys create cartesian product (rows multiply unexpectedly)
- Missing keys silently disappear in inner join
- Time zones in DatetimeIndex preventing joins

In finance: merge price data with fundamental data on (ticker, date). Join earnings dates to price history. Concat daily price files into one historical series.`,
    plain: `Always check the shape before and after a merge. If you merge two DataFrames and the result has more rows than either input, you have duplicate keys creating a cartesian product — each row in one matched multiple rows in the other. validate="one_to_one" or validate="many_to_one" catches this before it silently corrupts your analysis.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2066: {
    id: 2066, chapter: 7, mechanic: 'codeTrace', tier: 'advanced',
    topic: 'Time Series: DatetimeIndex, resample, rolling',
    fact: `pandas has first-class time series support.

DatetimeIndex:
df.index = pd.to_datetime(df.index)
pd.date_range("2020-01-01", "2023-12-31", freq="B")  # business days
pd.date_range(periods=252, freq="B", end="2024-01-01")

Time-based selection:
df["2023"]                     # all of 2023
df["2023-06":"2023-12"]        # June–December 2023
df.between_time("09:30","16:00")  # filter by time of day

resample: group by time frequency and aggregate.
df.resample("W").last()         # weekly: last value per week
df.resample("ME").mean()        # monthly end: mean per month
df.resample("QE-DEC").sum()     # quarterly (calendar year end)
df.resample("B").ffill()        # business day frequency, forward fill

rolling: sliding window computations.
df["close"].rolling(20).mean()   # 20-period moving average
df["close"].rolling(20).std()    # 20-period rolling volatility
df["return"].rolling(252).apply(lambda x: x.mean()/x.std()*np.sqrt(252))  # rolling Sharpe

expanding: grows from start to each point.
df["return"].expanding().mean()  # expanding mean

ewm: exponentially weighted (more weight to recent data).
df["close"].ewm(span=20).mean()  # EMA with span=20

shift: lag or lead data.
df["return"].shift(1)            # yesterday's return (lag)
df["price"].pct_change()         # equivalent to (p - p.shift(1)) / p.shift(1)`,
    plain: `resample and rolling are the two time-series operations you will use most. resample converts daily data to weekly/monthly — one line replaces loop + groupby + aggregate. rolling computes any metric over a sliding window — moving average, rolling Sharpe, rolling beta. The combination of a DatetimeIndex and these methods makes pandas the tool of choice for financial time series over raw numpy.`,
    stars: [480, 580, 680], target: 680, coins: 48,
    simulatorLesson: 'pandasTimeSeries',
  },

  2067: {
    simulatorLesson: 'applyVsVectorised',
    id: 2067, chapter: 7, mechanic: 'match3', tier: 'advanced',
    topic: 'apply, map, and Vectorised Operations',
    fact: `Three ways to apply functions in pandas, in order of performance (fast to slow):

1. Built-in vectorised operations (fastest):
df["log_return"] = np.log(df["close"] / df["close"].shift(1))
# Use built-in methods and numpy ufuncs whenever possible.

2. .map() on Series — element-wise for Series:
df["sector_code"] = df["sector"].map({"Tech":1, "Finance":2, "Energy":3})
# For Series-to-Series mapping via a dict or function.

3. .apply() on Series or DataFrame — more flexible, slower:
df["return"].apply(lambda x: "up" if x > 0 else "down")  # element-wise on Series
df.apply(lambda col: col.max() - col.min())  # column-wise on DataFrame
df.apply(lambda row: complex_calc(row), axis=1)  # row-wise (slowest)

4. .applymap() / .map() on DataFrame (Python 3.9+: df.map()) — element-wise on DataFrame.

Performance rule: vectorised operations >> map >> apply(axis=0) >> apply(axis=1).
Row-wise apply (axis=1) is nearly as slow as a Python for loop.

String operations (vectorised):
df["ticker"].str.upper()
df["ticker"].str.startswith("A")
df["ticker"].str.extract(r"([A-Z]+)")
df["text"].str.contains("earnings", case=False)

When you must use apply(axis=1): avoid it. Try to reshape the problem so you can use vectorised operations. If unavoidable (genuinely complex row-wise logic), at least profile it.

In finance: df["ticker"].map(sector_dict) to add sector. Series.apply() for custom signal transforms. df.apply(compute_beta, axis=0) for per-column beta computation.`,
    plain: `The row-wise apply trap: df.apply(my_function, axis=1) iterates over rows in Python — almost as slow as writing a for loop yourself. Before using it, ask: can I vectorise this? Usually yes. "Compute the ratio of two columns" = df["col1"] / df["col2"] — not apply. "Apply a custom scoring function to each row" might genuinely need apply, but profile it first.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2068: {
    simulatorLesson: 'reshapeBuilder',
    id: 2068, chapter: 7, mechanic: 'memory', tier: 'expert',
    topic: 'MultiIndex and Advanced Reshaping',
    fact: `MultiIndex (hierarchical index): multiple levels of indexing for complex datasets.

Creating:
df = pd.DataFrame(data, index=pd.MultiIndex.from_tuples([("AAPL","2023-01-01"),("AAPL","2023-01-02"),("GOOG","2023-01-01")], names=["ticker","date"]))

Access:
df.loc["AAPL"]                          # all AAPL rows
df.loc[("AAPL","2023-01-02")]           # single row
df.loc[("AAPL",slice(None))]           # AAPL, all dates
df.xs("2023-01-01", level="date")      # cross-section: all tickers on this date

MultiIndex on columns (result of groupby with multiple aggs):
grouped = df.groupby("ticker").agg({"close":["mean","std"],"volume":"sum"})
grouped["close","mean"]                 # access via tuple

Reshaping:
df.stack()     # column labels → inner level of index
df.unstack()   # inner index level → column labels

pivot_table: like Excel pivot tables.
df.pivot_table(values="return", index="date", columns="ticker", aggfunc="mean")
# Creates a date × ticker returns matrix

pd.melt: wide to long format.
pd.melt(df, id_vars=["date"], value_vars=["AAPL","GOOG"], var_name="ticker", value_name="price")

pd.crosstab: frequency table of two categorical variables.
pd.crosstab(df["sector"], df["signal"])

In finance: MultiIndex for panel data (ticker × date). Unstack to get wide format (date rows × ticker columns). Stack to get long format for analysis. pivot_table to compute returns matrix from trade data.`,
    plain: `The wide vs long format distinction matters. Wide format: columns are tickers, rows are dates — natural for correlation matrices and portfolio construction. Long format: each row is one (ticker, date) observation — natural for groupby operations and database storage. stack/unstack and melt/pivot_table convert between them. Know which format each operation needs.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2069: {
    simulatorLesson: 'pandasWorkflowBuilder',
    id: 2069, chapter: 7, mechanic: 'match3', tier: 'expert',
    topic: 'pandas in Practice: Full Financial Workflow',
    fact: `A complete pandas workflow: raw CSV → clean data → analysis.

import pandas as pd, numpy as np

# Load price data
prices = pd.read_csv("prices.csv", index_col=0, parse_dates=True)
# DataFrame: DatetimeIndex rows, ticker columns

# Clean
prices = prices.ffill()                        # forward fill missing prices
prices = prices.dropna(how="all")              # drop rows with all NaN

# Returns
returns = prices.pct_change().dropna()         # simple daily returns

# Portfolio construction (equal weight)
weights = pd.Series(1/len(prices.columns), index=prices.columns)
port_returns = (returns * weights).sum(axis=1) # weighted portfolio returns

# Rolling metrics
rolling_sharpe = (
    returns.rolling(252)
    .apply(lambda x: (x.mean() / x.std()) * np.sqrt(252) if x.std() > 0 else np.nan)
)

# Sector analysis (if sector data available)
# returns.T.join(sectors).groupby("sector").mean().T  # mean return per sector per day

# Summary statistics
summary = returns.describe().T
summary["sharpe"] = returns.mean() / returns.std() * np.sqrt(252)
summary["max_drawdown"] = (
    (1+returns).cumprod()
    .apply(lambda s: (s / s.cummax() - 1).min())
)

# Monthly performance
monthly = returns.resample("ME").apply(lambda x: (1+x).prod()-1)

print(summary[["mean","std","sharpe","max_drawdown"]].round(4))`,
    plain: `This workflow — from raw CSV to annualised metrics — is what you will write on day one of a research role. The pandas machinery handles date alignment, missing values, vectorised computation, and resampling automatically. The same code that works on 5 stocks works on 500 stocks with no changes. That scalability is the reason pandas dominates financial data analysis.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2070: {
    simulatorLesson: 'ch7BossBuilder',
    id: 2070, chapter: 7, mechanic: 'calibration', tier: 'expert',
    topic: 'Chapter 7 Boss: pandas Gauntlet',
    fact: `BOSS LEVEL. Five challenges:

(1) Given a DataFrame with columns [date, ticker, price], write the one-liner to create a wide-format returns matrix (rows=dates, columns=tickers). Assume prices are already sorted by date within each ticker.

(2) df["return"] has some NaN values. You use df.fillna(method="ffill"). When is forward fill WRONG for returns data (vs price data)?

(3) You merge two DataFrames and the result has 3× as many rows as either input. What happened and how do you diagnose it?

(4) Write the rolling 252-day Sharpe ratio for a returns Series in one pandas chain.

(5) df.loc["2023-01-01":"2023-01-31"] returns an empty DataFrame even though the data exists for January 2023. What is the most likely cause?`,
    plain: `Answers: (1) df.pivot_table(values="price",index="date",columns="ticker").pct_change(). (2) Forward-filling returns is almost always wrong — a missing return is not the same as repeating yesterday's return. Forward fill prices, then compute returns from filled prices. (3) Duplicate keys — cartesian product. Diagnose: df[key].duplicated().sum() on both sides before merging. (4) returns.rolling(252).apply(lambda x: x.mean()/x.std()*252**0.5). (5) Index is not a DatetimeIndex — convert with df.index = pd.to_datetime(df.index).`,
    stars: [540, 660, 780], target: 780, coins: 58,
    isBoss: true,
    calibrationData: {
      scenario: 'df.groupby("ticker")["return"].mean() vs df.groupby("ticker")["return"].transform("mean"). What is the shape and use case for each?',
      baseRate: 0,
      evidence: 'groupby.mean() returns a Series indexed by ticker — one value per ticker. transform("mean") returns a Series the same shape as the input — each row filled with its ticker\'s mean return. Use .mean() when you want a summary. Use .transform() when you want to add a new column to the original DataFrame (e.g., "sector_avg_return" alongside each row\'s own return).',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8 — SCIPY AND VISUALISATION (2071–2080)
// scipy.stats · hypothesis testing · scipy.optimize · interpolate · matplotlib · seaborn · plotly
// ═══════════════════════════════════════════════════════════════════════════════

Object.assign(PYTHON_LEVELS, {

  2071: {
    simulatorLesson: 'scipyStatsQuiz',
    id: 2071, chapter: 8, mechanic: 'match3', tier: 'expert',
    topic: 'scipy.stats: Probability Distributions',
    fact: `scipy.stats provides every standard probability distribution as a frozen or unfrozen object.

from scipy import stats

# Normal distribution object
norm = stats.norm(loc=0, scale=1)   # N(0,1) — frozen
norm.pdf(0)          # probability density at 0 → 0.3989
norm.cdf(1.96)       # P(X ≤ 1.96) → 0.9750
norm.ppf(0.95)       # 95th percentile → 1.6449
norm.rvs(size=1000)  # 1000 random samples

Common distributions:
stats.t(df=30)                # Student-t with 30 degrees of freedom
stats.norm, stats.lognorm, stats.expon
stats.poisson(mu=5)           # Poisson
stats.binom(n=100, p=0.5)     # Binomial

Fitting distributions to data:
mu, sigma = stats.norm.fit(data)          # MLE fit
df, loc, scale = stats.t.fit(data)       # fit Student-t
result = stats.kstest(data, "norm")      # Kolmogorov-Smirnov test for normality

Descriptive statistics:
stats.describe(data)           # n, min, max, mean, variance, skewness, kurtosis
stats.skew(data)               # skewness — measure of asymmetry
stats.kurtosis(data)           # excess kurtosis (normal=0)

In finance:
norm.ppf(0.01)                                  # 1% VaR threshold (z-score)
# Fit Student-t to capture fat tails:
df, loc, scale = stats.t.fit(daily_returns)
t_dist = stats.t(df, loc, scale)
var_1pct = t_dist.ppf(0.01)                    # fat-tail adjusted VaR
prob_loss = t_dist.cdf(-0.05)                  # P(loss > 5%)`,
    plain: `The distribution-as-object pattern is elegant. norm.ppf(0.01) gives you the 1% VaR threshold directly — no formula to remember. t.fit(data) estimates parameters by maximum likelihood with one line. And because the same API works for norm, t, lognorm, and every other distribution, switching between distributional assumptions in your VaR model is a one-word change.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2072: {
    simulatorLesson: 'hypothesisTestingQuiz',
    id: 2072, chapter: 8, mechanic: 'memory', tier: 'expert',
    topic: 'scipy.stats: Hypothesis Testing',
    fact: `Hypothesis tests answer: "is this observation statistically distinguishable from chance?"

t-tests:
stats.ttest_1samp(returns, popmean=0)        # is mean return different from 0?
stats.ttest_ind(returns_A, returns_B)        # are two strategies different?
stats.ttest_rel(before, after)               # paired test (same portfolio, different periods)
# Returns: (statistic, p_value)

Correlation tests:
stats.pearsonr(x, y)    # Pearson r + p-value
stats.spearmanr(x, y)   # Spearman rank correlation + p-value (non-parametric)
stats.kendalltau(x, y)  # Kendall tau

Normality tests:
stats.shapiro(data)              # Shapiro-Wilk (best for n<50)
stats.kstest(data, "norm")       # Kolmogorov-Smirnov
stats.jarque_bera(data)          # tests skewness + kurtosis simultaneously (common in finance)

Non-parametric tests (when normality assumed):
stats.mannwhitneyu(a, b)         # non-parametric alternative to t-test
stats.wilcoxon(a, b)             # paired non-parametric t-test
stats.kruskal(*groups)           # non-parametric one-way ANOVA

Multiple comparisons: when running many tests, false positives accumulate.
from statsmodels.stats.multitest import multipletests
rejected, p_adj, _, _ = multipletests(p_values, method="fdr_bh")  # Benjamini-Hochberg

In finance: is strategy alpha statistically significant? Are two periods of returns drawn from the same distribution? Is the returns distribution normal (almost certainly no, but quantify how much)?`,
    plain: `The multiple comparisons trap destroys more backtests than anything else. Running 100 t-tests at p<0.05 significance means about 5 false positives from random chance alone. Always correct for multiple comparisons — Bonferroni (conservative) or Benjamini-Hochberg (less conservative but controls false discovery rate). A strategy that is "significant" only after looking at 500 variations is not significant.`,
    stars: [500, 600, 700], target: 700, coins: 50,
  },

  2073: {
    simulatorLesson: 'optimisationQuiz',
    id: 2073, chapter: 8, mechanic: 'match3', tier: 'expert',
    topic: 'scipy.optimize: Minimisation and Root Finding',
    fact: `scipy.optimize solves: find x that minimises f(x), or find x where f(x) = 0.

Unconstrained minimisation:
from scipy.optimize import minimize

result = minimize(
    fun=lambda x: x[0]**2 + x[1]**2,  # function to minimise
    x0=[1.0, 2.0],                      # initial guess
    method="BFGS"                        # algorithm (L-BFGS-B, Nelder-Mead, ...)
)
result.x      # optimal point
result.fun    # optimal value
result.success  # True if converged

Constrained minimisation:
from scipy.optimize import minimize, LinearConstraint, NonlinearConstraint

# Maximise Sharpe ratio (minimise negative Sharpe):
def neg_sharpe(weights, returns, rf=0.0):
    port_ret = returns @ weights
    return -(port_ret.mean() / port_ret.std()) * np.sqrt(252)

constraints = [{"type":"eq","fun": lambda w: w.sum()-1}]  # fully invested
bounds = [(0, 1)] * n_assets                                # long only

result = minimize(neg_sharpe, x0=np.ones(n)/n, args=(returns,),
                  method="SLSQP", bounds=bounds, constraints=constraints)

Root finding (f(x) = 0):
from scipy.optimize import brentq, bisect
brentq(f, a, b)    # Brent's method — most robust, needs f(a) and f(b) to have opposite signs
bisect(f, a, b)    # bisection — slower but very reliable

Implied volatility: brentq(lambda v: black_scholes(S,K,T,r,v)-market_price, 0.001, 5.0)

Curve fitting: scipy.optimize.curve_fit — fit a parametric function to data.

In finance: portfolio optimisation (maximise Sharpe, minimise variance subject to constraints). Implied volatility from option prices. Yield to maturity from bond prices.`,
    plain: `scipy.optimize.minimize is the tool for portfolio optimisation when the objective is not convex (so cvxpy cannot guarantee a global optimum). Sharpe maximisation is quasi-convex — scipy.minimize with SLSQP works well. For strictly convex problems (variance minimisation), use cvxpy — it is faster and guarantees the global optimum. For non-convex problems (many local minima), run minimize from multiple initial points and take the best.`,
    stars: [520, 620, 720], target: 720, coins: 52,
  },

  2074: {
    simulatorLesson: 'interpolationQuiz',
    id: 2074, chapter: 8, mechanic: 'memory', tier: 'expert',
    topic: 'scipy.interpolate: Filling Between Known Points',
    fact: `Interpolation estimates values between known data points.

from scipy.interpolate import interp1d, CubicSpline, griddata

1D interpolation:
f = interp1d(x_known, y_known, kind="linear")   # linear between points
f = interp1d(x_known, y_known, kind="cubic")    # cubic (smoother)
f = interp1d(x_known, y_known, kind="previous") # step function (last value)
y_new = f(x_new)  # evaluate at new points

CubicSpline (better than interp1d cubic):
cs = CubicSpline(x_known, y_known)
cs(x_new)         # interpolated values
cs(x_new, 1)      # first derivative
cs(x_new, 2)      # second derivative

2D interpolation: griddata for scattered 2D data.
from scipy.interpolate import griddata
z_new = griddata((x_pts, y_pts), z_vals, (xi, yi), method="cubic")

Extrapolation: interp1d raises ValueError outside [min(x), max(x)] by default.
f = interp1d(x, y, bounds_error=False, fill_value="extrapolate")

In finance:
- Vol surface: interpolate implied vol between known strikes and maturities. GridDataInterpolator on (strike, expiry) grid.
- Yield curve: interpolate zero rates between known maturities. CubicSpline on (maturity, rate) data.
- Dividend yield term structure: interpolate between known dividend dates.
- Forward prices: from spot prices and discrete term structure points.

CubicSpline for yield curves: satisfies boundary conditions (second derivative = 0 at endpoints) — natural spline, standard in fixed income.`,
    plain: `Interpolation appears constantly in derivatives work. You know implied volatility at 5 strikes. You need it at 100 strikes for your pricing model. Cubic spline interpolation gives you a smooth vol surface that passes through all known points and behaves sensibly between them. The alternative — linear interpolation — creates kinks at each known point, which produces unrealistic Greeks.`,
    stars: [480, 580, 680], target: 680, coins: 48,
  },

  2075: {
    simulatorLesson: 'matplotlibAnatomy',
    id: 2075, chapter: 8, mechanic: 'match3', tier: 'advanced',
    topic: 'matplotlib: Anatomy of a Figure',
    fact: `import matplotlib.pyplot as plt

matplotlib has two interfaces:
1. Pyplot (stateful, simpler for quick plots): plt.plot(), plt.show()
2. Object-oriented (explicit, for complex figures): fig, ax = plt.subplots()

Always prefer the OO interface for anything beyond a quick exploratory plot.

Anatomy:
fig, ax = plt.subplots(figsize=(12, 6))   # figure and axes
ax.plot(x, y)                              # add a line
ax.set_xlabel("Date")
ax.set_ylabel("Price ($)")
ax.set_title("AAPL Daily Close Price")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()                         # prevent label overlap
plt.savefig("chart.png", dpi=150, bbox_inches="tight")
plt.show()

Multiple subplots:
fig, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)
axes[0].plot(dates, prices)
axes[1].bar(dates, volumes, alpha=0.5)

Twin axes (price + volume on same chart):
ax2 = ax.twinx()
ax2.bar(dates, volumes, alpha=0.3, color="gray")
ax2.set_ylabel("Volume")

Styles: plt.style.use("seaborn-v0_8") or "bmh" or "fivethirtyeight" for better defaults.

Color cycles: ax.set_prop_cycle automatically cycles through colors for multiple lines.

In finance: equity curves (ax.plot), drawdown (ax.fill_between for shading), volume (ax.bar), return distributions (ax.hist), scatter plots of factor vs return.`,
    plain: `figsize=(width, height) is in inches at 100 dpi by default. (12,6) is a landscape figure, (8,8) is square. For presentations: use larger figsize and bigger font sizes. For reports: save as PDF (vector) not PNG (raster) — infinitely scalable. plt.savefig("chart.pdf") just works. The single biggest quality improvement for most beginner charts: plt.tight_layout() prevents axis labels from being cut off.`,
    stars: [440, 540, 640], target: 640, coins: 42,
  },

  2076: {
    id: 2076, chapter: 8, mechanic: 'memory', tier: 'advanced',
    topic: 'matplotlib: Common Plot Types',
    fact: `The right chart for the right question — a critical skill.

Line chart: trends over time.
ax.plot(dates, prices, linewidth=1.5, label="AAPL")

Area chart: cumulative quantities, filled below line.
ax.fill_between(dates, returns, alpha=0.3)

Bar chart: categorical comparison.
ax.bar(tickers, returns, color=["green" if r>0 else "red" for r in returns])
ax.barh(tickers, returns)  # horizontal bars

Histogram: distribution of a variable.
ax.hist(returns, bins=50, density=True, alpha=0.7, edgecolor="white")
# Overlay normal distribution:
x = np.linspace(returns.min(), returns.max(), 100)
ax.plot(x, stats.norm.pdf(x, returns.mean(), returns.std()), "r-", lw=2)

Scatter plot: relationship between two variables.
ax.scatter(factor_values, forward_returns, alpha=0.3, s=10)
ax.axhline(0, color="k", linestyle="--", lw=0.5)

Heatmap (requires seaborn or manual imshow):
import seaborn as sns
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdBu_r", center=0, ax=ax)

Box plot: distribution comparison across groups.
ax.boxplot([group1_returns, group2_returns], labels=["Strategy A","Strategy B"])

In finance:
- Equity curve: line chart of cumulative returns
- Drawdown: ax.fill_between with red shading below 0
- Return distribution: histogram + normal overlay
- Correlation matrix: heatmap with RdBu colormap (red=negative, blue=positive)
- Factor scatterplot: scatter of alpha factor vs forward returns`,
    plain: `Chart choice affects what viewers understand. An equity curve communicates growth trajectory — line chart. Return distribution communicates tail risk — histogram with normal overlay shows visually how fat the tails are. Correlation matrix communicates diversification — heatmap. Factor vs forward returns communicates predictive power — scatter. Each question has a natural chart type. Using the wrong one obscures the insight.`,
    stars: [440, 540, 640], target: 640, coins: 42,
    simulatorLesson: 'matplotlibBuilder',
  },

  2077: {
    simulatorLesson: 'seabornQuiz',
    id: 2077, chapter: 8, mechanic: 'match3', tier: 'advanced',
    topic: 'seaborn: Statistical Visualisation',
    fact: `seaborn is a higher-level matplotlib wrapper focused on statistical plots. Better defaults, less code.

import seaborn as sns

Distribution plots:
sns.histplot(data=df, x="return", kde=True, bins=50)     # histogram + KDE overlay
sns.kdeplot(data=df, x="return", hue="sector")            # density by group
sns.ecdfplot(data=df, x="return")                          # empirical CDF
sns.rugplot(data=df, x="return")                           # tick marks on axis

Relationship plots:
sns.scatterplot(data=df, x="factor", y="forward_ret", hue="sector", alpha=0.5)
sns.lineplot(data=df, x="date", y="price", hue="ticker")  # auto-aggregates with CI
sns.regplot(data=df, x="beta", y="return")                 # scatter + regression line

Matrix plots:
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0, vmin=-1, vmax=1)
sns.clustermap(corr, method="ward")                        # hierarchical clustering heatmap
sns.pairplot(df[["return","volume","beta","pe_ratio"]])    # all pairwise scatter plots

Categorical plots:
sns.boxplot(data=df, x="sector", y="return")
sns.violinplot(data=df, x="sector", y="return")
sns.stripplot(data=df, x="sector", y="return", jitter=True, alpha=0.5)

FacetGrid: small multiples — same plot repeated for each subset.
g = sns.FacetGrid(df, col="sector", col_wrap=3)
g.map(sns.histplot, "return")

Themes: sns.set_theme(style="whitegrid", palette="muted")`,
    plain: `pairplot is the fastest way to understand a new dataset with multiple numeric variables. One line creates a grid of scatter plots for every pair of variables. Diagonal shows the distribution of each variable. Off-diagonal shows the pairwise relationship. For a 5-variable dataset (return, volume, beta, PE ratio, market cap) you get a 5×5 grid of charts in one line. That is the value of seaborn.`,
    stars: [460, 560, 660], target: 660, coins: 45,
  },

  2078: {
    simulatorLesson: 'plotlyQuiz',
    id: 2078, chapter: 8, mechanic: 'memory', tier: 'expert',
    topic: 'Plotly: Interactive Charts',
    fact: `Plotly creates interactive HTML charts — hover tooltips, zoom, pan, click events. Essential for dashboards and exploratory analysis.

import plotly.graph_objects as go
import plotly.express as px

Plotly Express (high-level, fast):
fig = px.line(df, x="date", y="price", color="ticker", title="Price History")
fig = px.scatter(df, x="factor", y="return", color="sector", hover_data=["ticker"])
fig = px.histogram(df, x="return", nbins=50, marginal="rug")
fig.show()                      # opens in browser
fig.write_html("chart.html")   # save as interactive HTML
fig.write_image("chart.png")   # save as static image (requires kaleido)

Plotly Graph Objects (lower-level, more control):
fig = go.Figure()
fig.add_trace(go.Scatter(x=dates, y=prices, mode="lines", name="AAPL"))
fig.add_trace(go.Bar(x=dates, y=volumes, name="Volume", yaxis="y2"))
fig.update_layout(
    title="Price and Volume",
    yaxis2=dict(overlaying="y", side="right"),
    hovermode="x unified"   # all traces tooltip on hover
)

Candlestick chart:
fig = go.Figure(data=go.Candlestick(x=df.index, open=df["open"],
    high=df["high"], low=df["low"], close=df["close"]))

Subplots:
from plotly.subplots import make_subplots
fig = make_subplots(rows=2, cols=1, shared_xaxes=True)
fig.add_trace(go.Scatter(...), row=1, col=1)
fig.add_trace(go.Bar(...), row=2, col=1)

In finance: interactive equity curves with drawdown shading. Candlestick charts with volume. Scatter plots of factor exposures where you can hover over each point to see the ticker.`,
    plain: `The killer feature of Plotly: hover tooltips. A scatter plot of 500 stocks — factor vs forward return — in matplotlib is beautiful but static. In Plotly, hovering over each point shows you the ticker name, the exact values, and any other columns you add to hover_data. For exploratory analysis, being able to identify outliers by name changes the workflow entirely.`,
    stars: [480, 580, 680], target: 680, coins: 48,
  },

  2079: {
    simulatorLesson: 'fullStackBuilder',
    id: 2079, chapter: 8, mechanic: 'match3', tier: 'expert',
    topic: 'Full Stack: Data → Analysis → Visualisation',
    fact: `Complete workflow combining everything: pandas + numpy + scipy + matplotlib.

import numpy as np, pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec

# Generate data (replace with pd.read_csv in practice)
rng = np.random.default_rng(42)
dates = pd.date_range("2020-01-01", "2023-12-31", freq="B")
returns = pd.DataFrame(rng.normal(0.0005, 0.015, (len(dates), 3)),
                        index=dates, columns=["Fund","Benchmark","Factor"])

# Analysis
cum_returns = (1 + returns).cumprod()
drawdown = cum_returns / cum_returns.cummax() - 1
rolling_sharpe = returns["Fund"].rolling(252).apply(
    lambda x: x.mean()/x.std()*np.sqrt(252))

t_stat, p_val = stats.ttest_1samp(returns["Fund"], 0)
skewness = stats.skew(returns["Fund"])
excess_kurt = stats.kurtosis(returns["Fund"])

# Visualisation
fig = plt.figure(figsize=(15, 10))
gs = GridSpec(2, 2, figure=fig, hspace=0.35, wspace=0.3)

ax1 = fig.add_subplot(gs[0, :])  # full-width top
ax1.plot(cum_returns.index, cum_returns, linewidth=1.2)
ax1.set_title("Cumulative Returns"); ax1.legend(cum_returns.columns); ax1.set_ylabel("Growth of $1")

ax2 = fig.add_subplot(gs[1, 0])
ax2.fill_between(drawdown.index, drawdown["Fund"], 0, alpha=0.6, color="red")
ax2.set_title("Fund Drawdown"); ax2.set_ylabel("Drawdown")

ax3 = fig.add_subplot(gs[1, 1])
ax3.hist(returns["Fund"], bins=60, density=True, alpha=0.7)
x = np.linspace(returns["Fund"].min(), returns["Fund"].max(), 100)
ax3.plot(x, stats.norm.pdf(x, *stats.norm.fit(returns["Fund"])), "r-", label="Normal fit")
ax3.set_title(f"Return Distribution  (skew={skewness:.2f}, kurt={excess_kurt:.2f})")
ax3.legend()

plt.savefig("strategy_report.png", dpi=150, bbox_inches="tight")`,
    plain: `GridSpec lets you create complex dashboard layouts — some plots spanning multiple columns, some stacked. The 2×2 grid with the cumulative return chart spanning the full top row and two analysis charts below is a common research report layout. Combining scipy.stats.ttest and stats.skew with the visualisation makes the report both visual and statistically rigorous.`,
    stars: [520, 640, 760], target: 760, coins: 55,
  },

  2080: {
    simulatorLesson: 'ch8FinalBoss',
    id: 2080, chapter: 8, mechanic: 'calibration', tier: 'expert',
    topic: 'Final Boss: Python Mastery Gauntlet',
    fact: `FINAL BOSS. Six challenges spanning the full program:

(1) You have 10 years of daily returns for 500 stocks in a pandas DataFrame (DatetimeIndex × ticker). Write a complete pipeline: compute trailing 252-day Sharpe for each stock, rank them, and return the top 20 ticker names for the most recent date. (Uses pandas rolling, rank, iloc.)

(2) A scipy.stats.ttest_1samp on your strategy returns gives t=2.3, p=0.021. You tried 150 parameter combinations before finding this one. Is the result significant?

(3) Design the class hierarchy for a backtesting system with: Strategy (abstract), MomentumStrategy and MeanReversionStrategy (concrete), Portfolio, and RiskModel (abstract). What are the abstract methods, what are the concrete shared methods?

(4) Write a generator function batch_data(df, batch_size) that yields non-overlapping batches of rows as DataFrames.

(5) A numba @njit function raises TypingError on: result.append(value). What is the issue and how do you rewrite it?`,
    plain: `Answers: (1) rolling_sharpe=df.rolling(252).apply(lambda x:x.mean()/x.std()*252**0.5); top20=rolling_sharpe.iloc[-1].nlargest(20).index.tolist(). (2) No — Bonferroni: threshold=0.05/150=0.00033. p=0.021>>0.00033. Not significant. (3) Strategy: abstract generate_signals(). Portfolio: concrete add_position(), total_value(). RiskModel: abstract compute_var(), compute_beta(). (4) def batch_data(df,n): [yield df.iloc[i:i+n] for i in range(0,len(df),n)]. (5) numba does not support Python lists with .append() in nopython mode. Pre-allocate a numpy array and fill by index: result = np.empty(n); result[i] = value.`,
    stars: [560, 700, 840], target: 840, coins: 65,
    isBoss: true,
    calibrationData: {
      scenario: 'You run from multiprocessing import Pool; pool.map(my_func, args) and get: AttributeError: Can\'t pickle local object. What is the cause and how do you fix it?',
      baseRate: 0,
      evidence: 'multiprocessing serialises (pickles) arguments and return values to send between processes. Lambda functions and locally-defined functions cannot be pickled. Fix: define my_func at module level (not inside another function or class). Or use multiprocessing.pool.ThreadPool (shares memory, no pickling) for I/O-bound work — though it is subject to the GIL.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },

});

// ─── Additional chapter metadata for chapters 5-8 ────────────────────────────

PYTHON_CHAPTERS.push(
  {
    id: 5,
    name: 'Production Python',
    subtitle: 'Type Hints to Parallelism',
    description: 'The skills that separate research scripts from deployable code. Type hints, testing, logging, virtual environments, secrets management, git, profiling, async IO, and multiprocessing. Everything you need to write Python that works reliably in production.',
    icon: '🚀',
    color: '#f59e0b',
    start: 2041, end: 2050, bossLevel: 2050,
    requiredChapter: 4,
  },
  {
    id: 6,
    name: 'numpy',
    subtitle: 'Vectorised Computation',
    description: 'The foundation of scientific Python. Arrays, vectorised operations, broadcasting, linear algebra, random simulation, and Numba JIT compilation. After this chapter, you will never write a Python loop over numerical data again.',
    icon: '🔢',
    color: '#10b981',
    start: 2051, end: 2060, bossLevel: 2060,
    requiredChapter: 5,
  },
  {
    id: 7,
    name: 'pandas',
    subtitle: 'Data Analysis at Scale',
    description: 'The data analysis workhorse. Series and DataFrames, indexing, data cleaning, groupby, merging, time series operations, and reshaping. The same 20 patterns appear in 80% of real-world data analysis code — master those first.',
    icon: '🐼',
    color: '#3b82f6',
    start: 2061, end: 2070, bossLevel: 2070,
    requiredChapter: 6,
  },
  {
    id: 8,
    name: 'scipy & Visualisation',
    subtitle: 'Analysis to Insight',
    description: 'Close the loop from data to decision. scipy distributions and hypothesis testing, optimisation, interpolation, matplotlib anatomy, seaborn statistical charts, Plotly interactive dashboards. The full pipeline from raw data to a publication-quality research report.',
    icon: '📊',
    color: '#ef4444',
    start: 2071, end: 2080, bossLevel: 2080,
    requiredChapter: 7,
  }
);
