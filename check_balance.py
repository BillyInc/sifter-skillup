with open('src/screens/careerIntelligence/AdmissionInsightScreen.tsx', 'r') as f:
    lines = f.readlines()

brace_count = 0
paren_count = 0
bracket_count = 0
in_string = False
string_char = None
for i, line in enumerate(lines):
    for j, ch in enumerate(line):
        if ch in '"\'`' and (j == 0 or line[j-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = ch
            elif ch == string_char:
                in_string = False
                string_char = None
        if in_string:
            continue
        if ch == '{': brace_count += 1
        elif ch == '}': brace_count -= 1
        elif ch == '(': paren_count += 1
        elif ch == ')': paren_count -= 1
        elif ch == '[': bracket_count += 1
        elif ch == ']': bracket_count -= 1
    if brace_count < 0 or paren_count < 0 or bracket_count < 0:
        print(f'Negative at line {i+1}: brace={brace_count}, paren={paren_count}, bracket={bracket_count}')
        print(f'  {line.rstrip()}')

print(f'Final: brace={brace_count}, paren={paren_count}, bracket={bracket_count}')