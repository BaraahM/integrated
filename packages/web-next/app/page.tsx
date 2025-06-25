'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@mantine/core/styles.css';
export default function HomePage() {
  //TODO - Adding in authentication before user login/signup eg.perform action before login
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return null;
}
