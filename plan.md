## Problem Statement

Many developers solve LeetCode problems but forget the solution after a few days or weeks due to the **forgetting curve**. During interview preparation, they end up solving the same problems repeatedly because there is no structured revision system.

This project aims to solve that problem by using **spaced repetition** to remind users when they should revisit previously solved problems.

---

## Project Plan (MVP)

### 1. Enter LeetCode Username

* User visits the website.
* Enters their LeetCode username.
* No login or authentication required.

### 2. Fetch Solved Problems

* Backend fetches the user's solved problems from LeetCode.
* Store problem details in MongoDB.

### 3. Generate Revision Schedule

* When a problem is first imported, assign a next revision date.
* Example schedule:

  * Day 1
  * Day 3
  * Day 7
  * Day 15
  * Day 30
  * Day 60

### 4. Daily Revision Dashboard

Display only the problems whose revision date is today or earlier.

For each problem:

* Problem name
* Difficulty
* Topic
* Solve button (links to LeetCode)
* Mark as Completed

### 5. Update Next Revision

When the user clicks **Completed**, move the next revision to the following interval in the schedule.

Example:

* Completed Day 3 → Next review on Day 7
* Completed Day 7 → Next review on Day 15

### 6. Progress Dashboard

Show simple statistics:

* Total solved problems
* Problems due today
* Problems revised
* Upcoming revisions
* Revision streak (optional)

---

## Tech Stack

**Frontend**

* React
* Tailwind CSS

**Backend**

* Node.js
* Express

**Database**

* MongoDB


