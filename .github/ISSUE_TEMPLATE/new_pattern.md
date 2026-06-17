---
name: New PII pattern
about: Add support for a new Indian or global PII entity type
labels: good first issue, enhancement
---

**Entity type name**
<!-- e.g. VOTER_ID_IN, PASSPORT_IN, DRIVING_LICENCE_IN -->

**Format description**
<!-- e.g. "EPIC number: 3 uppercase letters followed by 7 digits, e.g. ABC1234567" -->

**Regex candidate** (optional)
```python
# paste your regex here if you have one
```

**Test cases**
| Input | Should match? |
|-------|--------------|
| `ABC1234567` | yes |
| `abc1234567` | no (lowercase) |
| `AB12345678` | no (wrong format) |

**Reference**
<!-- link to official format spec, Wikipedia, or government source -->
