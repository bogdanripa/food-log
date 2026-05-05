# Food Log

A personal meal and drink tracker that runs as a [Claude](https://claude.ai) skill. You describe (or photograph) what you ate, and it logs the meal — with estimated macros — to a Google Sheet in your own Drive. Later you can ask Claude questions like *"what's my average weekly protein intake?"* or *"based on what I logged this week, what should I have for lunch?"*.

This repo hosts the skill bundle, the OAuth callback page, and the homepage / privacy policy required for Google OAuth verification.

- **Homepage**: [bogdanripa.github.io/food-log](https://bogdanripa.github.io/food-log/)
- **Privacy policy**: [bogdanripa.github.io/food-log/privacy.html](https://bogdanripa.github.io/food-log/privacy.html)

## Install it yourself

1. **Download the skill bundle**: [food-tracking.zip](https://bogdanripa.github.io/food-log/food-tracking.zip)
2. Open [Claude](https://claude.ai) in your browser.
3. Go to **Customize → Skills → New Skill → Upload**.
4. Drop the `food-tracking.zip` file into the upload form.
5. Open a new chat. This is where you'll log your meals from now on.

## Logging a meal

In that chat, just say what you ate or drank. For example:

> *I had a lasagna for lunch, please log it.*

Or even simpler — upload a photo of your plate or drink and tell Claude to log it.

The first time you log something, Claude will walk you through a one-time Google sign-in (using the non-sensitive `drive.file` scope — see below). After that, every entry is appended to a Google Sheet the skill creates in your Drive. Photos go into a folder in the same Drive.

The first time, your spreadsheet will have a single row — what you just logged. Over time, as you keep logging, the sheet fills up with your eating history.

## Asking questions

Once you have some history, you can ask Claude things like:

- *What's my average weekly protein intake?*
- *How much alcohol have I had this month?*
- *What's missing from my diet lately?*
- *Based on what I logged this week, what should I have for lunch? I'm at \[restaurant name\].*

Claude reads your sheet directly to answer.

## OAuth scope

Food Log uses only the `drive.file` scope (non-sensitive, per-file access). The app cannot see, modify, or delete any files in your Drive other than the ones it creates itself.

## Contact

bogdanripa@gmail.com
