'use client';

import { Amplify } from 'aws-amplify';

Amplify.configure({
  ssr: true
});

export { Amplify }; 