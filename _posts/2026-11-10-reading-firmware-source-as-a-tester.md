---
title: "Reading Firmware Source as a Tester"
description: "Where the best negative test cases come from"
date: 2026-11-10 10:06:00 +0600
category: Embedded QA
tags: [firmware, negative-testing, white-box]
series: Embedded QA Series
part: 6
---
Testers are often told to treat the system as a black box. For embedded firmware that is a waste of information. The source code of a command handler is a precise list of the inputs it accepts and the ways it says no. Reading it, read-only, turned our negative tests from guesses into a checklist.

## What we look for

- **Argument parsing:** how many arguments, which formats, what happens with extra ones. One helper accepted decimal digits only, with no sign and an overflow check. That gives four cases immediately: a letter, a negative number, a value one past the 32-bit limit, and an extra argument.
- **Limits:** the input line buffer had a fixed size, and a longer line was discarded with a specific error message. That is a precise, low-risk test of input robustness.
- **Error codes:** the framework's error enumeration maps each failure to the code the device prints, so a test can assert the exact code instead of "some error".
- **Inconsistencies:** some commands rejected extra arguments, others silently ignored them. Worth a question to the developers, and worth knowing before you send a reset command with an extra argument.

## An example

For a log-level command, the source showed: one decimal argument, nothing after it, and a value below the number of levels. The fault-injection cases follow directly:

```text
"log"            missing value           -> bad parameter
"log x"          not a number            -> bad parameter
"log 9"          out of range            -> bad parameter
"log 1 2"        extra argument          -> bad parameter
"log 4294967296" overflows 32 bits       -> bad parameter
```

Each case was then confirmed on the device with a read-only probe before it went into a test.

## Ground rules

- The source explains behaviour; the **specification** still decides what is correct. When the source disagrees with the spec, report it.
- Treat the firmware repository as **read-only** reference. Note the branch and commit you read.
- Check which branch holds the real code. In our case the default branch only held a shared framework; all application code lived on a feature branch.
- Never send destructive commands to learn their behaviour. Read the source for those instead.

> **Takeaway:** You don't need to write firmware to read it. An hour with the command handlers produces better edge cases than a day of guessing at the prompt.
