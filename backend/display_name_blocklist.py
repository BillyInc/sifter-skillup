"""Blocklist for user-chosen display names.

TODO(owner): this list is a deliberately small starting point. Extend it with
the product's own safeguarding vocabulary (profanity in the languages and
slang your students use, bullying terms, impersonation of staff/brand). Entries
are lowercase; matching is done on the name with spaces and punctuation
removed and common look-alike digits folded to letters.
"""

# Substring matches against the squashed, folded name.
BLOCKED_SUBSTRINGS = frozenset({
    "fuck", "shit", "bitch", "cunt", "nigg", "rape", "porn",
})

# Whole-name matches (impersonation / reserved).
RESERVED_NAMES = frozenset({
    "admin", "administrator", "moderator", "support", "staff", "sifter",
    "siftersupport", "levelup", "official", "system", "root",
})
