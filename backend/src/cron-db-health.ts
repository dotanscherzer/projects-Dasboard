import axios from 'axios';

const apiUrl = process.env.API_URL;
const internalSecret = process.env.INTERNAL_SECRET;

if (!apiUrl || !internalSecret) {
  console.error('API_URL and INTERNAL_SECRET must be set');
  process.exit(1);
}

axios
  .post(
    `${apiUrl}/internal/sync/db-health`,
    {},
    {
      headers: {
        'X-Internal-Secret': internalSecret,
      },
    }
  )
  .then(() => {
    console.log('DB health sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('DB health sync failed:', error.message);
    process.exit(1);
  });

