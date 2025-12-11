import axios from 'axios';

const apiUrl = process.env.API_URL;
const internalSecret = process.env.INTERNAL_SECRET;

if (!apiUrl || !internalSecret) {
  console.error('API_URL and INTERNAL_SECRET must be set');
  process.exit(1);
}

axios
  .post(
    `${apiUrl}/internal/sync/automation-health`,
    {},
    {
      headers: {
        'X-Internal-Secret': internalSecret,
      },
    }
  )
  .then(() => {
    console.log('Automation health sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Automation health sync failed:', error.message);
    process.exit(1);
  });

