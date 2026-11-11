---
title: "Spec, Source, Device"
description: "A three-source approach to embedded test design"
date: 2026-11-10 10:02:00 +0600
category: Embedded QA
tags: [test-design, specification, firmware]
series: Embedded QA Series
part: 2
---
Where does a test's expected value come from? In many projects the honest answer is "from whatever the system did when the test was written". That locks in today's behaviour, bugs included. On our embedded project we use three sources, in a fixed order of authority.

## 1. The specification decides what is correct

The command list, the CLI protocol document and the subsystem requirements say what the device must do. If a test and the spec disagree, the test is wrong until someone changes the spec.

## 2. The firmware source explains why and where the edges are

Reading the command handlers tells us which arguments are validated, which error code each failure returns, and how long a line may be. That turns a vague "test invalid input" into a precise list of negative cases.

## 3. The device confirms both

A read-only probe on real hardware shows the exact bytes. Only then do we write the assertion.

## What it caught

An existing test checked the system-information command for fields named `git_sha` and `build_ver`. The firmware printed `git sha` with a space, and no build field at all. Before we had the documents, it looked like a firmware bug. The specification showed the opposite: the firmware matched the spec, and the test was wrong on two fields.

The same cross-check worked the other way round. The spec says the CLI echoes each command at DEBUG level, exactly as received. The firmware echoed at INFO with a `> ` prefix, on purpose, according to its source comments. An existing test only checked that the command text appeared somewhere, so it passed. The deviation was invisible until we compared all three sources.

## Making it a routine

- Keep the documents in one known place and always use the **latest revision**. Check for new ones before each round of test design.
- Note which **firmware branch and commit** the source analysis was based on.
- When two sources disagree, **write it down and ask**. Do not resolve it silently in the test.
- Report problems in the documents themselves too: copy-paste headings, missing syntax sections, revision numbers that don't match the change log.

> **Takeaway:** A test encodes a claim about correct behaviour. The three-source order makes sure that claim comes from the spec, not from whatever the firmware happened to do on the day the test was written.
