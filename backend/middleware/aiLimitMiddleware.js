const FREE_DAILY_LIMIT = 10;

// This middleware runs BEFORE any AI controller — it checks whether the
// user has exceeded their free daily limit before letting the (expensive)
// Groq API call happen at all.
const checkAILimit = async (req, res, next) => {
  const user = req.user;

  // Premium users skip this check entirely — unlimited access
//   if (user.isPremium) {
//     return next();
//   }

  // Check if it's a new day since the last recorded call — if so, reset
  // the counter. We compare just the DATE part, not the time.
  const today = new Date().toDateString();
  const lastCallDate = new Date(user.aiCallsDate).toDateString();

  if (today !== lastCallDate) {
    user.aiCallsToday = 0;
    user.aiCallsDate = new Date();
  }

  if (user.aiCallsToday >= FREE_DAILY_LIMIT) {
    const error = new Error(
      `Free plan limit reached (${FREE_DAILY_LIMIT} AI calls/day). Upgrade to Premium for unlimited access.`
    );
    error.statusCode = 429; // 429 Too Many Requests — the correct status code for rate limiting
    return next(error);
  }

  // Increment and save BEFORE the actual AI call — this prevents a user
  // from spamming requests faster than our server can respond and
  // sneaking past the limit (a race condition).
  user.aiCallsToday += 1;
  await user.save();

  next();
};

export default checkAILimit;