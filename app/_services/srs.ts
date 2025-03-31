export const calculateNextReviewTime = (level: number): Date => {
  let nextReviewInDays: number;

  switch (level) {
    case 1:
      nextReviewInDays = 1; // Review in 1 day
      break;
    case 2:
      nextReviewInDays = 3; // Review in 3 days
      break;
    case 3:
      nextReviewInDays = 7; // Review in 7 days
      break;
    case 4:
      nextReviewInDays = 14; // Review in 14 days
      break;
    default:
      nextReviewInDays = 30; // Review in 30 days if the word is known very well
  }

  const nextReviewTime = new Date();
  nextReviewTime.setDate(nextReviewTime.getDate() + nextReviewInDays); // Add the days to the current date

  return nextReviewTime;
};
