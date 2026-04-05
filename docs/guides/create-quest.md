# Create a Quest

This guide explains how a project team can publish a quest on JinkFi to engage their community.

---

## What You Need

- A wallet with project tokens or treasury funds
- USD on Tempo for the listing fee
- Quest details: tasks, XP values, start/end dates

---

## Step 1 — Go to Create Quest

Navigate to **Quests** and click **Create Quest** (or go directly to `/quests/create`).

---

## Step 2 — Fill In Quest Details

![](<../.gitbook/assets/guide-quest-form.png>)

| Field | Description |
|---|---|
| **Title** | Short name for the quest |
| **Description** | What the quest is about, why users should participate |
| **Start Date** | When users can begin completing tasks |
| **End Date** | Deadline — no XP awarded after this date |
| **Featured** | Request featured placement (subject to admin approval) |

---

## Step 3 — Define Tasks

Add one or more tasks to your quest:

| Field | Description |
|---|---|
| **Task Title** | Clear action description (e.g., "Swap 10 USD for JINK") |
| **Task Type** | On-chain (auto-verified) or Off-chain (social/manual) |
| **XP Reward** | Points awarded for completing this task |
| **Verification** | For on-chain tasks: contract address + event to watch |

{% hint style="info" %}
On-chain tasks are verified automatically by the JinkFi indexer. Off-chain tasks (Twitter follows, Discord joins) are verified via OAuth or manual review.
{% endhint %}

---

## Step 4 — Pay the Listing Fee

![](<../.gitbook/assets/guide-quest-pay.png>)

A flat listing fee is charged in the native currency (USD on Tempo). This fee covers admin review and is non-refundable regardless of approval outcome.

Click **Pay Fee** and confirm the on-chain transaction.

---

## Step 5 — Review and Approval

After payment, your quest enters the **Pending Review** state. The JinkFi team reviews for:

- Accurate task descriptions
- Reasonable XP values
- No spam or misleading content

Approval takes up to 48 hours. You'll see the status update in your quest dashboard.

---

## After Approval

Your quest goes live on the start date and appears in the Quests feed. Users can immediately start completing tasks and earning XP.
