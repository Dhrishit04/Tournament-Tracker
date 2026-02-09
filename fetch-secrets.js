
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');

const client = new SecretManagerServiceClient();

async function fetchSecretsAndWriteEnv() {
  const secrets = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  let envContent = '';

  for (const secretName of secrets) {
    try {
      const [version] = await client.accessSecretVersion({
        name: `projects/998899494340/secrets/${secretName}/versions/latest`,
      });
      const secretValue = version.payload.data.toString();
      envContent += `${secretName}=${secretValue}\n`;
      console.log(`Successfully fetched secret: ${secretName}`);
    } catch (error) {
      console.error(`Error fetching secret ${secretName}:`, error);
      process.exit(1); // Exit if any secret fails
    }
  }

  fs.writeFileSync('.env.local', envContent);
  console.log('Successfully created .env.local file.');
}

fetchSecretsAndWriteEnv();
